// Shared Apple IAP (StoreKit 2) verification + entitlement writer.
// Used by apple-iap-validate (client-initiated purchase) and
// apple-iap-notifications (App Store Server Notifications V2).
//
// StoreKit 2 delivers PURCHASES and NOTIFICATIONS as JWS (signed JWT) blobs.
// We verify them with Apple's official library, which validates the x5c
// certificate chain up to an Apple root CA — so the client can never forge a
// purchase (CLAUDE.md Rule 1/7: never trust the client).

import {
  SignedDataVerifier,
  Environment,
} from "npm:@apple/app-store-server-library@1";
import { Buffer } from "node:buffer";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUNDLE_ID = Deno.env.get("APPLE_BUNDLE_ID") ?? "app.tradesbrain";
const APP_APPLE_ID = Number(Deno.env.get("APPLE_APP_APPLE_ID") ?? "6781973456");

// Apple's public root CAs (DER). Fetched once at cold start and cached.
const ROOT_CERT_URLS = [
  "https://www.apple.com/certificateauthority/AppleRootCA-G3.cer",
  "https://www.apple.com/certificateauthority/AppleRootCA-G2.cer",
];

// ─── Product catalogue (must match App Store Connect product IDs) ────────────
export type Plan = "solo" | "pro" | "team";
export type Cycle = "monthly" | "annual";

const PRODUCT_MAP: Record<string, { plan: Plan; cycle: Cycle }> = {
  "app.tradesbrain.solo.monthly": { plan: "solo", cycle: "monthly" },
  "app.tradesbrain.solo.annual": { plan: "solo", cycle: "annual" },
  "app.tradesbrain.pro.monthly": { plan: "pro", cycle: "monthly" },
  "app.tradesbrain.pro.annual": { plan: "pro", cycle: "annual" },
  "app.tradesbrain.team.monthly": { plan: "team", cycle: "monthly" },
  "app.tradesbrain.team.annual": { plan: "team", cycle: "annual" },
};

// USD monthly price used only to satisfy subscriptions.monthly_amount (NOT NULL).
// The authoritative price is Apple's; this mirrors constants/pricing.ts.
const PLAN_PRICE: Record<Plan, number> = { solo: 69, pro: 120, team: 260 };

export function planFromProductId(productId: string) {
  return PRODUCT_MAP[productId] ?? null;
}
export function seatsForPlan(plan: Plan): number {
  return plan === "team" ? 3 : 1; // Team base = 3 seats; per-seat add-ons are web/Stripe only.
}

// ─── Verifier (cold-start cached, both environments) ─────────────────────────
let rootCerts: Buffer[] | null = null;
async function getRootCerts(): Promise<Buffer[]> {
  if (rootCerts) return rootCerts;
  rootCerts = await Promise.all(
    ROOT_CERT_URLS.map(async (u) => {
      const r = await fetch(u);
      if (!r.ok) throw new Error(`root cert fetch failed: ${u} ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    }),
  );
  return rootCerts;
}

let verifiers: SignedDataVerifier[] | null = null;
async function getVerifiers(): Promise<SignedDataVerifier[]> {
  if (verifiers) return verifiers;
  const roots = await getRootCerts();
  // TestFlight/sandbox purchases are SANDBOX; live are PRODUCTION. We don't know
  // which a given token is until we try, so build both and try in turn.
  verifiers = [
    new SignedDataVerifier(roots, false, Environment.PRODUCTION, BUNDLE_ID, APP_APPLE_ID),
    new SignedDataVerifier(roots, false, Environment.SANDBOX, BUNDLE_ID, APP_APPLE_ID),
  ];
  return verifiers;
}

// deno-lint-ignore no-explicit-any
export async function verifyTransaction(jws: string): Promise<any> {
  const vs = await getVerifiers();
  let lastErr: unknown;
  for (const v of vs) {
    try { return await v.verifyAndDecodeTransaction(jws); } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// deno-lint-ignore no-explicit-any
export async function verifyNotification(signedPayload: string): Promise<any> {
  const vs = await getVerifiers();
  let lastErr: unknown;
  for (const v of vs) {
    try { return await v.verifyAndDecodeNotification(signedPayload); } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// ─── Entitlement writer (shared by both functions) ───────────────────────────
// Mirrors the role handle-stripe-webhook plays for Stripe: derive TradesBrain
// status from the real billing state and write users + subscriptions together.
export interface ApplyArgs {
  userId: string;
  originalTransactionId: string;
  productId: string;
  expiresMs: number;
  purchaseMs: number;
  active: boolean;
  cancelledAtMs?: number | null;
}

export async function applyEntitlement(admin: SupabaseClient, args: ApplyArgs) {
  const map = planFromProductId(args.productId);
  if (!map) throw new Error(`unknown product: ${args.productId}`);
  const endIso = new Date(args.expiresMs).toISOString();
  const userStatus = args.active ? "active" : "expired";

  await admin.from("users").update({
    subscription_status: userStatus,
    plan_type: args.active ? map.plan : null,
    subscription_end_date: endIso,
    payment_provider: "apple",
    apple_original_transaction_id: args.originalTransactionId,
  }).eq("id", args.userId);

  const row = {
    user_id: args.userId,
    stripe_subscription_id: null,
    apple_original_transaction_id: args.originalTransactionId,
    payment_provider: "apple",
    plan_type: map.plan,
    status: args.active ? "active" : "expired",
    seat_count: seatsForPlan(map.plan),
    monthly_amount: PLAN_PRICE[map.plan],
    billing_cycle: map.cycle,
    current_period_start: new Date(args.purchaseMs || Date.now()).toISOString(),
    current_period_end: endIso,
    cancelled_at: args.cancelledAtMs ? new Date(args.cancelledAtMs).toISOString() : null,
  };

  // Select-then-write keyed on the Apple original transaction id (partial unique
  // index — avoids PostgREST onConflict arbiter issues with partial indexes).
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("apple_original_transaction_id", args.originalTransactionId)
    .maybeSingle();
  if (existing?.id) {
    await admin.from("subscriptions").update(row).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert(row);
  }
}
