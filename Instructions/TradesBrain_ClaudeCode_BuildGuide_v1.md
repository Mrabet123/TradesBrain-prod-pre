**TRADESBRAIN**

**Claude Code Build Execution Guide**

*12 Steps · Complete Claude Code Prompts · Founder + Frontend + Backend Evaluation Checklists*

|             |                   |
|-------------|-------------------|
| **Version** | v1.0 --- Official |

|          |            |
|----------|------------|
| **Date** | April 2026 |

|                  |                                                                |
|------------------|----------------------------------------------------------------|
| **Build engine** | Claude Code --- sole code author for entire app (front + back) |

|          |                                                                    |
|----------|--------------------------------------------------------------------|
| **Team** | Founder (final evaluator) · Frontend Developer · Backend Developer |

|                 |                                  |
|-----------------|----------------------------------|
| **Total steps** | 12 milestones --- M0 through M11 |

|                     |                                               |
|---------------------|-----------------------------------------------|
| **Source of truth** | D1 through D10 + D6 wireframes --- all locked |

|                     |                                    |
|---------------------|------------------------------------|
| **Confidentiality** | Confidential --- Internal use only |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>HOW TO USE THIS DOCUMENT:</p>
<p>1. Each step has a CLAUDE CODE PROMPT. Copy it exactly and paste it into Claude Code.</p>
<p>2. Upload the listed documents to Claude Code before running the prompt (see Section 1).</p>
<p>3. Claude Code builds everything. You do not write code.</p>
<p>4. Use the evaluation checklists to verify the result before moving to the next step.</p>
<p>5. Do not proceed to the next step until ALL checklist items are confirmed.</p>
<p>CAN CLAUDE CODE BUILD A FULL REACT NATIVE MOBILE APP?</p>
<p>Yes. Claude Code writes all TypeScript, React Native components, Supabase SQL,</p>
<p>Edge Function code, Stripe integration, and configuration files. It does not</p>
<p>deploy to the App Store (you do that) but it builds everything that goes inside it.</p></td>
</tr>
</tbody>
</table>

**SECTION 1 --- HOW TO SEND DOCUMENTS TO CLAUDE CODE**

This is the most important thing to understand before you start. Claude Code can only follow specifications it can read. If you do not provide the documents, it will make up its own decisions --- and they will be wrong.

**What documents does Claude Code need?**

For each step, the prompt tells you exactly which documents to upload. The documents are:

- D1 PRD v1.2 --- TradesBrain_D1_PRD_v1.docx

- D2 User Flows v1.0 --- TradesBrain_D2_UserFlows_v1.docx

- D3 Feature Specs v1.0 --- TradesBrain_D3_FeatureSpecs_v1.docx

- D4 Technical Architecture v1.0 --- TradesBrain_D4_TechArchitecture_v1.docx

- D5 Database v1.0 --- TradesBrain_D5_Database_v1.docx

- D6 Wireframes (13 HTML files) --- flow_01 through flow_12

- D7 AI System Prompts v2.0 --- TradesBrain_D7_AISystemPrompts_v2.docx

- D8 Test Plan v1.0 --- TradesBrain_D8_TestPlan_v1.docx

- D9 Stripe Integration v1.0 --- TradesBrain_D9_StripeIntegration_v1.docx

- D10 Edge Functions v1.0 --- TradesBrain_D10_EdgeFunctions_v1.docx

**How to upload documents to Claude Code --- step by step**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>STEP 1 — Open Claude Code in VS Code</p>
<p>Click the Claude Code icon in VS Code (left sidebar). A chat panel opens.</p>
<p>STEP 2 — Upload the documents for this step</p>
<p>At the bottom of the Claude Code chat panel, look for a paperclip icon or</p>
<p>'Attach files' option. Click it. Upload ONLY the documents listed in the</p>
<p>'OFFICIAL DOCUMENTATION' section of the prompt for this step.</p>
<p>Do not upload all 10 documents at once — only the ones specified for the step.</p>
<p>STEP 3 — Paste the prompt</p>
<p>Copy the complete prompt from this document (the dark box for each step).</p>
<p>Paste it into the Claude Code chat input.</p>
<p>Press Enter. Claude Code starts building.</p>
<p>STEP 4 — Claude Code works</p>
<p>Claude Code will create files, write code, and run terminal commands.</p>
<p>Watch the output. If it asks you a question — answer it.</p>
<p>If it reports an error — let it try to fix it first before you intervene.</p>
<p>STEP 5 — Review the Build Report</p>
<p>Every prompt requires Claude Code to produce a Build Report.</p>
<p>Read this report carefully. It tells you what was built and what was not.</p>
<p>Use it alongside the evaluation checklists in this document.</p>
<p>STEP 6 — Evaluate using the checklists in this document</p>
<p>Work through the Founder, Frontend, and Backend checklists for this step.</p>
<p>Every item must be confirmed before you run the next step's prompt.</p></td>
</tr>
</tbody>
</table>

**What if Claude Code cannot read a file?**

Some document formats work better than others. Here is what to do:

- DOCX files (.docx) --- Claude Code reads these well. Upload directly.

- HTML files (.html) --- the D6 wireframes. Upload directly.

- If a file is too large --- paste the relevant section as text in the prompt itself.

- If Claude Code says it cannot read a file --- copy and paste the key sections directly into the chat.

- For D6 wireframes: upload only the specific flow files listed for that step.

**Critical rule about documents**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>The documents you have are the ONLY source of truth for Claude Code.</p>
<p>If Claude Code builds something that is not in your documents — it is wrong.</p>
<p>If Claude Code skips something that IS in your documents — it is incomplete.</p>
<p>Your job during evaluation is to check the result against the documents.</p>
<p>The documents are the specification. The code must serve the documents.</p>
<p>The documents never serve the code.</p></td>
</tr>
</tbody>
</table>

**SECTION 2 --- THE 12 BUILD STEPS**

Each step follows the same structure: what gets built → expected result → evaluation checklists → Claude Code prompt. Complete every checklist before moving to the next step.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M0 Project Scaffolding &amp; Infrastructure</strong> · Week 1</p>
<p><strong>Documents:</strong> D4 · D5 · D9 · D10</p></td>
</tr>
</tbody>
</table>

