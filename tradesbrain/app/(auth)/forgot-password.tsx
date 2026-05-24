// D2 Sign In Flow, D6 Flow02 S5-S6 — Forgot password.
// Request reset email → user receives Supabase password reset link → app
// re-opens via deep link (tradesbrain://reset-password) → user enters new
// password → signs out (so the recovery session can't be reused) → returns
// to Sign In where they log in with the new password.

import React, { useEffect, useState } from 'react';
import { Text, TextInput, Pressable, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import { sendPasswordReset, updatePassword } from '../../services/auth';
import { supabase } from '../../services/supabase';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const [phase, setPhase] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  // Inline banners replace blocking Alerts (keyboard-friendly + accessible).
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // When the user taps the recovery email link, Supabase emits a
    // PASSWORD_RECOVERY event on the new session — flip to reset phase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPhase('reset');
        setSuccess(null);
        setErrorMsg(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
    setSuccess(
      `If an account exists for ${email.trim()}, a reset link has been sent. ` +
        'Open it on this device — the app will reopen to let you set a new password.',
    );
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
    // Drop the temporary recovery session so the user signs in fresh with the
    // new password. The RootLayout gate routes them back to SignIn once
    // onAuthStateChange clears.
    await supabase.auth.signOut();
    setBusy(false);
    setSuccess('Password updated — sign in with your new password.');
    setNewPassword('');
    setConfirmPassword('');
    // Best-effort manual nav for users who tapped the deep link.
    setTimeout(() => {
      try {
        nav.reset({ index: 0, routes: [{ name: 'SignIn' }] });
      } catch {
        /* if the navigator stack already changed (gate), this is a no-op */
      }
    }, 500);
  }

  return (
    <KeyboardAwareScreen>
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {phase === 'request' ? 'Reset password' : 'Set new password'}
      </Text>
      <Text className="text-sm text-gray-600 mb-6">
        {phase === 'request'
          ? 'We will email you a link to reset your password. Open the link on this device.'
          : 'Enter and confirm your new password (min 8 chars).'}
      </Text>

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

      {phase === 'request' ? (
        <>
          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrorMsg(null);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="border border-gray-300 rounded-lg px-3 py-3 text-base mb-4"
          />
          <Pressable
            onPress={onRequest}
            disabled={!email || busy}
            className={`py-4 rounded-xl ${!email || busy ? 'bg-gray-300' : 'bg-brand'}`}
          >
            <Text className="text-center text-white font-semibold">
              {busy ? 'Sending…' : 'Send reset email'}
            </Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('SignIn')} className="mt-4 self-center">
            <Text className="text-sm text-gray-600">Back to sign in</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View className="flex-row items-center border border-gray-300 rounded-lg mb-3">
            <TextInput
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setErrorMsg(null);
              }}
              placeholder="New password"
              secureTextEntry={!showPw}
              className="flex-1 px-3 py-3 text-base"
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
            secureTextEntry={!showPw}
            className="border border-gray-300 rounded-lg px-3 py-3 text-base mb-3"
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
