**TRADESBRAIN**

D4 --- Technical Architecture Document

*The complete technical blueprint for building the TradesBrain mobile app*

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Version: 1.0 — Locked</p>
<p>Date: April 17, 2026</p>
<p>Depends on: D1 PRD v1.2, D2 User Flows v1.0, D3 Feature Specs v1.0</p>
<p>Audience: Claude Code (primary), technical review</p>
<p>Platform: Mobile app — iOS and Android. Desktop Phase 2 post-launch.</p>
<p>Confidentiality: Confidential — Internal use only</p></td>
</tr>
</tbody>
</table>

**1. FULL TECHNOLOGY STACK**

Every technology used in TradesBrain with version, role, and rationale. This stack is locked --- no substitutions without updating this document.

|                         |                       |                            |                                                         |
|-------------------------|-----------------------|----------------------------|---------------------------------------------------------|
| **Layer**               | **Technology**        | **Version**                | **Role**                                                |
| **Mobile framework**    | React Native + Expo   | SDK 52                     | Cross-platform iOS and Android from single codebase     |
| **Language**            | TypeScript            | 5.x                        | Type safety across all files --- no plain JavaScript    |
| **Styling**             | NativeWind            | 4.x                        | Tailwind utility classes for React Native               |
| **Navigation**          | React Navigation      | v6                         | Stack and tab navigation                                |
| **State --- local**     | useState / useReducer | Built-in                   | Component-level UI state                                |
| **State --- global**    | React Context API     | Built-in                   | Auth, subscription status, trade profile                |
| **Backend / Database**  | Supabase              | Latest                     | PostgreSQL + pgvector + Auth + Storage + Edge Functions |
| **Voice recording**     | expo-av               | Latest                     | Microphone access and .m4a audio recording              |
| **Camera**              | expo-image-picker     | Latest                     | Native camera and photo library access                  |
| **Voice transcription** | OpenAI Whisper API    | whisper-1                  | Audio file to text transcript                           |
| **AI --- diagnostics**  | Anthropic Claude API  | claude-sonnet-4-5-20250929 | Rex diagnostic, code lookup, complex reasoning          |
| **AI --- formatting**   | Anthropic Claude API  | claude-haiku-4-5-20251001  | Reports, quotes, summaries, step confirmations          |
| **Embeddings**          | OpenAI Embeddings API | text-embedding-3-small     | Query and document vectors for RAG                      |
| **Vector search**       | Supabase pgvector     | Built-in                   | Semantic similarity search on code chunks               |
| **PDF generation**      | react-pdf             | Latest                     | Job report and quote PDF creation                       |
| **Payments**            | Stripe SDK            | Latest                     | Subscriptions, per-seat billing, Apple/Google Pay       |
| **KYC**                 | Stripe Identity API   | Latest                     | National ID and license proof verification              |
| **Email**               | Resend                | Latest                     | OTP emails, transactional notifications                 |
| **Build / deploy**      | Expo EAS              | Latest                     | iOS and Android builds and OTA updates                  |

**2. APPLICATION FOLDER STRUCTURE**

