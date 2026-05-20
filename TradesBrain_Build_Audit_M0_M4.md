# TRADESBRAIN — FULL BUILD AUDIT REPORT
## Steps M0 through M4 + Supabase Database Setup

**Audit date:** 2026-05-20
**Audited by:** Claude Code
**Single source of truth:** D-series documentation (D1–D10) + D8 Test Plan + D6 Wireframes
**Repository:** `C:\Users\mujta\Tradesbrain` — app at `tradesbrain/`
**Supabase project:** `quvcparzpurwwkrxpiki`

---

## METHOD & HONESTY STATEMENT

This report is produced by **code inspection and live infrastructure queries only**. No app runtime testing was performed — there is no running app, device, or emulator session available to this audit. Consequences, stated up front:

- No D8 test case is marked "PASS". Behaviour that requires execution is marked **NOT TESTED — runtime required**.
- AI behavioural compliance (D7 principles, Rex output quality) **cannot be verified** — the trade prompts contain the verbatim D7 text, but whether the model obeys them is unknowable without execution.
- Remote secret *values* cannot be read from the repo. Edge Function deployment status WAS verified live (`supabase functions list`). Database schema was verified against the applied migration files (confirmed pushed via `supabase db push`).
- Wireframe compliance is a **structural/code** comparison, not a pixel/visual one.

Where something is uncertain, it is flagged as uncertain. This report does not present an optimistic picture.

**Headline finding:** M0–M3 are substantially built and, after fixes applied in the most recent work session, largely compliant in code. **M4 is code-complete but NON-FUNCTIONAL** — the trade-code vector store is empty (0 rows). Several genuine defects remain, the most serious being a non-functional `send-push-notification` Edge Function and an unauthenticated `ingest-code-document` endpoint. The build also runs on **Expo SDK 55 against a D4-locked SDK 52**, so the "locked" architecture document is formally out of date.

---

### SECTION 1 — PROJECT STRUCTURE AUDIT

Audit target: `C:\Users\mujta\Tradesbrain\tradesbrain`. Reference: D4 Section 2. `node_modules/`, `.git/`, `.expo/`, `ios/` and Android build artifacts excluded; the `android/` folder is confirmed present.

#### Actual Folder Tree

```
tradesbrain/
├── android/                          # EXISTS — native build dir (not in D4 §2; expected after prebuild)
├── app/
│   ├── _layout.tsx                   # NOT in D4 §2 (Expo Router root layout)
│   ├── (auth)/
│   │   ├── complete-profile.tsx      # NOT in D4 §2
│   │   ├── forgot-password.tsx       # NOT in D4 §2
│   │   ├── otp-verify.tsx            # matches D4
│   │   ├── phone-signin.tsx          # NOT in D4 §2
│   │   ├── signin.tsx                # matches D4
│   │   ├── signup.tsx                # matches D4
│   │   └── welcome.tsx               # matches D4
│   ├── (tabs)/
│   │   ├── codes.tsx · history.tsx · home.tsx · quote.tsx · report.tsx · rex.tsx   # all match D4
│   ├── document/                     # NOT in D4 §2 — quote.tsx, report.tsx (document builders)
│   ├── job/
│   │   ├── [sessionId].tsx            # matches D4
│   │   └── detail/[jobId].tsx         # matches D4
│   ├── settings/                     # index, legal, profile, subscription, team, trade — all match D4
│   ├── team/                         # NOT in D4 §2 — [memberId].tsx, add.tsx
│   └── paywall.tsx                   # matches D4
├── components/
│   ├── codes/CitationCard.tsx        # NOT in D4 §2 (new folder)
│   ├── documents/                    # QuotePreview, ReportPreview match D4; PaymentMethodSelector, SectionPicker NOT in D4 §2
│   ├── history/                      # NOT in D4 §2 — EmptyState, JobCard, SkeletonCard
│   ├── rex/                          # ContextualButtons, MessageBubble, PhotoCapture, StreamingText, VoiceRecordButton — match D4
│   ├── shared/                       # ErrorBoundary, LoadingSpinner, SubscriptionGate, ToastNotification match D4;
│   │                                 #   AccountSuspendedScreen, ForceUpgradeScreen, OfflineBanner, ProfileFormFields,
│   │                                 #   TermsOverlay, TrialBanner NOT in D4 §2
│   └── team/KpiDashboard.tsx, MemberCard.tsx   # match D4
├── services/
│   ├── anthropic.ts · openai.ts · rag.ts · router.ts · summariser.ts · stripe.ts · supabase.ts  # match D4
│   ├── imageCompression.ts · ragInjector.ts · tokenEstimator.ts   # MOVED here from utils/ (D4 §2 lists them in utils/)
│   ├── auth.ts · codeLookup.ts · documents.ts · history.ts · payments.ts · share.ts · team.ts  # NOT in D4 §2
├── hooks/
│   ├── useAuth.ts · usePhotoCapture.ts · useRexSession.ts · useSubscription.ts · useVoiceRecording.ts  # match D4
│   ├── useCodeLookupCache.ts · useOfflineQueue.ts · useSavePassword.ts   # NOT in D4 §2
├── context/
│   ├── AuthContext.tsx · SubscriptionContext.tsx · TradeProfileContext.tsx   # match D4 (the "three contexts")
│   └── NetworkContext.tsx            # NOT in D4 §2 — a FOURTH context (D4 §7 specifies three)
├── utils/formatters.ts               # matches D4 (only file left in utils/)
├── types/                            # documents, session, subscription, user — all match D4
├── constants/
│   ├── api.ts · limits.ts · pricing.ts · tradeProfiles.ts   # match D4
│   ├── appVersion.ts · codeLookup.ts · paymentMethods.ts · teamMetrics.ts   # NOT in D4 §2
├── assets/                           # matches D4
├── stubs/stripe-web.js               # NOT in D4 §2 (web-build shim)
├── supabase/
│   ├── functions/   (15 Edge Functions)
│   └── migrations/  (7 SQL files: 00001–00007)
└── root config: App.tsx, index.ts, app.json, eas.json, babel.config.js, metro.config.js,
                  tailwind.config.js, tsconfig.json, global.css, nativewind-env.d.ts,
                  .env, .env.example, .npmrc, .gitignore
```

#### Items in D4 §2 that DO NOT exist (deviations)

| D4 §2 expected | Status |
|---|---|
| `utils/imageCompression.ts` | Relocated to `services/imageCompression.ts`. D4 §2 not updated. |
| `utils/ragInjector.ts` | Relocated to `services/ragInjector.ts`. D4 §2 not updated. |
| `utils/tokenEstimator.ts` | Relocated to `services/tokenEstimator.ts`. D4 §2 not updated. |
| `scripts/ingest-code-document.js` (referenced in D4 §4.3) | **No `scripts/` folder exists.** Ingestion was built as the `ingest-code-document` Edge Function instead. |
| `constants/systemPrompts.ts` | **Deleted.** Rex prompts moved server-side to `supabase/functions/claude-proxy/prompts.ts` (RULE 10 — confidential prompts must not ship in the bundle). Not a §2 deviation (D4 §2 never listed it) but noted. |

The move of the three optimisation files into `services/` is architecturally consistent with D4 §3 ("the five optimizations are components of the API service layer") and D4 §10, but is a literal deviation from the §2 tree. **D4 §2 must be re-versioned.**

#### Items that EXIST but are NOT in D4 §2 (deviations)

- **Screens:** `app/_layout.tsx`; `(auth)/complete-profile.tsx`, `forgot-password.tsx`, `phone-signin.tsx`; the `app/document/` folder; the `app/team/` folder.
- **Components:** `components/codes/`, `components/history/`; `documents/PaymentMethodSelector.tsx`, `documents/SectionPicker.tsx`; six extra `shared/` components.
- **Services:** seven extra files (`auth, codeLookup, documents, history, payments, share, team`). D4 §2's "one external service per file" rule is not literally followed — several are domain modules, not external-service wrappers.
- **Hooks:** `useCodeLookupCache.ts`, `useOfflineQueue.ts`, `useSavePassword.ts`.
- **Context:** `NetworkContext.tsx` — a **fourth** context, contradicting D4 §7's explicit "Three Global Contexts". Justified by offline handling but a spec deviation.
- **Constants:** `appVersion.ts`, `codeLookup.ts`, `paymentMethods.ts`, `teamMetrics.ts`.
- **Top-level:** `supabase/` (15 functions, 7 migrations) — D4 §2's tree omits the backend entirely; `stubs/`.

**Verdict:** the project structure tracks D4's *intent* but D4 §2 itself is now an inaccurate "locked" document. The extra files are all legitimate (M3/M4/M5+ features); the deviations are documentation-staleness, not build defects — except the missing `scripts/` ingestion path (D4 §4.3), which is a genuine workflow divergence.

---

### SECTION 2 — TECHNOLOGY STACK AUDIT

Reference: `tradesbrain/package.json` vs D4 Section 1.

**Headline:** the installed **Expo SDK is 55**; D4 §1 locks the stack to **Expo SDK 52** and states "This stack is locked — no substitutions without updating this document." D4 §1 has not been updated. This cascades into React 19, React Native 0.83, and React Navigation v7.

| Package | Installed | Purpose | D4 §1 match? |
|---|---|---|---|
| expo | ^55.0.24 | Expo runtime / framework | **DEVIATION** — D4 locks SDK 52 |
| react-native | 0.83.6 | Core framework | **DEVIATION** — SDK 52 era is RN 0.76.x |
| react | 19.2.0 | UI library | Implicit deviation (SDK 52 = React 18.3) |
| react-dom / react-native-web | 19.2.0 / ^0.21.0 | Web rendering | NOT in D4 §1 (web is Phase 2) |
| typescript | ~5.9.2 | Type safety | MATCHES ("5.x") |
| nativewind | ^4.2.3 | Styling | MATCHES ("4.x") |
| tailwindcss | ^3.3.2 | Tailwind engine | Implicit dep of NativeWind |
| @react-navigation/native, bottom-tabs, native-stack | ^7.x | Navigation | **DEVIATION** — D4 locks v6; v7 installed. Also the app uses **Expo Router** file-based routing, which D4 §1 never mentions. |
| @supabase/supabase-js | ^2.105.3 | DB/Auth/Storage client | MATCHES |
| expo-av | ^16.0.8 | Voice recording | MATCHES name — but **expo-av is deprecated on SDK 53+**; forward-compatibility risk on SDK 55 |
| expo-image-picker | ~55.0.20 | Camera/library | MATCHES |
| expo-image-manipulator | ~55.0.16 | Photo compression | Not named in D4 §1 (D4 §3.3 mandates the behaviour, not the lib) |
| @stripe/stripe-react-native | 0.63.0 | Payments | MATCHES intent ("Stripe SDK") |
| expo-secure-store | ~55.0.14 | JWT storage | Required by D4 §5.1/§9; not in §1 table |
| @react-native-async-storage/async-storage | 2.2.0 | Key-value storage | Not in D4 §1 — **must audit no JWT is stored here** (D4 §5.1 forbids JWT in AsyncStorage) |
| @react-native-community/netinfo | 11.5.2 | Connectivity | Not in D4 §1; supports offline handling |
| @react-native-google-signin/google-signin | ^14.0.0 | Native Google Sign-In | Not in D4 §1 (D4 mandates Google OAuth, names no lib) |
| **expo-print** | ~55.0.15 | **PDF generation** | **DEVIATION** — D4 §1 names `react-pdf`. `react-pdf` is NOT installed. |
| expo-sharing | ~55.0.19 | Native share sheet | Required by D4 §11; not in §1 table |
| expo-print/font/constants/linking/web-browser/status-bar/dev-client, @expo/vector-icons, safe-area-context, screens, reanimated, worklets, babel-preset-expo | various | Standard Expo/RN support + peer deps | Not in D4 §1 (D4 §1 lists only headline tech) |

