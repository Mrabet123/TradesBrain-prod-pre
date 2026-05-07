**TRADESBRAIN**

**D1 --- Product Requirements Document**

*The complete product definition for the TradesBrain AI co-pilot platform*

|             |                              |
|-------------|------------------------------|
| **Version** | v1.2 --- Official and Locked |

|          |            |
|----------|------------|
| **Date** | April 2026 |

|            |                          |
|------------|--------------------------|
| **Status** | Approved for Development |

|              |                                                     |
|--------------|-----------------------------------------------------|
| **Audience** | Claude Code (primary), product review, stakeholders |

|                     |                                    |
|---------------------|------------------------------------|
| **Confidentiality** | Confidential --- Internal use only |

**1. PRODUCT STATEMENT**

TradesBrain is an AI-powered mobile co-pilot for skilled trade professionals. It operates as a personal, job-specific assistant that activates on the job site --- analysing problems through photo and voice input, diagnosing issues in real time, guiding the professional step by step through the repair or installation, generating job reports, and producing quotes on demand.

It does not replace the tradesperson. It removes every obstacle between them and a completed, correctly executed job.

The AI at the core of TradesBrain is Rex --- a trade-specific intelligence that knows professional codes, recognises components and failure modes, understands safety requirements, and communicates like a senior colleague standing next to the worker on site.

TradesBrain is the tool that did not exist before. Not a scheduling app. Not a generic AI. Not a business management platform. The first AI built specifically for the person with their hands on the pipe, the wire, or the unit.

**2. THE PROBLEM**

Skilled trade professionals --- plumbers, electricians, HVAC technicians, roofers --- face a recurring set of failures on every job site that cost them time, money, reputation, and confidence.

**Uncertainty on site**

They encounter components, configurations, or failures they have not seen before. With no expert available and no trade-specific tool to consult, they lose time searching generic internet results, making phone calls, or in the worst case leaving the job site entirely. Every hour lost on uncertainty is a job not completed and revenue not earned.

**Workflow fragmentation**

The tradesperson does the physical work, then manually writes a job report, then separately generates a quote, then communicates findings to the customer --- each step disconnected from the others, done from memory, prone to error and delay.

**No professional code safety net**

Codes are complex, regularly updated, and locally amended. A professional working without a reliable code reference risks failed inspections, rework, and liability. Current tools --- physical codebooks, PDFs, generic search --- are slow and unreliable on a job site.

**Existing tools do not solve this**

ServiceTitan and Housecall Pro are office management platforms designed for business owners, not field workers. They cost \$200-500/month, require complex setup, and have zero AI diagnostic capability. Generic AI tools like ChatGPT have no trade-specific knowledge, no job memory, no code database, and no output format relevant to trade work. The result: tradespeople are slower, less confident, less organised, and less profitable than they should be --- not because they lack skill, but because they lack the right tool.

**3. THE SOLUTION**

TradesBrain puts Rex in the worker\'s pocket on every job.

The core interaction is simple: the worker takes a photo of the problem, describes it by voice, and Rex analyses both simultaneously. It identifies the component, diagnoses the root cause, provides step-by-step repair guidance with code compliance notes, evaluates the worker\'s progress through follow-up photos, and confirms when the job is done correctly.

When the job is complete, Rex generates the job report and the quote in the worker\'s voice and format --- ready to share immediately. For crew owners, TradesBrain provides a management layer: every tech\'s job activity, documented and visible, with daily, weekly, and monthly performance reports built from real job data.

**4. TARGET USERS --- IDEAL CUSTOMER PROFILE**

**Primary ICP --- Solo Trade Professional (Solopreneur)**

A self-employed plumber or electrician working alone or with one helper. Does 4-8 jobs per day across residential and light commercial. Responsible for their own quoting, reporting, and customer communication. Values speed, accuracy, and professionalism. Currently uses phone calls, generic Google searches, or ChatGPT to handle uncertainty on site.

|                                                                                                                                                                                                                                                       |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pain intensity: Maximum. Every minute lost on a job site is direct income loss. Every incorrect report or missing quote is money left behind. Willingness to pay: High. At \$69/month they recover the cost in under one hour of billable work saved. |

**Secondary ICP --- Small Crew Owner (2-10 technicians)**

A trade business owner who manages a team of 2-10 technicians across multiple simultaneous jobs. Cannot be present on every site. Primary concern: are my techs doing the job correctly, documenting it properly, and representing the business well?

