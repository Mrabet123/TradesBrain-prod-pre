// M0 — Project Scaffolding & Infrastructure
// See app/_layout.tsx for the full per-milestone Build Report stack.

import './global.css';

import React from 'react';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';

import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { TradeProfileProvider } from './context/TradeProfileContext';
import { NetworkProvider } from './context/NetworkContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import RootLayout from './app/_layout';
import type { RootStackParamList } from './app/_layout';

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
      <NetworkProvider>
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.app.tradesbrain"
          urlScheme="tradesbrain"
        >
          <AuthProvider>
            <SubscriptionProvider>
              <TradeProfileProvider>
                <NavigationContainer linking={linking}>
                  <RootLayout />
                </NavigationContainer>
                <StatusBar style="auto" />
              </TradeProfileProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </StripeProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}