#### D4 §1 technologies NOT installed / unverified

- **React Navigation v6** — v7 installed instead.
- **react-pdf** — NOT installed; replaced by `expo-print`. This also invalidates D4 §10's claim that the PDF lib is browser-reusable.
- **Resend (email)** — **no npm package and no dedicated Edge Function found.** Email/OTP likely runs through Supabase Auth's built-in email. **Flag: Resend, a named D4 §1 technology, has no visible integration** — needs confirmation. (`create-team-member` does reference `RESEND_API_KEY` for the credentials email, so Resend IS used server-side there — but not for auth OTP.)
- Anthropic / OpenAI Whisper / OpenAI Embeddings / Stripe Identity — accessed server-side via Edge Functions (no client SDK); consistent with D4 §6.1. Not deviations.
- Expo EAS — configured via `eas.json` (not an npm dep). Matches.

**Verdict:** three locked D4 §1 points are violated (Expo SDK version, React Navigation version, PDF library). Per D4's own rule, D4 §1 must be re-versioned or the build is formally non-compliant with a locked spec. `expo-av` deprecation is a latent maintenance risk.

---

### SECTION 3 — SUPABASE DATABASE AUDIT

Reference: D5 vs applied migrations 00001–00007 (confirmed pushed to `quvcparzpurwwkrxpiki`).

**Summary:** all 11 application tables exist and are structurally faithful to D5 — every column, type, CHECK constraint and D5 §14 index is present. Deviations are: (1) RLS uses single `FOR ALL` policies rather than D5's four per-command policies; (2) four tables still lack `WITH CHECK`; (3) two undocumented columns; (4) only one of four "locked fields" is trigger-enforced.

**users** — Exists YES. Columns YES (+ undocumented `is_suspended boolean` from 00005). CHECK constraints YES (all 7). RLS enabled YES. RLS policies **PARTIAL** — `users_own_row` is USING-only, **no WITH CHECK** (INSERT not owner-scoped); `users_team_owner_read` (00004) adds team-owner SELECT. Indexes YES (but `idx_users_email`, `idx_users_stripe_customer_id` created as plain B-tree though D5 §14 labels them UNIQUE — column-level UNIQUE still enforces). Triggers YES — `users_updated_at`, `lock_vat_number`. **Flag: D5 lists `license_number`, `license_proof_url`, `national_id_url` as locked fields "via trigger" — NO trigger enforces these three; only `vat_number` is locked.**

**team_members** — Exists YES. Columns YES. CHECK n/a. RLS enabled YES. RLS policies **PARTIAL** — `team_members_policy` is USING-only `FOR ALL` with `auth.uid() = team_owner_id OR auth.uid() = member_id`; **a member can INSERT/UPDATE/DELETE their own team_members row**, contrary to D5's owner-only write rule. Indexes: none specified, none created (matches). Triggers: none (matches).

**job_sessions** — Exists YES. Columns YES (incl. self-FK `parent_session_id`). CHECK YES. RLS enabled YES. RLS policies **YES** (post-00007) — `FOR ALL USING + WITH CHECK (auth.uid() = user_id)` + team-owner SELECT (00004). Indexes YES (user_id, status, created_at DESC). Triggers YES — `job_sessions_updated_at`.

**messages** — Exists YES. Columns YES. CHECK YES (`role`, `session_stage BETWEEN 1 AND 5`). RLS enabled YES. RLS policies **YES** (post-00007) — `FOR ALL` with `WITH CHECK` on the job_sessions-ownership subquery + team-owner SELECT. Indexes YES. Triggers none (matches).

**job_reports** — Exists YES. Columns YES (incl. `UNIQUE(session_id, version_number)`). CHECK YES. RLS enabled YES. RLS policies **YES** (post-00007). Indexes YES. Triggers YES — `lock_finalised_report`.

**quotes** — Exists YES. Columns YES (incl. `line_items jsonb`). CHECK YES. RLS enabled YES. RLS policies **YES** (post-00007). Indexes YES. Triggers YES — `lock_finalised_quote`.

**worker_preferences** — Exists YES. Columns **PARTIAL** — all 9 D5 columns present **plus undocumented `default_payment_methods jsonb` (added by 00006)**. CHECK YES. RLS enabled YES. RLS policies YES (post-00007). Indexes none specified (matches). Triggers YES — `worker_preferences_updated_at`.

**subscriptions** — Exists YES. Columns YES. CHECK YES (all 3). RLS enabled YES. RLS policies **PARTIAL** — USING-only, no WITH CHECK (not hardened by 00007). Low real exposure (service-role webhook writes). Indexes YES (`idx_subscriptions_stripe_id` plain B-tree though D5 labels UNIQUE). Triggers none (matches).

**billing_history** — Exists YES. Columns YES. CHECK n/a. RLS enabled YES. RLS policies **PARTIAL** — USING-only, no WITH CHECK. Low real exposure. Indexes none specified (matches). Triggers none (matches).

**code_chunks** — Exists YES. Columns YES (incl. `embedding vector(1536)`). CHECK YES (`trade_type IN (...,'general')`). RLS enabled YES. RLS policies **YES** — `code_chunks_read FOR SELECT USING (auth.role()='authenticated')`. Indexes YES — HNSW `vector_cosine_ops (m=16, ef_construction=64)` + trade_type B-tree. Triggers none. **DATA STATE: 0 rows — empty (see Section 9).**

**code_documents** — Exists YES. Columns YES (incl. `UNIQUE(short_name, version)`). CHECK n/a (D5 omits one — matches). RLS enabled YES — `code_documents_read FOR SELECT`. Indexes none specified (matches). Triggers none. **DATA STATE: 0 rows — empty.**

#### Extensions / RPC / Triggers

**pgvector:** YES — `CREATE EXTENSION IF NOT EXISTS vector;` is the first statement of 00001.

**match_documents() RPC:** YES — exact SQL as applied:
```sql
CREATE OR REPLACE FUNCTION match_documents(query_embedding vector(1536), filter_trade_type text, match_count int DEFAULT 5)
RETURNS TABLE(id uuid, content text, section_number text, document_name text, version text, similarity float) LANGUAGE plpgsql AS $$
BEGIN RETURN QUERY SELECT c.id, c.content, c.section_number, c.document_name, c.version, 1 - (c.embedding <=> query_embedding) AS similarity
FROM public.code_chunks c WHERE c.trade_type = filter_trade_type ORDER BY c.embedding <=> query_embedding LIMIT match_count; END; $$;
```
Line-for-line equivalent to D5 §11. (Minor: no `SECURITY DEFINER` / pinned `search_path` — acceptable here.)

