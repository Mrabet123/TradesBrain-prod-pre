**TRADESBRAIN**

D2 --- User Flow Diagrams

*Complete logic flows for every user path through the TradesBrain mobile app*

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Version: 1.0 — Locked and approved for development</p>
<p>Date: April 17, 2026</p>
<p>Status: All flows validated — approved for build</p>
<p>Depends on: D1 PRD v1.0</p>
<p>Total flows: 10 (Sign Up, Sign In, F1–F8)</p>
<p>Confidentiality: Confidential — Internal use only</p></td>
</tr>
</tbody>
</table>

|                                     |          |            |
|-------------------------------------|----------|------------|
| **Flow**                            | **Type** | **Status** |
| Sign Up Flow                        | Entry    | **Locked** |
| Sign In Flow                        | Entry    | **Locked** |
| F1 --- Onboarding                   | Core     | **Locked** |
| F2 --- AI Diagnostic (Rex Core)     | Core     | **Locked** |
| F3 --- Job Report (Path A + B)      | Core     | **Locked** |
| F4 --- Quote Generator (Path A + B) | Core     | **Locked** |
| F5 --- Trade Code Lookup            | Core     | **Locked** |
| F6 --- Job History and Records      | Core     | **Locked** |
| F7 --- Subscription and Paywall     | Core     | **Locked** |
| F8 --- Settings and Profile         | Core     | **Locked** |

**ARCHITECTURE DECISIONS --- LOCKED**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>NOTE</strong></p>
<p>NAVBAR — Six permanent tabs:</p>
<p>Home | Rex | Report | Quote | Codes | History</p>
<p>DOCUMENT GENERATION — Two paths:</p>
<p>Path A: From active Rex session (Rex has full job context)</p>
<p>Path B: Standalone via Report or Quote tab (Rex builds from worker voice summary)</p>
<p>Both paths always create a new job entry in the archive.</p>
<p>Worker always prompted to name the job file before archiving.</p>
<p>VERIFIED DOCUMENTS — Permanently locked once verified:</p>
<p>VAT number, license proof, national ID — read-only forever after KYC approval.</p>
<p>FINALISED DOCUMENTS — Permanently locked once confirmed:</p>
<p>Job reports and quotes — read-only once confirmed and archived.</p>
<p>New documents can only be generated from an active Rex session.</p>
<p>DESKTOP VERSION — Post-launch Phase 2 only.</p>
<p>Mobile app is the only build scope for current phase.</p>
<p>Backend architecture must support future web dashboard expansion.</p></td>
</tr>
</tbody>
</table>

**SIGN UP FLOW --- New User Account Creation**

The complete path from first opening the app to having a fully created account and landing on the home screen ready to use Rex. Must complete in under 5 minutes.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>OTP verification (email + SMS) is triggered ONLY after the user taps 'Create Account' with a fully valid form.</p>
<p>Both OTP codes must be verified on a single screen before proceeding.</p>
<p>National ID is a soft gate — required only before subscribing to a paid plan.</p>
<p>Verified documents (VAT, license, national ID) are permanently locked once approved.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>App first launch — splash screen</strong></p>
<p>TradesBrain logo displayed for 1.5 seconds. System checks for existing auth session. No session found — proceed to welcome screen.</p>
<p><em>⚙ Tech: Supabase Auth session check</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Welcome screen</strong></p>
<p>Two options presented: 'Create Account' and 'Sign In'. Tagline: 'Your AI co-pilot on every job site.' Clean, no forced reading.</p></td>
</tr>
</tbody>
</table>

*↓ User taps \'Create Account\'*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Sign Up Form — single form, all fields</strong></p>
<p>Worker fills in one complete form. Form validates inline as fields are completed. 'Create Account' button remains greyed out until all required fields are valid.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>REQUIRED FIELDS:</p>
<p>• Full name</p>
<p>• Email address</p>
<p>• Password (minimum 8 characters — strength indicator shown)</p>
<p>• Phone number (country code selector included)</p>
<p>• Trade type (Plumber / Electrician / HVAC Technician / Roofer / Other-General Contractor)</p>
<p>• Account type (Solopreneur / Team Owner)</p>
<p>• Hourly rate in $ (feeds into all quote calculations)</p>
<p>• VAT number (text entry — locked permanently once account verified)</p>
<p>• License proof: photo upload + license number text field (stored for accountability only — not verified)</p>
<p>OPTIONAL FIELDS:</p>
<p>• National ID: photo upload (soft gate — required before paid plan subscription, verified via KYC API)</p>
<p>• Company name</p>
<p>• Company logo: photo upload</p></td>
</tr>
</tbody>
</table>

*↓ User taps \'Create Account\' --- form fully valid*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Account creation triggers simultaneously</strong></p>
<p>Supabase creates user record. Email OTP sent to entered email address. SMS OTP sent to entered phone number. Both triggered at same moment.</p>
<p><em>⚙ Tech: Supabase Auth + Email OTP + SMS OTP</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Dual OTP verification screen</strong></p>
<p>Single screen with two input fields: email OTP code and SMS OTP code. Both must be verified to proceed. Resend option available per channel after 60-second timer. Progress shown: 'Email verified ✓' and 'Phone verified ✓' as each is completed.</p></td>
</tr>
</tbody>
</table>

