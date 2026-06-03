// D6 Flow04 — Rex tab entry.
// If there's an active session: amber "Continue session" banner + start new option.
// Otherwise: "Start a new job" button. The CTA tap is gated by an inline
// hasAccess check (trial-with-queries or active subscription) — when the gate
// fails, startNewJob() routes to the Paywall modal so the underlying tab
// remains mounted underneath (RULE 8 / D6 Flow12 S9).

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import { supabase } from '../../services/supabase';
import { useAuthContext } from '../../context/AuthContext';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import Screen from '../../components/shared/Screen';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RexScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuthContext();
  const { hasAccess } = useSubscriptionContext();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('job_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setActiveSessionId(data?.id ?? null);
      setLoading(false);
    })();
  }, [user]);

  function startNewJob() {
    if (!hasAccess) {
      nav.navigate('Paywall');
      return;
    }
    nav.navigate('Job', { sessionId: 'new' });
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Screen edges={['top']} className="flex-1 bg-white px-5">
      <View className="flex-row items-center mb-1">
        <Image
          source={require('../../assets/rex-compass.png')}
          style={{ width: 40, height: 40, marginRight: 10 }}
          accessibilityLabel="Rex"
        />
        <Text className="text-2xl font-bold text-gray-900">Rex</Text>
      </View>
      <Text className="text-sm text-gray-600 mb-6">Your AI co-pilot on this job.</Text>

      {activeSessionId && (
        <View className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4">
          <Text className="text-sm text-amber-800 font-semibold mb-1">
            You have an active session
          </Text>
          <Text className="text-xs text-amber-700 mb-3">
            Rex will recap before continuing.
          </Text>
          <Pressable
            onPress={() => nav.navigate('Job', { sessionId: activeSessionId, recap: true })}
            className="bg-amber-500 py-3 rounded-lg"
          >
            <Text className="text-center text-white font-semibold">Continue session</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={startNewJob}
        className="bg-brand py-4 rounded-xl"
      >
        <Text className="text-center text-white font-semibold text-base">Start a new job</Text>
      </Pressable>
      {!hasAccess && (
        <Text className="text-xs text-gray-500 text-center mt-2">
          Free trial exhausted — subscribe to continue.
        </Text>
      )}
    </Screen>
  );
}
