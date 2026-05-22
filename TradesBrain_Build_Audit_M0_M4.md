# TRADESBRAIN — FULL BUILD AUDIT REPORT
## Steps M0 through M4 + Supabase Database Setup

| | |
|---|---|
| **Report type** | Full technical compliance audit |
| **Scope** | M0 (Infrastructure) · M1 (Auth) · M2 (Rex) · M3 (Reports & Quotes) · M4 (Code Lookup & RAG) |
| **Audited against** | D1 PRD v1.3 · D2 User Flows v1.2 · D3 Feature Specs v1.1 · D4 Tech Architecture v1.2 · D5 Database v1.2 · D7 AI Prompts v2.0 · D8 Test Plan v1.0 · D9 Stripe v1.0 · D10 Edge Functions v1.0 · D6 (13 wireframe flows) · ClaudeCode BuildGuide |
| **Date** | 22 May 2026 |
| **Auditor** | Claude Code — static analysis + multi-agent independent code inspection |
| **Confidentiality** | Confidential — Internal use only |

---

## AUDIT METHODOLOGY & HONEST LIMITS — READ FIRST

This report is an **independent, current-state** audit. Every source file in `tradesbrain/app/`, `components/`, `services/`, `hooks/`, `context/`, `constants/`, `types/`, `utils/`, `supabase/functions/`, and `supabase/migrations/` was read and cross-referenced against D1–D10 and the 13 D6 wireframe flows. The verification was carried out by four parallel code-inspection agents, each reading the actual code (not summaries) and reporting verbatim logic.

**This is the honest picture, not an optimistic one.** Where the build is correct, this report says so. Where it deviates, is incomplete, or cannot be confirmed, this report flags it.

### What was done
- Full read of all 11 SQL migrations, all 15 Edge Function source files, the full AI optimisation layer, and all M1–M4 screens/services/hooks.
- Cross-reference against the D-series specification documents (the single source of truth) including their v1.1/v1.2 amendments.

### What could NOT be done — and is therefore never reported as PASS/FAIL
- **No test case was executed.** There is no running app, device, or simulator. Every Section 12 status is a **static code-inspection assessment**, not an execution result.
- **No live Supabase database.** Whether the 11 migrations are *applied* to the live project (`quvcparzpurwwkrxpiki`), whether RLS actually isolates users at runtime, and whether triggers actually fire — all assessed **from the migration SQL only**.
- **No Supabase CLI / dashboard access.** Whether the 15 Edge Functions are *deployed*, and whether their environment secrets are *set*, **cannot be confirmed**. Section 4 reports **source state** and flags this throughout.
- **AI runtime behaviour cannot be judged statically.** Whether Claude actually follows the 15 D7 principles, leads with the gas-leak STOP block, cites real code sections, or drafts good report content — all marked **CANNOT DETERMINE (runtime)**.

### Two structural corrections to the audit brief
1. **D8 contains 232 test cases (TC-001–232) across 10 sections (A–J), not 131 across 5.** The M0–M4 range is **Sections A–E, TC-001–117**. Section 12 audits that range honestly and does not invent the brief's TC-001–131 numbering.
2. **PDF generation uses `expo-print`, not `react-pdf`** — a documented D4 §1 v1.1 amendment (react-pdf targets React DOM and does not run on-device). This is correct, not a defect.

### Headline
The build is **code-complete for M0–M3** and **code-complete-but-data-blocked for M4**. The codebase has been through **two prior audit-remediation rounds** (migrations `00008`, `00009`, `00010`; Edge Functions carry `ISS-*` fix markers). This audit independently confirms that work and additionally surfaces **four issues the codebase's own prior internal draft did not flag** — most notably a **`code_chunks` trade-type enum mismatch (MEDIUM)** and an **uncommitted migration `00011` (process/HIGH-process)**. There are **no open CRITICAL or HIGH code-correctness defects** beyond the M4 data blocker. M5 may proceed in parallel with the conditions in Section 15.

---

## SECTION 1 — PROJECT STRUCTURE AUDIT

Full tree of `tradesbrain/` (excluding `node_modules`, `.git`, `.expo`, `android` build output), mapped against **D4 §2 v1.2** (the amended folder tree).

```
tradesbrain/
├── App.tsx · index.ts · app.json · babel.config.js · eas.json · metro.config.js
│   tsconfig.json · tailwind.config.js · global.css · nativewind-env.d.ts
│   package.json · package-lock.json · .env · .env.example · .gitignore · .npmrc · CLAUDE.md
├── app/
│   ├── _layout.tsx · paywall.tsx
│   ├── (auth)/   welcome · signup · signin · otp-verify · complete-profile
│   │             forgot-password · phone-signin
│   ├── (tabs)/   home · rex · report · quote · codes · history
│   ├── document/ report.tsx · quote.tsx
│   ├── job/      [sessionId].tsx · detail/[jobId].tsx
│   ├── settings/ index · profile · trade · team · subscription · legal
│   └── team/     add.tsx · [memberId].tsx
├── assets/       (icons, logo, splash, rex-compass)
├── components/   rex/(5) · documents/(4) · codes/(1) · history/(3) · shared/(13) · team/(2)
├── constants/    api · limits · pricing · tradeProfiles · appVersion · codeLookup
│                 paymentMethods · teamMetrics
├── context/      AuthContext · SubscriptionContext · TradeProfileContext · NetworkContext
├── hooks/        useAuth · useSubscription · useRexSession · useVoiceRecording
│                 usePhotoCapture · useCodeLookupCache · useMinVersion
│                 useOfflineQueue · useSavePassword
├── scripts/      ingest-code-document.js · extract-pdf-text.py · README.md · code-documents/
├── services/     (18 files)
├── stubs/        stripe-web.js
├── supabase/     config.toml · functions/(15) · migrations/(11 — 00001…00011)
├── types/        session · user · documents · subscription
└── utils/        formatters.ts
```

### Compliance vs D4 §2 v1.2
- **Every folder and file named in the D4 §2 v1.2 tree exists.** No spec'd file is missing.
- `constants/systemPrompts.ts` is **correctly absent** — Rex prompts moved server-side to `supabase/functions/claude-proxy/prompts.ts` (D4 §2 v1.1 amendment, CLAUDE.md rule 2). Compliant.
- All three optimisation files (`imageCompression.ts`, `ragInjector.ts`, `tokenEstimator.ts`) live in `services/` alongside `router.ts`/`summariser.ts` — exactly as the D4 §2 v1.1 amendment requires.
- `app/document/`, `app/team/`, `components/codes/`, `components/history/`, `stubs/`, and the full `supabase/` tree are present — all named in the D4 §2 amendments.
- The ~20 supplementary files added by the D4 §2 v1.2 ISS-35 amendment (`complete-profile.tsx`, `forgot-password.tsx`, `phone-signin.tsx`, `AccountSuspendedScreen.tsx`, `ConfirmDialog.tsx`, `ForceUpgradeScreen.tsx`, `OfflineBanner.tsx`, `ProfileFormFields.tsx`, `SplashScreen.tsx`, `TermsOverlay.tsx`, `TrialBanner.tsx`, `appVersion.ts`, `codeLookup.ts`, `paymentMethods.ts`, `teamMetrics.ts`, `useCodeLookupCache.ts`, `useMinVersion.ts`, `useOfflineQueue.ts`, `useSavePassword.ts`, `pushNotifications.ts`, `scripts/*`) — **all present**.

### Files present but NOT in D4 §2
- `index.ts`, `App.tsx`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, `eas.json`, `app.json`, `.npmrc` — standard Expo/RN tooling/config. Not a spec violation.
- **FLAG (LOW):** `App.tsx` exists at the project root *alongside* the Expo Router `app/` tree — a non-standard dual-entry pattern. The actual entry is `index.ts`. This should be confirmed in an EAS build (it does not break Metro locally).

### Edge Function directories
15 directories present: the **11 D10-specified functions** + 4 extras (`claude-proxy`, `whisper-proxy`, `embedding-proxy`, `delete-account`). All four extras appear in the D4 §2 v1.2 tree — compliant.

