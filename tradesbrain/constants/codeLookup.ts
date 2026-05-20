// D3 F4 / BuildGuide M4 RULE 1 — AHJ verification note.
// Exact text required by RULE 1. Appended programmatically to EVERY response
// as a defence-in-depth measure (the system prompt also instructs Rex to add
// this string, but client-side append guarantees the line is never missing).
//
// The code-lookup mode prompt addendum lives server-side in the claude-proxy
// Edge Function (claude-proxy/prompts.ts) — see RULE 10.

export const AHJ_NOTE =
  'Verify current adoption in your jurisdiction — local amendments may apply.';

export const RECENT_CACHE_LIMIT = 10;