|                                                                                                                                                                                                                                                                                                    |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Pain intensity: High. Quality control across a distributed crew is a persistent, unsolved problem. Existing tools give scheduling data --- not job quality data. Willingness to pay: Higher than solo. The Team plan ROI is immediate: one avoided callback job pays three months of subscription. |

**Tertiary --- Trade Apprentice (18-28)**

A 1st to 3rd year apprentice learning on the job. Encounters unfamiliar situations constantly. Reluctant to ask senior colleagues too many questions. Would use Rex as an AI mentor actively and daily.

|                                                                                                                                                                                     |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Acquisition value: High. Apprentices are the fastest-spreading viral channel --- they share tools that make them look competent. They also become the primary ICP within 2-3 years. |

**5. FEATURE LIST --- PRIORITISED**

**MUST HAVE --- MVP at Launch**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F1 — AI DIAGNOSTIC (REX CORE)</strong></p>
<p>Photo and voice input, simultaneous multimodal analysis, root cause diagnosis, step-by-step repair guidance, code compliance notes, follow-up photo evaluation, completion confirmation. Rex operates through a five-stage collaboration protocol with full stage flexibility — the worker can skip any stage at any time. Report and Quote buttons appear only after the worker explicitly closes the job. Rex is represented by a compass icon avatar in all message bubbles and working tool screens. This is the product. Everything else exists to support and extend it.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F2 — VOICE-TO-JOB-REPORT</strong></p>
<p>Worker speaks a job summary. Rex formats it into a professional, structured job report: findings, work performed, materials used, suggested payment amount, recommendations, sign-off line. PDF generated and permanently archived. Path A: from closed Rex session with job context pre-loaded. Path B: standalone via Report tab with no Rex session required. Worker defines section structure on first use — Rex saves and reuses for all future reports.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F3 — QUOTE GENERATOR</strong></p>
<p>Worker describes the job by voice. Rex generates a line-item quote with materials, labour hours, and a suggested total range. Worker sets the final confirmed amount. PDF generated and permanently archived. Path A: from closed Rex session, reusing report data if report was generated first. Path B: standalone via Quote tab. Payment method selection (multiple allowed: Cash, Bank transfer, Bank direct debit, Cheque, Online payment link, To be agreed) saved as default preference after first use.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F4 — TRADE CODE LOOKUP</strong></p>
<p>Dedicated conversational code search. Worker asks in plain language via voice or text. Rex returns the specific code section, its requirement, and an AHJ verification note — always appended without exception. Backed by RAG database: IPC 2021, UPC 2021, NFPA 24, NFPA 54, ASME B31.9, ASSE standards. Accessible inside or outside any Rex session. Each query consumes one free trial query.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F5 — JOB HISTORY AND RECORDS</strong></p>
<p>Permanent archive of all jobs, reports, quotes, and Rex conversations. Every confirmed report and quote is permanently locked once the worker taps Confirm — read-only forever. Draft documents that are not confirmed are automatically discarded on exit with a warning prompt shown first. Reopen any past Rex session for continued collaboration. Job deletion available at any time regardless of subscription status. Download and share always accessible.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F6 — SUBSCRIPTION AND PAYWALL</strong></p>
<p>Free trial: 10 queries total across all features and all sessions — global lifetime cap. One query = one send tap triggering a Claude API call anywhere in the app. The SubscriptionGate component wraps every feature entry point and checks all six verification triggers on every attempt. Paywall intercepts at any feature button tap when trial is exhausted or subscription is expired. The paywall is fully locked until all six identity verification triggers are satisfied. KYC (national ID + license proof) required before Stripe checkout can proceed. Auto-renewal every 30 days. Full feature access maintained on cancellation until end of current billing cycle.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F7 — ONBOARDING, IDENTITY VERIFICATION, AND TRADE PROFILE</strong></p>
<p>Three-step sign-up form. All identity documents (national ID photo, license proof photo + license number) are required at sign-up — no optional skipping. Dual OTP verification (email + SMS) triggered on Create Account tap. KYC via Stripe Identity runs immediately after account creation. Trial queries (10) act as the natural KYC window. Paywall unlocks only when all six verification triggers are satisfied. Save Password toggle on sign-in screen (off by default) — credentials stored in Expo SecureStore when enabled.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>F8 — TEAM MANAGEMENT</strong></p>
<p>Team plan owners create and manage all technician accounts from their own admin environment. Owner never logs in as a team member. Each team member gets unlimited queries under the Team plan. Owner has full read-only visibility of all team activity, Rex sessions, reports, quotes, photos, and job history. KPI dashboard per member and team aggregate: jobs completed, time on site, Rex queries used, reports generated, quotes generated and value, materials used — daily/weekly/monthly views.</p></td>
</tr>
</tbody>
</table>

