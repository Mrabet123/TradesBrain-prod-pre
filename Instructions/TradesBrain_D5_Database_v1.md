**TRADESBRAIN**

D5 --- Database and Data Model

*Complete Supabase schema, relationships, RLS policies, and indexes*

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>Version: 1.0 — Locked</p>
<p>Date: April 17, 2026</p>
<p>Depends on: D1 PRD v1.2, D3 Feature Specs v1.0, D4 Tech Architecture v1.0</p>
<p>Audience: Claude Code (primary), Supabase setup</p>
<p>Database: Supabase PostgreSQL with pgvector extension</p>
<p>Tables: 11 application tables + 1 vector table</p>
<p>Confidentiality: Confidential — Internal use only</p></td>
</tr>
</tbody>
</table>

**1. DATABASE OVERVIEW**

TradesBrain uses Supabase PostgreSQL as the sole database. All application data lives here. The pgvector extension enables semantic search for the RAG code knowledge base. Row Level Security is enabled on every table --- data isolation is enforced at the database level, not the application level.

**Table Index**

|                        |                                                              |                                 |
|------------------------|--------------------------------------------------------------|---------------------------------|
| **Table**              | **Purpose**                                                  | **Key relationships**           |
| **users**              | Worker profiles, subscription status, KYC status, trade type | Parent of all user-owned data   |
| **team_members**       | Links technicians to their team owner                        | users → users (owner to member) |
| **job_sessions**       | Rex job collaboration sessions                               | users → job_sessions            |
| **messages**           | Individual messages within a Rex session                     | job_sessions → messages         |
| **job_reports**        | Generated job report documents                               | job_sessions → job_reports      |
| **quotes**             | Generated quote documents                                    | job_sessions → quotes           |
| **worker_preferences** | Saved report/quote structure preferences per worker          | users → worker_preferences      |
| **subscriptions**      | Stripe subscription records                                  | users → subscriptions           |
| **billing_history**    | Invoice records per subscription payment                     | subscriptions → billing_history |
| **code_chunks**        | Trade code document chunks with vector embeddings            | Standalone --- no user FK       |
| **code_documents**     | Metadata for ingested code documents                         | Standalone --- admin managed    |
| **audit_logs**         | Error and event logging for debugging                        | Standalone --- system managed   |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>DATA RULE</strong></p>
<p>Every table has RLS enabled before any data is inserted.</p>
<p>Every user-owned table has a user_id column referencing auth.users(id).</p>
<p>All primary keys are UUID type — never integer sequences.</p>
<p>All timestamps are timestamptz (timezone-aware) — never plain timestamp.</p>
<p>Soft deletes are NOT used — hard deletes with cascade where appropriate.</p>
<p>The pgvector extension must be enabled before code_chunks table is created.</p></td>
</tr>
</tbody>
</table>

**2. TABLE: users**

The central table. Every worker in the system has one row here. Links to all their data. Also serves as the master subscription and KYC status record.

|                             |               |              |              |                                                                |
|-----------------------------|---------------|--------------|--------------|----------------------------------------------------------------|
| **Column**                  | **Type**      | **Nullable** | **Default**  | **Description**                                                |
| **id**                      | uuid          | NOT NULL     | auth.uid()   | Primary key. Matches Supabase Auth user ID.                    |
| **created_at**              | timestamptz   | NOT NULL     | now()        | Account creation timestamp                                     |
| **full_name**               | text          | NOT NULL     | ---          | Worker\'s full name                                            |
| **email**                   | text          | NOT NULL     | ---          | Email address. Unique.                                         |
| **phone_number**            | text          | NOT NULL     | ---          | Phone with country code                                        |
| **trade_type**              | text          | NOT NULL     | ---          | Enum: plumber, electrician, hvac, roofer, other                |
| **account_type**            | text          | NOT NULL     | ---          | Enum: solopreneur, team_owner                                  |
| **hourly_rate**             | numeric(10,2) | NOT NULL     | 0            | Workers hourly rate in USD                                     |
| **vat_number**              | text          | NOT NULL     | ---          | VAT number. Locked after creation.                             |
| **company_name**            | text          | NULL         | ---          | Optional company name                                          |
| **company_logo_url**        | text          | NULL         | ---          | Supabase Storage URL for logo                                  |
| **license_number**          | text          | NOT NULL     | ---          | Trade license number                                           |
| **license_proof_url**       | text          | NOT NULL     | ---          | Storage URL for license photo. Locked after creation.          |
| **national_id_url**         | text          | NULL         | ---          | Storage URL for national ID photo                              |
| **national_id_kyc_status**  | text          | NOT NULL     | not_uploaded | Enum: not_uploaded, pending, verified, rejected                |
| **license_kyc_status**      | text          | NOT NULL     | not_uploaded | Enum: not_uploaded, pending, verified, rejected                |
| **trial_queries_remaining** | integer       | NOT NULL     | 10           | Global free trial query counter. Decremented by Edge Function. |
| **subscription_status**     | text          | NOT NULL     | trial        | Enum: trial, active, expired, cancelled                        |
| **plan_type**               | text          | NULL         | ---          | Enum: solo, pro, team. NULL during trial.                      |
| **subscription_end_date**   | timestamptz   | NULL         | ---          | End of current billing cycle                                   |
| **stripe_customer_id**      | text          | NULL         | ---          | Stripe customer ID for billing management                      |
| **terms_accepted_at**       | timestamptz   | NOT NULL     | ---          | When worker accepted Terms of Use                              |
| **terms_version**           | text          | NOT NULL     | ---          | Version of ToU accepted                                        |
| **updated_at**              | timestamptz   | NOT NULL     | now()        | Last profile update. Auto-updated by trigger.                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ROW LEVEL SECURITY</strong></p>
<p>SELECT: auth.uid() = id</p>
<p>INSERT: auth.uid() = id (Supabase Auth handles creation)</p>
<p>UPDATE: auth.uid() = id</p>
<p>DELETE: auth.uid() = id</p>
<p>LOCKED FIELDS (enforced via trigger — cannot be updated after initial set):</p>
<p>vat_number: immutable after account creation</p>
<p>license_number: immutable after account creation</p>
<p>license_proof_url: immutable after kyc_status = verified</p>
<p>national_id_url: immutable after national_id_kyc_status = verified</p></td>
</tr>
</tbody>
</table>

