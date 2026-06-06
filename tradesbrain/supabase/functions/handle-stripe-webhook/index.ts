// TradesBrain — handle-stripe-webhook
// Receives Stripe webhook events, verifies signature, updates subscription status
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  // Match the webhook endpoint's locked API version (2026-04-22.dahlia) so the
  // SDK serialises requests/responses in the same shape Stripe delivers events.
  // Cast: this string is newer than stripe@13's typed LatestApiVersion literal.
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion, httpClient: Stripe.createFetchHttpClient(),
});
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const PRICE_TO_PLAN: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY")!]: "solo",
  [Deno.env.get("STRIPE_PRICE_SOLO_ANNUAL")!]: "solo",
  [Deno.env.get("STRIPE_PRICE_PRO_MONTHLY")!]: "pro",
  [Deno.env.get("STRIPE_PRICE_PRO_ANNUAL")!]: "pro",
  [Deno.env.get("STRIPE_PRICE_TEAM_MONTHLY")!]: "team",
  [Deno.env.get("STRIPE_PRICE_TEAM_ANNUAL")!]: "team",
  [Deno.env.get("STRIPE_PRICE_SEAT_MONTHLY")!]: "team",
  [Deno.env.get("STRIPE_PRICE_SEAT_ANNUAL")!]: "team",
};

async function getUserIdByCustomer(customerId: string, metadata?: Record<string, string>): Promise<string | null> {
  const { data } = await supabase.from("users").select("id").eq("stripe_customer_id", customerId).single();
  if (data?.id) return data.id;
  const metaUid = metadata?.supabase_user_id;
  if (metaUid) {
    const { data: u } = await supabase.from("users").select("id").eq("id", metaUid).single();
    if (u?.id) {
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", u.id);
      return u.id;
    }
  }
  return null;
}

function resolvePlanType(sub: Stripe.Subscription): string {
  for (const item of sub.items.data) { const p = PRICE_TO_PLAN[item.price.id]; if (p) return p; }
  return "solo";
}

function countSeats(sub: Stripe.Subscription): number {
  let seats = 1;
  for (const item of sub.items.data) {
    if (item.price.id === Deno.env.get("STRIPE_PRICE_SEAT_MONTHLY") || item.price.id === Deno.env.get("STRIPE_PRICE_SEAT_ANNUAL"))
      seats += item.quantity ?? 0;
  }
  return seats;
}

function periodDates(sub: Stripe.Subscription): { start: number; end: number } {
  const item0 = sub.items.data[0] as unknown as { current_period_start?: number; current_period_end?: number };
  const start = sub.current_period_start ?? item0?.current_period_start ?? 0;
  const end = sub.current_period_end ?? item0?.current_period_end ?? 0;
  return { start, end };
}

// ISS-H1 + ISS-5: single source of truth for Stripe-status → TradesBrain-status.
// The `subscriptions.status` CHECK only permits 'active' | 'cancelled' |
// 'expired' | 'past_due'; `users.subscription_status` additionally permits
// 'trial'. A status written outside these sets violates the CHECK, the
// INSERT/UPDATE throws, and the error is swallowed by the webhook's try/catch —
// silently dropping the update. Both table writes are derived from this one
// map so they can never drift apart.
//
// The only intentional cross-table difference is `incomplete`: the first
// invoice is still pending, so the worker keeps trial access on `users`
// ('trial'), while the `subscriptions` row — which has no 'trial' value —
// records 'expired' until payment confirms.
function mapStripeStatus(stripeStatus: string): { user: string; subscription: string } {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return { user: "active", subscription: "active" };
    case "past_due":
      // Grace period — the worker keeps access on `users` while the
      // `subscriptions` row reflects the real billing state.
      return { user: "active", subscription: "past_due" };
    case "unpaid":
      return { user: "expired", subscription: "past_due" };
    case "canceled":
      return { user: "cancelled", subscription: "cancelled" };
    case "incomplete":
      return { user: "trial", subscription: "expired" };
    case "incomplete_expired":
    case "paused":
    default:
      return { user: "expired", subscription: "expired" };
  }
}