|                                                                                                                                                                           |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| NOTE: This step has NO visible UI. The app will launch to a blank screen or skeleton. That is correct. This step builds the invisible foundation everything else runs on. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Expo React Native project created with exact folder structure from D4 Section 2</p>
<p><strong>02.</strong> TypeScript configured — all files .ts or .tsx, zero plain JavaScript</p>
<p><strong>03.</strong> NativeWind 4.x installed and configured for styling</p>
<p><strong>04.</strong> React Navigation v6 — tab and stack structure scaffolded</p>
<p><strong>05.</strong> All 3 React Context providers: AuthContext, SubscriptionContext, TradeProfileContext</p>
<p><strong>06.</strong> SubscriptionGate.tsx component — wraps every feature entry point</p>
<p><strong>07.</strong> All 5 AI optimisation files: router.ts, summariser.ts, imageCompression.ts, ragInjector.ts, tokenEstimator.ts</p>
<p><strong>08.</strong> SESSION_SOFT_CAP = 30 constant in limits.ts</p>
<p><strong>09.</strong> Supabase project — all 11 tables created from D5 exact SQL in correct creation order</p>
<p><strong>10.</strong> All RLS policies enabled on every table — enforced at database level</p>
<p><strong>11.</strong> All indexes created per D5 Section 14</p>
<p><strong>12.</strong> Database triggers: updated_at and prevent_finalised_update</p>
<p><strong>13.</strong> pgvector extension enabled — match_documents RPC function created</p>
<p><strong>14.</strong> All 11 Edge Functions deployed from D10</p>
<p><strong>15.</strong> All Supabase secrets set in Edge Function environment</p>
<p><strong>16.</strong> Stripe test mode: 4 products + 8 prices created per D9 Section 1.3</p>
<p><strong>17.</strong> Stripe: 2 webhook endpoints configured per D9 Section 3.1</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Expo project runs on iOS Simulator and Android Emulator — blank home screen</p>
<p>✓ Supabase dashboard shows all 11 tables with RLS enabled (shield icon green on all)</p>
<p>✓ All 11 Edge Functions show as Active in Supabase Functions dashboard</p>
<p>✓ Stripe test dashboard shows 4 products with correct pricing</p>
<p>✓ Both Stripe webhook endpoints configured with correct events subscribed</p>
<p>✓ No API keys present anywhere in the mobile app files</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ App launches on your phone/simulator (even if just a blank screen)</p>
<p>□ Confirm the project folder exists in VS Code with correct structure</p>
<p>□ No error messages in the terminal when app starts</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ Folder structure matches D4 Section 2 exactly — every folder present</p>
<p>□ TypeScript compiles with zero errors</p>
<p>□ All 3 Context providers imported and wrapping app root</p>
<p>□ SubscriptionGate.tsx exists and is wired to all feature entry points</p>
<p>□ All 5 optimisation files exist with correct function signatures from D4 Section 3</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase: all 11 tables visible in Table Editor with correct columns</p>
<p>□ Supabase: RLS enabled on every table — confirm with green shield icon</p>
<p>□ SQL: run test INSERT on users table as anon role — should be blocked by RLS</p>
<p>□ SQL: run match_documents() RPC — should return without error</p>
<p>□ Edge Functions: all 11 showing as Active — none showing as Failed</p>
<p>□ Secrets: all environment variables present in Edge Function settings</p>
<p>□ Stripe: 4 products visible in test mode dashboard with correct USD prices</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M0: PROJECT SCAFFOLDING &amp; INFRASTRUCTURE</p>
<p>YOU ARE CLAUDE CODE. You are building TradesBrain — a React Native mobile app for</p>
<p>skilled trade professionals. You are the sole code author for this entire project.</p>
<p>You report to the founder, a frontend developer, and a backend developer.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (uploaded in this session):</p>
<p>D4 — Technical Architecture v1.0 (your primary reference for all code structure)</p>
<p>D5 — Database and Data Model v1.0 (your primary reference for all Supabase work)</p>
<p>D9 — Stripe Integration Spec v1.0 (your primary reference for all Stripe setup)</p>
<p>D10 — Supabase Edge Functions v1.0 (your primary reference for all Edge Functions)</p>
<p>---</p>
<p>HARD RULES — READ BEFORE WRITING A SINGLE LINE OF CODE:</p>
<p>RULE 1: The folder structure you create MUST match D4 Section 2 exactly.</p>
<p>Do not add, rename, or remove any folder. If D4 says /services/router.ts,</p>
<p>that file must exist at exactly that path.</p>
<p>RULE 2: Every table you create in Supabase MUST use the exact SQL from D5.</p>
<p>Column names, types, constraints, and defaults must match D5 precisely.</p>
<p>Tables must be created in the order listed in D5 Section 15.</p>
<p>RULE 3: RLS must be enabled on EVERY table before this step is complete.</p>
<p>No exceptions. No 'we'll add RLS later'. RLS is built now.</p>
<p>RULE 4: API keys (Anthropic, OpenAI, Stripe secret) are NEVER placed in any</p>
<p>mobile app file. They live only in Supabase Edge Function environment</p>
<p>variables. If you write an API key into /app, /components, /hooks, or</p>
<p>/utils — that is a critical security violation. Stop and correct it.</p>
<p>RULE 5: All 5 AI optimisation files (router.ts, summariser.ts, imageCompression.ts,</p>
<p>ragInjector.ts, tokenEstimator.ts) must be built with the exact logic from</p>
<p>D4 Section 3 before any Rex feature is built in any future step.</p>
<p>RULE 6: Do not invent any table, column, folder, or function not in the documents.</p>
<p>If something is not in D4, D5, D9, or D10 — do not build it.</p>
<p>RULE 7: Do not simplify any requirement. If D5 specifies a CHECK constraint,</p>
<p>it must be in the SQL. If D4 specifies a specific TypeScript type,</p>
<p>it must be used. 'Close enough' is not acceptable.</p>
<p>---</p>
<p>STEP M0 — BUILD INSTRUCTIONS:</p>
<p>STEP 1: Create the Expo React Native project.</p>
<p>- Use: npx create-expo-app tradesbrain --template blank-typescript</p>
<p>- Then create ALL folders from D4 Section 2 immediately.</p>
<p>- Install all packages listed in D4 Section 1 technology stack.</p>
<p>STEP 2: Configure TypeScript, NativeWind, React Navigation.</p>
<p>- Follow D4 Section 1 for exact package versions.</p>
<p>STEP 3: Create the 3 Context providers (D4 Section 7).</p>
<p>- AuthContext: user object, JWT session, isAuthenticated</p>
<p>- SubscriptionContext: subscription_status, plan_type, trial_queries_remaining</p>
<p>- TradeProfileContext: trade_type, hourly_rate, system_prompt_key</p>
<p>STEP 4: Create SubscriptionGate.tsx (D4 Section 2 — components/shared/).</p>
<p>- This component wraps every feature entry point.</p>
<p>- It reads SubscriptionContext and blocks feature access when appropriate.</p>
<p>STEP 5: Build all 5 AI optimisation files using EXACT logic from D4 Section 3.</p>
<p>- router.ts: Sonnet for stages 1/2/4, Haiku for stages 3/5 and formatting</p>
<p>- summariser.ts: compresses messages 1-8 at message 11, every 8 after</p>
<p>- imageCompression.ts: 60%/1024px Stage 1, 50%/800px Stage 2, 40%/600px Stage 3+</p>
<p>- ragInjector.ts: 5 chunks stages 1-2, 2 chunks stages 3-5, 0 for reports/quotes</p>
<p>- SESSION_SOFT_CAP = 30, SESSION_WARNING_AT = 28 in constants/limits.ts</p>
<p>STEP 6: Create Supabase project and run all D5 SQL.</p>
<p>- Create tables in the exact order from D5 Section 15.</p>
<p>- Enable RLS on every table immediately after creating it.</p>
<p>- Apply every RLS policy from D5 exactly as written.</p>
<p>- Create all indexes from D5 Section 14.</p>
<p>- Create both triggers: updated_at and prevent_finalised_update.</p>
<p>- Enable pgvector and create match_documents() RPC from D5 Section 11.</p>
<p>STEP 7: Deploy all 11 Edge Functions from D10.</p>
<p>- Deploy in this order: handle-stripe-webhook, kyc-webhook,</p>
<p>decrement-trial-query, stripe-create-checkout, stripe-update-subscription,</p>
<p>kyc-status-check, calculate-days-remaining, send-push-notification,</p>
<p>create-team-member, delete-team-member, ingest-code-document.</p>
<p>- Set all environment variables from D9 Section 7 and D10.</p>
<p>STEP 8: Configure Stripe test mode.</p>
<p>- Create all 4 products and 8 prices per D9 Section 1.2 and 1.3.</p>
<p>- Set up both webhook endpoints per D9 Section 3.1.</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>After completing all steps, produce a BUILD REPORT with these exact sections:</p>
<p>## M0 BUILD REPORT</p>
<p>### Files Created (list every file with its path and purpose)</p>
<p>### Supabase Tables Created (list all 11 with RLS status confirmed)</p>
<p>### Edge Functions Deployed (list all 11 with deployment status)</p>
<p>### Stripe Configuration (products, prices, webhooks confirmed)</p>
<p>### Security Verification (confirm no API keys in mobile app files)</p>
<p>### Deviations from Documentation (NONE is acceptable — list any if they exist)</p>
<p>### What Is NOT Built Yet (what remains for M1)</p>
<p>Add this report as a comment block at the top of /app/_layout.tsx</p>
<p>and commit with message: 'M0: Infrastructure and scaffolding complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M1 Authentication &amp; Sign-Up</strong> · Week 2</p>
<p><strong>Documents:</strong> D1 S7 · D2 SignUp+SignIn · D3 F7 · D5 users · D6 Flow01+Flow02 · D9 · D10</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Splash screen with Supabase session check — routes to Home if active session found</p>
<p><strong>02.</strong> Welcome screen (D6 Flow02 S2) — Create Account + Sign In buttons</p>
<p><strong>03.</strong> Sign-up form — 3 steps with all required fields exactly as D1 Section 7</p>
<p><strong>04.</strong> Inline validation — Create Account button greyed until all fields valid</p>
<p><strong>05.</strong> VAT number field — stored and permanently locked after account creation (DB trigger)</p>
<p><strong>06.</strong> Dual OTP screen — email + SMS both required simultaneously (D6 Flow01)</p>
<p><strong>07.</strong> Terms &amp; Conditions overlay — must be read, acceptance date+version stored</p>
<p><strong>08.</strong> KYC photo upload (national ID + license proof) — Stripe Identity session created</p>
<p><strong>09.</strong> Sign-in screen — all 3 methods: email+password, Google OAuth, phone+OTP (D6 Flow02)</p>
<p><strong>10.</strong> Forgot password flow — reset email, new password entry (D6 Flow02 S5-S6)</p>
<p><strong>11.</strong> Save Password toggle — off by default, Expo SecureStore when enabled</p>
<p><strong>12.</strong> Session persistence — returning user auto-signed in directly to Home</p>
<p><strong>13.</strong> Post-sign-in subscription status check — 3 routing paths (active/trial/expired)</p>
<p><strong>14.</strong> Home screen skeleton with all 6 bottom nav tabs (Home/Rex/Report/Quote/Codes/History)</p>
<p><strong>15.</strong> All sign-in error states (D6 Flow02 S10): wrong password, account not found, lockout, suspended, no internet, phone not registered</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Worker can sign up on a real device in under 5 minutes</p>
<p>✓ Both OTP codes arrive (email + SMS) within 60 seconds</p>
<p>✓ Terms screen appears and I agree is required before proceeding</p>
<p>✓ After sign-up: Home screen shows with 10-query trial banner</p>
<p>✓ Sign in works with all 3 methods — email/password, Google, phone OTP</p>
<p>✓ Returning user: app opens directly to Home — no sign-in screen</p>
<p>✓ Wrong password: red border + error message + reset link</p>
<p>✓ 5 failed attempts: 15-minute lockout with countdown timer</p>
<p>✓ VAT number in Settings shows locked badge — cannot be edited</p>
<p>✓ All 6 bottom nav tabs visible on Home screen</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Sign up with a real email — confirm OTP codes arrive on email AND phone</p>
<p>□ Terms screen appears — cannot proceed without tapping I agree</p>
<p>□ After sign-up: Home screen shows trial banner</p>
<p>□ Close app completely — reopen — already signed in (no sign-in screen)</p>
<p>□ Enter wrong password: correct error message shown</p>
<p>□ All 6 nav tabs visible at bottom: Home, Rex, Report, Quote, Codes, History</p>
<p>□ Settings → Profile → VAT number: locked badge visible, cannot edit</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ Sign-up form Step 1/2/3 — all required fields present per D1 Section 7</p>
<p>□ Create Account button disabled until all fields valid — test each field</p>
<p>□ OTP screen: two input fields, both must be verified before proceeding</p>
<p>□ Terms: must be scrolled and tapped before proceeding — verify acceptance stored</p>
<p>□ VAT number field: read-only after account creation — lock icon shown</p>
<p>□ Bottom nav: all 6 tabs present on Home screen — correct icons and labels</p>
<p>□ Screen layouts match D6 Flow01 and Flow02 wireframes exactly</p>
<p>□ All error states from D6 Flow02 S10 implemented and visible</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase Auth: new user appears in Authentication dashboard after sign-up</p>
<p>□ Supabase users table: new row with all fields populated correctly</p>
<p>□ Supabase users table: trial_queries_remaining = 10 for new user</p>
<p>□ Supabase users table: terms_accepted_at and terms_version stored</p>
<p>□ Supabase users table: national_id_kyc_status = pending after sign-up</p>
<p>□ Supabase users table: license_kyc_status = pending after sign-up</p>
<p>□ RLS test: create 2 accounts — confirm Account A cannot read Account B users row</p>
<p>□ DB trigger: attempt to UPDATE vat_number after creation — must be blocked</p>
<p>□ Stripe Identity: verification session created after sign-up (check Stripe dashboard)</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M1: AUTHENTICATION &amp; SIGN-UP</p>
<p>YOU ARE CLAUDE CODE. TradesBrain React Native app. Step M0 infrastructure</p>
<p>is complete. You are now building the complete authentication system.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL of these before starting):</p>
<p>D1 PRD v1.2 — Section 7: Sign-up form field specification</p>
<p>D2 User Flows v1.0 — Sign Up Flow + Sign In Flow (complete)</p>
<p>D3 Feature Specs v1.0 — F7: Onboarding and Profile</p>
<p>D5 Database v1.0 — Table: users (columns, RLS, trigger)</p>
<p>D6 Wireframes — flow_01_onboarding.html + flow_02_signin.html</p>
<p>D9 Stripe Integration v1.0 — Section 6: Stripe Identity KYC</p>
<p>D10 Edge Functions v1.0 — kyc-status-check function</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Every screen must match the corresponding D6 wireframe exactly.</p>
<p>Open flow_01_onboarding.html and flow_02_signin.html before building</p>
<p>any screen. If a screen does not match the wireframe — it is wrong.</p>
<p>RULE 2: The sign-up form must have ALL required fields from D1 Section 7.</p>
<p>Do not add fields not in D1. Do not remove fields that are in D1.</p>
<p>Step 1: full name, email, password, phone.</p>
<p>Step 2: trade type, account type, hourly rate, VAT number.</p>
<p>Step 3: license proof photo + number, national ID photo.</p>
<p>Company name is the ONLY optional field.</p>
<p>RULE 3: The VAT number must be permanently locked after account creation.</p>
<p>This is enforced by the DB trigger in D5. The UI must show a lock</p>
<p>badge on this field in Settings after creation. No edit option.</p>
<p>RULE 4: Both OTPs (email AND SMS) must be verified on ONE screen before</p>
<p>proceeding. The D2 flow says both are triggered simultaneously on</p>
<p>Create Account tap. Both must show verified checkmarks before</p>
<p>the proceed button activates. Do not allow one without the other.</p>
<p>RULE 5: KYC must be initiated immediately after account creation.</p>
<p>Call the kyc-status-check Edge Function. Set both</p>
<p>national_id_kyc_status and license_kyc_status to 'pending'.</p>
<p>Trial queries (10) must be available immediately — KYC does not block them.</p>
<p>RULE 6: All 3 sign-in methods must appear on ONE sign-in screen, equally visible.</p>
<p>Method 1: email + password. Method 2: Google OAuth. Method 3: phone + OTP.</p>
<p>None of these methods should be hidden or de-emphasised.</p>
<p>RULE 7: Save Password toggle must be OFF by default.</p>
<p>When enabled: store credentials in Expo SecureStore (iOS Keychain /</p>
<p>Android Keystore). Never in AsyncStorage. Never in plain text.</p>
<p>RULE 8: All 6 error states from D6 Flow02 S10 must be implemented:</p>
<p>wrong password / account not found / 15-min lockout with countdown /</p>
<p>account suspended / no internet / phone not registered.</p>
<p>RULE 9: Do not invent any UI element, field, or screen not in D1/D2/D6.</p>
<p>If you are not sure whether something belongs — do not add it.</p>
<p>---</p>
<p>BUILD SEQUENCE — follow in exact order:</p>
<p>STEP 1: app/(auth)/welcome.tsx — Welcome screen</p>
<p>STEP 2: app/(auth)/signup.tsx — 3-step sign-up form</p>
<p>STEP 3: app/(auth)/otp-verify.tsx — Dual OTP verification</p>
<p>STEP 4: Terms &amp; Conditions overlay component</p>
<p>STEP 5: KYC photo upload integration (national ID + license)</p>
<p>STEP 6: app/(auth)/signin.tsx — Sign-in with all 3 methods</p>
<p>STEP 7: Forgot password flow (2 screens)</p>
<p>STEP 8: Phone OTP sign-in flow (2 screens)</p>
<p>STEP 9: Session persistence — auto-sign-in on app launch</p>
<p>STEP 10: Home screen skeleton with 6-tab bottom navigation</p>
<p>STEP 11: All error states for sign-in</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>After completing all steps, produce a BUILD REPORT:</p>
<p>## M1 BUILD REPORT</p>
<p>### Screens Built (list every screen file with its D6 wireframe reference)</p>
<p>### D1 Section 7 Compliance (confirm all required fields present)</p>
<p>### D2 Flow Compliance (confirm all navigation paths match D2 exactly)</p>
<p>### Supabase Verification (users table fields, RLS, trigger)</p>
<p>### KYC Integration Status (Stripe Identity sessions being created)</p>
<p>### Error States Implemented (list all 6 from D6 Flow02 S10)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>### What Is NOT Built Yet (what remains for M2)</p>
<p>Add comment blocks in each screen file referencing its D6 wireframe.</p>
<p>Commit with message: 'M1: Authentication and sign-up complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M2 Rex Diagnostic — Plumber Only</strong> · Weeks 3–4</p>
<p><strong>Documents:</strong> D2 F2 · D3 F1 · D4 S3+S4 · D5 job_sessions+messages · D6 Flow04+Flow12 · D7 Plumber v2.0 · D10</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Rex entry points: Rex tab in bottom nav + New Job button on Home</p>
<p><strong>02.</strong> SubscriptionGate check runs before camera ever opens</p>
<p><strong>03.</strong> S0 Session opening: Rex sends all 6 context questions in ONE natural message (D6 Flow04 S0a)</p>
<p><strong>04.</strong> Worker answers context — Rex confirms and Stage 1 begins (D6 Flow04 S0b)</p>
<p><strong>05.</strong> Voice recording (expo-av) — Whisper transcription — editable transcript</p>
<p><strong>06.</strong> Photo capture — stage-aware compression applied automatically</p>
<p><strong>07.</strong> Text input always available as alternative</p>
<p><strong>08.</strong> Streaming response — word by word — input bar dims during streaming</p>
<p><strong>09.</strong> Stage 1: Problem identification with contextual buttons</p>
<p><strong>10.</strong> Stage 2: Analysis and diagnosis with contextual buttons</p>
<p><strong>11.</strong> Stage 3: Step-by-step guidance — one step at a time</p>
<p><strong>12.</strong> Stage 4: Completion and final examination</p>
<p><strong>13.</strong> Stage 5: Close and post-job — job naming prompt</p>
<p><strong>14.</strong> Worker pushback two-step protocol (D6 Flow04 Pushback A + Pushback B)</p>
<p><strong>15.</strong> Apprentice adaptive mode (D6 Flow04 Apprentice screen)</p>
<p><strong>16.</strong> Close Job button always visible from Stage 1 — never hidden</p>
<p><strong>17.</strong> Report + Quote buttons appear ONLY after Close Job — never during session</p>
<p><strong>18.</strong> Session soft cap: warning at message 28, linked session prompt at 30</p>
<p><strong>19.</strong> Session restoration: amber banner on Home + Rex recap on Continue (D6 Flow12 S10-S11)</p>
<p><strong>20.</strong> Offline: message queued locally, auto-sends on reconnect (D6 Flow12 S4)</p>
<p><strong>21.</strong> Claude timeout (30s), 5xx error, Whisper fail states (D6 Flow12 S16-S18)</p>
<p><strong>22.</strong> Rex system prompt: Plumber v2.0 from D7 loaded via Edge Function</p>
<p><strong>23.</strong> All AI optimisations wired into every Claude API call</p>
<p><strong>24.</strong> Trial query decrement via Edge Function after each send</p>
<p><strong>25.</strong> Trial exhaustion: full response delivered THEN inline notice (D6 Flow12 S8)</p>
<p><strong>26.</strong> Paywall over active Rex session — session preserved on dismiss (D6 Flow12 S9)</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Open Rex on a real device — Rex sends one natural message with 6 context questions</p>
<p>✓ Take a photo — Rex analyses it and responds about what it sees</p>
<p>✓ Hold voice button — recording happens — transcript shown — editable — sends to Rex</p>
<p>✓ Rex response appears word by word — input bar greys during response</p>
<p>✓ Close Job is always visible at every stage</p>
<p>✓ Report + Quote buttons NOT visible during active session — appear only after Close Job</p>
<p>✓ Disagree with Rex: Rex holds once with reasoning, asks confirming question, adopts on second disagreement</p>
<p>✓ Apprentice question signals: Rex asks once about expanded detail, branches correctly</p>
<p>✓ Send message with no internet: queued indicator shown — auto-sends when reconnected</p>
<p>✓ 10 queries used: 10th response delivered completely, THEN inline trial notice appears</p>
<p>✓ trial_queries_remaining decrements by 1 in Supabase after each send</p>
<p>✓ Session closed mid-session: amber banner on Home on reopen, Rex recap on Continue</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Open Rex tab: first message is a natural professional question, not a form</p>
<p>□ Photo works: take photo, Rex responds about the image content</p>
<p>□ Voice works: hold button, speak, transcript shown, send, Rex responds</p>
<p>□ Close Job visible at all stages — never disappears</p>
<p>□ Report/Quote buttons absent during session, appear after Close Job</p>
<p>□ Disagree with Rex twice: Rex adopts your position on second disagreement</p>
<p>□ Send with no internet: queued message indicator appears</p>
<p>□ After 10 sends: complete response delivered, then trial notice appears</p>
<p>□ Close app mid-session: reopen, amber banner on Home, Continue brings back Rex with recap</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow04 S0a: Rex opening message matches wireframe exactly — 6 questions, natural language</p>
<p>□ D6 Flow04 S0b: Worker answer → Rex confirms context → Stage 1 contextual buttons shown</p>
<p>□ Stage 1-5 contextual buttons match D6 Flow04 wireframes for each stage</p>
<p>□ Pushback A (D6): Rex amber response with evidence + confirming question shown</p>
<p>□ Pushback B (D6): Rex green response adopting worker — no further resistance</p>
<p>□ Apprentice screen (D6): 'Would you like me to walk through each step?' shown once, two paths</p>
<p>□ Streaming: response appears word by word, input bar opacity reduced during streaming</p>
<p>□ Soft cap warning at message 28 — prompt for linked session at message 30</p>
<p>□ Session restoration banner matches D6 Flow12 S10 wireframe</p>
<p>□ Rex recap message matches D6 Flow12 S11 wireframe</p>
<p>□ All offline error states match D6 Flow12 S4-S7 wireframes</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase job_sessions: new row created on session start with correct user_id, trade_type, status=active</p>
<p>□ Supabase messages: rows created for each send — role=user and role=assistant correct</p>
<p>□ Supabase messages: model_used field populated — Sonnet for Stage 1/2, Haiku for Stage 3</p>
<p>□ Network monitor: all Claude API calls go through Supabase Edge Function — NOT directly from app</p>
<p>□ Network monitor: photo is compressed before sending — check file size reduces by stage</p>
<p>□ Supabase users: trial_queries_remaining decrements by exactly 1 per send</p>
<p>□ DB constraint: trial_queries_remaining cannot go below 0</p>
<p>□ RLS: messages only accessible by session owner — confirmed with second account test</p>
<p>□ D7 verification: Rex response for plumbing question follows diagnosis→issue→cause→solution→code→safety sequence</p>
<p>□ D7 verification: AHJ note present in any code-related Rex response</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M2: REX DIAGNOSTIC (PLUMBER ONLY)</p>
<p>YOU ARE CLAUDE CODE. TradesBrain React Native app. Steps M0 and M1 are</p>
<p>complete. You are now building the core Rex Diagnostic feature — Plumber</p>
<p>trade profile only. This is the most complex and most important feature.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D2 User Flows v1.0 — F2: AI Diagnostic flow (complete)</p>
<p>D3 Feature Specs v1.0 — F1: AI Diagnostic specification</p>
<p>D4 Technical Architecture v1.0 — Sections 3 and 4 (AI layer + data flows)</p>
<p>D5 Database v1.0 — Tables: job_sessions, messages</p>
<p>D6 Wireframes — flow_04_rex_session.html (ALL 14 screens) + flow_12_system_states.html</p>
<p>D7 AI System Prompts v2.0 — Rex Plumber profile (complete)</p>
<p>D10 Edge Functions v1.0 — decrement-trial-query, send-push-notification</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Open flow_04_rex_session.html before building any Rex screen.</p>
<p>Every Rex screen MUST match its wireframe. If a screen exists in D6</p>
<p>but is not in your build — it is missing. Build it.</p>
<p>RULE 2: Rex asks ALL 6 context questions in ONE natural message at session start.</p>
<p>This is D7 Principle 13. Not a form. Not a numbered list.</p>
<p>Written as a senior colleague asking before starting work.</p>
<p>3 universal questions + 3 Plumber-specific questions in one message.</p>
<p>Reference D6 Flow04 S0a for exact format.</p>
<p>RULE 3: The worker pushback two-step protocol is MANDATORY (D7 Principle 6).</p>
<p>Step 1: Rex holds diagnosis + states evidence + asks ONE confirming input.</p>
<p>Step 2: Worker insists → Rex adopts and executes. No further resistance.</p>
<p>Reference D6 Flow04 Pushback A and Pushback B screens.</p>
<p>RULE 4: Apprentice mode is MANDATORY (D7 Principle 11).</p>
<p>Rex detects low-experience signals → asks ONCE → branches.</p>
<p>Reference D6 Flow04 Apprentice screen.</p>
<p>RULE 5: Report + Quote buttons must NEVER appear during an active Rex session.</p>
<p>They appear ONLY after Close Job is tapped and the job is named.</p>
<p>This is a locked rule from D1/D3. Verify this in your build.</p>
<p>RULE 6: Close Job button must be visible at every stage — Stage 1 through 5.</p>
<p>It must never be hidden, disabled, or moved.</p>
<p>RULE 7: Trial query decrement must happen server-side only.</p>
<p>Call the decrement-trial-query Edge Function after each successful</p>
<p>Claude API response. The mobile app never modifies trial_queries_remaining</p>
<p>directly. Never.</p>
<p>RULE 8: Every Claude API call must go through the Supabase Edge Function proxy.</p>
<p>The Anthropic API key is never in the mobile app. If you write</p>
<p>ANTHROPIC_API_KEY anywhere in /app, /components, /hooks, or /utils,</p>
<p>that is a critical security violation.</p>
<p>RULE 9: All 5 AI optimisations must be wired into every Claude API call.</p>
<p>router.ts for model selection, summariser.ts at message 11+,</p>
<p>imageCompression.ts for all photos, ragInjector.ts for RAG chunks.</p>
<p>These were built in M0 and must be called here.</p>
<p>RULE 10: D7 Rex Plumber system prompt must be loaded via Edge Function.</p>
<p>It is not hardcoded in the mobile app. The Edge Function receives</p>
<p>the trade_type and loads the appropriate D7 prompt.</p>
<p>RULE 11: Rex response SEQUENCE is locked by D7 Principle 2:</p>
<p>diagnosis → issue identified → root cause → solution → code rule → safety note.</p>
<p>The safety note always appears LAST, not first (except gas leak — see D6 Flow12 S22).</p>
<p>---</p>
<p>BUILD SEQUENCE — follow in exact order:</p>
<p>STEP 1: hooks/useRexSession.ts — full session lifecycle hook</p>
<p>STEP 2: services/anthropic.ts — streaming Claude API call via Edge Function proxy</p>
<p>STEP 3: services/openai.ts — Whisper transcription</p>
<p>STEP 4: components/rex/VoiceRecordButton.tsx</p>
<p>STEP 5: components/rex/PhotoCapture.tsx (with compression from imageCompression.ts)</p>
<p>STEP 6: components/rex/StreamingText.tsx — word-by-word display</p>
<p>STEP 7: components/rex/ContextualButtons.tsx — stage-aware dynamic buttons</p>
<p>STEP 8: components/rex/MessageBubble.tsx</p>
<p>STEP 9: app/job/[sessionId].tsx — full Rex session screen (all 14 D6 screens)</p>
<p>STEP 10: Session restoration logic — amber banner on Home + Rex recap</p>
<p>STEP 11: Session soft cap — warning at 28, linked session at 30</p>
<p>STEP 12: All offline and error states from D6 Flow12 S4-S7 and S16-S18</p>
<p>STEP 13: Trial exhaustion — full response then inline notice</p>
<p>STEP 14: Paywall over session — session preserved on dismiss</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M2 BUILD REPORT</p>
<p>### Screens Built (every screen with D6 Flow04 screen reference — e.g. S0a, S1, Pushback A)</p>
<p>### D7 Principles Implemented (list each of the 15 principles and confirm presence)</p>
<p>### AI Optimisations Wired (confirm all 5 are active in API call pipeline)</p>
<p>### Session Lifecycle (create → message → close → restore — confirm all states)</p>
<p>### Security Verification (no Anthropic key in mobile files)</p>
<p>### Trial Decrement (confirm server-side only via Edge Function)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>### What Is NOT Built Yet (M3 onwards)</p>
<p>Add comment blocks in useRexSession.ts and anthropic.ts referencing D4 Section 4.1.</p>
<p>Commit: 'M2: Rex Diagnostic — Plumber profile complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M3 Report &amp; Quote Generation</strong> · Week 5</p>
<p><strong>Documents:</strong> D2 F3+F4 · D3 F2+F3 · D5 job_reports+quotes+worker_preferences · D6 Flow05+Flow06</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Report Path A — from closed Rex session, job context pre-loaded (D6 Flow05)</p>
<p><strong>02.</strong> Report Path B — standalone from Report tab, Rex asks for full description (D6 Flow05)</p>
<p><strong>03.</strong> Section picker — shown first time, saved permanently to worker_preferences</p>
<p><strong>04.</strong> Voice summary recording — Whisper transcription — editable transcript</p>
<p><strong>05.</strong> VAT and license field inclusion toggles per report</p>
<p><strong>06.</strong> Report preview — all sections editable inline before confirming</p>
<p><strong>07.</strong> Confirm report — permanently locked (database trigger prevents any future edit)</p>
<p><strong>08.</strong> Draft auto-discarded on exit — prompt shown before leaving (Confirm now / Discard)</p>
<p><strong>09.</strong> PDF generation (react-pdf) — stored in Supabase Storage — accessible from History</p>
<p><strong>10.</strong> Native share sheet — WhatsApp, email, AirDrop</p>
<p><strong>11.</strong> Report versioning — Report 1, Report 2 per session</p>
<p><strong>12.</strong> Quote Path A — reuses report data if report generated first</p>
<p><strong>13.</strong> Quote Path B — standalone from Quote tab</p>
<p><strong>14.</strong> Quote line items — name, quantity, unit cost, auto-calculated total</p>
<p><strong>15.</strong> Payment method selection — 6 options, multiple allowed, saved as default</p>
<p><strong>16.</strong> Validity period — 30 days default, editable</p>
<p><strong>17.</strong> Quote confirm — permanently locked — PDF generated</p>
<p><strong>18.</strong> Quote versioning — Quote 1, Quote 2 per session</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ After closing Rex session: Generate Report and Generate Quote buttons appear</p>
<p>✓ Report Path A: context pre-loaded, voice summary recorded, preview shown, confirm locks forever</p>
<p>✓ Report Path B: Rex asks for full description, same end result</p>
<p>✓ Section picker appears first time — not shown on second report</p>
<p>✓ Navigate away without confirming: prompt appears, Discard removes the draft permanently</p>
<p>✓ Draft report never appears in Job History — only confirmed reports do</p>
<p>✓ PDF opens correctly and downloads to device</p>
<p>✓ Share sheet opens with WhatsApp, email, AirDrop options</p>
<p>✓ Quote: line items shown, total auto-calculates as rows edited</p>
<p>✓ Multiple payment methods selectable simultaneously</p>
<p>✓ Both report and quote: confirmed documents are permanently read-only</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Close Rex session: Generate Report and Generate Quote buttons appear</p>
<p>□ Generate report: voice recording works, transcript shown, preview displayed</p>
<p>□ First report: section picker appears — second report: skips picker</p>
<p>□ Tap Confirm: warning shown — after confirming, no edit option visible</p>
<p>□ Navigate away without confirming: prompt appears — Discard removes it</p>
<p>□ PDF downloads to device and opens correctly</p>
<p>□ Share PDF: WhatsApp, email, AirDrop options shown</p>
<p>□ Quote: line item rows editable, total updates in real time</p>
<p>□ Confirmed quote: permanently read-only — no edit option</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow05: all Path A and Path B screens match wireframes</p>
<p>□ D6 Flow06: all quote screens match wireframes</p>
<p>□ Section picker: correct sections, saved after first use, not shown again</p>
<p>□ Confirm warning: 'This action permanently locks all sections' shown</p>
<p>□ Draft discard prompt: 'Confirm now' and 'Discard' options — Discard leaves no trace</p>
<p>□ PDF preview renders correctly — all fields populated from profile + session</p>
<p>□ Native share sheet opens with correct options</p>
<p>□ Payment method: multiple selection works, saved as default preference</p>
<p>□ Quote: add line item row, delete row (swipe left), total auto-calculates</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase job_reports: row created with status=draft, then status=finalised on confirm</p>
<p>□ Supabase: attempt UPDATE on finalised report — DB trigger must block it with exception</p>
<p>□ Supabase Storage: PDF file exists at pdf_url stored in job_reports</p>
<p>□ Supabase worker_preferences: row created after first report with sections array saved</p>
<p>□ Supabase: draft reports (status=draft) — confirm no draft rows persist after discard</p>
<p>□ Supabase quotes: same verification as job_reports above</p>
<p>□ Supabase worker_preferences: separate row for document_type=quote</p>
<p>□ RLS: other users cannot access this user's reports or quotes</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M3: REPORT &amp; QUOTE GENERATION</p>
<p>YOU ARE CLAUDE CODE. Steps M0, M1, M2 are complete. Building Report and</p>
<p>Quote generation — both paths for each document type.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D2 User Flows v1.0 — F3: Job Report + F4: Quote Generator</p>
<p>D3 Feature Specs v1.0 — F2: Report + F3: Quote (complete)</p>
<p>D5 Database v1.0 — Tables: job_reports, quotes, worker_preferences</p>
<p>D6 Wireframes — flow_05_report_generation.html + flow_06_quote_generation.html</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Confirmed documents are PERMANENTLY locked. The database trigger</p>
<p>prevent_finalised_update in D5 enforces this at DB level.</p>
<p>The UI must not show any edit option after confirmation.</p>
<p>Test: confirm a report, then try to edit from Job History — must be impossible.</p>
<p>RULE 2: Draft documents that are not confirmed must NEVER reach Job History.</p>
<p>If worker navigates away without confirming:</p>
<p>- Show prompt: 'This document has not been confirmed. It will be discarded.'</p>
<p>- Two options: 'Confirm and generate PDF' and 'Discard'</p>
<p>- If Discard: the draft is deleted entirely. It never appears in History.</p>
<p>RULE 3: Report Path A and Quote Path A reuse Rex session context.</p>
<p>Worker is NOT asked to re-enter information Rex already has.</p>
<p>Worker voice summary is still required — Rex never auto-generates without it.</p>
<p>RULE 4: Quote Path A reuses report data if a report was generated first for the same job.</p>
<p>Rex identifies the report was generated first and reuses: client info,</p>
<p>materials, time, labour. Only quote-specific details are asked.</p>
<p>RULE 5: Section picker appears ONCE on first report generation.</p>
<p>After that, saved preference is applied automatically.</p>
<p>This applies independently for reports and quotes (separate preferences).</p>
<p>RULE 6: Payment method selection — ALL 6 options must be available:</p>
<p>Cash, Bank transfer, Bank direct debit, Cheque, Online payment link,</p>
<p>To be agreed. Multiple selection allowed. Saved as default after first use.</p>
<p>RULE 7: PDF generation uses react-pdf. PDF stored in Supabase Storage job-documents bucket.</p>
<p>PDF URL stored in job_reports.pdf_url or quotes.pdf_url.</p>
<p>Share uses the native React Native share sheet — not in-app customer sending.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: app/(tabs)/report.tsx — Report tab entry point (Path B)</p>
<p>STEP 2: app/(tabs)/quote.tsx — Quote tab entry point (Path B)</p>
<p>STEP 3: components/documents/ReportPreview.tsx</p>
<p>STEP 4: components/documents/QuotePreview.tsx</p>
<p>STEP 5: Report generation service — voice summary, Rex formatting, PDF</p>
<p>STEP 6: Quote generation service — line items, calculation logic, PDF</p>
<p>STEP 7: Section picker component — first-time, save to worker_preferences</p>
<p>STEP 8: Draft discard logic — prompt on navigate-away, delete on discard</p>
<p>STEP 9: Payment method selector — multi-select, save preference</p>
<p>STEP 10: Native share sheet integration</p>
<p>STEP 11: Path A integration — trigger from Close Job in M2</p>
<p>STEP 12: Report + Quote versioning logic</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M3 BUILD REPORT</p>
<p>### Screens Built (each with D6 Flow05/06 screen reference)</p>
<p>### Document Locking Verification (confirm DB trigger tested and working)</p>
<p>### Draft Discard Logic (confirm drafts never reach History)</p>
<p>### PDF Generation (confirm PDFs stored in Supabase Storage with correct URL)</p>
<p>### Path A+B Both Working (confirm both paths tested)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Comment each major function with the D3 section it implements.</p>
<p>Commit: 'M3: Report and Quote generation complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M4 Trade Code Lookup &amp; RAG Pipeline</strong> · Week 5 (parallel with M3)</p>
<p><strong>Documents:</strong> D2 F5 · D3 F4 · D4 S4.2+S4.3 · D5 code_chunks+code_documents · D6 Flow07 · D10 ingest</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> ingest-code-document Edge Function tested and working</p>
<p><strong>02.</strong> IPC 2021 (International Plumbing Code) ingested into pgvector database</p>
<p><strong>03.</strong> Codes tab screen — voice and text input — no special syntax required</p>
<p><strong>04.</strong> Query → OpenAI embedding → Supabase pgvector search → top 3 chunks → Rex response</p>
<p><strong>05.</strong> Response format: plain language answer first → code citation → AHJ note always</p>
<p><strong>06.</strong> AHJ note appended to EVERY response without exception</p>
<p><strong>07.</strong> Code citation tappable — shows full code text</p>
<p><strong>08.</strong> Inside Rex session: Add to job notes button available</p>
<p><strong>09.</strong> Temporary trade type switch — lookup only, profile unchanged on exit</p>
<p><strong>10.</strong> Code lookups do NOT consume trial queries — verified in database</p>
<p><strong>11.</strong> Offline: last 10 lookups cached locally — accessible without internet</p>
<p><strong>12.</strong> Empty state on first use — no placeholder data</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Ask 'What is the minimum slope for a 3-inch drain?' — plain language answer appears, then code citation, then AHJ note</p>
<p>✓ AHJ note present at end of EVERY code response — no exceptions</p>
<p>✓ Ask while inside Rex session: Codes opens, Rex session not closed, can return</p>
<p>✓ Perform code lookup: trial_queries_remaining unchanged in Supabase</p>
<p>✓ Turn off internet: last 10 lookups shown below search bar</p>
<p>✓ Tap code citation: full code text displayed</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Open Codes tab — search bar with microphone icon shown</p>
<p>□ Ask a plumbing question by voice: response shows plain language, then code reference, then AHJ note</p>
<p>□ AHJ note is at the end of EVERY response — check 3 different questions</p>
<p>□ Open Rex session, then tap Codes tab: session not lost, can return to Rex</p>
<p>□ Use 5 code lookups: check Supabase — trial_queries_remaining unchanged</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow07: all 8 screens match wireframes exactly</p>
<p>□ AHJ note: present at end of every response — visible in every test</p>
<p>□ Citation tap: full code text displayed correctly</p>
<p>□ Voice input: microphone button works, transcript sent as query</p>
<p>□ Inside Rex: Add to job notes button visible and functional</p>
<p>□ Trade type switch: temporary, reverts on exit, profile unchanged</p>
<p>□ Offline: last 10 lookups cached and displayed</p>
<p>□ Empty state: first use shows no placeholder results</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase code_chunks: rows present after IPC 2021 ingestion — check chunk_count &gt; 0</p>
<p>□ Supabase code_documents: IPC 2021 record with correct metadata</p>
<p>□ SQL: test match_documents() RPC with a sample plumbing query — returns relevant chunks</p>
<p>□ Network: embedding API call goes through Edge Function, not directly from app</p>
<p>□ Supabase users: trial_queries_remaining unchanged after code lookup (compare before/after)</p>
<p>□ Verify: no query decrement Edge Function called during code lookup</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M4: TRADE CODE LOOKUP &amp; RAG PIPELINE</p>
<p>YOU ARE CLAUDE CODE. Building the Trade Code Lookup feature and RAG pipeline.</p>
<p>This runs in parallel with M3.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D2 User Flows v1.0 — F5: Trade Code Lookup</p>
<p>D3 Feature Specs v1.0 — F4: Trade Code Lookup</p>
<p>D4 Technical Architecture v1.0 — Sections 4.2 and 4.3 (RAG pipeline)</p>
<p>D5 Database v1.0 — Tables: code_chunks, code_documents</p>
<p>D6 Wireframes — flow_07_code_lookup.html (all 8 screens)</p>
<p>D10 Edge Functions v1.0 — ingest-code-document function</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: The AHJ verification note must appear at the end of EVERY code response.</p>
<p>Exact text: 'Verify current adoption in your jurisdiction —</p>
<p>local amendments may apply.'</p>
<p>This is non-negotiable. It must appear on every single response.</p>
<p>No exceptions for any question type.</p>
<p>RULE 2: Plain language answer must appear FIRST — never raw code text first.</p>
<p>Rex interprets the code in plain English, THEN cites the section number.</p>
<p>RULE 3: Code lookups must NEVER consume trial queries.</p>
<p>Do not call decrement-trial-query Edge Function from code lookup.</p>
<p>Verify this in Supabase after testing.</p>
<p>RULE 4: The Codes tab must be accessible inside AND outside Rex sessions.</p>
<p>When opened from inside Rex session: session must not close.</p>
<p>Worker must be able to return to their Rex session after a code lookup.</p>
<p>RULE 5: Rex must never fabricate a code section number.</p>
<p>If uncertain: state the uncertainty explicitly.</p>
<p>Give best general guidance + name the authoritative source to verify.</p>
<p>RULE 6: Trade type switch is temporary.</p>
<p>Applies only to the current code lookup session.</p>
<p>On exit from Codes tab: registered profile trade type is restored.</p>
<p>Settings trade type never changes from a Codes tab switch.</p>
<p>RULE 7: Ingest at least one real code document (IPC 2021) before this step is complete.</p>
<p>The RAG database must have real content to test against.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: Run ingest-code-document Edge Function with IPC 2021 PDF</p>
<p>STEP 2: Verify code_chunks table has content — test match_documents() RPC</p>
<p>STEP 3: services/rag.ts — searchCodeChunks function per D4 Section 6.4</p>
<p>STEP 4: app/(tabs)/codes.tsx — Codes tab screen</p>
<p>STEP 5: Voice query input</p>
<p>STEP 6: RAG search → Rex response → AHJ note always appended</p>
<p>STEP 7: Code citation component — tappable, shows full text</p>
<p>STEP 8: Add to job notes — when accessed from Rex session</p>
<p>STEP 9: Temporary trade type switch</p>
<p>STEP 10: Offline cache — last 10 lookups</p>
<p>STEP 11: Empty state — first use</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M4 BUILD REPORT</p>
<p>### RAG Pipeline Status (chunks ingested, RPC tested, embedding working)</p>
<p>### AHJ Note Verification (tested on 5 different queries — present on all 5)</p>
<p>### Trial Query Isolation (confirmed no decrement on code lookups)</p>
<p>### Screens Built (each with D6 Flow07 screen reference)</p>
<p>### Offline Cache (tested — last 10 lookups accessible without internet)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M4: Trade Code Lookup and RAG pipeline complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M5 Job History &amp; Archive</strong> · Week 6</p>
<p><strong>Documents:</strong> D2 F6 · D3 F5 · D5 job_sessions+messages+job_reports+quotes · D6 Flow08</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> History tab — reverse chronological list of all archived confirmed jobs</p>
<p><strong>02.</strong> Job card — name, date, trade type badge, status — no customer name shown</p>
<p><strong>03.</strong> Search by job name, date, jobsite</p>
<p><strong>04.</strong> Empty state — new user — Start first job CTA</p>
<p><strong>05.</strong> Skeleton loading animation during Supabase data fetch</p>
<p><strong>06.</strong> Job Detail screen — 4 tabs: Rex Conversation, Reports, Quotes, Photos</p>
<p><strong>07.</strong> Rex tab — full read-only conversation with all photos inline — no input bar</p>
<p><strong>08.</strong> Reports tab — all confirmed versions, View / Download / Share</p>
<p><strong>09.</strong> Quotes tab — all confirmed versions, View / Download / Share</p>
<p><strong>10.</strong> Photos tab — grid layout, tap for full screen, download to device</p>
<p><strong>11.</strong> Reopen Job — Rex reads full history, delivers recap message</p>
<p><strong>12.</strong> New reports/quotes from reopened session stored as new versions — originals untouched</p>
<p><strong>13.</strong> Job name editable inline — the ONLY editable field after archiving</p>
<p><strong>14.</strong> Job deletion — confirmation required — cascades all data</p>
<p><strong>15.</strong> Expired subscription: History fully browsable — PDFs downloadable</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ History tab shows all completed sessions in reverse chronological order</p>
<p>✓ Search filters correctly by name, date, jobsite</p>
<p>✓ Job Detail: 4 tabs all present and functional</p>
<p>✓ Confirmed report in Reports tab: View renders full report, Download saves PDF</p>
<p>✓ Photos tab: grid shown, tap opens full screen</p>
<p>✓ Reopen Job: Rex recap message delivered — 'Last time: [summary]. What do we need now?'</p>
<p>✓ New report from reopened session: stored as Report 2, Report 1 unchanged</p>
<p>✓ Delete job: job removed from History, all messages/reports/quotes/photos gone from Supabase</p>
<p>✓ Empty state: shown for new user with Start first job CTA</p>
<p>✓ Skeleton loading: visible briefly while Supabase loads data</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ History tab shows all past jobs in order — newest first</p>
<p>□ Tap a job: 4 tabs visible (Rex, Reports, Quotes, Photos)</p>
<p>□ Reports tab: tap View to open full report</p>
<p>□ Photos tab: tap photo to see full screen</p>
<p>□ Reopen a job: Rex gives a recap of what was worked on last time</p>
<p>□ Generate a second report from reopened session: both Report 1 and Report 2 visible</p>
<p>□ Delete a job: job disappears from History</p>
<p>□ New account with no jobs: empty state shown with CTA</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow08: all 17 screens match wireframes exactly</p>
<p>□ Job cards: correct fields shown, no customer name, trade badge visible</p>
<p>□ 4 tabs: correct labels, correct content in each tab</p>
<p>□ Rex tab: all messages shown in sequence, photos inline, no input bar</p>
<p>□ Skeleton loading: shimmer animation shown before data loads</p>
<p>□ Empty state: illustration + correct text + CTA button</p>
<p>□ Delete confirmation: shows before deleting</p>
<p>□ Job name: editable inline in History — other fields not editable</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase: reopen session — job_sessions.status changes to reopened</p>
<p>□ Supabase: delete job — confirm messages, job_reports, quotes, photos all removed</p>
<p>□ Supabase Storage: photos and PDFs deleted from storage when job deleted</p>
<p>□ RLS: test with second account — cannot see first account job history</p>
<p>□ Expired subscription: History read access still works — feature buttons disabled</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M5: JOB HISTORY &amp; ARCHIVE</p>
<p>YOU ARE CLAUDE CODE. Building the Job History and Archive feature.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D2 User Flows v1.0 — F6: Job History and Records</p>
<p>D3 Feature Specs v1.0 — F5: Job History</p>
<p>D5 Database v1.0 — Tables: job_sessions, messages, job_reports, quotes</p>
<p>D6 Wireframes — flow_08_job_history.html (all 17 screens)</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Only CONFIRMED documents appear in Job History.</p>
<p>Draft reports and draft quotes that were not confirmed must never</p>
<p>appear in History. This was enforced in M3. Verify it here.</p>
<p>RULE 2: Confirmed documents in Job History are permanently read-only.</p>
<p>No edit option. No regenerate option in place of the confirmed document.</p>
<p>Worker can generate a NEW version — but it is a new document, not an edit.</p>
<p>RULE 3: Reopen Job must load the full prior Rex conversation from Supabase.</p>
<p>Rex must deliver a recap message immediately:</p>
<p>'Last time: [summary of what was worked on]. What do we need now?'</p>
<p>Full F2 collaboration is then available again.</p>
<p>RULE 4: Job deletion cascades ALL related data.</p>
<p>When a job is deleted: the job_session row, all messages, all job_reports,</p>
<p>all quotes, all photos in Supabase Storage must all be deleted.</p>
<p>Verify this in the database after a test deletion.</p>
<p>RULE 5: No customer name is shown on job cards or in the History list.</p>
<p>D1/D2/D3 do not include customer names as displayed fields.</p>
<p>Job name is the primary identifier.</p>
<p>RULE 6: Job History must be accessible even with an expired subscription.</p>
<p>Workers can browse history and download PDFs regardless of subscription.</p>
<p>Feature buttons (Rex, Report, Quote, Codes) are disabled — not History.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: app/(tabs)/history.tsx — History tab with job card list</p>
<p>STEP 2: Search functionality (name, date, jobsite)</p>
<p>STEP 3: Skeleton loading component</p>
<p>STEP 4: Empty state component</p>
<p>STEP 5: app/job/detail/[jobId].tsx — Job Detail with 4 tabs</p>
<p>STEP 6: Rex Conversation tab — full read-only message display</p>
<p>STEP 7: Reports tab — versioned list, View/Download/Share</p>
<p>STEP 8: Quotes tab — versioned list, View/Download/Share</p>
<p>STEP 9: Photos tab — grid, full screen, download</p>
<p>STEP 10: Reopen Job — session status update + Rex recap</p>
<p>STEP 11: Job name inline editing</p>
<p>STEP 12: Job deletion with cascade verification</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M5 BUILD REPORT</p>
<p>### Screens Built (each with D6 Flow08 screen reference)</p>
<p>### Confirmed-Only Verification (confirmed no draft documents in History)</p>
<p>### Cascade Delete Verification (list each table/storage confirmed deleted)</p>
<p>### Reopen + Recap (Rex recap message working — show example output)</p>
<p>### Subscription Expiry Access (History accessible with expired sub confirmed)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M5: Job History and Archive complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M6 Subscription, Stripe &amp; Paywall</strong> · Week 7</p>
<p><strong>Documents:</strong> D1 S8 · D2 F7 · D3 F6 · D5 subscriptions+billing_history · D6 Flow09 · D9 all · D10</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Trial banner: blue (10-3 queries), orange (2-1 queries) — never shows exact count</p>
<p><strong>02.</strong> SubscriptionGate: wraps every feature button, checks status on every tap</p>
<p><strong>03.</strong> Paywall modal: 3 plan cards (Solo/Pro/Team), monthly/annual toggle, correct prices</p>
<p><strong>04.</strong> KYC gate: blocks Stripe checkout until both documents verified</p>
<p><strong>05.</strong> stripe-create-checkout Edge Function → PaymentSheet → payment confirmed</p>
<p><strong>06.</strong> Optimistic subscription activation immediately on payment confirm</p>
<p><strong>07.</strong> handle-stripe-webhook: customer.subscription.created/updated/deleted + invoice events</p>
<p><strong>08.</strong> kyc-webhook: identity.verification_session.verified/requires_input/processing</p>
<p><strong>09.</strong> Switch to annual billing — billing_cycle_anchor = now</p>
<p><strong>10.</strong> Plan upgrade with proration</p>
<p><strong>11.</strong> Cancellation — days remaining calculated — access until end date</p>
<p><strong>12.</strong> Restore purchase</p>
<p><strong>13.</strong> Manage payment method — Stripe customer portal</p>
<p><strong>14.</strong> Billing history — all invoices downloadable</p>
<p><strong>15.</strong> All 6 push notification types via send-push-notification Edge Function</p>
<p><strong>16.</strong> Paywall over active Rex session — session preserved on dismiss</p>
<p><strong>17.</strong> Trial exhaustion mid-session — inline notice AFTER response delivered</p>
<p><strong>18.</strong> Payment declined, already active, no internet — all error states (D6 Flow09)</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Sign up → use Rex 10 times → 11th tap: paywall modal rises</p>
<p>✓ Paywall: Solo/Pro/Team cards, monthly/annual toggle, correct prices</p>
<p>✓ KYC pending: Subscribe blocked, pending notice shown</p>
<p>✓ Stripe checkout opens: card fields, Apple Pay, Google Pay shown</p>
<p>✓ Test card 4242 4242 4242 4242: payment succeeds, subscription activates, features unlock</p>
<p>✓ Test card 4000 0000 0000 0002: declined, error shown, retry available</p>
<p>✓ Stripe webhook: after payment, Supabase subscription_status = active</p>
<p>✓ Cancellation: days remaining shown, access continues to end date</p>
<p>✓ All 6 push notifications: arrive on device and deep link to correct screen</p>
<p>✓ Paywall over Rex session: session preserved and accessible after dismiss</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Use Rex 10 times: on tap 11 paywall appears</p>
<p>□ Paywall: three plan cards visible, annual toggle works, prices correct</p>
<p>□ Complete payment with test card: subscription activates, Rex works</p>
<p>□ Cancel subscription: days remaining shown in Settings</p>
<p>□ Switch to annual: savings shown, billing switches</p>
<p>□ Billing history: past invoices listed and downloadable</p>
<p>□ Push notifications: arrive on real device for payment events</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow09: all 23 screens match wireframes exactly</p>
<p>□ Trial banner: correct colour states (blue/orange) — exact count never shown</p>
<p>□ Paywall: prices match D1 Section 8 and D9 Section 1.3 exactly</p>
<p>□ Annual toggle: 20% discount applied, annual totals shown</p>
<p>□ KYC pending screen: correct notice shown, subscribe blocked</p>
<p>□ Payment declined screen: Stripe native error, retry and different card options</p>
<p>□ Paywall over session: session preserved, accessible after dismiss</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase: after Stripe payment, subscription_status = active in users table</p>
<p>□ Supabase: subscriptions table row created with correct Stripe IDs</p>
<p>□ Supabase: billing_history row created for each successful payment</p>
<p>□ Stripe CLI: trigger customer.subscription.created webhook — confirm DB update</p>
<p>□ Stripe CLI: trigger invoice.payment_failed — confirm push notification sent</p>
<p>□ Stripe CLI: trigger identity.verification_session.verified — confirm KYC status updates</p>
<p>□ Security: STRIPE_SECRET_KEY only in Edge Function secrets — not in any app file</p>
<p>□ Stripe signature: send webhook without signature — confirm 400 response returned</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M6: SUBSCRIPTION, STRIPE &amp; PAYWALL</p>
<p>YOU ARE CLAUDE CODE. Building the complete subscription, payment, and</p>
<p>paywall system. This is the revenue foundation of TradesBrain.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D1 PRD v1.2 — Section 8: Pricing (exact prices)</p>
<p>D2 User Flows v1.0 — F7: Subscription and Paywall</p>
<p>D3 Feature Specs v1.0 — F6: Subscription and Paywall</p>
<p>D5 Database v1.0 — Tables: subscriptions, billing_history</p>
<p>D6 Wireframes — flow_09_paywall_subscription.html (all 23 screens)</p>
<p>D9 Stripe Integration Spec v1.0 — ALL sections</p>
<p>D10 Edge Functions v1.0 — ALL stripe and kyc functions</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: The Stripe secret key is NEVER in the mobile app.</p>
<p>All Stripe API calls go through Supabase Edge Functions.</p>
<p>STRIPE_SECRET_KEY exists ONLY in Edge Function environment variables.</p>
<p>RULE 2: Every Stripe webhook must verify the Stripe-Signature header FIRST.</p>
<p>Before processing anything in handle-stripe-webhook or kyc-webhook,</p>
<p>the signature must be verified. If verification fails: return 400.</p>
<p>If processing fails after verification: return 200 (prevent Stripe retry).</p>
<p>RULE 3: Prices in the app must match D1 Section 8 and D9 Section 1.3 EXACTLY.</p>
<p>Solo: $69/month, $55.20/month annual.</p>
<p>Pro: $120/month, $96/month annual.</p>
<p>Team: $260/month, $208/month annual.</p>
<p>Seat: $89/month, $71.20/month annual.</p>
<p>Do not invent prices. Do not round prices.</p>
<p>RULE 4: The paywall trial banner must NEVER show the exact query count.</p>
<p>It changes colour behaviour only: blue for 10-3, orange for 2-1.</p>
<p>The number '10' or '2' must not appear in the banner.</p>
<p>RULE 5: KYC gate — paywall checkout is blocked by Triggers 3 and 4 only.</p>
<p>(See D1 Section 6 clarifying note: Triggers 1/2/5/6 verified at sign-up.)</p>
<p>The kyc-status-check Edge Function checks national_id_kyc_status</p>
<p>and license_kyc_status. If either is not 'verified': block checkout.</p>
<p>RULE 6: Grant optimistic subscription access immediately after PaymentSheet</p>
<p>returns success on the client side.</p>
<p>Then confirm via webhook when it arrives.</p>
<p>Worker must not wait for webhook to use features.</p>
<p>RULE 7: When worker cancels: access continues until subscription_end_date.</p>
<p>calculate-days-remaining Edge Function returns exact days.</p>
<p>Show exact days AND exact end date in the cancellation screen.</p>
<p>RULE 8: Paywall over active Rex session: session must be preserved.</p>
<p>When paywall rises over a session — session data is not lost.</p>
<p>After subscribe → session restores to where worker was.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: Trial banner component — 3 colour states</p>
<p>STEP 2: SubscriptionGate.tsx — final implementation</p>
<p>STEP 3: app/paywall.tsx — paywall modal (23 D6 screens)</p>
<p>STEP 4: stripe-create-checkout integration → PaymentSheet</p>
<p>STEP 5: handle-stripe-webhook — all 5 subscription events</p>
<p>STEP 6: kyc-webhook — all 3 identity events</p>
<p>STEP 7: Subscription management screens (Settings → Subscription)</p>
<p>STEP 8: Cancellation flow with days-remaining calculation</p>
<p>STEP 9: Annual switch + plan upgrade flows</p>
<p>STEP 10: Restore purchase</p>
<p>STEP 11: Stripe customer portal (manage payment method)</p>
<p>STEP 12: Billing history display</p>
<p>STEP 13: All 6 push notification types wired</p>
<p>STEP 14: All error states from D6 Flow09</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M6 BUILD REPORT</p>
<p>### Stripe Integration (checkout tested with test card — confirmed working)</p>
<p>### Webhook Security (signature verification tested — fake webhook returns 400)</p>
<p>### Price Verification (all 8 prices in UI match D1/D9 exactly)</p>
<p>### KYC Gate (checkout blocked with pending KYC — confirmed)</p>
<p>### Push Notifications (all 6 types tested — arrival confirmed)</p>
<p>### Screens Built (each with D6 Flow09 screen reference)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M6: Subscription, Stripe, and paywall complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M7 Settings, Profile &amp; Account Transitions</strong> · Week 7 (parallel)</p>
<p><strong>Documents:</strong> D2 F8 · D3 F7+F8 · D5 users · D6 Flow10+Flow10_S7</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Settings screen — all 6 sections: Profile, Trade, Team, Subscription, Legal, Account</p>
<p><strong>02.</strong> Profile section: editable fields (name, company, hourly rate, logo)</p>
<p><strong>03.</strong> Profile section: locked fields with lock badge (VAT, license, national ID after KYC)</p>
<p><strong>04.</strong> KYC status display — pending (amber), verified (green lock), rejected (red + re-upload)</p>
<p><strong>05.</strong> KYC rejected: re-upload triggers new Stripe Identity session</p>
<p><strong>06.</strong> Unsaved changes: prompt on back navigation (Save / Discard / Keep editing)</p>
<p><strong>07.</strong> Trade type change — Rex system prompt switches immediately for next session</p>
<p><strong>08.</strong> Account type: Solopreneur → Team Owner (inline upgrade notice, paywall pre-loaded on Team card)</p>
<p><strong>09.</strong> Account type: Team Owner → Solopreneur (inline red warning, DELETE required, all team data destroyed)</p>
<p><strong>10.</strong> Legal section — Terms and Privacy viewable, acceptance records shown (read-only)</p>
<p><strong>11.</strong> Sign out — confirmation dialog — clears session — Welcome screen</p>
<p><strong>12.</strong> Delete account — type DELETE exactly — all data destroyed immediately</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Settings: all 6 sections accessible and functional</p>
<p>✓ Profile: edit name, company, hourly rate — saved on Save tap</p>
<p>✓ VAT, license, national ID: locked badge shown — no edit option</p>
<p>✓ KYC rejected: red badge, rejection reason, re-upload button visible</p>
<p>✓ Trade type change: open Rex immediately after — new trade context questions appear</p>
<p>✓ Change to Team Owner: inline notice appears, paywall pre-loaded with Team selected</p>
<p>✓ Change to Solopreneur (as Team owner): red warning + DELETE field appears</p>
<p>✓ Sign out: confirmation then Welcome screen</p>
<p>✓ Delete account: type DELETE exactly, all data gone immediately</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Settings: all 6 sections visible and accessible</p>
<p>□ Edit name: changes reflected in app after Save tap</p>
<p>□ VAT field: locked badge shown, cannot edit</p>
<p>□ Change trade type to Electrician: open Rex — Electrician questions appear</p>
<p>□ Sign out: confirmation dialog appears before sign-out</p>
<p>□ Delete account: must type DELETE exactly before button activates</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow10: all 13 screens match wireframes exactly</p>
<p>□ D6 Flow10 S7 supplement: account transition screens match wireframes</p>
<p>□ Locked fields: lock badge + read-only verified — no edit input available</p>
<p>□ KYC status: correct badge colour per status (amber/green/red)</p>
<p>□ Re-upload: tapping opens new Stripe Identity flow</p>
<p>□ Unsaved changes prompt: all 3 options work correctly</p>
<p>□ DELETE field: confirm button disabled until 'DELETE' typed exactly</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Supabase: trade_type update in users table after trade change — immediate</p>
<p>□ Stripe Identity: new verification session created on re-upload tap</p>
<p>□ Supabase: account deletion — users row deleted, cascade confirmed</p>
<p>□ Supabase: KYC status fields update correctly from kyc-webhook</p>
<p>□ RLS: users can only update their own editable fields</p>
<p>□ DB trigger: vat_number, license_number cannot be updated — test confirmed</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M7: SETTINGS, PROFILE &amp; ACCOUNT TRANSITIONS</p>
<p>YOU ARE CLAUDE CODE. Building the complete Settings system.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D2 User Flows v1.0 — F8: Settings and Profile</p>
<p>D3 Feature Specs v1.0 — F7 and F8: Onboarding/Profile and Team</p>
<p>D5 Database v1.0 — Table: users (editable vs locked fields)</p>
<p>D6 Wireframes — flow_10_settings.html + flow_10_s7_account_transitions.html</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Permanently locked fields must have NO edit option in the UI.</p>
<p>VAT number, license number, license proof photo, national ID photo —</p>
<p>all show a lock badge and are read-only after initial verification.</p>
<p>This is a legal and compliance requirement, not just a UX preference.</p>
<p>RULE 2: Trade type change must update the system prompt for the NEXT Rex session.</p>
<p>TradeProfileContext must update immediately when trade type changes.</p>
<p>The next Rex session must use the new trade profile questions from D7.</p>
<p>RULE 3: Account type transitions are high-risk actions with specific UI.</p>
<p>Solopreneur → Team Owner: inline notice on radio tap → paywall with Team pre-selected.</p>
<p>Team Owner → Solopreneur: inline RED warning on radio tap → full downgrade screen</p>
<p>→ worker must type DELETE exactly to confirm → all team data destroyed immediately.</p>
<p>Reference D6 flow_10_s7_account_transitions.html for exact screen designs.</p>
<p>RULE 4: Delete account requires typing DELETE exactly.</p>
<p>The Confirm button must be DISABLED until the worker types 'DELETE' exactly.</p>
<p>Case-sensitive. On confirm: all data destroyed immediately.</p>
<p>The worker's subscription billing continues until cycle ends (per D2 F8).</p>
<p>RULE 5: KYC rejected — re-upload must trigger a new Stripe Identity session.</p>
<p>Do not allow document replacement without a new Stripe Identity flow.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: app/settings/index.tsx — Settings navigation hub</p>
<p>STEP 2: app/settings/profile.tsx — Profile with locked/editable fields</p>
<p>STEP 3: KYC status display components (pending/verified/rejected)</p>
<p>STEP 4: Re-upload flow for rejected documents</p>
<p>STEP 5: app/settings/trade.tsx — Trade type change</p>
<p>STEP 6: Account type transition screens (both directions)</p>
<p>STEP 7: app/settings/subscription.tsx — subscription management</p>
<p>STEP 8: app/settings/legal.tsx — Terms/Privacy/acceptance records</p>
<p>STEP 9: Sign out confirmation flow</p>
<p>STEP 10: Delete account — DELETE confirmation — cascade delete</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M7 BUILD REPORT</p>
<p>### Screens Built (each with D6 Flow10 screen reference)</p>
<p>### Locked Fields Verified (list each locked field — confirm no edit option)</p>
<p>### Trade Change Tested (trade changed, Rex opened — correct new questions)</p>
<p>### Account Transitions (both directions tested and working)</p>
<p>### Delete Account (DELETE requirement tested — cascade confirmed)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M7: Settings, Profile and Account Transitions complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M8 Team Management</strong> · Week 7 (parallel with M6+M7)</p>
<p><strong>Documents:</strong> D2 F8 Team · D3 F8 · D5 team_members · D6 Flow11 · D10 create+delete-team-member</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Team Management section — visible ONLY to Team plan owners, hidden from Solopreneur</p>
<p><strong>02.</strong> KPI Dashboard — aggregate team totals + per-member rows, daily/weekly/monthly toggle</p>
<p><strong>03.</strong> Members list — all member cards with badges (active, first login pending, KYC rejected)</p>
<p><strong>04.</strong> Swipe left on member card — reveals Delete action</p>
<p><strong>05.</strong> Member detail screen — 4 tabs (Rex, Reports, Quotes, Photos) — ALL read-only</p>
<p><strong>06.</strong> Owner cannot edit any content in member detail — enforced by UI and RLS</p>
<p><strong>07.</strong> Add member form — all required fields, inline validation, trade type selector</p>
<p><strong>08.</strong> create-team-member Edge Function: creates Auth user, sends SMS+email, adds Stripe seat</p>
<p><strong>09.</strong> Add member success: SMS and email arrive with credentials</p>
<p><strong>10.</strong> Max 10 members: + Add button disabled at cap with amber notice</p>
<p><strong>11.</strong> Delete member confirmation: destruction list shown, billing reduction noted</p>
<p><strong>12.</strong> delete-team-member Edge Function: cascades all member data, removes Stripe seat</p>
<p><strong>13.</strong> Member first login: forced password change + phone OTP required</p>
<p><strong>14.</strong> Team Management hidden from Solopreneur — confirmed at UI and data level</p>
<p><strong>15.</strong> Push notification: member activated — deep link to member detail</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Sign in as Solopreneur: Team Management not in Settings</p>
<p>✓ Sign in as Team Owner: Team Management visible with KPI dashboard</p>
<p>✓ KPI dashboard: 6 metrics per member and aggregate — 3 time periods</p>
<p>✓ Add member: form validates, create succeeds, SMS + email arrive, badge shown</p>
<p>✓ Member detail: all 4 tabs visible, all content read-only, no edit option anywhere</p>
<p>✓ Delete member: destruction list shown, DELETE confirmed, member gone, Stripe seat removed</p>
<p>✓ 10 members: + Add button disabled, amber notice shown</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Settings as Solopreneur: Team Management row absent</p>
<p>□ Settings as Team Owner: Team Management visible</p>
<p>□ KPI Dashboard: numbers shown per member and total</p>
<p>□ Add member: fill form, create, check SMS and email arrive</p>
<p>□ Member detail: Rex, Reports, Quotes, Photos tabs — cannot edit anything</p>
<p>□ Delete member: type DELETE, confirm, member gone from list</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow11: all 17 screens match wireframes exactly</p>
<p>□ KPI Dashboard: 6 metrics correct, 3 period toggles work</p>
<p>□ Member card: correct badges per status</p>
<p>□ Swipe left: delete action reveals correctly</p>
<p>□ Member detail: 4 tabs, all read-only, owner view notice shown</p>
<p>□ Add member form: all validations, trade type selector overlay</p>
<p>□ Max 10: button disabled, correct amber notice</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ create-team-member Edge Function: Auth user created, users row created, team_members row created</p>
<p>□ Stripe: seat count increments on member create (check Stripe subscription in dashboard)</p>
<p>□ delete-team-member: Auth user, users row, team_members, all sessions, reports, quotes, storage all deleted</p>
<p>□ Stripe: seat count decrements on member delete</p>
<p>□ RLS: owner can SELECT member data via team_owner_id join — confirmed</p>
<p>□ RLS: owner cannot UPDATE member data — test confirmed with direct API call</p>
<p>□ RLS: member cannot see owner data or other member data</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M8: TEAM MANAGEMENT</p>
<p>YOU ARE CLAUDE CODE. Building the complete Team Management system.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D2 User Flows v1.0 — F8: Settings — Team Management section</p>
<p>D3 Feature Specs v1.0 — F8: Team Management</p>
<p>D5 Database v1.0 — Table: team_members + RLS policies</p>
<p>D6 Wireframes — flow_11_team_management.html (all 17 screens)</p>
<p>D10 Edge Functions v1.0 — create-team-member + delete-team-member</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Team Management must be completely invisible to Solopreneur accounts.</p>
<p>Not greyed out. Not hidden behind a paywall. ABSENT.</p>
<p>The Settings row must not exist for Solopreneur account_type.</p>
<p>RULE 2: Owner NEVER logs in as a team member. No mechanism for this must exist.</p>
<p>No 'View as', no 'Sign in as', no impersonation of any kind.</p>
<p>Owner sees member data only through the read-only Team Management view.</p>
<p>RULE 3: ALL content in member detail is read-only for the owner.</p>
<p>No edit button. No regenerate button. No input field active.</p>
<p>RLS enforces this at the database level (owner can SELECT, not UPDATE).</p>
<p>RULE 4: Delete member cascades ALL member data.</p>
<p>Auth user, users table row, team_members row, all job_sessions,</p>
<p>all messages, all job_reports, all quotes, ALL Supabase Storage files.</p>
<p>Stripe seat must also be decremented via stripe-update-subscription.</p>
<p>RULE 5: Maximum 10 team members. When count reaches 10:</p>
<p>+ Add button must be disabled and greyed.</p>
<p>Amber notice: 'Maximum of 10 members reached'.</p>
<p>Existing members still manageable.</p>
<p>RULE 6: create-team-member Edge Function handles the complete creation flow:</p>
<p>Creates Supabase Auth user, creates users profile row, creates</p>
<p>team_members link row, sends SMS + email with credentials,</p>
<p>adds Stripe seat, initiates KYC for the new member.</p>
<p>If ANY step fails: the entire operation must roll back.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: app/settings/team.tsx — Team Management hub</p>
<p>STEP 2: KPI Dashboard component (aggregate + per-member, 3 periods)</p>
<p>STEP 3: Members list with card badges and swipe-to-delete</p>
<p>STEP 4: Member detail screen — 4 read-only tabs</p>
<p>STEP 5: Add member form — all validations + trade type selector</p>
<p>STEP 6: create-team-member Edge Function integration</p>
<p>STEP 7: Delete member confirmation + delete-team-member integration</p>
<p>STEP 8: Member first login: forced password change + phone OTP</p>
<p>STEP 9: Max 10 enforcement</p>
<p>STEP 10: Push notification: member activated → deep link to member detail</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M8 BUILD REPORT</p>
<p>### Team Management Visibility (confirmed absent for Solopreneur)</p>
<p>### Create Member (tested — Auth user, DB row, Stripe seat, SMS/email confirmed)</p>
<p>### Delete Member (cascade tested — all data confirmed deleted from all tables)</p>
<p>### Read-Only Enforcement (owner cannot edit member content — RLS confirmed)</p>
<p>### Screens Built (each with D6 Flow11 screen reference)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M8: Team Management complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M9 All 3 Remaining Trade Profiles</strong> · Week 8</p>
<p><strong>Documents:</strong> D7 Electrician+HVAC+Roofer · D4 trade routing · D10 ingest-code-document</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> Rex Electrician v1.0 system prompt deployed to Edge Function</p>
<p><strong>02.</strong> Rex HVAC Technician v1.0 system prompt deployed</p>
<p><strong>03.</strong> Rex Roofer v1.0 system prompt deployed</p>
<p><strong>04.</strong> Trade routing in Edge Function: trade_type → correct D7 system prompt</p>
<p><strong>05.</strong> Electrician context questions: service type / panel amperage / work type</p>
<p><strong>06.</strong> HVAC context questions: system type / refrigerant type / fuel source</p>
<p><strong>07.</strong> Roofer context questions: roof type / current material / job scope</p>
<p><strong>08.</strong> NEC 2023 ingested for Electrician trade profile</p>
<p><strong>09.</strong> IMC 2021 + ASHRAE ingested for HVAC trade profile</p>
<p><strong>10.</strong> IBC 2021 roofing sections ingested for Roofer trade profile</p>
<p><strong>11.</strong> Trade type change in Settings → new profile questions appear immediately in next Rex session</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Set trade to Electrician, open Rex: service type / panel amperage / work type asked</p>
<p>✓ Set trade to HVAC, open Rex: system type / refrigerant / fuel source asked</p>
<p>✓ Set trade to Roofer, open Rex: roof type / current material / job scope asked</p>
<p>✓ Ask Electrician Rex about lockout/tagout: LOTO confirmation appears before guidance</p>
<p>✓ Ask HVAC Rex about heat exchanger: CO risk STOP block appears (D6 Flow12 S23)</p>
<p>✓ Ask Roofer Rex about rooftop work: fall protection confirmed before guidance (D6 Flow12 S24)</p>
<p>✓ Ask Electrician code question: NEC 2023 cited in response</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Change trade to Electrician in Settings, open Rex: different questions asked than Plumber</p>
<p>□ Change trade to HVAC in Settings, open Rex: HVAC-specific questions</p>
<p>□ Change trade to Roofer in Settings, open Rex: roofing questions</p>
<p>□ Ask Rex Electrician about switching on a live circuit: LOTO safety notice appears</p>
<p>□ Ask Rex HVAC about a cracked heat exchanger: STOP CO risk notice appears first</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ Trade change in Settings: immediately reflected in next Rex session opening questions</p>
<p>□ All 4 trades: context question message matches D7 trade-specific questions exactly</p>
<p>□ Safety escalations: D6 Flow12 S22-S25 all 4 screens triggered correctly per trade</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ Edge Function: trade_type parameter correctly routes to corresponding D7 system prompt</p>
<p>□ Supabase code_chunks: NEC 2023 chunks present — test query returns NEC result</p>
<p>□ Supabase code_chunks: IMC 2021 chunks present — test HVAC query returns correct result</p>
<p>□ Supabase code_chunks: IBC roofing chunks present — test roofing query returns result</p>
<p>□ D7 Plumber unaffected: Plumber trade still works correctly after new profiles added</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M9: ALL 3 REMAINING TRADE PROFILES</p>
<p>YOU ARE CLAUDE CODE. Adding Electrician, HVAC Technician, and Roofer trade</p>
<p>profiles to Rex. Plumber is already complete from M2.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D7 AI System Prompts v2.0 — Rex Electrician v1.0 (complete system prompt)</p>
<p>D7 AI System Prompts v2.0 — Rex HVAC Technician v1.0 (complete system prompt)</p>
<p>D7 AI System Prompts v2.0 — Rex Roofer v1.0 (complete system prompt)</p>
<p>D4 Technical Architecture v1.0 — Trade routing logic</p>
<p>D6 Wireframes — flow_12_system_states.html — screens S22-S25 (safety escalations)</p>
<p>D10 Edge Functions v1.0 — ingest-code-document</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Each trade profile must use its D7 system prompt EXACTLY as written.</p>
<p>Do not modify, shorten, or paraphrase the D7 prompts.</p>
<p>The system prompt is loaded by the Edge Function based on trade_type.</p>
<p>RULE 2: Trade-specific context questions must match D7 exactly.</p>
<p>Electrician Q4: service type (single phase / three phase).</p>
<p>Electrician Q5: panel amperage (100A/200A/400A/other).</p>
<p>Electrician Q6: work type (new/retrofit/repair/troubleshoot).</p>
<p>HVAC Q4: system type (split/packaged/mini-split/RTU/boiler/chiller).</p>
<p>HVAC Q5: refrigerant type if known.</p>
<p>HVAC Q6: fuel source (electric/gas/oil/heat pump).</p>
<p>Roofer Q4: roof type (pitched/flat/low-slope).</p>
<p>Roofer Q5: current material (shingles/TPO/EPDM/metal/tile/built-up).</p>
<p>Roofer Q6: job scope (new/repair/replacement/inspection).</p>
<p>RULE 3: Trade-specific safety escalations must be wired for all trades.</p>
<p>Electrician: LOTO confirmed before live circuit guidance.</p>
<p>HVAC: cracked heat exchanger → CO risk STOP block (D6 Flow12 S23).</p>
<p>Roofer: fall protection confirmed before at-height guidance (D6 Flow12 S24).</p>
<p>Plumber gas leak: STOP block first from M2 — verify still working.</p>
<p>RULE 4: Ingesting code documents must not affect the Plumber RAG database.</p>
<p>Each document is tagged with trade_type during ingestion.</p>
<p>RAG search filters by trade_type before returning chunks.</p>
<p>Electrician query must only return NEC results, not IPC results.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: Update Edge Function trade routing to handle all 4 trade_type values</p>
<p>STEP 2: Add Electrician D7 system prompt to Edge Function</p>
<p>STEP 3: Add HVAC D7 system prompt to Edge Function</p>
<p>STEP 4: Add Roofer D7 system prompt to Edge Function</p>
<p>STEP 5: Ingest NEC 2023 for Electrician (trade_type='electrician')</p>
<p>STEP 6: Ingest IMC 2021 + ASHRAE for HVAC (trade_type='hvac')</p>
<p>STEP 7: Ingest IBC 2021 roofing sections for Roofer (trade_type='roofer')</p>
<p>STEP 8: Test all 4 trades end-to-end</p>
<p>STEP 9: Verify trade-specific safety escalations for each trade</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M9 BUILD REPORT</p>
<p>### Trade Routing (all 4 trade_type values tested — correct prompt loaded each)</p>
<p>### Context Questions (all 3 new trades — exact D7 questions verified)</p>
<p>### RAG Isolation (Electrician query → NEC only, not IPC — confirmed)</p>
<p>### Safety Escalations (all 4 trade safety scenarios tested and working)</p>
<p>### Plumber Regression (Plumber still works correctly after new profiles added)</p>
<p>### Code Documents Ingested (NEC, IMC, ASHRAE, IBC — chunk counts confirmed)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M9: All 4 trade profiles complete — Electrician, HVAC, Roofer added'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M10 System States, Edge Cases &amp; D7 Safety</strong> · Week 8</p>
<p><strong>Documents:</strong> D3 all edge cases · D6 Flow12 all screens · D7 safety rules · D8 Section J</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> All offline states: Rex queuing, mid-stream disconnect, report draft preserved, app-wide banner (D6 Flow12 S4-S7)</p>
<p><strong>02.</strong> Camera denied: photo button greyed, amber banner, Settings deep link, text+voice still work (D6 Flow12 S1)</p>
<p><strong>03.</strong> Microphone denied: voice button greyed, amber banner, Settings deep link (D6 Flow12 S2)</p>
<p><strong>04.</strong> Photo &gt;8MB: auto-compressed silently — no error shown to worker</p>
<p><strong>05.</strong> All empty states: Home, History, Reports tab, Quotes tab, Team Management (D6 Flow12 S13-S15)</p>
<p><strong>06.</strong> Skeleton loading on History, KPI, Job Detail during Supabase fetch (D6 Flow12 S21)</p>
<p><strong>07.</strong> Force upgrade screen — blocks all usage — App Store deep link (D6 Flow12 S19)</p>
<p><strong>08.</strong> Account suspended screen — Rex blocked — history read-only (D6 Flow12 S20)</p>
<p><strong>09.</strong> D7 Gas leak STOP: red block first before any diagnosis — Plumber (D6 Flow12 S22)</p>
<p><strong>10.</strong> D7 Cracked heat exchanger CO risk: STOP block first — HVAC (D6 Flow12 S23)</p>
<p><strong>11.</strong> D7 Fall protection: confirmed before at-height guidance — Roofer (D6 Flow12 S24)</p>
<p><strong>12.</strong> D7 Lockout/tagout: safety note last after full diagnosis — Electrician (D6 Flow12 S25)</p>
<p><strong>13.</strong> All API error states: Claude timeout 30s, 5xx error, Whisper fail, PDF fail, Supabase error (D6 Flow12 S16-S18)</p>
<p><strong>14.</strong> All 6 push notification deep links verified on physical devices</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ Disable network mid-Rex session: queued indicator shown, auto-sends on reconnect</p>
<p>✓ Deny camera: photo button greyed, Settings deep link opens device settings</p>
<p>✓ Send photo &gt;8MB: no error shown — Rex responds normally on compressed photo</p>
<p>✓ New account with no jobs: empty state illustration shown — not blank screen</p>
<p>✓ Skeleton loading: shimmer animation visible before History data loads</p>
<p>✓ Ask Rex Plumber about gas: STOP block in red appears before any diagnosis content</p>
<p>✓ Ask Rex HVAC about cracked heat exchanger: CO risk STOP block appears</p>
<p>✓ Ask Rex Roofer about rooftop work: fall protection confirmation required first</p>
<p>✓ Ask Rex Electrician about panel work: LOTO note appears after diagnosis</p>
<p>✓ Claude times out: 'Taking longer than usual' shown after 30 seconds with Retry</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Turn off internet mid-Rex session: queued indicator appears, re-enable: auto-sends</p>
<p>□ New account: History shows empty state with Start first job button — not blank</p>
<p>□ Ask Rex Plumber about a gas smell: red STOP block appears immediately</p>
<p>□ Ask Rex HVAC about heat exchanger crack: STOP CO block appears</p>
<p>□ Ask Rex Roofer about roof work without mentioning safety: fall protection asked first</p>
<p>□ All 4 safety scenarios: STOP/safety confirmation appears before guidance in each</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ D6 Flow12: all 25 screens match wireframes — verify each screen number</p>
<p>□ S22 Gas: STOP block is red, appears before diagnosis block</p>
<p>□ S23 HVAC: STOP block is dark red, CO named explicitly as odourless and fatal</p>
<p>□ S24 Roofer: orange block, OSHA 1926.502 cited, before guidance</p>
<p>□ S25 Electrician: dark amber block, appears LAST after full diagnosis</p>
<p>□ All offline banners: correct colour, correct messaging per D6</p>
<p>□ Skeleton: shimmer animation correct shape for History/KPI/Job Detail</p>
<p>□ Force upgrade: no dismiss button — only App Store link</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ RLS: attempt to read another user's job_sessions via API — blocked confirmed</p>
<p>□ DB trigger: attempt direct UPDATE on finalised report — exception raised confirmed</p>
<p>□ API keys: grep app bundle for sk_live, sk_test, openai, anthropic — zero results</p>
<p>□ Stripe webhook: send without signature — 400 returned — no DB change</p>
<p>□ Photo &gt;8MB: confirm compression applied — check file size in Supabase Storage</p>
<p>□ Offline message queue: messages stored locally then auto-sent — confirm in Supabase</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M10: SYSTEM STATES, EDGE CASES &amp; D7 SAFETY</p>
<p>YOU ARE CLAUDE CODE. Final feature layer — all system states, edge cases,</p>
<p>and D7 safety escalations across all 4 trades.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION (upload ALL before starting):</p>
<p>D3 Feature Specs v1.0 — all edge case sections in F1-F8</p>
<p>D6 Wireframes — flow_12_system_states.html (ALL 25 screens)</p>
<p>D7 AI System Prompts v2.0 — Safety rules for all 4 trades</p>
<p>D8 Test Plan v1.0 — Section J: System States and Security</p>
<p>---</p>
<p>HARD RULES:</p>
<p>RULE 1: Open flow_12_system_states.html before building anything.</p>
<p>Every screen in that file must be implemented.</p>
<p>Count them: 25 screens. Every one must exist in the app.</p>
<p>RULE 2: D7 Safety escalations are LIFE SAFETY. They must be exact.</p>
<p>Gas leak (S22): STOP block in RED appears BEFORE any diagnosis.</p>
<p>Cracked heat exchanger (S23): STOP block BEFORE diagnosis. CO named.</p>
<p>Fall protection (S24): ORANGE confirmation block BEFORE guidance.</p>
<p>Lockout/tagout (S25): Safety note LAST — AFTER full diagnosis.</p>
<p>These are different by design. Gas/HVAC = STOP first.</p>
<p>Electrician = diagnosis first, safety note last.</p>
<p>RULE 3: The app must NEVER show a blank white screen during loading.</p>
<p>Every screen that loads data from Supabase must show skeleton loading.</p>
<p>History list: skeleton cards. KPI dashboard: skeleton rows. Job Detail: skeleton tabs.</p>
<p>RULE 4: Camera/microphone denied — the app must not crash or freeze.</p>
<p>Photo button greyed. Voice button greyed. Amber banners with Settings deep links.</p>
<p>Text input still works. App continues functioning.</p>
<p>RULE 5: Photo &gt;8MB must be auto-compressed silently.</p>
<p>No error message. No 'file too large' notification.</p>
<p>The app compresses it further and sends the compressed version.</p>
<p>Worker never knows this happened.</p>
<p>RULE 6: Force upgrade screen must have NO dismiss option.</p>
<p>Worker cannot proceed past this screen without updating.</p>
<p>Only the App Store link is provided.</p>
<p>---</p>
<p>BUILD SEQUENCE:</p>
<p>STEP 1: App-wide offline detection + banner (all screens)</p>
<p>STEP 2: Rex offline queuing — message stored locally, auto-sends on reconnect</p>
<p>STEP 3: Camera permission denied handling</p>
<p>STEP 4: Microphone permission denied handling</p>
<p>STEP 5: Photo &gt;8MB silent compression</p>
<p>STEP 6: All empty states (Home, History, Reports, Quotes, Team Management)</p>
<p>STEP 7: Skeleton loading (History, KPI, Job Detail)</p>
<p>STEP 8: Force upgrade screen</p>
<p>STEP 9: Account suspended screen</p>
<p>STEP 10: Claude API timeout (30s) + 5xx error states</p>
<p>STEP 11: Whisper fail + text fallback</p>
<p>STEP 12: PDF generation fail + Supabase error</p>
<p>STEP 13: D7 Safety — Gas leak STOP (Plumber) — verify existing M2 implementation</p>
<p>STEP 14: D7 Safety — Cracked heat exchanger CO (HVAC)</p>
<p>STEP 15: D7 Safety — Fall protection (Roofer)</p>
<p>STEP 16: D7 Safety — Lockout/tagout last (Electrician)</p>
<p>STEP 17: All 6 push notification deep links — test on physical device</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY:</p>
<p>## M10 BUILD REPORT</p>
<p>### D6 Flow12 Coverage (list all 25 screens and their implementation status)</p>
<p>### D7 Safety Verification (all 4 scenarios tested — describe exact output for each)</p>
<p>### Security Verification (RLS, DB trigger, API keys, webhook signature — all tested)</p>
<p>### Offline Scenarios (all 4 offline types tested on device with network disabled)</p>
<p>### Skeleton Loading (all 3 screens confirmed — History, KPI, Job Detail)</p>
<p>### Deviations from Documentation (NONE is the target)</p>
<p>Commit: 'M10: System states, edge cases, and D7 safety complete'</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>STEP M11 Full QA Pass &amp; Pre-Launch</strong> · Week 8 + buffer</p>
<p><strong>Documents:</strong> D8 all 232 test cases · D9 Section 10 checklist</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>WHAT GETS BUILT IN THIS STEP</strong></p>
<p><strong>01.</strong> All 232 D8 test cases executed — results recorded as Pass / Fail / N/A</p>
<p><strong>02.</strong> All CRITICAL test cases pass — zero open CRITICAL defects</p>
<p><strong>03.</strong> All HIGH test cases pass or have founder-approved workarounds</p>
<p><strong>04.</strong> End-to-end subscription flow tested in Stripe LIVE mode (not test mode)</p>
<p><strong>05.</strong> All 6 push notification types tested on physical iOS AND Android devices</p>
<p><strong>06.</strong> Full KYC flow tested with real documents in Stripe Identity production mode</p>
<p><strong>07.</strong> Report and Quote PDFs verified on iOS and Android — formatting correct on both</p>
<p><strong>08.</strong> All offline scenarios tested on physical devices with network completely disabled</p>
<p><strong>09.</strong> All 20 items in D9 Section 10 Stripe Dashboard Setup Checklist completed for live mode</p>
<p><strong>10.</strong> App Store assets: icon, splash, screenshots, privacy labels, description prepared</p>
<p><strong>11.</strong> Privacy policy reviewed — data handling compliant with applicable law</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EXPECTED RESULT — GATE CRITERIA</strong></p>
<p>✓ All 232 D8 test cases documented with results</p>
<p>✓ Zero open CRITICAL defects</p>
<p>✓ Stripe live mode: subscribe, pay with real card, subscription activates</p>
<p>✓ Push notifications arrive on real iOS and Android devices for all 6 types</p>
<p>✓ KYC: real ID document verified through Stripe Identity in production</p>
<p>✓ PDFs: correct formatting on iOS and Android</p>
<p>✓ App Store: binary uploaded, review checklist complete</p>
<p>✓ All D9 Section 10 checklist items checked</p></td>
</tr>
</tbody>
</table>