**SQL --- users table creation**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.users (</p>
<p>id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>full_name text NOT NULL,</p>
<p>email text NOT NULL UNIQUE,</p>
<p>phone_number text NOT NULL,</p>
<p>trade_type text NOT NULL CHECK (trade_type IN</p>
<p>('plumber','electrician','hvac','roofer','other')),</p>
<p>account_type text NOT NULL CHECK (account_type IN</p>
<p>('solopreneur','team_owner')),</p>
<p>hourly_rate numeric(10,2) NOT NULL DEFAULT 0,</p>
<p>vat_number text NOT NULL,</p>
<p>company_name text,</p>
<p>company_logo_url text,</p>
<p>license_number text NOT NULL,</p>
<p>license_proof_url text NOT NULL,</p>
<p>national_id_url text,</p>
<p>national_id_kyc_status text NOT NULL DEFAULT 'not_uploaded'</p>
<p>CHECK (national_id_kyc_status IN</p>
<p>('not_uploaded','pending','verified','rejected')),</p>
<p>license_kyc_status text NOT NULL DEFAULT 'not_uploaded'</p>
<p>CHECK (license_kyc_status IN</p>
<p>('not_uploaded','pending','verified','rejected')),</p>
<p>trial_queries_remaining integer NOT NULL DEFAULT 10</p>
<p>CHECK (trial_queries_remaining &gt;= 0),</p>
<p>subscription_status text NOT NULL DEFAULT 'trial'</p>
<p>CHECK (subscription_status IN</p>
<p>('trial','active','expired','cancelled')),</p>
<p>plan_type text CHECK (plan_type IN ('solo','pro','team')),</p>
<p>subscription_end_date timestamptz,</p>
<p>stripe_customer_id text UNIQUE,</p>
<p>terms_accepted_at timestamptz NOT NULL,</p>
<p>terms_version text NOT NULL,</p>
<p>updated_at timestamptz NOT NULL DEFAULT now()</p>
<p>);</p>
<p>-- Auto-update updated_at on any row change</p>
<p>CREATE OR REPLACE FUNCTION update_updated_at()</p>
<p>RETURNS TRIGGER AS $$ BEGIN</p>
<p>NEW.updated_at = now(); RETURN NEW;</p>
<p>END; $$ LANGUAGE plpgsql;</p>
<p>CREATE TRIGGER users_updated_at</p>
<p>BEFORE UPDATE ON public.users</p>
<p>FOR EACH ROW EXECUTE FUNCTION update_updated_at();</p>
<p>-- RLS</p>
<p>ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY users_own_row ON public.users</p>
<p>USING (auth.uid() = id);</p></td>
</tr>
</tbody>
</table>

**3. TABLE: team_members**

Links technician accounts to their team owner. Every technician has a row in users AND a row here. The owner manages technicians via this join.

|                            |             |              |                   |                                                    |
|----------------------------|-------------|--------------|-------------------|----------------------------------------------------|
| **Column**                 | **Type**    | **Nullable** | **Default**       | **Description**                                    |
| **id**                     | uuid        | NOT NULL     | gen_random_uuid() | Primary key                                        |
| **team_owner_id**          | uuid        | NOT NULL     | ---               | FK → users(id). The team owner.                    |
| **member_id**              | uuid        | NOT NULL     | ---               | FK → users(id). The technician.                    |
| **created_at**             | timestamptz | NOT NULL     | now()             | When technician was added to team                  |
| **is_active**              | boolean     | NOT NULL     | true              | False when member is deactivated (before deletion) |
| **temporary_password_set** | boolean     | NOT NULL     | true              | True until member changes password on first login  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ROW LEVEL SECURITY</strong></p>
<p>SELECT: auth.uid() = team_owner_id (owner sees their team)</p>
<p>OR auth.uid() = member_id (member sees their own record)</p>
<p>INSERT: auth.uid() = team_owner_id (only owner creates members)</p>
<p>UPDATE: auth.uid() = team_owner_id (only owner manages members)</p>
<p>DELETE: auth.uid() = team_owner_id (only owner deletes members)</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.team_members (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>team_owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>member_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>is_active boolean NOT NULL DEFAULT true,</p>
<p>temporary_password_set boolean NOT NULL DEFAULT true,</p>
<p>UNIQUE(team_owner_id, member_id)</p>
<p>);</p>
<p>ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY team_members_policy ON public.team_members</p>
<p>USING (auth.uid() = team_owner_id OR auth.uid() = member_id);</p></td>
</tr>
</tbody>
</table>

