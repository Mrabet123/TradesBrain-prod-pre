-- M3 — persist the worker's chosen payment methods as a quote default (D3 RULE 6).
-- worker_preferences already carries default_include_vat / default_include_license
-- and default_payment_terms; this adds the multi-select payment methods list so
-- the next quote pre-fills the worker's last choice instead of a hardcoded value.
ALTER TABLE public.worker_preferences
  ADD COLUMN IF NOT EXISTS default_payment_methods jsonb NOT NULL DEFAULT '[]'::jsonb;
