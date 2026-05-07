**TRADESBRAIN**

D3 --- Feature Specifications

*Complete feature-by-feature specifications for all 8 TradesBrain features*

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Version: 1.0 — Official and Locked</p>
<p>Date: April 2026</p>
<p>Depends on: D1 PRD v1.2, D2 User Flows v1.0</p>
<p>Audience: Claude Code, QA, design review</p>
<p>Confidentiality: Confidential — Internal use only</p></td>
</tr>
</tbody>
</table>

**F1 --- AI DIAGNOSTIC (REX CORE)**

Rex is the AI co-pilot that guides the worker through a job site problem from identification to resolution. All inputs are photo and voice. Rex adapts to worker pace and stage.

**Five-Stage Protocol**

|           |                                  |                                                        |                                              |                                                                      |
|-----------|----------------------------------|--------------------------------------------------------|----------------------------------------------|----------------------------------------------------------------------|
| **Stage** | **Name**                         | **Rex role**                                           | **Worker action**                            | **Contextual buttons**                                               |
| **1**     | Problem Identification           | Asks worker to show and describe the problem           | Photo + voice description                    | Take photo, Describe problem, Close job                              |
| **2**     | Analysis and Diagnosis           | Analyses photo + description, identifies root cause    | Confirm or add more context                  | Confirm diagnosis, Add photos, Skip to repair, Close job             |
| **3**     | Step-by-Step Guidance            | Delivers repair steps one at a time                    | Confirm each step, ask questions, add photos | Step done, Photo this step, Need clarification, Close job            |
| **4**     | Completion and Final Examination | Guides final inspection and function test              | Confirm final check, provide photo           | All good, Issue found, Close job                                     |
| **5**     | Close and Post-Job               | Summarises job, calculates time on site, prompts close | Tap Close Job, name the job                  | Close job, Generate report (after save), Generate quote (after save) |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULE</strong></p>
<p>Worker can skip any stage at any time — Rex adapts immediately without resistance.</p>
<p>Report and Quote buttons appear ONLY after Close Job is tapped and job is saved.</p>
<p>Close Job button always visible from Stage 1 onward — never hidden.</p>
<p>Input bar dims while Rex streams a response — re-activates when Rex finishes.</p>
<p>Session soft cap: warning at message 28. New linked session prompt at message 30.</p>
<p>Compass icon (V3) used as Rex avatar in all message bubbles and working tool screens.</p>
<p>Stage progress strip shows completed stages (green check) and active stage (blue).</p></td>
</tr>
</tbody>
</table>

**F2 --- JOB REPORT GENERATION**

Workers generate professional job reports via two paths. Both paths produce a locked PDF stored in Supabase, saved to Job History, and accessible for download and sharing.

**Path A --- From Closed Rex Session**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Trigger: Worker taps Generate Report after closing a Rex session.</p>
<p>Context: Rex has full session data — diagnosis, steps, materials, time on site.</p>
<p>Step 1: Rex confirms job context is loaded.</p>
<p>Step 2: Worker records a brief voice summary of the work done.</p>
<p>Step 3: Section preferences shown (first time only) — saved permanently after.</p>
<p>Step 4: Worker taps Generate Report.</p>
<p>Step 5: Rex generates draft — all sections editable before confirming.</p>
<p>Step 6: Worker sets confirmed payment amount (Rex shows suggested range).</p>
<p>Step 7: Worker taps Confirm — report permanently locked. PDF generated.</p>
<p>Step 8: Download, Share, View available. Quote prompt shown.</p></td>
</tr>
</tbody>
</table>

**Path B --- Standalone (Report Tab)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Trigger: Worker taps Report tab with no active Rex session.</p>
<p>Context: Rex has no prior session data.</p>
<p>Step 1: Rex asks worker to describe the full job by voice.</p>
<p>Step 2: Rex asks follow-up questions to fill missing details (client, address, etc).</p>
<p>Step 3: Worker names the job before generating.</p>
<p>Step 4: Section preferences shown (first time only) — saved permanently after.</p>
<p>Step 5: Worker taps Generate Report.</p>
<p>Step 6: Rex generates draft — all sections editable before confirming.</p>
<p>Step 7: Worker sets confirmed payment amount.</p>
<p>Step 8: Confirm permanently locks report. PDF generated. New archive entry created.</p></td>
</tr>
</tbody>
</table>

