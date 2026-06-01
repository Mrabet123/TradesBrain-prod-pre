// D2 Sign Up Step 5 → Step 6, D6 Flow01 S5 — Email OTP verification.
// Step 1: enter and verify the EMAIL code.
// Step 2: Terms acceptance → createUserProfile → Home tabs.
//
// Phone OTP was removed from the sign-up flow — phone becomes a
// Settings → Profile feature. Only the email channel is confirmed here.
//
// Wrong OTP × 3 → lock OTP input 5 min with countdown.
// The OtpVerify screen never navigates the user away on its own — RootLayout's
// gate keeps them here while profileSetupPending is true.

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TermsOverlay from '../../components/shared/TermsOverlay';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { useAuthContext } from '../../context/AuthContext';
import {
  verifyEmailOtp,
  resendEmailOtp,
  createUserProfile,
  type SignUpInput,
} from '../../services/auth';

type Params = { OtpVerify: { signUpData: SignUpInput } };

function isExpiredOtpError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  return error.code === 'otp_expired' || msg.includes('expired');
}

const RESEND_COOLDOWN_S = 60;
const LOCKOUT_S = 300; // 5 minutes
const MAX_WRONG = 3;
const LOCKOUT_KEY = 'tb_otp_lockout';

export default function OtpVerifyScreen() {
  const { refreshProfileStatus, setProfileSetupPending, refreshUser } = useAuthContext();
  const route = useRoute<RouteProp<Params, 'OtpVerify'>>();
  const data = route.params.signUpData;

  const [emailCode, setEmailCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const [emailWrong, setEmailWrong] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const [emailCooldown, setEmailCooldown] = useState(0);

  const [busy, setBusy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setEmailCooldown((s) => (s > 0 ? s - 1 : 0));
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(LOCKOUT_KEY).then((raw) => {
      if (!raw) return;
      const until = Number(raw);
      if (Number.isFinite(until) && until > Date.now()) {
        setLockedUntil(until);
      } else {
        AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
      }
    });
  }, []);

  const lockSecondsLeft = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - now) / 1000))
    : 0;
  const isLocked = lockSecondsLeft > 0;

  useEffect(() => {
    if (lockedUntil && now >= lockedUntil) {
      setLockedUntil(null);
      setEmailWrong(0);
      AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    }
  }, [now, lockedUntil]);

  async function tryVerifyEmail() {
    if (isLocked || emailVerified || emailCode.length < 4) return;
    setBusy(true);
    const { error } = await verifyEmailOtp(data.email, emailCode);
    setBusy(false);
    if (error) {
      if (isExpiredOtpError(error)) {
        Alert.alert('Code expired', 'That email code has expired — tap "Resend code" for a new one.');
        return;
      }
      const next = emailWrong + 1;
      setEmailWrong(next);
      if (next >= MAX_WRONG) {
        const until = Date.now() + LOCKOUT_S * 1000;
        setLockedUntil(until);
        AsyncStorage.setItem(LOCKOUT_KEY, String(until)).catch(() => {});
      }
      Alert.alert('Wrong code', 'Email code is incorrect.');
      return;
    }
    setEmailVerified(true);
    setEmailCode('');
    // Email confirmed — refresh so email_confirmed_at flows into the gate.
    await refreshUser();
  }

  // D2 Step 5 → Step 6 — email verified locally. verifyOtp already validates
  // server-side, so a successful result means the channel is confirmed; open
  // the Terms overlay to finish account creation.
  useEffect(() => {
    if (!emailVerified || showTerms) return;
    AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    setShowTerms(true);
  }, [emailVerified, showTerms]);

  async function onAgreeTerms() {
    setShowTerms(false);
    setBusy(true);
    try {
      await createUserProfile(data);
      await refreshProfileStatus();
    } catch (e: any) {
      setProfileSetupPending(false);
      Alert.alert('Sign up incomplete', e?.message ?? 'Could not create profile.');
    } finally {
      setBusy(false);
    }
  }

  async function resendEmail() {
    if (emailCooldown > 0) return;
    setEmailCooldown(RESEND_COOLDOWN_S);
    const { error } = await resendEmailOtp(data.email);
    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      // Supabase rate-limits resends to ~60s. Surface that clearly so the
      // worker doesn't think Resend is silently broken.
      if (msg.includes('rate') || msg.includes('too many') || msg.includes('seconds')) {
        Alert.alert(
          'Wait a moment',
          'Supabase only allows one code per minute per email. Wait until the timer below the input runs out, then tap Resend again.',
        );
      } else if (msg.includes('already') && msg.includes('confirm')) {
        // Email is already verified server-side. Mark locally and move on.
        setEmailVerified(true);
        Alert.alert('Already verified', 'Your email is already verified — finishing up.');
      } else {
        Alert.alert('Resend failed', error.message);
      }
      // Reset cooldown so the user can try again immediately for non-rate
      // errors (rate-limit cooldown is already tracked locally).
      if (!msg.includes('rate') && !msg.includes('too many') && !msg.includes('seconds')) {
        setEmailCooldown(0);
      }
    }
  }

  return (
    <KeyboardAwareScreen>
      <Text className="text-2xl font-bold text-gray-900 mb-1">Verify your email</Text>
      <Text className="text-sm text-gray-600 mb-6">
        Enter the 6-digit code we sent to your email to finish creating your account.
      </Text>

      {isLocked && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-700 font-semibold">Too many wrong attempts</Text>
          <Text className="text-red-700 text-sm">
            Try again in {Math.floor(lockSecondsLeft / 60)}m {lockSecondsLeft % 60}s.
          </Text>
        </View>
      )}

      <OtpRow
        label="Email code"
        target={data.email}
        value={emailCode}
        onChangeText={setEmailCode}
        onVerify={tryVerifyEmail}
        onResend={resendEmail}
        verified={emailVerified}
        cooldown={emailCooldown}
        disabled={isLocked || busy || emailVerified}
      />

      {busy && (
        <View className="mt-6 items-center">
          <ActivityIndicator />
          <Text className="text-gray-500 text-sm mt-2">Working…</Text>
        </View>
      )}

      {emailVerified && !showTerms && !busy && (
        <View className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Text className="text-amber-800 text-sm mb-2">
            One last step — review and accept the Terms to finish creating your
            account.
          </Text>
          <Pressable
            onPress={() => setShowTerms(true)}
            className="bg-brand py-3 rounded-lg"
          >
            <Text className="text-center text-white font-semibold">
              Review Terms & continue
            </Text>
          </Pressable>
        </View>
      )}

      <TermsOverlay
        visible={showTerms}
        onAgree={onAgreeTerms}
        onClose={() => setShowTerms(false)}
      />
    </KeyboardAwareScreen>
  );
}

