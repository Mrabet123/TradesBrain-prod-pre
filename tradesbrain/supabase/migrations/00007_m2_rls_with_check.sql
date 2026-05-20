-- M2/M3 — harden RLS on client-writable tables.
-- The original policies were USING-only: that constrains SELECT/UPDATE/DELETE
-- but leaves INSERT unchecked, so a client could insert a row scoped to another
-- user (e.g. a message into someone else's session). Re-create each policy
-- FOR ALL with a matching WITH CHECK so inserts are owner-scoped too.

DROP POLICY IF EXISTS job_sessions_policy ON public.job_sessions;
CREATE POLICY job_sessions_policy ON public.job_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS messages_policy ON public.messages;
CREATE POLICY messages_policy ON public.messages
  FOR ALL
  USING (session_id IN (SELECT id FROM public.job_sessions WHERE user_id = auth.uid()))
  WITH CHECK (session_id IN (SELECT id FROM public.job_sessions WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS job_reports_policy ON public.job_reports;
CREATE POLICY job_reports_policy ON public.job_reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS quotes_policy ON public.quotes;
CREATE POLICY quotes_policy ON public.quotes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS worker_preferences_policy ON public.worker_preferences;
CREATE POLICY worker_preferences_policy ON public.worker_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