**SHOULD HAVE --- Months 3-6**

- F9 --- Materials Price Reference: common trade materials with approximate regional pricing integrated into quote generation

- F10 --- Performance Analytics for Solo Users: personal dashboard with jobs per day, average duration, revenue generated, most common job types

**NICE TO HAVE --- Year 2**

- Offline Mode: on-device Whisper transcription and cached RAG responses for remote job sites with poor signal

- Permit and Inspection Helper: jurisdiction-specific permit guidance by US state

- Multi-language Support: UI localisation and code database expansion for UK, Italian, French, and German markets

- Additional Trade Profiles: HVAC Technician, Roofer, General Contractor added to Rex trade library

**6. IDENTITY VERIFICATION CHAIN --- PAYWALL UNLOCK ARCHITECTURE**

This is the single most critical architectural rule in the entire product. The paywall is completely locked until all six verification triggers are satisfied simultaneously. There is no bypass. There are no exceptions.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>ALL SIX TRIGGERS REQUIRED BEFORE PAYWALL UNLOCKS:</p>
<p>Trigger 1: Email OTP — verified at sign-up via Supabase Auth</p>
<p>Trigger 2: SMS OTP — verified at sign-up via Supabase Auth</p>
<p>Trigger 3: National ID photo — Stripe Identity API returns verified</p>
<p>Trigger 4: License proof photo — Stripe Identity API returns verified</p>
<p>Trigger 5: License number — submitted at sign-up (static text field)</p>
<p>Trigger 6: VAT number — submitted at sign-up (static text field)</p>
<p>If ALL SIX satisfied: paywall shows plan cards and Stripe checkout.</p>
<p>If ANY ONE not satisfied: Verification Status Screen shown instead of paywall.</p>
<p>Push notification sent to worker when all six triggers become verified.</p>
<p>Deep link in notification opens paywall directly with last-selected plan pre-loaded.</p></td>
</tr>
</tbody>
</table>

National ID and license proof are both required at sign-up --- no optional fields, no ability to skip. KYC runs immediately in the background after account creation. The 10-query free trial period is the natural KYC processing window. Workers can use Rex during this period without any paywall interruption.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CLARIFICATION — SECTION 6 PAYWALL GATE IN PRACTICE:</p>
<p>All six triggers must be satisfied for the paywall to unlock — this rule is correct and unchanged.</p>
<p>However: Triggers 1 (Email OTP), 2 (SMS OTP), 5 (License number text field), and 6 (VAT number) are verified at sign-up and cannot fail at paywall time. They are completed before the worker ever reaches the paywall. A worker who has signed up has already satisfied all four of these triggers.</p>
<p>In practice, the Stripe checkout is blocked only by Triggers 3 and 4 — the National ID photo and License proof photo document verification — because these are the only triggers whose verification status can be 'pending' or 'rejected' at checkout time.</p>
<p>This is the behaviour implemented in the kyc-status-check Edge Function (D10 Section 2.2) and shown in the D6 wireframes (Flow 09 KYC gate screens). The six-trigger architectural rule is complete and correct — this clarification explains why the paywall UI only surfaces Triggers 3 and 4 as blocking states.</p></td>
</tr>
</tbody>
</table>

**KYC Rejection Handling**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>If Stripe Identity rejects a document:</p>
<p>— Push notification sent immediately: 'Your document was rejected — tap to re-upload.'</p>
<p>— In-app banner shown in Settings &gt; Profile with rejection reason if available.</p>
<p>— Worker re-uploads from Settings &gt; Profile.</p>
<p>— Re-upload triggers new Stripe Identity session automatically.</p>
<p>— Trial queries continue working normally during rejection resolution.</p>
<p>— Once verified, document is permanently locked — read-only forever.</p></td>
</tr>
</tbody>
</table>

**7. SIGN-UP FORM --- COMPLETE FIELD SPECIFICATION**

Three steps. All identity documents required at sign-up. No optional identity fields. Both OTPs required before account is created.

