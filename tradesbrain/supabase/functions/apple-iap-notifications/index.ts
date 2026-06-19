// TradesBrain — apple-iap-notifications
// App Store Server Notifications V2 endpoint (the IAP equivalent of
// handle-stripe-webhook). Apple POSTs a signed payload on renew / expire /
// cancel / refund. verify_jwt MUST be false (config.toml) — Apple does not send
// a Supabase JWT; the signed payload IS the authentication.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyNotification, verifyTransaction, planFromProductId, applyEntitlement } from "../_shared/appleIap.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const ok = () => new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });

// Notification types that mean the subscription is OVER right now (no grace).
const TERMINAL = new Set(["EXPIRED", "GRACE_PERIOD_EXPIRED", "REFUND", "REVOKE"]);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let signedPayload: string | undefined;
  try { ({ signedPayload } = await req.json()); }
  catch { return new Response("invalid_body", { status: 400 }); }
  if (!signedPayload) return new Response("missing_payload", { status: 400 });

  // deno-lint-ignore no-explicit-any
  let notif: any;
  try { notif = await verifyNotification(signedPayload); }
  catch (e) { console.error("apple-iap-notifications: verify failed", String(e)); return new Response("bad_signature", { status: 400 }); }

  try {
    const notificationType: string = notif.notificationType;
    const subtype: string | undefined = notif.subtype;
    const signedTxn: string | undefined = notif.data?.signedTransactionInfo;
    if (!signedTxn) { console.error("notif missing signedTransactionInfo", notificationType); return ok(); }

    // deno-lint-ignore no-explicit-any
    const txn: any = await verifyTransaction(signedTxn);
    const originalTransactionId = String(txn.originalTransactionId);

    if (!planFromProductId(txn.productId)) { console.error("notif unknown product", txn.productId); return ok(); }

    // Resolve the user from the original transaction id (set at first validate).
    const { data: u } = await admin
      .from("users")
      .select("id")
      .eq("apple_original_transaction_id", originalTransactionId)
      .maybeSingle();
    if (!u?.id) { console.error("notif: no user for", originalTransactionId, notificationType); return ok(); }

    const expiresMs = Number(txn.expiresDate ?? 0);
    // Terminal events end access immediately; otherwise access lasts until expiry.
    const active = !TERMINAL.has(notificationType) && expiresMs > Date.now();

    // DID_CHANGE_RENEWAL_STATUS + subtype AUTO_RENEW_DISABLED = user turned off
    // auto-renew but keeps access until period end → flag cancelled_at.
    let cancelledAtMs: number | null = null;
    if (
      (notificationType === "DID_CHANGE_RENEWAL_STATUS" && subtype === "AUTO_RENEW_DISABLED") ||
      TERMINAL.has(notificationType)
    ) {
      cancelledAtMs = Date.now();
    }

    await applyEntitlement(admin, {
      userId: u.id,
      originalTransactionId,
      productId: txn.productId,
      expiresMs,
      purchaseMs: Number(txn.purchaseDate ?? Date.now()),
      active,
      cancelledAtMs,
    });
  } catch (e) {
    // Return 200 even on processing error (Apple retries on non-2xx and we don't
    // want a poison payload to loop); log so it surfaces in function logs.
    console.error("apple-iap-notifications: processing error", String(e));
    return ok();
  }
  return ok();
});
