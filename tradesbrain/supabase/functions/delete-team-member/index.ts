// TradesBrain — delete-team-member
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const ah = req.headers.get("Authorization");
  if (!ah) return new Response(JSON.stringify({ error: "Missing auth" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: ah } } });
  const { data: { user: owner } } = await uc.auth.getUser();
  if (!owner) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  // EF-6: guard a malformed request body — return a clean 400 instead of an
  // unhandled JSON-parse error surfacing as a 500.
  let b: { confirmation?: string; member_id?: string };
  try { b = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
  if (b.confirmation !== "DELETE") return new Response(JSON.stringify({ error: "Confirmation required" }), { status: 400, headers: { "Content-Type": "application/json" } });
  if (b.member_id === owner.id) return new Response(JSON.stringify({ error: "Cannot delete self" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const { data: tl } = await supabase.from("team_members").select("id").eq("team_owner_id", owner.id).eq("member_id", b.member_id).single();
  if (!tl) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  // D-3 (audit 4.2): the cascade is NOT a single DB transaction (it spans
  // Postgres, Storage, Auth, and Stripe). Aborting on the first error would leave
  // MORE orphaned data, not less — so we run EVERY step best-effort, collect any
  // failures, and only report them at the end. The cascade order (D10 §2.8) is
  // preserved: messages → job_reports → quotes → job_sessions →
  // worker_preferences → team_members → storage → users → auth user → seat.
  const failures: string[] = [];
  const step = async (label: string, fn: () => Promise<{ error: unknown } | void>) => {
    try { const r = await fn(); if (r && r.error) failures.push(`${label}: ${String((r.error as { message?: string }).message ?? r.error)}`); }
    catch (e) { failures.push(`${label}: ${String(e)}`); }
  };

  const { data: sess } = await supabase.from("job_sessions").select("id").eq("user_id", b.member_id);
  if (sess?.length) {
    const ids = sess.map(s => s.id);
    await step("messages", () => supabase.from("messages").delete().in("session_id", ids));
    await step("job_reports", () => supabase.from("job_reports").delete().in("session_id", ids));
    await step("quotes", () => supabase.from("quotes").delete().in("session_id", ids));
  }
  await step("job_sessions", () => supabase.from("job_sessions").delete().eq("user_id", b.member_id));
  await step("worker_preferences", () => supabase.from("worker_preferences").delete().eq("user_id", b.member_id));
  await step("team_members", () => supabase.from("team_members").delete().eq("member_id", b.member_id));
  for (const bkt of ["job-photos", "job-documents", "kyc-documents", "profile-assets"]) {
    await step(`storage:${bkt}`, async () => {
      const { data: f } = await supabase.storage.from(bkt).list(b.member_id);
      if (f?.length) return await supabase.storage.from(bkt).remove(f.map(x => `${b.member_id}/${x.name}`));
    });
  }
  await step("users", () => supabase.from("users").delete().eq("id", b.member_id));
  await step("auth_user", () => supabase.auth.admin.deleteUser(b.member_id!));
  // Decrement the Stripe seat. invoke does not throw on a function error, so check
  // both transport error and the function's own { error } body.
  await step("remove_seat", async () => {
    const r = await supabase.functions.invoke("stripe-update-subscription", { headers: { Authorization: ah }, body: { action: "remove_seat" } });
    return { error: r.error ?? (r.data as { error?: string })?.error };
  });

  if (failures.length) {
    // Member data is mostly gone but at least one step failed — surface it so the
    // owner/dev can finish cleanup rather than assume a clean delete.
    return new Response(JSON.stringify({ error: "partial_delete", member_id: b.member_id, failures }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ success: true, member_id: b.member_id }), { status: 200, headers: { "Content-Type": "application/json" } });
});