|                           |                                                                                                                                                                                          |                                                                                                           |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| **Step**                  | **Fields**                                                                                                                                                                               | **Notes**                                                                                                 |
| Step 1 Account Basics     | Full name, Email address, Password (min 8 chars, strength indicator shown), Phone number (country code selector)                                                                         | All required. Form validates inline. Create Account button greyed out until valid.                        |
| Step 2 Trade Profile      | Trade type (Plumber / Electrician / HVAC / Roofer / Other-General Contractor), Account type (Solopreneur / Team Owner), Hourly rate in \$, VAT number                                    | All required. VAT number permanently locked after account creation.                                       |
| Step 3 Identity & Company | License proof --- photo upload + license number text field (REQUIRED), National ID --- photo upload (REQUIRED), Company name (OPTIONAL only field), Company logo photo upload (optional) | National ID and license proof are mandatory. Both submitted immediately. KYC runs after account creation. |
| OTP Verification          | Email OTP code + SMS OTP code --- both on single screen                                                                                                                                  | Both must be verified before proceeding. Resend per channel after 60s. Wrong code 3x = 5 min lockout.     |
| Terms & Conditions        | Worker must read and tap I agree before account creation completes                                                                                                                       | Acknowledgement date and version stored permanently. Cannot skip. Legal compliance record.                |

**8. BUSINESS MODEL --- REVENUE AND PRICING**

TradesBrain charges trade professionals for platform access only. The business relationship is exclusively between TradesBrain and the trade professional. No end-customer payment processing. No customer communication mediation.

**Plan Overview --- Final Locked Pricing**

|                 |             |                      |                           |                                    |
|-----------------|-------------|----------------------|---------------------------|------------------------------------|
| **Plan**        | **Monthly** | **Annual (20% off)** | **Seats**                 | **Queries**                        |
| Solo            | \$69/month  | \$55.20/month        | 1 user                    | Unlimited when subscribed          |
| Pro             | \$120/month | \$96/month           | 1 user                    | Unlimited when subscribed          |
| Team Base       | \$260/month | \$208/month          | Owner + 2 techs (3 total) | Unlimited --- owner + all members  |
| Additional seat | +\$89/month | +\$71.20/month       | Per tech beyond 3         | Unlimited                          |
| Free trial      | Free        | ---                  | All features accessible   | 10 queries --- global lifetime cap |

**Team Plan --- Per-Seat Scaling Examples**

|                          |             |                      |
|--------------------------|-------------|----------------------|
| **Team Size**            | **Monthly** | **Annual (20% off)** |
| Owner + 2 members (base) | \$260/month | \$208/month          |
| Owner + 3 members        | \$349/month | \$279.20/month       |
| Owner + 5 members        | \$527/month | \$421.60/month       |
| Owner + 7 members        | \$705/month | \$564/month          |
| Owner + 10 members       | \$972/month | \$777.60/month       |

**Gross Margin at Final Pricing**

|                                  |             |                      |                  |
|----------------------------------|-------------|----------------------|------------------|
| **Plan and User Type**           | **Revenue** | **API + Infra Cost** | **Gross Margin** |
| Solo --- light user (1 job/day)  | \$69        | \~\$7                | \~90%            |
| Solo --- heavy user (3 jobs/day) | \$69        | \~\$14               | \~80%            |
| Pro --- heavy user               | \$120       | \~\$22               | \~82%            |
| Team base --- heavy team         | \$260       | \~\$74               | \~72%            |
| Target minimum across all plans  | ---         | ---                  | 70%+             |

**9. AI COST OPTIMISATION ARCHITECTURE**

Five technical optimisations are built from day one as core architectural components --- not post-launch improvements. They ensure gross margins remain above 70% even at heavy usage.