Every directory and file follows this structure. Claude Code creates this before writing any feature. Deviating from this structure makes the codebase unmaintainable.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>tradesbrain/</p>
<p>├── app/ # Screens — one file per screen</p>
<p>│ ├── (auth)/</p>
<p>│ │ ├── welcome.tsx</p>
<p>│ │ ├── signup.tsx</p>
<p>│ │ ├── signin.tsx</p>
<p>│ │ └── otp-verify.tsx</p>
<p>│ ├── (tabs)/</p>
<p>│ │ ├── home.tsx</p>
<p>│ │ ├── rex.tsx # AI Diagnostic entry</p>
<p>│ │ ├── report.tsx # Standalone Path B</p>
<p>│ │ ├── quote.tsx # Standalone Path B</p>
<p>│ │ ├── codes.tsx # Trade code lookup</p>
<p>│ │ └── history.tsx</p>
<p>│ ├── job/</p>
<p>│ │ ├── [sessionId].tsx # Active Rex session</p>
<p>│ │ └── detail/[jobId].tsx # Job detail with tabs</p>
<p>│ ├── settings/</p>
<p>│ │ ├── index.tsx</p>
<p>│ │ ├── profile.tsx</p>
<p>│ │ ├── trade.tsx</p>
<p>│ │ ├── team.tsx # Team plan only</p>
<p>│ │ ├── subscription.tsx</p>
<p>│ │ └── legal.tsx</p>
<p>│ └── paywall.tsx</p>
<p>├── components/</p>
<p>│ ├── rex/</p>
<p>│ │ ├── MessageBubble.tsx</p>
<p>│ │ ├── VoiceRecordButton.tsx</p>
<p>│ │ ├── PhotoCapture.tsx</p>
<p>│ │ ├── ContextualButtons.tsx # Stage-aware dynamic buttons</p>
<p>│ │ └── StreamingText.tsx # Word-by-word display</p>
<p>│ ├── documents/</p>
<p>│ │ ├── ReportPreview.tsx</p>
<p>│ │ └── QuotePreview.tsx</p>
<p>│ ├── shared/</p>
<p>│ │ ├── SubscriptionGate.tsx # Wraps ALL feature entry points</p>
<p>│ │ ├── LoadingSpinner.tsx</p>
<p>│ │ ├── ErrorBoundary.tsx</p>
<p>│ │ └── ToastNotification.tsx</p>
<p>│ └── team/</p>
<p>│ ├── KpiDashboard.tsx</p>
<p>│ └── MemberCard.tsx</p>
<p>├── services/ # All external API calls</p>
<p>│ ├── anthropic.ts # Claude API — all calls here</p>
<p>│ ├── openai.ts # Whisper + Embeddings</p>
<p>│ ├── supabase.ts # DB client + all operations</p>
<p>│ ├── stripe.ts # Stripe SDK</p>
<p>│ ├── rag.ts # RAG retrieval</p>
<p>│ ├── router.ts # MODEL ROUTER (optimization)</p>
<p>│ └── summariser.ts # CONVERSATION SUMMARISER (optimization)</p>
<p>├── hooks/</p>
<p>│ ├── useAuth.ts</p>
<p>│ ├── useSubscription.ts</p>
<p>│ ├── useRexSession.ts # Full session lifecycle</p>
<p>│ ├── useVoiceRecording.ts</p>
<p>│ └── usePhotoCapture.ts</p>
<p>├── context/</p>
<p>│ ├── AuthContext.tsx</p>
<p>│ ├── SubscriptionContext.tsx</p>
<p>│ └── TradeProfileContext.tsx</p>
<p>├── utils/</p>
<p>│ ├── imageCompression.ts # TIERED PHOTO COMPRESSION (optimization)</p>
<p>│ ├── ragInjector.ts # SMART RAG INJECTION (optimization)</p>
<p>│ ├── tokenEstimator.ts</p>
<p>│ └── formatters.ts</p>
<p>├── types/</p>
<p>│ ├── session.ts</p>
<p>│ ├── user.ts</p>
<p>│ ├── documents.ts</p>
<p>│ └── subscription.ts</p>
<p>├── constants/</p>
<p>│ ├── api.ts</p>
<p>│ ├── limits.ts # SESSION_SOFT_CAP = 30</p>
<p>│ ├── pricing.ts</p>
<p>│ └── tradeProfiles.ts</p>
<p>└── assets/</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ARCHITECTURAL RULE</strong></p>
<p>All external API calls go through /services only. Screens never call APIs directly.</p>
<p>Every service file has one responsibility — one external service per file.</p>
<p>router.ts and summariser.ts must be built before any Rex session feature.</p>
<p>SubscriptionGate.tsx wraps every feature entry point without exception.</p></td>
</tr>
</tbody>
</table>