**updated_at trigger:** YES — exact SQL:
```sql
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER job_sessions_updated_at BEFORE UPDATE ON public.job_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER worker_preferences_updated_at BEFORE UPDATE ON public.worker_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**prevent_finalised_update trigger:** YES — exact SQL:
```sql
CREATE OR REPLACE FUNCTION prevent_finalised_update() RETURNS TRIGGER AS $$ BEGIN IF OLD.status = 'finalised' THEN RAISE EXCEPTION 'Cannot modify a finalised document'; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER lock_finalised_report BEFORE UPDATE ON public.job_reports FOR EACH ROW EXECUTE FUNCTION prevent_finalised_update();
CREATE TRIGGER lock_finalised_quote BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION prevent_finalised_update();
```
(Cosmetic deviation: D5 §6 raises "Cannot modify a finalised report"; implemented as "...document" since one function serves both tables.)

A 12th table `audit_logs` (in D5's index, no D5 SQL given) was created with RLS `FOR ALL USING (false)` (service-role only). A `decrement_trial_query(user_id uuid)` RPC also exists (not in D5; spec-consistent helper).

**Database verdict:** high-fidelity implementation of D5. Actionable findings: un-hardened RLS on `users`/`team_members` (genuine cross-write gaps), three unenforced locked fields, two undocumented columns to reconcile into D5.

---

### SECTION 4 — EDGE FUNCTIONS AUDIT

All 15 functions on the project are deployed and **STATUS = ACTIVE** (verified via `supabase functions list`). The 11 D10-scoped functions are audited below. **Secret values cannot be verified from the repo** — every "env vars confirmed set" is **needs remote verification** (`supabase secrets list`).

**handle-stripe-webhook** — Deployed YES. Matches D10 PARTIAL (improvements). Auth: Stripe signature (`STRIPE_WEBHOOK_SECRET`, verified first). Logic: correct — handles subscription + invoice events, returns 200 even on processing error (no Stripe retries). Beneficial deviations: customer-resolution fallback via `metadata.supabase_user_id`; **already hardened against the Stripe API-version gotcha** (`periodDates()` and `invoiceSubscriptionId()` read both old and new field locations). Minor: omits D10's `billing_reason === "subscription_create"` skip. Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, 8× STRIPE_PRICE_*.

**kyc-webhook** — Deployed YES. Matches D10 YES. Auth: Stripe signature (`STRIPE_IDENTITY_WEBHOOK_SECRET`). Logic correct — handles `verified`/`requires_input`/`processing`, updates KYC status columns, fires push on verify/reject. Minor: error-response body differs. Env: STRIPE_SECRET_KEY, STRIPE_IDENTITY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

**decrement-trial-query** — Deployed YES. Matches D10 YES. Auth: user JWT. Logic correct — active subs → unlimited; trial ≤0 → exhausted; else atomic `decrement_trial_query` RPC. Minor: silent fallback on RPC error instead of D10's 500. Env: SUPABASE_URL, SERVICE_ROLE_KEY, ANON_KEY.

**stripe-create-checkout** — Deployed YES. Matches D10 YES. Auth: user JWT. Logic correct — KYC gate (both verified else 403), already-subscribed gate, get/create customer, incomplete subscription, returns client_secret + ephemeral_key. Minor: 403 body less detailed. Env: STRIPE_SECRET_KEY, SUPABASE keys, 6× STRIPE_PRICE_*.

**stripe-update-subscription** — Deployed YES. Matches D10 **PARTIAL**. Auth: user JWT. **DEVIATION: `add_seat` does NOT enforce the 10-seat cap** (D10 requires it; the cap survives only because `create-team-member` checks it first). Also no "already annual" 409 guard. Env: STRIPE_SECRET_KEY, SUPABASE keys, 8× STRIPE_PRICE_*.

**kyc-status-check** — Deployed YES (v5, redeployed this session). Matches D10 **PARTIAL — intentionally extended**. Auth: user JWT. The status-reporting path matches D10. **By design, it now also accepts `{verify_document}` and mints a Stripe Identity `verificationSessions.create()`, returning the hosted `verification_url`** — the fix for the KYC gap. **Consequence: it now requires `STRIPE_SECRET_KEY`, which D10 never listed for this function — confirm it is set or the function hard-fails.** Env: SUPABASE keys + STRIPE_SECRET_KEY.

**calculate-days-remaining** — Deployed YES. Matches D10 **PARTIAL**. Auth: user JWT. Day-count math correct. **DEVIATION: omits `billing_cycle`, `monthly_amount`, `seat_count` from the response** (D10 requires them; never queries `subscriptions`). Env: SUPABASE keys.

**send-push-notification** — Deployed YES. Matches D10 **NO — THIS IS A STUB.** Auth: **none** (no header check at all; D10 says service-role-only). **The deployed function never imports the Supabase client, never reads `expo_push_token`, and NEVER calls the Expo Push API. No push notification is ever delivered.** It only `console.log`s and returns `{sent}`. Every caller (`kyc-webhook` verify/reject, `handle-stripe-webhook` payment_failed) silently no-ops. **This is the single most serious Edge Function defect.**

**create-team-member** — Deployed YES. Matches D10 **PARTIAL**. Auth: team-owner JWT + plan check. Logic mostly correct — 10-seat cap enforced, creates auth user + profile + team link, `add_seat`, 2× Stripe Identity sessions, Resend email, rollback on failure. Deviations: no request-field validation; no duplicate-email pre-check; SMS credential delivery omitted (email only); `APP_URL` unused. Env: SUPABASE keys, STRIPE_SECRET_KEY, RESEND_API_KEY.

**delete-team-member** — Deployed YES. Matches D10 YES. Auth: team-owner JWT. Logic correct — `confirmation === "DELETE"` gate, self-delete block, ownership check, full cascade (messages → reports → quotes → sessions → prefs → link → storage → profile → auth user → `remove_seat`). Minor: check ordering. Env: SUPABASE keys.

**ingest-code-document** — Deployed YES. Matches D10 **PARTIAL**. Auth: **NONE — D10 mandates a service-role-key gate; the deployed function performs no auth check and adds permissive CORS.** An admin-only RAG-ingestion endpoint is exposed unauthenticated. Logic: chunking + embeddings + inserts present, but **no batching** (one OpenAI call per chunk — will not scale to a real code book and may exceed Edge Function limits), **no duplicate guard**, and the request field is `content` where D10 specifies `text_content`. Also accepts plain text only — no PDF parsing. Env: SUPABASE_URL, SERVICE_ROLE_KEY, OPENAI_API_KEY.

Four functions outside D10 scope also exist and are ACTIVE: `claude-proxy` (rewritten this session — assembles the Rex system prompt server-side from `trade_type`+`mode` via `prompts.ts`; still accepts a raw `system` for the summariser), `whisper-proxy`, `embedding-proxy`, `delete-account`.

**Stripe API-version gotcha:** all Stripe functions pin `stripe@13.0.0` / `apiVersion 2023-10-16`. `handle-stripe-webhook` is hardened. **Both Stripe Dashboard webhook endpoints' API versions must be confirmed as `2023-10-16` or older**, or billing-period fields and `kyc-webhook` payloads can break.

**Edge Functions verdict:** all deployed and ACTIVE; most are behaviourally faithful. Three real defects: the **non-functional `send-push-notification` stub**, the **unauthenticated `ingest-code-document`**, and the **missing 10-seat check in `stripe-update-subscription`**.

---

### SECTION 5 — AI OPTIMISATION LAYER AUDIT

All five files exist and are wired into the Claude/RAG/photo paths.

**`services/router.ts`** — Exists YES. Wired YES (`anthropic.ts streamRexResponse` calls `routeModel` before every Claude call). Exact logic:
```ts
if (sessionStage <= 2)            return 'claude-sonnet-4-5-20250929';   // stages 1, 2
if (sessionStage === 4)           return 'claude-sonnet-4-5-20250929';   // stage 4
if (messageType === 'lookup')     return 'claude-sonnet-4-5-20250929';   // code lookup
if (messageType === 'diagnosis')  return 'claude-sonnet-4-5-20250929';
return 'claude-haiku-4-5-20251001';                                     // stages 3,5 / confirmation / formatting / summary
```
Sonnet → stages 1, 2, 4, code lookup: **CONFIRMED**. Haiku → stages 3, 5, confirmations, summarisation: **CONFIRMED** (in `useRexSession`, stage 3/5 sends `messageType: 'confirmation'` → Haiku). **Minor deviation:** the extra `messageType === 'diagnosis' → Sonnet` rule means a stage-3/5 message *typed* as `diagnosis` would route to Sonnet — but no caller does that, so behaviour matches D4 §3.1 in practice. **Note:** reports and quotes do NOT route through `router.ts` at all — they are not AI-generated (see Section 8); D4 §3.1's "Haiku to reports/quotes" assumes AI generation that the build does not do.

**`services/summariser.ts`** — Exists YES. Wired YES (`useRexSession` calls `shouldCompress`/`compressHistory`). `shouldCompress(count)` = `count > 10` → **compression triggers at message 11: CONFIRMED**. `compressHistory` sends `messages.slice(0,-3)` for summarisation and keeps `messages.slice(-3)` raw → **last 3 messages always raw: CONFIRMED**. **DEVIATION:** D4 §3.2 specifies re-summarisation **every 8 messages**; the implementation re-summarises on **every message past 10** (there is no every-8 modulo). Compression model: `claude-haiku-4-5-20251001`. (The summariser's `claude-proxy` call now includes the Authorization header — fixed this session.)

**`services/imageCompression.ts`** — Exists YES. Wired YES (`usePhotoCapture`). Exact logic: `stage <= 1 → {quality: 0.6, maxDimension: 1024}`; `stage === 2 → {0.5, 800}`; `stage 3+ → {0.4, 600}`. Stage 1 = 60%/1024px, Stage 2 = 50%/800px, Stage 3+ = 40%/600px: **ALL CONFIRMED — matches D4 §3.3 exactly.** (Plus a silent recompression pass when base64 exceeds the 8 MB cap.)

**`services/ragInjector.ts`** — Exists YES. Wired YES (`services/rag.ts` `getRAGChunkCount`). Exact logic: `messageType === 'report' || 'quote' → 0`; `stage <= 2 → 5`; else `→ 2`. Stages 1-2 = 5 chunks, Stages 3-5 = 2 chunks, reports/quotes = 0: **ALL CONFIRMED — matches D4 §3.4 exactly.**

**`constants/limits.ts`** — `SESSION_SOFT_CAP = 30`; `SESSION_WARNING_AT = 28`. **Both match D4 §3.5 exactly.** (File also defines `TRIAL_QUERY_LIMIT=10`, `MAX_TEAM_MEMBERS=10`, `MAX_PHOTO_SIZE_MB=10`, `CLAUDE_TIMEOUT_MS=30000`.)

**Section 5 verdict:** the optimisation layer is correctly implemented and wired. One deviation: the summariser re-compresses every message past 10 instead of D4 §3.2's "every 8 messages." The three relocated files (`utils/` → `services/`) are noted in Section 1.

---

### SECTION 6 — AUTHENTICATION & SIGN-UP AUDIT (M1)

**SIGN-UP FORM** (`app/(auth)/signup.tsx`):
- Step 1: full name, email, password (≥8 chars + strength meter), phone (country code + number) — plus an "OR SIGN UP WITH" Google/phone block.
- Step 2: trade type, account type (solopreneur/team owner), hourly rate, VAT number.
- Step 3: license proof photo (required), license number, national ID photo (required), company name (optional), company logo (optional).
- Compared to D1 §7: all required fields present, no missing fields. Built as **3 steps per D1 §7 + BuildGuide** (D2's "single form" was the documented deviation). Create Account button disabled until `step1Valid && step2Valid && step3Valid`: **YES**.
- VAT locked after creation: **YES** — DB trigger `lock_vat_number` (`prevent_vat_number_update`, migration 00002) raises an exception on any UPDATE of `vat_number`; UI shows it in a read-only `LockedRow` with a 🔒 badge in Settings → Profile.

**OTP VERIFICATION** (`app/(auth)/otp-verify.tsx`): Email OTP YES; SMS OTP YES; both on a single screen YES; both required before `createUserProfile` runs YES (`useEffect` gated on `emailVerified && phoneVerified`); resend per channel after 60s YES (`RESEND_COOLDOWN_S=60`); wrong code ×3 → 5-minute lockout YES (`MAX_WRONG=3`, `LOCKOUT_S=300`, m:s countdown). **Caveat:** actual simultaneous email+SMS delivery depends on Supabase Auth phone/email provider config — NOT verifiable from the repo.

**TERMS & CONDITIONS:** overlay YES (`components/shared/TermsOverlay.tsx`); acceptance required before account creation YES (`onAgree` is the only path to `onCreateAccount`); acceptance date + version stored YES (`createUserProfile` writes `terms_accepted_at` + `terms_version='v1.0'`).

**KYC:** national ID upload YES; license proof upload YES (both → `kyc-documents` bucket via `uploadKycPhoto`). **Stripe Identity session created after sign-up: NO (by design) — DEVIATION.** Verification is now **user-initiated** from Settings → Profile ("Verify identity" button → `kyc-status-check` mints the Stripe Identity session and returns the hosted URL). Consequently both KYC statuses are seeded **`not_uploaded`, NOT `pending`** after sign-up. This is an intentional architecture decision (the prior build never created a session at all); it diverges from a literal reading of D1/D8 which expect `pending` + processing begun at sign-up. Trial queries (10) available immediately: YES — `users.trial_queries_remaining` DB default is 10.

**SIGN-IN** (`app/(auth)/signin.tsx`): email+password YES; Google OAuth YES (native Google Sign-In + `signInWithIdToken`); phone+OTP YES (routes to `phone-signin.tsx`); all three on one screen YES; forgot password YES (`forgot-password.tsx`); Save Password toggle YES (SecureStore via `useSavePassword`), OFF by default YES; session persistence / auto sign-in YES (`AuthContext` + `RootLayout` gate).

**ERROR STATES (D6 Flow02 S10):** wrong password YES; account not found + create link YES; 15-minute lockout with countdown YES — **but client-side component state only (resets on app restart, bypassable) — DEVIATION**; account suspended YES (`AccountSuspendedScreen`); no internet YES; phone not registered YES (on `phone-signin.tsx`).

**POST SIGN-IN ROUTING:** active → Home YES; trial + queries → Home + trial banner YES; expired → Home + features disabled + paywall on tap — **PARTIAL** (no distinct expired routing branch; expired users land on Home and are gated per-feature).

**HOME SCREEN:** all 6 bottom-nav tabs present YES — Home, Rex, Report, Quote, Codes, History.

**D6 WIREFRAME COMPLIANCE (structural):**
- *flow_01 onboarding (8 screens):* Welcome MATCHES; Terms overlay MATCHES; OTP screens MATCH. Splash PARTIAL (no dedicated splash screen). Sign-up steps PARTIALLY MATCH — the wireframe distributes fields differently across steps (hourly rate/VAT on Step 1, license/ID on Step 2) and shows a Step-3 review card + "I agree" checkbox that the build does not have (it goes Create Account → Terms overlay directly).
- *flow_02 sign-in (10 screens):* Welcome, three-method sign-in, email sign-in, forgot-password (both phases), phone-OTP entry all MATCH. Splash PARTIAL. Phone-OTP code screen PARTIAL (no resend countdown / "different number" / lockout on that screen). Error states PARTIAL (system `Alert` dialogs, not inline coloured banners). Google OAuth routing PARTIAL.

**M1 verdict: PARTIALLY COMPLIANT.** Core auth is solid. Genuine gaps: sign-in lockout is client-side only (bypassable); KYC seeds `not_uploaded` not `pending` (intentional but a spec divergence); no in-progress sign-up form persistence; no dedicated splash; expired-subscription routing not distinct.

---

### SECTION 7 — REX DIAGNOSTIC AUDIT (M2)

**REX SESSION OPENING:** `useRexSession.openSession()` sends a single priming message instructing Rex to ask all six context questions in one natural message, referencing the prompt's "SESSION OPENING — MANDATORY CONTEXT CAPTURE" block. The 3 universal + 3 plumber-specific questions are present **verbatim in the server-side prompt** (`claude-proxy/prompts.ts` `PLUMBER_V2`). Whether Rex actually emits all six in one natural (non-list) message is **NOT TESTED — runtime required**.

**D7 PRINCIPLES (15):** All 15 principles are present as instruction text in the server-side trade prompts (verbatim D7 v2.0). Client-side enforcement exists for a subset; the rest are model-discretion.
- P1 Ambiguity — prompt-only — NOT TESTED (runtime).
- P2 Response sequence (diagnosis→issue→cause→solution→code→safety) — prompt "RESPONSE STRUCTURE" block — NOT TESTED.
- P3 Knowledge limits — prompt-only — NOT TESTED.
- P4 Code compliance + AHJ note — prompt "CODE RULE" — NOT TESTED.
- P5 Safety last / gas-leak first — prompt "SAFETY FORMAT" + "SAFETY RULES" — NOT TESTED; **no client-side enforcement** (see below).
- P6 Worker pushback — **PARTIALLY IMPLEMENTED (client)** — `useRexSession.onContextualAction` runs a genuine two-step `pushbackCount` protocol: first press sends a "hold + ask one confirming input" directive, second sends "adopt my position." The actual two-message behaviour is runtime.
- P7 Code authority hierarchy — prompt-only — NOT TESTED.
- P8 Cross-trade boundary — prompt "CROSS-TRADE BOUNDARY" — NOT TESTED.
- P9 Scope escalation — prompt "SCOPE ESCALATION" — NOT TESTED.
- P10 Worker sovereignty — prompt "WORKER SOVEREIGNTY — LOCKED" — NOT TESTED.
- P11 Apprentice mode — **IMPLEMENTED (client)** — `useRexSession` detects the apprentice question in Rex's output (`/walk through each step/i`), dispatches `APPRENTICE_ASK`, surfaces a Yes/No prompt; `onApprenticeAnswer` records the choice and instructs Rex; "asked once" guarded by `apprenticeAsked`.
- P12 Materials — prompt "MATERIALS RULE" — NOT TESTED.
- P13 Session opening (6 questions) — prompt-driven — NOT TESTED.
- P14 Continuous clarification — prompt-only — NOT TESTED.
- P15 Stage progression — prompt-only behavioural rule — NOT TESTED. Note: client stage tracking now uses an explicit `[[STAGE:n]]` marker emitted by Rex (server `STAGE_PROTOCOL_ADDENDUM`), parsed and stripped by `anthropic.ts`, with the old regex heuristic as a fallback.

**FIVE STAGES:** Stage 1–5 contextual buttons all implemented (`components/rex/ContextualButtons.tsx`, stage-aware). **DEVIATION:** the button *labels* do not match the D8-specified text (e.g. Stage 1 build = "Looks right / Disagree / Need more detail"; D8 = "Take photo / Describe further / That is all I have"). Worker can skip stages: YES (no client gate blocks input). Close Job always visible from Stage 1: YES. Report + Quote buttons only after Close Job: YES (`canShowReportQuote = state.closed`).

**WORKER PUSHBACK PROTOCOL:** two-step implemented — YES (see P6). D6 Flow04 Pushback A/B screens: no dedicated UI — the protocol is conveyed via message content; **DOES NOT MATCH** the wireframe's distinct screens (function present, presentation absent).

**APPRENTICE MODE:** detection of low-experience signals — prompt-side; asks once — YES (`apprenticeAsked` guard); two paths (expanded/standard) — YES (`onApprenticeAnswer` sends the corresponding instruction); never repeats — YES. D6 Flow04 Apprentice screen: **MATCHES** (Yes/No prompt rendered in `[sessionId].tsx`).

**INPUTS:** voice recording (expo-av) YES; Whisper transcription YES; editable transcript before sending YES; photo capture YES; stage-aware compression wired YES; text input always available YES.

**API CALLS:** all Claude calls via Edge Function proxy YES (`anthropic.ts` → `claude-proxy`); Anthropic key never in mobile files YES (verified — see Section 11); **streaming: PARTIAL** — RN cannot reliably read an SSE body stream, so `anthropic.ts` uses a buffered request and then **reveals the text word-by-word** via `revealWordByWord` (typewriter effect, ~1.1s) — functionally satisfies "appears word by word" but is not true token streaming; input bar dims during streaming YES; `router.ts` called before every call YES; `summariser.ts` triggered at message 11 YES; `ragInjector.ts` called for every message YES (via `rag.ts`).

**TRIAL MANAGEMENT:** `decrement-trial-query` called after each response YES — **and now correctly AFTER a successful Claude response** (fixed this session; a failed/timed-out reply no longer burns a query); mobile app never modifies `trial_queries_remaining` directly YES; trial exhaustion — full response THEN inline notice YES (`[sessionId].tsx` renders an in-thread trial-exhaustion notice; input locks); paywall over session, session preserved YES.

**SESSION MANAGEMENT:** sessions saved to `job_sessions` YES; messages saved to `messages` YES; restoration amber banner on Home YES; Rex recap on Continue YES (Home/Rex "Continue" now pass `recap:true`, fixed this session; `useRexSession` recap effect fires); soft-cap warning at 28 YES; linked-session prompt at 30 YES (`startLinkedSession` compresses history into a new child session via `parent_session_id`).

**D7 SAFETY — PLUMBER (gas leak STOP):** the "STOP — POTENTIAL GAS PRESENCE" instruction is present **verbatim** in `PLUMBER_V2` SAFETY RULES rule 1, delivered to Claude as the system prompt. **However, there is NO app-side or server-side enforcement** — no keyword detection, no special UI treatment, no guarantee the STOP block fires. It is entirely model discretion. This is consistent with D7 (the prompt IS the mechanism) but there is no code-level safety net.

**OFFLINE & ERROR STATES:** message queued when offline YES (`useOfflineQueue` wired this session; queued indicator shown); auto-sends on reconnect YES; Claude 30s timeout handled YES (`AbortController`; mapped to a user message); Claude 5xx handled YES (surfaced as an error banner); Whisper failure fallback to text YES (alert + text input remains). **DEVIATION:** D8 TC-058–061 specify explicit **Retry buttons** and specific error copy ("Taking longer than usual", "Rex unavailable", truncated-bubble-with-red-border, "Retry Whisper" + preserved audio) — these specific affordances are NOT implemented; errors surface as a generic red banner.

**D6 WIREFRAME COMPLIANCE — flow_04 rex session (14 screens, structural):** Session-opening 6-question screen NOT IMPLEMENTED as a distinct client screen (prompt-driven). Stage 1 start, voice recording, streaming response, Stage 3 step guidance, Stage 4 final exam: MATCH / PARTIALLY MATCH (button labels and "roadmap strip"/"clearance card" cosmetics differ). Pushback A/B: NOT IMPLEMENTED as screens. Apprentice prompt: MATCHES. Close + name job: MATCHES (job-naming modal). Soft cap: MATCHES (linked-session button + trial notice + offline indicator). Reopen session: PARTIALLY MATCHES (recap wired; no previous-session summary card).

**M2 verdict: PARTIALLY COMPLIANT.** After this session's fixes, all the previously-missing M2 features (apprentice mode, offline queue, trial-exhaustion notice, word-by-word reveal, recap trigger, Stage-5 naming, linked session, server-side prompt, post-success decrement) are present and wired. Remaining gaps: contextual-button labels don't match D8; Rex API error states lack the D8 Retry affordances; gas-leak STOP has no code-level enforcement; AI behavioural compliance is entirely unverified (runtime required).

---

### SECTION 8 — REPORT & QUOTE GENERATION AUDIT (M3)

**REPORT PATH A** (`app/document/report.tsx` with `sessionId`): implemented YES; job context "pre-loaded" — **PARTIAL** — the builder *says* Rex has the session details but does **not** actually load prior session messages into generation; the report is built only from a fresh voice/text summary. Voice summary + Whisper YES; editable transcript YES.

**REPORT PATH B** (standalone, no `sessionId`): implemented YES (creates a `session_source='report_standalone'` row). **Rex asks for full job description / follow-up questions: NO** — it is a single voice/text summary field, not an interactive Rex document-generation conversation. **DEVIATION.**

**BOTH PATHS:** section picker shown first time only YES (`SectionPicker`, gated on no saved prefs); sections saved to `worker_preferences` YES; VAT/license inclusion toggles YES (in the preview, as `Switch` toggles — not a conversational Rex ask); report preview editable inline YES; confirm permanently locks YES (`confirmReport` sets `status='finalised'`; DB trigger `prevent_finalised_update` enforces — code path correct, DB enforcement not runtime-verified); draft auto-discarded on exit YES (`discardReportDraft` deletes `status='draft'` rows); discard prompt before leaving YES (`beforeRemove` listener). **PDF generated via react-pdf: NO — DEVIATION — `expo-print` is used instead** (documented in `documents.ts`). PDF stored in Supabase Storage `job-documents` bucket YES (code path; round-trip not runtime-verified). Native share sheet YES (`expo-sharing`). Report versioning YES (`nextVersion`). New archive entry for both paths YES.

**QUOTE PATH A & B** (`app/document/quote.tsx`): both implemented YES; Path A reuses prior report data — **PARTIAL** — seeds one line item from the latest finalised report's `confirmed_amount` and labour hours from `time_on_jobsite_seconds`, but does not reuse client info or itemised materials. Line items editable (name/qty/unit cost/auto total) YES; payment method selection (6 options, multi-select) YES (`PaymentMethodSelector`); **payment method saved as default — YES (fixed this session** — `confirmQuote` path now persists `default_payment_methods` via `savePrefs`; migration 00006 added the column); validity period 30-day default, editable YES (`DEFAULT_VALIDITY_DAYS`); quote confirm permanently locked YES; quote versioning YES.

**NOT BUILT (M3):** Rex does not compute a **suggested payment amount** (hours × rate + materials) for reports — `ReportPreview` accepts a `suggestedAmount` prop that is never passed; the worker types the amount freely. No **markup guidance** (15–30%) on quotes. No **"hourly rate not set" flag** + Settings link. No **uncertain-line asterisk** on quote lines (Rex does not generate line items at all). No swipe-to-delete on line items (an ✕ button is used).

**D6 WIREFRAME COMPLIANCE — flow_05 report (8 screens) & flow_06 quote (8 screens), structural:** Path A / Path B entry, section picker, draft preview, confirm-lock, confirmed/PDF-ready, discard-on-exit all **MATCH or PARTIALLY MATCH**. Recurring deviations: confirm-lock and discard are system `Alert` dialogs, not the designed full-screen warning / bottom-sheet; the section picker has no drag-to-reorder; report "materials" is a free-text section, not structured line items; the screens are plain forms, not the Rex chat-thread presentation the wireframes depict.

**M3 verdict: PARTIALLY COMPLIANT.** The document lifecycle (draft → edit → confirm-lock → PDF → version → archive) is solid and the payment-method default bug is fixed. The significant divergence: **Rex does not actually generate report/quote content** — both are manual forms, where D2/D3/D6 specify a conversational Rex document-generation mode with AI-suggested amounts and line items. `expo-print` substitutes for the D4-specified `react-pdf`.

---

### SECTION 9 — TRADE CODE LOOKUP & RAG PIPELINE AUDIT (M4)

**RAG PIPELINE:** `ingest-code-document` Edge Function deployed YES (ACTIVE). **IPC 2021 ingested: NO.** **`code_documents` table: 0 rows. `code_chunks` table: 0 rows.** Verified directly via the Supabase REST API with the service-role key (`Content-Range: */0` on both tables). **The vector store is completely empty.** `match_documents()` RPC exists and is correct, but with zero chunks it returns zero rows for every query. No IPC 2021 source file, seed script, or ingestion artifact exists anywhere in the repo.

**CODE LOOKUP SCREEN** (`app/(tabs)/codes.tsx`): voice input YES; text input YES; no special syntax required YES.

**RESPONSE FORMAT:** plain-language answer first — prompt-driven (server `CODE_LOOKUP_ADDENDUM`) — NOT TESTED (runtime). Code section citation after the answer — NOT TESTED. **AHJ note always appended — YES, enforced in code:** `codeLookup.ts ensureAhj()` programmatically appends the exact `AHJ_NOTE` string to **every** result, including error results — guaranteed regardless of model output (defence-in-depth). Citation tappable / shows full code text — component (`CitationCard`) supports it, **but no citation ever renders because `code_chunks` is empty.**

**RULES:** code lookups do NOT decrement `trial_queries_remaining` — **YES, confirmed in code** — `codeLookup.ts` calls `streamRexResponse` directly and never invokes `decrement-trial-query` (database before/after evidence not collected — no runtime — but the code path provably has no decrement). Inside a Rex session "Add to job notes" button YES (`codes.tsx` inserts a `messages` row when an active session exists). Temporary trade switch YES (`activeTrade` local state); reverts on exit YES (`blur` listener restores the profile trade; `users.trade_type` is never written). Offline — last 10 lookups cached YES (`useCodeLookupCache`, AsyncStorage). Rex never fabricates section numbers — enforced only by the prompt (`CODE_LOOKUP_ADDENDUM` explicitly forbids it) — NOT TESTED.

**D6 WIREFRAME COMPLIANCE — flow_07 code lookup (8 screens), structural:** lookup home, in-session "Add to job notes", citation card, temporary trade switch, offline cache all MATCH or PARTIALLY MATCH. No "quick query" suggestion buttons; no follow-up input that retains context; no dedicated full-screen code-table view; no distinct "no match found" / uncertainty UI (those depend on model output).

**M4 verdict: NOT FUNCTIONALLY COMPLETE.** All client code and the RAG plumbing exist and are correctly wired. **But the feature does not work** — the vector store is empty, so every code lookup returns an answer with zero citations (Rex answering from general knowledge + the programmatic AHJ note). M4 cannot pass its gate criteria until trade-code content is ingested. Separately, `ingest-code-document` has no admin authentication and no batching, and accepts plain text only.

---

### SECTION 10 — API CALLS & WORKFLOWS AUDIT

#### External API calls

| Call | Provider | Triggered by | Route | Auth | Payload | Response | Error handling | Cost |
|---|---|---|---|---|---|---|---|---|
| Rex diagnosis / lookup | Anthropic | Worker sends a message; code lookup | app → `claude-proxy` Edge Function → api.anthropic.com | user JWT (gateway) → `ANTHROPIC_API_KEY` server-side | model, trade_type, mode, rag_context, messages, max_tokens | JSON `content[]` blocks | 30s timeout (AbortController), 5xx → error banner | Sonnet ~$3/$15 per M tok; Haiku ~$1/$5 per M tok |
| Conversation summary | Anthropic | Message count > 10 | app → `claude-proxy` → Anthropic | user JWT + raw `system` | haiku model, system, messages | summary text | falls back to "Session summary unavailable." | Haiku, small |
| Voice transcription | OpenAI Whisper | Worker stops a voice recording | app → `whisper-proxy` → api.openai.com | user JWT → `OPENAI_API_KEY` server-side | audio file (.m4a) | transcript text | failure → alert, text input remains | ~$0.006/min |
| Embedding | OpenAI | Code lookup query; document ingestion | app/function → `embedding-proxy` → OpenAI | user JWT / service role → `OPENAI_API_KEY` | text | 1536-dim vector | empty → no RAG context | ~$0.02 per M tok |
| Stripe checkout / subscription | Stripe | Paywall subscribe; plan change | app → `stripe-create-checkout` / `stripe-update-subscription` → api.stripe.com | user JWT → `STRIPE_SECRET_KEY` | plan/cycle/action | client_secret, ids | 4xx mapped to errors | per-transaction |
| Stripe Identity session | Stripe | "Verify identity" in Settings | app → `kyc-status-check` → api.stripe.com | user JWT → `STRIPE_SECRET_KEY` | verify_document | hosted `verification_url` | 502 `verification_unavailable` | per verified session |
| Stripe / KYC webhooks | Stripe → app | Stripe events | Stripe → `handle-stripe-webhook` / `kyc-webhook` | Stripe signature | event payload | 200 | always 200 (no retry storms) | n/a |
| Supabase DB/Auth/Storage | Supabase | Throughout | app → Supabase (PostgREST/GoTrue/Storage) | user JWT + RLS | queries / files | rows / files | per-call error handling | included |
| Trial decrement | Supabase Edge | After a successful Rex response | app → `decrement-trial-query` | user JWT | — | new count | fire-and-forget `.catch()` | included |

#### Workflows (end to end)

**W1 — Voice message to Rex:** mic tap → `useVoiceRecording.startRecording` (expo-av) → release → `stopRecording` returns `.m4a` URI → `transcribeAudio` → `whisper-proxy` → OpenAI Whisper → transcript → placed in the editable text field → worker edits → Send → `useRexSession.sendMessage` → persist user message to `messages` → compress history if >10 → RAG retrieval (`rag.ts` → `embedding-proxy` → `match_documents`) → `streamRexResponse` → `claude-proxy` (server assembles prompt) → Anthropic → buffered response → `[[STAGE:n]]` parsed/stripped → revealed word-by-word → persisted as an assistant message → `decrement-trial-query` → stage advanced.

**W2 — Photo to Rex:** camera tap → `usePhotoCapture.capture(stage)` → `expo-image-picker` → stage-aware compression (`imageCompression.ts`) + 8 MB recompression → pending-photo preview → Send → photo injected as base64 multimodal content on the latest user message → same `claude-proxy` → Anthropic path as W1.

**W3 — Code lookup:** query (voice or text) on the Codes tab → `codeLookup.lookupCode` → `embedding-proxy` embedding → `match_documents` RPC (**currently returns 0 rows — empty store**) → `streamRexResponse` (`mode:'lookup'`, no trial decrement) → `claude-proxy` → Anthropic → `ensureAhj()` appends the AHJ note → rendered with `CitationCard`s (**none, store empty**) → cached by `useCodeLookupCache`.

**W4 — Sign up:** Create Account → 3-step form validates → Terms overlay → agree → `startSignUp` (`supabase.auth.signUp` email+password+phone) → OtpVerify screen → email + SMS codes verified → `createUserProfile` uploads KYC photos to `kyc-documents`, inserts the `users` row (KYC statuses `not_uploaded`, `terms_accepted_at`) → `AuthContext` gate routes to Home tabs.

**W5 — Confirm a report:** Confirm tap → warning Alert → `confirmReport` → `expo-print` renders the PDF → uploaded to the `job-documents` Storage bucket → `job_reports` row updated to `status='finalised'` + `pdf_url` → `prevent_finalised_update` trigger now locks the row → VAT/license choices saved as defaults → success banner + native share.

**W6 — Trial decrement:** worker sends a Rex message → **after** the Claude response succeeds → `supabase.functions.invoke('decrement-trial-query')` → Edge Function checks subscription (active → no decrement) → atomic `decrement_trial_query` RPC with a `>= 0` floor → new count returned. The mobile app never writes `trial_queries_remaining` directly.

**W7 — KYC verification:** Settings → Profile → "Verify identity" on a non-verified document → `checkKycStatus(kind)` → `kyc-status-check` mints `stripe.identity.verificationSessions.create()`, sets the status column to `pending`, returns the hosted `verification_url` → app opens it in an in-app browser (`expo-web-browser`) → worker completes Stripe's flow → Stripe fires an event → `kyc-webhook` (signature-verified) updates `national_id_kyc_status`/`license_kyc_status` to `verified`/`rejected`. (Note: the verified/rejected **push notification** would be sent by `send-push-notification` — which is a non-functional stub, see Section 4.)

---

### SECTION 11 — SECURITY AUDIT

**RULE — API keys never in the mobile bundle:** **VERIFIED.** Grep of `app/`, `services/`, `hooks/`, `components/`, `constants/` for `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, service-role keys — none present. Only `EXPO_PUBLIC_*` keys (Supabase URL + anon key, Stripe **publishable** key, Google client IDs) are in `.env`/the bundle, which is correct. All AI keys live only in Edge Functions. `.env.example` documents the split.

