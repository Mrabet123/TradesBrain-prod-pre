// D2 Sign In Flow, D6 Flow02 S5-S6 — Forgot password (LINK-based reset, locked spec).
// Phase 1 (request): user enters email → "Send reset link" → Supabase emails a
//                    clickable reset LINK (template uses {{ .ConfirmationURL }}).
// Phase 2 (sent):    "Reset link sent" confirmation — user goes to their inbox.
// Phase 3 (reset):   user taps the link → app reopens at
//                    tradesbrain://reset-password?code=… → we exchange the PKCE
//                    code for a short-lived recovery session → user enters +
//                    confirms a new password → updateUser({ password }) → signOut
//                    so the recovery session can't be reused → SignIn.
//
// recoveryMode (TC-018): exchanging the code creates a real session. Without the
// AuthContext recoveryMode flag the RootLayout gate would see "authenticated"
// and jump to Home before the worker can set a new password — the flag pins the
// auth stack so this screen stays mounted through the reset phase.

import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, Pressable, View, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import {
  sendPasswordReset,
  updatePassword,
  exchangeRecoveryCode,
  setRecoverySession,
} from '../../services/auth';
import { supabase } from '../../services/supabase';
import { useAuthContext } from '../../context/AuthContext';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_S = 60;

// Pull the PKCE code (query) or implicit tokens (fragment) out of the reset
// deep link. Supabase PKCE projects return ?code=… ; older/implicit templates
// return #access_token=…&refresh_token=…&type=recovery.
function parseRecoveryUrl(url: string): {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
} {
  let code: string | null = null;
  try {
    code = (Linking.parse(url).queryParams?.code as string) ?? null;
  } catch {
    /* not parseable as a structured URL — fall through to fragment parsing */
  }
  // Parse the fragment manually — React Native's URLSearchParams polyfill is
  // incomplete, so we split on &/= ourselves.
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  const fragment = url.split('#')[1];
  if (fragment) {
    const pairs = fragment.split('&');
    const frag: Record<string, string> = {};
    for (const pair of pairs) {
      const [k, v] = pair.split('=');
      if (k) frag[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    }
    accessToken = frag.access_token ?? null;
    refreshToken = frag.refresh_token ?? null;
    if (!code) code = frag.code ?? null;
  }
  return { code, accessToken, refreshToken };
}

export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const { setRecoveryMode } = useAuthContext();
  const incomingUrl = Linking.useURL();

  const [phase, setPhase] = useState<'request' | 'sent' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Inline banners replace blocking Alerts (keyboard-friendly + accessible).
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Handle the incoming reset deep link ──────────────────────────────────
  const handleRecoveryUrl = useCallback(
    async (url: string) => {
      if (!/reset-password/i.test(url)) return; // not our link
      const { code, accessToken, refreshToken } = parseRecoveryUrl(url);
      if (!code && !(accessToken && refreshToken)) return; // nothing to exchange

      // Arm recovery mode BEFORE the session appears so the gate keeps us here.
      setRecoveryMode(true);
      setExchanging(true);
      setErrorMsg(null);
      setSuccess(null);
      const { error } = code
        ? await exchangeRecoveryCode(code)
        : await setRecoverySession(accessToken!, refreshToken!);
      setExchanging(false);
      if (error) {
        setRecoveryMode(false);
        setErrorMsg(
          'That reset link is invalid or has expired. Request a new one below.',
        );
        setPhase('request');
        return;
      }
      setPhase('reset');
    },
    [setRecoveryMode],
  );

  useEffect(() => {
    if (incomingUrl) void handleRecoveryUrl(incomingUrl);
  }, [incomingUrl, handleRecoveryUrl]);

  useEffect(() => {
    // Belt-and-suspenders: if Supabase fires PASSWORD_RECOVERY for the session
    // (e.g. an implicit-flow link), jump straight to the reset phase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
        setPhase('reset');
        setSuccess(null);
        setErrorMsg(null);
      }
    });
    return () => {
      subscription.unsubscribe();
      // Safety net: if the worker abandons the screen mid-reset, don't leave the
      // gate pinned to the auth stack (TC-018).
      setRecoveryMode(false);
    };
  }, [setRecoveryMode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function onRequest() {
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    setSuccess(null);
    setBusy(true);
    const { error } = await sendPasswordReset(email.trim());
    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setResendCooldown(RESEND_COOLDOWN_S);
    setPhase('sent');
    setSuccess(`We sent a reset link to ${email.trim()}.`);
  }

  async function onResend() {
    if (resendCooldown > 0 || busy) return;
    setErrorMsg(null);
    setBusy(true);
    const { error } = await sendPasswordReset(email.trim());
    setBusy(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setResendCooldown(RESEND_COOLDOWN_S);
    setSuccess(`A new reset link was sent to ${email.trim()}.`);
  }

  async function onReset() {
    setErrorMsg(null);
    setSuccess(null);
    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setBusy(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      setBusy(false);
      setErrorMsg(error.message);
      return;
    }
    // Drop the recovery session so the user signs in fresh with the new
    // password, and clear recoveryMode so the gate stops pinning the auth stack.
    await supabase.auth.signOut();
    setRecoveryMode(false);
    setBusy(false);
    setSuccess('Password updated — sign in with your new password.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      try {
        nav.reset({ index: 0, routes: [{ name: 'SignIn' }] });
      } catch {
        /* if the navigator stack already changed (gate), this is a no-op */
      }
    }, 500);
  }

  const heading =
    phase === 'request' ? 'Reset password'
    : phase === 'sent' ? 'Check your email'
    : 'Set new password';
  const subhead =
    phase === 'request' ? 'We will email you a link to reset your password.'
    : phase === 'sent' ? `Tap the reset link we sent to ${email.trim()} to continue.`
    : 'Enter and confirm your new password (min 8 chars).';

  return (
    <KeyboardAwareScreen>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{heading}</Text>
      <Text className="text-sm text-gray-600 mb-6">{subhead}</Text>

      {exchanging && (
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex-row items-center">
          <ActivityIndicator />
          <Text className="text-blue-700 text-sm ml-2">Opening your reset link…</Text>
        </View>
      )}

      {!!success && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <Text className="text-green-700 text-sm">{success}</Text>
        </View>
      )}

      {!!errorMsg && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-700 text-sm">{errorMsg}</Text>
        </View>
      )}

      {phase === 'request' && (
        <>
          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrorMsg(null);
            }}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
          />
          <Pressable
            onPress={onRequest}
            disabled={!email || busy}
            className={`py-4 rounded-xl ${!email || busy ? 'bg-gray-300' : 'bg-brand'}`}
          >
            <Text className="text-center text-white font-semibold">
              {busy ? 'Sending…' : 'Send reset link →'}
            </Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('SignIn')} className="mt-4 self-center">
            <Text className="text-sm text-gray-600">← Back to sign in</Text>
          </Pressable>
        </>
      )}

      {phase === 'sent' && (
        <>
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <Text className="text-blue-700 text-sm leading-5">
              Check your email inbox — the reset link expires after 1 hour. Check
              your spam folder if it doesn't arrive within a minute. Tapping the
              link reopens TradesBrain so you can set a new password.
            </Text>
          </View>
          <Pressable
            onPress={onResend}
            disabled={resendCooldown > 0 || busy}
            className="self-center"
          >
            <Text className={`text-sm ${resendCooldown > 0 ? 'text-gray-400' : 'text-brand'}`}>
              {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : 'Resend reset link'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setPhase('request');
              setErrorMsg(null);
              setSuccess(null);
            }}
            disabled={busy}
            className="mt-3 self-center"
          >
            <Text className="text-sm text-gray-600">Use a different email</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('SignIn')} className="mt-3 self-center">
            <Text className="text-sm text-gray-600">← Back to sign in</Text>
          </Pressable>
        </>
      )}

      {phase === 'reset' && (
        <>
          <View className="flex-row items-center border border-gray-300 rounded-lg mb-3">
            <TextInput
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setErrorMsg(null);
              }}
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw}
              className="flex-1 px-3 py-3 text-base text-gray-900"
            />
            <Pressable onPress={() => setShowPw((v) => !v)} className="px-3 py-3">
              <Text className="text-gray-500 text-sm">{showPw ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <TextInput
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              setErrorMsg(null);
            }}
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPw}
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-3"
          />
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text className="text-xs text-red-600 mb-3">Passwords do not match.</Text>
          )}
          <Pressable
            onPress={onReset}
            disabled={busy || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className={`py-4 rounded-xl ${
              busy || !newPassword || !confirmPassword || newPassword !== confirmPassword
                ? 'bg-gray-300'
                : 'bg-brand'
            }`}
          >
            <Text className="text-center text-white font-semibold">
              {busy ? 'Saving…' : 'Update password'}
            </Text>
          </Pressable>
        </>
      )}

      {busy && (
        <View className="mt-4 items-center">
          <ActivityIndicator />
        </View>
      )}
    </KeyboardAwareScreen>
  );
}