function OtpRow(props: {
  label: string;
  target: string;
  value: string;
  onChangeText: (v: string) => void;
  onVerify: () => void;
  onResend: () => void;
  verified: boolean;
  cooldown: number;
  disabled: boolean;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-medium text-gray-700">{props.label}</Text>
        {props.verified && (
          <Text className="text-green-600 text-sm font-semibold">verified ✓</Text>
        )}
      </View>
      <Text className="text-xs text-gray-500 mb-2">Sent to {props.target}</Text>
      <View className="flex-row gap-2">
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          editable={!props.verified && !props.disabled}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="123456"
          placeholderTextColor="#9CA3AF"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 tracking-widest"
        />
        <Pressable
          onPress={props.onVerify}
          disabled={props.disabled || props.value.length < 4}
          className={`px-4 py-3 rounded-lg ${
            props.disabled || props.value.length < 4 ? 'bg-gray-300' : 'bg-brand'
          }`}
        >
          <Text className="text-white font-semibold">Verify</Text>
        </Pressable>
      </View>
      <Pressable onPress={props.onResend} disabled={props.cooldown > 0 || props.verified} className="mt-2">
        <Text className={`text-sm ${props.cooldown > 0 ? 'text-gray-400' : 'text-brand'}`}>
          {props.cooldown > 0 ? `Resend in ${props.cooldown}s` : 'Resend code'}
        </Text>
      </Pressable>
    </View>
  );
}
