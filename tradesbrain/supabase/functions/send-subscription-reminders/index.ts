// TradesBrain — send-subscription-reminders
// Scheduled (daily pg_cron) reminder dispatcher for the three time-based push
// types from D9 §8 that no event triggers on its own:
//   • trial_ending          — trial user down to their last 1–2 Rex queries
//   • subscription_expiring  — a CANCELLED (won't-renew) sub whose access ends
//                              within EXPIRING_WINDOW_DAYS
//   • subscription_expired   — a sub whose access period has already lapsed
//
// Idempotency: every reminder is recorded in public.notification_log keyed by
// (user_id, type, dedupe_key). The dedupe_key ties the reminder to its billing
// period (or the trial), so a daily cron run never re-sends the same reminder,
// but a NEW period legitimately gets a fresh one.
//
// Auth: service role ONLY. Invoked by the pg_cron job (migration 00013) with
// the service-role key in the Authorization header. Same gate as
// send-push-notification — never expose this to anon callers.
//
// Tables: users, subscriptions (read), notification_log (write).
// External: invokes send-push-notification.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, SERVICE_ROLE_KEY);

// Send "expiring" this many days before a cancelled subscription's access ends.
const EXPIRING_WINDOW_DAYS = 3;
// Only consider subscriptions that lapsed within this many days for the
// "expired" reminder. Without a lower bound the daily cron re-scans EVERY
// historically-expired user forever (the candidate set only grows). The
// dedupe key (expired:<end-date-day>) already guarantees one reminder per
// expiry, so this window can't drop a due reminder — it just keeps the scan
// from accumulating dead rows. The window is generous (vs the 3-day expiring
// window) so a few missed cron runs still deliver the reminder.
const EXPIRED_LOOKBACK_DAYS = 14;
// Trial users at or below this many remaining queries get the "ending" nudge.
const TRIAL_QUERIES_LOW = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

// Service-role gate via the JWT's role claim. The platform gateway (verify_jwt,
// on by default) has already validated the token's SIGNATURE before this code
// runs, so the payload is trustworthy — we only need to confirm the caller is
// the service role and not a regular signed-in user. This is robust to the
// Vault-stored key not being byte-identical to the runtime's injected
// SUPABASE_SERVICE_ROLE_KEY (which can happen after a JWT-key rotation).
function jwtRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const claims = JSON.parse(atob(padded)) as { role?: string };
    return typeof claims.role === "string" ? claims.role : null;
  } catch {
    return null;
  }
}

interface Candidate {
  userId: string;
  type: "trial_ending" | "subscription_expiring" | "subscription_expired";
  dedupeKey: string;
}

// Day-granularity key from an ISO timestamp (YYYY-MM-DD).
function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// ── trial_ending: trial users with 1–2 queries left ─────────────────────────
async function collectTrialEnding(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("subscription_status", "trial")
    .gte("trial_queries_remaining", 1)
    .lte("trial_queries_remaining", TRIAL_QUERIES_LOW)
    .not("expo_push_token", "is", null);
  if (error) {
    console.error("trial_ending query failed:", error);
    return [];
  }
  // One reminder per user for the trial (trials don't reset in TradesBrain).
  return (data ?? []).map((u: { id: string }) => ({
    userId: u.id,
    type: "trial_ending" as const,
    dedupeKey: "trial",
  }));
}

// ── subscription_expiring: cancelled sub, access ends within the window ─────
async function collectExpiring(nowIso: string, untilIso: string): Promise<Candidate[]> {
  // cancelled_at IS NOT NULL ⇒ the subscription is scheduled to end and will
  // NOT auto-renew (a restored sub has cancelled_at cleared back to null), so
  // auto-renewing actives are excluded and never get a false "renew" alarm.
  const { data, error } = await supabase
    .from("subscriptions")
    .select("user_id, current_period_end, users!inner(expo_push_token)")
    .not("cancelled_at", "is", null)
    .eq("status", "active")
    .gt("current_period_end", nowIso)
    .lte("current_period_end", untilIso);
  if (error) {
    console.error("subscription_expiring query failed:", error);
    return [];
  }
  return (data ?? [])
    .filter((s: any) => s.users?.expo_push_token)
    .map((s: any) => ({
      userId: s.user_id as string,
      type: "subscription_expiring" as const,
      dedupeKey: `expiring:${dayKey(s.current_period_end)}`,
    }));
}

// ── subscription_expired: access period already lapsed ──────────────────────
async function collectExpired(nowIso: string, sinceIso: string): Promise<Candidate[]> {
  // users.subscription_status flips to 'cancelled' (with end_date set) when the
  // period actually ends (customer.subscription.deleted). Past-end = expired.
  // Bounded to [sinceIso, nowIso] so long-expired users drop out of the daily
  // scan (see EXPIRED_LOOKBACK_DAYS).
  const { data, error } = await supabase
    .from("users")
    .select("id, subscription_end_date")
    .eq("subscription_status", "cancelled")
    .not("subscription_end_date", "is", null)
    .gte("subscription_end_date", sinceIso)
    .lte("subscription_end_date", nowIso)
    .not("expo_push_token", "is", null);
  if (error) {
    console.error("subscription_expired query failed:", error);
    return [];
  }
  return (data ?? []).map((u: { id: string; subscription_end_date: string }) => ({
    userId: u.id,
    type: "subscription_expired" as const,
    dedupeKey: `expired:${dayKey(u.subscription_end_date)}`,
  }));
}

// Insert the dedupe row first (the unique constraint is the lock); only push if
// this is the first time we've seen this (user, type, period).
async function processCandidate(c: Candidate): Promise<"sent" | "skipped" | "error"> {
  const { error: logErr } = await supabase
    .from("notification_log")
    .insert({ user_id: c.userId, type: c.type, dedupe_key: c.dedupeKey });
  if (logErr) {
    // 23505 = unique_violation ⇒ already sent for this period. Not an error.
    if ((logErr as { code?: string }).code === "23505") return "skipped";
    console.error("notification_log insert failed:", c, logErr);
    return "error";
  }

  const { error: pushErr } = await supabase.functions.invoke("send-push-notification", {
    body: { user_id: c.userId, type: c.type },
  });
  if (pushErr) {
    console.error("push invoke failed:", c, pushErr);
    // Roll the dedupe row back so the next daily run retries this reminder.
    await supabase
      .from("notification_log")
      .delete()
      .eq("user_id", c.userId)
      .eq("type", c.type)
      .eq("dedupe_key", c.dedupeKey);
    return "error";
  }
  return "sent";
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const authToken = (req.headers.get("Authorization") ?? "").replace("Bearer ", "").trim();
  if (jwtRole(authToken) !== "service_role") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const untilIso = new Date(now.getTime() + EXPIRING_WINDOW_DAYS * DAY_MS).toISOString();
  const expiredSinceIso = new Date(now.getTime() - EXPIRED_LOOKBACK_DAYS * DAY_MS).toISOString();

  const candidates: Candidate[] = [
    ...(await collectTrialEnding()),
    ...(await collectExpiring(nowIso, untilIso)),
    ...(await collectExpired(nowIso, expiredSinceIso)),
  ];

  let sent = 0;
  let skipped = 0;
  let errored = 0;
  for (const c of candidates) {
    const r = await processCandidate(c);
    if (r === "sent") sent++;
    else if (r === "skipped") skipped++;
    else errored++;
  }

  console.log(
    `send-subscription-reminders: candidates=${candidates.length} sent=${sent} skipped=${skipped} errored=${errored}`,
  );
  return new Response(
    JSON.stringify({ candidates: candidates.length, sent, skipped, errored }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
