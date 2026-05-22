-- M0-M4 build-audit remediation, round 2 (issues ISS-M1 / DB-1 and ISS-L7 / DB-2).
-- 1. Make the KYC document-URL lock conditional on verification (D5 §2) so the
--    Settings -> Profile re-upload fallback can replace a rejected/pending doc.
-- 2. Add the explicit GRANT EXECUTE on decrement_trial_query that D10 §4 mandates.

-- ── 1. ISS-M1 (DB-1): conditional KYC-field lock ─────────────────────────────
-- The 00008 version locked license_proof_url / national_id_url UNCONDITIONALLY
-- as soon as they were non-NULL — which blocked the canonical CC-1 rejection
-- recovery flow (Settings -> Profile re-upload could never overwrite the URL).
-- D5 §2 specifies these URLs are immutable only AFTER that document's KYC is
-- verified. license_number stays locked unconditionally (set once at sign-up).
CREATE OR REPLACE FUNCTION prevent_kyc_field_update() RETURNS TRIGGER AS $$
BEGIN
  -- license_number: set once at sign-up, never changes.
  IF OLD.license_number IS NOT NULL
     AND OLD.license_number IS DISTINCT FROM NEW.license_number THEN
    RAISE EXCEPTION 'license_number is locked and cannot be changed';
  END IF;
  -- license_proof_url: locked only once license KYC is verified — until then a
  -- re-upload (rejected / pending) must be able to replace it.
  IF OLD.license_kyc_status = 'verified'
     AND OLD.license_proof_url IS DISTINCT FROM NEW.license_proof_url THEN
    RAISE EXCEPTION 'license_proof_url is locked once license KYC is verified';
  END IF;
  -- national_id_url: locked only once national-ID KYC is verified.
  IF OLD.national_id_kyc_status = 'verified'
     AND OLD.national_id_url IS DISTINCT FROM NEW.national_id_url THEN
    RAISE EXCEPTION 'national_id_url is locked once national ID KYC is verified';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
-- Trigger lock_kyc_fields (created in 00008) already points at this function;
-- CREATE OR REPLACE updates the body in place — no trigger change needed.

-- ── 2. ISS-L7 (DB-2): explicit grant on decrement_trial_query (D10 §4) ────────
GRANT EXECUTE ON FUNCTION decrement_trial_query(uuid) TO authenticated;
