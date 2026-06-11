// D4 Section 3.4 — Smart RAG Injection

export function getRAGChunkCount(stage: number, messageType: string): number {
  if (messageType === 'report' || messageType === 'quote') return 0;
  // Stage 1 is context capture — the worker is answering the 6 opening
  // questions and no code is cited yet. Skipping RAG here removes a serial
  // OpenAI embedding round-trip from the earliest (most-noticed) turns, so the
  // first real reply comes back faster. Code context kicks in at diagnosis.
  if (stage <= 1) return 0;
  if (stage === 2) return 5; // diagnosis — full context
  return 2; // execution — minimal context
}
