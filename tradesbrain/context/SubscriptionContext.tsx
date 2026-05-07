import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { supabase } from '../services/supabase';

interface SubscriptionContextType {
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  planType: 'solo' | 'pro' | 'team' | null;
  trialQueriesRemaining: number;
  subscriptionEndDate: string | null;
  refreshSubscription: () => Promise<void>;
  decrementTrialQuery: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: 'trial',
  planType: null,
  trialQueriesRemaining: 10,
  subscriptionEndDate: null,
  refreshSubscription: async () => {},
  decrementTrialQuery: () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'trial' | 'active' | 'expired' | 'cancelled'>('trial');
  const [planType, setPlanType] = useState<'solo' | 'pro' | 'team' | null>(null);
  const [trialQueriesRemaining, setTrialQueriesRemaining] = useState(10);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);

  const refreshSubscription = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, plan_type, trial_queries_remaining, subscription_end_date')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setSubscriptionStatus(data.subscription_status as any);
      setPlanType(data.plan_type as any);
      setTrialQueriesRemaining(data.trial_queries_remaining);
      setSubscriptionEndDate(data.subscription_end_date);
    }
  };

  const decrementTrialQuery = () => {
    setTrialQueriesRemaining(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscription();
    }
  }, [isAuthenticated, user?.id]);

  return (
    <SubscriptionContext.Provider value={{
      subscriptionStatus, planType, trialQueriesRemaining,
      subscriptionEndDate, refreshSubscription, decrementTrialQuery,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscriptionContext = () => useContext(SubscriptionContext);
export default SubscriptionContext;
