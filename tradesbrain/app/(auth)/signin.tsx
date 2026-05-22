// D2 Sign In Flow, D6 Flow02 — Sign In with 3 methods, all equally visible.
// Method 1: email + password (with optional Save Password toggle → SecureStore).
// Method 2: Google OAuth.
// Method 3: Phone + OTP.
// Error states (D6 Flow02 S10):
//   wrong password / account not found / suspended / 5x lockout 15min / no internet / phone not registered

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithPassword, signInWithGoogle } from '../../services/auth';
import {
  saveCredentials,
  loadCredentials,
  clearCredentials,
} from '../../hooks/useSavePassword';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const LOCKOUT_KEY = 'tb_signin_lockout';

export default function SignInScreen() {
  const nav = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const [failed, setFailed] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  // ISS-M4 (AU-3): inline error banner (D6 Flow02 S10) — replaces modal Alerts.
  const [signInError, setSignInError] = useState<
    { message: string; action?: 'reset' | 'create' } | null
  >(null);

  useEffect(() => {
    loadCredentials().then((c) => {
      if (c) {
        setEmail(c.email);
        setPassword(c.password);
        setSavePassword(true);
      }
    });
  }, []);

  // Restore a persisted lockout if its expiry is still in the future.
  useEffect(() => {
    AsyncStorage.getItem(LOCKOUT_KEY).then((raw) => {
      if (!raw) return;
      const until = Number(raw);
      if (Number.isFinite(until) && until > Date.now()) {
        setLockedUntil(until);
        setFailed(MAX_FAILED);
      } else {
        AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
      }
    });
  }, []);

  // ISS-20 (D6 Flow02 S10) — horizontal shake on a wrong-credential error.
  const shakeX = useRef(new Animated.Value(0)).current;
  function shake() {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  const [now, setNow] = useState(Date.now());

  const lockSecondsLeft = lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - now) / 1000))
    : 0;
  const isLocked = lockSecondsLeft > 0;

  // Tick a 1s timer while locked so the countdown updates and the lock
  // releases (and the persisted key is cleared) when it expires.
  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  useEffect(() => {
    if (lockedUntil && now >= lockedUntil) {
      setLockedUntil(null);
      setFailed(0);
      AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    }
  }, [now, lockedUntil]);

  async function onEmailSignIn() {
    if (isLocked) return;

    setSignInError(null);
    setBusy(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setBusy(false);

    if (error) {
      const msg = error.message.toLowerCase();
      const code = (error as { code?: string }).code;
      // No internet — not a failed credential attempt, so it does NOT count
      // toward the 5-strike lockout. The entered details are preserved.
      if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
        setSignInError({
          message: 'No internet connection — your details are kept. Reconnect and try again.',
        });
        return;
      }
      const next = failed + 1;
      setFailed(next);
      if (next >= MAX_FAILED) {
        const until = Date.now() + LOCKOUT_MS;
        setLockedUntil(until);
        AsyncStorage.setItem(LOCKOUT_KEY, String(until)).catch(() => {});
      }

      // ISS-M4 (AU-3): classify on the Supabase error code where available,
      // falling back to message matching. Note Supabase deliberately returns a
      // generic invalid-credentials error for both a wrong password and an
      // unknown email — so that case is presented as a credentials error.
      if (code === 'user_banned' || msg.includes('suspended') || msg.includes('banned')) {
        setSignInError({ message: 'Your account has been suspended — contact support.' });
      } else if (code === 'user_not_found' || msg.includes('user not found') || msg.includes('no user')) {
        setSignInError({ message: 'No account found with this email.', action: 'create' });
      } else {
        setSignInError({
          message: 'Email or password is incorrect. Try again, or reset your password.',
          action: 'reset',
        });
      }
      // ISS-20 — shake the credentials block so the failure is unmissable.
      shake();
      return;
    }

    setSignInError(null);
    setFailed(0);
    setLockedUntil(null);
    AsyncStorage.removeItem(LOCKOUT_KEY).catch(() => {});
    if (savePassword) await saveCredentials(email.trim(), password);
    else await clearCredentials();
    // Session established → onAuthStateChange in AuthContext fires → RootLayout
    // routes into the app once the profile check resolves.
  }

  async function onGoogleSignIn() {
    setSignInError(null);
    setBusy(true);
    try {
      const { error, cancelled } = await signInWithGoogle();
      if (cancelled) return;
      if (error) throw error;
      // Session established → onAuthStateChange in AuthContext fires →
      // RootLayout routes (to the app, or to complete-profile for new users).
    } catch (e: any) {
      const msg = String(e?.message ?? '').toLowerCase();
      // ISS-M4 (AU-3): inline banner instead of a modal Alert.
      setSignInError({
        message:
          msg.includes('network') || msg.includes('fetch')
            ? 'No internet connection — Google sign-in needs a connection.'
            : e?.message ?? 'Google sign-in failed. Please try again.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-white px-5 pt-12">
      <Text className="text-2xl font-bold text-gray-900 mb-1">Sign in</Text>
      <Text className="text-sm text-gray-600 mb-6">Welcome back.</Text>

      {isLocked && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-700 font-semibold">Sign-in locked</Text>
          <Text className="text-red-700 text-sm">
            Too many failed attempts — try again in {Math.floor(lockSecondsLeft / 60)}m{' '}
            {lockSecondsLeft % 60}s.
          </Text>
          {/* ISS-20 (D6 Flow02 S10) — reset password is still available while locked. */}
          <Pressable
            onPress={() => (nav as any).navigate('ForgotPassword')}
            className="mt-2 self-start"
          >
            <Text className="text-red-700 font-semibold text-sm underline">
              Reset password
            </Text>
          </Pressable>
        </View>
      )}

      {/* ISS-M4 (AU-3): inline error banner — D6 Flow02 S10 */}
      {signInError && !isLocked && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <Text className="text-red-700 text-sm">{signInError.message}</Text>
          {signInError.action === 'reset' && (
            <Pressable
              onPress={() => (nav as any).navigate('ForgotPassword')}
              className="mt-2 self-start"
            >
              <Text className="text-red-700 font-semibold text-sm underline">Reset password</Text>
            </Pressable>
          )}
          {signInError.action === 'create' && (
            <Pressable onPress={() => nav.navigate('SignUp')} className="mt-2 self-start">
              <Text className="text-red-700 font-semibold text-sm underline">
                Create an account
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* METHOD 1 — Email + Password */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Method 1 — Email & password
      </Text>
      <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
        <TextInput
          value={email}
          onChangeText={(t) => { setEmail(t); setSignInError(null); }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLocked && !busy}
          className={`border rounded-lg px-3 py-3 text-base mb-3 ${
            signInError ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        <View
          className={`flex-row items-center border rounded-lg mb-3 ${
            signInError ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <TextInput
            value={password}
            onChangeText={(t) => { setPassword(t); setSignInError(null); }}
            placeholder="Password"
            secureTextEntry={!showPassword}
            editable={!isLocked && !busy}
            className="flex-1 px-3 py-3 text-base"
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} className="px-3 py-3">
            <Text className="text-gray-500 text-sm">{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>
      </Animated.View>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Switch value={savePassword} onValueChange={setSavePassword} />
          <Text className="text-sm text-gray-700 ml-2">Save password</Text>
        </View>
        <Pressable onPress={() => (nav as any).navigate('ForgotPassword')}>
          <Text className="text-sm text-brand">Forgot password?</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={onEmailSignIn}
        disabled={isLocked || busy || !email || !password}
        className={`py-4 rounded-xl ${
          isLocked || busy || !email || !password ? 'bg-gray-300' : 'bg-brand'
        }`}
      >
        <Text className="text-center text-white font-semibold">Sign in</Text>
      </Pressable>

      <View className="flex-row items-center my-5">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-3 text-xs text-gray-400">OR</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* METHOD 2 — Google */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">Method 2 — Google</Text>
      <Pressable
        onPress={onGoogleSignIn}
        disabled={busy}
        className="py-4 rounded-xl border border-gray-300 mb-4"
      >
        <Text className="text-center text-gray-800 font-semibold">Continue with Google</Text>
      </Pressable>

      {/* METHOD 3 — Phone OTP */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Method 3 — Phone OTP
      </Text>
      <Pressable
        onPress={() => (nav as any).navigate('PhoneSignIn')}
        disabled={busy}
        className="py-4 rounded-xl border border-gray-300"
      >
        <Text className="text-center text-gray-800 font-semibold">Sign in with phone OTP</Text>
      </Pressable>

      {/* D6 Flow02 S3 — new users can reach Create Account from the Sign In screen. */}
      <Pressable
        onPress={() => nav.navigate('SignUp')}
        disabled={busy}
        className="mt-6 self-center"
      >
        <Text className="text-sm text-gray-600">
          New to TradesBrain? <Text className="text-brand font-semibold">Create an account</Text>
        </Text>
      </Pressable>

      {busy && (
        <View className="mt-6 items-center">
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