|                                                                                                            |
|------------------------------------------------------------------------------------------------------------|
| ALL 5 OPTIMISATIONS LOCKED FOR DAY ONE BUILD. These are architectural requirements, not optional features. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Optimisation 1 — Progressive Conversation Summarisation</strong></p>
<p>Messages 1-10: sent as raw conversation history. At message 11: first 8 messages compressed into summary block via Haiku (~$0.002). Messages 11+: compressed summary + last 3 raw messages only sent. Re-summarise every 8 messages. Input token count capped at ~4,000-5,000 tokens always. Cost impact: 50-message session drops from $9.90 to ~$1.20-1.80.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Optimisation 2 — Tiered Photo Compression</strong></p>
<p>First photo in session: 60% quality, max 1024px longest side. Follow-up photos (Stages 1-2): 50% quality, max 800px. Progress confirmation photos (Stage 3+): 40% quality, max 600px. Applied automatically. 40-60% reduction in photo token costs.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Optimisation 3 — Smart RAG Injection</strong></p>
<p>Stages 1-2 (Problem ID + Diagnosis): top 5 code chunks per message. Stages 3-5 (Guidance, Completion, Close): top 2 code chunks per message. F2 Report generation: 0 chunks. F3 Quote generation: 0 chunks. Saves 800-1,200 tokens per message in later stages.</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Optimisation 4 — Intelligent Model Routing</strong></p>
<p>Sonnet 4.5 (full diagnostic intelligence): Stage 1, Stage 2, Stage 4, F4 Code Lookup. Haiku (fast formatting and confirmations): Stage 3, Stage 5, F2 Report, F3 Quote, conversation summarisation. Cost impact: ~60% of messages route to Haiku (15x cheaper per token).</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>Optimisation 5 — Session Message Soft Cap at 30</strong></p>
<p>At message 28, Rex notifies worker about approaching session limit. Not a hard block. New linked session opens with compressed prior context pre-loaded. Caps worst-case API cost at approximately $2.50-3.50 per session.</p></td>
</tr>
</tbody>
</table>

**10. RAG CODE UPDATE PIPELINE --- TECHNICAL REQUIREMENT**

The RAG database powering Rex\'s code knowledge is a living resource. A lightweight ingestion pipeline is built in Week 7 of the development timeline alongside initial RAG database setup.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Input: New or revised code document (PDF)</p>
<p>Process: Admin ingestion script — chunks document, generates embeddings,</p>
<p>loads into Supabase pgvector code_chunks table</p>
<p>Output: Rex gains immediate access on next query — no app update or redeployment</p>
<p>Tracking: code_documents table — name, version, trade type, date ingested, source URL</p>
<p>Time: Under 30 minutes per document</p>
<p>Trigger: Manual — operator-initiated when new code version is published</p>
<p>Built: Week 7 of development timeline</p></td>
</tr>
</tbody>
</table>

**11. WHAT TRADESBRAIN IS NOT --- OUT OF SCOPE**

The following will not be built regardless of user requests. They are explicitly outside TradesBrain\'s product identity:

- GPS dispatch or routing tool

- Customer-facing booking platform

- Payment processing between professional and end customer

- Customer communication platform or messaging system

- Accounting or payroll system

- Inventory or supply chain management

- HR or hiring platform

- Social network or community forum

- Desktop or web application --- mobile only at launch. Desktop is a planned Phase 2 post-launch item.

- Competitor to ServiceTitan, Jobber, or Housecall Pro --- TradesBrain works on the job site, not in the back office

**12. COMPETITIVE POSITIONING**

|                               |                  |                           |                     |
|-------------------------------|------------------|---------------------------|---------------------|
| **Feature**                   | **TradesBrain**  | **ServiceTitan / Jobber** | **Generic ChatGPT** |
| Built for job site use        | Yes              | No                        | No                  |
| Photo + voice diagnosis       | Yes              | No                        | Partial             |
| Trade-specific AI (Rex)       | Yes              | No                        | No                  |
| Trade code knowledge base     | Yes              | No                        | Unreliable          |
| Job report generation         | Yes              | Manual                    | No                  |
| Quote generation              | Yes              | Manual forms              | No                  |
| Team management + KPIs        | Yes              | Yes (admin only)          | No                  |
| AI cost optimisation built-in | Yes              | N/A                       | No                  |
| Mobile-first design           | Yes              | Partial                   | Yes                 |
| Identity verification (KYC)   | Yes --- required | No                        | No                  |
| Setup time                    | Under 5 minutes  | Hours                     | None                |
| Monthly price (solo)          | \$69             | \$200-500                 | \$20                |

**13. SUCCESS METRICS --- YEAR 1**

**Quantitative**

- User growth: measurable increase in active subscribers quarter over quarter across US launch markets

- Geographic expansion: presence in minimum 5 US states by end of Q4

- Subscription conversion: free trial to paid conversion rate above 25%

- Monthly churn: below 3% on Solo and Pro plans

- Gross margin: maintained above 70% across all plans at all usage levels

- App Store rating: 4.3 stars or above maintained

**Qualitative --- The Real Measure**

