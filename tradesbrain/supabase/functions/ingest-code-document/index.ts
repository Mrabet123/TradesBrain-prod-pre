// ingest-code-document — F4 RAG pipeline (D10 + D4 §6.4).
// Accepts plain-text content for now (PDF parsing is upstream). Splits into
// ~500-word chunks with 50-word overlap, generates OpenAI embeddings, and
// inserts rows into code_chunks + a code_documents row.
//
// Deploy with: supabase functions deploy ingest-code-document
// Secrets: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// POST body:
//   {
//     "document_name": "International Plumbing Code",
//     "short_name":    "IPC",
//     "version":       "2021",
//     "trade_type":    "plumber",
//     "source_url":    "https://...",          // optional
//     "ingested_by":   "admin",                 // optional
//     "content":       "<full plain text>"
//   }

// @ts-ignore — Deno globals
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-ignore — ESM via Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore Deno
const supabase = createClient(
  // @ts-ignore Deno
  Deno.env.get('SUPABASE_URL')!,
  // @ts-ignore Deno
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);
// @ts-ignore Deno
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
// @ts-ignore Deno
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// CC-3 — embeddings are generated in batches to cut a 600-page document from
// 800+ sequential OpenAI calls down to ~40. Safe within OpenAI's input limits.
const EMBED_BATCH_SIZE = 20;

// Embed a batch of texts in a single OpenAI call. OpenAI returns one embedding
// per input; results are sorted by `index` so they map back to the input order.
async function embedBatch(texts: string[]): Promise<number[][]> {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: texts, model: 'text-embedding-3-small' }),
  });
  if (!r.ok) {
    throw new Error(`OpenAI embeddings ${r.status}: ${await r.text()}`);
  }
  const d = await r.json();
  const data: any[] = Array.isArray(d?.data) ? [...d.data] : [];
  data.sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
  return data.map((x) => (x?.embedding ?? []) as number[]);
}

function chunkText(text: string, size = 500, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    out.push(words.slice(i, i + size).join(' '));
    if (i + size >= words.length) break;
  }
  return out;
}

// Heuristic section number extraction: scans the chunk for the first
// occurrence of something like "Section 704.1" or "§ 704.1" or a leading
// numeric heading like "704.1 ".
function extractSection(text: string): string | null {
  const m =
    text.match(/Section\s+(\d+(?:\.\d+)+)/i) ??
    text.match(/§\s*(\d+(?:\.\d+)+)/) ??
    text.match(/^(\d+(?:\.\d+)+)\s/m);
  return m?.[1] ?? null;
}

// Constant-time string comparison — avoids leaking the service-role key length
// or prefix through early-exit timing on the auth gate.
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare to a fixed-length buffer so length itself is not a timing oracle.
  const len = Math.max(ab.length, bb.length);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors() });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // CC-3 — service-role auth gate (D10). This runs before any JSON parsing,
  // chunking, embedding, or DB write: a request without the service-role key
  // is rejected with 401 and nothing is processed.
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (!token || !timingSafeEqual(token, SERVICE_ROLE_KEY)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  }

  // EF-4: D10 names the body field `text_content`; this build historically used
  // `content`. Accept either so both the D10 contract and the existing
  // ingestion script work.
  const content: string | undefined = body.content ?? body.text_content;
  const required: Record<string, unknown> = {
    document_name: body.document_name,
    trade_type: body.trade_type,
    content,
  };
  for (const [k, v] of Object.entries(required)) {
    if (!v) {
      return new Response(JSON.stringify({ error: `Missing field: ${k === 'content' ? 'content (or text_content)' : k}` }), {
        status: 400,
        headers: { ...cors(), 'Content-Type': 'application/json' },
      });
    }
  }

  const shortName: string = body.short_name ?? body.document_name;
  const version: string = body.version ?? '1.0';

  // ISS-M7 (EF-4): duplicate guard (D10 §2.11). code_documents has
  // UNIQUE(short_name, version) — without this check a re-ingest throws an
  // opaque 500 unique-violation instead of a clean 409.
  const { data: existingDoc } = await supabase
    .from('code_documents')
    .select('id')
    .eq('short_name', shortName)
    .eq('version', version)
    .maybeSingle();
  if (existingDoc) {
    return new Response(
      JSON.stringify({ error: 'duplicate_document', detail: `${shortName} ${version} is already ingested.` }),
      { status: 409, headers: { ...cors(), 'Content-Type': 'application/json' } },
    );
  }

  const { data: doc, error: docErr } = await supabase
    .from('code_documents')
    .insert({
      document_name: body.document_name,
      short_name: shortName,
      version,
      trade_type: body.trade_type,
      source_url: body.source_url ?? null,
      chunk_count: 0,
      // EF-4 (D5 §12): code_documents.is_active is NOT NULL — omitting it makes
      // every ingest fail. A freshly ingested document is active by default.
      is_active: true,
      ingested_by: body.ingested_by ?? 'admin',
    })
    .select()
    .single();

  if (docErr || !doc) {
    return new Response(
      JSON.stringify({ error: 'code_documents insert failed', detail: docErr?.message }),
      { status: 500, headers: { ...cors(), 'Content-Type': 'application/json' } },
    );
  }

  const chunks = chunkText(content!);
  let inserted = 0;
  // CC-3 — embed in batches of EMBED_BATCH_SIZE. A failed batch is retried once
  // before being skipped; row count is unchanged versus the per-chunk approach.
  for (let start = 0; start < chunks.length; start += EMBED_BATCH_SIZE) {
    const group = chunks.slice(start, start + EMBED_BATCH_SIZE);
    let embeddings: number[][];
    try {
      embeddings = await embedBatch(group);
    } catch (err) {
      console.error(`Embedding batch at ${start} failed — retrying once:`, err);
      try {
        embeddings = await embedBatch(group);
      } catch (err2) {
        console.error(`Embedding batch at ${start} failed again — skipping:`, err2);
        continue;
      }
    }
    // EF-4: build all rows for this embedding group and insert them in ONE
    // batched INSERT. The previous per-row insert meant 3000+ round-trips for a
    // full code document — a severe perf regression that risked exceeding the
    // Edge Function wall-clock limit. One insert per ~20-chunk group keeps the
    // total to ~150 inserts for a large document.
    const rows = group
      .map((chunkContent, j) => {
        const embedding = embeddings[j];
        if (!embedding || embedding.length === 0) return null;
        return {
          document_id: doc.id,
          trade_type: body.trade_type,
          document_name: body.document_name,
          version,
          section_number: extractSection(chunkContent),
          // EF-4: plain-text input has no real pages — D10 specifies null
          // rather than a synthetic sequential number.
          page_number: null,
          content: chunkContent,
          embedding,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (rows.length === 0) continue;
    const { error: insErr } = await supabase.from('code_chunks').insert(rows);
    if (insErr) {
      console.error(`code_chunks batch insert at ${start} failed:`, insErr);
    } else {
      inserted += rows.length;
    }
  }

  await supabase
    .from('code_documents')
    .update({ chunk_count: inserted })
    .eq('id', doc.id);

  return new Response(
    JSON.stringify({ success: true, document_id: doc.id, chunks_created: inserted }),
    { status: 201, headers: { ...cors(), 'Content-Type': 'application/json' } },
  );
});