*↓ Both OTPs verified*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>6</strong></td>
<td><p><strong>Terms of Use and Privacy Policy acknowledgement</strong></p>
<p>Worker must read and tap 'I agree to the Terms of Use and Privacy Policy' before proceeding. Acknowledgement date and version stored permanently in their account for legal compliance. Cannot skip.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>7</strong></td>
<td><p><strong>Account created — Home screen</strong></p>
<p>Worker lands on home screen. Small dismissible banner at top: 'You have 10 free Rex queries — no card needed.' Free trial active. Onboarding complete.</p>
<p><em>⚙ Tech: Supabase — user profile record active</em></p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Email already registered → show 'This email is already registered — sign in instead?' with link to sign in.</p>
<p>Phone number already registered → show 'This phone number is already linked to an account — sign in instead?'</p>
<p>Google OAuth selected → opens native OAuth sheet. On success: skip to step 5 with email pre-verified. On cancel: return to welcome screen.</p>
<p>OTP expired (10 minutes) → show 'Code expired — request a new one' with resend button.</p>
<p>Wrong OTP entered 3 times → lock OTP input for 5 minutes. Show countdown timer.</p>
<p>No internet during form submit → show 'No connection — check your signal and try again.' Form data preserved.</p>
<p>Photo upload fails (license or ID) → show 'Upload failed — try a smaller file or different format.' Allow retry.</p>
<p>User abandons mid-form → form data preserved locally. Restored on next app open.</p></td>
</tr>
</tbody>
</table>

**SIGN IN FLOW --- Returning User**

The path for a worker who already has a TradesBrain account returning to the app.

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>App launch — splash screen</strong></p>
<p>Session check runs. No active session found — proceed to welcome screen.</p>
<p><em>⚙ Tech: Supabase Auth session check</em></p></td>
</tr>
</tbody>
</table>

*↓ Session found → skip directly to Home screen*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Welcome screen</strong></p>
<p>Two options: 'Create Account' and 'Sign In'. Worker taps 'Sign In'.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Sign In screen — three methods</strong></p>
<p>Three sign-in options displayed equally:</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>METHOD 1 — Email + Password:</p>
<p>Enter registered email and password. Tap 'Sign In'.</p>
<p>Forgot password link → sends reset email → worker sets new password → returns to sign in.</p>
<p>METHOD 2 — Google OAuth:</p>
<p>Tap 'Continue with Google' → native OAuth sheet opens → account linked automatically.</p>
<p>METHOD 3 — Phone number + OTP (SMS):</p>
<p>Enter registered phone number → SMS OTP sent → enter code → signed in.</p></td>
</tr>
</tbody>
</table>

*↓ Authentication successful*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Subscription status check</strong></p>
<p>System checks subscription status silently in background.</p>
<p><em>⚙ Tech: Supabase — subscription_status check</em></p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Active subscription → full access. Land on Home screen.</p>
<p>Expired subscription or no subscription → land on Home screen.</p>
<p>All feature buttons disabled. Read-only access only.</p>
<p>Paywall shown only when worker taps a feature button.</p>
<p>Dashboard, archive, history, settings — all accessible for display.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Wrong password → show 'Incorrect password — try again or reset your password.'</p>
<p>Account not found → show 'No account found with this email — create one instead?' with link.</p>
<p>Account suspended → show 'Your account has been suspended — contact support.'</p>
<p>Too many failed attempts (5) → lock sign in for 15 minutes. Show countdown.</p>
<p>Google OAuth cancelled → return to sign in screen.</p>
<p>No internet → show 'No connection — sign in requires internet access.'</p></td>
</tr>
</tbody>
</table>

**F1 --- ONBOARDING --- Trade and Account Type Selection**

Onboarding happens within the Sign Up flow. After account creation, the worker\'s trade type and account type are captured as part of the sign-up form. This flow documents the specific behaviour of those selections and their consequences throughout the app.

**Trade Type Selection Behaviour**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Plumber selected → Rex loads Plumber system prompt (IPC 2021, UPC 2021, ASME B31.9, NFPA codes)</p>
<p>Electrician selected → Rex loads Electrician system prompt (NEC codes)</p>
<p>HVAC Technician selected → Rex loads HVAC system prompt (ASHRAE, IMC codes)</p>
<p>Roofer selected → Rex loads Roofer system prompt (IBC roofing codes)</p>
<p>Other / General Contractor selected → Rex asks at start of every session:</p>
<p>'What is your primary trade on this job?' Worker specifies → Rex calibrates for that trade.</p></td>
</tr>
</tbody>
</table>

**Account Type Selection Behaviour**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Solopreneur selected → Standard solo experience. Team Management section hidden in settings.</p>
<p>Team features unlock only when Team plan is purchased.</p>
<p>Team Owner selected → Same app experience as Solopreneur at start.</p>
<p>Team Management section visible in settings but prompts plan upgrade.</p>
<p>Full team features unlock when Team plan is purchased.</p>
<p>Owner can add up to 10 technician accounts on Team plan.</p>
<p>Per-seat pricing applies beyond 10 technicians.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>NOTE</strong></p>
<p>DOWNGRADE WARNING: Downgrading from Team plan to Solo plan permanently and immediately deletes</p>
<p>all team member accounts and all their data — Rex sessions, reports, quotes, photos, job history.</p>
<p>This action requires typing DELETE to confirm and is enforced in Terms of Use.</p>
<p>This action is irreversible.</p></td>
</tr>
</tbody>
</table>

