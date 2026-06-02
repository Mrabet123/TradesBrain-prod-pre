-- 00013_subscription_reminders.sql
-- Scheduled push reminders (D9 §8) for the three time-based notification types
-- that no Stripe/KYC event fires on its own:
--   trial_ending · subscription_expiring · subscription_expired
--
-- A daily pg_cron job calls the `send-subscription-reminders` Edge Function,
-- which finds due users and invokes `send-push-notification` exactly once per
-- (user, type, billing period) — deduped via public.notification_log.

-- ── 1. Idempotency ledger ───────────────────────────────────────────────────
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  -- Ties a reminder to its period so the same one is never sent twice, but a
  -- new period (or new trial) legitimately gets a fresh row. Examples:
  --   'trial'                  · 'expiring:2026-07-01' · 'expired:2026-07-01'
  dedupe_key text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, type, dedupe_key)
);

create index if not exists notification_log_user_idx
  on public.notification_log(user_id);

-- Service-role only: the Edge Function (service role) bypasses RLS; anon and
-- authenticated clients get NO access because there are no policies.
alter table public.notification_log enable row level security;

comment on table public.notification_log is
  'Idempotency ledger for scheduled push reminders — one row per (user, type, period). Written by send-subscription-reminders via service role only.';

-- ── 2. Extensions for scheduled outbound HTTP ───────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── 3. Vault secrets (RUN ONCE — replace the placeholder values) ────────────
-- The cron job reads the project URL + service-role key from Supabase Vault so
-- no secret is hard-coded in this migration or in pg_cron's job table. Run
-- these ONCE in the SQL editor with your real values:
--
--   select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');
--   select vault.create_secret('YOUR_SERVICE_ROLE_KEY',                'service_role_key');
--
-- If they already exist, update instead of re-creating:
--   update vault.secrets set secret = 'https://YOUR_PROJECT_REF.supabase.co' where name = 'project_url';
--   update vault.secrets set secret = 'YOUR_SERVICE_ROLE_KEY'                where name = 'service_role_key';
--
-- Until both secrets are set, the cron job's HTTP call no-ops (NULL url) — it
-- will not error the database; it simply won't fire reminders.

-- ── 4. Daily cron job ───────────────────────────────────────────────────────
-- Drop any prior copy first so re-running this migration can't create
-- duplicate schedules.
do $$
begin
  perform cron.unschedule('send-subscription-reminders-daily');
exception when others then
  null; -- job didn't exist yet — nothing to unschedule
end $$;

-- 09:00 UTC every day. pg_net dispatches the request asynchronously (it returns
-- a request id immediately and does not block the cron worker); the Edge
-- Function runs on its own and does the dedupe + push fan-out.
select cron.schedule(
  'send-subscription-reminders-daily',
  '0 9 * * *',
  $cron$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/send-subscription-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