**Evaluation Checklists --- Complete All Three Before Proceeding**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>FOUNDER VERIFIES — Visual &amp; Behavioural</strong></p>
<p>□ Walk through D8 verification checklist for each step with developers</p>
<p>□ Sign off on each CRITICAL test case personally</p>
<p>□ Subscribe with a real credit card in live mode — confirm charge appears</p>
<p>□ Receive real push notifications on your own phone</p>
<p>□ Verify KYC with your own ID document in production mode</p>
<p>□ PDF downloaded from the app: opens and reads correctly</p>
<p>□ App icon and splash screen: match TradesBrain brand</p>
<p>□ Final sign-off: all 20 D9 dashboard checklist items confirmed</p></td>
<td><p><strong>FRONTEND DEV VERIFIES — Screens &amp; UI</strong></p>
<p>□ All D8 Section A (auth), C (reports), D (quotes), E (codes), F (history) test cases pass</p>
<p>□ D8 Section H (profile) all test cases pass</p>
<p>□ PDF formatting correct on both iOS and Android</p>
<p>□ App Store assets: all screenshots taken, metadata complete</p>
<p>□ App icon: correct at all sizes, no white border issues</p></td>
<td><p><strong>BACKEND DEV VERIFIES — Data &amp; Logic</strong></p>
<p>□ All D8 Section J (security) test cases pass</p>
<p>□ All D8 Section G (subscription) test cases pass with Stripe live mode</p>
<p>□ All D8 Section I (team management) test cases pass</p>
<p>□ Stripe live mode: all webhook events processing correctly in production</p>
<p>□ All 20 D9 Section 10 checklist items confirmed for live mode</p>
<p>□ Production Edge Functions: all 11 active, all environment variables set for live</p></td>
</tr>
</tbody>
</table>

