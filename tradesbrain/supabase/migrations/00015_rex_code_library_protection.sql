-- 00015_rex_code_library_protection.sql
-- Rex Security — Architectural Obligations OB1 + OB2 (maps to D7 v2.1 Hard Rule
-- H1, code-library protection — ABSOLUTE / LICENSING). The system prompt is one
-- layer; this migration is the architectural layer that cannot be socially
-- engineered.
--
-- WHAT THIS CLOSES — two bulk-extraction routes that existed in 00001:
--
--   1. RLS hole: `code_chunks_read` granted EVERY authenticated user a direct
--      SELECT on public.code_chunks. A client could run
--          supabase.from('code_chunks').select('content')
--      and page out the ENTIRE licensed code library (all trades, all sections),
--      bypassing match_documents, its trade_type filter, and any top-K cap. That
--      is the exact redistribution route OB1/OB2 forbid. The library was fully
--      exfiltratable by any signed-in user.
--
--   2. Unbounded K: match_documents took a client-supplied `match_count` with no
--      server-side ceiling (DEFAULT 5, but a caller could pass 100000). Even
--      through the RPC, a single call could return the whole table for a trade.
--
-- THE FIX:
--   - Drop the permissive direct-SELECT policy on code_chunks. With RLS enabled
--     and no SELECT policy, direct client reads return zero rows.
--   - Recreate match_documents as SECURITY DEFINER (so it still reads chunks on
--     the caller's behalf despite the now-locked table) with a HARD top-K cap.
--     The RPC becomes the ONLY path to code content, and it can only ever return
--     the small, query-scoped, trade-filtered set needed to answer one question.
--   - Pin search_path (SECURITY DEFINER hardening) and grant EXECUTE explicitly.
--
-- code_documents keeps its authenticated-read policy: it holds catalogue
-- METADATA only (document_name, short_name, version, trade_type, source_url) —
-- no code text — so listing it leaks nothing protected by H1.

-- ── OB1/OB2: remove the direct bulk-read route on code_chunks ────────────────
DROP POLICY IF EXISTS code_chunks_read ON public.code_chunks;
-- RLS stays ENABLED. No SELECT/INSERT/UPDATE/DELETE policy for the anon or
-- authenticated roles means no direct table access from the client. Ingestion
-- runs through the service-role key (ingest-code-document Edge Function), which
-- bypasses RLS, so document ingestion is unaffected.

-- Belt-and-braces: revoke any table-level grants the API roles may hold so the
-- table cannot be read directly even if a policy is re-added by mistake.
REVOKE ALL ON public.code_chunks FROM anon, authenticated;

-- ── OB1: query-scoped retrieval with a hard server-side top-K cap ────────────
-- Signature is unchanged so existing rag.ts / codeLookup.ts RPC calls keep
-- working. The cap is enforced here, in code, regardless of what the client
-- sends — K can never be raised to an unbounded or bulk value.
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  filter_trade_type text,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  content text,
  section_number text,
  document_name text,
  version text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  -- HARD CAP: clamp K to [1, 10] no matter what the client passes. The largest
  -- legitimate call is 5 chunks (stage 1-2 diagnosis, see services/ragInjector.ts);
  -- 10 leaves headroom while making bulk extraction impossible.
  capped_count int := LEAST(GREATEST(COALESCE(match_count, 5), 1), 10);
BEGIN
  RETURN QUERY
  SELECT c.id, c.content, c.section_number, c.document_name, c.version,
         1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.code_chunks c
  -- trade_type filter is applied BEFORE the vector ranking (OB1): a worker only
  -- ever sees chunks for their own trade, never another trade's code (H8).
  WHERE c.trade_type = filter_trade_type
  ORDER BY c.embedding <=> query_embedding
  LIMIT capped_count;
END;
$$;

-- Only authenticated callers (and the service role) may invoke the RPC.
REVOKE ALL ON FUNCTION public.match_documents(vector(1536), text, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.match_documents(vector(1536), text, int) TO authenticated, service_role;
