// whisper-proxy — proxies OpenAI Whisper API for audio transcription.
// Deploy with: supabase functions deploy whisper-proxy
// Secrets: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

// @ts-ignore — Deno globals available in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors() });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // ISS-08: Verify caller JWT before proxying to OpenAI (cost-exposure guard).
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  // @ts-ignore Deno
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  // @ts-ignore Deno
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return new Response('Missing OPENAI_API_KEY', { status: 500 });

  const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: req.body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...cors(),
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
    },
  });
});

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