**Claude Code Prompt --- Copy and Paste This Exactly**

Upload the documents listed at the top of the prompt, then paste this entire block into Claude Code:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p># TRADESBRAIN — STEP M11: FULL QA PASS &amp; PRE-LAUNCH</p>
<p>YOU ARE CLAUDE CODE. All features are built. This is the final QA and</p>
<p>pre-launch step. Your role: fix defects found during QA testing.</p>
<p>The team runs all 232 D8 test cases. You fix what fails.</p>
<p>---</p>
<p>OFFICIAL DOCUMENTATION:</p>
<p>D8 Test Plan v1.0 — ALL 232 test cases (upload this for every fix session)</p>
<p>D9 Stripe Integration v1.0 — Section 10: Dashboard Setup Checklist</p>
<p>---</p>
<p>HARD RULES FOR QA FIXES:</p>
<p>RULE 1: Every fix must reference the failing D8 test case ID (TC-XXX).</p>
<p>'Fix TC-089: Rex streaming response — input bar not dimming during stream'</p>
<p>Do not fix something without knowing which test case it corresponds to.</p>
<p>RULE 2: Fixing one thing must not break another.</p>
<p>After every fix, re-run the test cases for the affected feature.</p>
<p>Confirm no regressions before moving to the next defect.</p>
<p>RULE 3: No new features in this step.</p>
<p>If the team asks for something not in the documentation during QA,</p>
<p>the answer is: that is not in the specification and will not be built.</p>
<p>QA fixes defects against the spec — it does not add scope.</p>
<p>RULE 4: All Stripe testing in live mode must use real payment methods.</p>
<p>Test cards are not accepted in live mode. The team must use a real card.</p>
<p>This step is about production readiness — not sandbox testing.</p>
<p>---</p>
<p>QA PROCESS FOR THE TEAM:</p>
<p>1. Open D8 Test Plan v1.0</p>
<p>2. Start at TC-001, work through all 232 test cases in order</p>
<p>3. For each test case: execute the steps, mark Pass / Fail / N/A</p>
<p>4. For every Fail: log a defect (DEF-XXX) with the TC-XXX reference</p>
<p>5. Send defect details to Claude Code with the failing TC-XXX</p>
<p>6. Claude Code fixes the defect and reports what was changed</p>
<p>7. Re-test the failing TC-XXX to confirm fix</p>
<p>8. Continue to next test case</p>
<p>---</p>
<p>REPORTING REQUIREMENT — MANDATORY (final build report):</p>
<p>## M11 FINAL BUILD REPORT — PRE-LAUNCH</p>
<p>### Test Coverage (232 test cases — Pass/Fail/NA count)</p>
<p>### Open Defects (list any open defects with severity and status)</p>
<p>### Stripe Live Mode (subscription tested — confirmed working in production)</p>
<p>### Security Final Check (all D8 Section J tests passed — list each)</p>
<p>### D9 Section 10 Checklist (all 20 items — confirm each completed)</p>
<p>### App Store Readiness (binary uploaded, metadata complete)</p>
<p>### Production Environment (all Edge Functions live, all secrets set for production)</p>
<p>### Final Declaration: TradesBrain is ready for Phase 1 launch.</p>
<p>Commit: 'M11: Full QA pass complete — TradesBrain v1.0 ready for launch'</p></td>
</tr>
</tbody>
</table>

