// services/anthropic.ts — Claude API client (via Edge Function proxy).
// D4 Rule 4: ANTHROPIC_API_KEY never appears in the mobile bundle. All calls
// go through supabase functions/claude-proxy. Streaming SSE response is parsed
// for text_delta chunks and forwarded to onChunk.

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
  systemPrompt: string;
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
  error?: string;
}

const TIMEOUT_MS = 30000;

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

  let fullText = '';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({
        model,
        system:
          payload.systemPrompt +
          (payload.ragContext
            ? `\n\nRELEVANT CODE REFERENCES:\n${payload.ragContext}`
            : ''),
        messages: payload.messages,
        max_tokens: payload.maxTokens ?? 2000,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, fullText, modelUsed: model, error: `HTTP ${response.status}: ${errText}` };
    }

    const reader = response.body?.getReader();
    if (!reader) return { ok: false, fullText, modelUsed: model, error: 'No response body' };

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE event blocks are separated by \n\n
      let idx;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const dataLine = block.split('\n').find((l) => l.startsWith('data: '));
        if (!dataLine) continue;
        const raw = dataLine.slice(6);
        if (raw === '[DONE]') continue;
        try {
          const evt = JSON.parse(raw);
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            const text = evt.delta.text as string;
            fullText += text;
            onChunk(text);
          }
        } catch {
          // Ignore malformed event
        }
      }
    }

    return { ok: true, fullText, modelUsed: model };
  } catch (e: any) {
    return { ok: false, fullText, modelUsed: model, error: e?.message ?? String(e) };
  } finally {
    clearTimeout(timer);
  }
}
