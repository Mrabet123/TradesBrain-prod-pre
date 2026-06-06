// TradesBrain — kyc-status-check
// Reports overall KYC status. When the body carries { verify_document }, it
// also mints a Stripe Identity verification session for that document and
// returns its hosted verification URL — the mobile app opens that URL so the
// user can capture their documents. kyc-webhook flips the status fields to
// 'verified' / 'rejected' once Stripe finishes processing.
//
// REQUIRED SECRETS (deploy checklist — audit Issue 7): SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, and STRIPE_SECRET_KEY. Note
// STRIPE_SECRET_KEY is NOT in D10's original env list for this function but is
// required here for the verify_document path — it MUST be set or every
// verification-session mint throws.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2026-04-22.dahlia" as Stripe.LatestApiVersion, httpClient: Stripe.createFetchHttpClient() });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const JSON_HEADERS = { "Content-Type": "application/json" };

// Each KYC document type → its status column on the users table.
const STATUS_COLUMN = { national_id: "national_id_kyc_status", license: "license_kyc_status" } as const;
type DocType = keyof typeof STATUS_COLUMN;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: JSON_HEADERS });
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: JSON_HEADERS });

  // Optional: caller wants to (re)start verification for one document. Body is
  // read defensively — a plain status poll sends {} or no body at all.
  let verifyDocument: DocType | undefined;
  try {
    const body = await req.json();
    if (body?.verify_document === "national_id" || body?.verify_document === "license") verifyDocument = body.verify_document;
  } catch { /* no body — status-only poll */ }

  const { data } = await supabase
    .from("users")
    .select("national_id_kyc_status, license_kyc_status")
    .eq("id", user.id)
    .single();
  if (!data) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: JSON_HEADERS });

  const statuses: Record<DocType, string> = { national_id: data.national_id_kyc_status, license: data.license_kyc_status };
  let verificationUrl: string | null = null;

  // Mint a fresh Stripe Identity session for the requested document. A verified
  // document is permanently locked (RULE 1) and is never re-verified.
  if (verifyDocument && statuses[verifyDocument] !== "verified") {
    try {
      const session = await stripe.identity.verificationSessions.create({
        type: "document",
        metadata: { user_id: user.id, document_type: verifyDocument },
        options: { document: { require_live_capture: true, require_id_number: false } },
      });
      verificationUrl = session.url ?? null;
      await supabase.from("users").update({ [STATUS_COLUMN[verifyDocument]]: "pending" }).eq("id", user.id);
      statuses[verifyDocument] = "pending";
    } catch (err) {
      console.error(`KYC session create failed for ${verifyDocument}:`, err);
      return new Response(JSON.stringify({ error: "verification_unavailable" }), { status: 502, headers: JSON_HEADERS });
    }
  }

  const nid = statuses.national_id, lic = statuses.license;
  let result: any;
  if (nid === "verified" && lic === "verified") result = { can_subscribe: true, status: "verified", national_id_status: nid, license_status: lic, message: "Identity verified." };
  else if (nid === "rejected") result = { can_subscribe: false, status: "rejected", blocking_document: "national_id", national_id_status: nid, license_status: lic, message: "National ID rejected. Re-verify from Settings." };
  else if (lic === "rejected") result = { can_subscribe: false, status: "rejected", blocking_document: "license", national_id_status: nid, license_status: lic, message: "License rejected. Re-verify from Settings." };
  else if (nid === "pending" || lic === "pending") result = { can_subscribe: false, status: "pending", blocking_document: nid === "pending" ? "national_id" : "license", national_id_status: nid, license_status: lic, message: "Under review. Usually within 24 hours." };
  else result = { can_subscribe: false, status: "not_uploaded", blocking_document: nid !== "verified" ? "national_id" : "license", national_id_status: nid, license_status: lic, message: "Identity verification required." };
  result.verification_url = verificationUrl;
  return new Response(JSON.stringify(result), { status: 200, headers: JSON_HEADERS });
});