function invoiceSubscriptionId(inv: Stripe.Invoice): string | null {
  if (inv.subscription) return inv.subscription as string;
  const parent = (inv as unknown as { parent?: { subscription_details?: { subscription?: string } } }).parent;
  return parent?.subscription_details?.subscription ?? null;
}

async function handleSubscriptionCreated(sub: Stripe.Subscription) {
  const userId = await getUserIdByCustomer(sub.customer as string, sub.metadata as Record<string, string>);
  if (!userId) { console.error("subscription.created: user not found for", sub.customer); return; }
  const plan = resolvePlanType(sub);
  const { start: startTs, end: endTs } = periodDates(sub);
  const end = new Date(endTs * 1000).toISOString();
  const start = new Date(startTs * 1000).toISOString();
  const cycle = sub.items.data[0]?.price.recurring?.interval === "year" ? "annual" : "monthly";
  const amount = sub.items.data.reduce((s, i) => s + ((i.price.unit_amount ?? 0) * (i.quantity ?? 1)) / 100, 0);
  await supabase.from("users").update({ subscription_status: "active", plan_type: plan, subscription_end_date: end }).eq("id", userId);
  await supabase.from("subscriptions").upsert({ user_id: userId, stripe_subscription_id: sub.id, plan_type: plan, status: "active", seat_count: countSeats(sub), monthly_amount: amount, billing_cycle: cycle, current_period_start: start, current_period_end: end }, { onConflict: "stripe_subscription_id" });
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = await getUserIdByCustomer(sub.customer as string, sub.metadata as Record<string, string>);
  if (!userId) { console.error("subscription.updated: user not found for", sub.customer); return; }
  const plan = resolvePlanType(sub);
  const { start: startTs, end: endTs } = periodDates(sub);
  const end = new Date(endTs * 1000).toISOString();
  const start = new Date(startTs * 1000).toISOString();
  const cycle = sub.items.data[0]?.price.recurring?.interval === "year" ? "annual" : "monthly";
  const amount = sub.items.data.reduce((s, i) => s + ((i.price.unit_amount ?? 0) * (i.quantity ?? 1)) / 100, 0);
  // ISS-5: both writes derive from the one mapStripeStatus() — never diverge.
  const status = mapStripeStatus(sub.status);
  await supabase.from("users").update({ subscription_status: status.user, plan_type: status.user === "active" ? plan : null, subscription_end_date: end }).eq("id", userId);
  // ISS-H1: write a CHECK-valid status, not the raw Stripe status.
  const { error: subErr } = await supabase.from("subscriptions").update({ plan_type: plan, status: status.subscription, seat_count: countSeats(sub), monthly_amount: amount, billing_cycle: cycle, current_period_start: start, current_period_end: end, cancelled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null }).eq("stripe_subscription_id", sub.id);
  if (subErr) console.error("subscription.updated: subscriptions row update failed", sub.id, subErr);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = await getUserIdByCustomer(sub.customer as string, sub.metadata as Record<string, string>);
  if (!userId) { console.error("subscription.deleted: user not found for", sub.customer); return; }
  const { end: endTs } = periodDates(sub);
  await supabase.from("users").update({ subscription_status: "cancelled", subscription_end_date: new Date(endTs * 1000).toISOString() }).eq("id", userId);
  await supabase.from("subscriptions").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("stripe_subscription_id", sub.id);
}

