// D2 F7 / D3 F6 — Subscription context.
// Reads users.subscription_status, plan_type, trial_queries_remaining,
// subscription_end_date and refreshes on auth change.
// Exposes optimisticActivate() which the paywall calls immediately after
// PaymentSheet returns success (BuildGuide M6 RULE 6). The webhook overwrites
// with truth within seconds.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuthContext } from './AuthContext';
import { supabase } from '../services/supabase';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type PlanType = 'solo' | 'pro' | 'team' | null;

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  planType: PlanType;
  trialQueriesRemaining: number;
  subscriptionEndDate: string | null;
  refreshSubscription: () => Promise<void>;
  decrementTrialQuery: () => void;
  optimisticActivate: (plan: Exclude<PlanType, null>) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: 'trial',
  planType: null,
  trialQueriesRemaining: 10,
  subscriptionEndDate: null,
  refreshSubscription: async () => {},
  decrementTrialQuery: () => {},
  optimisticActivate: () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('trial');
  const [planType, setPlanType] = useState<PlanType>(null);
  const [trialQueriesRemaining, setTrialQueriesRemaining] = useState(10);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  // Refs let the polling closure read fresh values without re-creating the
  // callback on every state change.
  const statusRef = useRef<SubscriptionStatus>('trial');
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  statusRef.current = subscriptionStatus;

  const refreshSubscription = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .select(
        'subscription_status, plan_type, trial_queries_remaining, subscription_end_date',
      )
      .eq('id', user.id)
      .single();

    if (error || !data) return;

    // Webhook race guard: once we've optimistically flipped to 'active' after
    // PaymentSheet success, refuse to regress back to 'trial' until the DB
    // catches up. Otherwise an in-flight refresh that beats the Stripe webhook
    // would un-subscribe the user in the UI.
    if (
      statusRef.current === 'active' &&
      data.subscription_status === 'trial'
    ) {
      // Still update the trial counter so other reads stay consistent.
      setTrialQueriesRemaining(data.trial_queries_remaining);
      return;
    }

    setSubscriptionStatus(data.subscription_status as SubscriptionStatus);
    setPlanType(data.plan_type as PlanType);
    setTrialQueriesRemaining(data.trial_queries_remaining);
    setSubscriptionEndDate(data.subscription_end_date);
  }, [user]);

  const decrementTrialQuery = useCallback(() => {
    setTrialQueriesRemaining((prev) => Math.max(prev - 1, 0));
  }, []);

  // BuildGuide M6 RULE 6 — optimistic activation immediately after PaymentSheet
  // success. We flip local state to 'active' and then poll the DB until the
  // Stripe webhook lands (usually 1-3s), backing off up to ~15s total.
  const optimisticActivate = useCallback(
    (plan: Exclude<PlanType, null>) => {
      setSubscriptionStatus('active');
      setPlanType(plan);

      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      if (!user) return;

      const userId = user.id;
      let attempt = 0;
      const maxAttempts = 8;
      const poll = async () => {
        attempt++;
        const { data } = await supabase
          .from('users')
          .select('subscription_status, plan_type, subscription_end_date')
          .eq('id', userId)
          .single();
        if (data?.subscription_status === 'active') {
          setSubscriptionStatus('active');
          setPlanType((data.plan_type as PlanType) ?? plan);
          setSubscriptionEndDate(data.subscription_end_date);
          pollTimerRef.current = null;
          return;
        }
        if (attempt < maxAttempts) {
          pollTimerRef.current = setTimeout(poll, 1500 + attempt * 500);
        } else {
          pollTimerRef.current = null;
        }
      };
      pollTimerRef.current = setTimeout(poll, 1500);
    },
    [user],
  );

  useEffect(() => {
    if (isAuthenticated) refreshSubscription();
  }, [isAuthenticated, user?.id, refreshSubscription]);

  // Clean up any in-flight polling timer when the provider unmounts (e.g.
  // sign-out, hot-reload).
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionStatus,
        planType,
        trialQueriesRemaining,
        subscriptionEndDate,
        refreshSubscription,
        decrementTrialQuery,
        optimisticActivate,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscriptionContext = () => useContext(SubscriptionContext);
export default SubscriptionContext;