**3. AI COST OPTIMIZATION LAYER**

The five optimizations are architectural components of the API service layer. Built before Rex session UI. Every Claude API call passes through this layer.

**3.1 --- Model Router (services/router.ts)**

First function called in every Claude API request. Assigns Sonnet 4.5 or Haiku before the call is made.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>type MessageContext = {</p>
<p>sessionStage: 1 | 2 | 3 | 4 | 5;</p>
<p>messageType: 'diagnosis'|'confirmation'|'formatting'|'summary'|'lookup';</p>
<p>};</p>
<p>export function routeModel(ctx: MessageContext): string {</p>
<p>// Sonnet 4.5 — complex reasoning</p>
<p>if (ctx.sessionStage &lt;= 2) return 'claude-sonnet-4-5-20250929';</p>
<p>if (ctx.sessionStage === 4) return 'claude-sonnet-4-5-20250929';</p>
<p>if (ctx.messageType === 'lookup') return 'claude-sonnet-4-5-20250929';</p>
<p>if (ctx.messageType === 'diagnosis') return 'claude-sonnet-4-5-20250929';</p>
<p>// Haiku — formatting and confirmations (~15x cheaper)</p>
<p>return 'claude-haiku-4-5-20251001';</p>
<p>}</p></td>
</tr>
</tbody>
</table>

**3.2 --- Conversation Summariser (services/summariser.ts)**

Triggered when message count exceeds 10. Compresses older history via Haiku. Caps input tokens at \~2,000 regardless of session length.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export async function compressHistory(messages: Message[]) {</p>
<p>const toCompress = messages.slice(0, -3); // all except last 3</p>
<p>const recent = messages.slice(-3); // preserve last 3 raw</p>
<p>const summary = await callHaiku({</p>
<p>prompt: 'Summarise this job site conversation in 3-5 sentences.',</p>
<p>messages: toCompress</p>
<p>});</p>
<p>// Next call input: ~800 summary tokens + ~1200 recent = ~2000 total</p>
<p>// vs ~15,000+ tokens raw at message 25</p>
<p>return { summary, recentMessages: recent };</p>
<p>}</p></td>
</tr>
</tbody>
</table>

**3.3 --- Tiered Photo Compression (utils/imageCompression.ts)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export function getCompressionSettings(stage: number) {</p>
<p>if (stage &lt;= 1) return { quality: 0.6, maxDimension: 1024 };</p>
<p>if (stage === 2) return { quality: 0.5, maxDimension: 800 };</p>
<p>return { quality: 0.4, maxDimension: 600 }; // stages 3-5</p>
<p>}</p>
<p>// Called in usePhotoCapture before base64 encoding</p></td>
</tr>
</tbody>
</table>

**3.4 --- Smart RAG Injector (utils/ragInjector.ts)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export function getRAGChunkCount(stage: number, messageType: string): number {</p>
<p>if (messageType === 'report' || messageType === 'quote') return 0;</p>
<p>if (stage &lt;= 2) return 5; // diagnosis — full context</p>
<p>return 2; // execution — minimal context</p>
<p>}</p></td>
</tr>
</tbody>
</table>

**3.5 --- Session Soft Cap (constants/limits.ts)**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export const SESSION_SOFT_CAP = 30;</p>
<p>export const SESSION_WARNING_AT = 28;</p>
<p>// In useRexSession.ts:</p>
<p>if (messageCount &gt;= SESSION_WARNING_AT) {</p>
<p>showWarning('Approaching session limit — Rex will summarise soon.');</p>
<p>}</p>
<p>if (messageCount &gt;= SESSION_SOFT_CAP) {</p>
<p>promptNewLinkedSession(); // new session with compressed context pre-loaded</p>
<p>}</p></td>
</tr>
</tbody>
</table>

**4. CRITICAL DATA FLOWS**