**RULE — all Claude calls via Edge Function proxy:** **VERIFIED.** Call chain for a Rex message: `useRexSession.sendMessage` → `services/anthropic.streamRexResponse` → `fetch(${SUPABASE_URL}/functions/v1/claude-proxy)` with the user's JWT → `claude-proxy` adds `ANTHROPIC_API_KEY` server-side → `api.anthropic.com`. No direct Anthropic call exists in the app.

**RULE — RLS on every table:** **VERIFIED enabled on all 12 tables.** Policy *correctness* is **PARTIAL** — `job_sessions`, `messages`, `job_reports`, `quotes`, `worker_preferences` were hardened with `WITH CHECK` (migration 00007); `users`, `team_members`, `subscriptions`, `billing_history` remain **USING-only (INSERT not owner-scoped)**. `code_chunks`/`code_documents` are correctly read-only-for-authenticated. `audit_logs` is `USING (false)`. **Cross-user isolation test: NOT performed** — no runtime/second-account test was possible in this audit. The `team_members` policy additionally permits a *member* to write their own join row, contrary to D5.

**RULE — webhook signatures verified:** **VERIFIED for both.** `handle-stripe-webhook`: `await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET)` before any processing — on failure returns 400. `kyc-webhook`: `constructEventAsync(body, sig, STRIPE_IDENTITY_WEBHOOK_SECRET)` before any processing — on failure returns 400. Both reject a missing signature with 401.

