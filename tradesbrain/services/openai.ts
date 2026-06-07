// services/openai.ts — Whisper transcription + text embedding (via Edge proxies).
// D4 Rule 4: OPENAI_API_KEY never appears in the mobile bundle. Both calls go
// through Supabase Edge Functions (whisper-proxy + embedding-proxy).

import { supabase } from './supabase';

export interface TranscribeResult {
  ok: boolean;
  text?: string;
  error?: string;
}

export async function transcribeAudio(audioUri: string): Promise<TranscribeResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Derive the file extension from the recording URI so the multipart name +
    // MIME match what the recorder actually produced (Whisper rejects a
    // mislabelled container). expo-audio HIGH_QUALITY is .m4a on both platforms,
    // but deriving it keeps transcription working if the preset ever changes.
    const ext = (audioUri.split('.').pop() ?? 'm4a').split('?')[0].toLowerCase();
    const mime = ext === 'm4a' || ext === 'mp4' ? 'audio/m4a'
      : ext === 'caf' ? 'audio/x-caf'
      : ext === 'wav' ? 'audio/wav'
      : `audio/${ext}`;

    const form = new FormData();
    // RN-specific multipart: name field is "file"
    form.append('file', {
      uri: audioUri,
      name: `recording.${ext}`,
      type: mime,
    } as any);
    form.append('model', 'whisper-1');

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/whisper-proxy`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body: form,
      },
    );

    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, text: data?.text ?? '' };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/embedding-proxy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ input: text, model: 'text-embedding-3-small' }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.embedding ?? null;
  } catch {
    return null;
  }
}