**4.1 --- Rex Diagnostic Request Flow**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>STEP 1 — Input capture</p>
<p>expo-image-picker → photo → imageCompression.ts (stage-aware) → base64</p>
<p>expo-av → .m4a → Whisper API → transcript → worker edits if needed</p>
<p>STEP 2 — Pre-call checks (useRexSession)</p>
<p>Check subscription_status → if blocked, show paywall</p>
<p>Check trial_queries_remaining → if 0, show paywall</p>
<p>Check message count → if &gt;= 28, show soft cap warning</p>
<p>Check if compression needed (messages &gt; 10) → call summariser.ts</p>
<p>STEP 3 — RAG retrieval (rag.ts)</p>
<p>Message text → OpenAI text-embedding-3-small → query vector</p>
<p>Supabase pgvector → match_documents() RPC → top N chunks</p>
<p>N from ragInjector.ts based on current stage</p>
<p>STEP 4 — Model routing</p>
<p>Current stage + type → routeModel() → Sonnet 4.5 or Haiku</p>
<p>STEP 5 — Claude API call (via Supabase Edge Function proxy)</p>
<p>system: Rex trade system prompt</p>
<p>messages: [compressed summary + last 3 raw + current message]</p>
<p>RAG context injected as system prompt addendum</p>
<p>stream: true, max_tokens: 2000</p>
<p>STEP 6 — Streaming response</p>
<p>Server-sent events → React state updated per chunk → progressive display</p>
<p>STEP 7 — Post-call</p>
<p>trial_queries_remaining decremented via Edge Function</p>
<p>Message pair saved to Supabase messages table</p>
<p>Photo stored in Supabase Storage → URL in message record</p></td>
</tr>
</tbody>
</table>

**4.2 --- Subscription Gate Flow**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>STEP 1 — Feature button tapped</p>
<p>SubscriptionGate reads subscription_status + trial_queries_remaining from Context</p>
<p>STEP 2 — Decision</p>
<p>active subscription → pass through immediately</p>
<p>trial_queries_remaining = 0 AND no subscription → paywall modal</p>
<p>subscription expired → paywall modal</p>
<p>STEP 3 — Paywall (if triggered)</p>
<p>Worker selects plan → KYC check:</p>
<p>Both national_id AND license = verified → Stripe checkout</p>
<p>Either pending/rejected → show specific document status</p>
<p>STEP 4 — Stripe checkout</p>
<p>Payment confirmed client-side → optimistic subscription_status = active</p>
<p>Worker returned to feature immediately</p>
<p>STEP 5 — Webhook (async)</p>
<p>Stripe → Supabase Edge Function handle-stripe-webhook</p>
<p>Verifies signature → updates users table</p></td>
</tr>
</tbody>
</table>

**4.3 --- RAG Code Update Pipeline**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>STEP 1 — Admin drops new PDF, runs ingestion script</p>
<p>node scripts/ingest-code-document.js --file nec2026.pdf --trade electrician</p>
<p>STEP 2 — Chunking</p>
<p>PDF text extracted page by page</p>
<p>Split into ~500-word chunks with 50-word overlap</p>
<p>Each chunk tagged: trade_type, document_name, version, section_number</p>
<p>STEP 3 — Embedding generation</p>
<p>Each chunk → OpenAI text-embedding-3-small → 1536-dim vector</p>
<p>Cost: ~$0.02 for entire NEC document</p>
<p>STEP 4 — Supabase insertion</p>
<p>Chunk + embedding + metadata → code_chunks table</p>
<p>code_documents table updated with ingestion record</p>
<p>Previous version chunks preserved — both coexist</p>
<p>Rex retrieves most relevant regardless of version</p>
<p>STEP 5 — Verification</p>
<p>Admin runs test query → confirms new sections appear in results</p>
<p>Total time: under 30 minutes</p></td>
</tr>
</tbody>
</table>

**5. SUPABASE ARCHITECTURE**