**RULE — `trial_queries_remaining` server-side only:** **VERIFIED.** The mobile app never writes the column; it is decremented only via the `decrement-trial-query` Edge Function calling the atomic `decrement_trial_query` RPC. The DB CHECK constraint `trial_queries_remaining >= 0` is present (migration 00001).

**RULE — DB trigger locks confirmed documents:** **VERIFIED present.** `prevent_finalised_update` is attached to `job_reports` (`lock_finalised_report`) and `quotes` (`lock_finalised_quote`). **Direct-UPDATE test on a finalised row: NOT performed** (no runtime). The trigger logic is correct by inspection.

**RULE — DELETE confirmations:** M6–M8 scope; `delete-team-member` already requires `confirmation === "DELETE"`, and `delete-account` exists. Not in M0–M4 scope — noted for a future audit.

**Additional security findings:**
- **`ingest-code-document` has NO authentication** — D10 mandates a service-role-key gate; the deployed function checks nothing and adds permissive CORS. An admin-only ingestion endpoint is exposed.
- **`send-push-notification` has no auth check** (it is a non-functional stub anyway).
- AsyncStorage is installed — D4 §5.1 forbids storing the JWT there. Session persistence uses Supabase's SecureStore-backed storage; AsyncStorage usage (offline queue, code-lookup cache) should be audited to confirm no JWT/session data is written to it.
- Sign-in and OTP lockouts are **client-side component state only** — bypassable by an app restart; not server-enforced.