**Section Management**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>FIRST TIME GENERATION:</p>
<p>Section picker shown. Worker selects sections. Saved permanently as default preference.</p>
<p>Default sections: Job description, Work carried out, Materials used, Time on site,</p>
<p>Recommendations, Photo documentation.</p>
<p>SUBSEQUENT GENERATIONS:</p>
<p>Saved preference applied automatically. Section picker not shown again.</p>
<p>ADDING A CUSTOM SECTION (Voice + Manual):</p>
<p>Method A — Voice: hold mic, dictate section name. Rex creates and populates content.</p>
<p>Method B — Manual: tap Add section button, type section name. Rex populates content.</p>
<p>All custom sections editable before confirming. Tagged with custom badge in draft.</p>
<p>Worker can drag to reorder ALL sections before confirming.</p>
<p>EDITING SECTIONS AND LINE ITEMS:</p>
<p>Free-text sections: worker edits full text inline via Edit tap target.</p>
<p>Line item sections: tap any row to edit name, qty, unit cost inline. Total auto-calculates.</p>
<p>+ Add line item appends a new blank editable row.</p>
<p>Swipe left on any line item to reveal delete option.</p>
<p>CONFIRMING AND DISCARD:</p>
<p>Worker taps Confirm — warning shown: permanently locks all sections.</p>
<p>Once confirmed: all sections and line items are permanently read-only. No exceptions.</p>
<p>Database trigger enforces the lock at the database level.</p>
<p>DISCARD RULE: Any report or quote not confirmed is automatically discarded on exit.</p>
<p>It is never saved, never archived, never shown in Job Detail or History.</p>
<p>When worker navigates away without confirming, a single prompt appears:</p>
<p>"This document has not been confirmed. It will be discarded if you leave."</p>
<p>Two options: Confirm and generate PDF (primary) — Discard (secondary).</p>
<p>Only confirmed locked documents are ever archived. No drafts reach the archive.</p>
<p>APPLIES TO: Both Path A and Path B. Both Reports and Quotes.</p></td>
</tr>
</tbody>
</table>

**Report Versioning**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Multiple reports per job session stored as Report 1, Report 2, etc.</p>
<p>Each version permanently locked on confirmation.</p>
<p>All versions accessible in Job Detail — Report tab.</p>
<p>Worker generates a new version by tapping Generate Report N from Job Detail.</p>
<p>Previous confirmed versions are never affected by new generation.</p></td>
</tr>
</tbody>
</table>

**Archive and Job Detail**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Only confirmed, locked reports appear in Job Detail — Reports tab.</p>
<p>Only confirmed, locked quotes appear in Job Detail — Quotes tab.</p>
<p>Draft documents that were not confirmed never appear in History or Job Detail.</p>
<p>Worker can generate a new report or quote from Job Detail at any time.</p>
<p>Confirmed documents: View, Download, Share only. Never editable after confirmation.</p></td>
</tr>
</tbody>
</table>

**PDF Contents**

|                              |                                                      |                             |
|------------------------------|------------------------------------------------------|-----------------------------|
| **Field**                    | **Source**                                           | **Editable before confirm** |
| **Worker name**              | User profile --- auto-populated                      | No                          |
| **Trade type**               | User profile --- auto-populated                      | No                          |
| **VAT number**               | User profile --- shown if toggle on                  | Toggle only                 |
| **License number**           | User profile --- shown if toggle on                  | Toggle only                 |
| **Company name + logo**      | User profile --- if provided                         | No                          |
| **Date**                     | System --- auto-populated                            | No                          |
| **Job description**          | Rex generated --- worker editable                    | Yes                         |
| **Work carried out**         | Rex generated --- worker editable                    | Yes                         |
| **Materials used**           | Rex generated --- worker editable                    | Yes                         |
| **Time on site**             | System --- calculated from session timestamps        | No                          |
| **Custom sections**          | Rex generated from context --- worker editable       | Yes                         |
| **Confirmed payment amount** | Worker sets final amount (Rex shows suggested range) | Yes (before confirm only)   |

**F3 --- QUOTE GENERATOR**

Workers generate professional quotes via the same two paths as reports. Identical section management, discard, and archival rules apply.

**Path A --- From Closed Rex Session**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Rex reuses all data from the report if one was already generated for this job.</p>
<p>Worker does not re-enter data Rex already has.</p>
<p>Rex asks only for missing quote-specific details (markup preference, payment method).</p>
<p>Worker reviews line items, sets confirmed total, confirms.</p></td>
</tr>
</tbody>
</table>

**Path B --- Standalone (Quote Tab)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Rex asks worker to describe the job scope and materials by voice.</p>
<p>Rex asks follow-up questions for missing details.</p>
<p>Worker names the job. Rex generates line-item quote draft.</p>
<p>Worker reviews, edits, sets confirmed total, confirms.</p></td>
</tr>
</tbody>
</table>