**5.1 --- Authentication**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Provider: Supabase Auth</p>
<p>Methods: Email + password, Google OAuth, Phone OTP (SMS)</p>
<p>Session: JWT stored in Expo SecureStore — never in AsyncStorage</p>
<p>OTP: Dual verification at sign-up — email AND SMS both required</p>
<p>Session refresh: Automatic via Supabase client library</p>
<p>Password: Minimum 8 chars — hashed by Supabase, never stored plain</p></td>
</tr>
</tbody>
</table>

**5.2 --- Row Level Security**

Every table has RLS enabled. Users can only access their own data --- enforced at database level regardless of client-side code.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>users: SELECT/UPDATE own row only (auth.uid() = id)</p>
<p>job_sessions: user_id = auth.uid()</p>
<p>messages: via job_sessions join — same user_id check</p>
<p>job_reports: linked to user's job sessions only</p>
<p>quotes: same as job_reports</p>
<p>code_chunks: SELECT only — all authenticated users (no user filter)</p>
<p>code_documents: SELECT only — all authenticated users</p>
<p>kyc-documents: strict — user and admin only via service role key</p>
<p>Team owner access:</p>
<p>Owner SELECTs team member data via team_members join where team_owner_id = auth.uid()</p>
<p>Owner cannot INSERT or UPDATE into team member rows — read only from admin side</p></td>
</tr>
</tbody>
</table>

**5.3 --- Edge Functions**

|                              |                        |                                                                          |
|------------------------------|------------------------|--------------------------------------------------------------------------|
| **Function**                 | **Trigger**            | **Purpose**                                                              |
| **handle-stripe-webhook**    | Stripe POST            | Verify signature. Update subscription_status, plan_type, end_date.       |
| **kyc-status-check**         | Before Stripe checkout | Check both KYC document statuses. Return combined result.                |
| **decrement-trial-query**    | After Claude API call  | Decrement trial_queries_remaining by 1. Prevents client manipulation.    |
| **ingest-code-document**     | Admin manual           | Chunk PDF, generate embeddings, insert into code_chunks.                 |
| **create-team-member**       | Owner creates account  | Create Auth user, assign temp password, link to owner, send credentials. |
| **delete-team-member**       | Owner deletes account  | Delete Auth user, cascade delete all related data.                       |
| **calculate-days-remaining** | Cancellation screen    | Return integer days between subscription_end_date and today.             |

**5.4 --- Storage Buckets**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>job-photos: Photos from Rex sessions. RLS: own sessions only.</p>
<p>Max: 10MB post-compression. Types: image/jpeg, image/png.</p>
<p>job-documents: Generated PDFs. RLS: own documents only.</p>
<p>Max: 5MB. Type: application/pdf.</p>
<p>kyc-documents: National ID and license proof. RLS: user + service role only.</p>
<p>Never exposed to Rex. Accessed only by KYC pipeline.</p>
<p>Max: 10MB. Types: image/jpeg, image/png, application/pdf.</p>
<p>profile-assets: Company logos. RLS: own logo only.</p>
<p>Max: 2MB. Types: image/jpeg, image/png, image/webp.</p></td>
</tr>
</tbody>
</table>

**6. API CALL PATTERNS AND RULES**

**6.1 --- API Keys Security**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>CRITICAL — NEVER DO THIS</strong></p>
<p>API keys are NEVER stored in the mobile app bundle.</p>
<p>NEVER in .env files shipped with the app.</p>
<p>NEVER in constants files. NEVER in client-side JavaScript.</p>
<p>ALL sensitive API calls (Anthropic, OpenAI, Stripe secret) go through</p>
<p>Supabase Edge Functions as secure proxy.</p>
<p>Mobile app calls Edge Function. Edge Function calls external API.</p>
<p>Keys live only in Supabase Edge Function environment variables.</p>
<p>Safe in app bundle: Stripe publishable key, Supabase anon key only.</p></td>
</tr>
</tbody>
</table>

