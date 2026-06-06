// TradesBrain — stripe-update-subscription
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.0.0";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion, httpClient: Stripe.createFetchHttpClient() });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const PPM: Record<string, Record<string, string>> = {
  solo: { monthly: Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY")!, annual: Deno.env.get("STRIPE_PRICE_SOLO_ANNUAL")! },
  pro: { monthly: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY")!, annual: Deno.env.get("STRIPE_PRICE_PRO_ANNUAL")! },
  team: { monthly: Deno.env.get("STRIPE_PRICE_TEAM_MONTHLY")!, annual: Deno.env.get("STRIPE_PRICE_TEAM_ANNUAL")! },
  seat: { monthly: Deno.env.get("STRIPE_PRICE_SEAT_MONTHLY")!, annual: Deno.env.get("STRIPE_PRICE_SEAT_ANNUAL")! },
};

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const ah = req.headers.get("Authorization");
  if (!ah) return new Response(JSON.stringify({ error: "Missing auth" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: ah } } });
  const { data: { user } } = await uc.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  // ISS-L9 (EF-6): a malformed body should be a clean 400, not an unhandled 500.
  let body: any;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "invalid_body" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
  const { data: sd } = await supabase.from("subscriptions").select("stripe_subscription_id, plan_type, billing_cycle").eq("user_id", user.id).eq("status", "active").single();
  if (!sd) return new Response(JSON.stringify({ error: "No subscription" }), { status: 404, headers: { "Content-Type": "application/json" } });
  const sub = await stripe.subscriptions.retrieve(sd.stripe_subscription_id);
  // Audit D3: the base-plan line item is NOT necessarily items.data[0]. On a
  // Team subscription the items array also contains the per-seat line item, and
  // Stripe does not guarantee ordering. Identify the base item by matching its
  // price against the known base-plan price IDs (solo/pro/team, either cycle);
  // fall back to index 0 only for a single-item subscription. Repricing the
  // wrong item (e.g. the seat line) on an upgrade/downgrade would corrupt billing.
  const BASE_PRICE_IDS = new Set([
    PPM.solo.monthly, PPM.solo.annual,
    PPM.pro.monthly, PPM.pro.annual,
    PPM.team.monthly, PPM.team.annual,
  ]);
  const ci = sub.items.data.find((i) => BASE_PRICE_IDS.has(i.price.id)) ?? sub.items.data[0];
  try {
    switch (body.action) {
      case "upgrade": case "downgrade": {
        const np = PPM[body.new_plan_type]?.[sd.billing_cycle];
        if (!np) return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: { "Content-Type": "application/json" } });
        await stripe.subscriptions.update(sub.id, { items: [{ id: ci.id, price: np }], proration_behavior: "create_prorations" }); break;
      }
      case "switch_annual": {
        // D10: reject if the subscription is already on annual billing —
        // without this guard a repeated call runs a no-op proration update.
        if (sd.billing_cycle === "annual")
          return new Response(JSON.stringify({ error: "already_annual" }), { status: 409, headers: { "Content-Type": "application/json" } });
        const ap = PPM[sd.plan_type]?.annual;
        if (!ap) return new Response(JSON.stringify({ error: "No annual price" }), { status: 400, headers: { "Content-Type": "application/json" } });
        await stripe.subscriptions.update(sub.id, { items: [{ id: ci.id, price: ap }], proration_behavior: "create_prorations", billing_cycle_anchor: "now" }); break;
      }
      // Bi-directional cycle switch — the mobile wrapper switchBillingCycle()
      // sends { billing_cycle: 'monthly' | 'annual' }. switch_annual stays for
      // backwards compatibility but new code uses this case.
      case "switch_billing_cycle": {
        const target = body.billing_cycle === "annual" ? "annual" : "monthly";
        if (sd.billing_cycle === target)
          return new Response(JSON.stringify({ error: `already_${target}` }), { status: 409, headers: { "Content-Type": "application/json" } });
        const np = PPM[sd.plan_type]?.[target];
        if (!np) return new Response(JSON.stringify({ error: "No price for target cycle" }), { status: 400, headers: { "Content-Type": "application/json" } });
        await stripe.subscriptions.update(sub.id, { items: [{ id: ci.id, price: np }], proration_behavior: "create_prorations", billing_cycle_anchor: "now" }); break;
      }
      // changePlan(plan) wrapper — derive upgrade vs downgrade from the plan
      // ordering (solo < pro < team) so the client doesn't need to know.
      case "change_plan": {
        const order: Record<string, number> = { solo: 1, pro: 2, team: 3 };
        const targetPlan = body.plan_type ?? body.new_plan_type;
        if (!targetPlan || !order[targetPlan])
          return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: { "Content-Type": "application/json" } });
        if (targetPlan === sd.plan_type)
          return new Response(JSON.stringify({ error: "already_on_plan" }), { status: 409, headers: { "Content-Type": "application/json" } });
        const np = PPM[targetPlan]?.[sd.billing_cycle];
        if (!np) return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: { "Content-Type": "application/json" } });
        await stripe.subscriptions.update(sub.id, { items: [{ id: ci.id, price: np }], proration_behavior: "create_prorations" }); break;
      }
      // RULE 7 — cancel via cancel_at_period_end so the worker keeps access
      // until the period boundary. Settings → Subscription surfaces the exact
      // end date via calculate-days-remaining.
      case "cancel": {
        if ((sub as any).cancel_at_period_end === true)
          return new Response(JSON.stringify({ error: "already_cancelled" }), { status: 409, headers: { "Content-Type": "application/json" } });
        await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
        break;
      }
      // Restore = un-cancel a subscription that was scheduled to end at the
      // period boundary. Only valid while cancel_at_period_end is still true.
      case "restore": {
        if ((sub as any).cancel_at_period_end !== true)
          return new Response(JSON.stringify({ error: "not_cancelled" }), { status: 409, headers: { "Content-Type": "application/json" } });
        await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false });
        break;
      }
      case "add_seat": {
        // Enforce the 10-seat maximum (D10) before touching Stripe.
        const { count: activeMembers } = await supabase
          .from("team_members")
          .select("id", { count: "exact", head: true })
          .eq("team_owner_id", user.id)
          .eq("is_active", true);
        if ((activeMembers ?? 0) >= 10)
          return new Response(JSON.stringify({ error: "max_seats_reached" }), { status: 409, headers: { "Content-Type": "application/json" } });
        const sp = PPM.seat[sd.billing_cycle]; const ei = sub.items.data.find(i => i.price.id === sp);
        if (ei) await stripe.subscriptionItems.update(ei.id, { quantity: (ei.quantity ?? 0) + 1, proration_behavior: "create_prorations" });
        else await stripe.subscriptions.update(sub.id, { items: [{ price: sp, quantity: 1 }], proration_behavior: "create_prorations" }); break;
      }
      case "remove_seat": {
        const sp = PPM.seat[sd.billing_cycle]; const ei = sub.items.data.find(i => i.price.id === sp);
        if (!ei) return new Response(JSON.stringify({ error: "No seats" }), { status: 400, headers: { "Content-Type": "application/json" } });
        const nq = (ei.quantity ?? 1) - 1;
        if (nq <= 0) await stripe.subscriptionItems.del(ei.id, { proration_behavior: "create_prorations" } as any);
        else await stripe.subscriptionItems.update(ei.id, { quantity: nq, proration_behavior: "create_prorations" }); break;
      }
      default: return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
  } catch (err) { return new Response(JSON.stringify({ error: "Failed", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } }); }
  return new Response(JSON.stringify({ success: true, action: body.action }), { status: 200, headers: { "Content-Type": "application/json" } });
});
