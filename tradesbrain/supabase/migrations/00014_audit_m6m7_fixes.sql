-- 00014 — M6+M7 audit fixes
-- 1. Stripe webhook idempotency ledger (audit Part 4.1 / D4).
-- 2. Lock trial_queries_remaining to server-side writes only (audit 2.8.4 / D5).

-- ── 1. Stripe webhook idempotency ledger ─────────────────────────────────────
-- handle-stripe-webhook claims each Stripe event id here BEFORE processing.
-- A PK conflict on redelivery means the event was already handled → skip.
-- Service-role only (Edge Functions); no client access needed.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id    text PRIMARY KEY,
  type        text,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (which bypasses RLS) reads/writes this.

-- ── 2. Lock trial_queries_remaining (D5 / audit 2.8.4) ───────────────────────
-- RLS lets a user UPDATE their own users row (profile edits), but the trial
-- counter must only ever change via the server-side decrement-trial-query
-- Edge Function (which runs as service_role). Block any change to the column
-- coming from an authenticated (client) JWT; allow service_role + admin/SQL.
CREATE OR REPLACE FUNCTION public.lock_trial_queries()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.trial_queries_remaining IS DISTINCT FROM OLD.trial_queries_remaining
     AND coalesce(auth.role(), '') = 'authenticated' THEN
    RAISE EXCEPTION 'trial_queries_remaining can only be changed server-side';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_lock_trial_queries ON public.users;
CREATE TRIGGER users_lock_trial_queries
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.lock_trial_queries();

-- ── 3. KYC rejection reason (audit 3.4.2 / D9) ───────────────────────────────
-- kyc-webhook only sent the rejection reason in the push payload; persist it so
-- Settings → Profile can show "why" next to a rejected document.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS national_id_kyc_reason text,
  ADD COLUMN IF NOT EXISTS license_kyc_reason text;