**6.2 --- Standard Service Call Pattern**

Every function in /services follows this exact pattern --- typed response, standardised error object, never raw exceptions in screens.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export async function callService(params: Params): Promise&lt;Result&gt; {</p>
<p>try {</p>
<p>const response = await fetch(ENDPOINT, {</p>
<p>method: 'POST',</p>
<p>headers: { 'Content-Type': 'application/json' },</p>
<p>body: JSON.stringify(params)</p>
<p>});</p>
<p>if (!response.ok) throw new ServiceError(response.status);</p>
<p>const data = await response.json();</p>
<p>return { success: true, data };</p>
<p>} catch (error) {</p>
<p>logError('service-name', error);</p>
<p>return { success: false, error: normaliseError(error) };</p>
<p>}</p>
<p>}</p>
<p>// Screens receive { success, data/error } — never catch exceptions directly</p></td>
</tr>
</tbody>
</table>

**6.3 --- Streaming Response Pattern**

Used for Rex diagnostic responses and code lookup only. All other Claude calls are non-streaming.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export async function streamRexResponse(</p>
<p>payload: RexPayload,</p>
<p>onChunk: (text: string) =&gt; void,</p>
<p>onComplete: () =&gt; void</p>
<p>) {</p>
<p>const response = await fetch(EDGE_FUNCTION_URL, {</p>
<p>method: 'POST', body: JSON.stringify(payload)</p>
<p>});</p>
<p>const reader = response.body?.getReader();</p>
<p>const decoder = new TextDecoder();</p>
<p>while (true) {</p>
<p>const { done, value } = await reader.read();</p>
<p>if (done) { onComplete(); break; }</p>
<p>onChunk(decoder.decode(value)); // triggers React state update</p>
<p>}</p>
<p>}</p></td>
</tr>
</tbody>
</table>

**6.4 --- RAG Supabase RPC Pattern**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>export async function searchCodeChunks(</p>
<p>queryText: string,</p>
<p>tradeType: string,</p>
<p>limit: number</p>
<p>): Promise&lt;CodeChunk[]&gt; {</p>
<p>const embedding = await generateEmbedding(queryText);</p>
<p>const { data, error } = await supabase.rpc('match_documents', {</p>
<p>query_embedding: embedding,</p>
<p>filter_trade_type: tradeType,</p>
<p>match_count: limit</p>
<p>});</p>
<p>if (error) throw error;</p>
<p>return data as CodeChunk[];</p>
<p>}</p></td>
</tr>
</tbody>
</table>

**7. STATE MANAGEMENT STRATEGY**

|                      |                       |                                                              |                         |
|----------------------|-----------------------|--------------------------------------------------------------|-------------------------|
| **State type**       | **Technology**        | **What it holds**                                            | **Lifetime**            |
| **Component state**  | useState / useReducer | UI: loading, error, form fields, modals                      | Component lifetime      |
| **Session state**    | useRexSession hook    | Messages, photos, stage, message count, compression settings | Session screen lifetime |
| **Global state**     | React Context         | Auth, subscription status, trade profile, trial count        | App lifetime            |
| **Persistent state** | Supabase              | All sessions, messages, reports, quotes, profiles            | Permanent               |

**Three Global Contexts**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>AuthContext:</p>
<p>user object, JWT session, isAuthenticated</p>
<p>Populated on sign-in. Cleared on sign-out.</p>
<p>SubscriptionContext:</p>
<p>subscription_status, plan_type, trial_queries_remaining, subscription_end_date</p>
<p>Read by SubscriptionGate on every feature button tap.</p>
<p>Updated on Stripe webhook confirmation and query decrement.</p>
<p>TradeProfileContext:</p>
<p>trade_type (registered), hourly_rate, system_prompt_key</p>
<p>Updated when worker changes trade type in Settings.</p>
<p>Drives RAG filter and Rex system prompt selection.</p></td>
</tr>
</tbody>
</table>