**4. TABLE: job_sessions**

Every Rex collaboration session, standalone report, and standalone quote creates a job session record. The central job entity everything else links to.

|                             |             |              |                   |                                                                     |
|-----------------------------|-------------|--------------|-------------------|---------------------------------------------------------------------|
| **Column**                  | **Type**    | **Nullable** | **Default**       | **Description**                                                     |
| **id**                      | uuid        | NOT NULL     | gen_random_uuid() | Primary key                                                         |
| **user_id**                 | uuid        | NOT NULL     | ---               | FK → users(id). Session owner.                                      |
| **created_at**              | timestamptz | NOT NULL     | now()             | Session created timestamp                                           |
| **updated_at**              | timestamptz | NOT NULL     | now()             | Last activity timestamp                                             |
| **closed_at**               | timestamptz | NULL         | ---               | When worker tapped Close Job                                        |
| **status**                  | text        | NOT NULL     | active            | Enum: active, completed, reopened                                   |
| **job_name**                | text        | NULL         | ---               | Worker-defined job name. Set at close.                              |
| **jobsite**                 | text        | NULL         | ---               | Optional jobsite location                                           |
| **trade_type**              | text        | NOT NULL     | ---               | Trade type at session creation (snapshot)                           |
| **session_source**          | text        | NOT NULL     | rex               | Enum: rex, report_standalone, quote_standalone                      |
| **message_count**           | integer     | NOT NULL     | 0                 | Total messages sent. Used for soft cap check.                       |
| **time_on_jobsite_seconds** | integer     | NULL         | ---               | Duration: created_at to closed_at in seconds                        |
| **parent_session_id**       | uuid        | NULL         | ---               | FK → job_sessions(id). For linked sessions (soft cap continuation). |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ROW LEVEL SECURITY</strong></p>
<p>SELECT: auth.uid() = user_id</p>
<p>OR auth.uid() IN (SELECT team_owner_id FROM team_members WHERE member_id = user_id)</p>
<p>INSERT: auth.uid() = user_id</p>
<p>UPDATE: auth.uid() = user_id</p>
<p>DELETE: auth.uid() = user_id</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.job_sessions (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>updated_at timestamptz NOT NULL DEFAULT now(),</p>
<p>closed_at timestamptz,</p>
<p>status text NOT NULL DEFAULT 'active'</p>
<p>CHECK (status IN ('active','completed','reopened')),</p>
<p>job_name text,</p>
<p>jobsite text,</p>
<p>trade_type text NOT NULL,</p>
<p>session_source text NOT NULL DEFAULT 'rex'</p>
<p>CHECK (session_source IN</p>
<p>('rex','report_standalone','quote_standalone')),</p>
<p>message_count integer NOT NULL DEFAULT 0,</p>
<p>time_on_jobsite_seconds integer,</p>
<p>parent_session_id uuid REFERENCES public.job_sessions(id)</p>
<p>);</p>
<p>CREATE INDEX idx_job_sessions_user_id ON public.job_sessions(user_id);</p>
<p>CREATE INDEX idx_job_sessions_status ON public.job_sessions(status);</p>
<p>CREATE INDEX idx_job_sessions_created_at ON public.job_sessions(created_at DESC);</p>
<p>ALTER TABLE public.job_sessions ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY job_sessions_policy ON public.job_sessions</p>
<p>USING (auth.uid() = user_id);</p></td>
</tr>
</tbody>
</table>

**5. TABLE: messages**

Every individual message in a Rex session. Both worker messages and Rex responses stored here. Photos referenced by URL --- never stored as binary in the database.

|                         |             |              |                   |                                                      |
|-------------------------|-------------|--------------|-------------------|------------------------------------------------------|
| **Column**              | **Type**    | **Nullable** | **Default**       | **Description**                                      |
| **id**                  | uuid        | NOT NULL     | gen_random_uuid() | Primary key                                          |
| **session_id**          | uuid        | NOT NULL     | ---               | FK → job_sessions(id). Parent session.               |
| **created_at**          | timestamptz | NOT NULL     | now()             | Message timestamp                                    |
| **role**                | text        | NOT NULL     | ---               | Enum: user, assistant                                |
| **content_text**        | text        | NULL         | ---               | Text content of the message                          |
| **photo_url**           | text        | NULL         | ---               | Supabase Storage URL if photo was attached           |
| **transcript_original** | text        | NULL         | ---               | Raw Whisper transcript before worker edits           |
| **transcript_edited**   | text        | NULL         | ---               | Final transcript after worker edits                  |
| **model_used**          | text        | NULL         | ---               | Which Claude model generated this response           |
| **session_stage**       | integer     | NULL         | ---               | Stage 1-5 at time of message                         |
| **is_summary**          | boolean     | NOT NULL     | false             | True if this message is a compressed history summary |
| **tokens_used**         | integer     | NULL         | ---               | Approximate tokens used for this exchange (logging)  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ROW LEVEL SECURITY</strong></p>
<p>SELECT: via job_sessions join — session_id IN</p>
<p>(SELECT id FROM job_sessions WHERE user_id = auth.uid())</p>
<p>INSERT: same join check</p>
<p>UPDATE: same join check (only content_text for worker edits)</p>
<p>DELETE: same join check</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.messages (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>session_id uuid NOT NULL REFERENCES public.job_sessions(id)</p>
<p>ON DELETE CASCADE,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>role text NOT NULL CHECK (role IN ('user','assistant')),</p>
<p>content_text text,</p>
<p>photo_url text,</p>
<p>transcript_original text,</p>
<p>transcript_edited text,</p>
<p>model_used text,</p>
<p>session_stage integer CHECK (session_stage BETWEEN 1 AND 5),</p>
<p>is_summary boolean NOT NULL DEFAULT false,</p>
<p>tokens_used integer</p>
<p>);</p>
<p>CREATE INDEX idx_messages_session_id ON public.messages(session_id);</p>
<p>CREATE INDEX idx_messages_created_at ON public.messages(created_at ASC);</p>
<p>ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY messages_policy ON public.messages</p>
<p>USING (session_id IN (</p>
<p>SELECT id FROM public.job_sessions WHERE user_id = auth.uid()</p>
<p>));</p></td>
</tr>
</tbody>
</table>