**F2 --- AI DIAGNOSTIC --- Rex Job Collaboration**

The core feature of TradesBrain. The complete collaboration protocol between Rex and the professional on a live job site. This is the most critical flow in the app.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ENTRY POINTS</strong></p>
<p>Entry point 1: Central 'Rex' tab in bottom navigation bar.</p>
<p>Entry point 2: 'New Job' button on home screen.</p>
<p>Pre-condition: Subscription check runs BEFORE camera opens.</p>
<p>Active subscription or free trial with queries remaining → proceed.</p>
<p>Free trial at 0 queries → paywall shown. Camera never opens.</p>
<p>Expired subscription → paywall shown. Camera never opens.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>The plumber is always in control. Rex proposes the structured process but never forces stages.</p>
<p>If the plumber skips a stage or requests a different focus — Rex adapts immediately.</p>
<p>Report and Quote buttons appear ONLY after the worker taps 'Close Job'. Never during active assistance.</p>
<p>Free trial query count is never shown on screen. Paywall appears when count reaches zero.</p>
<p>Job session stays open until worker explicitly taps 'Close Job'.</p>
<p>Abandoned sessions (app closed mid-job) restart fresh on return. Previous data preserved in Supabase.</p>
<p>Closed job sessions can be reopened from Job History at any time.</p></td>
</tr>
</tbody>
</table>

**INPUT OPTIONS**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Primary input: Photo + voice description (recommended — gives Rex the most context)</p>
<p>Secondary input: Voice only — no photo required</p>
<p>Tertiary input: Text only — typed description</p>
<p>Photo is never mandatory. Rex works with whatever the worker provides.</p>
<p>Multiple photos can be sent in a single message.</p></td>
</tr>
</tbody>
</table>

**THE FIVE-STAGE COLLABORATION PROTOCOL**

Rex drives the process through five stages. The worker can skip any stage at any time --- Rex adapts immediately on request.

**Stage 1 --- Problem Identification**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>Worker submits initial input</strong></p>
<p>Worker takes photo and/or speaks description and/or types description. Taps send. Job session created in Supabase with status 'active'. Free trial query count decremented by 1.</p>
<p><em>⚙ Tech: Supabase job_sessions record created</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Rex performs visual and audio analysis</strong></p>
<p>Claude API call: photo (base64) + transcript + RAG code context + system prompt. Stream:true. Response appears word by word on screen.</p>
<p><em>⚙ Tech: Whisper API → transcript. Supabase pgvector RAG → top 5 code sections. Claude API Sonnet 4.5 → streaming response</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Rex requests clarification if needed</strong></p>
<p>If input is insufficient for confident diagnosis — Rex never guesses. Rex tells the worker exactly what it needs and provides contextual buttons only relevant to the current need.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CONTEXTUAL BUTTONS — Stage 1 (shown only when Rex needs more):</p>
<p>'Take photo' — Rex needs a specific shot (Rex describes exactly what angle/area)</p>
<p>'Describe further' — Rex needs more voice or text detail (Rex specifies what is missing)</p>
<p>'That is all I have' — Worker cannot provide more, Rex works with available input</p>
<p>Rex instruction example: 'I can see corrosion on the elbow but I need a closer shot</p>
<p>from the left side to confirm if this is the fitting or the pipe body. Can you send that?'</p></td>
</tr>
</tbody>
</table>

**Stage 2 --- Analysis and Diagnosis**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Rex presents diagnosis and confirms before proceeding</strong></p>
<p>Rex identifies root cause. Presents diagnosis clearly. Asks worker to confirm before moving to repair steps.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CONTEXTUAL BUTTONS — Stage 2:</p>
<p>'Yes confirmed' — Worker agrees with diagnosis, proceed to steps</p>
<p>'Not yet — how do I do this?' — Worker needs guidance on a prerequisite</p>
<p>'That is not what I see — let me explain' — Opens voice/text input for worker to correct Rex</p></td>
</tr>
</tbody>
</table>

**Stage 3 --- Step-by-Step Guidance**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Rex delivers repair steps one at a time</strong></p>
<p>Rex walks through the fix step by step. After each step Rex asks for confirmation or a progress photo before delivering the next step.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CONTEXTUAL BUTTONS — Stage 3 (after each step):</p>
<p>'Step done — here is my photo' — Opens camera directly for progress evaluation</p>
<p>'Step done — moving on' — Worker confirms completion without photo</p>
<p>'I have a problem at this step' — Opens voice/text input for worker to describe issue</p>
<p>If progress photo provided:</p>
<p>Rex evaluates photo against expected state.</p>
<p>Correct → confirms and delivers next step.</p>
<p>Incorrect → flags the issue directly without blame and instructs correction before proceeding.</p>
<p>Worker can skip to any stage at any time by stating their need:</p>
<p>Rex immediately adapts and moves to wherever the worker needs.</p></td>
</tr>
</tbody>
</table>

**Stage 4 --- Completion and Final Examination**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>6</strong></td>
<td><p><strong>Worker signals job is done</strong></p>
<p>After final step confirmed — 'I think it is done' button appears. Worker taps it.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>7</strong></td>
<td><p><strong>Worker provides final photo and/or summary</strong></p>
<p>Final photo of completed work and/or voice confirmation of what was done. Rex performs final examination.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>8</strong></td>
<td><p><strong>Rex gives final clearance</strong></p>
<p>Rex confirms the job looks correctly completed. Example: 'The joint looks correctly seated. Restore pressure slowly and report back — any weeping at any joint?' Worker confirms all clear. Rex gives final sign-off.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CONTEXTUAL BUTTONS — Stage 4:</p>
<p>'All clear — no issues' — Job complete, proceed to close</p>
<p>'There is still an issue' — Returns to Stage 3 guidance</p></td>
</tr>
</tbody>
</table>

