// M1 — Authentication service helpers
// Wraps Supabase Auth + users table + KYC photo upload. KYC status fields are
// seeded as 'pending' when document photos were uploaded (CC-1 / D1 §6): the
// two Stripe Identity sessions are minted automatically at sign-up completion
// so verification processes during the free-trial window. Settings → Profile
// re-upload remains the manual fallback (kyc-webhook flips status to verified).

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
// Legacy entrypoint keeps the readAsStringAsync + EncodingType API we use
// here (same pattern as services/share.ts).
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { checkKycStatus } from './stripe';

// Decode a base64 string into a Uint8Array using Hermes' global atob. We
// avoid `fetch(file://...).blob()` because that pattern is unreliable on
// Android (blob is often empty / "Network request failed") which manifested
// as the user being unable to finish sign-up.
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = global.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Configure once at module load. The webClientId is what Supabase verifies the
// returned ID token against — it must also be added to the Supabase dashboard
// under Auth → Providers → Google → "Authorized Client IDs". The iosClientId is
// only needed on iOS; Android picks up its client from the SHA-1 fingerprint
// registered in Google Cloud Console + the package name in app.json.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

const TERMS_VERSION = 'v1.0';

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  tradeType: 'plumber' | 'electrician' | 'hvac' | 'roofer' | 'other';
  accountType: 'solopreneur' | 'team_owner';
  hourlyRate: number;
  vatNumber: string;
  licenseNumber: string;
  licenseProofUri: string;
  nationalIdUri: string;
  companyName?: string;
  companyLogoUri?: string;
}

// Pre-signup availability check (D2 Step 3). Runs against a SECURITY DEFINER
// SQL function so we hit auth.users + public.users in one round-trip without
// loosening RLS. Supabase enforces email uniqueness at the auth layer but
// NOT phone — so without this, a duplicate phone would silently create a
// second account that collides with the first downstream.
export async function checkSignupAvailability(
  email: string,
  phone: string,
): Promise<{ emailTaken: boolean; phoneTaken: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('check_signup_availability', {
    p_email: email,
    p_phone: phone,
  });
  if (error) {
    return { emailTaken: false, phoneTaken: false, error: error.message };
  }
  const raw = (data ?? {}) as { email_taken?: boolean; phone_taken?: boolean };
  return {
    emailTaken: !!raw.email_taken,
    phoneTaken: !!raw.phone_taken,
  };
}

export async function startSignUp(email: string, password: string, phone: string) {
  // Supabase signUp with both email and phone triggers email confirmation
  // and SMS OTP simultaneously when phone provider is configured.
  return supabase.auth.signUp({
    email,
    password,
    phone,
    options: {
      channel: 'sms',
    },
  });
}

export async function verifyEmailOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: 'signup' });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}

export async function resendEmailOtp(email: string) {
  return supabase.auth.resend({ type: 'signup', email });
}

export async function resendPhoneOtp(phone: string) {
  return supabase.auth.resend({ type: 'sms', phone });
}

export async function uploadKycPhoto(
  userId: string,
  kind: 'license' | 'national_id' | 'company_logo',
  localUri: string,
): Promise<string> {
  // Pull a clean extension off the path (strip query strings, e.g.
  // "file:///.../image.jpg?123"). Default to jpg if the picker handed us a
  // URI without an extension (some Android galleries do this).
  const rawExt = localUri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(rawExt) ? rawExt : 'jpg';
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const contentType =
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
    : ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'heic' || ext === 'heif' ? 'image/heic'
    : 'image/jpeg';

  // Read via expo-file-system. The previous fetch(uri).blob() pattern is
  // unreliable on Android — fetch() of a file:// URI often returns an empty
  // blob or throws "Network request failed", which surfaced to the worker
  // as "Could not finish sign up" right after they tapped I Agree.
  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e: any) {
    throw new Error(`Could not read ${kind} photo from device: ${e?.message ?? e}`);
  }
  const bytes = base64ToUint8Array(base64);

  const { error } = await supabase.storage
    .from('kyc-documents')
    .upload(path, bytes, { contentType, upsert: false });

  if (error) {
    // Surface a friendlier message for the network case so the user knows
    // it's worth retrying with a connection.
    const msg = String(error.message ?? '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) {
      throw new Error('Could not upload your photos — check your connection and try again.');
    }
    throw error;
  }
  return path;
}

