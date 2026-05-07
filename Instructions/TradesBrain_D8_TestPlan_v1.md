**TRADESBRAIN**

**D8 --- Test Plan and QA Checklist**

*Complete Acceptance Criteria --- 232 Test Cases Across All Features*

|             |                              |
|-------------|------------------------------|
| **Version** | v1.0 --- Official and Locked |

|          |            |
|----------|------------|
| **Date** | April 2026 |

|            |                                           |
|------------|-------------------------------------------|
| **Status** | Approved for QA --- Development Reference |

|              |                                                   |
|--------------|---------------------------------------------------|
| **Audience** | Claude Code (build reference), QA, product review |

|                |                                                                                                                                                                                               |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Depends on** | D1 PRD v1.2 · D2 User Flows v1.0 · D3 Feature Specs v1.0 · D4 Tech Architecture v1.0 · D5 Database v1.0 · D6 UI Wireframes Flows 01--12 · D7 AI System Prompts v2.0 · D10 Edge Functions v1.0 |

|                      |                        |
|----------------------|------------------------|
| **Total test cases** | 232 across 10 sections |

|                           |                                                        |
|---------------------------|--------------------------------------------------------|
| **Priority distribution** | CRITICAL: \~90 test cases · HIGH: \~130 · MEDIUM: \~38 |

|                     |                                    |
|---------------------|------------------------------------|
| **Confidentiality** | Confidential --- Internal use only |

|                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| This document defines the complete acceptance criteria for TradesBrain. Every feature, every button, every edge case, every security rule, and every AI quality standard validated during the full design and specification phase is represented as a testable test case. Claude Code uses this document as the definition of done. QA uses this document to verify every build. A feature is not complete until its test cases pass. |

**1. OVERVIEW**

**1.1 Test Section Index**

|                                       |               |
|---------------------------------------|---------------|
| **A --- Authentication & Onboarding** | 22 test cases |

|                               |               |
|-------------------------------|---------------|
| **B --- Rex Diagnostic (F1)** | 42 test cases |

|                                  |               |
|----------------------------------|---------------|
| **C --- Report Generation (F2)** | 21 test cases |

|                                |               |
|--------------------------------|---------------|
| **D --- Quote Generator (F3)** | 17 test cases |

|                                  |               |
|----------------------------------|---------------|
| **E --- Trade Code Lookup (F4)** | 14 test cases |

|                            |               |
|----------------------------|---------------|
| **F --- Job History (F5)** | 18 test cases |

|                                       |               |
|---------------------------------------|---------------|
| **G --- Subscription & Paywall (F6)** | 32 test cases |

|                                     |               |
|-------------------------------------|---------------|
| **H --- Onboarding & Profile (F7)** | 13 test cases |

|                                |               |
|--------------------------------|---------------|
| **I --- Team Management (F8)** | 27 test cases |

|                                                |               |
|------------------------------------------------|---------------|
| **J --- System States, Edge Cases & Security** | 25 test cases |

**1.2 Priority Definitions**

|                                                                                        |
|----------------------------------------------------------------------------------------|
| CRITICAL: Must pass before any build is considered functional. Failure blocks release. 
 HIGH: Must pass before production deployment. Failure is a significant defect.          
 MEDIUM: Must pass before general availability. Failure is a notable defect.             |

**1.3 Test Types**

|                                                                                                  |
|--------------------------------------------------------------------------------------------------|
| Functional: UI behaviour, navigation, button actions, form validation.                           
 AI Quality: Rex response content, code compliance, safety behaviour, trade-specific accuracy.     
 Data Integrity: Document locking, cascade deletes, confirmed-only archiving, field immutability.  
 Security: RLS enforcement, API key isolation, webhook verification, manipulation prevention.      
 Technical: API integrations, compression, model routing, summarisation, Edge Function behaviour.  
 Integration: Stripe webhooks, Stripe Identity, Expo push notifications, end-to-end flows.         
 Legal / Compliance: Terms acceptance, KYC requirements.                                           |

**1.4 Result Legend**

|                                                                                                           |
|-----------------------------------------------------------------------------------------------------------|
| □ Pass --- test case executed and all expected results confirmed.                                         
 □ Fail --- one or more expected results not met. Defect raised with test case ID and failure description.  
 □ N/A --- test case not applicable to current build phase or environment.                                  |

**2. COMPLETE TEST CASE REGISTRY**

All 232 test cases across 10 sections. Sections separated by navy divider rows. CRITICAL priority tests must pass before any feature is considered complete.

