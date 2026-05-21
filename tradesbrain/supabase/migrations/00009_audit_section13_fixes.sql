-- M0-M4 audit remediation — Section 13 fixes (ISS-03, ISS-07, ISS-30)
-- ISS-03 (HIGH)   subscriptions + billing_history RLS lack WITH CHECK.
--                 Original FOR ALL USING-only policies permitted a client to
--                 INSERT/UPDATE rows scoped to any user_id.  Re-create both
--                 policies with a matching WITH CHECK so inserts are owner-scoped.
-- ISS-07 (MEDIUM) users table FOR ALL policy permits client-side DELETE of the
--                 users row, bypassing the delete-account Edge Function.
--                 Replace the single users_own_row policy with three
--                 operation-specific policies (SELECT / INSERT / UPDATE) and omit
--                 DELETE so that client DELETEs are denied by RLS while the
--                 service-role delete-account function (which bypasses RLS) still
--                 works.
-- ISS-30 (LOW)    prevent_finalised_update() raises 'Cannot modify a finalised
--                 document'; D5 §6 specifies 'Cannot modify a finalised report'.
--                 Correct the message text via CREATE OR REPLACE FUNCTION.

-- ── ISS-03: subscriptions — add WITH CHECK ────────────────────────────────────
DROP POLICY IF EXISTS subscriptions_policy ON public.subscriptions;
CREATE POLICY subscriptions_policy ON public.subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── ISS-03: billing_history — add WITH CHECK ──────────────────────────────────
DROP POLICY IF EXISTS billing_history_policy ON public.billing_history;
CREATE POLICY billing_history_policy ON public.billing_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── ISS-07: users — split FOR ALL into SELECT/INSERT/UPDATE, omit DELETE ──────
-- Drop the existing FOR ALL policy (recreated in 00008 as users_own_row).
DROP POLICY IF EXISTS users_own_row ON public.users;

CREATE POLICY users_own_select ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_own_insert ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_own_update ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- NOTE: No DELETE policy is created for users.  With RLS enabled and no
-- permissive DELETE policy, client-initiated DELETEs are rejected.  The
-- delete-account Edge Function runs under the service role which bypasses
-- RLS and can still perform the deletion.  The separate users_team_owner_read
-- policy is intentionally left untouched.

-- ── ISS-30: correct finalised-document error message per D5 §6 ───────────────
CREATE OR REPLACE FUNCTION prevent_finalised_update() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'finalised' THEN
    RAISE EXCEPTION 'Cannot modify a finalised report';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
-- The triggers lock_finalised_report (job_reports) and lock_finalised_quote
-- (quotes) already reference this function by name and require no changes.
