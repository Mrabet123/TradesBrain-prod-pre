import { supabase } from './supabase';

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function transcribeAudio(audioUri: string): Promise<ServiceResult<string>> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const formData = new FormData();
    formData.append('file', { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' } as any);
    formData.append('model', 'whisper-1');

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/whisper-proxy`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      }
    );

    if (!response.ok) throw new Error(`Whisper API error: ${response.status}`);
    const data = await response.json();
    return { success: true, data: data.text };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/embedding-proxy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ input: text, model: 'text-embedding-3-small' }),
    }
  );

  const data = await response.json();
  return data.embedding;
}