**6. TABLE: job_reports**

Generated job report documents. Multiple versions per job session stored as separate rows with version numbers. Once status is finalised --- permanently read-only via trigger.

|                      |               |              |                   |                                                      |
|----------------------|---------------|--------------|-------------------|------------------------------------------------------|
| **Column**           | **Type**      | **Nullable** | **Default**       | **Description**                                      |
| **id**               | uuid          | NOT NULL     | gen_random_uuid() | Primary key                                          |
| **session_id**       | uuid          | NOT NULL     | ---               | FK → job_sessions(id)                                |
| **user_id**          | uuid          | NOT NULL     | ---               | FK → users(id). Denormalised for RLS.                |
| **created_at**       | timestamptz   | NOT NULL     | now()             | Report generation timestamp                          |
| **version_number**   | integer       | NOT NULL     | 1                 | Auto-incremented per session. Report 1, Report 2\... |
| **status**           | text          | NOT NULL     | draft             | Enum: draft, finalised. Finalised = read-only.       |
| **report_text**      | text          | NOT NULL     | ---               | Full formatted report content                        |
| **pdf_url**          | text          | NULL         | ---               | Supabase Storage URL for generated PDF               |
| **suggested_amount** | numeric(10,2) | NULL         | ---               | Rex-calculated suggested payment amount              |
| **confirmed_amount** | numeric(10,2) | NULL         | ---               | Worker-confirmed final amount                        |
| **sections_config**  | jsonb         | NULL         | ---               | Snapshot of section structure used for this report   |
| **includes_vat**     | boolean       | NOT NULL     | false             | Whether VAT number was included                      |
| **includes_license** | boolean       | NOT NULL     | false             | Whether license number was included                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p><strong>ROW LEVEL SECURITY</strong></p>
<p>SELECT: auth.uid() = user_id</p>
<p>OR auth.uid() IN (SELECT team_owner_id FROM team_members WHERE member_id = user_id)</p>
<p>INSERT: auth.uid() = user_id</p>
<p>UPDATE: auth.uid() = user_id AND status = 'draft' only</p>
<p>(trigger blocks UPDATE when status = 'finalised')</p>
<p>DELETE: auth.uid() = user_id (cascades when job_session deleted)</p></td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.job_reports (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>session_id uuid NOT NULL REFERENCES public.job_sessions(id)</p>
<p>ON DELETE CASCADE,</p>
<p>user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>version_number integer NOT NULL DEFAULT 1,</p>
<p>status text NOT NULL DEFAULT 'draft'</p>
<p>CHECK (status IN ('draft','finalised')),</p>
<p>report_text text NOT NULL,</p>
<p>pdf_url text,</p>
<p>suggested_amount numeric(10,2),</p>
<p>confirmed_amount numeric(10,2),</p>
<p>sections_config jsonb,</p>
<p>includes_vat boolean NOT NULL DEFAULT false,</p>
<p>includes_license boolean NOT NULL DEFAULT false,</p>
<p>UNIQUE(session_id, version_number)</p>
<p>);</p>
<p>-- Prevent updates to finalised reports</p>
<p>CREATE OR REPLACE FUNCTION prevent_finalised_update()</p>
<p>RETURNS TRIGGER AS $$ BEGIN</p>
<p>IF OLD.status = 'finalised' THEN</p>
<p>RAISE EXCEPTION 'Cannot modify a finalised report';</p>
<p>END IF;</p>
<p>RETURN NEW;</p>
<p>END; $$ LANGUAGE plpgsql;</p>
<p>CREATE TRIGGER lock_finalised_report</p>
<p>BEFORE UPDATE ON public.job_reports</p>
<p>FOR EACH ROW EXECUTE FUNCTION prevent_finalised_update();</p>
<p>CREATE INDEX idx_job_reports_session_id ON public.job_reports(session_id);</p>
<p>CREATE INDEX idx_job_reports_user_id ON public.job_reports(user_id);</p>
<p>ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY job_reports_policy ON public.job_reports</p>
<p>USING (auth.uid() = user_id);</p></td>
</tr>
</tbody>
</table>

