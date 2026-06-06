// TradesBrain — stripe-portal-session (M6 — Manage payment method)
// Returns a short-lived Stripe Customer Portal URL for the caller. The mobile
// app opens it in an in-app browser so the user can update their card, view
// invoices, or change Stripe-managed billing details.
//
// Caller MUST be authenticated. The portal URL is bound to the caller's
// stripe_customer_id (looked up via service-role) — the JWT only proves
// identity; we never trust a client-supplied customer ID.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion,
  httpClient: Stripe.createFetchHttpClient(),
});
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Return URL the portal redirects to when the user taps "Return". The mobile
// in-app browser ignores it (we just close the sheet), but Stripe requires a
// non-empty value. Use the app's deep link scheme so a web variant works too.
const RETURN_URL =
  Deno.env.get("STRIPE_PORTAL_RETURN_URL") ?? "tradesbrain://settings/subscription";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: ud } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!ud?.stripe_customer_id) {
    return new Response(
      JSON.stringify({ error: "no_customer" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: ud.stripe_customer_id,
      return_url: RETURN_URL,
    });
    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message ?? "portal_failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