**Section Management and Discard**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Identical logic to F2 Report section management.</p>
<p>Quote section preferences are INDEPENDENT from report section preferences.</p>
<p>DEFAULT QUOTE SECTIONS:</p>
<p>1. Line items</p>
<p>2. Labour</p>
<p>3. Materials</p>
<p>4. Payment terms</p>
<p>5. Payment method (select input — Cash, Bank transfer, Bank direct debit,</p>
<p>Cheque, Online payment link, To be agreed — multiple selection)</p>
<p>6. Validity period</p>
<p>7. Notes</p>
<p>DISCARD RULE (same as F2):</p>
<p>Any quote not confirmed is automatically discarded on exit.</p>
<p>Only confirmed locked quotes appear in Job Detail and History.</p>
<p>Worker is prompted on exit: Confirm now or Discard.</p>
<p>No draft quotes are ever saved to the archive.</p></td>
</tr>
</tbody>
</table>

**Quote Calculation Logic**

|                           |                                                                                   |                       |
|---------------------------|-----------------------------------------------------------------------------------|-----------------------|
| **Field**                 | **Source**                                                                        | **Editable**          |
| **Line items**            | Rex generates from materials --- worker edits name, qty, unit cost per row inline | Yes --- per row       |
| **Labour hours**          | Rex estimates from session duration --- worker edits hours and rate               | Yes                   |
| **Hourly rate**           | Worker profile rate --- pre-populated                                             | Yes (this quote only) |
| **Line item total**       | Auto-calculated: qty × unit cost                                                  | Auto only             |
| **Suggested total range** | Rex calculates min/max --- display only                                           | No                    |
| **Confirmed total**       | Worker sets final amount freely                                                   | Yes (before confirm)  |
| **Payment terms**         | Worker default from preferences --- editable per quote                            | Yes                   |
| **Payment method**        | Select input --- worker chooses from defined options --- multiple selection       | Yes (before confirm)  |
| **Validity period**       | Default 30 days --- worker editable                                               | Yes                   |

**Quote Versioning**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Versioned as Quote 1, Quote 2 per job session.</p>
<p>Each version permanently locked on confirmation.</p>
<p>New versions generated from Job Detail — Quotes tab.</p>
<p>Previous confirmed versions never affected.</p></td>
</tr>
</tbody>
</table>

**F4 --- TRADE CODE LOOKUP**

Worker submits a plain language voice or text query. Rex searches the RAG vector database and returns the relevant code section with citation and plain English explanation.

**Input methods**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Voice: worker holds mic, speaks question in plain language.</p>
<p>Text: worker types query directly.</p>
<p>Compass icon used as Rex avatar throughout — consistent with all working tool screens.</p></td>
</tr>
</tbody>
</table>

**Response format**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Plain language answer always first — never lead with raw code text.</p>
<p>Code section number and document name cited (e.g. IPC 2021 Section 704.1).</p>
<p>AHJ verification note always appended at end of every response.</p>
<p>Worker can tap section citation to see full code text with table if applicable.</p>
<p>If Rex uncertain of section number: explicitly states uncertainty — never fabricates.</p></td>
</tr>
</tbody>
</table>

**Temporary trade type switch**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Worker registered as one trade can switch trade type within Codes screen only.</p>
<p>Switch is temporary — applies to this query session only. Reverts on exit.</p>
<p>Rex session and all other features always use registered trade profile.</p></td>
</tr>
</tbody>
</table>

**F5 --- JOB HISTORY**

All confirmed closed job sessions with at least one confirmed document are stored in History. Only confirmed documents appear. No drafts. No incomplete sessions.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>LOCKED RULE</strong></p>
<p>Only confirmed, locked reports and quotes appear in Job Detail and History.</p>
<p>Draft documents are automatically discarded on exit — never archived.</p>
<p>History is a record of completed, confirmed work only.</p></td>
</tr>
</tbody>
</table>

|                          |                                                                                       |
|--------------------------|---------------------------------------------------------------------------------------|
| **Element**              | **Behaviour**                                                                         |
| **Job cards**            | Reverse chronological. Show job name, date, status, trade type.                       |
| **Job name**             | Only editable field after archiving. Tap to edit inline.                              |
| **Job detail**           | Opens Job Detail screen with four tabs: Rex Conversation, Reports, Quotes, Photos.    |
| **Reports tab**          | All confirmed versioned reports. View, Download, Share. Generate new version button.  |
| **Quotes tab**           | All confirmed versioned quotes. View, Download, Share. Generate new version button.   |
| **Photos tab**           | All session photos in grid. Expandable with stage label and session caption.          |
| **Reopen session**       | Worker can reopen any closed session from Rex Conversation tab.                       |
| **Delete job**           | Confirmation required. Deletes session, all messages, all confirmed docs, all photos. |
| **Search**               | Worker can search by job name or date range.                                          |
| **Expired subscription** | History fully browsable in read-only mode. PDFs still downloadable.                   |

**F6 --- SUBSCRIPTION AND PAYWALL**

Subscription management, trial logic, and paywall intercept.

