// TradesBrain — ingest-code-document: RAG pipeline
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

async function embed(text: string): Promise<number[]> {
  const r = await fetch("https://api.openai.com/v1/embeddings", { method: "POST", headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ input: text, model: "text-embedding-3-small" }) });
  return (await r.json()).data[0].embedding;
}

function chunk(text: string, size = 500, overlap = 50): string[] {
  const w = text.split(/\s+/); const c: string[] = [];
  for (let i = 0; i < w.length; i += size - overlap) c.push(w.slice(i, i + size).join(" "));
  return c;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const b = await req.json();
  if (!b.document_name || !b.content || !b.trade_type) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const { data: doc } = await supabase.from("code_documents").insert({ document_name: b.document_name, short_name: b.short_name ?? b.document_name, version: b.version ?? "1.0", trade_type: b.trade_type, chunk_count: 0, ingested_by: b.ingested_by ?? "admin" }).select().single();
  if (!doc) return new Response(JSON.stringify({ error: "Doc creation failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  const chunks = chunk(b.content); let n = 0;
  for (let i = 0; i < chunks.length; i++) {
    const emb = await embed(chunks[i]);
    await supabase.from("code_chunks").insert({ document_id: doc.id, trade_type: b.trade_type, document_name: b.document_name, version: b.version ?? "1.0", page_number: i + 1, content: chunks[i], embedding: emb });
    n++;
  }
  await supabase.from("code_documents").update({ chunk_count: n }).eq("id", doc.id);
  return new Response(JSON.stringify({ success: true, document_id: doc.id, chunks_created: n }), { status: 201, headers: { "Content-Type": "application/json" } });
});
