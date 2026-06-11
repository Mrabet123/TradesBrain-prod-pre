// claude-proxy — proxies the Anthropic Messages API.
// The mobile bundle must never carry ANTHROPIC_API_KEY (D4 Rule). The
// confidential Rex system prompts live here too (RULE 10): the app sends
// trade_type + mode + rag_context and this function assembles the system
// message — see prompts.ts. A raw `system` string is still honoured for
// non-Rex utility calls (e.g. the conversation summariser, document drafting).
// Deploy with: supabase functions deploy claude-proxy
// Secrets: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

// @ts-ignore — Deno globals available in Supabase Edge Functions runtime
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildSystemPrompt } from './prompts.ts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ISS-H3: verify the caller's JWT before proxying to Anthropic — closes the
  // open cost-exposure gap (whisper-proxy / embedding-proxy were already gated).
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
  // @ts-ignore Deno
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  // @ts-ignore Deno
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return new Response('Missing ANTHROPIC_API_KEY', { status: 500 });

  const body = await req.json();

  // Assemble the system message. Rex calls send trade_type + mode; the prompt
  // is built server-side so it never ships in the app bundle. A raw `system`
  // string is honoured as-is for non-Rex utility calls.
  const KNOWN_TRADES = ['plumber', 'electrician', 'hvac', 'roofer'];
  let system: string;
  if (typeof body.trade_type === 'string') {
    // Don't trust the client-supplied trade for prompt selection — the trade
    // gates which safety rules load (gas vs CO vs fall vs LOTO). Re-validate
    // against the authenticated user's stored trade.
    let tradeType = body.trade_type;
    const { data: profile } = await userClient
      .from('users')
      .select('trade_type')
      .eq('id', user.id)
      .single();
    const storedTrade = profile?.trade_type;
    if (storedTrade && storedTrade !== 'other') {
      // Concrete registered trade is authoritative — a worker cannot spoof a
      // different trade's prompt or safety rules by editing the client payload.
      tradeType = storedTrade;
    } else if (KNOWN_TRADES.includes(body.trade_type)) {
      // Registered as 'other' / General Contractor (no inherent safety ruleset):
      // honour the concrete trade the worker confirmed at session start (D7
      // §6.1 — 'other' routes to the nearest real profile, never silently
      // Plumber). The client gates a new 'other' session behind this choice.
      tradeType = body.trade_type;
    } else {
      // Degenerate fallback: registered 'other' AND no concrete per-session
      // trade supplied (e.g. a legacy session row created before the trade
      // picker shipped). Default to Plumber so the call still succeeds; new
      // sessions never reach this path.
      tradeType = 'plumber';
    }

    system = buildSystemPrompt({
      tradeType,
      mode: typeof body.mode === 'string' ? body.mode : 'diagnosis',
      ragContext: typeof body.rag_context === 'string' ? body.rag_context : undefined,
    });
  } else if (typeof body.system === 'string') {
    system = body.system;
  } else {
    return new Response(JSON.stringify({ error: 'Missing trade_type or system' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const upstream = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: body.model,
      system,
      messages: body.messages,
      max_tokens: body.max_tokens ?? 2000,
    }),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      ...corsHeaders(),
      'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
    },
  });
});

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}
