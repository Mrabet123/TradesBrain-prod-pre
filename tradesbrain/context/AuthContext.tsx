import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { profileExists } from '../services/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // profileComplete: the signed-in user has a public.users row (finished the
  //   trade + KYC profile). Google / phone-OTP sign-ups start false.
  // profileChecked: the first profile lookup after sign-in has resolved.
  // profileSetupPending: the email sign-up flow (OtpVerify) is mid-creation —
  //   the gate waits instead of flashing the complete-profile screen.
  // emailVerified / phoneVerified: per-channel confirmation flags derived from
  //   the auth user. An email-signup is considered "fully verified" only when
  //   BOTH are true (TradesBrain collects email + phone at signup).
  // fullyVerified: convenience flag for the RootLayout gate — distinguishes a
  //   user who just verified one channel from one who verified both.
  profileComplete: boolean;
  profileChecked: boolean;
  profileSetupPending: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  fullyVerified: boolean;
  signUpProvider: 'email' | 'oauth' | 'phone' | null;
  refreshProfileStatus: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setProfileSetupPending: (pending: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  profileComplete: false,
  profileChecked: false,
  profileSetupPending: false,
  emailVerified: false,
  phoneVerified: false,
  fullyVerified: false,
  signUpProvider: null,
  refreshProfileStatus: async () => {},
  refreshUser: async () => {},
  setProfileSetupPending: () => {},
  signOut: async () => {},
});

// Classify how the user signed up so the RootLayout gate knows which channels
// must be confirmed before the app opens.
//   email  — used both email+phone (signup form). Both OTPs required.
//   phone  — phone-OTP only sign-in. Just phone confirmation needed.
//   oauth  — Google. Provider already verified the email; we trust it.
function classifyProvider(user: User | null): 'email' | 'oauth' | 'phone' | null {
  if (!user) return null;
  const provider = user.app_metadata?.provider ?? '';
  if (provider && provider !== 'email' && provider !== 'phone') return 'oauth';
  if (provider === 'phone') return 'phone';
  // Default to 'email' — that's what supabase.auth.signUp uses for email+phone
  // accounts and matches the TradesBrain sign-up form.
  return 'email';
}

function deriveVerification(user: User | null) {
  if (!user) {
    return {
      emailVerified: false,
      phoneVerified: false,
      provider: null as 'email' | 'oauth' | 'phone' | null,
      fullyVerified: false,
    };
  }
  const provider = classifyProvider(user);
  const emailVerified = !!user.email_confirmed_at;
  // STRICT: do NOT auto-pass when user.phone is empty for email signups —
  // that's how worker reports of "only email was verified, app took me to
  // home anyway" happened (user.phone was unexpectedly empty so the old
  // short-circuit returned phoneVerified=true). For OAuth users we ignore
  // phone entirely below, so it's safe to compute strictly here.
  const phoneVerified = !!user.phone_confirmed_at;
  let fully: boolean;
  if (provider === 'oauth') {
    // OAuth accounts trust the provider for the email and don't carry a
    // phone until the user adds it via CompleteProfile / Settings → Profile.
    fully = emailVerified;
  } else if (provider === 'phone') {
    fully = phoneVerified;
  } else {
    // Email sign-up. Phone is no longer collected at signup (it becomes a
    // Settings → Profile feature), so only the email channel must be
    // confirmed before the gate opens. phoneVerified is still computed above
    // for the future "add phone in profile" flow.
    fully = emailVerified;
  }
  return { emailVerified, phoneVerified, provider, fullyVerified: fully };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileSetupPending, setProfileSetupPending] = useState(false);

  const refreshProfileStatus = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id;
    if (!uid) {
      setProfileComplete(false);
      setProfileChecked(true);
      return;
    }
    const exists = await profileExists(uid);
    setProfileComplete(exists);
    setProfileChecked(true);
    if (exists) setProfileSetupPending(false);
  }, []);

  // Pulls a fresh copy of the auth user from Supabase. Used after a successful
  // OTP verification so email_confirmed_at / phone_confirmed_at update locally
  // without waiting for the next onAuthStateChange.
  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    // Defensive timeout — if getSession hangs (slow keychain read, supabase
    // refresh stalling on a flaky network), the splash would otherwise stay
    // on screen forever. After 6s we drop into "no session" mode so the user
    // at least lands on the Welcome screen and can act.
    const failsafe = setTimeout(() => {
      if (!active) return;
      setProfileChecked(true);
      setIsLoading(false);
    }, 6000);

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        let exists = false;
        if (session?.user) {
          exists = await profileExists(session.user.id).catch(() => false);
          if (!active) return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        setProfileComplete(exists);
        setProfileChecked(true);
        setIsLoading(false);
        clearTimeout(failsafe);
      } catch {
        if (!active) return;
        setSession(null);
        setUser(null);
        setProfileComplete(false);
        setProfileChecked(true);
        setIsLoading(false);
        clearTimeout(failsafe);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // CRITICAL: this listener MUST be synchronous (no awaits, no
      // supabase.* calls). supabase-js awaits all listeners before
      // verifyOtp/signIn resolve, and any I/O here that touches the auth
      // lock deadlocks the entire auth flow — symptom: tapping Verify
      // hangs on "Working…" forever. The profile-check runs in the
      // separate effect below, OUTSIDE the listener, where the auth lock
      // has already been released.
      if (!session?.user) {
        setSession(null);
        setUser(null);
        setProfileComplete(false);
        setProfileSetupPending(false);
        return;
      }
      setSession(session);
      setUser(session.user);
    });

    return () => {
      active = false;
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  // Background profile check — fires whenever the auth user ID changes (i.e.
  // sign-in, post-signup OTP verify, etc.). Lives OUTSIDE the supabase auth
  // listener so it can't deadlock supabase-js's session lock.
  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    let active = true;
    profileExists(uid)
      .then((exists) => {
        if (!active) return;
        setProfileComplete(exists);
        if (exists) setProfileSetupPending(false);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.id]);

  const signOut = async () => {
    // The auth.users row may already be gone (e.g. immediately after
    // deleteAccountFully) — in that case /logout returns 403 with
    // "User from sub claim in JWT does not exist". Swallow the error so
    // local state still clears cleanly.
    try {
      await supabase.auth.signOut();
    } catch {
      /* dead token — local clear below is what matters */
    }
    setUser(null);
    setSession(null);
    setProfileComplete(false);
    setProfileSetupPending(false);
  };

  const { emailVerified, phoneVerified, provider, fullyVerified } = deriveVerification(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        profileComplete,
        profileChecked,
        profileSetupPending,
        emailVerified,
        phoneVerified,
        fullyVerified,
        signUpProvider: provider,
        refreshProfileStatus,
        refreshUser,
        setProfileSetupPending,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