<table style="width:100%;">
<colgroup>
<col style="width: 5%" />
<col style="width: 7%" />
<col style="width: 16%" />
<col style="width: 25%" />
<col style="width: 28%" />
<col style="width: 6%" />
<col style="width: 6%" />
<col style="width: 3%" />
</colgroup>
<tbody>
<tr class="odd">
<td colspan="8"><strong>A — AUTHENTICATION &amp; ONBOARDING (22 test cases)</strong></td>
</tr>
<tr class="even">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="odd">
<td><strong>TC-001</strong></td>
<td>Sign Up</td>
<td><strong>Sign up form — 3-step structure — all required fields present</strong></td>
<td><p>1. Open app fresh</p>
<p>2. Tap Create Account</p>
<p>3. Observe form</p></td>
<td><p>✓ Three-step form shown</p>
<p>✓ Step 1: full name / email / password / phone</p>
<p>✓ Step 2: trade type / account type / hourly rate / VAT</p>
<p>✓ Step 3: license proof + number / national ID / company (optional)</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-002</strong></td>
<td>Sign Up</td>
<td><strong>Create Account button greyed until all required fields valid</strong></td>
<td><p>1. Open sign up</p>
<p>2. Leave required fields empty</p>
<p>3. Fill all required fields</p></td>
<td><p>✓ Button greyed while any required field empty or invalid</p>
<p>✓ Inline validation errors shown on blur per field</p>
<p>✓ Button activates only when all required fields valid</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-003</strong></td>
<td>Sign Up</td>
<td><strong>VAT number permanently locked after account creation</strong></td>
<td><p>1. Create account</p>
<p>2. Navigate to Settings → Profile</p>
<p>3. Tap VAT field</p></td>
<td><p>✓ VAT field shows lock badge</p>
<p>✓ Read-only — no edit option</p>
<p>✓ Locked state persists across sessions</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-004</strong></td>
<td>Sign Up</td>
<td><strong>OTP — email and SMS triggered simultaneously on Create Account tap</strong></td>
<td><p>1. Complete form</p>
<p>2. Tap Create Account</p>
<p>3. Check email and SMS simultaneously</p></td>
<td><p>✓ Email OTP arrives within 60 seconds</p>
<p>✓ SMS OTP arrives within 60 seconds</p>
<p>✓ Both triggered at same moment</p>
<p>✓ Single OTP screen with two input fields</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-005</strong></td>
<td>Sign Up</td>
<td><strong>Both OTPs required before proceeding</strong></td>
<td><p>1. Enter email OTP only — observe proceed state</p>
<p>2. Enter SMS OTP — observe proceed state</p></td>
<td><p>✓ Proceed disabled with only email verified</p>
<p>✓ Email verified ✓ shown</p>
<p>✓ Proceed activates only when both verified</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-006</strong></td>
<td>Sign Up</td>
<td><strong>OTP resend per channel after 60-second countdown</strong></td>
<td><p>1. Reach OTP screen</p>
<p>2. Observe resend state</p>
<p>3. Wait 60 seconds</p>
<p>4. Tap Resend</p></td>
<td><p>✓ Resend greyed with countdown first 60s</p>
<p>✓ Activates per channel independently after 60s</p>
<p>✓ New OTP delivered correctly</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-007</strong></td>
<td>Sign Up</td>
<td><strong>Wrong OTP 3x — 5 minute lockout with countdown</strong></td>
<td>1. Enter wrong OTP 3 times</td>
<td><p>✓ Input locked after 3 wrong codes</p>
<p>✓ 5-minute countdown shown</p>
<p>✓ Input re-enables after countdown</p></td>
<td><strong>HIGH</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-008</strong></td>
<td>Sign Up</td>
<td><strong>OTP expires after 10 minutes</strong></td>
<td><p>1. Reach OTP screen</p>
<p>2. Wait 10 minutes</p>
<p>3. Enter original code</p></td>
<td><p>✓ Code rejected — 'Code expired' message</p>
<p>✓ Resend available immediately</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-009</strong></td>
<td>Sign Up</td>
<td><strong>Terms — must read and tap I agree — acceptance stored</strong></td>
<td><p>1. Reach Step 3</p>
<p>2. Observe checkbox</p>
<p>3. Tap Create Account without agreeing</p>
<p>4. Read Terms and tap I agree</p></td>
<td><p>✓ Checkbox unticked by default</p>
<p>✓ Create Account blocked without agreement</p>
<p>✓ Terms overlay must be completed</p>
<p>✓ Acceptance date and version stored permanently</p></td>
<td><strong>CRITICAL</strong></td>
<td>Legal</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-010</strong></td>
<td>Sign Up</td>
<td><strong>KYC — both documents submitted — processing begins — trial available</strong></td>
<td>1. Complete sign up with national ID and license proof uploaded</td>
<td><p>✓ national_id_kyc_status = pending in database</p>
<p>✓ license_kyc_status = pending in database</p>
<p>✓ Trial queries (10) immediately available</p>
<p>✓ KYC does not block app access</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-011</strong></td>
<td>KYC</td>
<td><strong>KYC verified — push notification — paywall unlocks</strong></td>
<td>1. Stripe Identity webhook: verified for both documents</td>
<td><p>✓ Push notification: 'Identity verified ✓'</p>
<p>✓ Deep link → paywall with last-selected plan pre-loaded</p>
<p>✓ Subscribe button active in paywall</p></td>
<td><strong>CRITICAL</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-012</strong></td>
<td>KYC</td>
<td><strong>KYC rejected — push notification — re-upload available</strong></td>
<td>1. Stripe Identity webhook: requires_input for national ID</td>
<td><p>✓ Push notification: 'Document rejected — tap to re-upload'</p>
<p>✓ Settings → Profile shows red rejected badge</p>
<p>✓ Re-upload triggers new Stripe Identity session</p></td>
<td><strong>CRITICAL</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-013</strong></td>
<td>Sign In</td>
<td><strong>Google OAuth — email pre-verified — only SMS OTP needed</strong></td>
<td><p>1. Tap Continue with Google</p>
<p>2. Complete OAuth</p></td>
<td><p>✓ Google sheet opens natively</p>
<p>✓ Email already verified on success</p>
<p>✓ Only SMS OTP required to complete</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-014</strong></td>
<td>Sign In</td>
<td><strong>Returning user — session persists — auto-signed in</strong></td>
<td><p>1. Sign in successfully</p>
<p>2. Close app completely</p>
<p>3. Reopen app</p></td>
<td><p>✓ App routes directly to Home</p>
<p>✓ No sign-in screen shown</p>
<p>✓ JWT valid from Expo SecureStore</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-015</strong></td>
<td>Sign In</td>
<td><strong>Forgot password — reset email — new password works</strong></td>
<td><p>1. Tap Forgot password</p>
<p>2. Enter email</p>
<p>3. Check email</p>
<p>4. Use reset link</p>
<p>5. Set new password</p>
<p>6. Sign in</p></td>
<td><p>✓ Reset email delivered</p>
<p>✓ New password accepted</p>
<p>✓ Sign-in succeeds</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-016</strong></td>
<td>Sign In</td>
<td><strong>Save Password toggle — off by default — stores in SecureStore when on</strong></td>
<td><p>1. Open sign-in</p>
<p>2. Observe toggle</p>
<p>3. Enable toggle</p>
<p>4. Sign in</p>
<p>5. Sign out</p>
<p>6. Reopen</p></td>
<td><p>✓ Toggle off by default</p>
<p>✓ Credentials stored in Expo SecureStore when enabled</p>
<p>✓ Sign-in pre-populates on next open</p></td>
<td><strong>MEDIUM</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-017</strong></td>
<td>Sign In</td>
<td><strong>Wrong password — lockout at 5 attempts</strong></td>
<td>1. Enter wrong password 5 times</td>
<td><p>✓ Error shown per attempt</p>
<p>✓ Lockout after 5 failures</p>
<p>✓ 15-minute countdown</p>
<p>✓ Reset option available</p></td>
<td><strong>HIGH</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-018</strong></td>
<td>Sign In</td>
<td><strong>Account not found — create account link shown</strong></td>
<td>1. Enter unregistered email — tap Sign In</td>
<td><p>✓ 'No account found with this email' shown</p>
<p>✓ 'Create one instead?' link navigates to sign-up</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-019</strong></td>
<td>System</td>
<td><strong>Account suspended — features blocked — history read-only</strong></td>
<td><p>1. Simulate suspended account</p>
<p>2. Open app</p></td>
<td><p>✓ Full-screen suspended notice</p>
<p>✓ Rex and features blocked</p>
<p>✓ History accessible read-only</p>
<p>✓ Contact support + Sign out available</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-020</strong></td>
<td>System</td>
<td><strong>Force upgrade — all usage blocked — App Store deep link</strong></td>
<td><p>1. Simulate version below minimum</p>
<p>2. Open app</p></td>
<td><p>✓ Full-screen update required</p>
<p>✓ No dismiss</p>
<p>✓ Version numbers shown</p>
<p>✓ Tap Update → App Store / Google Play</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-021</strong></td>
<td>System</td>
<td><strong>No internet at sign-in — correct message — data preserved</strong></td>
<td><p>1. Disable network</p>
<p>2. Attempt sign-in</p></td>
<td><p>✓ 'No connection — sign in requires internet' shown</p>
<p>✓ Form data preserved</p>
<p>✓ Retry works on reconnect</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-022</strong></td>
<td>Sign Up</td>
<td><strong>User abandons mid-form — data restored on next open</strong></td>
<td><p>1. Begin sign-up</p>
<p>2. Fill fields</p>
<p>3. Close app</p>
<p>4. Reopen</p></td>
<td><p>✓ Form data preserved locally</p>
<p>✓ Fields restored on reopen</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td colspan="8"><strong>B — REX DIAGNOSTIC (F1) — 42 test cases</strong></td>
</tr>
<tr class="even">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="odd">
<td><strong>TC-023</strong></td>
<td>Rex Entry</td>
<td><strong>Rex opens from Rex tab and from New Job button</strong></td>
<td><p>1. Tap Rex tab</p>
<p>2. Return to Home</p>
<p>3. Tap New Job</p></td>
<td><p>✓ Rex opens from both entry points</p>
<p>✓ Subscription check runs before camera opens both times</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-024</strong></td>
<td>Rex Entry</td>
<td><strong>Subscription check before camera — paywall if trial exhausted</strong></td>
<td><p>1. Exhaust 10 queries</p>
<p>2. Tap Rex tab</p></td>
<td><p>✓ Camera never opens</p>
<p>✓ Paywall modal rises immediately</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-025</strong></td>
<td>Rex Context</td>
<td><strong>All 6 context questions in ONE natural professional message</strong></td>
<td><p>1. Open Rex session</p>
<p>2. Observe first Rex message</p></td>
<td><p>✓ All 6 questions in single message</p>
<p>✓ Not a form or numbered list</p>
<p>✓ Trade-specific questions included</p>
<p>✓ Reads as professional colleague</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-026</strong></td>
<td>Rex Context</td>
<td><strong>Plumber — correct 3 trade-specific questions</strong></td>
<td><p>1. Set trade to Plumber</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Q4: water supply type (municipal/well/private)</p>
<p>✓ Q5: pipe material (copper/PVC/CPVC/PEX/galvanised/cast iron)</p>
<p>✓ Q6: system type (potable/DWV/gas/hydronic)</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-027</strong></td>
<td>Rex Context</td>
<td><strong>Electrician — correct 3 trade-specific questions</strong></td>
<td><p>1. Set trade to Electrician</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Q4: service type (single phase / three phase)</p>
<p>✓ Q5: panel amperage (100A/200A/400A/other)</p>
<p>✓ Q6: work type (new/retrofit/repair/troubleshoot)</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-028</strong></td>
<td>Rex Context</td>
<td><strong>HVAC — correct 3 trade-specific questions</strong></td>
<td><p>1. Set trade to HVAC</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Q4: system type (split/packaged/mini-split/RTU/boiler/chiller)</p>
<p>✓ Q5: refrigerant type if known</p>
<p>✓ Q6: fuel source (electric/gas/oil/heat pump)</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-029</strong></td>
<td>Rex Context</td>
<td><strong>Roofer — correct 3 trade-specific questions</strong></td>
<td><p>1. Set trade to Roofer</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Q4: roof type (pitched/flat/low-slope)</p>
<p>✓ Q5: current material (shingles/TPO/EPDM/metal/tile/built-up)</p>
<p>✓ Q6: job scope (new/repair/replacement/inspection)</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-030</strong></td>
<td>Rex Input</td>
<td><strong>Photo compressed by stage — tiered quality</strong></td>
<td>1. Send photos at Stage 1 / Stage 2 / Stage 3+</td>
<td><p>✓ Stage 1: 60% quality max 1024px</p>
<p>✓ Stage 2: 50% quality max 800px</p>
<p>✓ Stage 3+: 40% quality max 600px</p>
<p>✓ Automatic — worker unaware</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-031</strong></td>
<td>Rex Input</td>
<td><strong>Voice input — Whisper transcribes — worker edits before send</strong></td>
<td><p>1. Hold voice button</p>
<p>2. Speak</p>
<p>3. Release</p>
<p>4. Observe transcript</p></td>
<td><p>✓ Audio captured as .m4a</p>
<p>✓ Whisper transcribes</p>
<p>✓ Editable transcript shown</p>
<p>✓ Corrected transcript sent to Rex</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-032</strong></td>
<td>Rex Input</td>
<td><strong>Camera denied — photo button greyed — Settings deep link — text+voice work</strong></td>
<td><p>1. Deny camera permission</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Photo button greyed and non-tappable</p>
<p>✓ Amber banner with Settings deep link</p>
<p>✓ Text and voice both functional</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-033</strong></td>
<td>Rex Input</td>
<td><strong>Microphone denied — voice button greyed — text auto-focused</strong></td>
<td><p>1. Deny microphone permission</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Voice button greyed</p>
<p>✓ Amber banner with Settings deep link</p>
<p>✓ Text input auto-focused</p>
<p>✓ Camera still works</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-034</strong></td>
<td>Rex Response</td>
<td><strong>Response streams word by word — input dims during streaming</strong></td>
<td><p>1. Send message</p>
<p>2. Observe response delivery</p></td>
<td><p>✓ Progressive word-by-word display</p>
<p>✓ Input bar dims during streaming</p>
<p>✓ Input re-activates immediately on completion</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-035</strong></td>
<td>Rex Response</td>
<td><strong>Response sequence: diagnosis → issue → cause → solution → code rule → safety</strong></td>
<td><p>1. Send problem photo</p>
<p>2. Observe response structure</p></td>
<td><p>✓ Correct sequence followed</p>
<p>✓ Stage-appropriate elements only</p>
<p>✓ Safety note last when present</p>
<p>✓ Safety note specific not generic</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-036</strong></td>
<td>Rex Safety</td>
<td><strong>Gas leak — STOP notice first before any other content</strong></td>
<td>1. Send gas leak scenario to Rex Plumber</td>
<td><p>✓ 'STOP — POTENTIAL GAS PRESENCE' first</p>
<p>✓ Ventilation instruction given</p>
<p>✓ Electrical switch warning given</p>
<p>✓ Evacuate if strong smell</p>
<p>✓ Gas company contact given</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality / Safety</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-037</strong></td>
<td>Rex Safety</td>
<td><strong>Cracked heat exchanger — CO risk — shutdown instruction</strong></td>
<td>1. Send heat exchanger scenario to Rex HVAC</td>
<td><p>✓ Primary finding flagged before any guidance</p>
<p>✓ 'STOP — potential cracked heat exchanger'</p>
<p>✓ CO risk explicitly named</p>
<p>✓ Furnace shutdown instruction clear</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality / Safety</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-038</strong></td>
<td>Rex Safety</td>
<td><strong>Fall protection confirmed before at-height guidance — Roofer</strong></td>
<td>1. Ask Rex Roofer about rooftop work</td>
<td><p>✓ Fall protection confirmation given before guidance</p>
<p>✓ OSHA 1926.502 referenced</p>
<p>✓ Specific — not generic</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality / Safety</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-039</strong></td>
<td>Rex Safety</td>
<td><strong>Electrician — lockout/tagout confirmed before live circuit guidance</strong></td>
<td>1. Ask Rex Electrician about circuit work</td>
<td><p>✓ Confirm LOTO applied before proceeding</p>
<p>✓ 'Confirm circuit is de-energised and tested dead'</p>
<p>✓ Never assumes isolation</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality / Safety</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-040</strong></td>
<td>Rex Behaviour</td>
<td><strong>Ambiguous photo — Rex stops — states exactly what it needs</strong></td>
<td>1. Send unclear photo</td>
<td><p>✓ Rex does not guess</p>
<p>✓ States exactly what additional input is needed</p>
<p>✓ States why that input is needed</p>
<p>✓ Waits for worker to provide</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-041</strong></td>
<td>Rex Behaviour</td>
<td><strong>Worker pushback — holds once — adopts on insistence</strong></td>
<td><p>1. Send problem</p>
<p>2. Receive diagnosis</p>
<p>3. Disagree once</p>
<p>4. Disagree again</p></td>
<td><p>✓ First disagreement: Rex holds + states evidence + asks one confirming input</p>
<p>✓ Second disagreement: Rex adopts worker position and executes</p>
<p>✓ No further resistance</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-042</strong></td>
<td>Rex Behaviour</td>
<td><strong>Knowledge limit — states uncertainty — names authoritative source</strong></td>
<td>1. Ask about obscure proprietary component</td>
<td><p>✓ General principle given</p>
<p>✓ Uncertainty explicitly stated</p>
<p>✓ Authoritative source named</p>
<p>✓ No fabricated citation</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-043</strong></td>
<td>Rex Behaviour</td>
<td><strong>Code compliance — base code + jurisdiction variations + AHJ note</strong></td>
<td>1. Ask code question</td>
<td><p>✓ Base code with section and edition cited</p>
<p>✓ Known jurisdiction variations named</p>
<p>✓ AHJ verification note always appended</p>
<p>✓ Never presented as universally binding</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-044</strong></td>
<td>Rex Behaviour</td>
<td><strong>Scope escalation — discovered condition supersedes original ask</strong></td>
<td><p>1. Ask for minor repair</p>
<p>2. Rex identifies larger problem</p></td>
<td><p>✓ Minor repair guidance stopped</p>
<p>✓ Larger problem flagged as primary finding</p>
<p>✓ Specific risk stated</p>
<p>✓ Rex asks how to proceed</p>
<p>✓ Worker decision respected</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-045</strong></td>
<td>Rex Behaviour</td>
<td><strong>Worker sovereignty — Rex flags once — worker persists — Rex executes</strong></td>
<td><p>1. Receive Rex safety flag</p>
<p>2. Tell Rex to proceed anyway</p></td>
<td><p>✓ Rex flags with full weight once</p>
<p>✓ On worker persistence: Rex executes accurately</p>
<p>✓ No repeated warnings</p>
<p>✓ No blocking after worker decision</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-046</strong></td>
<td>Rex Behaviour</td>
<td><strong>Apprentice mode — detects signals — asks once — expands or maintains</strong></td>
<td>1. Ask Rex basic questions showing low experience</td>
<td><p>✓ Rex detects low-experience signals</p>
<p>✓ Asks once: 'Would you like me to walk through each step in more detail?'</p>
<p>✓ If yes: expanded step depth</p>
<p>✓ If no: standard clinical output</p>
<p>✓ Question asked only once per session</p></td>
<td><strong>HIGH</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-047</strong></td>
<td>Rex Stages</td>
<td><strong>Close Job always visible from Stage 1</strong></td>
<td>1. Open Rex — observe at all stages</td>
<td><p>✓ Close Job button visible at every stage</p>
<p>✓ Never hidden</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-048</strong></td>
<td>Rex Stages</td>
<td><strong>Report and Quote buttons ONLY after Close Job</strong></td>
<td><p>1. Observe during session</p>
<p>2. Tap Close Job</p>
<p>3. Observe after</p></td>
<td><p>✓ Buttons not present during active session</p>
<p>✓ Both appear only after Close Job and job naming</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-049</strong></td>
<td>Rex Stages</td>
<td><strong>Worker can skip any stage — Rex adapts</strong></td>
<td>1. Ask Rex to skip to repair steps at Stage 1</td>
<td><p>✓ No block or error</p>
<p>✓ Rex adapts immediately</p>
<p>✓ Requested content provided</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-050</strong></td>
<td>Rex Stages</td>
<td><strong>Correct contextual buttons per stage</strong></td>
<td><p>1. Progress through all 5 stages</p>
<p>2. Observe buttons</p></td>
<td><p>✓ Stage 1: Take photo / Describe further / That is all I have</p>
<p>✓ Stage 2: Confirm / Not yet / That is not what I see</p>
<p>✓ Stage 3: Step done + photo / Moving on / Problem at step</p>
<p>✓ Stage 4: All clear / Issue found</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-051</strong></td>
<td>Rex Stages</td>
<td><strong>Stage progression — flags issue — delivers next step — no perfection gate</strong></td>
<td>1. Complete step with minor imperfection in photo</td>
<td><p>✓ Issue identified and named with specific risk</p>
<p>✓ Next step delivered regardless</p>
<p>✓ Worker decides whether to correct</p></td>
<td><strong>HIGH</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-052</strong></td>
<td>Rex Soft Cap</td>
<td><strong>Warning at 28 — linked session prompt at 30</strong></td>
<td>1. Have 30+ message session</td>
<td><p>✓ Warning at message 28</p>
<p>✓ Linked session prompt at 30</p>
<p>✓ Not a hard block</p>
<p>✓ New session opens with compressed context</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-053</strong></td>
<td>Rex Restoration</td>
<td><strong>App closed mid-session — amber banner on return</strong></td>
<td><p>1. Start Rex session</p>
<p>2. Close app</p>
<p>3. Reopen</p></td>
<td><p>✓ Amber banner on Home with pulsing dot</p>
<p>✓ Job name and stage shown</p>
<p>✓ Continue button available</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-054</strong></td>
<td>Rex Restoration</td>
<td><strong>Continue tap — Rex delivers recap message</strong></td>
<td>1. Tap Continue on banner</td>
<td><p>✓ Rex reads full prior history</p>
<p>✓ Recap in amber bubble: 'Last time: [summary]. What do we need now?'</p>
<p>✓ Stage-appropriate buttons restored</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-055</strong></td>
<td>Rex Trial</td>
<td><strong>Query 10 — full response delivered — THEN inline notice</strong></td>
<td><p>1. Have 1 query remaining</p>
<p>2. Send message</p></td>
<td><p>✓ Complete response delivered first</p>
<p>✓ Trial-ended notice appears AFTER response</p>
<p>✓ Buttons lock after notice</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-056</strong></td>
<td>Rex Trial</td>
<td><strong>Trial at 0 — next tap — paywall over session</strong></td>
<td><p>1. Exhaust queries</p>
<p>2. Tap any locked button</p></td>
<td><p>✓ Paywall rises over dimmed session</p>
<p>✓ 'Your session is saved' shown</p>
<p>✓ Dismiss: read-only session</p>
<p>✓ Subscribe: checkout → returns to session with full access</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-057</strong></td>
<td>Rex Offline</td>
<td><strong>No internet — message queued — auto-sends</strong></td>
<td><p>1. Start session</p>
<p>2. Disable network</p>
<p>3. Send message</p></td>
<td><p>✓ Message preserved locally</p>
<p>✓ Queued indicator shown</p>
<p>✓ Input dims</p>
<p>✓ Auto-sends on reconnect</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-058</strong></td>
<td>Rex Offline</td>
<td><strong>Mid-stream disconnect — truncated with note — Retry</strong></td>
<td>1. Disconnect network mid-streaming</td>
<td><p>✓ Response truncated with red border</p>
<p>✓ 'Cut short — connection lost' note</p>
<p>✓ Retry button resends identical payload</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-059</strong></td>
<td>Rex API</td>
<td><strong>Claude timeout 30s — Taking longer — Retry preserves message</strong></td>
<td>1. Simulate 30s Claude timeout</td>
<td><p>✓ 'Taking longer than usual' shown after 30s</p>
<p>✓ Retry available</p>
<p>✓ Message preserved</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-060</strong></td>
<td>Rex API</td>
<td><strong>Claude 5xx — Rex unavailable — Retry</strong></td>
<td>1. Simulate 500 error</td>
<td><p>✓ 'Rex unavailable right now — try again' shown</p>
<p>✓ Retry available</p>
<p>✓ Error logged silently</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-061</strong></td>
<td>Rex API</td>
<td><strong>Whisper fail — text auto-shown — audio preserved — Retry</strong></td>
<td>1. Simulate Whisper failure after recording</td>
<td><p>✓ Amber banner shown</p>
<p>✓ Text input auto-shown</p>
<p>✓ Audio preserved</p>
<p>✓ Retry Whisper option available</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-062</strong></td>
<td>Rex Materials</td>
<td><strong>Refrigerant substitution — lists all options — verifies system first</strong></td>
<td>1. Ask HVAC Rex about R-22 replacement without system details</td>
<td><p>✓ Rex does not name single refrigerant</p>
<p>✓ Lists all EPA-approved substitutes with compatibility conditions</p>
<p>✓ Asks for system details before recommending</p>
<p>✓ EPA Section 608 referenced</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-063</strong></td>
<td>Rex Cross-Trade</td>
<td><strong>Cross-trade question — answers to boundary — redirects beyond</strong></td>
<td>1. Ask Rex Plumber about residential panel wiring</td>
<td><p>✓ Plumbing-electrical interface answered</p>
<p>✓ Exact knowledge boundary stated</p>
<p>✓ Qualified electrician recommended for panel work beyond</p></td>
<td><strong>HIGH</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-064</strong></td>
<td>Rex Cross-Trade</td>
<td><strong>Electrician NEC edition delta — 2023 vs 2020 named explicitly</strong></td>
<td>1. Ask code question where NEC 2023 and 2020 differ</td>
<td><p>✓ Answers from NEC 2023</p>
<p>✓ NEC 2020 difference stated explicitly</p>
<p>✓ Both editions named clearly</p>
<p>✓ AHJ note appended</p></td>
<td><strong>HIGH</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-065</strong></td>
<td>Rex Session</td>
<td><strong>Job naming prompt — auto-named if skipped</strong></td>
<td><p>1. Complete session</p>
<p>2. Tap Close Job</p>
<p>3. Skip naming</p></td>
<td><p>✓ Naming prompt appears</p>
<p>✓ Auto-name if skipped: date + jobsite or 'Job — [date]'</p>
<p>✓ Editable from History</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td colspan="8"><strong>C — REPORT GENERATION (F2) — 21 test cases</strong></td>
</tr>
<tr class="odd">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="even">
<td><strong>TC-066</strong></td>
<td>Report</td>
<td><strong>Path A — Generate Report appears only after Close Job</strong></td>
<td><p>1. Observe during session</p>
<p>2. Tap Close Job</p></td>
<td><p>✓ Button absent during active session</p>
<p>✓ Appears only after Close Job + job naming</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-067</strong></td>
<td>Report</td>
<td><strong>Path B — standalone — Rex asks for full job description</strong></td>
<td>1. Tap Report tab without Rex session</td>
<td><p>✓ Rex in document-generation mode</p>
<p>✓ Asks for full job description by voice</p>
<p>✓ Follow-up questions for missing details</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-068</strong></td>
<td>Report</td>
<td><strong>Both paths create new job archive entry</strong></td>
<td><p>1. Generate via Path A</p>
<p>2. Generate via Path B</p>
<p>3. Check History</p></td>
<td><p>✓ Both create new History entry</p>
<p>✓ Both have Reports tab populated</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-069</strong></td>
<td>Report</td>
<td><strong>First time — section picker shown and saved</strong></td>
<td><p>1. Generate first report</p>
<p>2. Observe picker</p>
<p>3. Generate second report</p></td>
<td><p>✓ Picker shown first time</p>
<p>✓ Saved permanently after first selection</p>
<p>✓ Not shown again on subsequent reports</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-070</strong></td>
<td>Report</td>
<td><strong>Voice summary — Whisper transcribes — worker edits</strong></td>
<td><p>1. Record voice summary</p>
<p>2. Observe transcript</p></td>
<td><p>✓ Whisper transcription shown</p>
<p>✓ Editable before proceeding</p>
<p>✓ Corrected text used for report</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-071</strong></td>
<td>Report</td>
<td><strong>Rex confirms VAT and license toggle per report</strong></td>
<td>1. Generate report — observe field confirmation step</td>
<td><p>✓ Rex asks: 'Should I include your VAT and license?'</p>
<p>✓ Worker confirms per field</p>
<p>✓ Applied to this report each time</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-072</strong></td>
<td>Report</td>
<td><strong>Rex calculates suggested payment: hours × rate + materials</strong></td>
<td>1. Generate report with time and materials in voice summary</td>
<td><p>✓ Suggested amount calculated</p>
<p>✓ Calculation basis shown</p>
<p>✓ Worker sets confirmed total freely</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-073</strong></td>
<td>Report</td>
<td><strong>Preview — all sections editable inline before confirming</strong></td>
<td><p>1. Generate report draft</p>
<p>2. Observe preview</p></td>
<td><p>✓ All sections shown with content</p>
<p>✓ Each section tappable to edit</p>
<p>✓ Payment amount adjustable</p>
<p>✓ Nothing locked before confirm</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-074</strong></td>
<td>Report</td>
<td><strong>Confirm — permanently locked — database trigger enforces</strong></td>
<td><p>1. Generate report</p>
<p>2. Tap Confirm</p>
<p>3. Attempt edit from History</p></td>
<td><p>✓ Warning shown before confirm</p>
<p>✓ After confirm: all sections read-only</p>
<p>✓ DB trigger prevents update to finalised record</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-075</strong></td>
<td>Report</td>
<td><strong>Draft not confirmed — auto-discarded — prompt shown first</strong></td>
<td><p>1. Begin report generation</p>
<p>2. Navigate away without confirming</p></td>
<td><p>✓ Prompt: 'Not confirmed — will be discarded'</p>
<p>✓ Confirm now / Discard options</p>
<p>✓ Draft never appears in History</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-076</strong></td>
<td>Report</td>
<td><strong>PDF generated — stored in Supabase Storage — accessible from History</strong></td>
<td><p>1. Generate and confirm report</p>
<p>2. Open History → Reports tab</p></td>
<td><p>✓ PDF URL in job_reports.pdf_url</p>
<p>✓ Viewable from Job Detail</p>
<p>✓ Download + Share available</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-077</strong></td>
<td>Report</td>
<td><strong>Share via native share sheet</strong></td>
<td><p>1. Generate confirmed report</p>
<p>2. Tap Share PDF</p></td>
<td><p>✓ Native share sheet opens</p>
<p>✓ WhatsApp / email / AirDrop available</p>
<p>✓ No in-app customer sending</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-078</strong></td>
<td>Report</td>
<td><strong>Hourly rate not set — flagged — payment skipped — settings link</strong></td>
<td><p>1. Clear hourly rate</p>
<p>2. Generate report</p></td>
<td><p>✓ 'Hourly rate not set — payment calculation skipped'</p>
<p>✓ Link to Settings shown</p>
<p>✓ Report generated without payment amount</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-079</strong></td>
<td>Report</td>
<td><strong>No internet — draft preserved — PDF auto-generates on reconnect</strong></td>
<td><p>1. Complete report</p>
<p>2. Disable network</p>
<p>3. Tap Confirm</p>
<p>4. Re-enable network</p></td>
<td><p>✓ Draft text preserved</p>
<p>✓ Confirm shows waiting state</p>
<p>✓ PDF generates and confirms automatically on reconnect</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-080</strong></td>
<td>Report</td>
<td><strong>Multiple versions — Report 1 / Report 2 — independent</strong></td>
<td><p>1. Confirm Report 1</p>
<p>2. Reopen session</p>
<p>3. Generate Report 2</p></td>
<td><p>✓ Report 2 stored separately</p>
<p>✓ Report 1 unchanged</p>
<p>✓ Both in Reports tab</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-081</strong></td>
<td>Report</td>
<td><strong>Custom section via voice or Add section button</strong></td>
<td><p>1. Generate report</p>
<p>2. Add custom section</p></td>
<td><p>✓ Custom section added</p>
<p>✓ Rex populates content</p>
<p>✓ Custom badge shown</p>
<p>✓ Draggable before confirm</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-082</strong></td>
<td>Report</td>
<td><strong>Path A — Rex reuses session data — worker not re-asked</strong></td>
<td><p>1. Complete Rex session</p>
<p>2. Generate report via Path A</p></td>
<td><p>✓ Session context pre-loaded</p>
<p>✓ Worker voice summary still required</p>
<p>✓ Rex never auto-generates without worker input</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-083</strong></td>
<td>Report</td>
<td><strong>Swipe left on line item — delete revealed</strong></td>
<td><p>1. Generate report with line items</p>
<p>2. Swipe left on row</p></td>
<td><p>✓ Red delete option revealed</p>
<p>✓ Tap delete: row removed</p>
<p>✓ Total recalculates</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-084</strong></td>
<td>Report</td>
<td><strong>Job archive entry links to report in History</strong></td>
<td><p>1. Generate confirmed report</p>
<p>2. Open History → job → Reports tab</p></td>
<td><p>✓ Report listed with version number</p>
<p>✓ View / Download / Share available</p>
<p>✓ Read-only</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-085</strong></td>
<td>Report</td>
<td><strong>Very short voice description — flagged — report still generated</strong></td>
<td>1. Record 3-second voice description</td>
<td><p>✓ 'Short description' flag shown</p>
<p>✓ Report still generated from available input</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-086</strong></td>
<td>Report</td>
<td><strong>Confirmed documents read-only — edit option absent</strong></td>
<td>1. Open confirmed report from Job History</td>
<td><p>✓ No edit button anywhere</p>
<p>✓ No input fields active</p>
<p>✓ Read-only enforced at UI level and DB level</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td colspan="8"><strong>D — QUOTE GENERATOR (F3) — 17 test cases</strong></td>
</tr>
<tr class="even">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="odd">
<td><strong>TC-087</strong></td>
<td>Quote</td>
<td><strong>Path A — reuses report data if report generated first</strong></td>
<td><p>1. Generate confirmed report</p>
<p>2. Generate quote from same session Path A</p></td>
<td><p>✓ Rex identifies report generated first</p>
<p>✓ Reuses: client info / materials / time / labour</p>
<p>✓ Only quote-specific details asked</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-088</strong></td>
<td>Quote</td>
<td><strong>Path B — standalone — Rex asks for full job description</strong></td>
<td>1. Tap Quote tab without Rex session</td>
<td><p>✓ Rex asks for full job description by voice</p>
<p>✓ Follow-ups for missing details</p>
<p>✓ Worker names job before generating</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-089</strong></td>
<td>Quote</td>
<td><strong>Line items: material / quantity / unit cost / line total</strong></td>
<td>1. Describe materials in quote generation</td>
<td><p>✓ Rex generates line items</p>
<p>✓ Each line: name / qty / unit cost / auto-calculated total</p>
<p>✓ All rows editable inline</p>
<p>✓ Add line button adds blank row</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-090</strong></td>
<td>Quote</td>
<td><strong>Labour hours × hourly rate pre-populated</strong></td>
<td>1. Generate quote with time mentioned</td>
<td><p>✓ Labour extracted from description</p>
<p>✓ Hourly rate from profile</p>
<p>✓ Labour line pre-populated</p>
<p>✓ Editable for this quote</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-091</strong></td>
<td>Quote</td>
<td><strong>Markup guidance shown — total as range — worker sets confirmed</strong></td>
<td>1. Generate quote preview</td>
<td><p>✓ '15–30% on materials recommended'</p>
<p>✓ Suggested range shown with variables explained</p>
<p>✓ Worker sets confirmed total freely — not constrained</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-092</strong></td>
<td>Quote</td>
<td><strong>Payment method — multiple allowed — saved as default</strong></td>
<td><p>1. Generate first quote</p>
<p>2. Select multiple payment methods</p>
<p>3. Generate second</p></td>
<td><p>✓ Multiple selections allowed</p>
<p>✓ Options: Cash / Bank transfer / Direct debit / Cheque / Online link / To be agreed</p>
<p>✓ Saved as default after first use</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-093</strong></td>
<td>Quote</td>
<td><strong>Validity period — 30 day default — editable</strong></td>
<td>1. Generate quote — observe validity field</td>
<td><p>✓ Default 30 days</p>
<p>✓ Editable before confirm</p>
<p>✓ Appears in PDF</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-094</strong></td>
<td>Quote</td>
<td><strong>Total auto-calculates in real time</strong></td>
<td>1. Edit unit cost on a line item</td>
<td><p>✓ Line total updates immediately</p>
<p>✓ Grand total updates immediately</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-095</strong></td>
<td>Quote</td>
<td><strong>Confirm quote — permanently locked — PDF generated</strong></td>
<td><p>1. Generate quote</p>
<p>2. Tap Confirm Quote</p></td>
<td><p>✓ Warning shown</p>
<p>✓ After confirm: read-only forever</p>
<p>✓ PDF generated and stored</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-096</strong></td>
<td>Quote</td>
<td><strong>Draft not confirmed — auto-discarded — prompt shown</strong></td>
<td><p>1. Begin quote</p>
<p>2. Navigate away without confirming</p></td>
<td><p>✓ 'Not confirmed — will be discarded' prompt</p>
<p>✓ Confirm / Discard options</p>
<p>✓ Draft never reaches archive</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-097</strong></td>
<td>Quote</td>
<td><strong>Quote versioning — Quote 1 / Quote 2 — independent</strong></td>
<td><p>1. Confirm Quote 1</p>
<p>2. Reopen session</p>
<p>3. Generate Quote 2</p></td>
<td><p>✓ Quote 2 stored separately</p>
<p>✓ Quote 1 unaffected</p>
<p>✓ Both in Quotes tab</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-098</strong></td>
<td>Quote</td>
<td><strong>Quote and report independent — neither requires the other</strong></td>
<td><p>1. Generate quote without report</p>
<p>2. Generate report without quote</p></td>
<td><p>✓ Both work independently</p>
<p>✓ Path A quote reuses report data when available — not required</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-099</strong></td>
<td>Quote</td>
<td><strong>Payment terms — worker defines — saved as default</strong></td>
<td><p>1. Define payment terms in first quote</p>
<p>2. Generate second quote</p></td>
<td><p>✓ Terms accepted as free text</p>
<p>✓ Saved as default preference</p>
<p>✓ Second quote applies saved terms</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-100</strong></td>
<td>Quote</td>
<td><strong>Add line — blank row appended — editable</strong></td>
<td><p>1. Generate quote</p>
<p>2. Tap Add line</p></td>
<td><p>✓ Blank row added at bottom</p>
<p>✓ All fields empty and editable</p>
<p>✓ Total includes new row as populated</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-101</strong></td>
<td>Quote</td>
<td><strong>Rex flags uncertain lines with asterisk</strong></td>
<td>1. Describe unusual job for quote</td>
<td><p>✓ Available lines generated</p>
<p>✓ Uncertain lines flagged with asterisk</p>
<p>✓ Worker informed which need manual entry</p></td>
<td><strong>MEDIUM</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-102</strong></td>
<td>Quote</td>
<td><strong>Hourly rate not set — labour line skipped — settings link</strong></td>
<td><p>1. Clear hourly rate</p>
<p>2. Generate quote with time description</p></td>
<td><p>✓ 'Hourly rate not set — labour line skipped'</p>
<p>✓ Link to Settings shown</p>
<p>✓ Material lines still generated</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-103</strong></td>
<td>Quote</td>
<td><strong>Confirmed quote read-only from History</strong></td>
<td>1. Open confirmed quote from Job Detail</td>
<td><p>✓ No edit button anywhere</p>
<p>✓ Read-only view only</p>
<p>✓ View / Download / Share available</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td colspan="8"><strong>E — TRADE CODE LOOKUP (F4) — 14 test cases</strong></td>
</tr>
<tr class="odd">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="even">
<td><strong>TC-104</strong></td>
<td>Codes</td>
<td><strong>Codes tab accessible always — inside and outside Rex</strong></td>
<td><p>1. Tap Codes outside Rex</p>
<p>2. Open Rex session</p>
<p>3. Tap Codes inside Rex</p></td>
<td><p>✓ Codes tab always accessible</p>
<p>✓ Inside Rex: opens without closing session</p>
<p>✓ Session state preserved on return</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-105</strong></td>
<td>Codes</td>
<td><strong>Voice or text query — plain language — no special syntax</strong></td>
<td><p>1. Ask by voice</p>
<p>2. Ask by text</p></td>
<td><p>✓ Both accepted correctly</p>
<p>✓ Plain language works</p>
<p>✓ No special syntax required</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-106</strong></td>
<td>Codes</td>
<td><strong>Plain language answer first — code citation — AHJ note</strong></td>
<td>1. Ask: 'What is the minimum slope for a 3-inch drain?'</td>
<td><p>✓ Plain language answer first</p>
<p>✓ Code section cited with document name and edition</p>
<p>✓ AHJ note always appended</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-107</strong></td>
<td>Codes</td>
<td><strong>AHJ note always appended — no exceptions</strong></td>
<td>1. Ask any code question — observe ending</td>
<td><p>✓ 'Verify current adoption in your jurisdiction — local amendments may apply' always present</p>
<p>✓ Every response — no exceptions</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-108</strong></td>
<td>Codes</td>
<td><strong>Code section citation tappable — full text shown</strong></td>
<td><p>1. Ask code question</p>
<p>2. Tap citation</p></td>
<td><p>✓ Citation is tappable</p>
<p>✓ Full code text displayed</p>
<p>✓ Table shown if applicable</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-109</strong></td>
<td>Codes</td>
<td><strong>Rex states uncertainty — never fabricates section number</strong></td>
<td>1. Ask obscure code question Rex may not know</td>
<td><p>✓ Uncertainty explicitly stated</p>
<p>✓ Best general guidance given</p>
<p>✓ No fabricated citation</p>
<p>✓ AHJ note still appended</p></td>
<td><strong>CRITICAL</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-110</strong></td>
<td>Codes</td>
<td><strong>Ask follow-up available — retains context</strong></td>
<td><p>1. Receive code response</p>
<p>2. Use follow-up input</p></td>
<td><p>✓ Follow-up input available below response</p>
<p>✓ Context retained</p>
<p>✓ Follow-up response also has AHJ note</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-111</strong></td>
<td>Codes</td>
<td><strong>Inside Rex session — Add to job notes button</strong></td>
<td><p>1. Open Codes from within Rex session</p>
<p>2. Ask code question</p></td>
<td><p>✓ 'Add to job notes' button visible</p>
<p>✓ Tap adds result to current session</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-112</strong></td>
<td>Codes</td>
<td><strong>Temporary trade switch — lookup only — profile unchanged</strong></td>
<td><p>1. Set profile to Plumber</p>
<p>2. Switch to Electrician in Codes</p>
<p>3. Ask electrical question</p>
<p>4. Exit Codes</p></td>
<td><p>✓ Electrician codes queried correctly</p>
<p>✓ On exit: reverts to Plumber</p>
<p>✓ Profile trade type unchanged</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-113</strong></td>
<td>Codes</td>
<td><strong>No query count deducted for code lookups</strong></td>
<td><p>1. Check trial count</p>
<p>2. Ask code question</p>
<p>3. Check trial count again</p></td>
<td><p>✓ trial_queries_remaining unchanged</p>
<p>✓ Confirmed in database</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-114</strong></td>
<td>Codes</td>
<td><strong>No internet — last 10 cached — viewable offline</strong></td>
<td><p>1. Perform 10+ lookups</p>
<p>2. Disable network</p>
<p>3. Open Codes</p></td>
<td><p>✓ Last 10 lookups shown</p>
<p>✓ Correct responses offline</p>
<p>✓ New queries blocked with offline message</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-115</strong></td>
<td>Codes</td>
<td><strong>No matching code — general guidance — limitation stated</strong></td>
<td>1. Ask about topic not in RAG database</td>
<td><p>✓ Best general guidance given</p>
<p>✓ 'Could not find specific code section' stated</p>
<p>✓ AHJ direct contact advised</p></td>
<td><strong>HIGH</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-116</strong></td>
<td>Codes</td>
<td><strong>Cross-trade question — answers to boundary — redirects</strong></td>
<td>1. Ask Rex Plumber about NEC code</td>
<td><p>✓ Plumbing-electrical interface answered</p>
<p>✓ Knowledge boundary stated</p>
<p>✓ Qualified source recommended beyond boundary</p></td>
<td><strong>HIGH</strong></td>
<td>AI Quality</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-117</strong></td>
<td>Codes</td>
<td><strong>Empty state — first use — no recent lookups</strong></td>
<td>1. Open Codes tab first time</td>
<td><p>✓ Search field shown</p>
<p>✓ Mic icon present</p>
<p>✓ Empty state below search</p>
<p>✓ No placeholder data</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td colspan="8"><strong>F — JOB HISTORY (F5) — 18 test cases</strong></td>
</tr>
<tr class="odd">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="even">
<td><strong>TC-118</strong></td>
<td>History</td>
<td><strong>Chronological list — correct job card fields</strong></td>
<td><p>1. Generate multiple sessions with reports</p>
<p>2. Open History</p></td>
<td><p>✓ Reverse chronological order</p>
<p>✓ Each card: name / date / trade badge / status</p>
<p>✓ No customer names shown</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-119</strong></td>
<td>History</td>
<td><strong>Search by job name / date / jobsite</strong></td>
<td><p>1. Create diverse jobs</p>
<p>2. Use search bar with each criterion</p></td>
<td><p>✓ Filters correctly per criterion</p>
<p>✓ No results state shown when no match</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-120</strong></td>
<td>History</td>
<td><strong>Empty state — new user — Start first job CTA</strong></td>
<td>1. Open History on new account</td>
<td><p>✓ Empty state illustration</p>
<p>✓ 'No jobs yet' message</p>
<p>✓ Start first job CTA → Rex tab</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-121</strong></td>
<td>History</td>
<td><strong>Job Detail — 4 tabs — Rex / Reports / Quotes / Photos</strong></td>
<td><p>1. Tap job card</p>
<p>2. Observe tabs</p></td>
<td><p>✓ 4 tabs present</p>
<p>✓ Rex / Reports / Quotes / Photos all accessible</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-122</strong></td>
<td>History</td>
<td><strong>Rex tab — full chat — photos inline — read-only</strong></td>
<td>1. Open Rex tab in Job Detail</td>
<td><p>✓ All messages in sequence</p>
<p>✓ Photos inline</p>
<p>✓ Read-only — no input bar</p>
<p>✓ Reopen Job button at bottom</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-123</strong></td>
<td>History</td>
<td><strong>Reports tab — confirmed report — View / Download / Share</strong></td>
<td>1. Open Reports tab</td>
<td><p>✓ Confirmed report listed with version</p>
<p>✓ View renders full screen</p>
<p>✓ Download saves PDF</p>
<p>✓ Share opens native sheet</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-124</strong></td>
<td>History</td>
<td><strong>Quotes tab — confirmed quote — View / Download / Share</strong></td>
<td>1. Open Quotes tab</td>
<td><p>✓ Confirmed quote listed</p>
<p>✓ View / Download / Share</p>
<p>✓ Read-only</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-125</strong></td>
<td>History</td>
<td><strong>Photos tab — grid — full screen — download</strong></td>
<td>1. Open Photos tab</td>
<td><p>✓ Photos in grid</p>
<p>✓ Tap opens full screen viewer</p>
<p>✓ Stage label shown</p>
<p>✓ Download available</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-126</strong></td>
<td>History</td>
<td><strong>Reopen Job — Rex restores session — delivers recap</strong></td>
<td><p>1. Open Rex tab</p>
<p>2. Tap Reopen Job</p></td>
<td><p>✓ Rex reads full history</p>
<p>✓ Recap: 'Last time: [summary]. What do we need now?'</p>
<p>✓ Stage-appropriate buttons restored</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-127</strong></td>
<td>History</td>
<td><strong>New reports from reopened session don't replace originals</strong></td>
<td><p>1. Confirm Report 1</p>
<p>2. Reopen</p>
<p>3. Confirm Report 2</p></td>
<td><p>✓ Report 1 unchanged</p>
<p>✓ Report 2 stored as separate version</p>
<p>✓ Both visible and independently locked</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-128</strong></td>
<td>History</td>
<td><strong>Job name — only editable field after archiving</strong></td>
<td><p>1. Open Job Detail</p>
<p>2. Tap job name</p>
<p>3. Attempt to edit report content</p></td>
<td><p>✓ Job name editable inline</p>
<p>✓ Report content: read-only — no edit option</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-129</strong></td>
<td>History</td>
<td><strong>Job deletion — confirmation — cascades all data</strong></td>
<td><p>1. Open Job Detail</p>
<p>2. Tap Delete job</p>
<p>3. Confirm</p></td>
<td><p>✓ Confirmation required</p>
<p>✓ Deletes: session / messages / reports / quotes / photos</p>
<p>✓ Job removed from History</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-130</strong></td>
<td>History</td>
<td><strong>Expired subscription — History browsable — PDFs downloadable</strong></td>
<td><p>1. Cancel subscription — let expire</p>
<p>2. Open History</p></td>
<td><p>✓ History accessible read-only</p>
<p>✓ PDFs downloadable</p>
<p>✓ Feature buttons show paywall on tap</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-131</strong></td>
<td>History</td>
<td><strong>Draft documents never appear in History</strong></td>
<td><p>1. Begin report</p>
<p>2. Exit without confirming</p>
<p>3. Check History</p></td>
<td><p>✓ Discarded draft absent from History</p>
<p>✓ Only confirmed documents in History</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-132</strong></td>
<td>History</td>
<td><strong>Skeleton loading during Supabase data fetch</strong></td>
<td>1. Open History — observe during load</td>
<td><p>✓ Shimmer skeleton animation shown</p>
<p>✓ Cards / dividers / chips all skeletonised</p>
<p>✓ Replaced by real content on load</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-133</strong></td>
<td>History</td>
<td><strong>No report for job — message + reopen link</strong></td>
<td>1. Open Reports tab for session with no report</td>
<td><p>✓ 'No report for this job' shown</p>
<p>✓ 'Generate one from a reopened session' link</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-134</strong></td>
<td>History</td>
<td><strong>No quote for job — message + reopen link</strong></td>
<td>1. Open Quotes tab for session with no quote</td>
<td><p>✓ 'No quote for this job' shown</p>
<p>✓ Link to reopen session</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-135</strong></td>
<td>History</td>
<td><strong>Photos grouped by session with stage labels</strong></td>
<td>1. Open Photos tab for multi-stage session</td>
<td><p>✓ Photos grouped by session and stage</p>
<p>✓ Stage label visible</p>
<p>✓ Tap to expand / full screen</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td colspan="8"><strong>G — SUBSCRIPTION &amp; PAYWALL (F6) — 32 test cases</strong></td>
</tr>
<tr class="odd">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="even">
<td><strong>TC-136</strong></td>
<td>Trial</td>
<td><strong>10 queries — global cap — all features</strong></td>
<td><p>1. Create account</p>
<p>2. Use queries across Rex and Code Lookup</p></td>
<td><p>✓ Exactly 10 queries global</p>
<p>✓ Each Claude API call consumes 1</p>
<p>✓ Decremented server-side</p>
<p>✓ Global — not per-feature</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-137</strong></td>
<td>Trial</td>
<td><strong>Banner states: blue (10-3) / orange (2-1) / paywall at 0</strong></td>
<td>1. Create account — observe trial banner through usage</td>
<td><p>✓ Blue passive banner at 10-3</p>
<p>✓ Orange urgent at 2-1</p>
<p>✓ Paywall modal on 0</p>
<p>✓ No exact count shown on screen</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-138</strong></td>
<td>Paywall</td>
<td><strong>Triggered on feature tap — not at sign-in</strong></td>
<td><p>1. Sign in with expired subscription</p>
<p>2. Observe state</p>
<p>3. Tap Rex tab</p></td>
<td><p>✓ Sign-in succeeds without paywall</p>
<p>✓ Home / History / Settings accessible</p>
<p>✓ Paywall only on feature tap</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-139</strong></td>
<td>Paywall</td>
<td><strong>All 3 plan cards — monthly/annual toggle — 20% discount</strong></td>
<td><p>1. Reach paywall</p>
<p>2. Toggle annual</p></td>
<td><p>✓ Solo / Pro / Team cards displayed</p>
<p>✓ 20% discount on annual</p>
<p>✓ Strikethrough on monthly prices in annual view</p>
<p>✓ Annual total per plan shown</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-140</strong></td>
<td>Paywall</td>
<td><strong>Solo selected by default — CTA updates on card selection</strong></td>
<td><p>1. Observe default</p>
<p>2. Tap Pro</p>
<p>3. Tap Team</p></td>
<td><p>✓ Solo pre-selected with blue border and check</p>
<p>✓ CTA updates price on each selection</p>
<p>✓ Team: team details note appears below card</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-141</strong></td>
<td>Paywall</td>
<td><strong>Annual prices correct: Solo $55.20 / Pro $96 / Team $208</strong></td>
<td>1. Toggle to annual — observe all 3 plans</td>
<td><p>✓ Solo: $55.20/month shown</p>
<p>✓ Pro: $96/month shown</p>
<p>✓ Team: $208/month shown</p>
<p>✓ Annual billing totals shown</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-142</strong></td>
<td>Paywall</td>
<td><strong>KYC pending — subscribe blocked — pending notice</strong></td>
<td><p>1. Reach paywall with documents pending</p>
<p>2. Tap Subscribe</p></td>
<td><p>✓ Button greyed</p>
<p>✓ Pending notice shown</p>
<p>✓ Document identified</p>
<p>✓ 24h message shown</p>
<p>✓ Push notification promised</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-143</strong></td>
<td>Paywall</td>
<td><strong>KYC rejected — subscribe blocked — re-upload CTA</strong></td>
<td><p>1. Reach paywall with rejection</p>
<p>2. Tap Subscribe</p></td>
<td><p>✓ Subscribe blocked</p>
<p>✓ Rejected document identified</p>
<p>✓ Rejection reason shown</p>
<p>✓ Re-upload deep links to Settings → Profile</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-144</strong></td>
<td>Paywall</td>
<td><strong>KYC verified — Stripe checkout opens</strong></td>
<td><p>1. Complete KYC</p>
<p>2. Reach paywall</p>
<p>3. Tap Subscribe</p></td>
<td><p>✓ Stripe checkout sheet opens</p>
<p>✓ Plan and price pre-loaded</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-145</strong></td>
<td>Paywall</td>
<td><strong>Stripe checkout — card / Apple Pay / Google Pay</strong></td>
<td>1. Open Stripe checkout</td>
<td><p>✓ Card fields shown</p>
<p>✓ Apple Pay (iOS)</p>
<p>✓ Google Pay (Android)</p>
<p>✓ Pay button shows correct amount</p>
<p>✓ Cancel returns to paywall</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-146</strong></td>
<td>Paywall</td>
<td><strong>Payment declined — Stripe error — retry options</strong></td>
<td>1. Enter declined card — tap Pay</td>
<td><p>✓ Card fields turn red</p>
<p>✓ Stripe decline error shown</p>
<p>✓ Try again / Use different card / Cancel</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-147</strong></td>
<td>Paywall</td>
<td><strong>Use different card — fields cleared — Pay activates on valid card</strong></td>
<td><p>1. Payment declined</p>
<p>2. Tap Use different card</p></td>
<td><p>✓ All card fields cleared</p>
<p>✓ Pay disabled until new valid card</p>
<p>✓ Apple/Google Pay still available</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-148</strong></td>
<td>Paywall</td>
<td><strong>Payment confirmed — subscription activated — returned to feature</strong></td>
<td>1. Complete successful payment</td>
<td><p>✓ Subscription activated immediately (optimistic)</p>
<p>✓ Full access to features</p>
<p>✓ Returned to feature being accessed</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-149</strong></td>
<td>Paywall</td>
<td><strong>Webhook delay — optimistic access — corrected on next open</strong></td>
<td><p>1. Complete payment</p>
<p>2. Delay webhook deliberately</p>
<p>3. Use features</p>
<p>4. Close and reopen</p></td>
<td><p>✓ Features usable before webhook</p>
<p>✓ Access confirmed from webhook on reopen</p>
<p>✓ No interruption</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-150</strong></td>
<td>Paywall</td>
<td><strong>Restore purchase — found: restored / not found: see plans</strong></td>
<td>1. Tap Restore purchase</td>
<td><p>✓ Checking spinner shown</p>
<p>✓ Found: subscription restored → returned to feature</p>
<p>✓ Not found: 'No active subscription found' + See plans CTA</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-151</strong></td>
<td>Paywall</td>
<td><strong>Browse read-only — dismisses paywall — settings/history accessible</strong></td>
<td>1. Tap Browse in read-only mode</td>
<td><p>✓ Paywall dismissed</p>
<p>✓ Home / History / Settings accessible</p>
<p>✓ Feature buttons disabled</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-152</strong></td>
<td>Sub Mgmt</td>
<td><strong>Subscription mgmt: current plan / renewal / billing shown</strong></td>
<td>1. Open Settings → Subscription</td>
<td><p>✓ Current plan name</p>
<p>✓ Renewal date</p>
<p>✓ Amount</p>
<p>✓ Active badge</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-153</strong></td>
<td>Sub Mgmt</td>
<td><strong>Switch to annual — savings breakdown confirmation</strong></td>
<td>1. Tap Switch to annual billing</td>
<td><p>✓ Current vs new price shown</p>
<p>✓ Exact savings shown</p>
<p>✓ Annual total and billing date shown</p>
<p>✓ Confirm: switches / Keep monthly: no change</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-154</strong></td>
<td>Sub Mgmt</td>
<td><strong>Upgrade selector — Stripe checkout for difference — prorated</strong></td>
<td>1. Tap Upgrade to Pro or Team</td>
<td><p>✓ Pro and Team options shown</p>
<p>✓ Prorated billing note shown</p>
<p>✓ Stripe checkout for difference</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-155</strong></td>
<td>Sub Mgmt</td>
<td><strong>Billing history — all invoices — download per invoice</strong></td>
<td>1. Navigate to billing history</td>
<td><p>✓ All past invoices listed</p>
<p>✓ Amount / date / plan shown</p>
<p>✓ Download saves Stripe-hosted PDF</p>
<p>✓ Download toast confirmed</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-156</strong></td>
<td>Sub Mgmt</td>
<td><strong>Manage payment method — Stripe customer portal</strong></td>
<td>1. Tap Manage payment method</td>
<td><p>✓ Stripe customer portal opens in browser</p>
<p>✓ Can add / update / remove payment method</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-157</strong></td>
<td>Cancellation</td>
<td><strong>Cancellation — exact days remaining — switch to annual offered</strong></td>
<td>1. Navigate to cancellation screen</td>
<td><p>✓ Exact days calculated</p>
<p>✓ Exact end date shown</p>
<p>✓ Switch to annual with savings offered as alternative</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-158</strong></td>
<td>Cancellation</td>
<td><strong>Cancellation confirmed — full access until end date</strong></td>
<td>1. Confirm cancellation</td>
<td><p>✓ Cancellation confirmed screen shown</p>
<p>✓ Days remaining shown</p>
<p>✓ Full feature access until end date</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-159</strong></td>
<td>Cancellation</td>
<td><strong>Team downgrade — DELETE required — all team data destroyed immediately</strong></td>
<td><p>1. Team plan: change account type to Solopreneur</p>
<p>2. Tap Continue to downgrade</p>
<p>3. Type DELETE</p>
<p>4. Confirm</p></td>
<td><p>✓ Inline red warning appears on radio tap</p>
<p>✓ Full downgrade screen shows complete list</p>
<p>✓ DELETE typed exactly enables confirm button</p>
<p>✓ All team data destroyed immediately</p>
<p>✓ plan_type reverts to solo</p>
<p>✓ Team Management row disappears from Settings</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-160</strong></td>
<td>Notifications</td>
<td><strong>Payment failed — push notification — deep link to payment method</strong></td>
<td>1. Simulate failed payment webhook</td>
<td><p>✓ Push: 'Payment failed — update payment method'</p>
<p>✓ Tap: Settings → Subscription → Manage payment method</p></td>
<td><strong>HIGH</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-161</strong></td>
<td>Notifications</td>
<td><strong>Subscription expired — push notification — deep link to paywall</strong></td>
<td><p>1. Allow subscription to expire</p>
<p>2. Simulate webhook</p></td>
<td><p>✓ Push: 'Your plan has expired — tap to renew'</p>
<p>✓ Tap: paywall</p></td>
<td><strong>HIGH</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-162</strong></td>
<td>Notifications</td>
<td><strong>Renewal success — push notification — deep link to billing history</strong></td>
<td>1. Simulate renewal webhook</td>
<td><p>✓ Push: renewal confirmed</p>
<p>✓ Tap: Settings → Subscription billing history</p></td>
<td><strong>HIGH</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-163</strong></td>
<td>Paywall</td>
<td><strong>Already active — duplicate subscribe blocked</strong></td>
<td><p>1. Have active subscription</p>
<p>2. Trigger paywall</p></td>
<td><p>✓ 'You already have an active plan' shown</p>
<p>✓ No new charge</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-164</strong></td>
<td>Paywall</td>
<td><strong>No internet on paywall — retry CTA</strong></td>
<td><p>1. Reach paywall — disable network</p>
<p>2. Tap Subscribe</p></td>
<td><p>✓ 'No connection — cannot subscribe' shown</p>
<p>✓ Retry CTA available</p>
<p>✓ No checkout opened</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-165</strong></td>
<td>Sub Mgmt</td>
<td><strong>Resubscribe before expiry — new 30-day cycle</strong></td>
<td>1. Cancel — resubscribe before expiry</td>
<td><p>✓ New 30-day cycle from resubscription date</p>
<p>✓ Remaining days not carried over</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-166</strong></td>
<td>Sub Mgmt</td>
<td><strong>Resubscription after expiry — fresh 30-day cycle</strong></td>
<td>1. Let expire completely — resubscribe</td>
<td><p>✓ Fresh 30-day from payment date</p>
<p>✓ All data preserved</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-167</strong></td>
<td>Trial</td>
<td><strong>trial_queries_remaining decremented server-side only</strong></td>
<td><p>1. Send Rex message — monitor network</p>
<p>2. Attempt client-side manipulation</p></td>
<td><p>✓ Decrement via Edge Function only</p>
<p>✓ Client cannot change value directly</p>
<p>✓ DB constraint prevents negatives</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td colspan="8"><strong>H — ONBOARDING &amp; PROFILE (F7) — 13 test cases</strong></td>
</tr>
<tr class="odd">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="even">
<td><strong>TC-168</strong></td>
<td>Profile</td>
<td><strong>Editable fields: name / company / hourly rate / logo</strong></td>
<td><p>1. Navigate to Settings → Profile</p>
<p>2. Edit each editable field</p></td>
<td><p>✓ All 4 fields editable</p>
<p>✓ Saved on explicit Save tap — not auto-saved</p>
<p>✓ Logo picker opens on tap</p>
<p>✓ Remove logo option available</p>
<p>✓ Values reflected throughout app</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-169</strong></td>
<td>Profile</td>
<td><strong>Locked fields — VAT / license / national ID — lock badge shown</strong></td>
<td>1. Observe VAT / license / national ID fields in profile</td>
<td><p>✓ VAT: lock badge — read-only</p>
<p>✓ License number: verified badge + read-only</p>
<p>✓ License proof photo: read-only</p>
<p>✓ National ID: read-only — locked forever after verification</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-170</strong></td>
<td>Profile</td>
<td><strong>KYC pending — amber notice — 24h message</strong></td>
<td><p>1. Have pending KYC document</p>
<p>2. Navigate to profile</p></td>
<td><p>✓ Amber badge on pending document</p>
<p>✓ 'Under review — usually 24 hours' shown</p>
<p>✓ Push notification promised</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-171</strong></td>
<td>Profile</td>
<td><strong>KYC rejected — red badge + reason + re-upload CTA</strong></td>
<td><p>1. Simulate Stripe Identity rejection</p>
<p>2. Navigate to profile</p></td>
<td><p>✓ Red rejected badge</p>
<p>✓ Rejection reason shown</p>
<p>✓ Re-upload button active</p>
<p>✓ New Stripe Identity session initiated on tap</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-172</strong></td>
<td>Profile</td>
<td><strong>Unsaved changes + back — Save / Discard / Keep editing prompt</strong></td>
<td><p>1. Edit profile fields</p>
<p>2. Tap back without saving</p></td>
<td><p>✓ 'Unsaved changes' prompt shown</p>
<p>✓ Save and exit / Discard / Keep editing options</p>
<p>✓ Each option behaves correctly</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-173</strong></td>
<td>Profile</td>
<td><strong>Hourly rate change feeds into all future quotes immediately</strong></td>
<td><p>1. Change hourly rate</p>
<p>2. Generate new quote</p></td>
<td><p>✓ New quote uses updated rate</p>
<p>✓ Previous confirmed quotes unaffected</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-174</strong></td>
<td>Trade</td>
<td><strong>Trade type change — Rex prompt switches immediately</strong></td>
<td><p>1. Change trade to Electrician</p>
<p>2. Open Rex session</p></td>
<td><p>✓ Electrician system prompt used</p>
<p>✓ Electrician context questions asked</p>
<p>✓ Electrician code database queried</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-175</strong></td>
<td>Trade</td>
<td><strong>Solopreneur → Team Owner — inline notice — Team paywall pre-loaded</strong></td>
<td><p>1. Change account type to Team Owner</p>
<p>2. Observe inline notice</p>
<p>3. Tap upgrade CTA</p></td>
<td><p>✓ Inline upgrade notice on radio tap</p>
<p>✓ Team pricing shown</p>
<p>✓ CTA: 'Upgrade to Team Owner →'</p>
<p>✓ Paywall: Team pre-selected — Solo/Pro dimmed</p>
<p>✓ Cancel: radio reverts — no change</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-176</strong></td>
<td>Trade</td>
<td><strong>Team Owner → Solopreneur — inline red warning — DELETE required</strong></td>
<td><p>1. Change account type to Solopreneur</p>
<p>2. Observe inline warning</p>
<p>3. Continue to downgrade</p>
<p>4. Type DELETE</p>
<p>5. Confirm</p></td>
<td><p>✓ Red warning on radio tap with destruction list</p>
<p>✓ Full downgrade screen on Continue</p>
<p>✓ DELETE enables confirm button</p>
<p>✓ All team data destroyed immediately</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-177</strong></td>
<td>Settings</td>
<td><strong>Legal — Terms and Privacy viewable — acceptance record shown</strong></td>
<td><p>1. Navigate to Settings → Legal</p>
<p>2. Tap Terms</p>
<p>3. Tap Privacy</p></td>
<td><p>✓ Full scrollable text shown</p>
<p>✓ Version and 'You accepted ✓' badge</p>
<p>✓ Acceptance records: date + version — read-only</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-178</strong></td>
<td>Settings</td>
<td><strong>Sign out — confirmation — navigates to Welcome</strong></td>
<td><p>1. Tap Sign out</p>
<p>2. Confirm</p></td>
<td><p>✓ 'Are you sure?' dialog</p>
<p>✓ Confirm: clears session → Welcome screen</p>
<p>✓ Cancel: stays in Settings</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-179</strong></td>
<td>Settings</td>
<td><strong>Delete account — type DELETE — all data destroyed</strong></td>
<td><p>1. Tap Delete account</p>
<p>2. Type DELETE</p>
<p>3. Confirm</p></td>
<td><p>✓ Danger box with destruction list</p>
<p>✓ Active subscription billing note</p>
<p>✓ Delete enabled only when DELETE typed exactly</p>
<p>✓ All data destroyed immediately</p>
<p>✓ Outcome screen — no back nav</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-180</strong></td>
<td>Settings</td>
<td><strong>All 6 nav items always visible on every screen</strong></td>
<td><p>1. Navigate all major screens</p>
<p>2. Inspect bottom nav</p></td>
<td><p>✓ Home / Rex / Report / Quote / Codes / History always present</p>
<p>✓ Active tab highlighted blue</p>
<p>✓ No screen shows fewer than 6 items</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td colspan="8"><strong>I — TEAM MANAGEMENT (F8) — 27 test cases</strong></td>
</tr>
<tr class="even">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="odd">
<td><strong>TC-181</strong></td>
<td>Team</td>
<td><strong>Team Management visible to Team owners — hidden from Solopreneur</strong></td>
<td><p>1. Sign in as Solopreneur — check Settings</p>
<p>2. Sign in as Team Owner — check Settings</p></td>
<td><p>✓ Solopreneur: Team Management absent</p>
<p>✓ Team Owner: Team Management visible and accessible</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-182</strong></td>
<td>Team KPI</td>
<td><strong>Aggregate metrics — daily/weekly/monthly toggle</strong></td>
<td><p>1. Open Team Management → KPI Dashboard</p>
<p>2. Toggle periods</p></td>
<td><p>✓ Aggregate totals in navy card</p>
<p>✓ Per-member rows below</p>
<p>✓ Toggle updates all metrics</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-183</strong></td>
<td>Team KPI</td>
<td><strong>KPI metrics complete: jobs / time / queries / reports / quotes / value</strong></td>
<td><p>1. Open KPI Dashboard</p>
<p>2. Observe metrics</p></td>
<td>✓ Jobs count / time on site / Rex queries / reports / quotes count and total value — all present per member and aggregate</td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-184</strong></td>
<td>Team KPI</td>
<td><strong>Tap member row → per-member KPI drill-down</strong></td>
<td>1. Tap member row in KPI</td>
<td><p>✓ Per-member screen opens</p>
<p>✓ Same toggle available</p>
<p>✓ 8 metrics for that member</p>
<p>✓ View job history and Delete buttons</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-185</strong></td>
<td>Team Members</td>
<td><strong>First login pending badge on unactivated members</strong></td>
<td><p>1. Add member</p>
<p>2. View Members tab before member logs in</p></td>
<td><p>✓ 'First login pending' badge shown</p>
<p>✓ Card still tappable</p>
<p>✓ Delete still available</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-186</strong></td>
<td>Team Members</td>
<td><strong>KYC rejected badge on member with rejected document</strong></td>
<td><p>1. Simulate KYC rejection for member</p>
<p>2. View Members tab</p></td>
<td><p>✓ Red 'ID rejected ✕' badge</p>
<p>✓ Red card border</p>
<p>✓ Amber note: member can use app but cannot subscribe</p>
<p>✓ Owner cannot re-upload for member</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-187</strong></td>
<td>Team Members</td>
<td><strong>Swipe left — Delete action revealed</strong></td>
<td>1. Swipe member card left</td>
<td><p>✓ Red Delete action slides in</p>
<p>✓ Tap Delete: confirmation modal</p>
<p>✓ Swipe back: returns to normal</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-188</strong></td>
<td>Team Members</td>
<td><strong>+ Add disabled at 10 members — amber notice</strong></td>
<td><p>1. Add 10 members</p>
<p>2. Observe + Add</p></td>
<td><p>✓ Button disabled and greyed</p>
<p>✓ 'Maximum of 10 reached' amber notice</p>
<p>✓ Billing breakdown visible</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-189</strong></td>
<td>Team Detail</td>
<td><strong>Member detail — 4 tabs — all read-only</strong></td>
<td><p>1. Open member detail</p>
<p>2. Check all 4 tabs</p></td>
<td><p>✓ Rex / Reports / Quotes / Photos all present and read-only</p>
<p>✓ No edit option anywhere</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-190</strong></td>
<td>Team Detail</td>
<td><strong>Rex session tab — tap session — full read-only conversation</strong></td>
<td><p>1. Open Rex tab</p>
<p>2. Tap session card</p></td>
<td><p>✓ Full conversation shown</p>
<p>✓ 'Owner view — read-only' notice</p>
<p>✓ Earlier messages collapsible</p>
<p>✓ Report/quote shortcuts at bottom</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-191</strong></td>
<td>Team Detail</td>
<td><strong>Owner cannot edit member content</strong></td>
<td>1. Attempt to edit member report from owner view</td>
<td><p>✓ No edit button anywhere in member detail</p>
<p>✓ Read-only enforced at UI and DB (RLS) level</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-192</strong></td>
<td>Add Member</td>
<td><strong>All required fields validated — duplicate email error</strong></td>
<td><p>1. Open add member form</p>
<p>2. Submit with missing fields</p>
<p>3. Submit with duplicate email</p></td>
<td><p>✓ Red error borders on missing fields</p>
<p>✓ Summary banner with error count</p>
<p>✓ 'Email already registered' specific error for duplicate</p>
<p>✓ Create disabled until all resolved</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-193</strong></td>
<td>Add Member</td>
<td><strong>Trade type tap → trade selector overlay</strong></td>
<td>1. Tap trade type field</td>
<td><p>✓ Trade selector overlay opens</p>
<p>✓ All 5 options listed with code database</p>
<p>✓ Confirm: updates form</p>
<p>✓ ← back: no change</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-194</strong></td>
<td>Add Member</td>
<td><strong>← back with data → unsaved form prompt</strong></td>
<td><p>1. Fill form</p>
<p>2. Tap ← back</p></td>
<td><p>✓ 'Unsaved member form' prompt</p>
<p>✓ Keep editing / Discard options</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-195</strong></td>
<td>Add Member</td>
<td><strong>No internet during create — form preserved — try again</strong></td>
<td><p>1. Fill complete form</p>
<p>2. Disable network</p>
<p>3. Tap Create</p></td>
<td><p>✓ 'No connection' error shown</p>
<p>✓ Form data preserved</p>
<p>✓ Retry when connected</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-196</strong></td>
<td>Add Member</td>
<td><strong>Create success — email + SMS sent — billing updated — KYC running</strong></td>
<td>1. Successfully create team member</td>
<td><p>✓ Success screen shown</p>
<p>✓ SMS and email sent confirmed</p>
<p>✓ Billing updated +$89/mo</p>
<p>✓ KYC running in background notice</p>
<p>✓ Member card in Members tab with first login pending</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-197</strong></td>
<td>Add Member</td>
<td><strong>Stripe seat added on create — removed on delete</strong></td>
<td><p>1. Create member — check Stripe</p>
<p>2. Delete member — check Stripe</p></td>
<td><p>✓ Seat count increments on create</p>
<p>✓ Seat count decrements on delete</p></td>
<td><strong>CRITICAL</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-198</strong></td>
<td>Delete Member</td>
<td><strong>Delete confirmation — destruction list — billing note</strong></td>
<td>1. Trigger member deletion</td>
<td><p>✓ Member name in confirmation</p>
<p>✓ Exact destruction list</p>
<p>✓ Billing reduction noted</p>
<p>✓ Confirm / Cancel</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-199</strong></td>
<td>Delete Member</td>
<td><strong>Delete cascades all data — verified in database</strong></td>
<td><p>1. Delete team member</p>
<p>2. Check tables</p></td>
<td><p>✓ Auth user deleted</p>
<p>✓ users record deleted</p>
<p>✓ team_members link deleted</p>
<p>✓ All sessions / messages / reports / quotes / storage files deleted</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-200</strong></td>
<td>Delete Member</td>
<td><strong>Delete available from member card / detail / per-member KPI</strong></td>
<td>1. Attempt from all 3 entry points</td>
<td><p>✓ Same confirmation modal from all 3</p>
<p>✓ Same result</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-201</strong></td>
<td>Team Login</td>
<td><strong>Member first login — forced password change — phone OTP</strong></td>
<td>1. Team member signs in with temp password</td>
<td><p>✓ Password change forced</p>
<p>✓ Phone OTP required</p>
<p>✓ Lands on Home after setup</p>
<p>✓ First login pending badge clears for owner</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-202</strong></td>
<td>Team Login</td>
<td><strong>Member cannot delete own account</strong></td>
<td><p>1. Sign in as team member</p>
<p>2. Navigate to Settings → Account</p></td>
<td>✓ Delete account option absent for team member</td>
<td><strong>HIGH</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-203</strong></td>
<td>Team Owner</td>
<td><strong>Owner cannot log in as member — no mechanism</strong></td>
<td>1. Search Team Management for sign-in-as functionality</td>
<td><p>✓ No sign-in-as button</p>
<p>✓ No view-as toggle</p>
<p>✓ No such mechanism exists in app</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-204</strong></td>
<td>Team Owner</td>
<td><strong>Owner cannot change member trade type through owner view</strong></td>
<td><p>1. Open member detail as owner</p>
<p>2. Search for trade type change</p></td>
<td><p>✓ No trade type change available in owner's view</p>
<p>✓ Member manages own trade type</p></td>
<td><strong>HIGH</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-205</strong></td>
<td>Team Empty</td>
<td><strong>Empty state — no members — billing context — Add CTA</strong></td>
<td>1. Open Team Management with no members</td>
<td><p>✓ 0/10 seats shown</p>
<p>✓ Billing: base + per-seat breakdown</p>
<p>✓ Add first team member CTA</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-206</strong></td>
<td>Team KPI</td>
<td><strong>Push notification: member activated — deep link to member detail</strong></td>
<td>1. Member completes first login</td>
<td><p>✓ Push: '[Name] activated account'</p>
<p>✓ Tap: Team Management → member detail</p>
<p>✓ First login pending badge clears</p></td>
<td><strong>HIGH</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-207</strong></td>
<td>Team RLS</td>
<td><strong>Team owner reads member data — cannot write</strong></td>
<td><p>1. As owner: fetch member sessions via API</p>
<p>2. Attempt to UPDATE member session</p></td>
<td><p>✓ SELECT succeeds via team_owner_id join</p>
<p>✓ UPDATE blocked by RLS</p>
<p>✓ Error at database level — not just UI</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td colspan="8"><strong>J — SYSTEM STATES, EDGE CASES &amp; SECURITY — 25 test cases</strong></td>
</tr>
<tr class="odd">
<td><strong>ID</strong></td>
<td><strong>Area</strong></td>
<td><strong>Test Case</strong></td>
<td><strong>Steps</strong></td>
<td><strong>Expected Result</strong></td>
<td><strong>Priority</strong></td>
<td><strong>Type</strong></td>
<td><strong>Result</strong></td>
</tr>
<tr class="even">
<td><strong>TC-208</strong></td>
<td>System</td>
<td><strong>All 6 nav items always visible on every screen</strong></td>
<td>1. Navigate all major screens</td>
<td><p>✓ Home / Rex / Report / Quote / Codes / History always shown</p>
<p>✓ Active tab highlighted blue</p>
<p>✓ No screen has fewer than 6 items (except force upgrade/suspended)</p></td>
<td><strong>CRITICAL</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-209</strong></td>
<td>Empty State</td>
<td><strong>Reports tab empty state</strong></td>
<td>1. Open Report tab on new account</td>
<td><p>✓ 'No reports yet' empty state</p>
<p>✓ Go to Rex CTA</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-210</strong></td>
<td>Empty State</td>
<td><strong>Quotes tab empty state</strong></td>
<td>1. Open Quote tab on new account</td>
<td><p>✓ 'No quotes yet' empty state</p>
<p>✓ Go to Rex CTA</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-211</strong></td>
<td>Offline</td>
<td><strong>App-wide offline banner — features dim — reconnect sync</strong></td>
<td>1. Disable network — navigate app — re-enable</td>
<td><p>✓ Red banner on ALL screens</p>
<p>✓ Feature buttons dim</p>
<p>✓ On reconnect: green sync banner</p>
<p>✓ Queued items auto-process</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-212</strong></td>
<td>Offline</td>
<td><strong>Rex offline — message queued — auto-sends</strong></td>
<td>1. Rex session — disable network — send message — re-enable</td>
<td><p>✓ Message stored locally</p>
<p>✓ Queued indicator</p>
<p>✓ Input dims</p>
<p>✓ Auto-sends on reconnect</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-213</strong></td>
<td>Offline</td>
<td><strong>Report/Quote draft preserved — auto-generates on reconnect</strong></td>
<td>1. Complete report — disable network — confirm — re-enable</td>
<td><p>✓ Draft preserved</p>
<p>✓ PDF auto-generates and confirms on reconnect</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-214</strong></td>
<td>Offline</td>
<td><strong>Code lookup — last 10 cached offline</strong></td>
<td>1. 10+ lookups — disable network — open Codes</td>
<td><p>✓ Last 10 displayed offline</p>
<p>✓ New queries blocked</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-215</strong></td>
<td>API Errors</td>
<td><strong>Claude timeout — message preserved — Retry</strong></td>
<td>1. Simulate 30s timeout</td>
<td><p>✓ 'Taking longer' shown after 30s</p>
<p>✓ Retry available</p>
<p>✓ Message preserved</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-216</strong></td>
<td>API Errors</td>
<td><strong>Whisper fail — text fallback — audio preserved</strong></td>
<td>1. Simulate Whisper failure after recording</td>
<td><p>✓ Amber banner</p>
<p>✓ Text auto-shown</p>
<p>✓ Audio preserved</p>
<p>✓ Retry Whisper option</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-217</strong></td>
<td>API Errors</td>
<td><strong>PDF fail — Retry — text preserved</strong></td>
<td>1. Simulate PDF failure</td>
<td><p>✓ 'Could not generate PDF — tap to retry'</p>
<p>✓ Text preserved</p>
<p>✓ Retry available</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-218</strong></td>
<td>API Errors</td>
<td><strong>Supabase error — auto-retry — local state preserved</strong></td>
<td>1. Simulate Supabase error</td>
<td><p>✓ Subtle offline indicator</p>
<p>✓ Auto-retry without worker action</p>
<p>✓ Raw error never shown</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-219</strong></td>
<td>API Errors</td>
<td><strong>Photo &gt;8MB — auto-compressed silently</strong></td>
<td>1. Send photo &gt;8MB in Rex session</td>
<td><p>✓ Photo auto-compressed</p>
<p>✓ No error shown</p>
<p>✓ Compressed photo sent normally</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-220</strong></td>
<td>Security</td>
<td><strong>RLS — user accesses own data only</strong></td>
<td>1. Attempt to query another user's data via API</td>
<td><p>✓ RLS blocks cross-user access</p>
<p>✓ Empty result returned</p>
<p>✓ Enforced at DB level</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-221</strong></td>
<td>Security</td>
<td><strong>RLS — confirmed documents locked — DB trigger</strong></td>
<td><p>1. Confirm report</p>
<p>2. Attempt direct DB UPDATE</p></td>
<td><p>✓ Trigger raises exception: 'Cannot modify a finalised report'</p>
<p>✓ Update blocked at DB level</p></td>
<td><strong>CRITICAL</strong></td>
<td>Data Integrity</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-222</strong></td>
<td>Security</td>
<td><strong>API keys never in mobile app bundle</strong></td>
<td>1. Inspect app bundle for sensitive keys</td>
<td><p>✓ No Stripe secret / OpenAI / Anthropic keys in bundle</p>
<p>✓ Only SUPABASE_ANON_KEY and STRIPE_PUBLISHABLE_KEY in app</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-223</strong></td>
<td>Security</td>
<td><strong>Stripe webhook signature verified before any processing</strong></td>
<td>1. Send fake webhook without valid signature</td>
<td><p>✓ Request rejected with 400</p>
<p>✓ No DB changes made</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-224</strong></td>
<td>Security</td>
<td><strong>Stripe Identity webhook signature verified</strong></td>
<td>1. Send fake Identity webhook</td>
<td><p>✓ Request rejected</p>
<p>✓ KYC status not updated</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-225</strong></td>
<td>Security</td>
<td><strong>DELETE confirmation enforced for all 3 destructive actions</strong></td>
<td><p>1. Attempt team downgrade without DELETE</p>
<p>2. Attempt account delete without DELETE</p>
<p>3. Attempt member delete without DELETE</p></td>
<td><p>✓ Confirm button disabled in all 3 cases</p>
<p>✓ Action blocked at UI and Edge Function level</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-226</strong></td>
<td>Notifications</td>
<td><strong>All 6 push types — correct payloads — correct deep links</strong></td>
<td><p>1. Simulate all 6 events</p>
<p>2. Observe and tap each notification</p></td>
<td><p>✓ KYC verified → paywall</p>
<p>✓ KYC rejected → Settings Profile</p>
<p>✓ Payment failed → payment method</p>
<p>✓ Expired → paywall</p>
<p>✓ Renewal → billing history</p>
<p>✓ Member activated → member detail</p></td>
<td><strong>HIGH</strong></td>
<td>Integration</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-227</strong></td>
<td>System</td>
<td><strong>Skeleton loading — History / KPI / Job Detail</strong></td>
<td>1. Open History / KPI / Job Detail during Supabase load</td>
<td><p>✓ Shimmer animation shown</p>
<p>✓ Correct skeleton shapes</p>
<p>✓ Never blank white screen</p></td>
<td><strong>MEDIUM</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-228</strong></td>
<td>Technical</td>
<td><strong>Photo compression tiered by Rex stage</strong></td>
<td>1. Send photos at Stage 1 / 2 / 3+</td>
<td><p>✓ Stage 1: 60%/1024px</p>
<p>✓ Stage 2: 50%/800px</p>
<p>✓ Stage 3+: 40%/600px</p>
<p>✓ Applied automatically</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-229</strong></td>
<td>Technical</td>
<td><strong>Conversation summariser at message 10</strong></td>
<td><p>1. Have 10+ message Rex session</p>
<p>2. Observe API payload size</p></td>
<td><p>✓ Messages 1-10: raw history</p>
<p>✓ Message 11+: compressed summary + last 3 raw</p>
<p>✓ Token count capped ~2000</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-230</strong></td>
<td>Technical</td>
<td><strong>Model router assigns correct Claude model per call</strong></td>
<td>1. Monitor Claude API calls across features</td>
<td><p>✓ Stage 1/2/4: Sonnet 4.5</p>
<p>✓ Stage 3/5: Haiku</p>
<p>✓ Report/Quote/Summarisation: Haiku</p>
<p>✓ Code Lookup: Sonnet</p></td>
<td><strong>HIGH</strong></td>
<td>Technical</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="odd">
<td><strong>TC-231</strong></td>
<td>Technical</td>
<td><strong>Session soft cap — warning 28 — linked session 30</strong></td>
<td>1. Have 30+ message session</td>
<td><p>✓ Warning at 28</p>
<p>✓ Linked session prompt at 30</p>
<p>✓ Not a hard block</p>
<p>✓ New session with compressed context</p></td>
<td><strong>HIGH</strong></td>
<td>Functional</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
<tr class="even">
<td><strong>TC-232</strong></td>
<td>Security</td>
<td><strong>trial_queries_remaining server-side only — DB constraint prevents negatives</strong></td>
<td>1. Attempt client-side manipulation of query count</td>
<td><p>✓ Decrement via Edge Function only</p>
<p>✓ DB constraint: trial_queries_remaining &gt;= 0</p>
<p>✓ Active subscribers: decrement not called</p></td>
<td><strong>CRITICAL</strong></td>
<td>Security</td>
<td>□ Pass
□ Fail
□ N/A</td>
</tr>
</tbody>
</table>