### Migrations
- **`supabase/migrations/` holds 11 files** (`00001`–`00011`), not the 10 a prior internal draft recorded. `00011_storage_buckets.sql` (job-photos + profile-assets buckets) was added on 22 May 2026 12:40.
- **FLAG (see Issue #1, Section 13):** `00011_storage_buckets.sql` is **git-ignored and uncommitted**. The root `.gitignore` was recently changed to ignore `supabase/`, so this and any future migration/function escapes version control.

**Section 1 verdict: COMPLIANT** with D4 §2 v1.2 — every spec'd file exists, no rogue files. Two flags: the `App.tsx` dual-entry (LOW), and migration `00011` being uncommitted (process — Issue #1).

---

## SECTION 2 — TECHNOLOGY STACK AUDIT

`package.json` cross-referenced against **D4 §1 v1.1** (the amended stack table).

### Installed dependencies

| Package | Version | Role in TradesBrain | D4 §1 v1.1 |
|---|---|---|---|
| expo | ^55.0.24 | Expo SDK runtime | ✅ SDK 55 (v1.1 amendment) |
| react / react-dom | 19.2.0 | UI runtime | ✅ React 19 |
| react-native | 0.83.6 | Mobile framework | ✅ RN 0.83 |
| typescript | ~5.9.2 (dev) | Type safety | ✅ 5.x |
| nativewind | ^4.2.3 | Tailwind for RN | ✅ NativeWind 4.x |
| tailwindcss | ^3.3.2 | NativeWind dependency | ✅ |
| @react-navigation/native · native-stack · bottom-tabs | ^7.x | Navigation | ✅ React Navigation v7 |
| (expo-router) | via expo SDK 55 | File-based routing | ⚠️ no explicit entry — PKG-1 |
| @supabase/supabase-js | ^2.105.3 | Backend/DB client | ✅ |
| expo-av | ^16.0.8 | Voice recording (.m4a) | ✅ |
| expo-image-picker | ~55.0.20 | Camera/photo | ✅ |
| expo-image-manipulator | ~55.0.16 | Photo compression | ⚠️ not in D4 §1 table (PKG-2) |
| expo-print | ~55.0.15 | PDF generation | ✅ (v1.1 amendment — replaced react-pdf) |
| @stripe/stripe-react-native | 0.63.0 | Payments | ✅ |
| expo-secure-store | ~55.0.14 | JWT / credential storage | ✅ |
| expo-notifications | ~55.0.23 | Push notifications | ⚠️ not in D4 §1 table (PKG-2) |
| expo-sharing | ~55.0.19 | Native share sheet | ⚠️ not in D4 §1 table (PKG-2) |
| @react-native-community/netinfo | 11.5.2 | Network state (NetworkContext) | ⚠️ not in D4 §1 table (PKG-2) |
| @react-native-google-signin/google-signin | ^14.0.0 | Google OAuth (native) | ⚠️ not in D4 §1 table (PKG-2) |
| @react-native-async-storage/async-storage | 2.2.0 | Non-secure local cache (OTP lockout, drafts, code-lookup cache) | ⚠️ not in D4 §1 table (PKG-2) |
| expo-constants · expo-dev-client · expo-font · expo-linking · expo-status-bar · expo-web-browser | ~55.x | Expo support modules | ⚠️ transitive/support — not enumerated |
| react-native-reanimated 4.2.1 · react-native-worklets 0.7.4 · react-native-screens · react-native-safe-area-context · react-native-web | mixed | RN/Nav/web transitive deps | ⚠️ transitive |
| @expo/vector-icons | ^15.0.3 | Icons | ⚠️ not enumerated |
| @types/react (dev) · babel-preset-expo (dev) | ~19.x / ~55.x | Build tooling | ✅ both correctly in `devDependencies` |

### Findings
- **Every package explicitly named in the D4 §1 v1.1 stack table is installed at a compliant version.** No required stack technology is missing.
- **PKG-1 (LOW, accepted):** `expo-router` has no explicit `package.json` entry — it resolves transitively via the `expo` SDK 55 meta-package. Per project history an explicit entry broke the EAS install phase and was reverted. Working configuration; documentation should note it.
- **PKG-2 (LOW, doc-only):** the D4 §1 stack table is **stale** — it omits `expo-image-manipulator`, `expo-notifications`, `expo-sharing`, `netinfo`, `google-signin`, and `async-storage`, all of which are legitimately installed and used by spec'd features (photo compression, push, share, NetworkContext, Google OAuth, offline caches). This is a documentation amendment, not a code defect.
- **PKG-3 (MEDIUM, mitigated):** `react-native-worklets` is a known Android EAS-build OOM risk on multi-ABI prebuilds. Mitigated in `eas.json` (`resourceClass: large` + single-ABI `arm64-v8a`). Confirmable only by the next EAS Android build.
- **PKG-4 (MEDIUM, process):** **no automated test framework is installed** (no Jest/Vitest/Detox/Playwright). D8's 232 test cases are therefore an entirely manual QA exercise. This appears to be a founder scoping decision; flagged for visibility.
- **No package is installed that is forbidden by D4 §1.** No `react-pdf` (correctly — replaced by `expo-print`).

**Section 2 verdict: COMPLIANT.** The core stack matches D4 §1 v1.1 at correct versions. Residuals are a stale §1 doc table (PKG-2), the `expo-router` resolution detail (PKG-1), and the absence of a test framework (PKG-4).

---

## SECTION 3 — SUPABASE DATABASE AUDIT

> **Basis:** the **11 committed-or-on-disk migrations** (`00001`–`00011`). Whether they are *applied* to the live database **CANNOT be verified** — no live DB or CLI access. Findings describe the **intended end-state** if all 11 migrations run in order. **Migration `00011` is uncommitted (Issue #1) and, like `00010`, presumed not yet pushed.**

### 3.1 Table scorecard (intended end-state after all 11 migrations)

| Table | Exists | Columns match D5 | CHECKs | RLS On | RLS policies | Indexes | Triggers |
|---|---|---|---|---|---|---|---|
| `users` | YES | YES | YES | YES | `users_own_select`/`_insert`/`_update` (split, 00009) + `users_team_owner_read` (00004) — **no DELETE policy** | 3 (UNIQUE-corrected 00008) | `users_updated_at`, `lock_vat_number`, `lock_kyc_fields` |
| `team_members` | YES | YES | n/a (no CHECKs in D5) | YES | 4 split policies (select/insert/update/delete, 00008) | none (D5-compliant) | none |
| `job_sessions` | YES | YES | YES | YES | `FOR ALL` USING+WITH CHECK (00007) + `_team_owner_read` (00004) | 3 | `job_sessions_updated_at` |
| `messages` | YES | YES | YES | YES | `FOR ALL` USING+WITH CHECK (00007) + `_team_owner_read` (00004) | 2 | none |
| `job_reports` | YES | YES | YES | YES | `FOR ALL` USING+WITH CHECK (00007) + `_team_owner_read` (00004) | 2 | `lock_finalised_report` |
| `quotes` | YES | YES | YES | YES | `FOR ALL` USING+WITH CHECK (00007) + `_team_owner_read` (00004) | 2 | `lock_finalised_quote` |
| `worker_preferences` | YES | YES | YES | YES | `FOR ALL` USING+WITH CHECK (00007) | none (D5-compliant) | `worker_preferences_updated_at` |
| `subscriptions` | YES | YES | YES | YES | `FOR ALL` USING+WITH CHECK (00009) | 2 | none |
| `billing_history` | YES | YES | n/a | YES | `FOR ALL` USING+WITH CHECK (00009) | none (D5-compliant) | none |
| `code_chunks` | YES | YES | YES | YES | `code_chunks_read` (SELECT, authenticated) | HNSW + trade_type | none |
| `code_documents` | YES | YES | n/a | YES | `code_documents_read` (SELECT, authenticated) | UNIQUE(short_name,version) | none |
| `app_config` (D5 v1.2 extra) | YES | YES | YES | YES | `app_config_read` (public SELECT) | n/a | none |
| `audit_logs` (extra) | YES | undocumented in D5 | n/a | YES | `audit_logs_service_only` (`USING (false)`) | none | none |

**All 11 D5 application tables + `code_chunks` + `app_config` (D5 v1.2) are created — 13 tables, matching D5 §1's stated count.** A 14th table, `audit_logs`, also exists (see below). All columns match D5 types exactly, including the amendment columns `users.is_suspended` (00005), `users.expo_push_token` (00008), and `worker_preferences.default_payment_methods` (00006). **No column type deviations.** Amendment columns are appended via `ALTER TABLE` so their physical order differs cosmetically from D5's in-line CREATE — functionally identical.

### 3.2 RLS analysis
- The original `00001` shipped the 5 user-owned `FOR ALL` policies as **USING-only** (no `WITH CHECK` → INSERT bypass) and 3 indexes as non-UNIQUE. Migrations `00007` (job_sessions, messages, job_reports, quotes, worker_preferences), `00008` (users, team_members + UNIQUE indexes), and `00009` (subscriptions, billing_history + users split) **systematically remediate all of this**. End-state has `USING` + `WITH CHECK` on every client-writable table.
- `users` has **no DELETE policy** — a deliberate deviation from D5 §2 (which lists `DELETE: auth.uid() = id`). `00009` removes it so client deletes are blocked; the service-role `delete-account` Edge Function is the only deletion path. Intentional hardening; documented in-migration.
- **The end-state is RLS-compliant ONLY IF `00007`–`00010` are applied to the live DB. This cannot be confirmed here.**

### 3.3 Extensions, RPCs, triggers (verified verbatim from migration SQL)

**pgvector** — `00001` line 4, first statement: `CREATE EXTENSION IF NOT EXISTS vector;` — **YES**.

**`match_documents()` RPC — present, matches D5 §11 verbatim:**
```sql
CREATE OR REPLACE FUNCTION match_documents(query_embedding vector(1536), filter_trade_type text, match_count int DEFAULT 5)
RETURNS TABLE(id uuid, content text, section_number text, document_name text, version text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN RETURN QUERY
  SELECT c.id, c.content, c.section_number, c.document_name, c.version,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.code_chunks c
  WHERE c.trade_type = filter_trade_type
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END; $$;
```

**`update_updated_at()` trigger — present:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- + job_sessions_updated_at, worker_preferences_updated_at
```

**`prevent_finalised_update()` trigger — present** on `job_reports` + `quotes`. Exception text was corrected by `00009` (ISS-30) to match D5 §6:
```sql
CREATE OR REPLACE FUNCTION prevent_finalised_update() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'finalised' THEN
    RAISE EXCEPTION 'Cannot modify a finalised report';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER lock_finalised_report BEFORE UPDATE ON public.job_reports FOR EACH ROW EXECUTE FUNCTION prevent_finalised_update();
CREATE TRIGGER lock_finalised_quote  BEFORE UPDATE ON public.quotes      FOR EACH ROW EXECUTE FUNCTION prevent_finalised_update();
```

**`decrement_trial_query(user_id)` RPC — present** (`00001`), matches D10 §2.3. **`00010` adds the previously-missing GRANT** — the only GRANT statement in any migration:
```sql
CREATE OR REPLACE FUNCTION decrement_trial_query(user_id uuid) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE new_count integer;
BEGIN
  UPDATE public.users SET trial_queries_remaining = GREATEST(trial_queries_remaining - 1, 0)
  WHERE id = user_id RETURNING trial_queries_remaining INTO new_count;
  RETURN new_count;
END; $$;
GRANT EXECUTE ON FUNCTION decrement_trial_query(uuid) TO authenticated;   -- 00010
```

**VAT / KYC locking triggers:**
- `lock_vat_number` (00002) — locks `vat_number` unconditionally once non-empty. Matches D5 §2.
- `lock_kyc_fields` (00008, body replaced by `00010`) — `prevent_kyc_field_update()` now locks `license_number` unconditionally, but `license_proof_url` / `national_id_url` **only once that document's `*_kyc_status = 'verified'`**. This is the correct D5 §2 behaviour ("immutable after kyc_status = verified") and unblocks the Settings → Profile re-upload fallback for rejected documents. The `00008` interim version (unconditional URL lock) was a D5 deviation; `00010` fixed it.

### 3.4 Deviations / gaps
| # | Severity | Finding |
|---|---|---|
| DB-1 | INFO | `users` has no DELETE RLS policy — deliberate deviation from D5 §2, hardening (service-role-only deletion). |
| DB-2 | INFO | `audit_logs` is named in D5 §1's table index but D5 has **no column table, no CREATE statement, no RLS spec** for it. The migration's `audit_logs` schema is plausible but **unverifiable against D5** — D5 is incomplete here, not the build. |
| DB-3 | LOW | `app_config` SELECT policy is named `app_config_read`; D5 v1.2 names it `app_config_public_read`. Behaviour identical (public read). Cosmetic. |
| DB-4 | LOW | `app_config` seed uses `VALUES (true)` relying on the column DEFAULT; D5 v1.2 writes `VALUES (true, '1.0.0')` explicitly. Same result. |
| DB-5 | LOW (verify live) | RLS / index / GRANT correctness depends on `00007`–`00011` being *applied*. Confirm with `supabase db push` against project `quvcparzpurwwkrxpiki`. |
| DB-6 | INFO | `team_members` has no indexes; `member_id`-based RLS lookups are unindexed — a scale-time performance note, D5-compliant (D5 §14 lists no indexes for it). |

**Section 3 verdict: COMPLIANT (intended end-state).** All 13 D5 tables (+ `audit_logs`), all columns/types/CHECKs, RLS-with-CHECK, both RPCs (`match_documents`, `decrement_trial_query`) + the GRANT, pgvector, and all four triggers (`update_updated_at`, `prevent_finalised_update`, `lock_vat_number`, conditional `lock_kyc_fields`) are present and faithful to D5 v1.2. **Every "applied to the live DB" claim still requires live confirmation.**

---

## SECTION 4 — EDGE FUNCTIONS AUDIT

> **Deployment status CANNOT be confirmed** — only source was read. D10 specifies **11** functions; the repo contains **15** (the 11 + extras `claude-proxy`, `whisper-proxy`, `embedding-proxy`, `delete-account`). The implemented build is a **deliberately hardened rewrite** of the D10 reference code — functions carry explicit `ISS-*`/`EF-*`/`CC-*` fix markers. Several functions were modified by prior remediation rounds; whether the *current* source is *deployed* is unknown — treat the "Deployed" column as **"source state — deployment unverified"**.

| # | Function | Deployed | Matches D10 | Auth method | Notes |
|---|---|---|---|---|---|
| 1 | handle-stripe-webhook | unverified | YES (hardened) | Stripe-Signature ✓ (`constructEventAsync` before any processing) | `subscriptionRowStatus()` maps every Stripe status → CHECK-valid `active/cancelled/expired/past_due` before the `subscriptions` write (ISS-H1 — closes a real D10 reference-code bug). **Residual (LOW):** the separate `users.subscription_status` `statusMap` emits `trial` for `incomplete` while `subscriptionRowStatus` emits `expired` — the two tables diverge for an `incomplete` subscription (Issue #5). |
| 2 | kyc-status-check | unverified | PARTIAL (superset) | User JWT ✓ | D10 spec is read-only; the build additionally **mints a Stripe Identity session** on a `verify_document` request — an intentional extension. Needs `STRIPE_SECRET_KEY` (not in D10's env list for this function). |
| 3 | decrement-trial-query | unverified | YES | User JWT ✓ | Active subscriber → `{queries_remaining:null}`; exhausted → 0; else atomic `decrement_trial_query` RPC. Faithful to D10. |
| 4 | kyc-webhook | unverified | YES | Stripe-Signature ✓ (`STRIPE_IDENTITY_WEBHOOK_SECRET`) | Verifies signature before processing; handles `verified` / `requires_input` / `processing`; pushes on full-verify / rejection. |
| 5 | stripe-create-checkout | unverified | PARTIAL (improved) | User JWT ✓ | KYC gate (both docs `verified` else 403 `kyc_required`); already-subscribed → 409. Creates a `default_incomplete` subscription and returns `client_secret` from `latest_invoice.payment_intent` (cleaner than D10's setupIntent+subscription); returns all 4 D10 fields. Malformed body → clean 400 (EF-6). |
| 6 | stripe-update-subscription | unverified | YES | User JWT ✓ | 5 actions (`upgrade/downgrade/switch_annual/add_seat/remove_seat`) with proration; `add_seat` enforces the ≥10-member cap. Malformed body → 400 (EF-6). |
| 7 | create-team-member | unverified | PARTIAL (hardened) | Team-owner JWT ✓ (+ `plan_type='team'` AND `subscription_status='active'`) | Body validated up-front; `users`/`team_members` inserts error-checked → rollback (ISS-H2). **Does NOT email a plain-text temp password** (D10 reference code did — a real flaw); instead mints a single-use Supabase recovery link (ISS-10). SMS via Twilio. **Reads new `TWILIO_*` secrets; does NOT read `APP_URL`** (D10 listed it). |
| 8 | delete-team-member | unverified | PARTIAL | Team-owner JWT ✓ | Requires `confirmation:"DELETE"`; cascade delete order matches D10. **Residual gap (LOW):** `await req.json()` is NOT wrapped in try/catch — a malformed body throws → unhandled 500 instead of a clean 400. Every other rewritten function received this fix; this one was missed (Issue #4). |
| 9 | calculate-days-remaining | unverified | YES | User JWT ✓ | Trial → `{days_remaining:null}`; else days from `subscription_end_date` + billing context. |
| 10 | send-push-notification | unverified | PARTIAL | **Service-role key check ✓** | Full `authToken !== SERVICE_ROLE_KEY` equality check → 401 (ISS-M6/EF-3 — closes a real D10 bug where the reference code's `if` block had an empty body and enforced nothing). Notification-type catalogue differs slightly from D10 (`subscription_expiring`/`trial_ending`/`team_member_added` added; D10 `sms_credentials` branch removed). Cosmetic. |
| 11 | ingest-code-document | unverified | PARTIAL | Service-role key check ✓ | ~500-word/50-overlap chunking; batched `text-embedding-3-small` embeddings; **409 duplicate guard** on `short_name+version` (ISS-M7/EF-4). Deviations: accepts `content` *or* `text_content`; success status 201 (D10: 200); no 207 partial-success path (failed batches skipped after one retry). |
| — | **claude-proxy** (extra) | unverified | n/a | **User JWT ✓** | Verifies caller JWT via `auth.getUser()` → 401 if absent (ISS-H3 — closes the Anthropic cost-exposure gap). Assembles the Rex system prompt **server-side** from `prompts.ts`. Needs `SUPABASE_URL` + `SUPABASE_ANON_KEY` secrets for the JWT check. |
| — | **whisper-proxy** (extra) | unverified | n/a | User JWT ✓ | Proxies OpenAI `/audio/transcriptions` (`whisper-1`). |
| — | **embedding-proxy** (extra) | unverified | n/a | User JWT ✓ | Proxies OpenAI `/embeddings` (`text-embedding-3-small`). |
| — | **delete-account** (extra) | unverified | n/a | User JWT ✓ | Self-service account deletion; clears all 4 storage buckets (`kyc-documents`, `job-documents`, `job-photos`, `profile-assets`) (EF-7), then `public.users` (FK cascade) + `auth.users`. |

### Environment variables
Each function reads its secrets from `Deno.env`. **Whether they are *set* on the live project cannot be verified.** Notable: `claude-proxy` needs `SUPABASE_URL` + `SUPABASE_ANON_KEY` (for the JWT check); `create-team-member` needs `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER` (not in D10's master env list).

### Webhook signature verification — confirmed
Both `handle-stripe-webhook` and `kyc-webhook` read the raw request body and call `stripe.webhooks.constructEventAsync(body, signature, <secret>)` **before any database work**, rejecting a missing signature (401) or a verification failure (400). Separate secrets for billing vs Identity. **Compliant with D10's critical rule and CLAUDE.md rule 5.**

**Section 4 verdict: COMPLIANT (source) — DEPLOYMENT UNVERIFIED.** All 11 D10 functions + 4 extras are present. The build is a hardened rewrite that fixes several real D10 reference-code defects (silent CHECK violation, unauthenticated proxy, unenforced push-notification auth, plain-text password email). Two residual code items: the `delete-team-member` malformed-body gap (Issue #4, LOW) and the `handle-stripe-webhook` status-map divergence for `incomplete` (Issue #5, LOW). **Critical operational dependency: the current source must be deployed and all secrets set — none of this is confirmable from the repo.**

---

## SECTION 5 — AI OPTIMISATION LAYER AUDIT

All five D4 §3 files exist in `services/` (per the D4 §2 v1.1 amendment). Logic verified verbatim.

| File | Exists | Matches D4 §3 | Wired into every Claude call | 
|---|---|---|---|
| `services/router.ts` | YES | YES | YES — called first in `streamRexResponse` |
| `services/summariser.ts` | YES | YES | YES — triggered in `useRexSession` |
| `services/imageCompression.ts` | YES | YES | YES — called in `usePhotoCapture` |
| `services/ragInjector.ts` | YES | YES | YES — via `services/rag.ts` |
| `services/tokenEstimator.ts` | YES | n/a | **NO — dead code (Issue #6, LOW)** |
| `constants/limits.ts` | YES | YES | YES |

### router.ts (D4 §3.1) — verbatim
```ts
export function routeModel(ctx: MessageContext): string {
  if (ctx.sessionStage <= 2) return 'claude-sonnet-4-6';
  if (ctx.sessionStage === 4) return 'claude-sonnet-4-6';
  if (ctx.messageType === 'lookup') return 'claude-sonnet-4-6';
  if (ctx.messageType === 'diagnosis') return 'claude-sonnet-4-6';
  return 'claude-haiku-4-5-20251001';
}
```
- **Sonnet** assigned to: **stages 1 & 2** (`<= 2`), **stage 4**, `messageType === 'lookup'` (code lookup), `messageType === 'diagnosis'`. ✅ matches D4 §3.1.
- **Haiku** is the fallthrough: stages 3 & 5, formatting, confirmations, summarisation. ✅ matches D4 §3.1.
- **Deviation (LOW, doc-only):** the model IDs are `claude-sonnet-4-6` and `claude-haiku-4-5-20251001`. D4 §1/§3.1 still cite the older `claude-sonnet-4-5-20250929`. The code's IDs are the current correct ones (a deliberate `ISS-18` upgrade to Sonnet 4.6); **D4 should be amended**. Minor cosmetic inconsistency: the Sonnet ID has no date suffix while the Haiku ID does.

### summariser.ts (D4 §3.2) — verbatim
- `shouldCompress(messageCount)` returns `messageCount > 10` → **compression first triggers at message 11**. ✅
- `compressHistory`: `toCompress = messages.slice(0, -3)`, `recent = messages.slice(-3)` → **last 3 messages always kept raw**. ✅
- Compression runs on Haiku (`claude-haiku-4-5-20251001`, `max_tokens: 800`). ✅
- **Re-summarisation every 8 messages:** implemented in `useRexSession.ts` — `RESUMMARISE_EVERY = 8`; a cached summary is reused while `history.length - cache.atCount < 8`, else `compressHistory` re-runs. ✅ matches D4 §3.2.
- **No deviation.**

### imageCompression.ts (D4 §3.3) — verbatim
```ts
if (stage <= 1) return { quality: 0.6, maxDimension: 1024 };
if (stage === 2) return { quality: 0.5, maxDimension: 800 };
return { quality: 0.4, maxDimension: 600 }; // stages 3-5
```
- Stage 1: **60% / 1024px** ✅ · Stage 2: **50% / 800px** ✅ · Stage 3+: **40% / 600px** ✅. **No deviation.**

### ragInjector.ts (D4 §3.4) — verbatim
```ts
if (messageType === 'report' || messageType === 'quote') return 0;
if (stage <= 2) return 5;
return 2;
```
- Stages 1–2: **5 chunks** ✅ · Stages 3–5: **2 chunks** ✅ · report/quote: **0 chunks** ✅. **No deviation in the function.**
- **Observation (INFO):** the Rex-session turn (`useRexSession`) always calls `retrieveCodeContext(..., 'diagnosis')` — so from the Rex path the chunk count is driven purely by stage (5/2). The `report`/`quote` → 0 branch is exercised only from the document builders, which is the correct place for it. Not a defect.

### limits.ts (D4 §3.5)
- `SESSION_SOFT_CAP = 30` ✅ (exact D4 §3.5 value)
- `SESSION_WARNING_AT = 28` ✅ (exact D4 §3.5 value)
- **Both match D4 §3.5 exactly.** The soft cap is intentionally **not a hard stop** — it follows D6 Flow04 (warn + offer linked session) over D4 §3.5's literal `promptNewLinkedSession()`. Accepted intentional behaviour.

### tokenEstimator.ts
- The file exists and exports `estimateTokens` / `estimateImageTokens` / `estimateMessageCost`. **A full-codebase grep finds no `import` of it anywhere** — the only reference is a comment in `app/_layout.tsx`. It is **shipped but unused dead code** (Issue #6, LOW). D4 §2/§3 list it, so it cannot simply be deleted without a doc amendment — recommend wiring it into cost telemetry or formally dropping it from D4.

**Section 5 verdict: COMPLIANT.** All five optimisation files exist with logic that matches D4 §3 exactly; the four functional files are correctly wired into the Claude path. Residuals: `tokenEstimator.ts` is unused (Issue #6, LOW), and D4 §1/§3.1's model ID is stale (doc-only).

---

## SECTION 6 — AUTHENTICATION & SIGN-UP AUDIT (M1)

### Sign-up form (`app/(auth)/signup.tsx`) vs D1 §7
- **Step 1 — Account Basics:** full name, email, password (≥8 chars, strength meter), phone (country code + local number). ✅ matches D1 §7 Step 1.
- **Step 2 — Trade Profile:** trade type (Plumber/Electrician/HVAC/Roofer/Other), account type (Solopreneur/Team Owner), hourly rate, VAT number (labelled "locked after account creation"). ✅ matches D1 §7 Step 2.
- **Step 3 — Identity & Company:** license proof photo (required), license number (required), national ID photo (required), company name (optional), company logo (optional) + a read-only review summary card. ✅ matches D1 §7 Step 3.
- **No required field missing; no extra field beyond spec.** Field allocation matches D1 §7.
- **Create Account gated:** `allValid = step1Valid && step2Valid && step3Valid`; the button is `disabled={!allValid || submitting}`. ✅
- **VAT lock:** enforced at the DB level by trigger `lock_vat_number` (00002). ✅
- Sign-up draft persists in AsyncStorage; **password is deliberately never persisted**.

### OTP verification (`app/(auth)/otp-verify.tsx`)
- Email OTP + SMS OTP **on a single screen** (two `OtpRow` components). ✅
- **Both required** — `createUserProfile` only fires once `emailVerified && phoneVerified`. ✅
- **Resend per channel after 60s** — independent `emailCooldown`/`phoneCooldown`, `RESEND_COOLDOWN_S = 60`. ✅
- **3× wrong → 5-minute lockout** — `MAX_WRONG = 3`, `LOCKOUT_S = 300`, persisted to AsyncStorage and restored on mount. ✅
- **Expiry handling** — `isExpiredOtpError()` detects an expired code; it shows "Code expired" and **does not consume a lockout attempt**. ✅
- **Deviation (LOW):** the OTP input is one field per channel, not the 6-box pattern shown in D6 Flow01. Functionally equivalent.

### Terms & Conditions
- `TermsOverlay` is a full-screen scroll-to-end gate; Create Account opens it and `onAgree` runs account creation. ✅
- Acceptance stored: `createUserProfile` writes `terms_accepted_at` (ISO timestamp) and `terms_version` (`'v1.0'`) to the `users` row. ✅

### KYC
- License + national ID photo upload required at sign-up; uploaded to the `kyc-documents` bucket. ✅
- Both KYC status columns seeded `pending`; `initiateKycVerification()` is a fire-and-forget call that mints two Stripe Identity sessions (national ID + license). ✅ — matches the **canonical CC-1 behaviour** (D1 §6 ISS-37 amendment: KYC auto-initiated at sign-up completion).
- 10 trial queries available immediately — via the `users.trial_queries_remaining` DB default of 10. ✅

### Sign-in (`app/(auth)/signin.tsx`)
- **Method 1** email + password ✅ · **Method 2** Google OAuth (native `@react-native-google-signin` + `signInWithIdToken`) ✅ · **Method 3** phone + OTP ✅ — all three on one screen with equal prominence. ✅
- **Forgot password** flow present (`forgot-password.tsx`, with confirm-new-password field). ✅
- **Save Password toggle** (Expo SecureStore via `useSavePassword`) — **off by default** (`useState(false)`). ✅
- **Session persistence / auto sign-in** — `AuthContext` uses `supabase.auth.getSession()` + `onAuthStateChange`. ✅

### Error states (D2 Sign-In edge cases)
| State | Status | Note |
|---|---|---|
| Wrong password | ✅ inline banner | Supabase returns a generic invalid-credentials error for both wrong-password and unknown-email; honestly presented as a credentials error with a "Reset password" action. |
| Account not found + create link | ✅ | When the error code is explicitly `user_not_found` → "No account found" + "Create an account" action. |
| 15-minute lockout + countdown | ✅ | Sign-in: `MAX_FAILED = 5`, `LOCKOUT_MS = 15 min`, persisted, inline countdown. |
| Account suspended | ✅ | `user_banned`/"suspended" → message; also caught post-login by `AccountSuspendedScreen` (gated on `users.is_suspended`). |
| No internet | ✅ | Network errors show an inline banner and **do not count toward the lockout**; entered details preserved. |
| Phone not registered | ✅ | `signInWithPhoneStart` passes `shouldCreateUser:false` so phone sign-in no longer silently creates an account — the "phone not registered" path is reachable. |

### Post sign-in routing
- Active subscription → Home, full access. ✅
- Trial with queries → Home + trial banner (`TrialBanner`). ✅
- Expired → Home; paywall fires on a feature tap. ✅ — **Deviation (LOW):** the expired-state Home does **not** visually grey out the feature buttons (D2 says "all feature buttons disabled"); the paywall still correctly intercepts on tap, so the gate is functionally enforced (Issue #11, LOW).

### Home screen
- All **6 bottom-nav tabs** present: Home · Rex · Report · Quote · Codes · History. ✅ matches D2 NAVBAR.
- **Deviation (LOW):** tab icons are emoji rather than designed icons (D6 polish item).

### D6 Flow01 / Flow02 wireframe compliance
Functionally compliant on the happy path. Residual visual deviations (all LOW): country code is a free-text field rather than a flag picker; OTP is one input per channel not 6 boxes; no "attempts remaining" counter; expired-Home does not grey buttons; emoji tab icons. None affect function.

**Section 6 verdict: SUBSTANTIALLY COMPLIANT.** The auth system implements every D1 §7 / D2 requirement functionally — 3-step gated sign-up, dual OTP with lockout and expiry handling, Terms storage, canonical KYC auto-initiation, three sign-in methods, error states as inline banners, session persistence. Residuals are LOW visual wireframe-polish items.

---

## SECTION 7 — REX DIAGNOSTIC AUDIT (M2)

> Rex's *runtime* behaviour (whether Claude actually obeys the prompts) **cannot be assessed statically** — the items below verify that the *mechanics and prompts* are in place. Adherence is **CANNOT DETERMINE (runtime)**.

### Session opening
- `openSession()` sends a priming instruction telling Claude to ask all **6 context questions** (3 universal + 3 trade-specific) **in one natural professional message**. The "SESSION OPENING — MANDATORY CONTEXT CAPTURE" block lives server-side in `claude-proxy/prompts.ts`. The 6-question content is server-side and not in the client bundle — count and natural-message formatting are **runtime-verified only**.

### D7 principles 1–15
All 15 principles are encoded in the server-side trade prompts in `claude-proxy/prompts.ts`. The Plumber prompt (`PLUMBER_V2`) carries the full MATERIALS KNOWLEDGE + MATERIALS RULE block (a prior HIGH gap, since fixed). Principles 6 (pushback) and 11 (apprentice) additionally have client-side mechanics.

| # | Principle | Status | How |
|---|---|---|---|
| 1 | Ambiguity — Rex states what it needs | IMPLEMENTED (prompt) | "PHOTO LIMITATIONS" + "you never guess" |
| 2 | Response sequence | IMPLEMENTED (prompt) | "RESPONSE STRUCTURE — ALWAYS FOLLOW THIS SEQUENCE" |
| 3 | Knowledge limits | IMPLEMENTED (prompt) | "state the uncertainty… never fabricate" |
| 4 | Code compliance + AHJ note | IMPLEMENTED (prompt) | CODE RULE + AHJ line |
| 5 | Safety last / gas leak first | IMPLEMENTED (prompt) | "SAFETY FORMAT … LAST"; gas-leak STOP exception |
| 6 | Worker pushback (hold once, adopt on insistence) | IMPLEMENTED (prompt + client) | Two-step; counter resets per diagnosis (on stage change) |
| 7 | Code authority hierarchy | IMPLEMENTED (prompt) | "latest standard edition" + edition deltas |
| 8 | Cross-trade boundary | IMPLEMENTED (prompt) | "CROSS-TRADE BOUNDARY" block, all 4 prompts |
| 9 | Scope escalation | IMPLEMENTED (prompt) | Safety rule + `found_issue` action |
| 10 | Worker sovereignty | IMPLEMENTED (prompt) | "WORKER SOVEREIGNTY — LOCKED" block |
| 11 | Apprentice mode | IMPLEMENTED (prompt + client) | Ask-once, Yes/No panel, no-repeat; detection regex is brittle (LOW) |
| 12 | Materials | IMPLEMENTED (prompt) | MATERIALS KNOWLEDGE/RULE present in all 4 trade prompts incl. Plumber |
| 13 | Session opening (6 questions) | IMPLEMENTED (prompt + client) | 6-question opener |
| 14 | Continuous clarification | IMPLEMENTED (prompt) | Not gated to intake |
| 15 | Stage progression | IMPLEMENTED (prompt) | "flag the issue, deliver the next step" |

**All 15 are encoded. Whether Claude obeys them at runtime is CANNOT DETERMINE — requires a live-AI QA pass.**

### Five stages
- Stage tracking via `[[STAGE:n]]` markers emitted by Rex, parsed and stripped in `anthropic.ts`, **forward-only**. ✅
- A **①→⑤ stage progress strip** + a **header stage pill** ("Stage N · Context/Diagnosis/Steps/Final check/Close") are rendered. ✅
- Each stage has contextual buttons (`ContextualButtons.tsx`). **Deviation (disclosed in code, LOW):** the component's own comment states these are "REACTION buttons", **not** the verbatim D6 Flow04 input-gathering button set; an earlier "D6 canonical" claim was retracted in the comment. The input-gathering actions are covered by the always-present voice/photo/text controls. Honest, documented deviation.
- **Close Job visible from Stage 1** — the header Close Job button shows whenever `!closed`. ✅
- **Report + Quote buttons appear ONLY after Close Job** — `canShowReportQuote: state.closed`. ✅
- Worker can skip any stage (forward-only stage marker; prompts instruct Rex to adapt). ✅

### Worker pushback protocol (D7 Principle 6)
- **Two-step protocol implemented.** First press → Pushback A ("hold the diagnosis, ask one specific confirming input, then adapt if my view stands"); second press → Pushback B ("adopt my position and proceed"). The assistant turn is tagged `[[PUSHBACK:n]]` and styled amber (hold) / green (adopt) in `MessageBubble`.
- The pushback counter **resets on any stage change** — pushback is per-diagnosis, not session-global. ✅
- vs D6 Flow04 Pushback A/B screens: **functional match, visual partial** — generic contextual buttons, not the dedicated two-option screens. LOW.

### Apprentice mode (D7 Principle 11)
- Detection: regex `/walk through each step/i` against Rex's own output → triggers an ask-once Yes/No panel.
- Two paths (expanded / standard); the question is not repeated in the same session. ✅
- **Deviation (LOW):** detection is text-pattern-based on Rex's output, not a structured signal — brittle. The question is shown in both the message bubble and the panel (accepted, code-commented).

### Inputs
- **Voice (`expo-av`)** ✅ · **Whisper transcription** (`whisper-proxy`, `whisper-1`) ✅ · **editable transcript** before send (raw kept as `transcriptOriginal`, edits as `transcriptEdited`) ✅ · **photo capture** ✅ · **stage-aware compression** wired (`photo.capture(stage)` → `getCompressionSettings`) ✅ · **text input always available** ✅.
- **Deviation (LOW):** single photo per message; multi-photo (D2 "multiple photos in a single message") is not built.

### API calls
- **All Claude calls route via the `claude-proxy` Edge Function.** ✅ No direct Anthropic calls; no API key in the bundle.
- **Anthropic API key never in mobile app files** — verified by grep (Section 11). ✅
- **Streaming — DEVIATION (accepted, disclosed):** `anthropic.ts` does a **buffered fetch then a simulated word-by-word reveal**, not true SSE. The code comment explains RN `fetch` does not reliably expose a streaming body. The input bar still dims during the reveal. This is an accepted RN-platform limitation, honestly documented — not a hidden defect.
- `routeModel()` called before every Claude call. ✅
- Summariser triggers at message 11 (`shouldCompress` → `count > 10`). ✅
- `ragInjector` consulted every Rex turn. ✅

### Trial management
- `decrement-trial-query` Edge Function called **only after a successful response** (with one silent retry on failure). ✅
- The app **never modifies `trial_queries_remaining` directly** — verified. ✅
- Trial exhaustion: full response delivered, then an in-thread notice; the paywall preserves the session on dismiss. ✅

### Session management
- Sessions persisted to `job_sessions`; messages to `messages`. ✅
- Recap on Continue (reopened session). ✅
- **Soft-cap warning at message 28** — amber banner "message N of 30" + a "Start linked session" action. ✅
- **Linked session at message 30** — red banner; `startLinkedSession` creates a new `job_sessions` row with `parent_session_id` and a carried-over compressed summary. ✅ — soft cap is **not** a hard block (intentional, follows D6).
- **Note (accepted):** the Rex tab shows a "Continue session" banner for an active session — this contradicts D2's "abandoned sessions restart fresh" rule. Kept as a product decision (D2 to be amended).

### D7 safety — gas leak (Plumber)
- `PLUMBER_V2` instructs Rex to emit a bold `**STOP — POTENTIAL GAS PRESENCE**` block **before any diagnosis**; `MessageBubble` renders `**bold**`. **There is no deterministic client-side interlock** — emission depends on Claude obeying the prompt. **CANNOT DETERMINE (runtime).**

### Offline / error states
- Message queued offline + auto-send on reconnect (`useOfflineQueue`). ✅
- 30s Claude timeout handling (`CLAUDE_TIMEOUT_MS = 30000`, "tap to retry"). ✅
- Claude 5xx handling ("Rex is unavailable…"). ✅
- Whisper failure → fallback to text input. ✅ — all with D2-exact copy.

### D6 Flow04 wireframe compliance
Functional logic is strong (stage strip + pill, contextual buttons, Close-Job gating, pushback styling). Residual visual deviations (all LOW): no voice waveform; pushback uses generic buttons not dedicated two-option screens; single photo per message; streaming is simulated.

**Section 7 verdict: SUBSTANTIALLY COMPLIANT.** All 15 D7 principles are prompt-encoded, the 5-stage protocol and stage UI are built, pushback/apprentice mechanics are present, inputs and trial/session management match spec. **All D7 *adherence* and the gas-leak STOP block are runtime-dependent and CANNOT be confirmed without a live-AI QA pass.** Accepted deviations: simulated streaming, active-session banner.

---

## SECTION 8 — REPORT & QUOTE GENERATION AUDIT (M3)

> Per the D3/D2 v1.1 **accepted deviation**, report/quote generation is a **structured form** (section picker + editable preview + manual line items), not a conversational chat. This is an accepted product decision, not a defect.

### Report — Path A & Path B
- **Path A (from closed Rex session):** triggered by a `sessionId` route param. **Pre-loads job context** — fetches the session's `messages`, builds a transcript digest (capped ~4000 chars), and feeds it as `sessionContext` to the AI draft generator; also fetches `time_on_jobsite_seconds`. ✅
- **Path B (standalone from Report tab):** no `sessionId`; requires a typed job name; inserts a new `job_sessions` row with `session_source='report_standalone'`. ✅
- **Path B follow-up questions:** `generateReportContent` returns up to 3 follow-up questions, surfaced via a non-blocking alert after generation. **Deviation:** this is one-shot (draft + then show questions), not the conversational Q&A loop D2 describes — acceptable under the D3 structured-form deviation.
- Voice summary recording + Whisper, editable transcript — ✅.

### Quote — Path A & Path B
- Both implemented. **Path A** seeds a line item from the prior **finalised report's `confirmed_amount`** and uses `time_on_jobsite_seconds` for labour hours. **Deviation (LOW):** Quote Path A does **not** reuse the Rex *message transcript* (the report builder does) — it relies only on the report's confirmed amount + time. (Issue #9, LOW.)
- **Path B** has a job-description input (text + voice) to draft from.

### Both paths
- **Section picker** shown first time only; saved to `worker_preferences` (`onConflict: user_id,document_type`). ✅
- **VAT / license inclusion toggles** present (two `Switch` controls; persisted as defaults). ✅
- **Report preview fully editable inline** — every section is a `TextInput`; add/remove custom sections; reorder via move up/down arrows. ✅
- **Confirm permanently locks** — `confirmReport`/`confirmQuote` set `status='finalised'`; the DB trigger `prevent_finalised_update` blocks any subsequent UPDATE. An in-app `ConfirmDialog` ("This action permanently locks all sections") is shown first. ✅ — **the DB-level lock could not be runtime-tested (no live DB).**
- **Draft auto-discard on exit** — `nav.addListener('beforeRemove', …)` intercepts back-navigation with an unconfirmed draft, shows a discard `ConfirmDialog`, and on confirm hard-deletes the `status='draft'` row. Drafts never reach History. ✅
- **PDF via `expo-print`** (`Print.printToFileAsync`), stored in the **Supabase Storage `job-documents` bucket** at `${userId}/reports/${id}-v${version}.pdf`. ✅ (`expo-print` is the documented D4 v1.1 substitution for react-pdf.)
- **Native share sheet** — `services/share.ts` `sharePdf()` via `expo-sharing`. ✅
- **Versioning** — `nextVersion()` queries max `version_number` per session and increments; multiple reports/quotes per session are versioned. ✅
- **New archive entry created** for both paths. ✅

### AI content generation
- `services/documents.ts` has `generateReportContent()` and `generateQuoteContent()` — Haiku calls via `claude-proxy` that draft section content / quote line items + a labour estimate from the worker's summary, returning structured JSON. Both are **best-effort** — any failure falls back to the empty-form behaviour so document creation is never blocked. ✅
- **Deviation (LOW — Issue #7):** `documents.ts` `callClaudeJson()` **builds the Claude system prompt client-side**. CLAUDE.md rule 2 says system prompts are server-side only. These are document-drafting prompts (not Rex's diagnostic IP), so the security risk is low — but it is a divergence from the stated rule and should be reconciled (move to a server-side prompt, or formally scope rule 2 to Rex prompts only).

### Quote specifics
- Line items editable (name / qty / unit cost; line total auto-calculated `qty × unit cost`); add/remove rows. ✅
- **6 payment methods, multi-select** — `constants/paymentMethods.ts` lists exactly Cash, Bank transfer, Bank direct debit, Cheque, Online payment link, To be agreed; `PaymentMethodSelector` is multi-select; saved as a default preference. ✅
- **30-day default validity** — `DEFAULT_VALIDITY_DAYS = 30`, editable. ✅
- **Suggested range — DEVIATION (LOW):** the **Report** shows a min–max suggested range ("Rex suggests $X – $Y", min = labour, max = +30%). The **Quote builder shows no suggested min–max range** — only an auto subtotal and a static "15–30% markup" tip. D2/D3 describe a suggested *range* for the quote. (Issue #10, LOW.)

### Offline confirm
- `runConfirm` pre-checks connectivity and fails fast with a clear "you are offline — draft is saved" message. **Full auto-generate-on-reconnect is not implemented** (PARTIAL — deferred).

### D6 Flow05 / Flow06 compliance
Materially compliant: drafts are Rex-populated, Path B has follow-up questions, Path A reuses context, sections/line items/locking/discard/versioning all built. Residual deviations (LOW): reorder via arrows not drag; quote line delete is an `✕` button not swipe; report PDF lacks a dedicated Download control, a time-on-site line, and the company logo.

**Section 8 verdict: SUBSTANTIALLY COMPLIANT.** Both paths for both documents are built with AI-drafted content, section management, inline editing, permanent DB-trigger locking, draft discard, `expo-print` PDF + storage, share, and versioning. Residuals are LOW (Quote suggested-range absent, client-side draft prompt, Path-A quote transcript reuse, PDF polish). **AI draft *quality* and the DB lock are runtime-dependent — CANNOT DETERMINE.**

---

## SECTION 9 — TRADE CODE LOOKUP & RAG PIPELINE AUDIT (M4)

### RAG pipeline
- `ingest-code-document` Edge Function exists — service-role gated, ~500-word/50-overlap chunking, batched `text-embedding-3-small` embeddings, 409 duplicate guard, writes `code_chunks` + `code_documents`. ✅
- `scripts/ingest-code-document.js` + `scripts/extract-pdf-text.py` ingestion helpers exist. ✅
- `match_documents()` RPC is defined (Section 3) and called by the lookup path.
- **IPC 2021 ingestion — NOT DONE (Issue #2, HIGH-data).** There is no live DB to query, but there is **no migration seed, no fixture, and no evidence any code document has been ingested**. The ingestion machinery is complete; the *data* is not loaded. `code_chunks`/`code_documents` are presumed empty. **Code Lookup returns no real citations until a code document is ingested. M4 cannot be signed off until this is done.**

### Code lookup screen (`app/(tabs)/codes.tsx`)
- Voice input (`VoiceRecordButton` → Whisper) ✅ · text input ✅ · plain language, no special syntax ✅ · trade badge from profile ✅.

### Response format
- **Plain-language answer first**, then a "Citations" section of `CitationCard`s. ✅
- **AHJ note always appended — verified, deterministic.** `codeLookup.ts` `ensureAhj(text)` appends `AHJ_NOTE` ("Verify current adoption in your jurisdiction — local amendments may apply.") on **every path** — success, offline, and error. This is client-side defence-in-depth on top of the server prompt instruction. **Zero exceptions.** ✅
- **Citation tappable** — `CitationCard` is a `Pressable` that expands to show the full chunk content + metadata + similarity %. ✅
- Rex fabricating section numbers: citation cards are built **strictly from retrieved `code_chunks`** — they cannot be fabricated. The prose answer's section numbers are prompt-constrained only (runtime-dependent).

### Rules
- **Code lookups do NOT decrement `trial_queries_remaining`** — verified: `codeLookup.ts`/`codes.tsx` contain **no `decrement-trial-query` call** (the file header explicitly states this per BuildGuide M4 RULE 3). ✅ — *DB before/after evidence cannot be shown (no live DB).*
- **"Add to job notes"** inside an active Rex session — `addToJobNotes()` inserts a `messages` row when an active session exists. ✅
- **Temporary trade-type switch** — pill switcher; `nav.addListener('blur', …)` reverts `activeTrade` to the profile trade on leaving the tab. ✅
- **Offline** — last 10 lookups cached in AsyncStorage (`useCodeLookupCache`, `RECENT_CACHE_LIMIT = 10`); an offline banner is shown and inputs disabled. ✅

### CRITICAL DEVIATION FOUND — `code_chunks` trade-type enum mismatch (Issue #3, MEDIUM)
The `code_chunks.trade_type` CHECK constraint (migration `00001`) allows `'plumber','electrician','hvac','roofer','`**`general`**`'`. The Codes screen's trade switcher and `users.trade_type` use `'`**`other`**`'` for the General/Other option. `match_documents` filters `WHERE c.trade_type = filter_trade_type`. **A code lookup performed under the "General" trade sends `filter_trade_type='other'`, which can never match any `code_chunks` row** (those can only be `general`). General-trade code lookups will silently return zero chunks. The two enums are mismatched with nothing mapping between them. **This is a genuine correctness defect** — see Issue #3.

### D6 Flow07 compliance
Lookup mechanics, AHJ enforcement, trial exclusion, trade-switch, follow-up context, and offline mode are built. Not built (LOW): the full-text/table view (Screen 4), the dedicated uncertainty UI (Screen 5), the no-match messaging (Screen 8), quick-query suggestions, and a persistent temp-switch banner.

**Section 9 verdict: CODE-COMPLETE, DATA-BLOCKED, with one correctness bug.** The lookup mechanics, deterministic AHJ enforcement, trial exclusion, trade switch, and offline mode are correct. **M4 cannot be signed off because (a) no code document is ingested (Issue #2, HIGH-data) and (b) the `code_chunks` trade-type enum mismatch breaks General-trade lookups (Issue #3, MEDIUM).**

---

## SECTION 10 — API CALLS & WORKFLOWS AUDIT

### External API inventory (source-confirmed)

| # | Call | Provider | Route | Auth | Error handling | Approx cost |
|---|---|---|---|---|---|---|
| 1 | Rex Claude message | Anthropic | app → `claude-proxy` → api.anthropic.com | User JWT ✓ | 30s timeout, 5xx → retry | Sonnet/Haiku per `routeModel` |
| 2 | Conversation summariser | Anthropic | app → `claude-proxy` (Haiku) | User JWT ✓ | failure → summary skipped | ~$0.002/call |
| 3 | Report/quote AI drafting | Anthropic | app → `claude-proxy` (Haiku) | User JWT ✓ | best-effort → empty-form fallback | Haiku |
| 4 | Whisper transcription | OpenAI | app → `whisper-proxy` → OpenAI | User JWT ✓ | failure → "type instead" | ~$0.006/min |
| 5 | Text embedding | OpenAI | app → `embedding-proxy` → OpenAI | User JWT ✓ | failure → empty RAG context | negligible |
| 6 | Bulk ingest embeddings | OpenAI | `ingest-code-document` → OpenAI | service-role ✓ | batch retry-once-then-skip | ~$0.02/document |
| 7–8 | Stripe checkout / update sub | Stripe | app → Edge Function → Stripe | User JWT ✓ | malformed body → 400 | — |
| 9 | Stripe billing webhook | Stripe | Stripe → `handle-stripe-webhook` | Stripe-Signature ✓ | CHECK-valid status map; error → 200 | — |
| 10–12 | KYC session / webhook / status | Stripe / Supabase | Edge Functions | signature / User JWT ✓ | guarded | Stripe Identity per check |
| 13 | Decrement trial query | Supabase | app → `decrement-trial-query` → RPC | User JWT ✓ | one silent retry | — |
| 14 | Calculate days remaining | Supabase | app → Edge Function | User JWT ✓ | guarded | — |
| 15 | Stripe PaymentSheet | Stripe SDK | in-app SDK | publishable + ephemeral key | SDK-handled | — |
| 16 | Send push notification | Expo | Edge Function → Expo | service-role ✓ | stale-token cleanup | — |
| 17 | `match_documents` RPC | Supabase | app → RPC | User JWT + RLS ✓ | empty until a code doc is ingested | — |
| 18–19 | KYC photo / PDF upload | Supabase Storage | app → Storage | User JWT + storage RLS ✓ | upload error → alert | — |
| 20 | Resend credentials email | Resend | `create-team-member` → Resend | API key | isolated try/catch | — |
| 21 | Twilio credentials SMS | Twilio | `create-team-member` → Twilio | API key (env-gated) | isolated try/catch; no-op if unset | — |

### Workflow traces

**WF-1 — Voice message to Rex:** mic tap → `useVoiceRecording` (expo-av) records .m4a → `transcribeAudio` → `whisper-proxy` (JWT) → editable transcript shown → worker edits → Send → `useRexSession` persists the user `messages` row → `routeModel` selects Sonnet/Haiku → `retrieveCodeContext` (embedding-proxy + `match_documents`, chunk count from `ragInjector`) → summariser runs if message count > 10 → `streamRexResponse` → `claude-proxy` (JWT-verified) → buffered response → simulated word-by-word reveal → assistant `messages` row persisted → `decrement-trial-query` on success.

**WF-2 — Photo to Rex:** camera tap → `usePhotoCapture` → `getCompressionSettings(stage)` applies 60/50/40% tiered compression → base64 → same Claude path as WF-1. One photo per message.

**WF-3 — Code lookup:** query (voice/text) → `codeLookup.lookupCode` → `embedding-proxy` → `match_documents` (top-3, filtered by trade) → `claude-proxy` → `ensureAhj()` hard-appends the AHJ note → answer + citation cards rendered. **No trial decrement.** Offline → blocked with a banner; cache viewable.

**WF-4 — Sign-up:** Create Account (form valid) → Terms overlay gate → `signUp` (Supabase Auth, email + phone) → dual OTP screen (expiry-aware, 60s resend, 3×→5-min lockout) → both verified → `createUserProfile` inserts the `public.users` row (KYC seeded `pending`, terms stored) → `initiateKycVerification()` mints 2 Stripe Identity sessions → Home with trial banner.

**WF-5 — Confirm report:** Confirm tap → `ConfirmDialog` summary → offline pre-check → `confirmReport` sets `status='finalised'` → DB trigger `prevent_finalised_update` locks the row → `expo-print` renders the PDF → uploaded to `job-documents` storage → `pdf_url` saved → native share available.

**WF-6 — Trial decrement:** after a *successful* Claude response only → `decrement-trial-query` Edge Function (JWT) → `decrement_trial_query` RPC → `GREATEST(count-1,0)`. The app **never writes the count directly**. One silent retry on failure. Active subscribers → `null` (unlimited).

**WF-7 — KYC verification:** documents uploaded to `kyc-documents` storage → 2 Stripe Identity sessions minted at sign-up → Stripe Identity processes → `kyc-webhook` (signature-verified) updates `national_id_kyc_status` / `license_kyc_status` → push notification on verified/rejected → rejection recovery via Settings → Profile re-upload (unblocked by the conditional KYC-field lock, migration `00010`).

**Section 10 verdict: COMPLIANT.** Every external call routes through an Edge Function proxy or an authorised SDK path; all three AI proxies and `send-push-notification` are authenticated; webhooks are signature-verified.

---

## SECTION 11 — SECURITY AUDIT

**RULE: API keys never in the mobile app bundle — VERIFIED YES.** Grep of `services/`, `app/`, `hooks/`, `components/`, `constants/`: no `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `STRIPE_SECRET_KEY` literals. Only `EXPO_PUBLIC_*` public-safe values (Supabase anon key, Stripe publishable key) appear client-side. All secrets live exclusively in Edge Function `Deno.env`. *Method: full-tree string search across all client directories.*

**RULE: All Claude API calls via Edge Function proxy — VERIFIED YES, and authenticated.** `anthropic.ts` (Rex), `summariser.ts`, and `documents.ts` (report/quote drafting) all POST to `claude-proxy` with a Bearer JWT. `claude-proxy` verifies the caller JWT via `auth.getUser()` (401 if absent). The Rex system prompt is assembled server-side in `prompts.ts`. **Call chain for a Rex message:** app `streamRexResponse` → `POST /functions/v1/claude-proxy` (Authorization: Bearer <user JWT>) → `claude-proxy` verifies JWT → builds server-side prompt → `POST api.anthropic.com` with `ANTHROPIC_API_KEY` → response streamed back. **One residual:** `documents.ts` builds its *document-drafting* system prompt client-side (Issue #7, LOW).

**RULE: RLS on every table — YES in the migration set.** All 13 tables (+ `audit_logs`) have `ENABLE ROW LEVEL SECURITY`. After `00007`/`00008`/`00009` every `FOR ALL` policy has `USING` + `WITH CHECK`; `users` DELETE is removed; `subscriptions`/`billing_history` have `WITH CHECK`. **Correct only if those migrations are applied — confirm on the live DB. No cross-user isolation test was run (no live DB) — this is NOT verified at runtime.**

**RULE: Webhook signatures verified — YES (both).**
- `handle-stripe-webhook`: `event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET)` — runs before any DB work; missing signature → 401, failure → 400.
- `kyc-webhook`: identical pattern with `STRIPE_IDENTITY_WEBHOOK_SECRET`.

**RULE: `trial_queries_remaining` server-side only — YES.** No client code writes the field; only `decrement-trial-query` → `decrement_trial_query` RPC. DB CHECK `trial_queries_remaining >= 0` present; `00010` adds the explicit `GRANT EXECUTE`.

**RULE: DB trigger locks confirmed documents — PRESENT.** `prevent_finalised_update` on `job_reports` + `quotes` raises an exception on any UPDATE of a `finalised` row. **A direct-UPDATE tamper test could NOT be run (no live DB)** — the trigger is present in source; runtime enforcement is unverified.

**RULE: DELETE confirmations — `delete-team-member` requires `confirmation:"DELETE"`; `delete-account` is JWT-gated and clears all 4 storage buckets.** Full M6–M8 DELETE flows are out of M0–M4 scope — noted for a future audit.

| # | Severity | Finding |
|---|---|---|
| SEC-1 | INFO | All three AI proxies (`claude`/`whisper`/`embedding`) and `send-push-notification` are authenticated — no unauthenticated cost-exposure path. |
| SEC-2 | LOW (verify live) | RLS correctness depends on migrations `00007`–`00011` being applied — confirm with `supabase db push`. |
| SEC-3 | LOW (accepted) | "Save Password" stores the plaintext password in Expo SecureStore (encrypted at rest — spec-compliant; a refresh token would be a marginally stronger posture). |
| SEC-4 | LOW | `documents.ts` document-drafting prompt is client-side (Issue #7) — low risk, but a divergence from CLAUDE.md rule 2. |

**Section 11 verdict: STRONG / COMPLIANT.** Key handling, proxy authentication, webhook signature verification, server-side trial counting, and the finalised-document DB lock are all sound in source. The residuals are confirming the migrations are applied live, and the client-side document prompt.

---

## SECTION 12 — D8 TEST CASES AUDIT

> **METHODOLOGY — READ THIS.** No test was executed — there is no running app, device, or live DB. Every status below is a **static code-inspection assessment** of whether the code *implements the behaviour a test case checks*, not an execution PASS/FAIL. Statuses: **IMPLEMENTED** / **PARTIALLY IMPLEMENTED** / **NOT IMPLEMENTED** / **CANNOT DETERMINE** (AI-runtime, delivery, or live-DB dependent).
>
> **STRUCTURE CORRECTION.** D8 v1.0 contains **232 test cases (TC-001–232) across 10 sections (A–J)** — not 131 across 5. The M0–M4 range is **Sections A–E, TC-001–117**. This section audits that range. The brief's "TC-001 to TC-131" numbering does not exist in D8 and is not used.

### Section-level assessment

| D8 Section | Range | Total | IMPLEMENTED | PARTIAL | NOT IMPL. | CANNOT DETERMINE |
|---|---|---|---|---|---|---|
| A — Authentication | TC-001–022 | 22 | 17 | 2 | 0 | 3 |
| B — Rex Diagnostic | TC-023–065 | 43 | 13 | 7 | 0 | 23 |
| C — Report Generation | TC-066–086 | 21 | 14 | 6 | 1 | 0 |
| D — Quote Generator | TC-087–103 | 17 | 13 | 4 | 0 | 0 |
| E — Code Lookup | TC-104–117 | 14 | 8 | 3 | 0 | 3 |
| **TOTAL** | **TC-001–117** | **117** | **65** | **22** | **1** | **29** |

### Section A — Authentication (TC-001–022)
**17 IMPLEMENTED:** 3-step gated sign-up, all required fields, password strength meter, dual email+SMS OTP on one screen, both-required gate, 60s per-channel resend, 3×-wrong → 5-min lockout, OTP expiry handled without burning an attempt, Terms overlay + DB storage, 3 sign-in methods, Save Password off-by-default, session persistence, phone sign-in no longer auto-creates accounts, inline error banners, 15-min sign-in lockout, suspended-account gate, no-internet handling.
**2 PARTIAL:** Google sign-up's phone-OTP-only completion step; 6-box OTP visual (one input per channel built instead).
**3 CANNOT DETERMINE:** actual OTP email/SMS delivery, Stripe Identity session creation success, push-notification delivery — all require a live environment.

### Section B — Rex Diagnostic (TC-023–065)
**13 IMPLEMENTED:** session creation/persistence, `[[STAGE:n]]` tracking, stage progress strip + pill, contextual buttons per stage, Close-Job-from-Stage-1, Report/Quote gated post-close, voice+Whisper+editable transcript, photo + tiered compression, text input, `routeModel` wiring, summariser-at-11, soft-cap 28/30 + linked session, server-side trial decrement.
**7 PARTIAL:** contextual button labels (reaction-style, not D6 input-gathering set); single photo per message; simulated streaming; apprentice detection (brittle regex); pushback (functional, visual partial); offline queue copy; recap-on-reopen.
**23 CANNOT DETERMINE:** every test of *what Rex actually says* — 6-question opening as one natural message, the 15 D7 principles' adherence, gas-leak STOP-block-first, diagnosis quality, code-citation accuracy, safety-note placement. **These are the single largest block of unverified cases and require a live-AI QA pass.**

### Section C — Report Generation (TC-066–086)
**14 IMPLEMENTED:** Path A + B, section picker first-time/saved, VAT/license toggles, inline-editable preview, AI-drafted section content, Path-B follow-up questions, Path-A session-context reuse, suggested min–max range, confirm→finalised + DB-trigger lock, draft auto-discard with prompt, `expo-print` PDF, `job-documents` storage, native share, versioning.
**6 PARTIAL:** offline confirm (fail-fast pre-check only, no auto-generate-on-reconnect); reorder via arrows not drag; PDF missing Download control / time-on-site line / company logo; AI draft *quality* (runtime); follow-ups are one-shot not conversational.
**1 NOT IMPLEMENTED:** swipe-to-delete gesture on line/section rows — an `✕`/arrow control is used instead (accepted deviation; swipe needs a native dependency).

### Section D — Quote Generator (TC-087–103)
**13 IMPLEMENTED:** Path A + B, AI-drafted line items + labour estimate, Path-B description input + follow-ups, editable line items with auto totals, 6-option multi-select payment methods, 30-day validity, confirm→finalised lock, versioning, draft discard, section picker (independent from report).
**4 PARTIAL:** no suggested min–max range on the quote (report-only — Issue #10); Path A reuses only the report's confirmed amount, not the Rex transcript (Issue #9); offline confirm; line delete via `✕` not swipe.

### Section E — Code Lookup (TC-104–117)
**8 IMPLEMENTED:** voice + text input, plain-language query, trade badge, plain-answer-first + citations, deterministic AHJ-note append, no trial decrement, temporary trade switch with revert, last-10 offline cache + offline banner, "add to job notes".
**3 PARTIAL:** no streaming on the code answer (buffered); D6 Screens 4/5/8 not built; the `code_chunks` trade-type enum mismatch breaks General-trade lookups (Issue #3).
**3 CANNOT DETERMINE:** whether `match_documents` returns relevant results, whether Rex cites real section numbers, end-to-end retrieval — **all blocked because no code document is ingested (Issue #2) and there is no live DB.**

**Section 12 verdict:** Of 117 M0–M4 test cases, **65 are implemented in code, 22 partial, 1 not implemented (accepted deviation), 29 cannot be determined statically.** The 29 CANNOT-DETERMINE cases are concentrated in Rex AI-runtime behaviour (23) and code-lookup retrieval (3) and **require a device + live-AI QA pass to convert to true PASS/FAIL.** No test case was executed; this is a code-capability assessment only.

---

## SECTION 13 — ISSUES, DEVIATIONS & FIXES REQUIRED

The codebase has already been through two internal audit-remediation rounds (migrations `00008`/`00009`/`00010`; Edge Function `ISS-*` markers) which closed a previously-logged set of HIGH/MEDIUM issues. The issues below are the **open items this independent audit identifies as still outstanding** — including **four (Issues #1, #3, #4, #5) not flagged by the codebase's prior internal draft.**

---

**ISSUE #1 — Migration `00011` is uncommitted and git-ignored**
- **SEVERITY:** HIGH (process / release-integrity)
- **SECTION:** 1, 3
- **DOC REF:** D5; D4 §2 (`supabase/migrations/`)
- **DESCRIPTION:** `00011_storage_buckets.sql` (creates the `job-photos` and `profile-assets` storage buckets + RLS) exists on disk but is **git-ignored** — the root `.gitignore` now contains `supabase/`, so this and every future migration/Edge-Function change escapes version control. `git status` reports "clean" while real schema changes sit untracked.
- **CORRECT BEHAVIOUR:** All migrations and Edge Functions must be version-controlled. `supabase/` must not be git-ignored.
- **FIX REQUIRED:** Remove the `supabase/` (and stray `supabase`) entries from the root `.gitignore`; `git add -f` migration `00011` and any other untracked supabase files; commit. Audit what else under `supabase/` is currently untracked.
- **BLOCKS:** No milestone directly, but it is a serious release-integrity risk — schema drift between the repo and the live DB becomes invisible. Fix before any further migration work.

**ISSUE #2 — IPC 2021 (and all code documents) not ingested**
- **SEVERITY:** HIGH (data)
- **SECTION:** 9
- **DOC REF:** D1 F4; D4 §4.3; D5 `code_chunks`/`code_documents`; D10 §2.11
- **DESCRIPTION:** The RAG ingestion pipeline (Edge Function + scripts) is complete, but no code document has been ingested. `code_chunks`/`code_documents` are presumed empty. Code Lookup returns no real citations.
- **CORRECT BEHAVIOUR:** IPC 2021 (and the other D1 F4 documents) ingested so `match_documents` returns real sections.
- **FIX REQUIRED:** Obtain the IPC 2021 PDF, run `scripts/extract-pdf-text.py` then the `ingest-code-document` pipeline; verify with a test query.
- **BLOCKS:** **M4 sign-off.** Does not block M5 start.

**ISSUE #3 — `code_chunks` trade-type enum mismatch breaks General-trade lookups**
- **SEVERITY:** MEDIUM
- **SECTION:** 9
- **DOC REF:** D5 §11 (`code_chunks` CHECK); D2 §F1 (trade types)
- **DESCRIPTION:** `code_chunks.trade_type` CHECK allows `general`; the Codes screen and `users.trade_type` use `other` for the General/Other option. `match_documents` filters `WHERE c.trade_type = filter_trade_type`, so a lookup under the "General" trade sends `other` and can never match a `code_chunks` row (which can only be `general`). General-trade code lookups silently return zero chunks.
- **CORRECT BEHAVIOUR:** A General-trade lookup must query the `general` chunk set.
- **FIX REQUIRED:** Map the UI/profile `other` value to `general` when calling `match_documents` (or align the enums). Decide one canonical value and apply it consistently across `users.trade_type`, `code_chunks.trade_type`, and the lookup call.
- **BLOCKS:** No milestone, but it is a real correctness defect in M4 — fix alongside Issue #2.

**ISSUE #4 — `delete-team-member` does not guard a malformed request body**
- **SEVERITY:** LOW
- **SECTION:** 4
- **DOC REF:** D10 §2.8
- **DESCRIPTION:** `await req.json()` is not wrapped in try/catch — a malformed body throws an unhandled error → 500 instead of a clean 400. Every other rewritten Edge Function received this guard (EF-6); this one was missed.
- **FIX REQUIRED:** Wrap `req.json()` in try/catch and return a 400 on a parse failure.
- **BLOCKS:** No.

**ISSUE #5 — `handle-stripe-webhook` status maps diverge for `incomplete` subscriptions**
- **SEVERITY:** LOW
- **SECTION:** 4
- **DOC REF:** D10 §2.1; D5 `users`/`subscriptions`
- **DESCRIPTION:** `subscriptionRowStatus()` maps Stripe `incomplete` → `expired` for the `subscriptions` table, while the separate `users.subscription_status` `statusMap` maps `incomplete` → `trial`. The two tables hold divergent statuses for the same incomplete subscription. Not a CHECK violation (`users.subscription_status` permits `trial`), but inconsistent.
- **FIX REQUIRED:** Use one shared mapping for both writes, or document the intended divergence.
- **BLOCKS:** No.

**ISSUE #6 — `tokenEstimator.ts` shipped but unused**
- **SEVERITY:** LOW
- **SECTION:** 5
- **DOC REF:** D4 §2/§3
- **DESCRIPTION:** `services/tokenEstimator.ts` exports estimator functions that nothing imports — dead code. D4 lists it, so it cannot be silently deleted.
- **FIX REQUIRED:** Wire it into cost telemetry, or formally remove it from D4 §2/§3.
- **BLOCKS:** No.

**ISSUE #7 — Document-drafting Claude prompt built client-side**
- **SEVERITY:** LOW
- **SECTION:** 8, 11
- **DOC REF:** CLAUDE.md rule 2 ("system prompts are server-side only")
- **DESCRIPTION:** `documents.ts` `callClaudeJson()` constructs the report/quote-drafting system prompt client-side. CLAUDE.md rule 2 says system prompts are server-side only. Low security risk (document drafting, not Rex's diagnostic IP) but a divergence from the stated rule.
- **FIX REQUIRED:** Move the document-drafting prompt to a server-side Edge Function prompt, or formally scope CLAUDE.md rule 2 to Rex diagnostic prompts only.
- **BLOCKS:** No.

**ISSUE #8 — Quote builder has no suggested min–max range**
- **SEVERITY:** LOW
- **SECTION:** 8
- **DOC REF:** D2 F4 step 5; D3 F3 ("suggested total range")
- **DESCRIPTION:** The Report shows a suggested min–max range; the Quote builder shows only an auto subtotal and a static markup tip. D2/D3 call for a suggested range on the quote.
- **FIX REQUIRED:** Add a Rex-calculated suggested min–max range to the quote preview.
- **BLOCKS:** No.

**ISSUE #9 — Quote Path A does not reuse the Rex session transcript**
- **SEVERITY:** LOW
- **SECTION:** 8
- **DOC REF:** D2 F4 LOCKED RULES ("Rex reuses validated data from the session")
- **DESCRIPTION:** Quote Path A seeds from the prior finalised report's `confirmed_amount` + time-on-site only; it does not feed the Rex message transcript to the AI draft (the Report builder does).
- **FIX REQUIRED:** Feed the session transcript digest to `generateQuoteContent` in Path A, as the report builder does.
- **BLOCKS:** No.

**ISSUE #10 — Streaming is simulated, not true SSE**
- **SEVERITY:** LOW (accepted)
- **SECTION:** 7, 9
- **DOC REF:** D4 §6.3 (streaming response pattern)
- **DESCRIPTION:** `anthropic.ts` does a buffered fetch then a word-by-word reveal; RN `fetch` does not reliably expose a streaming body. Disclosed honestly in the code comment.
- **FIX REQUIRED:** None required for v1 — accepted RN-platform limitation. Revisit if a streaming-capable transport becomes available.
- **BLOCKS:** No.

**ISSUE #11 — Expired-subscription Home does not grey feature buttons**
- **SEVERITY:** LOW
- **SECTION:** 6
- **DOC REF:** D2 Sign-In Flow ("all feature buttons disabled")
- **DESCRIPTION:** On expired subscription the Home feature buttons are not visually disabled; the paywall still fires on tap, so the gate is functionally enforced — only the visual cue is missing.
- **FIX REQUIRED:** Visually disable/grey feature buttons in the expired state.
- **BLOCKS:** No.

**ISSUE #12 — No automated test framework**
- **SEVERITY:** MEDIUM (process)
- **SECTION:** 2
- **DOC REF:** D8
- **DESCRIPTION:** No Jest/Detox/Playwright etc. D8's 232 cases are entirely manual.
- **FIX REQUIRED:** Founder decision — either accept manual QA for v1 or budget a test-framework setup.
- **BLOCKS:** No (process decision).

**ISSUE #13 — `react-native-worklets` Android EAS OOM risk**
- **SEVERITY:** MEDIUM (mitigated)
- **SECTION:** 2
- **DESCRIPTION:** Known OOM on multi-ABI Android EAS prebuilds. Mitigated in `eas.json` (`resourceClass: large`, single ABI `arm64-v8a`).
- **FIX REQUIRED:** Confirm the next EAS Android build completes; keep the mitigation.
- **BLOCKS:** No.

**ISSUE #14 — Deployment state of migrations & Edge Functions unverified**
- **SEVERITY:** HIGH (operational — must verify, not necessarily fix)
- **SECTION:** 3, 4
- **DESCRIPTION:** Whether the 11 migrations are applied and the 15 Edge Functions (with current hardened source + all secrets) are deployed to project `quvcparzpurwwkrxpiki` **cannot be confirmed from the repo.** If the live DB lacks `00007`–`00011`, RLS has an INSERT-bypass hole and the KYC re-upload flow is blocked. If the Edge Functions are stale, the security fixes are not live.
- **FIX REQUIRED:** Run `supabase db push` and `supabase functions deploy` for all functions; set `claude-proxy`'s `SUPABASE_URL` + `SUPABASE_ANON_KEY` and `create-team-member`'s `TWILIO_*` secrets; verify in the dashboard.
- **BLOCKS:** Production readiness (not M5 development).

**Lower-priority accepted/deferred items (LOW):** 6-box OTP visual; country-code free-text field; emoji tab icons; D6 code-lookup Screens 4/5/8 + quick-queries; report PDF Download control / time-on-site line / company logo; multi-photo per Rex message; swipe-to-delete gestures; `App.tsx` dual-entry pattern; stale D4 §1 stack table and model ID. None block any milestone.

### Issue count summary
**0 CRITICAL · 3 HIGH (Issues #1, #2, #14 — one process, one data, one operational) · 2 MEDIUM (Issues #3, #12) · 1 MEDIUM mitigated (Issue #13) · ~8 LOW + accepted/deferred backlog.** Note: none of the three HIGH items is a code-*correctness* defect — they are version-control hygiene (#1), missing data (#2), and unverified deployment (#14).

---

## SECTION 14 — WHAT IS COMPLETE, WHAT IS MISSING

### COMPLETE AND COMPLIANT
- **M0 — Infrastructure:** all 13 D5 tables (+ `audit_logs`); every column/type/CHECK per D5 incl. the v1.1/v1.2 amendment columns; RLS with `USING`+`WITH CHECK` on every client-writable table; pgvector + `match_documents()` (verbatim D5) + `decrement_trial_query` RPC + its GRANT; `update_updated_at`, `prevent_finalised_update`, `lock_vat_number`, and the conditional `lock_kyc_fields` triggers; 15 Edge Functions in source (11 D10 + 4 extras) as a hardened rewrite; 4 of 5 AI-optimisation files correct and wired.
- **M1 — Auth:** 3-step gated sign-up + review summary; dual email+SMS OTP with 60s resend, 3×→5-min lockout, and expiry handling; Terms overlay + DB storage; canonical KYC auto-initiation at sign-up; 3 sign-in methods; phone sign-in does not auto-create accounts; inline error banners; forgot-password with confirm field; Save Password (SecureStore, off by default); session persistence; 6 nav tabs.
- **M2 — Rex:** session lifecycle; 6-question opening instruction; all 15 D7 principles prompt-encoded incl. Plumber MATERIALS; 5-stage `[[STAGE:n]]` tracking + progress strip & pill; per-diagnosis pushback reset; apprentice ask-once; voice+Whisper+editable transcript+photo with tiered compression; all Claude calls via an authenticated proxy; server-side trial decrement with retry; soft-cap warning at 28 + linked session at 30; offline queue + reconnect + 30s timeout + 5xx + Whisper fallback.
- **M3 — Reports/Quotes:** Path A + B for both documents; section picker saved to `worker_preferences`; VAT/license toggles; inline-editable preview; AI-drafted content (Haiku) for report sections and quote line items; Path-B follow-up questions; Path-A report session-context reuse; suggested min–max range on reports; permanent lock via DB trigger; draft auto-discard with in-app dialog; `expo-print` PDF in `job-documents`; native share; versioning; 6-option payment methods; 30-day validity.
- **M4 — Code Lookup:** voice + text lookup; RAG ingestion pipeline + scripts + duplicate guard; deterministic `ensureAhj()` AHJ-note enforcement; tappable structured citations; no trial decrement; "add to job notes"; temporary trade switch with revert; offline mode + last-10 cache.
- **Security:** no keys/prompts in the bundle (one document-prompt exception, Issue #7); all three AI proxies + `send-push-notification` authenticated; webhooks signature-verified; trial count server-side; finalised-document DB lock; `delete-account` clears all buckets.

### PARTIALLY COMPLETE
- **M3:** offline report/quote confirmation is a fail-fast pre-check, not full auto-generate-on-reconnect; report PDF missing a Download control / time-on-site line / company logo; quote has no suggested range (Issue #8); quote Path A does not reuse the Rex transcript (Issue #9).
- **M4:** code-complete but **non-operational for real citations until a code document is ingested (Issue #2)**; General-trade lookups broken by the enum mismatch (Issue #3); D6 Screens 4/5/8 not built.
- **D8:** 22 cases PARTIAL, 29 CANNOT DETERMINE — a device + live-AI QA pass is required.

### NOT BUILT (within M0–M4 scope)
- Any code-document ingestion / IPC 2021 (data task — Issue #2).
- Offline auto-generate-on-reconnect for report/quote confirmation.
- Multi-photo per Rex message.
- Code-lookup full-text/table view, uncertainty UI, no-match UI, quick-query suggestions.
- Swipe-to-delete gestures (accepted deviation — `✕`/arrow controls used).
- Automated test suite (no framework — Issue #12).
- A suggested min–max range on the quote (Issue #8).
- End-to-end push-notification device verification (needs an EAS native build).

---

## SECTION 15 — READINESS ASSESSMENT

| Milestone | Verdict | Basis |
|---|---|---|
| **M0 — Infrastructure** | **PARTIALLY** (code-complete; deploy + commit pending) | All tables/functions/AI-layer present and correct in source. Blockers: migration `00011` uncommitted (Issue #1); applied/deployed state unverified (Issue #14). |
| **M1 — Authentication** | **YES** | Every D1 §7 / D2 functional requirement met. Residuals are LOW visual polish. |
| **M2 — Rex Diagnostic** | **PARTIALLY** | Mechanics and all 15 D7 prompts complete. Cannot be signed off YES until a live-AI QA pass confirms runtime D7 adherence (23 CANNOT-DETERMINE cases). Streaming-simulation accepted. |
| **M3 — Reports & Quotes** | **YES** (with LOW residuals) | Both paths, AI drafting, locking, PDF, versioning all built. Quote suggested-range (Issue #8) and PDF polish are LOW. |
| **M4 — Code Lookup** | **NO** | Code-complete but non-operational: no code document ingested (Issue #2, HIGH-data) and General-trade lookups broken (Issue #3, MEDIUM). |

### Is the build ready to proceed to M5? — **YES, conditionally**

There are **no open CRITICAL or HIGH code-correctness defects.** The three HIGH items are version-control hygiene (#1), missing data (#2), and unverified deployment (#14) — none is a broken feature, and none blocks M5 *development* from starting. M0–M3 are code-complete; M4 is code-complete and waiting on data + one enum fix.

### CRITICAL issues that must be fixed immediately
**None.** There are no CRITICAL-severity issues.

### Conditions / parallel tasks (do NOT block M5 start, but MUST be done before production)
1. **Fix version control (Issue #1)** — un-ignore `supabase/`, force-add migration `00011` and any other untracked supabase files, commit. ~10 minutes. Do this first.
2. **Deploy and verify (Issue #14)** — `supabase db push` (all 11 migrations) and `supabase functions deploy` (all 15 functions); set `claude-proxy`'s and `create-team-member`'s new secrets; confirm in the dashboard. ~30 minutes.
3. **Ingest IPC 2021 (Issue #2)** — required for **M4 sign-off**. ~30 minutes once the PDF is available.
4. **Fix the `code_chunks` enum mismatch (Issue #3)** — map `other`→`general` in the lookup call. ~15 minutes.
5. **Fix the two LOW Edge Function items (Issues #4, #5)** — `delete-team-member` body guard + unify the webhook status maps. ~20 minutes.
6. **Device + live-AI QA pass** — resolve the 29 CANNOT-DETERMINE D8 cases (Rex D7 adherence, gas-leak STOP block, code-citation accuracy, AI draft quality, push delivery). This is the only way to sign off M2 and M4 as YES.
7. **Founder decision on Issue #12** (automated test framework).

### Estimated fixes required before M5
- **CRITICAL fixes:** 0.
- **HIGH fixes:** 3 — all are operational/data/process tasks (un-ignore + commit `00011`; deploy & verify; ingest IPC 2021), not code rewrites. ~70 minutes of work + the IPC PDF.
- **MEDIUM fixes:** 1 code fix (Issue #3, ~15 min) + 1 founder decision (Issue #12) + 1 mitigated item to confirm (Issue #13).
- **LOW backlog:** ~8 items, none blocking.
- **Complexity:** LOW. No architectural change is required. The build is structurally sound; the remaining work is deployment hygiene, one data load, and small, well-scoped fixes.

### Bottom line
M0–M3 are code-complete and substantially compliant with D1–D10. M4 is code-complete but **cannot be signed off** until a code document is ingested and the trade-type enum mismatch is fixed. The most urgent item is **not a feature bug — it is that migration `00011` and potentially other `supabase/` changes are escaping version control (Issue #1)**, which must be corrected immediately to keep the repo and the live database honest. **M5 development can begin in parallel** with the conditions above; full M0–M4 production sign-off requires the deployment verification, the IPC 2021 data load, the Issue #3 fix, and a device + live-AI QA pass.

---

## DOCUMENT STATUS

| | |
|---|---|
| **Document** | TradesBrain Full Build Audit — M0 through M4 |
| **Audit base** | Codebase at git `main` (working tree clean) as of 22 May 2026 — 11 migrations, 15 Edge Functions — cross-referenced against D1–D10 + 13 D6 wireframe flows |
| **Method** | Static analysis + four parallel independent code-inspection agents reading actual source |
| **Sections** | 15 of 15 — complete |
| **Issue status** | 0 Critical · 3 High (process / data / operational) · 2 Medium + 1 Medium-mitigated · ~8 Low/accepted/deferred. No open HIGH code-correctness defect. |
| **Honest limits** | No test executed; no live DB or Supabase CLI access; no device; deployment state unverified; AI runtime behaviour not assessed |
| **M5 readiness** | **READY (conditional)** — fix version control, deploy & verify, ingest IPC 2021, fix the enum mismatch, then run a device + live-AI QA pass |
| **Date** | 22 May 2026 |
| **Confidentiality** | Confidential — Internal use only |

*TradesBrain — Full Build Audit — M0–M4 — 22 May 2026 — Confidential*
