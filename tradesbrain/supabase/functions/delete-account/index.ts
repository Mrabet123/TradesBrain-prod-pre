// delete-account — D2 F8 / BuildGuide M7 RULE 4.
// Permanently destroys all the caller's data:
//   • schedules the Stripe subscription to cancel at period end (D2 F8: the
//     worker keeps access/billing until the cycle boundary, then it STOPS —
//     it must not bill forever after the customer row is gone)
//   • storage objects under <userId>/ in kyc-documents + job-documents
//   • the public.users row (FK cascades clean up everything related)
//   • the auth.users row via the admin API
//
// Deploy with: supabase functions deploy delete-account
// Secrets:    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
//             STRIPE_SECRET_KEY

// @ts-ignore — Deno globals
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
// @ts-ignore — ESM via Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore — ESM via Deno
import Stripe from 'https://esm.sh/stripe@13.0.0';

// @ts-ignore Deno
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia' as Stripe.LatestApiVersion,
      httpClient: Stripe.createFetchHttpClient(),
    })
  : null;

// @ts-ignore Deno
const admin = createClient(
  // @ts-ignore Deno
  Deno.env.get('SUPABASE_URL')!,
  // @ts-ignore Deno
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

async function clearBucket(userId: string, bucket: string) {
  const { data: files } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
  const paths = (files ?? []).map((f: any) => `${userId}/${f.name}`);
  // Recursively walk one level deep (reports / quotes / etc.)
  for (const f of files ?? []) {
    if (f.id == null) {
      const sub = await admin.storage.from(bucket).list(`${userId}/${f.name}`, { limit: 1000 });
      for (const inner of sub.data ?? []) {
        paths.push(`${userId}/${f.name}/${inner.name}`);
      }
    }
  }
  if (paths.length > 0) await admin.storage.from(bucket).remove(paths);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors() });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const auth = req.headers.get('Authorization');
  if (!auth)
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });

  const userClient = createClient(
    // @ts-ignore Deno
    Deno.env.get('SUPABASE_URL')!,
    // @ts-ignore Deno
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });

  try {
    // 0) Schedule the Stripe subscription to cancel at period end BEFORE we
    //    destroy the user row (which holds stripe_customer_id). Otherwise the
    //    subscription keeps billing forever with no record to reconcile it.
    //    cancel_at_period_end keeps access until the cycle boundary (D2 F8),
    //    then Stripe stops billing on its own. If this step fails we abort the
    //    whole deletion so we never orphan an active subscription.
    if (stripe) {
      const { data: subRow } = await admin
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .not('stripe_subscription_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const subId = subRow?.stripe_subscription_id as string | undefined;
      if (subId) {
        try {
          const existing = await stripe.subscriptions.retrieve(subId);
          if (
            existing.status !== 'canceled' &&
            (existing as { cancel_at_period_end?: boolean }).cancel_at_period_end !== true
          ) {
            await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
          }
        } catch (stripeErr: any) {
          // If Stripe says the subscription no longer exists there is nothing to
          // orphan — proceed with deletion. Any other Stripe error (e.g. network)
          // must abort so we never delete the record while a live sub keeps
          // billing with no way to reconcile it.
          if (stripeErr?.code !== 'resource_missing') throw stripeErr;
        }
      }
    }

    // 1) Wipe storage objects — ISS-L8 (EF-7): clear ALL four user buckets so
    //    self-deletion leaves no orphaned storage (matches delete-team-member).
    await clearBucket(user.id, 'kyc-documents');
    await clearBucket(user.id, 'job-documents');
    await clearBucket(user.id, 'job-photos');
    await clearBucket(user.id, 'profile-assets');

    // 2) Delete public.users — FK cascade drops job_sessions, messages,
    //    job_reports, quotes, team_members, worker_preferences, subscriptions,
    //    billing_history (per D5 schema).
    const { error: delErr } = await admin.from('users').delete().eq('id', user.id);
    if (delErr) throw delErr;

    // 3) Delete auth user — requires service role
    const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
    if (authErr) throw authErr;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'delete failed' }), {
      status: 500,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  }
});
