import { supabase } from './supabase';
import { routeModel } from './router';

interface RexPayload {
  systemPrompt: string;
  messages: { role: string; content: string }[];
  sessionStage: 1 | 2 | 3 | 4 | 5;
  messageType: 'diagnosis' | 'confirmation' | 'formatting' | 'summary' | 'lookup';
  ragContext?: string;
  maxTokens?: number;
}

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function streamRexResponse(
  payload: RexPayload,
  onChunk: (text: string) => void,
  onComplete: () => void
): Promise<ServiceResult<void>> {
  try {
    const model = routeModel({
      sessionStage: payload.sessionStage,
      messageType: payload.messageType,
    });

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          model,
          system: payload.systemPrompt + (payload.ragContext ? `\n\nRELEVANT CODE REFERENCES:\n${payload.ragContext}` : ''),
          messages: payload.messages,
          max_tokens: payload.maxTokens ?? 2000,
          stream: true,
        }),
      }
    );

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { onComplete(); break; }
        onChunk(decoder.decode(value));
      }
    }

    return { success: true };
  } catch (error) {
    console.error('streamRexResponse error:', error);
    return { success: false, error: String(error) };
  }
}
