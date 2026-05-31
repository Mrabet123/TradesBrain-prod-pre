// TradesBrain — mark-member-activated (M8 — push #15)
// Called by the mobile app once a freshly-onboarded team member has finished
// their first login (set their own password via the recovery link AND verified
// the phone OTP). Idempotent: if the member's temporary_password_set is already
// false, the function is a no-op and returns success.
//
// Side-effects on first transition:
//   • flips team_members.temporary_password_set → false
//   • sends a `member_activated` push to the owner with a deep link to
//     /team/members (so they can tap straight into the activated member's row)
//
// Auth: caller's JWT is required and must own the team_members row being
// flipped (member_id = auth.uid()). Service-role for the DB writes.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Look up this member's team_members row (if any).
  const { data: row } = await adminClient
    .from("team_members")
    .select("id, team_owner_id, temporary_password_set")
    .eq("member_id", user.id)
    .maybeSingle();

  // Not a team member — nothing to do, return success so callers can fire
  // this unconditionally without branching.
  if (!row) {
    return new Response(JSON.stringify({ activated: false, reason: "not_team_member" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Already activated — idempotent no-op.
  if (!row.temporary_password_set) {
    return new Response(JSON.stringify({ activated: false, reason: "already_activated" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Flip the flag.
  const { error: updateErr } = await adminClient
    .from("team_members")
    .update({ temporary_password_set: false })
    .eq("id", row.id);
  if (updateErr) {
    return new Response(JSON.stringify({ error: updateErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Best-effort: notify the owner. A failure here must not roll back the flag.
  try {
    const { data: profile } = await adminClient
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single();
    // send-push-notification is gated on the service-role key (ISS-M6). We omit
    // the Authorization header so the admin client's default service-role auth
    // is used instead of the caller's JWT.
    await adminClient.functions.invoke("send-push-notification", {
      body: {
        user_id: row.team_owner_id,
        type: "member_activated",
        metadata: { member_name: profile?.full_name ?? "Team member" },
        deep_link: "tradesbrain://team/members",
      },
    });
  } catch (e) {
    console.error("[mark-member-activated] owner push failed", e);
  }

  return new Response(JSON.stringify({ activated: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
