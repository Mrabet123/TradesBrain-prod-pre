// TradesBrain — create-team-member
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.0.0";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion, httpClient: Stripe.createFetchHttpClient() });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const ah = req.headers.get("Authorization");
  if (!ah) return new Response(JSON.stringify({ error: "Missing auth" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: ah } } });
  const { data: { user: owner } } = await uc.auth.getUser();
  if (!owner) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const { data: od } = await supabase.from("users").select("full_name, plan_type, subscription_status").eq("id", owner.id).single();
  if (od?.plan_type !== "team" || od?.subscription_status !== "active") return new Response(JSON.stringify({ error: "team_plan_required" }), { status: 403, headers: { "Content-Type": "application/json" } });
  const { count } = await supabase.from("team_members").select("id", { count: "exact" }).eq("team_owner_id", owner.id).eq("is_active", true);
  if ((count ?? 0) >= 10) return new Response(JSON.stringify({ error: "max_seats_reached" }), { status: 409, headers: { "Content-Type": "application/json" } });
  let b: Record<string, string>;
  try { b = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "invalid_body" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  // ISS-H2: validate every required field BEFORE any account/Stripe side-effect.
  // Missing fields previously surfaced only as a mid-flow DB NOT NULL error,
  // after a Stripe seat / KYC sessions may already have been created.
  const REQUIRED = ["email", "phone_number", "temp_password", "full_name", "trade_type", "vat_number", "license_number", "license_proof_url", "national_id_url"];
  const missing = REQUIRED.filter((k) => !b?.[k] || String(b[k]).trim() === "");
  if (missing.length) {
    return new Response(JSON.stringify({ error: "missing_fields", fields: missing }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  let nid: string | null = null;
  // D-1 (audit 4.1 / 2.5.7): track whether the Stripe seat was actually added so
  // the rollback can REVERSE it. Previously the catch only deleted the auth user
  // + DB rows and left an orphaned, billed seat if a step AFTER add_seat threw.
  let seatAdded = false;
  try {
    const { data: au, error } = await supabase.auth.admin.createUser({ email: b.email, phone: b.phone_number, password: b.temp_password, email_confirm: true, phone_confirm: false });
    if (error || !au.user) throw new Error(error?.message);
    nid = au.user.id;
    // ISS-H2: error-check the profile + team_member inserts. A silent failure
    // here previously left a half-provisioned member (Stripe seat added, KYC
    // sessions minted, emails sent) with no users row — and no rollback,
    // because no error was thrown. Throwing routes into the rollback below.
    const { error: userErr } = await supabase.from("users").insert({ id: nid, full_name: b.full_name, email: b.email, phone_number: b.phone_number, trade_type: b.trade_type, account_type: "solopreneur", hourly_rate: 0, vat_number: b.vat_number, license_number: b.license_number, license_proof_url: b.license_proof_url, national_id_url: b.national_id_url, national_id_kyc_status: "pending", license_kyc_status: "pending", trial_queries_remaining: 0, subscription_status: "active", plan_type: "team", terms_accepted_at: new Date().toISOString(), terms_version: "1.2" });
    if (userErr) throw new Error(`users insert failed: ${userErr.message}`);
    // D-1: error-check the seat-add. `functions.invoke` resolves with { error }
    // (transport) and the function itself may return { data: { error } } (a 4xx/5xx
    // body) — NEITHER throws. Inspect both so a failed seat-add routes into the
    // rollback below instead of silently producing a seatless member.
    // ORDER: add_seat runs BEFORE the team_members insert. stripe-update-subscription's
    // add_seat cap check counts team_members rows; inserting this member first would
    // double-count and wrongly reject the legitimate 10th seat. The outer count guard
    // (above) already blocks the 11th before we get here.
    const seatRes = await supabase.functions.invoke("stripe-update-subscription", { headers: { Authorization: ah }, body: { action: "add_seat" } });
    if (seatRes.error || (seatRes.data && (seatRes.data as { error?: string }).error)) {
      throw new Error(`add_seat failed: ${seatRes.error?.message ?? (seatRes.data as { error?: string })?.error}`);
    }
    seatAdded = true;
    const { error: teamErr } = await supabase.from("team_members").insert({ team_owner_id: owner.id, member_id: nid, is_active: true, temporary_password_set: true });
    if (teamErr) throw new Error(`team_members insert failed: ${teamErr.message}`);
    await stripe.identity.verificationSessions.create({ type: "document", metadata: { user_id: nid, document_type: "national_id" }, options: { document: { require_live_capture: true, require_id_number: false } } });
    await stripe.identity.verificationSessions.create({ type: "document", metadata: { user_id: nid, document_type: "license" }, options: { document: { require_live_capture: true, require_id_number: false } } });
    // ISS-10 (fix 2): credentials are NEVER delivered as a plain-text password.
    // A single-use Supabase password-recovery link is generated; that link is
    // what gets emailed (O-1: email only). The member clicks it, sets their own
    // password, and the temp password used above is overwritten.
    let recoveryUrl: string | null = null;
    try {
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: b.email,
      });
      if (linkErr) throw linkErr;
      recoveryUrl = linkData?.properties?.action_link ?? null;
    } catch (linkErr) {
      // Link generation failed — the member can still use "Forgot password" on
      // the sign-in screen. Do NOT fall back to emailing a plain-text password.
      console.error("generateLink (recovery) failed for new member", nid, linkErr);
    }

    const emailSetupBlock = recoveryUrl
      ? `<p>Tap the button below to set your password and get started:</p>
         <p><a href="${recoveryUrl}" style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none">Set your password</a></p>
         <p style="color:#666;font-size:12px">This link is single-use and expires shortly. If it has expired, open the TradesBrain app and use "Forgot password" with this email address.</p>`
      : `<p>Open the TradesBrain app, tap "Forgot password" on the sign-in screen, and enter this email address to set your password.</p>`;

    // ISS-10 (fix 1): Resend email is isolated in its own try/catch so a delivery
    // failure does NOT roll back the already-created auth user + DB rows.
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "TradesBrain <noreply@tradesbrain.app>",
          to: [b.email],
          subject: `${od.full_name} added you to TradesBrain`,
          html: `<h2>Welcome ${b.full_name}</h2><p>${od.full_name} has added you to their TradesBrain team.</p>${emailSetupBlock}`,
        }),
      });
    } catch (emailErr) {
      // Email delivery failed — log it but do NOT throw. Member was created
      // successfully; the team owner can resend credentials manually.
      console.error("Resend email failed for new member", nid, emailErr);
    }

    // O-1 (founder decision, LOCKED): credentials are delivered by EMAIL only
    // (Resend, above). There is no SMS/Twilio credential channel — TradesBrain
    // does not build an SMS dependency. The send-push-notification Edge Function
    // (team_member_added type) is the in-app notification channel only.
    await supabase.functions.invoke("send-push-notification", {
      body: { user_id: nid, type: "team_member_added", deep_link: "tradesbrain://home" },
    }).catch((pushErr: unknown) => {
      console.error("Push notification failed for new member", nid, pushErr);
    });

    return new Response(JSON.stringify({ success: true, member_id: nid }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    // D-1: FULL rollback (D10 §2.7 "No partial state"). Reverse the Stripe seat
    // FIRST if it was added, so a failure after add_seat never leaves an orphaned
    // billed seat. Then delete the auth user + DB rows. All steps best-effort.
    if (seatAdded) {
      await supabase.functions.invoke("stripe-update-subscription", { headers: { Authorization: ah }, body: { action: "remove_seat" } }).catch(() => {});
    }
    if (nid) { await supabase.auth.admin.deleteUser(nid).catch(() => {}); await supabase.from("users").delete().eq("id", nid).catch(() => {}); await supabase.from("team_members").delete().eq("member_id", nid).catch(() => {}); }
    return new Response(JSON.stringify({ error: "creation_failed", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