Tradespeople who have used TradesBrain for 90 days or more say the following unprompted:

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>"Rex solved a problem on site I would have had to leave the job for."</p>
<p>"I finish jobs faster and my reports are done before I leave the driveway."</p>
<p>"My quotes are more accurate and I am charging more confidently."</p>
<p>"I recommended it to two other guys I know."</p></td>
</tr>
</tbody>
</table>

**14. LAUNCH PLAN --- PHASED**

**Phase 1 --- US Launch (Months 1-6)**

- English only --- iOS and Android

- Solo and Pro plans active at launch

- Plumber and Electrician trade profiles (Rex)

- Target: first 500 paying subscribers

- Distribution: organic --- Reddit trade communities, LinkedIn, TikTok job site content, trade association outreach

**Phase 2 --- Team Plan + US Expansion (Months 6-12)**

- Team plan launched with per-seat pricing

- Additional US states targeted through geo-specific SEO and trade school partnerships

- Target: 1,400 paying subscribers across all plans (path to \$1M ARR)

**Phase 3 --- International Expansion + Desktop (Year 2)**

- UK market first --- same app, UK building regulations code database, English language

- Italy, France, Germany follow with localised UI and code databases

- Each new market triggered by existing RAG pipeline --- no new infrastructure required

- Desktop version planning begins after mobile launch and market validation

- Fine-tuned Rex model development begins using accumulated conversation data

**15. TECHNICAL STACK --- SUMMARY**

Full detail in D4 --- Technical Architecture Document.

|                                               |                                                                          |
|-----------------------------------------------|--------------------------------------------------------------------------|
| **Layer**                                     | **Technology**                                                           |
| Mobile App                                    | React Native + Expo SDK 52 + TypeScript                                  |
| Styling                                       | NativeWind (Tailwind for React Native)                                   |
| Navigation                                    | React Navigation v6                                                      |
| Backend / Database                            | Supabase (PostgreSQL + pgvector + Auth + Storage + Edge Functions)       |
| Voice Transcription                           | OpenAI Whisper API (whisper-1)                                           |
| AI Intelligence --- Diagnostics + Code Lookup | Anthropic Claude API --- claude-sonnet-4-5-20250929                      |
| AI Intelligence --- Formatting + Summaries    | Anthropic Claude API --- claude-haiku-4-5-20251001                       |
| Model Routing                                 | Custom routing function in API service layer --- built day one           |
| Conversation Summarisation                    | Claude Haiku --- rolling window every 8 messages --- built day one       |
| Code Knowledge (RAG)                          | Supabase pgvector + OpenAI text-embedding-3-small                        |
| Photo Compression                             | Tiered by session stage via expo-image-picker settings --- built day one |
| KYC Verification                              | Stripe Identity API (primary)                                            |
| Payments                                      | Stripe (subscriptions + per-seat billing)                                |
| Push Notifications                            | Expo Push Notifications                                                  |
| Secure Credential Storage                     | Expo SecureStore (iOS Keychain / Android Keystore)                       |
| Email Delivery                                | Resend                                                                   |
| PDF Generation                                | react-pdf                                                                |
| Build and Deployment                          | Expo EAS                                                                 |

**16. DOCUMENT STATUS**

|                                                      |                                                                                       |
|------------------------------------------------------|---------------------------------------------------------------------------------------|
| **Document**                                         | **Status**                                                                            |
| D1 --- Product Requirements Document (this document) | v1.2 --- Official and Locked --- Updated April 2026 (Section 6 clarifying note added) |
| D2 --- User Flow Diagrams                            | v1.0 --- Locked                                                                       |
| D3 --- Feature Specifications                        | v1.0 --- Locked                                                                       |
| D4 --- Technical Architecture Document               | v1.0 --- Locked                                                                       |
| D5 --- Database and Data Model                       | v1.0 --- Locked                                                                       |
| D6 --- UI Wireframes (Flows 01-12)                   | Complete --- All 13 flows delivered and locked                                        |
| D7 --- AI System Prompts                             | v2.0 --- Locked --- All 4 trade profiles                                              |
| D8 --- Test Plan and QA Checklist                    | v1.0 --- Locked --- 232 test cases                                                    |
| D9 --- Stripe Integration Specification              | v1.0 --- Locked                                                                       |
| D10 --- Supabase Edge Functions                      | v1.0 --- Locked --- All 11 Edge Functions                                             |

|                                                                                                        |
|--------------------------------------------------------------------------------------------------------|
| TradesBrain --- D1 Product Requirements Document --- v1.2 --- Official --- April 2026 --- Confidential |