**SECTION 3 --- CLAUDE CODE UNIVERSAL RULES**

These rules apply to every Claude Code session regardless of which step you are on. They are already embedded in every prompt in this document. They are listed here for your reference.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>RULE — DOCUMENTS FIRST:</p>
<p>Claude Code reads the specified documents before writing any code.</p>
<p>It states which document and section governs each decision.</p>
<p>RULE — NO INVENTION:</p>
<p>Claude Code does not add features, tables, fields, or screens not in the documents.</p>
<p>If it is not in D1-D10 or D6 wireframes — it does not get built.</p>
<p>RULE — SECURITY NON-NEGOTIABLE:</p>
<p>API keys (Anthropic, OpenAI, Stripe secret) are never in the mobile app bundle.</p>
<p>RLS is enabled on every Supabase table. Webhook signatures are always verified.</p>
<p>These rules have no exceptions and no 'we'll add it later'.</p>
<p>RULE — BUILD REPORT ALWAYS:</p>
<p>Every session ends with a structured Build Report documenting what was built,</p>
<p>what documents it references, and what deviations (if any) occurred.</p>
<p>RULE — ONE STEP AT A TIME:</p>
<p>Claude Code builds one step at a time. The next step does not start until</p>
<p>the current step passes all evaluation checklists.</p>
<p>RULE — GATE IS HARD:</p>
<p>A failing CRITICAL checklist item stops the build.</p>
<p>Time pressure does not override a broken gate.</p>
<p>A broken foundation means everything built on top of it is also broken.</p></td>
</tr>
</tbody>
</table>

**DOCUMENT STATUS**

|              |                                                   |
|--------------|---------------------------------------------------|
| **Document** | TradesBrain --- Claude Code Build Execution Guide |

|             |                   |
|-------------|-------------------|
| **Version** | v1.0 --- Official |

|          |            |
|----------|------------|
| **Date** | April 2026 |

|           |                     |
|-----------|---------------------|
| **Steps** | 12 (M0 through M11) |

|                  |                                          |
|------------------|------------------------------------------|
| **Build engine** | Claude Code --- all code, front and back |

|                     |                                    |
|---------------------|------------------------------------|
| **Confidentiality** | Confidential --- Internal use only |

|                                                                                            |
|--------------------------------------------------------------------------------------------|
| TradesBrain --- Claude Code Build Execution Guide --- v1.0 --- April 2026 --- Confidential |