**3. DEFECT LOG TEMPLATE**

When a test case fails, log a defect using this structure. Reference the Test Case ID from Section 2.

|                                                                 |
|-----------------------------------------------------------------|
| DEFECT ID: DEF-\[number\]                                       
 TEST CASE ID: TC-\[number\]                                      
 SEVERITY: Critical / High / Medium / Low                         
 FEATURE: \[feature name\]                                        
 DESCRIPTION: \[what happened\]                                   
 EXPECTED: \[per this document\]                                  
 STEPS TO REPRODUCE: \[exact steps\]                              
 ENVIRONMENT: iOS \[version\] / Android \[version\] / \[device\]  
 DISCOVERED BY: \[tester name\]                                   
 DATE: \[date\]                                                   
 STATUS: Open / In Progress / Fixed / Verified / Closed           
 FIX REFERENCE: \[commit or PR\]                                  |

**4. PRE-LAUNCH CHECKLIST**

All items must be confirmed before Phase 1 is approved for public release.

|                                                                                                 |
|-------------------------------------------------------------------------------------------------|
| □ CRITICAL TEST CASES: All CRITICAL priority test cases pass with no open defects.              
 □ HIGH TEST CASES: All HIGH priority test cases pass or have accepted workarounds.               
 □ SECURITY: All Section J security tests pass.                                                   
 □ AI QUALITY: All Rex AI quality tests pass across all 4 trade profiles.                         
 □ STRIPE INTEGRATION: End-to-end subscription flow tested in Stripe live mode.                   
 □ PUSH NOTIFICATIONS: All 6 notification types tested on physical iOS and Android devices.       
 □ OFFLINE: Offline scenarios tested on physical devices with network disabled.                   
 □ KYC PIPELINE: Full KYC flow tested with real documents through Stripe Identity in production.  
 □ PDF GENERATION: Report and Quote PDFs verified on iOS and Android --- formatting correct.      
 □ RAG DATABASE: All code documents ingested --- at least one live query confirmed per trade.     
 □ APP STORE: Submission requirements met --- privacy labels / screenshots / description.         
 □ GDPR / PRIVACY: Privacy policy reviewed --- data handling compliant with applicable law.       
 □ OPEN DEFECTS: All open defects reviewed and signed off by product owner.                       |

**5. DOCUMENT STATUS**

|              |                                   |
|--------------|-----------------------------------|
| **Document** | D8 --- Test Plan and QA Checklist |

|             |                              |
|-------------|------------------------------|
| **Version** | v1.0 --- Official and Locked |

|          |            |
|----------|------------|
| **Date** | April 2026 |

|            |                                                  |
|------------|--------------------------------------------------|
| **Status** | Approved for Development --- Active QA Reference |

|                      |     |
|----------------------|-----|
| **Total test cases** | 232 |

|              |                                                                                                                                                                                                 |
|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Coverage** | All 8 TradesBrain features · 12 wireframe flows · All 15 Rex behavioural principles · All security and data integrity rules · All system states and edge cases validated in specification phase |

|                                                                                                                                                                                                                             |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| TradesBrain --- D8 Test Plan and QA Checklist --- v1.0 --- Official and Locked --- April 2026 --- Confidential                                                                                                              
 Built from scratch incorporating all decisions validated across D1--D7, D10, all 12 wireframe flows, and the full design and specification session. This is the single source of truth for TradesBrain acceptance criteria.  |
