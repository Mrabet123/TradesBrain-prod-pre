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
  deleteAccountFully,
} from '../../services/auth';
import { supabase } from '../../services/supabase';
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
  // Resend before the first code arrives. Once per mount only. If Supabase
  // rate-limits us (60s window from the most recent send) we just leave the
  // cooldown at zero so the user can manually retry as soon as they've
  // waited it out — the next manual tap surfaces the actual error.
  const autoSentRef = React.useRef(false);
  const [autoSendNote, setAutoSendNote] = useState<string | null>(null);
  useEffect(() => {
    if (autoSentRef.current || !user) return;
    autoSentRef.current = true;
    (async () => {
      if (!emailVerified && user.email) {
        const { error } = await resendEmailOtp(user.email);
        if (!error) {
          setEmailCooldown(RESEND_COOLDOWN_S);
        } else {
          const msg = (error.message ?? '').toLowerCase();
          if (msg.includes('rate') || msg.includes('seconds') || msg.includes('too many')) {
            setAutoSendNote('A code was sent recently — check your inbox, or tap Resend after a minute.');
          }
        }
      }
      if (!phoneVerified && user.phone) {
        const phone = user.phone.startsWith('+') ? user.phone : `+${user.phone}`;
        const { error } = await resendPhoneOtp(phone);
        if (!error) {
          setPhoneCooldown(RESEND_COOLDOWN_S);
        } else {
          const msg = (error.message ?? '').toLowerCase();
          if (msg.includes('rate') || msg.includes('seconds') || msg.includes('too many')) {
            setAutoSendNote((n) =>
              n ?? 'A code was sent recently — check your messages, or tap Resend after a minute.',
            );
          }
        }
      }
    })();
  }, [user, emailVerified, phoneVerified]);

  const needEmail = !emailVerified && !!user?.email;
  const needPhone = !phoneVerified && !!user?.phone;
  // Email-signup users who somehow lost their phone field on the auth user
  // (e.g. Supabase didn't persist it during signup). They still need phone
  // verification — we expose an "Add and verify phone" flow below.
  const isEmailProvider =
    !user?.app_metadata?.provider || user.app_metadata.provider === 'email';
  const needPhoneButMissing = !phoneVerified && !user?.phone && isEmailProvider;
  const [newPhone, setNewPhone] = useState('+1');
  const [phoneRequested, setPhoneRequested] = useState(false);

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

  async function onRequestNewPhone() {
    const digits = newPhone.replace(/[^\d+]/g, '');
    if (digits.replace(/\D/g, '').length < 7) {
      Alert.alert('Enter a valid phone', 'Include country code, e.g. +1 555 123 4567.');
      return;
    }
    setBusy(true);
    // Adds the phone to auth.users AND sends the SMS OTP in one shot.
    const { error } = await supabase.auth.updateUser({ phone: digits });
    setBusy(false);
    if (error) {
      Alert.alert('Could not send code', error.message);
      return;
    }
    setPhoneRequested(true);
    setPhoneCooldown(RESEND_COOLDOWN_S);
    await refreshUser();
  }

  async function onVerifyNewPhone() {
    const digits = newPhone.replace(/[^\d+]/g, '');
    if (phoneCode.length < 4) return;
    setBusy(true);
    // type: 'phone_change' is what supabase emits when updateUser({ phone })
    // is used to attach a phone to an already-authenticated user.
    const { error } = await supabase.auth.verifyOtp({
      phone: digits,
      token: phoneCode,
      type: 'phone_change',
    });
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
    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      if (msg.includes('rate') || msg.includes('too many') || msg.includes('seconds')) {
        Alert.alert(
          'Wait a moment',
          'Only one code can be sent per minute. Wait for the timer below to finish, then try again.',
        );
      } else {
        Alert.alert('Resend failed', error.message);
        setEmailCooldown(0);
      }
    } else {
      setAutoSendNote(null);
    }
  }

  async function onResendPhone() {
    if (!user?.phone || phoneCooldown > 0) return;
    setPhoneCooldown(RESEND_COOLDOWN_S);
    const { error } = await resendPhoneOtp((user.phone.startsWith('+') ? user.phone : `+${user.phone}`));
    if (error) {
      const msg = (error.message ?? '').toLowerCase();
      if (msg.includes('rate') || msg.includes('too many') || msg.includes('seconds')) {
        Alert.alert(
          'Wait a moment',
          'Only one SMS can be sent per minute. Wait for the timer below to finish, then try again.',
        );
      } else {
        Alert.alert('Resend failed', error.message);
        setPhoneCooldown(0);
      }
    } else {
      setAutoSendNote(null);
    }
  }

  return (
    <KeyboardAwareScreen>
      <Text className="text-2xl font-bold text-gray-900 mb-1">Verify your account</Text>
      <Text className="text-sm text-gray-600 mb-3">
        Both your email and phone must be verified before you can use TradesBrain.
      </Text>

      {autoSendNote && (
        <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <Text className="text-amber-800 text-xs">{autoSendNote}</Text>
        </View>
      )}

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
      ) : needPhoneButMissing ? (
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-1">Phone number</Text>
          <Text className="text-xs text-gray-500 mb-2">
            Your phone number wasn't saved during signup. Enter it here to get a verification code.
          </Text>
          {!phoneRequested ? (
            <>
              <TextInput
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
                placeholder="+1 555 123 4567"
                placeholderTextColor="#9CA3AF"
                editable={!busy}
                className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-2"
              />
              <Pressable
                onPress={onRequestNewPhone}
                disabled={busy}
                className={`py-3 rounded-lg ${busy ? 'bg-gray-300' : 'bg-brand'}`}
              >
                <Text className="text-center text-white font-semibold">
                  {busy ? 'Sending…' : 'Send code'}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-xs text-gray-500 mb-2">Code sent to {newPhone}.</Text>
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
                  onPress={onVerifyNewPhone}
                  disabled={busy || phoneCode.length < 4}
                  className={`px-4 py-3 rounded-lg ${
                    busy || phoneCode.length < 4 ? 'bg-gray-300' : 'bg-brand'
                  }`}
                >
                  <Text className="text-white font-semibold">Verify</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={onRequestNewPhone}
                disabled={phoneCooldown > 0 || busy}
                className="mt-2"
              >
                <Text className={`text-sm ${phoneCooldown > 0 ? 'text-gray-400' : 'text-brand'}`}>
                  {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : 'Resend code'}
                </Text>
              </Pressable>
              <Pressable onPress={() => setPhoneRequested(false)} className="mt-2">
                <Text className="text-xs text-gray-600 underline">Use a different number</Text>
              </Pressable>
            </>
          )}
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

      <Pressable
        onPress={() => {
          Alert.alert(
            'Permanently delete this account?',
            'This wipes the auth record, photos, and any partial data for this email/phone — you can re-use the same details to sign up fresh.',
            [
              { text: 'Cancel' },
              {
                text: 'Delete forever',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteAccountFully();
                    Alert.alert('Account deleted', 'You can now sign up with the same details.');
                  } catch (e: any) {
                    Alert.alert('Could not delete', e?.message ?? 'Try again later.');
                  }
                },
              },
            ],
          );
        }}
        className="mt-3 self-center"
      >
        <Text className="text-xs text-red-600 underline">Permanently delete this account</Text>
      </Pressable>
    </KeyboardAwareScreen>
  );
}