**7. TABLE: quotes**

Generated quote documents. Identical structure and locking logic to job_reports. Multiple versions per session stored separately.

|                          |               |              |                   |                                             |
|--------------------------|---------------|--------------|-------------------|---------------------------------------------|
| **Column**               | **Type**      | **Nullable** | **Default**       | **Description**                             |
| **id**                   | uuid          | NOT NULL     | gen_random_uuid() | Primary key                                 |
| **session_id**           | uuid          | NOT NULL     | ---               | FK → job_sessions(id)                       |
| **user_id**              | uuid          | NOT NULL     | ---               | FK → users(id). Denormalised for RLS.       |
| **created_at**           | timestamptz   | NOT NULL     | now()             | Quote generation timestamp                  |
| **version_number**       | integer       | NOT NULL     | 1                 | Auto-incremented per session                |
| **status**               | text          | NOT NULL     | draft             | Enum: draft, finalised                      |
| **line_items**           | jsonb         | NOT NULL     | ---               | Array of {name, qty, unit_cost, line_total} |
| **labour_hours**         | numeric(5,2)  | NULL         | ---               | Labour hours from worker description        |
| **hourly_rate_snapshot** | numeric(10,2) | NULL         | ---               | Hourly rate at time of quote generation     |
| **suggested_range_min**  | numeric(10,2) | NULL         | ---               | Rex suggested range --- lower bound         |
| **suggested_range_max**  | numeric(10,2) | NULL         | ---               | Rex suggested range --- upper bound         |
| **confirmed_total**      | numeric(10,2) | NULL         | ---               | Worker-confirmed final total                |
| **payment_terms**        | text          | NULL         | ---               | Worker-defined payment terms                |
| **pdf_url**              | text          | NULL         | ---               | Supabase Storage URL for PDF                |
| **sections_config**      | jsonb         | NULL         | ---               | Section structure snapshot                  |
| **includes_vat**         | boolean       | NOT NULL     | false             | VAT included in quote                       |
| **includes_license**     | boolean       | NOT NULL     | false             | License included in quote                   |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.quotes (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>session_id uuid NOT NULL REFERENCES public.job_sessions(id)</p>
<p>ON DELETE CASCADE,</p>
<p>user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>version_number integer NOT NULL DEFAULT 1,</p>
<p>status text NOT NULL DEFAULT 'draft'</p>
<p>CHECK (status IN ('draft','finalised')),</p>
<p>line_items jsonb NOT NULL DEFAULT '[]',</p>
<p>labour_hours numeric(5,2),</p>
<p>hourly_rate_snapshot numeric(10,2),</p>
<p>suggested_range_min numeric(10,2),</p>
<p>suggested_range_max numeric(10,2),</p>
<p>confirmed_total numeric(10,2),</p>
<p>payment_terms text,</p>
<p>pdf_url text,</p>
<p>sections_config jsonb,</p>
<p>includes_vat boolean NOT NULL DEFAULT false,</p>
<p>includes_license boolean NOT NULL DEFAULT false,</p>
<p>UNIQUE(session_id, version_number)</p>
<p>);</p>
<p>-- Same finalised lock trigger as job_reports</p>
<p>CREATE TRIGGER lock_finalised_quote</p>
<p>BEFORE UPDATE ON public.quotes</p>
<p>FOR EACH ROW EXECUTE FUNCTION prevent_finalised_update();</p>
<p>CREATE INDEX idx_quotes_session_id ON public.quotes(session_id);</p>
<p>CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);</p>
<p>ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY quotes_policy ON public.quotes</p>
<p>USING (auth.uid() = user_id);</p></td>
</tr>
</tbody>
</table>

**8. TABLE: worker_preferences**

Saved structure preferences for reports and quotes. One row per worker per document type. Rex reads this before generating any document.

|                             |             |              |                   |                                        |
|-----------------------------|-------------|--------------|-------------------|----------------------------------------|
| **Column**                  | **Type**    | **Nullable** | **Default**       | **Description**                        |
| **id**                      | uuid        | NOT NULL     | gen_random_uuid() | Primary key                            |
| **user_id**                 | uuid        | NOT NULL     | ---               | FK → users(id)                         |
| **document_type**           | text        | NOT NULL     | ---               | Enum: report, quote                    |
| **sections**                | jsonb       | NOT NULL     | ---               | Array of section names in order        |
| **default_include_vat**     | boolean     | NOT NULL     | false             | Default VAT inclusion preference       |
| **default_include_license** | boolean     | NOT NULL     | false             | Default license inclusion preference   |
| **default_payment_terms**   | text        | NULL         | ---               | Saved default payment terms for quotes |
| **created_at**              | timestamptz | NOT NULL     | now()             | First time preferences were set        |
| **updated_at**              | timestamptz | NOT NULL     | now()             | Last time preferences were updated     |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.worker_preferences (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>document_type text NOT NULL CHECK (document_type IN ('report','quote')),</p>
<p>sections jsonb NOT NULL DEFAULT '[]',</p>
<p>default_include_vat boolean NOT NULL DEFAULT false,</p>
<p>default_include_license boolean NOT NULL DEFAULT false,</p>
<p>default_payment_terms text,</p>
<p>created_at timestamptz NOT NULL DEFAULT now(),</p>
<p>updated_at timestamptz NOT NULL DEFAULT now(),</p>
<p>UNIQUE(user_id, document_type)</p>
<p>);</p>
<p>ALTER TABLE public.worker_preferences ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY worker_preferences_policy ON public.worker_preferences</p>
<p>USING (auth.uid() = user_id);</p></td>
</tr>
</tbody>
</table>

