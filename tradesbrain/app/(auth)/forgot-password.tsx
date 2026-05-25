// D2 Sign In Flow, D6 Flow02 S5-S6 — Forgot password (3-phase OTP flow).
// Phase 1 (request): user enters email → Supabase emails a 6-digit recovery code.
// Phase 2 (otp):     user enters the code → verifyOtp({ type: 'recovery' })
//                    establishes a short-lived recovery session.
// Phase 3 (reset):   user enters + confirms a new password → updateUser({ password })
//                    → signOut so the recovery session can't be reused → SignIn.
//
// We also keep listening for Supabase's PASSWORD_RECOVERY event in case the
// project's email template still sends a deep-link instead of a token — in that
// case we jump straight to phase 3.

import React, { useEffect, useState } from 'react';
import { Text, TextInput, Pressable, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import {
  sendPasswordReset,
  updatePassword,
  verifyRecoveryOtp,
} from '../../services/auth';
import { supabase } from '../../services/supabase';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_S = 60;

export default function ForgotPasswordScreen() {
  const nav = useNavigation<Nav>();
  const [phase, setPhase] = useState<'request' | 'otp' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Inline banners replace blocking Alerts (keyboard-friendly + accessible).
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Some Supabase projects still email a clickable link instead of a token —
    // if the user taps it, PASSWORD_RECOVERY fires with a fresh session and we
    // can skip the OTP step.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPhase('reset');
        setSuccess(null);
        setErrorMsg(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
    setPhase('otp');
    setSuccess(`We sent a 6-digit code to ${email.trim()}. Enter it below.`);
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
    setOtpCode('');
    setResendCooldown(RESEND_COOLDOWN_S);
    setSuccess(`A new code was sent to ${email.trim()}.`);
  }

  async function onVerifyOtp() {
    setErrorMsg(null);
    setSuccess(null);
    if (otpCode.trim().length < 6) {
      setErrorMsg('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    const { error } = await verifyRecoveryOtp(email.trim(), otpCode.trim());
    setBusy(false);
    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      const isExpired = msg.includes('expired') || (error as any).code === 'otp_expired';
      setErrorMsg(
        isExpired
          ? 'That code expired — tap "Resend code" to get a new one.'
          : 'Code is incorrect. Check the email and try again.',
      );
      return;
    }
    setPhase('reset');
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
    // password. RootLayout's gate routes them back to SignIn once
    // onAuthStateChange clears.
    await supabase.auth.signOut();
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
    : phase === 'otp' ? 'Enter reset code'
    : 'Set new password';
  const subhead =
    phase === 'request' ? 'We will email you a 6-digit reset code.'
    : phase === 'otp' ? `Enter the code we sent to ${email.trim()}.`
    : 'Enter and confirm your new password (min 8 chars).';

  return (
    <KeyboardAwareScreen>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{heading}</Text>
      <Text className="text-sm text-gray-600 mb-6">{subhead}</Text>

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
              {busy ? 'Sending…' : 'Send reset code'}
            </Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('SignIn')} className="mt-4 self-center">
            <Text className="text-sm text-gray-600">Back to sign in</Text>
          </Pressable>
        </>
      )}

      {phase === 'otp' && (
        <>
          <TextInput
            value={otpCode}
            onChangeText={(t) => {
              setOtpCode(t.replace(/\D/g, ''));
              setErrorMsg(null);
            }}
            placeholder="123456"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 tracking-widest mb-3"
          />
          <Pressable
            onPress={onVerifyOtp}
            disabled={busy || otpCode.length < 6}
            className={`py-4 rounded-xl ${
              busy || otpCode.length < 6 ? 'bg-gray-300' : 'bg-brand'
            }`}
          >
            <Text className="text-center text-white font-semibold">
              {busy ? 'Verifying…' : 'Verify code'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onResend}
            disabled={resendCooldown > 0 || busy}
            className="mt-3 self-center"
          >
            <Text className={`text-sm ${resendCooldown > 0 ? 'text-gray-400' : 'text-brand'}`}>
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setPhase('request');
              setOtpCode('');
              setErrorMsg(null);
              setSuccess(null);
            }}
            disabled={busy}
            className="mt-3 self-center"
          >
            <Text className="text-sm text-gray-600">Use a different email</Text>
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
