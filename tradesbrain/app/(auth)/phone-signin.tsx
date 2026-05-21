// D2 Sign In Method 3, D6 Flow02 — Phone + OTP sign-in.
// Screen 1: phone entry → send SMS OTP.
// Screen 2: enter OTP → on success, signed in.
// Wrong OTP × 3 → lock OTP input 5 min with countdown (ISS-04).

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithPhoneStart, signInWithPhoneVerify } from '../../services/auth';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LOCKOUT_S = 300; // 5 minutes
const MAX_WRONG = 3;
const LOCKOUT_KEY = 'tb_phone_signin_lockout';

export default function PhoneSignInScreen() {
  const nav = useNavigation<Nav>();
  const [phase, setPhase] = useState<'enter' | 'verify'>('enter');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const [wrongCount, setWrongCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const fullPhone = `${countryCode}${phoneLocal}`;

  // Restore a persisted OTP lockout if its expiry is still in the future.
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

  // Tick a 1s timer while locked so the countdown updates.
  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  // Clear the lock and the persisted key once the lockout expires.
  useEffect(() => {
    if (lockedUntil && now >= lockedUntil) {
      setLockedUntil(null);
      setWrongCount(0);
      AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    }
  }, [now, lockedUntil]);

  const lockSecondsLeft = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - now) / 1000))
    : 0;
  const isLocked = lockSecondsLeft > 0;

  async function onSendCode() {
    if (phoneLocal.replace(/\D/g, '').length < 7) return;
    setBusy(true);
    const { error } = await signInWithPhoneStart(fullPhone);
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('not found') || msg.includes('no user')) {
        Alert.alert('Phone not registered', 'No account uses this number. Create one?', [
          { text: 'Create Account', onPress: () => nav.navigate('SignUp') },
          { text: 'Cancel' },
        ]);
        return;
      }
      Alert.alert('SMS failed', error.message);
      return;
    }
    // Reset wrong-attempt counter when a fresh code is sent.
    setWrongCount(0);
    setLockedUntil(null);
    AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    setPhase('verify');
  }

  async function onVerify() {
    if (code.length < 4 || isLocked) return;
    setBusy(true);
    const { error } = await signInWithPhoneVerify(fullPhone, code);
    setBusy(false);
    if (error) {
      const next = wrongCount + 1;
      setWrongCount(next);
      if (next >= MAX_WRONG) {
        const until = Date.now() + LOCKOUT_S * 1000;
        setLockedUntil(until);
        setNow(Date.now());
        AsyncStorage.setItem(LOCKOUT_KEY, String(until)).catch(() => {});
      }
      Alert.alert('Wrong code', 'SMS code is incorrect.');
      return;
    }
    // Success — clear any stale lockout data.
    AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    // Session established → onAuthStateChange in AuthContext fires → RootLayout
    // routes: existing users → app; new phone-OTP sign-ups → complete-profile.
  }

  return (
    <View className="flex-1 bg-white px-5 pt-12">
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {phase === 'enter' ? 'Sign in with phone' : 'Enter SMS code'}
      </Text>
      <Text className="text-sm text-gray-600 mb-6">
        {phase === 'enter'
          ? 'We will send you a one-time code.'
          : `Sent to ${fullPhone}`}
      </Text>

      {phase === 'enter' ? (
        <>
          <Text className="text-sm font-medium text-gray-700 mb-1">Phone number</Text>
          <View className="flex-row gap-2 mb-4">
            <TextInput
              value={countryCode}
              onChangeText={setCountryCode}
              keyboardType="phone-pad"
              className="border border-gray-300 rounded-lg px-3 py-3 w-20 text-base"
            />
            <TextInput
              value={phoneLocal}
              onChangeText={setPhoneLocal}
              keyboardType="phone-pad"
              placeholder="555 123 4567"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 text-base"
            />
          </View>
          <Pressable
            onPress={onSendCode}
            disabled={busy || phoneLocal.length === 0}
            className={`py-4 rounded-xl ${busy || !phoneLocal ? 'bg-gray-300' : 'bg-brand'}`}
          >
            <Text className="text-center text-white font-semibold">Send code</Text>
          </Pressable>
        </>
      ) : (
        <>
          {isLocked && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-700 font-semibold">Too many wrong attempts</Text>
              <Text className="text-red-700 text-sm">
                Try again in {Math.floor(lockSecondsLeft / 60)}m {lockSecondsLeft % 60}s.
              </Text>
            </View>
          )}
          <TextInput
            value={code}
            onChangeText={setCode}
            editable={!isLocked && !busy}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            className="border border-gray-300 rounded-lg px-3 py-3 text-base mb-4 tracking-widest"
          />
          <Pressable
            onPress={onVerify}
            disabled={busy || code.length < 4 || isLocked}
            className={`py-4 rounded-xl ${busy || code.length < 4 || isLocked ? 'bg-gray-300' : 'bg-brand'}`}
          >
            <Text className="text-center text-white font-semibold">Verify & sign in</Text>
          </Pressable>
        </>
      )}

      {busy && (
        <View className="mt-6 items-center">
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