**Stage 5 --- Close and Post-Job**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>9</strong></td>
<td><p><strong>Worker taps 'Close Job'</strong></p>
<p>Session status updated to 'completed' in Supabase. Worker prompted to name the job file: 'Give this job a name before saving it.' Worker types name. If skipped: auto-named as job date + jobsite (if available) or 'Job — [date]'.</p>
<p><em>⚙ Tech: Supabase job_sessions status → completed</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>10</strong></td>
<td><p><strong>Post-job options appear — ONLY at this point</strong></p>
<p>Two buttons appear after job is closed and named:</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>'Generate Job Report' — Opens F3 Report flow with job context pre-loaded (Path A)</p>
<p>'Generate Quote' — Opens F4 Quote flow with job context pre-loaded (Path A)</p>
<p>These buttons NEVER appear during active assistance — only after job close.</p>
<p>Worker can also skip both and find the job in History later.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>No internet at send: 'No connection — recording saved. Tap send when you have signal.' Stored locally.</p>
<p>Whisper transcription fails: 'Could not transcribe — type your description instead.' Text input shown.</p>
<p>Claude API timeout (30 seconds): 'Taking longer than usual — tap to retry.' Message preserved.</p>
<p>Claude API error: 'Rex is unavailable right now — try again in a moment.' Message stored locally.</p>
<p>Photo too large (over 8MB): Auto-compress further. Never show an error for large photos.</p>
<p>Camera permission denied: 'Camera access needed — tap to open settings.' Deep link to device settings.</p>
<p>Microphone permission denied: 'Microphone access needed — tap to open settings.' Deep link to device settings.</p>
<p>App closed mid-session: Session data preserved in Supabase. On return: Rex restarts fresh collaboration.</p>
<p>Rex references previous conversation: 'Last time we were working on [summary]. What do we need now?'</p>
<p>Closed job reopened from History: Rex re-reads full session history.</p>
<p>Opens with: 'Last time: [brief summary]. What do we need to do now?'</p></td>
</tr>
</tbody>
</table>

**F3 --- JOB REPORT GENERATION**

Two independent entry paths for generating a professional job report. Rex always requires the worker to provide the summary --- never auto-generates from session history alone.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ENTRY POINTS</strong></p>
<p>Path A: 'Generate Job Report' button after closing a Rex job session (F2 Stage 5).</p>
<p>Path B: 'Report' tab in bottom navigation bar — standalone, no Rex session required.</p>
<p>Both paths produce identical documents. Both create a new job archive entry.</p></td>
</tr>
</tbody>
</table>

**Path A --- From Active Rex Session**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>Report screen opens</strong></p>
<p>Job context pre-loaded from the closed Rex session: date, trade type, jobsite if provided. Worker's profile data available: name, company, VAT, hourly rate, license number.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Report structure confirmation (first time only)</strong></p>
<p>Rex asks: 'What sections do you want in your job report? For example: client info, problem description, work performed, materials used, time spent, payment summary. Tell me what you need.' Worker defines sections. Rex saves this structure and reuses it for all future reports. Always editable per report.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Worker provides job summary by voice</strong></p>
<p>Worker holds record button and speaks: client information, problem solved, materials used, time spent on jobsite, any additional notes. Rex never auto-generates from session history — worker's spoken summary is always required.</p>
<p><em>⚙ Tech: expo-av recording + OpenAI Whisper API transcription</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Transcript shown — worker reviews and corrects</strong></p>
<p>Transcribed text displayed in editable field. Worker corrects any transcription errors before proceeding.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Rex confirms fields to include</strong></p>
<p>Before generating, Rex asks worker to confirm which profile fields to include: 'Should I include your VAT number and license number in this report?' Worker confirms yes or no per field.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>6</strong></td>
<td><p><strong>Rex drafts the full report</strong></p>
<p>Rex combines: worker's spoken summary + pre-confirmed sections + scraped profile data (name, company, VAT if confirmed, license if confirmed, hourly rate). Rex also calculates and includes suggested compensation rate and total payment amount based on: hours spoken by worker × hourly rate from profile + materials mentioned.</p>
<p><em>⚙ Tech: Claude API — Haiku model — report formatting</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>7</strong></td>
<td><p><strong>Report preview — worker validates</strong></p>
<p>Full formatted report displayed. Fully editable inline — worker taps any section to edit. Worker reviews suggested payment amount and can adjust.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>8</strong></td>
<td><p><strong>Worker taps 'Confirm Report'</strong></p>
<p>Rex finalises the report. PDF generated.</p>
<p><em>⚙ Tech: react-pdf — PDF generation</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>9</strong></td>
<td><p><strong>Job naming and archiving</strong></p>
<p>Worker prompted: 'Give this job a name before saving it.' Worker names the job. Job entry created in archive with: job name, date, jobsite, trade type badge. Report linked to job entry.</p>
<p><em>⚙ Tech: Supabase Storage — PDF stored. job_reports record created.</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>10</strong></td>
<td><p><strong>Share and download options</strong></p>
<p>Native share sheet: WhatsApp, email, AirDrop. Download to device. Report also accessible from Job History archive permanently. No in-app sending to customers — external only.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>Once confirmed and archived — job report is permanently locked. Read-only forever.</p>
<p>If worker needs a new report for the same job — reopen the Rex session from History,</p>
<p>generate a completely new report from the new session data.</p>
<p>Original archived report remains untouched.</p></td>
</tr>
</tbody>
</table>

