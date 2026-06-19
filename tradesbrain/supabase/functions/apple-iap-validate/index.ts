// TradesBrain — apple-iap-validate
// Called by the iOS app right after a StoreKit purchase. Receives the signed
// transaction JWS (expo-iap `purchase.purchaseToken`), verifies it against
// Apple's cert chain, and writes the entitlement. verify_jwt stays true — the
// caller is the app with a real user JWT.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyTransaction, planFromProductId, applyEntitlement } from "../_shared/appleIap.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing authorization" }, 401);

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  let jws: string | undefined;
  try { ({ jws } = await req.json()); }
  catch { return json({ error: "invalid_body" }, 400); }
  if (!jws || typeof jws !== "string") return json({ error: "missing_jws" }, 400);

  // deno-lint-ignore no-explicit-any
  let txn: any;
  try { txn = await verifyTransaction(jws); }
  catch (e) { console.error("apple-iap-validate: verify failed", String(e)); return json({ error: "invalid_transaction" }, 400); }

  if (!planFromProductId(txn.productId)) {
    console.error("apple-iap-validate: unknown product", txn.productId);
    return json({ error: "unknown_product" }, 400);
  }

  const expiresMs = Number(txn.expiresDate ?? 0);
  const active = expiresMs > Date.now();

  try {
    await applyEntitlement(admin, {
      userId: user.id,
      originalTransactionId: String(txn.originalTransactionId),
      productId: txn.productId,
      expiresMs,
      purchaseMs: Number(txn.purchaseDate ?? Date.now()),
      active,
    });
  } catch (e) {
    console.error("apple-iap-validate: write failed", String(e));
    return json({ error: "write_failed" }, 500);
  }

  return json({ ok: true, status: active ? "active" : "expired", expires: new Date(expiresMs).toISOString() });
});