export async function createUserProfile(input: SignUpInput): Promise<void> {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) throw new Error('No authenticated user — verify OTPs first.');
  // Defence in depth — the OtpVerify screen already double-checks both
  // channels, but a stale local state must never reach the profile insert.
  // OAuth users (Google) don't have a phone yet — they finish via the
  // complete-profile screen, where this guard is skipped because the auth
  // provider already vouches for their email.
  const isOauth = !!user.app_metadata?.provider && user.app_metadata.provider !== 'email';
  if (!isOauth) {
    if (!user.email_confirmed_at) throw new Error('Email is not confirmed yet.');
    if (user.phone && !user.phone_confirmed_at) {
      throw new Error('Phone is not confirmed yet.');
    }
  }

  const licensePath = await uploadKycPhoto(user.id, 'license', input.licenseProofUri);
  const nationalIdPath = await uploadKycPhoto(user.id, 'national_id', input.nationalIdUri);
  const logoPath = input.companyLogoUri
    ? await uploadKycPhoto(user.id, 'company_logo', input.companyLogoUri)
    : null;

  const { error } = await supabase.from('users').insert({
    id: user.id,
    full_name: input.fullName,
    email: input.email,
    phone_number: input.phone,
    trade_type: input.tradeType,
    account_type: input.accountType,
    hourly_rate: input.hourlyRate,
    vat_number: input.vatNumber,
    company_name: input.companyName ?? null,
    company_logo_url: logoPath,
    license_number: input.licenseNumber,
    license_proof_url: licensePath,
    national_id_url: nationalIdPath,
    // CC-1 (D1 §6) — both KYC document photos are mandatory to reach this point
    // (sign-up step 3 cannot complete without them), so both statuses are
    // seeded 'pending' unconditionally; the paywall KYC gate reflects
    // in-progress verification immediately.
    national_id_kyc_status: 'pending',
    license_kyc_status: 'pending',
    terms_accepted_at: new Date().toISOString(),
    terms_version: TERMS_VERSION,
  });

  if (error) {
    const msg = String(error.message ?? '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) {
      throw new Error('Could not save your profile — check your connection and try again.');
    }
    throw error;
  }

  // CC-1 (D1 §6) — kick off both Stripe Identity verification sessions now.
  // Fire-and-forget: this must never block the worker reaching Home. If a call
  // fails the status column stays 'pending' and the Settings → Profile
  // re-upload flow recovers it.
  void initiateKycVerification();
}

// Starts verification for both KYC documents in parallel. kyc-status-check
// mints a Stripe Identity session per document and flips its status column to
// 'pending'. Failures are logged only — never thrown — so sign-up always
// completes and navigation is never delayed.
export async function initiateKycVerification(): Promise<void> {
  const docs: Array<'national_id' | 'license'> = ['national_id', 'license'];
  const results = await Promise.allSettled(docs.map((d) => checkKycStatus(d)));
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.warn(`KYC initiation failed for ${docs[i]}:`, r.reason);
    } else if (!r.value.success) {
      console.warn(`KYC initiation failed for ${docs[i]}:`, r.value.error);
    }
  });
}

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// Shared Google sign-in flow used by both the Sign In and Create Account
// screens. Uses the native Google account picker (iOS/Android) rather than a
// web redirect, so the consent sheet shows the "Trades Brain" OAuth client
// instead of the Supabase project domain. The ID token is exchanged with
// Supabase via signInWithIdToken. On success onAuthStateChange fires and
// RootLayout routes — to the app for existing users, or to the complete-profile
// screen for brand-new Google users (no public.users row yet).
export async function signInWithGoogle(): Promise<{
  error: Error | null;
  cancelled: boolean;
}> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response: any = await GoogleSignin.signIn();

    // v13+ shape: { type: 'success' | 'cancelled', data: { idToken, ... } }
    // Older shape (defensive): { idToken } at the top level.
    if (response?.type === 'cancelled') return { error: null, cancelled: true };
    const idToken: string | undefined = response?.data?.idToken ?? response?.idToken;
    if (!idToken) {
      return {
        error: new Error('Google did not return an ID token.'),
        cancelled: false,
      };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { error: error ?? null, cancelled: false };
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
      return { error: null, cancelled: true };
    }
    if (e?.code === statusCodes.IN_PROGRESS) {
      return { error: null, cancelled: true };
    }
    const err = e instanceof Error ? e : new Error(String(e?.message ?? e));
    return { error: err, cancelled: false };
  }
}