**Path B --- Standalone Report Generation**

Worker opens Report tab directly without any prior Rex session. Rex activates in document-generation mode only.

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>Report tab opened from navbar</strong></p>
<p>Rex opens in standalone report mode. Greeting: 'Tell me about the job — describe what the problem was, what you did, what materials you used, and how long it took.'</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Worker speaks job description</strong></p>
<p>Worker describes the job from scratch by voice. Rex listens, then asks specific follow-up questions for anything missing or unclear.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Rex asks follow-up questions as needed</strong></p>
<p>Example: 'You mentioned replacing a valve — what size and material? Did you use additional fittings?' This continues until Rex has everything needed.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Report structure + field confirmation</strong></p>
<p>Same as Path A steps 2 and 5 — Rex confirms sections and profile field inclusion.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Report drafted, validated, finalised, archived</strong></p>
<p>Same as Path A steps 6–10. Worker names the job. New job entry created in archive.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Worker provides very short description (under 5 seconds): Rex generates from minimal input,</p>
<p>flags 'Short description — add more detail if needed for accuracy.'</p>
<p>No internet during PDF generation: Save report text locally. Generate PDF when connection returns.</p>
<p>Worker exits mid-report: Auto-save draft. Restore on next entry.</p>
<p>Hourly rate not set in profile: Rex flags 'Your hourly rate is not set — payment calculation skipped.'</p>
<p>Link to settings to set hourly rate provided inline.</p></td>
</tr>
</tbody>
</table>

**F4 --- QUOTE GENERATOR**

Two independent entry paths identical in structure to F3. Quote and job report are separate independent documents --- neither depends on the other.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ENTRY POINTS</strong></p>
<p>Path A: 'Generate Quote' button after closing a Rex job session (F2 Stage 5).</p>
<p>Path B: 'Quote' tab in bottom navigation bar — standalone, no Rex session required.</p>
<p>Both paths produce identical documents. Both create a new job archive entry.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>Quote and job report are two completely independent documents.</p>
<p>If worker generates report FIRST then quote in the same job session:</p>
<p>Rex identifies and reuses validated data from the report — client info, materials, time, labour.</p>
<p>Rex does not ask worker to re-enter information it already has from the report.</p>
<p>If quote is generated FIRST with no prior report: Rex asks worker to provide all from scratch.</p>
<p>Payment terms are always defined by the worker — Rex never assumes payment terms.</p>
<p>Rex can save worker's default payment terms preference and reuse if worker instructs it to.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>Quote screen opens</strong></p>
<p>Path A: job context pre-loaded. Path B: blank — Rex asks worker to describe the job by voice.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Quote structure confirmation (first time only)</strong></p>
<p>Rex asks: 'What sections do you want in your quote? For example: client details, scope of work, materials list, labour hours, total amount, payment terms.' Rex saves structure for all future quotes.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Worker describes job (Path B) or confirms data (Path A)</strong></p>
<p>Path A: Rex presents data it already has from the Rex session or report. Worker confirms or corrects. Path B: Worker speaks job description. Rex asks follow-up questions for missing details.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Field inclusion confirmation</strong></p>
<p>Rex asks: 'Should I include your VAT number and license number in this quote?' Worker confirms per field. Applies each time.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Rex generates line-item quote</strong></p>
<p>Output: structured line items — material name, quantity, unit cost, line total. Plus: labour hours × worker's hourly rate from profile. Markup guidance shown: '15–30% on materials recommended.' Total shown as range with variables explained — not a single fixed price.</p>
<p><em>⚙ Tech: Claude API — Haiku model</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>6</strong></td>
<td><p><strong>Quote preview — fully editable</strong></p>
<p>Line-item table displayed. Each row editable: quantity, unit cost, description. Add line button at bottom. Total updates in real time. Payment terms field — worker enters their terms (or Rex applies saved preference if set).</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>7</strong></td>
<td><p><strong>Worker taps 'Confirm Quote'</strong></p>
<p>Rex finalises. PDF generated. Worker prompted to name job. New job entry created in archive.</p>
<p><em>⚙ Tech: react-pdf + Supabase Storage</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>8</strong></td>
<td><p><strong>Share and download</strong></p>
<p>WhatsApp, email, AirDrop, download to device. No in-app sending to customers.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Hourly rate not set: Rex flags and skips labour line. Link to settings provided.</p>
<p>Rex cannot estimate materials for unusual job: Generates available lines, flags uncertain ones with asterisk.</p>
<p>Worker deletes all line items: 'Quote is empty — describe the job to generate items.'</p>
<p>No internet during PDF generation: Save locally, generate PDF when connection returns.</p></td>
</tr>
</tbody>
</table>

**F5 --- TRADE CODE LOOKUP**

