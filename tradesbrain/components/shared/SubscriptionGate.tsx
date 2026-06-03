// SubscriptionGate — wraps a feature so it is only reachable with an active
// subscription or remaining trial queries. On no-access it renders a locked
// state with a CTA into the Paywall (M0 §6) instead of silently hiding.
import React, { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import type { RootStackParamList } from '../../app/_layout';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SubscriptionGateProps {
  children: ReactNode;
  featureName?: string;
}

export default function SubscriptionGate({ children, featureName }: SubscriptionGateProps) {
  const nav = useNavigation<Nav>();
  const { hasAccess, subscriptionStatus, trialQueriesRemaining } =
    useSubscriptionContext();

  if (hasAccess) return <>{children}</>;

  const trialExhausted = subscriptionStatus === 'trial' && trialQueriesRemaining <= 0;
  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-5xl mb-3">🔒</Text>
      <Text className="text-xl font-bold text-gray-900 mb-1 text-center">
        {featureName ? `${featureName} is locked` : 'Subscription required'}
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        {trialExhausted
          ? "You've used all your free trial queries. Upgrade to keep going."
          : 'Upgrade your plan to unlock this feature.'}
      </Text>
      <Pressable
        onPress={() => nav.navigate('Paywall')}
        className="bg-brand py-3.5 px-8 rounded-xl"
      >
        <Text className="text-white font-semibold">View plans</Text>
      </Pressable>
    </View>
  );
}