**9. TABLE: subscriptions**

Stripe subscription records. One active subscription per user at any time. Historical records kept for billing history display.

|                            |               |              |                   |                                               |
|----------------------------|---------------|--------------|-------------------|-----------------------------------------------|
| **Column**                 | **Type**      | **Nullable** | **Default**       | **Description**                               |
| **id**                     | uuid          | NOT NULL     | gen_random_uuid() | Primary key                                   |
| **user_id**                | uuid          | NOT NULL     | ---               | FK → users(id)                                |
| **stripe_subscription_id** | text          | NOT NULL     | ---               | Stripe subscription ID. Unique.               |
| **plan_type**              | text          | NOT NULL     | ---               | Enum: solo, pro, team                         |
| **status**                 | text          | NOT NULL     | ---               | Enum: active, cancelled, expired, past_due    |
| **seat_count**             | integer       | NOT NULL     | 1                 | Total seats on subscription (Team plan)       |
| **monthly_amount**         | numeric(10,2) | NOT NULL     | ---               | Total monthly charge at subscription creation |
| **billing_cycle**          | text          | NOT NULL     | monthly           | Enum: monthly, annual                         |
| **current_period_start**   | timestamptz   | NOT NULL     | ---               | Start of current billing cycle                |
| **current_period_end**     | timestamptz   | NOT NULL     | ---               | End of current billing cycle                  |
| **cancelled_at**           | timestamptz   | NULL         | ---               | When cancellation was requested               |
| **created_at**             | timestamptz   | NOT NULL     | now()             | Subscription creation timestamp               |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.subscriptions (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>stripe_subscription_id text NOT NULL UNIQUE,</p>
<p>plan_type text NOT NULL CHECK (plan_type IN ('solo','pro','team')),</p>
<p>status text NOT NULL</p>
<p>CHECK (status IN ('active','cancelled','expired','past_due')),</p>
<p>seat_count integer NOT NULL DEFAULT 1,</p>
<p>monthly_amount numeric(10,2) NOT NULL,</p>
<p>billing_cycle text NOT NULL DEFAULT 'monthly'</p>
<p>CHECK (billing_cycle IN ('monthly','annual')),</p>
<p>current_period_start timestamptz NOT NULL,</p>
<p>current_period_end timestamptz NOT NULL,</p>
<p>cancelled_at timestamptz,</p>
<p>created_at timestamptz NOT NULL DEFAULT now()</p>
<p>);</p>
<p>CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);</p>
<p>CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);</p>
<p>ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY subscriptions_policy ON public.subscriptions</p>
<p>USING (auth.uid() = user_id);</p></td>
</tr>
</tbody>
</table>

**10. TABLE: billing_history**

Individual invoice records. One row per successful payment. Displayed in Settings → Subscription as downloadable billing history.

|                          |               |              |                   |                                |
|--------------------------|---------------|--------------|-------------------|--------------------------------|
| **Column**               | **Type**      | **Nullable** | **Default**       | **Description**                |
| **id**                   | uuid          | NOT NULL     | gen_random_uuid() | Primary key                    |
| **user_id**              | uuid          | NOT NULL     | ---               | FK → users(id)                 |
| **subscription_id**      | uuid          | NOT NULL     | ---               | FK → subscriptions(id)         |
| **stripe_invoice_id**    | text          | NOT NULL     | ---               | Stripe invoice ID. Unique.     |
| **amount_paid**          | numeric(10,2) | NOT NULL     | ---               | Amount charged in USD          |
| **plan_type**            | text          | NOT NULL     | ---               | Plan at time of payment        |
| **seat_count**           | integer       | NOT NULL     | 1                 | Seats billed                   |
| **billing_period_start** | timestamptz   | NOT NULL     | ---               | Invoice period start           |
| **billing_period_end**   | timestamptz   | NOT NULL     | ---               | Invoice period end             |
| **invoice_pdf_url**      | text          | NULL         | ---               | Stripe-hosted invoice PDF URL  |
| **paid_at**              | timestamptz   | NOT NULL     | ---               | Payment confirmation timestamp |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.billing_history (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,</p>
<p>subscription_id uuid NOT NULL REFERENCES public.subscriptions(id),</p>
<p>stripe_invoice_id text NOT NULL UNIQUE,</p>
<p>amount_paid numeric(10,2) NOT NULL,</p>
<p>plan_type text NOT NULL,</p>
<p>seat_count integer NOT NULL DEFAULT 1,</p>
<p>billing_period_start timestamptz NOT NULL,</p>
<p>billing_period_end timestamptz NOT NULL,</p>
<p>invoice_pdf_url text,</p>
<p>paid_at timestamptz NOT NULL</p>
<p>);</p>
<p>ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY billing_history_policy ON public.billing_history</p>
<p>USING (auth.uid() = user_id);</p></td>
</tr>
</tbody>
</table>

