-- 00016 — Apple In-App Purchase (iOS) support.
-- iOS subscriptions are billed by Apple (StoreKit 2), not Stripe. Entitlement
-- still lives in users.subscription_status / plan_type / subscription_end_date;
-- these columns add the provenance + the Apple originalTransactionId so the
-- App Store Server Notifications V2 handler can resolve a user from a
-- notification payload (which carries no Supabase id). Android stays on Stripe.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS apple_original_transaction_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS apple_original_transaction_id text;

-- Apple subscription rows have no Stripe subscription id.
ALTER TABLE public.subscriptions ALTER COLUMN stripe_subscription_id DROP NOT NULL;

-- Conflict target for apple-iap-validate upserts, and lookup key for the
-- notifications handler. Partial so existing Stripe rows (NULL) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_apple_original_txn_key
  ON public.subscriptions (apple_original_transaction_id)
  WHERE apple_original_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_apple_original_txn_idx
  ON public.users (apple_original_transaction_id)
  WHERE apple_original_transaction_id IS NOT NULL;

-- Constrain provider values (existing rows default to 'stripe', so valid).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_payment_provider_chk') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_payment_provider_chk CHECK (payment_provider IN ('stripe','apple'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_payment_provider_chk') THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_payment_provider_chk CHECK (payment_provider IN ('stripe','apple'));
  END IF;
END $$;