**8. ERROR HANDLING STANDARDS**

|                              |                                                             |                                                             |
|------------------------------|-------------------------------------------------------------|-------------------------------------------------------------|
| **Failure**                  | **User sees**                                               | **System action**                                           |
| **No internet at feature**   | Clear offline message. Recording saved if applicable.       | Cache locally where possible. Retry indicator shown.        |
| **Whisper API fails**        | \'Could not transcribe --- type your description instead.\' | Audio preserved. Text input shown. Whisper retry available. |
| **Claude API timeout (30s)** | \'Taking longer than usual --- tap to retry.\'              | Message preserved. Same payload on retry.                   |
| **Claude API error (5xx)**   | \'Rex is unavailable right now --- try again in a moment.\' | Error logged to Supabase logs. Message queued.              |
| **Stripe payment fails**     | Stripe native error. Retry or different card.               | No subscription granted. No optimistic update.              |
| **KYC not yet verified**     | \'Under review --- usually under 24 hours.\'                | Poll status every 5 minutes. Notify when cleared.           |
| **Supabase connection lost** | Subtle offline banner.                                      | Local state preserved. Auto-sync on reconnect.              |
| **Session data not found**   | \'Session unavailable --- starting fresh.\'                 | New session created linked to same job entry.               |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ARCHITECTURAL RULE</strong></p>
<p>Every /services function returns { success: boolean, data?, error? }.</p>
<p>Screens render error states from success: false only — never from caught exceptions.</p>
<p>All errors logged to Supabase logs table — never shown raw to user.</p>
<p>Network errors never crash the app — always degrade to offline mode gracefully.</p></td>
</tr>
</tbody>
</table>

**9. SECURITY ARCHITECTURE**

|                     |                                                |                                                            |
|---------------------|------------------------------------------------|------------------------------------------------------------|
| **Layer**           | **Mechanism**                                  | **What it protects**                                       |
| **API keys**        | Supabase Edge Functions as proxy               | Anthropic, OpenAI, Stripe secret --- never in app bundle   |
| **User data**       | Supabase Row Level Security                    | Users access own data only --- enforced at DB level        |
| **Authentication**  | Supabase Auth + JWT in SecureStore             | Sessions expire, refresh automatically, encrypted storage  |
| **KYC documents**   | Separate RLS bucket + service role only        | ID photos never accessible to Rex or other users           |
| **Payments**        | Stripe SDK --- never touch card data           | Card details handled entirely by Stripe --- never our code |
| **Webhook**         | Stripe signature verification in Edge Function | Prevents fake webhook events activating subscriptions      |
| **Team isolation**  | RLS join via team_owner_id                     | Owner sees work data --- never auth credentials of members |
| **Trial integrity** | Decrement via Edge Function only               | Client cannot manipulate trial_queries_remaining           |

**10. DESKTOP EXPANSION READINESS --- PHASE 2**

Mobile app architecture designed from day one to support future web dashboard without rebuilding the backend.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>BACKEND — No changes needed for Phase 2:</p>
<p>Supabase is platform-agnostic — same DB, RLS, Edge Functions, Storage</p>
<p>accessible from any client using the same Supabase client library.</p>
<p>API SERVICES — Portable to web:</p>
<p>/services files contain business logic only — no mobile-specific code.</p>
<p>anthropic.ts, openai.ts, rag.ts, router.ts, summariser.ts</p>
<p>copy directly into a Next.js app unchanged.</p>
<p>TYPES — Platform-independent:</p>
<p>All TypeScript types defined once. Reused across mobile and future web.</p>
<p>MOBILE-SPECIFIC CODE (must be rebuilt for web):</p>
<p>expo-av → Web Audio API</p>
<p>expo-image-picker → HTML input[type=file]</p>
<p>react-pdf → same library works in browser — no change</p>
<p>Stripe SDK → Stripe.js — different SDK, same Stripe API</p>
<p>PHASE 2 TARGET: Team Owner desktop dashboard.</p>
<p>Full KPI visibility, team management, bulk history review.</p>
<p>Field workers remain on mobile. Owner gets desktop option.</p></td>
</tr>
</tbody>
</table>