**11. TABLE: code_chunks (pgvector)**

The RAG knowledge base. Contains all trade code document chunks with their vector embeddings. Populated by the admin ingestion pipeline --- never by the app directly. No user-specific data --- all authenticated users can query it.

|                    |              |              |                   |                                                   |
|--------------------|--------------|--------------|-------------------|---------------------------------------------------|
| **Column**         | **Type**     | **Nullable** | **Default**       | **Description**                                   |
| **id**             | uuid         | NOT NULL     | gen_random_uuid() | Primary key                                       |
| **document_id**    | uuid         | NOT NULL     | ---               | FK → code_documents(id)                           |
| **trade_type**     | text         | NOT NULL     | ---               | Enum: plumber, electrician, hvac, roofer, general |
| **document_name**  | text         | NOT NULL     | ---               | e.g. IPC 2021, NEC 2023                           |
| **version**        | text         | NOT NULL     | ---               | Document version e.g. 2021, 2023                  |
| **section_number** | text         | NULL         | ---               | Code section reference e.g. 704.1                 |
| **page_number**    | integer      | NULL         | ---               | Source page in original document                  |
| **content**        | text         | NOT NULL     | ---               | The actual code text chunk (\~500 words)          |
| **embedding**      | vector(1536) | NOT NULL     | ---               | OpenAI text-embedding-3-small vector              |
| **created_at**     | timestamptz  | NOT NULL     | now()             | Ingestion timestamp                               |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>-- Enable pgvector extension first</p>
<p>CREATE EXTENSION IF NOT EXISTS vector;</p>
<p>CREATE TABLE public.code_chunks (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>document_id uuid NOT NULL REFERENCES public.code_documents(id),</p>
<p>trade_type text NOT NULL CHECK (trade_type IN</p>
<p>('plumber','electrician','hvac','roofer','general')),</p>
<p>document_name text NOT NULL,</p>
<p>version text NOT NULL,</p>
<p>section_number text,</p>
<p>page_number integer,</p>
<p>content text NOT NULL,</p>
<p>embedding vector(1536) NOT NULL,</p>
<p>created_at timestamptz NOT NULL DEFAULT now()</p>
<p>);</p>
<p>-- HNSW index for fast approximate nearest-neighbor search</p>
<p>CREATE INDEX idx_code_chunks_embedding ON public.code_chunks</p>
<p>USING hnsw (embedding vector_cosine_ops)</p>
<p>WITH (m = 16, ef_construction = 64);</p>
<p>CREATE INDEX idx_code_chunks_trade_type ON public.code_chunks(trade_type);</p>
<p>-- RLS: all authenticated users can query, nobody can insert via client</p>
<p>ALTER TABLE public.code_chunks ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY code_chunks_read ON public.code_chunks</p>
<p>FOR SELECT USING (auth.role() = 'authenticated');</p>
<p>-- Semantic search RPC function</p>
<p>CREATE OR REPLACE FUNCTION match_documents(</p>
<p>query_embedding vector(1536),</p>
<p>filter_trade_type text,</p>
<p>match_count int DEFAULT 5</p>
<p>) RETURNS TABLE(id uuid, content text, section_number text,</p>
<p>document_name text, version text, similarity float)</p>
<p>LANGUAGE plpgsql AS $$</p>
<p>BEGIN</p>
<p>RETURN QUERY</p>
<p>SELECT</p>
<p>c.id, c.content, c.section_number, c.document_name, c.version,</p>
<p>1 - (c.embedding &lt;=&gt; query_embedding) AS similarity</p>
<p>FROM public.code_chunks c</p>
<p>WHERE c.trade_type = filter_trade_type</p>
<p>ORDER BY c.embedding &lt;=&gt; query_embedding</p>
<p>LIMIT match_count;</p>
<p>END; $$;</p></td>
</tr>
</tbody>
</table>

**12. TABLE: code_documents**

Metadata registry for all ingested trade code documents. Tracks what has been loaded into the RAG database and when.

|                   |             |              |                   |                                               |
|-------------------|-------------|--------------|-------------------|-----------------------------------------------|
| **Column**        | **Type**    | **Nullable** | **Default**       | **Description**                               |
| **id**            | uuid        | NOT NULL     | gen_random_uuid() | Primary key                                   |
| **document_name** | text        | NOT NULL     | ---               | e.g. International Plumbing Code              |
| **short_name**    | text        | NOT NULL     | ---               | e.g. IPC 2021                                 |
| **version**       | text        | NOT NULL     | ---               | Publication year e.g. 2021                    |
| **trade_type**    | text        | NOT NULL     | ---               | Which trade this document serves              |
| **source_url**    | text        | NULL         | ---               | Official source URL if available              |
| **chunk_count**   | integer     | NOT NULL     | 0                 | Number of chunks generated from this document |
| **ingested_at**   | timestamptz | NOT NULL     | now()             | When this document was ingested               |
| **ingested_by**   | text        | NOT NULL     | ---               | Admin identifier who ran ingestion            |
| **is_active**     | boolean     | NOT NULL     | true              | False if superseded by newer version          |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>CREATE TABLE public.code_documents (</p>
<p>id uuid PRIMARY KEY DEFAULT gen_random_uuid(),</p>
<p>document_name text NOT NULL,</p>
<p>short_name text NOT NULL,</p>
<p>version text NOT NULL,</p>
<p>trade_type text NOT NULL,</p>
<p>source_url text,</p>
<p>chunk_count integer NOT NULL DEFAULT 0,</p>
<p>ingested_at timestamptz NOT NULL DEFAULT now(),</p>
<p>ingested_by text NOT NULL,</p>
<p>is_active boolean NOT NULL DEFAULT true,</p>
<p>UNIQUE(short_name, version)</p>
<p>);</p>
<p>-- Read-only for all authenticated users</p>
<p>ALTER TABLE public.code_documents ENABLE ROW LEVEL SECURITY;</p>
<p>CREATE POLICY code_documents_read ON public.code_documents</p>
<p>FOR SELECT USING (auth.role() = 'authenticated');</p></td>
</tr>
</tbody>
</table>

