// services/codeLookup.ts — F4 Trade Code Lookup pipeline.
// D3 F4 / D4 §6.4 / BuildGuide M4.
//
// Pipeline:
//   query text → OpenAI embedding (embedding-proxy)
//   → Supabase pgvector match_documents (top 3 chunks)
//   → Claude call (code-lookup mode prompt + chunks as system context)
//   → append AHJ note (defence-in-depth — RULE 1)
//
// Key rule: this path NEVER calls decrement-trial-query. Code lookups are
// excluded from trial counting per BuildGuide M4 RULE 3.

import { streamRexResponse, type ClaudeMessage } from './anthropic';
import { generateEmbedding } from './openai';
import { supabase } from './supabase';
import { AHJ_NOTE } from '../constants/codeLookup';

export interface CodeCitation {
  id: string;
  documentName: string;
  version: string;
  sectionNumber: string | null;
  content: string;
  similarity: number;
}

export interface CodeLookupResult {
  ok: boolean;
  query: string;
  tradeType: string;
  answerText: string;
  citations: CodeCitation[];
  ranAt: string;
  error?: string;
}

const TOP_N = 3;

interface MatchRow {
  id: string;
  content: string;
  section_number: string | null;
  document_name: string;
  version: string;
  similarity: number;
}

// ISS-3: the code_chunks.trade_type CHECK uses 'general' for the General/Other
// trade, while users.trade_type and the Codes screen switcher use 'other'.
// match_documents filters on an exact trade_type match, so a General-trade
// lookup sending 'other' would never match a chunk. Map it to the chunk enum.
function chunkTradeType(tradeType: string): string {
  return tradeType === 'other' ? 'general' : tradeType;
}

async function retrieveTopChunks(
  query: string,
  tradeType: string,
): Promise<MatchRow[]> {
  const embedding = await generateEmbedding(query);
  if (!embedding) return [];

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    filter_trade_type: chunkTradeType(tradeType),
    match_count: TOP_N,
  });
  if (error || !data) return [];
  return data as MatchRow[];
}

function ensureAhj(text: string): string {
  return text.includes(AHJ_NOTE) ? text : `${text.trim()}\n\n${AHJ_NOTE}`;
}

export async function lookupCode(
  query: string,
  tradeType: string,
): Promise<CodeLookupResult> {
  const ranAt = new Date().toISOString();
  const chunks = await retrieveTopChunks(query, tradeType);

  const ragContext = chunks
    .map(
      (c) =>
        `[${c.document_name} ${c.version}${c.section_number ? ' §' + c.section_number : ''}]\n${c.content}`,
    )
    .join('\n\n');

  let buffer = '';
  const messages: ClaudeMessage[] = [{ role: 'user', content: query }];

  // claude-proxy appends the code-lookup addendum server-side for mode 'lookup'.
  const result = await streamRexResponse(
    {
      tradeType,
      messages,
      sessionStage: 1,
      messageType: 'lookup', // routes to Sonnet (D4 §3.1)
      ragContext,
      maxTokens: 1200,
    },
    (chunk) => {
      buffer += chunk;
    },
  );

  const citations: CodeCitation[] = chunks.map((c) => ({
    id: c.id,
    documentName: c.document_name,
    version: c.version,
    sectionNumber: c.section_number,
    content: c.content,
    similarity: c.similarity,
  }));

  if (!result.ok) {
    // Don't tack the AHJ note onto an error/offline message — the note's whole
    // purpose is to caveat a successful code answer with "verify local
    // adoption". Pasting it under an error is misleading (no answer to verify).
    return {
      ok: false,
      query,
      tradeType,
      answerText:
        'Code lookup is offline. Check your connection or deploy the claude-proxy / embedding-proxy Edge Functions and try again.',
      citations,
      ranAt,
      error: result.error,
    };
  }

  return {
    ok: true,
    query,
    tradeType,
    answerText: ensureAhj(buffer || result.fullText),
    citations,
    ranAt,
  };
}
