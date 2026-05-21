# TradesBrain — Claude Code Project Guide

## Project Overview

React Native trade-diagnostics app (Expo SDK 55, RN 0.83, TypeScript 5.x).
AI co-pilot "Rex" for plumbers and electricians: photo + voice input, step-by-step job
guidance, job reports, quotes, trade code RAG lookup.
Backend: Supabase (PostgreSQL + pgvector + Auth + Edge Functions + Storage).
Payments and KYC: Stripe (subscriptions, Stripe Identity).
Build: iOS via EAS cloud (no Mac access); Android locally.

## Key Security Rules — Non-Negotiable

1. **No API keys in the mobile bundle.** All Anthropic, OpenAI, and Stripe-secret calls go
   through Supabase Edge Function proxies: `claude-proxy`, `whisper-proxy`, `embedding-proxy`.
   Keys live only in Supabase Edge Function environment variables.

2. **System prompts are server-side only.** Rex prompts live in
   `supabase/functions/claude-proxy/prompts.ts`. The file `constants/systemPrompts.ts` was
   deleted; the client never holds prompt text.

3. **JWT/session in Expo SecureStore — never AsyncStorage.**

4. **`trial_queries_remaining` decremented server-side only** via the `decrement-trial-query`
   Edge Function. The client must never write this field directly.

5. **Stripe webhooks verify the Stripe signature** inside `handle-stripe-webhook` before
   touching the database.

6. **Finalised documents are permanently locked** by a DB trigger (`prevent_finalised_update`).
   Once `status = 'finalised'` on a `job_reports` or `quotes` row, no UPDATE is possible.

## Folder Layout (key paths)

```
tradesbrain/
  app/              Expo Router screens (file-based routing)
  components/       UI components (rex/, documents/, shared/, history/, codes/, team/)
  services/         All external API calls — one responsibility per file
  hooks/            Custom React hooks
  context/          Auth, Subscription, TradeProfile, Network contexts
  constants/        Static values (api.ts, limits.ts, pricing.ts, appVersion.ts, ...)
  types/            Shared TypeScript types
  supabase/
    functions/      Edge Functions (Deno) — proxies + webhooks + admin operations
    migrations/     Versioned SQL migrations
```

## Build Notes

- **iOS**: always built via `eas build --platform ios`. No local Xcode required.
- **Android**: built locally with Gradle.
- **OOM workaround** (`react-native-worklets` CMake OOM on Android EAS workers):
  In `eas.json`, set `resourceClass: "large"` and pass
  `-PreactNativeArchitectures=arm64-v8a` to limit ABIs to one during EAS builds.
- **TypeScript check**: `npx tsc --noEmit` — run this after any structural change.

## Database Quick Reference

- 13 tables: 11 app tables + `code_chunks` (pgvector RAG) + `app_config` (force-upgrade gate).
- RLS enabled on every table. User-owned tables use `auth.uid() = user_id`.
- `app_config` is a single-row table; `min_supported_version` drives `ForceUpgradeScreen`.
- `users.expo_push_token` stores the Expo push token; written by `services/pushNotifications.ts`,
  read by `send-push-notification` Edge Function.

## KYC Flow (canonical — CC-1)

KYC is **auto-initiated at sign-up completion**: the sign-up handler mints two Stripe Identity
sessions (national ID + license proof) and seeds both KYC status columns to `pending`.
The Settings → Profile re-upload flow is a fallback for rejection cases only.

## Instruction Documents

Full specs live in `../Instructions/` (D1–D10). Locked base versions; amendments
appended in-place with version + date markers. Never edit locked base content.