---

### SECTION 12 — D8 TEST CASES AUDIT

**Method:** code inspection only — no runtime. No case is marked PASS. Statuses: IMPLEMENTED (code) / PARTIALLY IMPLEMENTED / NOT IMPLEMENTED / NOT TESTED — runtime required / NOT VERIFIABLE — remote/infra. **Section-numbering note:** the D8 document's true boundaries are Section A TC-001–022, B TC-023–065, C TC-066–086, D TC-087–103, E (Trade Code Lookup) TC-104–117, F (Job History) TC-118–131 — this audit follows the D8 document, not the request brief's TC numbering.

#### Section A — Authentication & Onboarding (TC-001–022)
- TC-001 Sign-up 3-step structure / fields — IMPLEMENTED (code) — `signup.tsx`.
- TC-002 Create Account greyed until valid — PARTIALLY IMPLEMENTED — step-boolean gating only; no per-field inline blur errors.
- TC-003 VAT permanently locked — IMPLEMENTED (code) — `LockedRow` + `lock_vat_number` trigger.
- TC-004 Email + SMS OTP simultaneously — NOT TESTED — runtime required — single screen + dual `verifyOtp` wired.
- TC-005 Both OTPs required before proceeding — IMPLEMENTED (code).
- TC-006 OTP resend per channel after 60s — IMPLEMENTED (code).
- TC-007 Wrong OTP ×3 → 5-min lockout — IMPLEMENTED (code) — but client-side state only.
- TC-008 OTP expires after 10 min — NOT VERIFIABLE — remote/infra (Supabase OTP TTL); app shows a generic "Wrong code", not "Code expired".
- TC-009 Terms read + agreed, acceptance stored — IMPLEMENTED (code).
- TC-010 KYC both docs submitted, processing begins, trial available — PARTIALLY IMPLEMENTED — photos upload; statuses seeded `not_uploaded` not `pending`; verification is user-initiated later. Correct per D8: both statuses `pending`, Stripe processing begun.
- TC-011 KYC verified → push → paywall unlocks — PARTIALLY IMPLEMENTED — paywall gate exists; **no push** (`send-push-notification` is a stub / `expo-notifications` deferred).
- TC-012 KYC rejected → push → re-upload — PARTIALLY IMPLEMENTED — re-verify CTA exists; no push.
- TC-013 Google OAuth, email pre-verified, only SMS OTP — PARTIALLY IMPLEMENTED — no separate SMS-OTP gate after Google sign-in.
- TC-014 Session persists, auto sign-in — IMPLEMENTED (code).
- TC-015 Forgot password → reset → new password — IMPLEMENTED (code).
- TC-016 Save Password toggle, off by default, SecureStore — IMPLEMENTED (code).
- TC-017 Wrong password lockout at 5 — PARTIALLY IMPLEMENTED — client-side only, bypassable on restart.
- TC-018 Account not found → create link — IMPLEMENTED (code).
- TC-019 Account suspended, history read-only — PARTIALLY IMPLEMENTED — suspended screen replaces the whole stack; History is NOT reachable read-only; no "Contact support" button.
- TC-020 Force upgrade blocker — PARTIALLY IMPLEMENTED — `ForceUpgradeScreen` exists but is **never rendered** (dead code).
- TC-021 No internet at sign-in, message, data preserved — IMPLEMENTED (code).
- TC-022 Abandon mid-form, data restored — NOT IMPLEMENTED — no local persistence of the in-progress sign-up form.

#### Section B — Rex Diagnostic (TC-023–065)
- TC-023 Rex opens from tab + New Job — IMPLEMENTED (code).
- TC-024 Subscription check before camera — IMPLEMENTED (code).
- TC-025 6 context questions in one message — NOT TESTED — runtime required.
- TC-026–029 Trade-specific questions (Plumber/Electrician/HVAC/Roofer) — NOT TESTED — runtime required (verbatim in server prompts).
- TC-030 Photo compressed by stage — IMPLEMENTED (code) — `imageCompression.ts` buckets confirmed 60/1024, 50/800, 40/600.
- TC-031 Voice → Whisper → editable transcript — IMPLEMENTED (code).
- TC-032 Camera denied, greyed, Settings link, text/voice work — IMPLEMENTED (code).
- TC-033 Mic denied, voice greyed, text focused — PARTIALLY IMPLEMENTED — text not auto-focused.
- TC-034 Response streams word by word, input dims — IMPLEMENTED (code) — word-by-word reveal of a buffered response.
- TC-035 Response sequence — NOT TESTED — runtime required.
- TC-036 Gas leak STOP first — NOT TESTED — runtime required (prompt-only, no enforcement).
- TC-037 Cracked heat exchanger STOP — NOT TESTED — runtime required.
- TC-038 Fall protection confirmed — NOT TESTED — runtime required.
- TC-039 Electrician LOTO confirmed — NOT TESTED — runtime required.
- TC-040 Ambiguous photo, Rex stops — NOT TESTED — runtime required.
- TC-041 Worker pushback two-step — NOT TESTED — runtime required (two-step logic wired in `useRexSession`).
- TC-042 Knowledge limit, names source — NOT TESTED — runtime required.
- TC-043 Code compliance + AHJ — NOT TESTED — runtime required.
- TC-044 Scope escalation — NOT TESTED — runtime required.
- TC-045 Worker sovereignty — NOT TESTED — runtime required.
- TC-046 Apprentice mode detect/ask once — IMPLEMENTED (code) — detection + Yes/No prompt + once-guard.
- TC-047 Close Job always visible from Stage 1 — IMPLEMENTED (code).
- TC-048 Report/Quote only after Close Job — IMPLEMENTED (code).
- TC-049 Worker can skip stages — NOT TESTED — runtime required (no client gate).
- TC-050 Correct contextual buttons per stage — PARTIALLY IMPLEMENTED — buttons exist; **labels do not match D8 text**.
- TC-051 Stage progression, no perfection gate — NOT TESTED — runtime required.
- TC-052 Warning at 28, linked session at 30 — IMPLEMENTED (code).
- TC-053 App closed mid-session, amber banner — PARTIALLY IMPLEMENTED — banner shows message count, not stage; no pulsing dot.
- TC-054 Continue → Rex recap — IMPLEMENTED (code) — `recap:true` wired.
- TC-055 Query 10, full response THEN inline notice — IMPLEMENTED (code) — decrement after success + in-thread notice.
- TC-056 Trial at 0, paywall over session — IMPLEMENTED (code).
- TC-057 No internet, message queued, auto-sends — IMPLEMENTED (code).
- TC-058 Mid-stream disconnect, truncated + Retry — PARTIALLY IMPLEMENTED — error banner only; no truncated-bubble/Retry.
- TC-059 Claude timeout 30s, "Taking longer", Retry — PARTIALLY IMPLEMENTED — timeout handled; no interim message / Retry.
- TC-060 Claude 5xx, "Rex unavailable", Retry — PARTIALLY IMPLEMENTED — generic error; no Retry / exact copy.
- TC-061 Whisper fail, audio preserved, Retry — PARTIALLY IMPLEMENTED — alert + text works; audio not preserved, no Retry.
- TC-062 Refrigerant substitution — NOT TESTED — runtime required.
- TC-063 Cross-trade boundary — NOT TESTED — runtime required.
- TC-064 NEC edition delta — NOT TESTED — runtime required.
- TC-065 Job naming, auto-named if skipped — PARTIALLY IMPLEMENTED — close-job modal requires a name (`closeName.trim()`); **not skippable, no auto-name fallback**.