**13. TABLE RELATIONSHIPS**

Complete entity relationship summary showing how all tables connect.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>auth.users (Supabase managed)</p>
<p>|</p>
<p>|-- users (1:1) — application profile</p>
<p>|</p>
<p>|-- team_members (1:many) — as team_owner_id</p>
<p>|-- team_members (1:1) — as member_id</p>
<p>|</p>
<p>|-- job_sessions (1:many)</p>
<p>| |</p>
<p>| |-- messages (1:many)</p>
<p>| |-- job_reports (1:many, versioned)</p>
<p>| |-- quotes (1:many, versioned)</p>
<p>| |-- job_sessions (self-ref via parent_session_id)</p>
<p>|</p>
<p>|-- worker_preferences (1:2 — one per document_type)</p>
<p>|-- subscriptions (1:many — history of subscriptions)</p>
<p>| |</p>
<p>| |-- billing_history (1:many)</p>
<p>|</p>
<p>(no direct FK to code_chunks — accessed via RPC only)</p>
<p>code_documents (admin-managed)</p>
<p>|</p>
<p>|-- code_chunks (1:many) — via document_id</p></td>
</tr>
</tbody>
</table>

**14. INDEXES SUMMARY**

All indexes defined across the schema. Indexes are critical for query performance at scale --- especially for job history loading and team owner KPI queries.

|                   |                               |             |                                      |
|-------------------|-------------------------------|-------------|--------------------------------------|
| **Table**         | **Index**                     | **Type**    | **Purpose**                          |
| **users**         | idx_users_email               | UNIQUE      | Fast email lookup at sign-in         |
| **users**         | idx_users_stripe_customer_id  | UNIQUE      | Webhook lookup by Stripe customer    |
| **users**         | idx_users_subscription_status | B-tree      | Fast subscription gate checks        |
| **job_sessions**  | idx_job_sessions_user_id      | B-tree      | All sessions for a user              |
| **job_sessions**  | idx_job_sessions_status       | B-tree      | Filter active/completed sessions     |
| **job_sessions**  | idx_job_sessions_created_at   | B-tree DESC | Chronological history board          |
| **messages**      | idx_messages_session_id       | B-tree      | All messages for a session           |
| **messages**      | idx_messages_created_at       | B-tree ASC  | Conversation order                   |
| **job_reports**   | idx_job_reports_session_id    | B-tree      | Reports per job                      |
| **job_reports**   | idx_job_reports_user_id       | B-tree      | All reports for a user               |
| **quotes**        | idx_quotes_session_id         | B-tree      | Quotes per job                       |
| **quotes**        | idx_quotes_user_id            | B-tree      | All quotes for a user                |
| **subscriptions** | idx_subscriptions_user_id     | B-tree      | Active subscription lookup           |
| **subscriptions** | idx_subscriptions_stripe_id   | UNIQUE      | Webhook subscription lookup          |
| **code_chunks**   | idx_code_chunks_embedding     | HNSW        | Fast vector similarity search        |
| **code_chunks**   | idx_code_chunks_trade_type    | B-tree      | Filter by trade before vector search |

**15. DATABASE SETUP ORDER**

Tables must be created in this exact order to satisfy foreign key dependencies.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>1. Enable extensions: CREATE EXTENSION IF NOT EXISTS vector;</p>
<p>2. Create: code_documents (no dependencies)</p>
<p>3. Create: code_chunks (depends on code_documents)</p>
<p>4. Create: users (depends on auth.users — Supabase Auth must be configured first)</p>
<p>5. Create: team_members (depends on users)</p>
<p>6. Create: worker_preferences (depends on users)</p>
<p>7. Create: subscriptions (depends on users)</p>
<p>8. Create: billing_history (depends on subscriptions)</p>
<p>9. Create: job_sessions (depends on users)</p>
<p>10. Create: messages (depends on job_sessions)</p>
<p>11. Create: job_reports (depends on job_sessions and users)</p>
<p>12. Create: quotes (depends on job_sessions and users)</p>
<p>13. Create all indexes</p>
<p>14. Enable RLS on all tables</p>
<p>15. Create all RLS policies</p>
<p>16. Create triggers (updated_at, prevent_finalised_update)</p>
<p>17. Create match_documents RPC function</p>
<p>18. Verify: run test insert and test RLS query per table</p></td>
</tr>
</tbody>
</table>

*TradesBrain --- D5 Database and Data Model --- v1.0 --- Confidential --- April 2026*
