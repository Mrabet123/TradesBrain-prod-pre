// Hard gate rendered by RootLayout when a session exists but the auth user is
// not yet fully verified — either:
//   • email-signup user who verified only one of email / SMS, or
//   • email-signup user who signed back in but never finished phone OTP, or
//   • phone-signin user whose phone confirmation expired (rare).
// The screen lets the worker finish the missing OTP(s) and offers a Sign-out
// escape so they can switch accounts. Until both channels are confirmed the
// app stack is unreachable — this is the fix for "verifying just one OTP took
// me into Home".

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import {
  verifyEmailOtp,
  verifyPhoneOtp,
  resendEmailOtp,
  resendPhoneOtp,
} from '../../services/auth';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';

const RESEND_COOLDOWN_S = 60;

function isExpiredOtpError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message ?? '').toLowerCase();
  return error.code === 'otp_expired' || msg.includes('expired');
}

export default function VerifyPendingScreen() {
  const { user, emailVerified, phoneVerified, refreshUser, signOut } = useAuthContext();

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  useEffect(() => {
    if (emailCooldown <= 0 && phoneCooldown <= 0) return;
    const t = setInterval(() => {
      setEmailCooldown((s) => (s > 0 ? s - 1 : 0));
      setPhoneCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [emailCooldown, phoneCooldown]);

  // Auto-send the missing OTP(s) on mount so the user doesn't have to tap
  // Resend before the first code arrives. We only do this once per mount, and
  // we set the resend cooldown immediately so we never spam Supabase.
  const autoSentRef = React.useRef(false);
  useEffect(() => {
    if (autoSentRef.current || !user) return;
    autoSentRef.current = true;
    (async () => {
      if (!emailVerified && user.email) {
        setEmailCooldown(RESEND_COOLDOWN_S);
        await resendEmailOtp(user.email).catch(() => {});
      }
      if (!phoneVerified && user.phone) {
        setPhoneCooldown(RESEND_COOLDOWN_S);
        await resendPhoneOtp(user.phone.startsWith('+') ? user.phone : `+${user.phone}`).catch(() => {});
      }
    })();
  }, [user, emailVerified, phoneVerified]);

  const needEmail = !emailVerified && !!user?.email;
  const needPhone = !phoneVerified && !!user?.phone;

  async function onVerifyEmail() {
    if (!user?.email || emailCode.length < 4) return;
    setBusy(true);
    const { error } = await verifyEmailOtp(user.email, emailCode);
    setBusy(false);
    if (error) {
      Alert.alert(
        isExpiredOtpError(error) ? 'Code expired' : 'Wrong code',
        isExpiredOtpError(error)
          ? 'Tap "Resend code" to get a new one.'
          : 'Email code is incorrect.',
      );
      return;
    }
    setEmailCode('');
    await refreshUser();
  }

  async function onVerifyPhone() {
    if (!user?.phone || phoneCode.length < 4) return;
    setBusy(true);
    const { error } = await verifyPhoneOtp((user.phone.startsWith('+') ? user.phone : `+${user.phone}`), phoneCode);
    setBusy(false);
    if (error) {
      Alert.alert(
        isExpiredOtpError(error) ? 'Code expired' : 'Wrong code',
        isExpiredOtpError(error)
          ? 'Tap "Resend code" to get a new one.'
          : 'SMS code is incorrect.',
      );
      return;
    }
    setPhoneCode('');
    await refreshUser();
  }

  async function onResendEmail() {
    if (!user?.email || emailCooldown > 0) return;
    setEmailCooldown(RESEND_COOLDOWN_S);
    const { error } = await resendEmailOtp(user.email);
    if (error) Alert.alert('Resend failed', error.message);
  }

  async function onResendPhone() {
    if (!user?.phone || phoneCooldown > 0) return;
    setPhoneCooldown(RESEND_COOLDOWN_S);
    const { error } = await resendPhoneOtp((user.phone.startsWith('+') ? user.phone : `+${user.phone}`));
    if (error) Alert.alert('Resend failed', error.message);
  }

  return (
    <KeyboardAwareScreen>
      <Text className="text-2xl font-bold text-gray-900 mb-1">Verify your account</Text>
      <Text className="text-sm text-gray-600 mb-6">
        Both your email and phone must be verified before you can use TradesBrain.
      </Text>

      {needEmail ? (
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">Email code</Text>
            <Text className="text-xs text-amber-600 font-semibold">pending</Text>
          </View>
          <Text className="text-xs text-gray-500 mb-2">Sent to {user?.email}</Text>
          <View className="flex-row gap-2">
            <TextInput
              value={emailCode}
              onChangeText={setEmailCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              editable={!busy}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 tracking-widest"
            />
            <Pressable
              onPress={onVerifyEmail}
              disabled={busy || emailCode.length < 4}
              className={`px-4 py-3 rounded-lg ${
                busy || emailCode.length < 4 ? 'bg-gray-300' : 'bg-brand'
              }`}
            >
              <Text className="text-white font-semibold">Verify</Text>
            </Pressable>
          </View>
          <Pressable onPress={onResendEmail} disabled={emailCooldown > 0} className="mt-2">
            <Text className={`text-sm ${emailCooldown > 0 ? 'text-gray-400' : 'text-brand'}`}>
              {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : 'Resend code'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="mb-5 flex-row items-center">
          <Text className="text-sm font-medium text-gray-700 mr-2">Email</Text>
          <Text className="text-green-600 text-sm font-semibold">verified ✓</Text>
        </View>
      )}

      {needPhone ? (
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-medium text-gray-700">SMS code</Text>
            <Text className="text-xs text-amber-600 font-semibold">pending</Text>
          </View>
          <Text className="text-xs text-gray-500 mb-2">
            Sent to +{user?.phone?.replace(/^\+/, '')}
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              value={phoneCode}
              onChangeText={setPhoneCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              editable={!busy}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 tracking-widest"
            />
            <Pressable
              onPress={onVerifyPhone}
              disabled={busy || phoneCode.length < 4}
              className={`px-4 py-3 rounded-lg ${
                busy || phoneCode.length < 4 ? 'bg-gray-300' : 'bg-brand'
              }`}
            >
              <Text className="text-white font-semibold">Verify</Text>
            </Pressable>
          </View>
          <Pressable onPress={onResendPhone} disabled={phoneCooldown > 0} className="mt-2">
            <Text className={`text-sm ${phoneCooldown > 0 ? 'text-gray-400' : 'text-brand'}`}>
              {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : 'Resend code'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="mb-5 flex-row items-center">
          <Text className="text-sm font-medium text-gray-700 mr-2">Phone</Text>
          <Text className="text-green-600 text-sm font-semibold">verified ✓</Text>
        </View>
      )}

      {busy && (
        <View className="items-center my-3">
          <ActivityIndicator />
        </View>
      )}

      <Pressable onPress={signOut} className="mt-6 self-center">
        <Text className="text-sm text-gray-600 underline">Sign out and use a different account</Text>
      </Pressable>
    </KeyboardAwareScreen>
  );
}
