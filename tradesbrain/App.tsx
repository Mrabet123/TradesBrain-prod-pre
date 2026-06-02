// M0 — Project Scaffolding & Infrastructure
// See app/_layout.tsx for the full per-milestone Build Report stack.

import './global.css';

import React from 'react';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { TradeProfileProvider } from './context/TradeProfileContext';
import { NetworkProvider } from './context/NetworkContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import RootLayout from './app/_layout';
import type { RootStackParamList } from './app/_layout';
import { navigationRef, flushPendingDeepLink } from './services/deepLinks';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Deep-link config — Supabase password-reset email links to
// tradesbrain://reset-password, which routes to the ForgotPassword screen.
// The screen subscribes to onAuthStateChange('PASSWORD_RECOVERY') and flips
// into 'reset' phase so the worker can set a new password.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'tradesbrain://'],
  config: {
    screens: {
      ForgotPassword: 'reset-password',
      VerifyPending: 'verify',
      SignIn: 'sign-in',
      Welcome: '',
    },
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      {/* SafeAreaProvider must wrap the whole tree so every screen (and the
          bottom tab bar) can read the real status-bar / navigation-bar insets.
          Without it the app draws edge-to-edge on Android and content slides
          under the system bars (e.g. the hold-to-record button hiding behind
          the 3-button nav bar). */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NetworkProvider>
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.app.tradesbrain"
          urlScheme="tradesbrain"
        >
          <AuthProvider>
            <SubscriptionProvider>
              <TradeProfileProvider>
                <NavigationContainer
                  ref={navigationRef}
                  linking={linking}
                  onReady={flushPendingDeepLink}
                >
                  <RootLayout />
                </NavigationContainer>
                <StatusBar style="auto" />
              </TradeProfileProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </StripeProvider>
      </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