#### Section C — Report Generation (TC-066–086)
- TC-066 Generate Report only after Close Job — IMPLEMENTED (code).
- TC-067 Path B, Rex asks for description + follow-ups — PARTIALLY IMPLEMENTED — single summary field, no conversational flow.
- TC-068 Both paths create an archive entry — IMPLEMENTED (code).
- TC-069 First-time section picker, saved — IMPLEMENTED (code).
- TC-070 Voice summary, Whisper, editable — IMPLEMENTED (code).
- TC-071 VAT/license toggle per report — PARTIALLY IMPLEMENTED — static toggles, not a conversational ask.
- TC-072 Rex calculates suggested payment — NOT IMPLEMENTED — no hours×rate+materials calculation.
- TC-073 Preview sections editable inline — IMPLEMENTED (code).
- TC-074 Confirm permanently locked — IMPLEMENTED (code).
- TC-075 Draft auto-discarded + prompt — IMPLEMENTED (code).
- TC-076 PDF generated, stored, accessible — NOT TESTED — runtime required (code path correct; `expo-print` not `react-pdf`).
- TC-077 Native share sheet — IMPLEMENTED (code).
- TC-078 Hourly rate not set, flagged, skip — NOT IMPLEMENTED.
- TC-079 No internet, draft preserved, PDF auto-gen on reconnect — PARTIALLY IMPLEMENTED — draft persists; no offline-aware confirm/auto-gen.
- TC-080 Multiple versions independent — IMPLEMENTED (code).
- TC-081 Custom section via voice / Add button — PARTIALLY IMPLEMENTED — Add button only; not Rex-populated, not reorderable.
- TC-082 Path A reuses session data — PARTIALLY IMPLEMENTED — session context not actually pre-loaded into generation.
- TC-083 Swipe-left delete on line item — NOT IMPLEMENTED — ✕ button, no swipe gesture.
- TC-084 Archive entry links to report — IMPLEMENTED (code).
- TC-085 Very short description flagged — NOT IMPLEMENTED.
- TC-086 Confirmed docs read-only — IMPLEMENTED (code).

#### Section D — Quote Generator (TC-087–103)
- TC-087 Path A reuses report data — PARTIALLY IMPLEMENTED — coarse confirmed-amount seed only.
- TC-088 Path B, Rex asks for description — PARTIALLY IMPLEMENTED — manual line entry, no conversation.
- TC-089 Line items material/qty/cost/total — PARTIALLY IMPLEMENTED — editable, but not Rex-generated.
- TC-090 Labour hours × rate pre-populated — PARTIALLY IMPLEMENTED — rate snapshot + Path A time seed; not extracted from a description.
- TC-091 Markup guidance, total as range — NOT IMPLEMENTED.
- TC-092 Payment method multi-select, saved default — IMPLEMENTED (code) — default-save fixed this session.
- TC-093 Validity 30-day default, editable — IMPLEMENTED (code).
- TC-094 Total auto-calculates real time — IMPLEMENTED (code).
- TC-095 Confirm permanently locked, PDF — IMPLEMENTED (code).
- TC-096 Draft auto-discarded + prompt — IMPLEMENTED (code).
- TC-097 Quote versioning independent — IMPLEMENTED (code).
- TC-098 Quote/report independent — IMPLEMENTED (code).
- TC-099 Payment terms, saved default — IMPLEMENTED (code).
- TC-100 Add line, blank row editable — IMPLEMENTED (code).
- TC-101 Rex flags uncertain lines with asterisk — NOT IMPLEMENTED.
- TC-102 Hourly rate not set, labour line skipped — NOT IMPLEMENTED.
- TC-103 Confirmed quote read-only — IMPLEMENTED (code).

#### Section E — Trade Code Lookup (TC-104–117)
- TC-104 Codes accessible inside + outside Rex — PARTIALLY IMPLEMENTED — tab access yes; no in-session Codes entry that keeps the session open on screen.
- TC-105 Voice or text query, no syntax — IMPLEMENTED (code).
- TC-106 Plain answer first, citation, AHJ — NOT TESTED — runtime required (AHJ guaranteed by code).
- TC-107 AHJ note always appended — IMPLEMENTED (code) — `ensureAhj()` on every path.
- TC-108 Citation tappable, full text — PARTIALLY IMPLEMENTED — component works but **no citation renders — `code_chunks` empty**.
- TC-109 States uncertainty, never fabricates — NOT TESTED — runtime required.
- TC-110 Follow-up retains context — NOT IMPLEMENTED — each lookup is independent.
- TC-111 In-session "Add to job notes" — IMPLEMENTED (code).
- TC-112 Temporary trade switch, profile unchanged — IMPLEMENTED (code).
- TC-113 No trial decrement for lookups — IMPLEMENTED (code).
- TC-114 Offline, last 10 cached — PARTIALLY IMPLEMENTED — cache works; new offline queries not cleanly blocked with a message.
- TC-115 No matching code, general guidance — NOT TESTED — runtime required (currently always hit — empty store).
- TC-116 Cross-trade question — NOT TESTED — runtime required.
- TC-117 Empty state, first use — IMPLEMENTED (code).

#### Section F — Job History (TC-118–131)
- TC-118 Chronological list, job card fields — IMPLEMENTED (code).
- TC-119 Search by name/date/jobsite — PARTIALLY IMPLEMENTED — name + jobsite only, not date.
- TC-120 Empty state, Start first job CTA — IMPLEMENTED (code).
- TC-121 Job Detail 4 tabs — IMPLEMENTED (code).
- TC-122 Rex tab read-only chat — PARTIALLY IMPLEMENTED — read-only yes; Reopen is in the header, not a bottom button.
- TC-123 Reports tab View/Download/Share — IMPLEMENTED (code).
- TC-124 Quotes tab View/Download/Share — IMPLEMENTED (code).
- TC-125 Photos tab grid, full screen — PARTIALLY IMPLEMENTED — no stage label, no download in the modal.
- TC-126 Reopen Job, recap — IMPLEMENTED (code).
- TC-127 New reports don't replace originals — IMPLEMENTED (code).
- TC-128 Job name only editable field — IMPLEMENTED (code).
- TC-129 Job deletion, confirmation, cascade — IMPLEMENTED (code).
- TC-130 Expired sub, History browsable — IMPLEMENTED (code).
- TC-131 Drafts never appear in History — IMPLEMENTED (code).

**D8 tally (code inspection):** ~57 IMPLEMENTED (code), ~33 PARTIALLY IMPLEMENTED, ~10 NOT IMPLEMENTED, ~28 NOT TESTED — runtime required, 1 NOT VERIFIABLE. **Zero confirmed PASS — runtime testing has not been done.**

---

### SECTION 13 — ISSUES, DEVIATIONS & FIXES REQUIRED

