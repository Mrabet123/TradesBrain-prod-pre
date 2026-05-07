import { supabase } from './supabase';
import { generateEmbedding } from './openai';
import { CodeChunk } from '../types/documents';

export async function searchCodeChunks(
  queryText: string,
  tradeType: string,
  limit: number
): Promise<CodeChunk[]> {
  const embedding = await generateEmbedding(queryText);

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    filter_trade_type: tradeType,
    match_count: limit,
  });

  if (error) throw error;
  return data as CodeChunk[];
}