Conversational code search backed by the Supabase RAG database. Accessible at all times --- inside or outside an active Rex job session.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ENTRY POINTS</strong></p>
<p>Entry point 1: 'Codes' tab in bottom navigation bar — accessible at all times.</p>
<p>Entry point 2: From within an active Rex job session — worker can open Codes without closing the job.</p>
<p>Available to: all users including free trial users (does not consume a Rex diagnostic query).</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>Code lookup screen opens</strong></p>
<p>Trade type badge displayed (worker's registered trade from profile). Recent lookups listed below (empty on first use). Search field with microphone icon for voice input.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Worker submits query</strong></p>
<p>Worker types or speaks a plain language question. No special syntax required. Examples: 'What is the minimum slope for a 3-inch drain?' or 'Does a gas water heater in a bedroom closet need direct ventilation?'</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>RAG search and Rex response</strong></p>
<p>Query converted to embedding. Supabase pgvector searched. Top 3 most relevant code sections retrieved. Rex generates concise plain-language answer with specific section number cited. Response streams to screen.</p>
<p><em>⚙ Tech: Supabase pgvector semantic search + Claude API Sonnet 4.5</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Result displayed</strong></p>
<p>'Verify current adoption in your jurisdiction — local amendments may apply' note always shown. 'Ask follow-up' input available for related questions. If inside active Rex session: 'Add to job notes' button links result to current job.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>Code lookup is a lookup-only feature — no personal library saving.</p>
<p>Trade type badge = worker's registered trade from profile.</p>
<p>Worker can temporarily change trade type for a specific lookup session.</p>
<p>Temporary change applies to that lookup only — does not change registered profile trade.</p>
<p>Registered trade type only changes when worker updates it in Settings.</p>
<p>Code lookup agent always performs search based on currently selected trade type.</p>
<p>No Rex query count deducted for code lookups.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>No matching code sections found: Rex gives best general guidance and states:</p>
<p>'I could not find a specific code section — verify with your AHJ directly.'</p>
<p>Question outside registered trade: Rex answers with available knowledge,</p>
<p>suggests switching to the relevant trade type for more accurate code references.</p>
<p>No internet: 'Code lookup requires a connection — recent lookups shown below.'</p>
<p>Last 10 lookups cached locally for offline viewing.</p></td>
</tr>
</tbody>
</table>

**F6 --- JOB HISTORY AND RECORDS**

The worker\'s complete archive of all past jobs. Read-only display for completed documents. Active collaboration available on reopened Rex sessions.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ENTRY POINTS</strong></p>
<p>Entry point: 'History' tab in bottom navigation bar.</p>
<p>Accessible to: all users regardless of subscription status (display only when subscription expired).</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>History screen opens</strong></p>
<p>Chronological list of all archived job entries. Search bar at top.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>JOB CARD DISPLAYS:</p>
<p>• Job name (worker-defined) — primary identifier</p>
<p>• Date of job</p>
<p>• Jobsite (if provided during session)</p>
<p>• Trade type badge</p>
<p>• Status: Completed / Reopened</p>
<p>No customer name displayed on job cards or history board.</p>
<p>SEARCH: by job name, date, jobsite.</p>
<p>EMPTY STATE (new user): 'No jobs yet — start your first diagnosis with Rex.' CTA button shown.</p></td>
</tr>
</tbody>
</table>

*↓ Worker taps a job card*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Job detail screen opens</strong></p>
<p>Four tabs available:</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>TAB 1 — Rex Conversation:</p>
<p>Full chat history with all Rex messages and worker messages.</p>
<p>All photos from the session displayed inline.</p>
<p>Read-only — no editing of past conversation.</p>
<p>'Reopen Job' button at bottom.</p>
<p>TAB 2 — Report:</p>
<p>Finalised job report displayed in full.</p>
<p>Read-only — permanently locked once confirmed and archived.</p>
<p>'Share PDF' button — opens native share sheet.</p>
<p>'Download' button — saves to device.</p>
<p>If no report generated: 'No report for this job — generate one from a reopened session.'</p>
<p>TAB 3 — Quote:</p>
<p>Finalised quote displayed in full.</p>
<p>Read-only — permanently locked once confirmed and archived.</p>
<p>'Share PDF' and 'Download' buttons.</p>
<p>If no quote generated: 'No quote for this job — generate one from a reopened session.'</p>
<p>TAB 4 — Photos:</p>
<p>All photos captured during the session displayed as a grid.</p>
<p>Tap to view full screen. Download to device available.</p></td>
</tr>
</tbody>
</table>

**Reopening a Closed Job**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>Worker taps 'Reopen Job'</strong></p>
<p>Session status updated to 'reopened' in Supabase. Rex re-reads full session history.</p>
<p><em>⚙ Tech: Supabase job_sessions status → reopened</em></p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Rex opens with recap</strong></p>
<p>Rex provides short recap immediately: 'Last time: [brief summary of what was identified and completed]. What do we need to do now?' Rex then waits for worker to respond.</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Active collaboration resumes</strong></p>
<p>Full F2 collaboration protocol available again. Worker can ask Rex anything, send photos, continue from any stage. New reports and quotes can be generated from this new active session. New documents are separate from and do not replace original archived documents.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>Finalised job reports and quotes in the archive are permanently read-only.</p>
<p>They can never be edited from Job History.</p>
<p>New documents can only be generated from a new active Rex session (reopened or new).</p>
<p>Original archived documents always remain untouched regardless of new sessions.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Search with no results: 'No jobs found for [query].'</p>
<p>Job with no report: 'No report — generate one from a reopened Rex session.' Link shown.</p>
<p>Job with no quote: 'No quote — generate one from a reopened Rex session.' Link shown.</p>
<p>No internet: History loads from local cache. Sync indicator shown when reconnected.</p></td>
</tr>
</tbody>
</table>

**F7 --- SUBSCRIPTION AND PAYWALL**

Paywall interception, plan selection, Stripe checkout, and subscription lifecycle management.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULES</strong></p>
<p>Paywall triggered ONLY at feature button tap — not at sign-in.</p>
<p>Feature buttons disabled (no exception) when subscription is expired or inactive:</p>
<p>Diagnose, Quote, Report, Code Lookup, all edit and action buttons.</p>
<p>Worker can browse app freely — dashboard, history, settings — but cannot execute any action.</p>
<p>KYC verification (national ID) required before Stripe checkout can proceed.</p>
<p>Subscription auto-renews every 30 days. Enforced in Terms of Use.</p>
<p>Cancellation: access continues until end of current 30-day billing cycle.</p>
<p>Days remaining calculated and displayed on cancellation confirmation.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>1</strong></td>
<td><p><strong>Feature button tapped — subscription check</strong></p>
<p>Worker taps any feature button. System checks subscription status.</p>
<p><em>⚙ Tech: Supabase subscription_status check</em></p></td>
</tr>
</tbody>
</table>

↓

*⤷ Active subscription → feature opens normally*

*⤷ No subscription or expired → paywall modal slides up*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>2</strong></td>
<td><p><strong>Paywall screen</strong></p>
<p>Three plan cards displayed:</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>SOLO — $29/month:</p>
<p>Unlimited Rex diagnostic queries, job reports, quotes, code lookup, job history.</p>
<p>PRO — $59/month (highlighted as Most Popular):</p>
<p>All Solo features + advanced report and quote features.</p>
<p>TEAM / OWNER — $99/month:</p>
<p>All Pro features + owner dashboard, team management (up to 10 technicians),</p>
<p>team performance reports, KPI tracking.</p>
<p>Per-seat pricing beyond 10 technicians.</p>
<p>Annual billing toggle: 20% discount applied across all plans.</p>
<p>'Restore purchase' link at bottom.</p></td>
</tr>
</tbody>
</table>

*↓ Worker taps a plan*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>3</strong></td>
<td><p><strong>KYC check before checkout</strong></p>
<p>System checks national ID verification status.</p>
<p><em>⚙ Tech: Supabase KYC status check</em></p></td>
</tr>
</tbody>
</table>

*⤷ Verified → proceed to Stripe checkout*

*⤷ Pending → \'Identity verification required --- under review. Usually under 24 hours.\' Checkout blocked.*

*⤷ Rejected → \'ID verification failed --- please re-upload your ID.\' Link to profile settings.*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>4</strong></td>
<td><p><strong>Stripe checkout opens</strong></p>
<p>Native Stripe payment sheet. All payment methods supported: Visa, Mastercard, American Express, all major card types, Apple Pay, Google Pay, and all Stripe-supported regional methods.</p>
<p><em>⚙ Tech: Stripe SDK</em></p></td>
</tr>
</tbody>
</table>

*↓ Payment confirmed*

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>5</strong></td>
<td><p><strong>Subscription activated</strong></p>
<p>Stripe webhook received by Supabase Edge Function. Subscription status updated in database. Worker returned to the feature they were trying to access — continuous flow, no re-navigation.</p>
<p><em>⚙ Tech: Stripe webhook + Supabase Edge Function</em></p></td>
</tr>
</tbody>
</table>

**Cancellation and Billing Cycle**

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>6</strong></td>
<td><p><strong>Worker cancels subscription</strong></p>
<p>Worker opens Settings → Subscription → 'Cancel subscription'. Confirmation screen shows: 'Your access continues until [date] — [X] days remaining on your current billing cycle.'</p></td>
</tr>
</tbody>
</table>

↓

<table>
<colgroup>
<col style="width: 5%" />
<col style="width: 94%" />
</colgroup>
<tbody>
<tr class="odd">
<td><strong>7</strong></td>
<td><p><strong>Access continues until cycle end</strong></p>
<p>Full feature access maintained for remaining days. On billing cycle end: all feature buttons disabled. Read-only access only.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>RESUBSCRIPTION BEFORE EXPIRY:</p>
<p>New 30-day cycle starts from resubscription date.</p>
<p>Remaining days from previous cycle are not carried over.</p>
<p>RESUBSCRIPTION AFTER EXPIRY:</p>
<p>Fresh 30-day cycle from payment date.</p>
<p>TEAM PLAN DOWNGRADE TO SOLO:</p>
<p>Permanently deletes all team member accounts and all their data immediately.</p>
<p>Requires typing DELETE to confirm. Irreversible. Enforced in Terms of Use.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Payment declined: Stripe native error shown. Worker can retry or use different payment method.</p>
<p>Subscription already active (duplicate tap): 'You already have an active plan.' Link to manage.</p>
<p>Restore purchase: Re-check Stripe customer record. Restore entitlements if found.</p>
<p>Webhook delay: Grant access immediately after Stripe client-side confirmation.</p>
<p>Correct on next app open if webhook has not yet arrived.</p>
<p>KYC re-upload: Worker uploads new ID photo. KYC API re-processes. Usually under 24 hours.</p></td>
</tr>
</tbody>
</table>

**F8 --- SETTINGS AND PROFILE**

All user-controlled configuration. Six sections covering profile, trade, team management, subscription, legal, and account.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ENTRY POINTS</strong></p>
<p>Entry point: Profile icon top-right on home screen OR via Settings navigation.</p></td>
</tr>
</tbody>
</table>

**Section 1 --- Profile**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>EDITABLE fields:</p>
<p>Full name, company name, hourly rate, company logo.</p>
<p>PERMANENTLY LOCKED once verified (read-only after KYC approval):</p>
<p>VAT number — locked after account verification.</p>
<p>License proof (photo + number) — locked after account verification.</p>
<p>National ID (photo) — locked after KYC API verification.</p>
<p>KYC status badge shown: Pending / Verified / Rejected.</p>
<p>If Rejected: re-upload option available until verified. Once verified — locked forever.</p>
<p>Changes to editable fields saved on explicit 'Save' tap — not auto-saved.</p></td>
</tr>
</tbody>
</table>

**Section 2 --- Trade**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Trade type: change updates Rex system prompt for all future sessions immediately.</p>
<p>Account type: change from Solopreneur to Team Owner triggers Team plan upgrade path.</p>
<p>DOWNGRADE WARNING (Team Owner to Solopreneur):</p>
<p>Permanently and immediately deletes ALL team member accounts and all their data.</p>
<p>Requires typing DELETE to confirm. Irreversible.</p></td>
</tr>
</tbody>
</table>

**Section 3 --- Team Management (Team Plan Only)**

Visible only to workers on Team plan. Hidden entirely from Solopreneur accounts.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>OWNER CAPABILITIES — from his own admin environment (never inside a team member's account):</p>
<p>Create team member accounts: fills all required fields during creation</p>
<p>(full name, phone, email, trade type, VAT, license proof, national ID, temporary password).</p>
<p>Each created account allocated immediately to owner's environment.</p>
<p>View all team member activity: Rex sessions, reports, quotes, photos, job history — read-only.</p>
<p>Delete any team member account.</p>
<p>Maximum 10 team member accounts on Team plan. Per-seat pricing beyond 10.</p>
<p>OWNER CANNOT:</p>
<p>Log in to or operate from inside a team member's account.</p>
<p>Edit any content inside a team member's account.</p>
<p>Modify settings within a team member's account.</p>
<p>TEAM MEMBER FIRST LOGIN:</p>
<p>Receives SMS and email with credentials and temporary password.</p>
<p>Phone OTP verification required on first login.</p>
<p>Prompted to change temporary password immediately.</p>
<p>Can sign in via phone OTP, email + password going forward.</p>
<p>Cannot delete own profile — only owner can delete team member accounts.</p>
<p>OWNER KPI DASHBOARD — per team member and team aggregate:</p>
<p>Jobs completed (count)</p>
<p>Time spent on jobsite per job and total</p>
<p>Problems identified and solutions applied</p>
<p>Rex sessions opened and queries used</p>
<p>Job reports generated</p>
<p>Quotes generated and total quote amounts</p>
<p>Materials used across jobs</p>
<p>Views: daily / weekly / monthly</p>
<p>Individual team member view and full team aggregate view</p></td>
</tr>
</tbody>
</table>

**Section 4 --- Subscription**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Current plan displayed.</p>
<p>Days remaining in current billing cycle.</p>
<p>Next renewal date.</p>
<p>Billing history and downloadable billing reports.</p>
<p>Plan upgrade and downgrade options.</p>
<p>Cancellation option — shows days remaining calculation on confirmation.</p>
<p>Stripe customer portal link — for payment method management.</p></td>
</tr>
</tbody>
</table>

**Section 5 --- Legal and Compliance**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Terms of Use — viewable in full at any time.</p>
<p>Privacy Policy — viewable in full at any time.</p>
<p>Acknowledgement records — date and version worker agreed to.</p>
<p>Stored permanently. Read-only. For legal protection.</p>
<p>Cannot be modified or deleted by worker.</p></td>
</tr>
</tbody>
</table>

**Section 6 --- Account**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Sign Out: requires confirmation 'Are you sure? You will need to sign in again.'</p>
<p>Delete Account:</p>
<p>Requires typing DELETE to confirm.</p>
<p>Processes immediately — no blocking even with active subscription or remaining billing days.</p>
<p>All data permanently destroyed: profile, sessions, reports, quotes, photos, job history.</p>
<p>Enforced in Terms of Use which worker agreed to at sign-up.</p>
<p>TEAM MEMBER ACCOUNTS:</p>
<p>Team members cannot delete their own accounts.</p>
<p>Only the team owner can delete team member accounts from Team Management.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>EDGE CASES AND ERROR STATES</strong></p>
<p>Unsaved changes + back navigation: 'You have unsaved changes — save or discard?' dialog.</p>
<p>Logo upload fails: Auto-compress. If still fails: 'Image too large — try a smaller file.'</p>
<p>Delete account with active subscription: Processes immediately regardless.</p>
<p>Worker informed: 'Your subscription will continue to bill until the cycle ends.'</p>
<p>Enforced in Terms of Use.</p>
<p>Team plan downgrade: Permanent deletion of all team data. Requires DELETE confirmation.</p></td>
</tr>
</tbody>
</table>

*TradesBrain --- D2 User Flow Diagrams --- v1.0 --- All Flows Locked --- April 2026*
