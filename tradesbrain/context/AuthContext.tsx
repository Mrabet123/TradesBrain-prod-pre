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
  const phoneVerified = !!user.phone_confirmed_at || !user.phone;
  let fully: boolean;
  if (provider === 'oauth') {
    // OAuth accounts trust the provider for the email and don't carry a phone
    // until the user adds it in CompleteProfile / Settings → Profile.
    fully = true;
  } else if (provider === 'phone') {
    fully = phoneVerified;
  } else {
    // Email sign-up. TradesBrain collects both at signup so both must be
    // verified before we let the user past the gate.
    fully = emailVerified && phoneVerified;
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
    const exists = await profileExists();
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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const exists = await profileExists();
        if (!active) return;
        setProfileComplete(exists);
      }
      setProfileChecked(true);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setProfileChecked(false);
        const exists = await profileExists();
        setProfileComplete(exists);
        setProfileChecked(true);
        if (exists) setProfileSetupPending(false);
      } else {
        setProfileComplete(false);
        setProfileChecked(true);
        setProfileSetupPending(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
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
