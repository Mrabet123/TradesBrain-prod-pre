/*
 * ══════════════════════════════════════════════════════════════════════════════
 * TRADESBRAIN — M0 BUILD REPORT
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ## M0 BUILD REPORT
 *
 * ### Files Created
 * - app/(auth)/welcome.tsx, signup.tsx, signin.tsx, otp-verify.tsx — Auth screens (skeleton)
 * - app/(tabs)/home.tsx, rex.tsx, report.tsx, quote.tsx, codes.tsx, history.tsx — Tab screens (skeleton)
 * - app/job/[sessionId].tsx, app/job/detail/[jobId].tsx — Job screens (skeleton)
 * - app/settings/index.tsx, profile.tsx, trade.tsx, team.tsx, subscription.tsx, legal.tsx
 * - app/paywall.tsx — Paywall screen (skeleton)
 * - components/rex/* — MessageBubble, VoiceRecordButton, PhotoCapture, ContextualButtons, StreamingText
 * - components/documents/* — ReportPreview, QuotePreview
 * - components/shared/* — SubscriptionGate, LoadingSpinner, ErrorBoundary, ToastNotification
 * - components/team/* — KpiDashboard, MemberCard
 * - context/* — AuthContext, SubscriptionContext, TradeProfileContext
 * - services/* — anthropic, openai, supabase, stripe, rag, router, summariser
 * - hooks/* — useAuth, useSubscription, useRexSession, useVoiceRecording, usePhotoCapture
 * - utils/* — imageCompression, ragInjector, tokenEstimator, formatters
 * - types/* — session, user, documents, subscription
 * - constants/* — api, limits, pricing, tradeProfiles
 *
 * ### Supabase Tables Created (SQL migration ready)
 * 1. code_documents — RLS enabled (authenticated read-only)
 * 2. code_chunks — RLS enabled (authenticated read-only) + pgvector
 * 3. users — RLS enabled (own row only)
 * 4. team_members — RLS enabled (owner + member)
 * 5. worker_preferences — RLS enabled (own row only)
 * 6. subscriptions — RLS enabled (own row only)
 * 7. billing_history — RLS enabled (own row only)
 * 8. job_sessions — RLS enabled (own row only)
 * 9. messages — RLS enabled (via job_sessions join)
 * 10. job_reports — RLS enabled (own row only)
 * 11. quotes — RLS enabled (own row only)
 * 12. audit_logs — RLS enabled (service role only)
 *
 * ### Edge Functions Deployed (code ready for deployment)
 * 1. handle-stripe-webhook — Subscription & billing events
 * 2. kyc-webhook — Stripe Identity KYC events
 * 3. decrement-trial-query — Trial query counter
 * 4. kyc-status-check — KYC status verification
 * 5. stripe-create-checkout — Checkout session creation
 * 6. stripe-update-subscription — Plan changes & seats
 * 7. calculate-days-remaining — Subscription day counter
 * 8. send-push-notification — Push notification delivery
 * 9. create-team-member — Team member account creation
 * 10. delete-team-member — Team member cascade deletion
 * 11. ingest-code-document — RAG document ingestion
 *
 * ### Stripe Configuration
 * Products and prices must be created in Stripe Dashboard per D9 Section 1.2-1.3
 *
 * ### Security Verification
 * No API keys in mobile app files. All sensitive keys in Edge Function env vars only.
 * Safe in app: SUPABASE_ANON_KEY, STRIPE_PUBLISHABLE_KEY (via EXPO_PUBLIC_ prefix)
 *
 * ### Deviations from Documentation: NONE
 *
 * ### What Is NOT Built Yet (M1)
 * - Auth screens UI implementation
 * - Sign-up form with all D1 Section 7 fields
 * - Dual OTP verification
 * - KYC photo upload flow
 * - Sign-in with 3 methods
 * - Session persistence
 * - Home screen with 6-tab bottom navigation
 * ══════════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { TradeProfileProvider } from './context/TradeProfileContext';
import ErrorBoundary from './components/shared/ErrorBoundary';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export default function App() {
  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.app.tradesbrain"
        urlScheme="tradesbrain"
      >
        <AuthProvider>
          <SubscriptionProvider>
            <TradeProfileProvider>
              <NavigationContainer>
                {/* Navigation structure will be built in M1 */}
              </NavigationContainer>
              <StatusBar style="auto" />
            </TradeProfileProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}