| # | Sev | Section | Doc ref | Description | Correct behaviour | Fix required | Blocks M5? |
|---|---|---|---|---|---|---|---|
| 1 | CRITICAL | 9, 12 | D4 §4, D10 | `code_chunks` / `code_documents` are empty (0 rows) — M4 code lookup returns zero citations | Vector store populated with IPC 2021 (and other code books) | Source code-book text, run `ingest-code-document` for each; verify `match_documents` returns chunks | NO (M5 = Job History, independent) |
| 2 | HIGH | 4, 12 | D10 | `send-push-notification` is a non-functional stub — never calls the Expo Push API; all KYC/payment notifications silently no-op | Function sends real Expo push notifications | Implement the real D10 function (read `expo_push_token`, POST to Expo Push API); register `expo-notifications` client-side | NO |
| 3 | HIGH | 4, 11 | D10 | `ingest-code-document` has no authentication — admin-only endpoint exposed | Service-role-key gate per D10 | Add the `Authorization` service-role check; reject otherwise | NO |
| 4 | HIGH | 3, 11 | D5 | RLS on `users` and `team_members` is USING-only (no `WITH CHECK`); a member can write their own `team_members` row | Owner-scoped INSERT/UPDATE/DELETE per D5 | New migration: re-create both policies with correct `WITH CHECK`; restrict `team_members` writes to `team_owner_id` | NO |
| 5 | HIGH | 2 | D4 §1 | Build runs Expo SDK 55 / RN 0.83 / React Navigation v7 against a D4-locked SDK 52 / v6 | Either match the locked stack or re-version D4 §1 | Re-version D4 §1 to SDK 55 (recommended) or document the deviation formally | NO |
| 6 | MEDIUM | 3 | D5 §2 | Only `vat_number` is trigger-locked; `license_number`, `license_proof_url`, `national_id_url` are not | All four locked via trigger | Migration: extend `prevent_vat_number_update` (or add triggers) to the three KYC fields | NO |
| 7 | MEDIUM | 4 | D10 | `stripe-update-subscription` `add_seat` does not enforce the 10-seat cap | Block at 10 seats (`max_seats_reached`) | Add the `team_members` count check before the Stripe quantity update | NO |
| 8 | MEDIUM | 4 | D10 | `kyc-status-check` now requires `STRIPE_SECRET_KEY` (not in D10's env list) | Secret set on the live project | Run `supabase secrets list`; set `STRIPE_SECRET_KEY` if absent; update D10 | NO (KYC gates M6, not M5) |
| 9 | MEDIUM | 4 | D10 | `calculate-days-remaining` omits `billing_cycle`/`monthly_amount`/`seat_count` | Response includes them | Add a `subscriptions` query and the three fields | NO |
| 10 | MEDIUM | 4 | D10 | `ingest-code-document`: one OpenAI call per chunk (no batching); will not scale to a real code book | Batch 20 chunks/call with delay | Rewrite to batch embeddings; add a duplicate guard; accept `text_content` | NO |
| 11 | MEDIUM | 7, 12 | D8 TC-058-061 | Rex API/timeout/Whisper errors lack the specified Retry buttons and exact copy | Truncated bubble + Retry; "Taking longer"; "Rex unavailable"; preserved audio | Add Retry affordances + the D8 copy to the Rex error paths | NO |
| 12 | MEDIUM | 7, 12 | D8 TC-050, D6 | Stage contextual-button labels do not match D8 | Labels per D8 per stage | Update `ContextualButtons.tsx` label set | NO |
| 13 | MEDIUM | 8, 12 | D2/D3, D8 TC-067/082/087-090 | Rex does not generate report/quote content — both are manual forms | Conversational Rex document-generation with AI-suggested amounts/line items | Build the Rex document-generation flow, or formally accept the form-based deviation | NO |
| 14 | MEDIUM | 8, 12 | D8 TC-072/078/091/101/102 | No suggested-payment calculation, markup guidance, rate-not-set flag, or uncertain-line flagging | Compute amounts; show guidance/flags | Implement the calculation + flags in the report/quote builders | NO |
| 15 | MEDIUM | 6, 12 | D8 TC-007/017 | Sign-in / OTP lockouts are client-side state only (bypassable on restart) | Server-enforced lockout | Enforce via Supabase (rate-limit / server-side counter) | NO |
| 16 | MEDIUM | 12 | D8 TC-020 | `ForceUpgradeScreen` exists but is never rendered (dead code) | Version check renders the blocker | Wire a `min_version` check into `RootLayout` | NO |
| 17 | MEDIUM | 2 | D4 §1 | `expo-print` substituted for the D4-locked `react-pdf` | Match D4 §1 or re-version it | Accept + re-version D4 §1 (expo-print is the correct native choice) | NO |
| 18 | MEDIUM | 2 | D4 §1 | Resend (email) has no detected integration for auth OTP (only `create-team-member` uses it) | Confirm email delivery path | Verify whether Supabase Auth email or Resend handles OTP; document it | NO |
| 19 | MEDIUM | 5 | D4 §3.2 | Summariser re-compresses on every message past 10, not "every 8 messages" | Re-summarise every 8 messages | Add the every-8 modulo to `shouldCompress`/the caller | NO |
| 20 | MEDIUM | 12 | D8 TC-019 | Suspended users cannot reach History read-only; no "Contact support" button | History read-only + support action | Adjust `AccountSuspendedScreen` / routing | NO |
| 21 | LOW | 6, 12 | D8 TC-010 | KYC statuses seeded `not_uploaded` not `pending` at sign-up (intentional new design) | D8 expects `pending` + processing begun | Reconcile D1/D8 with the user-initiated KYC design, or auto-create sessions at sign-up | NO |
| 22 | LOW | 1 | D4 §2 | `utils/` files moved to `services/`; `supabase/` and extra files not in D4 §2; no `scripts/` folder | D4 §2 reflects reality | Re-version D4 §2 | NO |
| 23 | LOW | 1 | D4 §7 | `NetworkContext` is a 4th context vs D4 §7's "three contexts" | D4 §7 reflects reality | Re-version D4 §7 | NO |
| 24 | LOW | 3 | D5 §14 | `idx_users_email`, `idx_users_stripe_customer_id`, `idx_subscriptions_stripe_id` created as plain B-tree though D5 labels UNIQUE | UNIQUE indexes | Cosmetic — column-level UNIQUE already enforces; optionally recreate as UNIQUE | NO |
| 25 | LOW | 3 | D5 | `worker_preferences.default_payment_methods` and `users.is_suspended` undocumented in D5 | D5 documents all columns | Reconcile into D5 | NO |
| 26 | LOW | 12 | D8 TC-002/022 | No inline field validation; no sign-up form restore on abandon | Inline errors; persisted form | Add blur validation + AsyncStorage form persistence | NO |
| 27 | LOW | 12 | D8 TC-083 | No swipe-to-delete on quote line items (✕ button instead) | Swipe-left reveals delete | Add a `Swipeable` row | NO |
| 28 | LOW | 12 | D8 TC-110 | No follow-up input on code lookup; each query is context-free | Follow-up retains context | Add a follow-up input + history | NO |
| 29 | LOW | 6/8 D6 | D6 | No splash screen; confirm/discard use system `Alert` not the designed full-screen/bottom-sheet; section picker no drag-reorder | Match wireframes | Cosmetic UI polish pass | NO |
| 30 | LOW | 4 | D10 | `decrement-trial-query` silently falls back on RPC error instead of returning 500 | Error surfaced | Restore the explicit error branch | NO |
| 31 | INFO | 7 | D7 | Gas-leak STOP is prompt-only — no code-level enforcement | D7 makes the prompt the mechanism | Acceptable per D7; optionally add a client-side safety net | NO |
| 32 | INFO | 4 | — | Stripe Dashboard webhook-endpoint API versions not verified | `2023-10-16` or older | Confirm both endpoints' API version in the Stripe Dashboard | NO |

**No issue hard-blocks starting M5 (Job History).** Issue #1 blocks M4 from being *functional*; #2/#3/#4 are security/quality issues that should be fixed before launch.

---

### SECTION 14 — WHAT IS COMPLETE, WHAT IS MISSING

**COMPLETE AND COMPLIANT (code-level):**
- M0: Expo project + folder structure (modulo D4 §2 staleness), TypeScript throughout, NativeWind 4, three context providers (+NetworkContext), the 5 AI-optimisation files (router/summariser/imageCompression/ragInjector/limits — correct logic), all 11 D5 tables + indexes + CHECK constraints + pgvector + `match_documents` + both triggers, 15 Edge Functions deployed ACTIVE.
- M1: 3-step sign-up with full D1 §7 field set, validation gating, VAT DB lock, dual email+SMS OTP with resend + lockout, Terms overlay with stored acceptance, KYC photo upload, 3-method sign-in, forgot password, Save Password (SecureStore, off by default), session persistence, 6-tab Home, the documented sign-in error states.
- M2: Rex session lifecycle, voice (Whisper) + photo (stage-aware compression) + text inputs, claude-proxy with server-side prompt assembly (RULE 10), word-by-word reveal, model routing, history compression, RAG injection, two-step pushback, apprentice mode, soft-cap warning + linked session, recap on reopen, post-success trial decrement, trial-exhaustion notice, offline queue, Close-Job naming modal, post-close Report/Quote gating.
- M3: report + quote Path A/B, section picker with saved prefs, inline-editable previews, VAT/license toggles, confirm → finalise → PDF (`expo-print`) → Storage → versioned archive, draft discard-on-exit, payment-method multi-select with persisted defaults (fixed this session).
- M4 (code only): Codes tab with voice/text, embedding → `match_documents` → Claude pipeline, programmatic AHJ-note enforcement, citation component, "Add to job notes", temporary trade switch, offline cache, no trial decrement for lookups.
- Security: no API keys in the bundle, all Claude calls proxied, RLS enabled on every table, both webhooks signature-verified, server-side trial decrement with a `>= 0` constraint, finalised-document lock triggers.

**PARTIALLY COMPLETE:**
- M1: KYC (statuses `not_uploaded` not `pending`; verification user-initiated); sign-in lockout (client-side only); expired-subscription routing (not distinct); no splash screen; no in-progress form persistence.
- M2: contextual-button labels (don't match D8); Rex API error states (no Retry affordances/copy); gas-leak STOP (prompt-only); session banner (shows count not stage); AI behavioural compliance entirely unverified.
- M3: Rex document generation (manual forms, not conversational AI generation); no suggested-amount calculation; no markup guidance; Path A session context not truly pre-loaded; `expo-print` vs `react-pdf`.
- M4: **functionally incomplete** — pipeline built but vector store empty; `ingest-code-document` unauthenticated, unbatched, plain-text-only; no follow-up context.
- Edge Functions: `stripe-update-subscription` (no seat cap), `calculate-days-remaining` (trimmed response), `create-team-member` (no validation/SMS).

**NOT BUILT YET (within M0–M4 scope):**
- A populated trade-code vector store (M4 data).
- A functional `send-push-notification` (and client `expo-notifications` registration).
- Force-upgrade wiring (component exists, never rendered).
- Suggested-payment calculation / markup guidance / rate-not-set flags (M3).
- Sign-up form persistence; inline field validation.
- Server-enforced auth lockouts.
- Code-lookup follow-up; swipe-to-delete.
- A dedicated splash screen.

---

### SECTION 15 — READINESS ASSESSMENT

| Milestone | Complete & fully compliant? |
|---|---|
| **M0** | **PARTIALLY** — all infrastructure built and deployed; deviations are documentation staleness (D4 §1/§2/§7 out of date) plus the un-hardened RLS on `users`/`team_members`. |
| **M1** | **PARTIALLY** — auth works end-to-end; gaps are client-only lockouts, KYC `not_uploaded` seeding, no form persistence, no splash. |
| **M2** | **PARTIALLY** — all features now present in code after this session's fixes; gaps are button labels, error-state affordances, and the fact that **no AI behaviour is runtime-verified**. |
| **M3** | **PARTIALLY** — document lifecycle solid; the substantive gap is that Rex does not actually generate report/quote content (manual forms). |
| **M4** | **NO** — code-complete but **non-functional**: the vector store is empty; `ingest-code-document` is unauthenticated and unbatched. |

**IS THE BUILD READY TO PROCEED TO M5: YES (with conditions).**
M5 (Job History) is independent of the outstanding issues — no issue in Section 13 hard-blocks starting or signing off M5. However, the build is **not launch-ready**, and the following should be scheduled before launch (not necessarily before M5):

**CRITICAL — must be fixed before M4 can be considered functional:**
1. Issue #1 — ingest trade-code content into the vector store.

**HIGH — must be fixed before launch:**
2. Issue #2 — implement the real `send-push-notification` (KYC/payment notifications silently fail).
3. Issue #3 — authenticate `ingest-code-document`.
4. Issue #4 — harden RLS on `users` / `team_members`.
5. Issue #5 — reconcile the Expo SDK 55 / navigation / PDF-library deviations against the "locked" D4 §1 (re-version D4).

**RUNTIME VERIFICATION GAP (process, not a code fix):** zero D8 test cases have been executed. Before launch, the ~28 NOT-TESTED behavioural cases and the AI-quality cases (D7 principles, gas-leak STOP, response sequencing) must be run against a live build. This audit cannot certify runtime behaviour.

**ESTIMATED FIXES REQUIRED BEFORE M5:** none are strictly blocking. **Before launch:** ~5 HIGH/CRITICAL + ~15 MEDIUM = roughly **20 fixes**, complexity ranging from trivial (re-version docs, restore an error branch) to substantial (real push-notification function, trade-code ingestion run, Rex document-generation flow). Plus a full runtime QA pass against D8.

---

*End of report. Generated by Claude Code, 2026-05-20. This report reflects code inspection and live infrastructure state only; it does not certify runtime behaviour.*
