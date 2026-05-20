// services/anthropic.ts — Claude API client (via Edge Function proxy).
// D4 Rule: ANTHROPIC_API_KEY never appears in the mobile bundle — all calls go
// through supabase functions/claude-proxy. RULE 10: the system prompt is never
// in the bundle either — the app sends trade_type + mode and claude-proxy
// assembles the prompt server-side.
//
// React Native fetch does not reliably expose response.body as a ReadableStream,
// so true SSE streaming silently drops chunks. We use a buffered request and
// then reveal the text to the UI word-by-word for a typewriter feel.

import { supabase } from './supabase';
import { routeModel } from './router';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content:
    | string
    | Array<
        | { type: 'text'; text: string }
        | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
      >;
}

export interface RexPayload {
  tradeType: string;
  messages: ClaudeMessage[];
  sessionStage: 1 | 2 | 3 | 4 | 5;
  messageType: 'diagnosis' | 'confirmation' | 'formatting' | 'summary' | 'lookup';
  ragContext?: string;
  maxTokens?: number;
}

export interface StreamResult {
  ok: boolean;
  fullText: string;
  modelUsed: string;
  stage?: 1 | 2 | 3 | 4 | 5;
  error?: string;
}

const TIMEOUT_MS = 30000;
// Rex emits [[STAGE:n]] markers (server STAGE_PROTOCOL_ADDENDUM) — parsed for
// stage tracking, then stripped before the text is shown or persisted.
const STAGE_TAG = /\[\[STAGE:([1-5])\]\]/g;

// Reveal buffered text progressively (~1.1s total regardless of length) so the
// response appears word-by-word instead of all at once.
async function revealWordByWord(text: string, onChunk: (t: string) => void): Promise<void> {
  const tokens = text.split(/(\s+)/); // keeps whitespace tokens so output rejoins exactly
  const perTick = Math.max(1, Math.ceil(tokens.length / 70));
  for (let i = 0; i < tokens.length; i += perTick) {
    onChunk(tokens.slice(i, i + perTick).join(''));
    await new Promise((r) => setTimeout(r, 16));
  }
}

export async function streamRexResponse(
  payload: RexPayload,
  onChunk: (text: string) => void,
): Promise<StreamResult> {
  const model = routeModel({
    sessionStage: payload.sessionStage,
    messageType: payload.messageType,
  });

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({
        model,
        trade_type: payload.tradeType,
        mode: payload.messageType,
        rag_context: payload.ragContext,
        messages: payload.messages,
        max_tokens: payload.maxTokens ?? 2000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, fullText: '', modelUsed: model, error: `HTTP ${response.status}: ${errText}` };
    }

    const body = await response.json();
    const blocks = Array.isArray(body?.content) ? body.content : [];
    const rawText: string = blocks
      .filter((b: any) => b?.type === 'text' && typeof b.text === 'string')
      .map((b: any) => b.text as string)
      .join('');

    if (!rawText) {
      return { ok: false, fullText: '', modelUsed: model, error: 'Empty response from Claude' };
    }

    // Pull the explicit stage marker (last [[STAGE:n]] wins), then strip all of
    // them so the worker never sees the marker.
    let stage: 1 | 2 | 3 | 4 | 5 | undefined;
    STAGE_TAG.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = STAGE_TAG.exec(rawText)) !== null) {
      stage = Number(match[1]) as 1 | 2 | 3 | 4 | 5;
    }
    const cleanText = rawText.replace(STAGE_TAG, '').trim();

    await revealWordByWord(cleanText, onChunk);
    return { ok: true, fullText: cleanText, modelUsed: model, stage };
  } catch (e: any) {
    return { ok: false, fullText: '', modelUsed: model, error: e?.message ?? String(e) };
  } finally {
    clearTimeout(timer);
  }
}