// True when the signed-in auth user already has a row in public.users (i.e. they
// finished the trade + KYC profile). Drives the RootLayout onboarding gate.
//
// IMPORTANT: pass `userId` explicitly when calling from within an
// onAuthStateChange listener (or any context that runs while a supabase auth
// operation is in flight). `supabase.auth.getUser()` acquires the same internal
// session lock that `verifyOtp` / `signIn*` hold, so calling it from a listener
// deadlocks the auth flow. The explicit-id path skips that call entirely.
export async function profileExists(userId?: string): Promise<boolean> {
  let uid = userId;
  if (!uid) {
    const { data: authData } = await supabase.auth.getUser();
    uid = authData.user?.id;
    if (!uid) return false;
  }
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', uid)
    .maybeSingle();
  return !error && !!data;
}

export async function signInWithPhoneStart(phone: string) {
  // ISS-M2 (AU-1): shouldCreateUser:false — this is a SIGN-IN, not sign-up.
  // Without it Supabase silently provisions a brand-new account for any
  // unregistered number, making the "phone not registered" error unreachable.
  return supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });
}

export async function signInWithPhoneVerify(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}

// Calls the delete-account Edge Function which:
//   • wipes the caller's storage in kyc-documents / job-documents / job-photos /
//     profile-assets
//   • DELETE public.users (FK cascade drops job_sessions, messages, job_reports,
//     quotes, team_members, worker_preferences, subscriptions, billing_history)
//   • admin.deleteUser on auth.users
// Caller MUST be authenticated. Throws on failure so callers can surface a
// recovery message. Use from Settings (post-signup) and from the VerifyPending /
// CompleteProfile recovery screens so stuck users can wipe their account too.
//
// On success we also drop the local session here — the JWT now references a
// deleted user, so subsequent supabase calls (incl. /logout) would return
// 403. Clearing locally avoids that dead-token round-trip; the AuthContext
// onAuthStateChange listener picks up the SIGNED_OUT event and the gate
// routes back to Welcome.
export async function deleteAccountFully(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', {});
  if (error) throw error;
  // Best-effort: clear the now-dead JWT from secure storage. Errors are
  // swallowed because the auth row is already gone — the only thing left to
  // do is forget the local token.
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    /* token already invalid — nothing else to clean */
  }
}

export async function sendPasswordReset(email: string) {
  // Supabase emits a 6-digit recovery code in the email when the project's
  // "Reset Password" email template includes {{ .Token }}. The mobile app
  // verifies the code via verifyRecoveryOtp (below) — no deep-link round trip
  // needed. redirectTo is kept so the link variant still re-opens the app if
  // the template falls back to it.
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'tradesbrain://reset-password',
  });
}

// Verifies the 6-digit recovery code emailed by Supabase. On success the user
// has a short-lived recovery session that authorises updatePassword().
export async function verifyRecoveryOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: 'recovery' });
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

export { TERMS_VERSION };