**11. BUILD TIMELINE --- 8 WEEKS**

The sequence in which Claude Code builds the app. Each week builds on the previous. No feature built before its dependencies are complete.

|            |                                                                                                                                         |                                                                |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| **Week**   | **What gets built**                                                                                                                     | **Why this order**                                             |
| **Week 1** | Project scaffolding, folder structure, TypeScript config, navigation skeleton, all three Context providers, SubscriptionGate component  | Foundation --- everything else sits on top of this             |
| **Week 2** | Supabase schema, RLS policies, all Edge Functions, complete Auth flow (sign up, dual OTP, sign in, Google OAuth, phone OTP)             | Backend before frontend --- screens need real data and auth    |
| **Week 3** | Full optimization layer: router.ts, summariser.ts, imageCompression.ts, ragInjector.ts, tokenEstimator.ts, SESSION_SOFT_CAP constants   | Built before Rex --- every Rex API call passes through these   |
| **Week 4** | Rex session core: useRexSession hook, VoiceRecordButton, PhotoCapture, StreamingText, ContextualButtons, anthropic.ts streaming service | Core feature --- most complex. Needs weeks 1-3 complete.       |
| **Week 5** | RAG pipeline: code ingestion script, pgvector setup, rag.ts service, match_documents SQL function, F4 Code Lookup screen                | Rex is incomplete without trade code knowledge                 |
| **Week 6** | F2 Job Report (Path A + B), F3 Quote Generator (Path A + B), react-pdf, Supabase Storage PDF upload, versioned document logic           | Document generation depends on working Rex session             |
| **Week 7** | F5 Job History, job naming flow, versioned display tabs, reopen session, job deletion, document sharing via native share sheet          | Archive depends on documents being generated                   |
| **Week 8** | F6 Subscription + Stripe + KYC gate, F7 complete onboarding form, paywall modal, expiry notice, F8 Team Management + KPI dashboard      | Payments and team last --- all features must work to gate them |

**12. YEAR 2 TECHNICAL ROADMAP**

Items not built at launch. Architectural decisions made now to ensure these can be added without rebuilding existing systems.

|                              |              |                                                                                                                                                                                                                                             |
|------------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Item**                     | **Target**   | **Requirements and approach**                                                                                                                                                                                                               |
| **Fine-tuned Rex model**     | Year 2 Q1-Q2 | Requires 6-12 months real conversation data. Export anonymised sessions. Fine-tune Llama/Mistral on Replicate or Modal (\~\$50-100/month GPU). Replace Haiku for Stage 3 routine exchanges. Estimated 70% reduction in current Haiku costs. |
| **Desktop web dashboard**    | Year 2 Q1    | Next.js app. Reuse same Supabase backend, /services, and /types. Rebuild UI layer only. Target: Team Owner KPI dashboard, team management, bulk history review.                                                                             |
| **Offline mode**             | Year 2 Q2    | whisper.rn for on-device transcription (\~150MB model download, cached). Cache last 10 RAG results per trade type. Queue API calls offline. Auto-sync on reconnect.                                                                         |
| **HVAC and Roofer profiles** | Year 2 Q1    | New Rex system prompts using plumber template. New code documents (IMC, ASHRAE, IBC roofing) ingested via existing RAG pipeline. No architectural changes required.                                                                         |
| **International markets**    | Year 2 Q2-Q3 | i18next for UI localisation. Country-specific code documents ingested via existing pipeline. Stripe supports multi-currency natively. No infrastructure changes.                                                                            |

*TradesBrain --- D4 Technical Architecture --- v1.0 --- Confidential --- April 2026*