async function handleInvoiceSucceeded(inv: Stripe.Invoice) {
  // D9 §3.2 (audit D2): record EVERY successful invoice in billing_history,
  // including the initial 'subscription_create' charge. handleSubscriptionCreated
  // only writes the subscriptions row — it never inserts a billing_history row —
  // so skipping the first invoice here previously dropped the worker's first
  // charge (and its invoice_pdf_url) from billing history entirely. The
  // billing_history.stripe_invoice_id UNIQUE constraint makes this insert
  // idempotent, so a redelivered event cannot create a duplicate row.
  const userId = await getUserIdByCustomer(inv.customer as string);
  const subId = invoiceSubscriptionId(inv);
  if (!userId || !subId) { console.error("invoice.payment_succeeded: missing user or subscription id", { userId, subId, customer: inv.customer }); return; }
  const { data: sub } = await supabase.from("subscriptions").select("id, plan_type, seat_count").eq("stripe_subscription_id", subId).single();
  if (!sub) { console.error("invoice.payment_succeeded: subscription row not found for", subId); return; }
  // Idempotent on stripe_invoice_id (UNIQUE) — a redelivered invoice event
  // silently no-ops instead of throwing a 23505 out of the handler.
  await supabase.from("billing_history").upsert({ user_id: userId, subscription_id: sub.id, stripe_invoice_id: inv.id, amount_paid: inv.amount_paid / 100, plan_type: sub.plan_type, seat_count: sub.seat_count, billing_period_start: new Date(inv.period_start * 1000).toISOString(), billing_period_end: new Date(inv.period_end * 1000).toISOString(), invoice_pdf_url: inv.invoice_pdf, paid_at: new Date((inv.status_transitions?.paid_at ?? Date.now() / 1000) * 1000).toISOString() }, { onConflict: "stripe_invoice_id", ignoreDuplicates: true });

  // D9 §8 — notify the worker that a recurring charge renewed their plan. Only
  // for renewal cycles ('subscription_cycle'); the first charge is the
  // 'subscription_create' case already short-circuited above. Best-effort.
  if (inv.billing_reason === "subscription_cycle") {
    await supabase.functions.invoke("send-push-notification", {
      body: {
        user_id: userId,
        type: "subscription_renewed",
        metadata: { plan_type: sub.plan_type },
        deep_link: "tradesbrain://settings/subscription",
      },
    }).catch((e: unknown) => console.error("subscription_renewed push failed:", e));
  }
}

async function handleInvoiceFailed(inv: Stripe.Invoice) {
  const userId = await getUserIdByCustomer(inv.customer as string);
  if (!userId) return;
  await supabase.functions.invoke("send-push-notification", { body: { user_id: userId, type: "payment_failed", deep_link: "tradesbrain://settings/subscription" } });
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  // D9 RULE 2 / D8 backend check: a missing signature is a malformed request →
  // 400 (same as an invalid signature), not 401.
  if (!sig) return new Response("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try { event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET); }
  catch { return new Response("Signature verification failed", { status: 400 }); }

  // IDEMPOTENCY (audit Part 4.1): Stripe redelivers the same event id on retry.
  // Claim the event id first — the PK conflict on a duplicate means we've
  // already processed it, so skip silently. If processing later fails we roll
  // this row back (below) so a genuine redelivery can re-attempt.
  const { error: claimErr } = await supabase
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, type: event.type });
  if (claimErr) {
    if ((claimErr as { code?: string }).code === "23505") {
      return new Response(JSON.stringify({ duplicate: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    // Ledger unavailable — log and continue processing rather than blocking
    // (idempotency degrades to the existing onConflict/unique-constraint guards).
    console.error("webhook idempotency ledger insert failed:", claimErr);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": await handleSubscriptionCreated(event.data.object as Stripe.Subscription); break;
      case "customer.subscription.updated": await handleSubscriptionUpdated(event.data.object as Stripe.Subscription); break;
      case "customer.subscription.deleted": await handleSubscriptionDeleted(event.data.object as Stripe.Subscription); break;
      case "invoice.payment_succeeded": await handleInvoiceSucceeded(event.data.object as Stripe.Invoice); break;
      case "invoice.payment_failed": await handleInvoiceFailed(event.data.object as Stripe.Invoice); break;
    }
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);
    // Roll back the idempotency claim so a Stripe redelivery of this event id is
    // re-processed instead of being skipped as a duplicate. We still return 200
    // (D9 RULE 2 — avoid Stripe's infinite-retry storm on a poison event).
    await supabase.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return new Response(JSON.stringify({ error: "logged" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