|                     |                                |                      |                   |                               |
|---------------------|--------------------------------|----------------------|-------------------|-------------------------------|
| **Plan**            | **Monthly**                    | **Annual (20% off)** | **Seats**         | **Notes**                     |
| **Solo**            | \$69/month                     | \$55.20/month        | 1                 | Single professional           |
| **Pro**             | \$120/month                    | \$96/month           | 1                 | Priority + enhanced reporting |
| **Team base**       | \$260/month                    | \$208/month          | 3 (owner + 2)     | Team collaboration            |
| **Additional seat** | \$89/month                     | \$71.20/month        | Per seat beyond 3 | Team plan only                |
| **Free trial**      | 10 queries global lifetime cap | ---                  | All plans         | No credit card required       |

**Trial query counter --- three visual states**

|                  |                       |                   |                                           |
|------------------|-----------------------|-------------------|-------------------------------------------|
| **State**        | **Queries remaining** | **Banner colour** | **Subscribe CTA**                         |
| **Active trial** | 10 to 3               | Blue --- passive  | Subscribe button always visible in banner |
| **Urgent trial** | 2 to 1                | Orange --- urgent | Subscribe now --- prominent               |
| **Trial ended**  | 0                     | Paywall modal     | Full paywall intercepts next feature tap  |

**Paywall modal**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Bottom sheet modal — home screen dims behind it.</p>
<p>Three plan cards: Solo, Pro, Team with correct pricing.</p>
<p>Annual/monthly toggle with 20% saving badge.</p>
<p>Solo plan pre-selected as default CTA.</p>
<p>Browse app in read-only mode link — History accessible, features blocked.</p>
<p>KYC gate checked before Stripe checkout opens.</p></td>
</tr>
</tbody>
</table>

**F7 --- ONBOARDING AND PROFILE**

Three-step sign-up flow. KYC verification before paid subscription. Profile fields locked after verification.

**Sign-up steps**

|                                 |                                                                                                                |                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| **Step**                        | **Fields**                                                                                                     | **Notes**                                              |
| **Step 1 --- Account basics**   | Full name, email, password, phone (country code), hourly rate, VAT number, company name (optional)             | VAT number locked after account creation               |
| **Step 2 --- Trade profile**    | Trade type, account type (solopreneur/team owner), license number, license proof photo, national ID (optional) | License number and proof locked after KYC verified     |
| **Step 3 --- Review and terms** | Summary review, Terms and Conditions acceptance, OTP triggers on Create Account tap                            | Both email and SMS OTP required before account created |

**Terms and Conditions flow**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Read Terms button in Step 3 — opens full screen scrollable overlay.</p>
<p>9 sections covering eligibility, AI content, KYC, billing, trial, data, acceptable use, governing law.</p>
<p>Accept button at bottom pre-ticks checkbox in Step 3.</p>
<p>Checkbox cannot be ticked without going through Terms overlay first.</p>
<p>Create Account button disabled until checkbox ticked.</p>
<p>Full Terms content to be completed post-build.</p></td>
</tr>
</tbody>
</table>

**OTP verification states**

|                         |                                                                   |
|-------------------------|-------------------------------------------------------------------|
| **State**               | **Behaviour**                                                     |
| **Pending**             | Both email and SMS inputs empty. Verify button disabled.          |
| **Email verified only** | Email boxes green. SMS still pending. Verify disabled.            |
| **Both verified**       | All boxes green. Verify Account button activates.                 |
| **Wrong code**          | Boxes turn red. Error message. Resend option immediately visible. |
| **Expired**             | Error hint --- codes expire after 10 minutes. Resend available.   |

**F8 --- TEAM MANAGEMENT**

Team plan owners create and manage technician accounts. Owner has read-only view of all team activity.

|                                   |                     |                                                                                    |
|-----------------------------------|---------------------|------------------------------------------------------------------------------------|
| **Action**                        | **Who can perform** | **Notes**                                                                          |
| **Create team member account**    | Owner only          | Owner fills all fields. System creates Auth user, sends SMS and email credentials. |
| **Delete team member account**    | Owner only          | Permanent. Cascades deletion of all member data.                                   |
| **View team member job data**     | Owner --- read only | All sessions, reports, quotes visible. Owner cannot edit member content.           |
| **Change team member trade type** | Owner cannot        | Member manages own trade type in their Settings.                                   |
| **Sign in as team member**        | Never               | Owner never logs into member accounts. No exceptions.                              |
| **Downgrade from Team to Solo**   | Owner               | Requires typing DELETE. Permanently deletes all team data.                         |
| **Add seat beyond base 3**        | Owner               | \$89/month per additional tech. Updates Stripe subscription automatically.         |

*TradesBrain --- D3 Feature Specifications --- v1.0 --- Official --- April 2026 --- Confidential*
