// D6 Flow09 / D3 F6 — Paywall.
// 3 plan cards (Solo / Pro / Team), monthly/annual toggle (20% off annual).
// KYC gate: subscribe blocked if national_id or license not 'verified'.
// PaymentSheet flow via services/payments.purchaseSubscription.
// On success: optimisticActivate + dismiss. The session underneath is preserved
// because Paywall is presented as a modal (RULE 8).

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRICING } from '../constants/pricing';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { useAuthContext } from '../context/AuthContext';
import { checkKycStatus } from '../services/stripe';
import {
  purchaseSubscription,
  restoreSubscription,
  type BillingCycle,
  type PlanType,
} from '../services/payments';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PlanCardSpec {
  value: PlanType;
  label: string;
  tagline: string;
  perks: string[];
}

const PLANS: PlanCardSpec[] = [
  {
    value: 'solo',
    label: 'Solo',
    tagline: 'For independent pros.',
    perks: ['1 user', 'Unlimited Rex queries', 'Reports + quotes', 'Trade code lookup'],
  },
  {
    value: 'pro',
    label: 'Pro',
    tagline: 'Heavy daily use.',
    perks: ['1 user', 'Unlimited Rex queries', 'Priority responses', 'Reports + quotes'],
  },
  {
    value: 'team',
    label: 'Team',
    tagline: 'Owner + crew.',
    perks: [
      'Owner + 2 members (base)',
      'Per-seat scaling',
      'Team KPI dashboard',
      'All Solo + Pro features',
    ],
  },
];

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'Paywall'>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const {
    optimisticActivate,
    refreshSubscription,
    subscriptionStatus,
    planType,
  } = useSubscriptionContext();

  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [busyPlan, setBusyPlan] = useState<PlanType | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [kycReady, setKycReady] = useState<boolean | null>(null);
  const [kycMessage, setKycMessage] = useState<string>('Checking verification status…');

  // Highlight the preselected plan card (D6 Flow10_S7 — upgrade path lands on
  // paywall with Team pre-selected).
  const preselectedPlan = route.params?.preselectedPlan ?? null;

  // D6 Flow12 S12 — the KYC-verified push deep-links to a bare `paywall` URL
  // with no plan param. Fall back to the worker's last-selected plan so it is
  // pre-highlighted, matching "Paywall with last-selected plan pre-loaded".
  const [storedPlan, setStoredPlan] = useState<PlanType | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('tb_last_selected_plan')
      .then((p) => {
        if (p) setStoredPlan(p as PlanType);
      })
      .catch(() => {});
  }, []);

  // KYC gate check (2.3.1) — goes through the kyc-status-check Edge Function,
  // which checks BOTH national_id and license statuses server-side and returns
  // a normalised can_subscribe / message. Server-side checkout (stripe-create-
  // checkout) re-validates as well, so this is the UI half of a defense-in-depth
  // gate.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await checkKycStatus();
      if (!res.success || !res.data) {
        setKycReady(false);
        setKycMessage('Could not load verification status.');
        return;
      }
      setKycReady(res.data.can_subscribe === true);
      setKycMessage(res.data.message ?? 'Identity verification required.');
    })();
  }, [user]);

  // Restore purchase (D3 F6 / 2.1.7) — re-check the Stripe customer and
  // re-activate a previously-purchased plan (e.g. after reinstall or on a new
  // device). Reuses the un-cancel/restore path and reconciles from the server.
  async function onRestore() {
    if (restoring) return;
    setRestoring(true);
    const result = await restoreSubscription();
    await refreshSubscription();
    setRestoring(false);
    if (result.success) {
      Alert.alert('Purchase restored', 'Your subscription has been restored.', [
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
    } else {
      Alert.alert(
        'Nothing to restore',
        'We could not find an active subscription to restore on this account. If you believe this is an error, contact support.',
      );
    }
  }

  async function onSubscribe(plan: PlanType) {
    if (busyPlan) return;
    setBusyPlan(plan);
    // Remember the worker's plan choice so a later bare `paywall` deep link
    // (e.g. KYC-verified push) can pre-highlight it.
    AsyncStorage.setItem('tb_last_selected_plan', plan).catch(() => {});
    const result = await purchaseSubscription(plan, cycle);
    setBusyPlan(null);

    if (result.ok) {
      // RULE 6 — optimistic activation. optimisticActivate() now polls the DB
      // internally until the Stripe webhook lands, so we no longer call
      // refreshSubscription() here (which used to race the webhook and
      // regress 'active' back to 'trial').
      optimisticActivate(plan);
      Alert.alert('Welcome aboard', 'Your subscription is active. Rex is unlocked.', [
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
      return;
    }

    switch (result.reason) {
      case 'kyc_required':
        Alert.alert(
          'Verification needed',
          'Your KYC documents must be verified before subscribing.',
        );
        break;
      case 'already_subscribed':
        refreshSubscription();
        Alert.alert(
          'Already subscribed',
          'You already have an active plan.',
          [
            { text: 'Close', style: 'cancel', onPress: () => nav.goBack() },
            {
              text: 'Manage plan',
              onPress: () => nav.navigate('SubscriptionSettings'),
            },
          ],
        );
        break;
      case 'declined':
        Alert.alert(
          'Payment declined',
          'Your card was declined. Try a different card or contact your bank.',
        );
        break;
      case 'network':
        Alert.alert('No connection', 'Check your network and try again.');
        break;
      default:
        if (result.message && result.message !== 'Cancelled') {
          Alert.alert('Could not start checkout', result.message);
        }
    }
  }

  // Defense in depth: if the user is already subscribed (or the webhook just
  // confirmed it while this screen was mounting), short-circuit with an
  // "already active" message instead of showing Subscribe buttons.
  if (subscriptionStatus === 'active') {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
        <View className="px-5 pb-3 flex-row items-center justify-between">
          <Pressable onPress={() => nav.goBack()}>
            <Text className="text-gray-500 text-base">Close</Text>
          </Pressable>
          <Text className="text-base font-semibold">Subscription</Text>
          <View className="w-12" />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            You're already subscribed
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            {planType
              ? `Your ${planType[0].toUpperCase() + planType.slice(1)} plan is active. Manage it from Settings → Subscription.`
              : 'Your plan is active. Manage it from Settings → Subscription.'}
          </Text>
          <Pressable
            onPress={() => nav.goBack()}
            className="bg-brand px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-5 pb-3 flex-row items-center justify-between">
        <Pressable onPress={() => nav.goBack()}>
          <Text className="text-gray-500 text-base">Close</Text>
        </Pressable>
        <Text className="text-base font-semibold">Choose your plan</Text>
        <View className="w-12" />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + insets.bottom }}>
        {/* Billing cycle toggle — inline styles to avoid NativeWind shadow-sm crash on new arch */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
            alignSelf: 'center',
          }}
        >
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => {
            const active = cycle === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCycle(c)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: active ? '#FFFFFF' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: active ? '#1E3A5F' : '#4B5563',
                    fontWeight: active ? '600' : '400',
                  }}
                >
                  {c === 'monthly' ? 'Monthly' : 'Annual · 20% off'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* KYC gate banner */}
        {kycReady === false && (
          <View className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4">
            <Text className="text-sm text-amber-800 font-semibold">
              Verification required
            </Text>
            <Text className="text-xs text-amber-700">{kycMessage}</Text>
          </View>
        )}
        {kycReady === null && (
          <View className="flex-row items-center justify-center mb-4">
            <ActivityIndicator size="small" />
            <Text className="text-xs text-gray-500 ml-2">Checking verification…</Text>
          </View>
        )}

        {/* Plan cards */}
        {PLANS.map((p) => {
          const price = PRICING[p.value];
          const display =
            cycle === 'monthly'
              ? `$${price.monthly.toFixed(2)}/month`
              : `$${price.monthlyEquivalent.toFixed(2)}/month`;
          const annualTotal =
            cycle === 'annual' ? `Billed $${price.annual.toFixed(2)}/year` : null;
          const busy = busyPlan === p.value;
          const disabled = !kycReady || busy;
          // 2.1.4 — Solo is the default highlighted plan when nothing was
          // explicitly pre-selected (e.g. the Team upgrade path passes 'team').
          const highlighted = (preselectedPlan ?? storedPlan ?? 'solo') === p.value;
          return (
            <View
              key={p.value}
              className={`rounded-2xl p-4 mb-3 bg-white border ${
                highlighted ? 'border-brand border-2' : 'border-gray-200'
              }`}
            >
              <View className="flex-row items-baseline justify-between mb-1">
                <Text className="text-xl font-bold text-gray-900">{p.label}</Text>
                <Text className="text-base font-semibold text-brand">{display}</Text>
              </View>
              <Text className="text-xs text-gray-500 mb-2">{p.tagline}</Text>
              {annualTotal && (
                <View className="flex-row items-center mb-2">
                  <Text className="text-xs text-green-700">{annualTotal}</Text>
                  <View className="ml-2 bg-green-100 rounded-full px-2 py-0.5">
                    <Text className="text-[10px] font-semibold text-green-700">
                      Save 20%
                    </Text>
                  </View>
                </View>
              )}
              {p.perks.map((perk) => (
                <Text key={perk} className="text-sm text-gray-700">
                  • {perk}
                </Text>
              ))}
              <Pressable
                onPress={() => onSubscribe(p.value)}
                disabled={disabled}
                className={`mt-4 py-3 rounded-xl ${disabled ? 'bg-gray-300' : 'bg-brand'}`}
              >
                <Text className="text-center text-white font-semibold">
                  {busy ? 'Opening checkout…' : `Subscribe to ${p.label}`}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Team seat note */}
        <Text className="text-xs text-gray-500 text-center mt-2">
          Team plan adds seats at ${PRICING.seat.monthly.toFixed(2)}/month
          (${PRICING.seat.monthlyEquivalent.toFixed(2)} on annual) beyond the base of 3.
        </Text>

        <Text className="text-xs text-gray-400 text-center mt-6">
          Apple Pay and Google Pay available at checkout. Cancel any time — access
          continues until the end of the period.
        </Text>

        {/* 2.1.7 — Restore purchase */}
        <Pressable onPress={onRestore} disabled={restoring} className="mt-6">
          <Text className="text-center text-sm text-brand font-semibold">
            {restoring ? 'Restoring…' : 'Restore purchase'}
          </Text>
        </Pressable>

        {/* 2.1.6 — Browse the app in read-only mode (History stays accessible;
            features remain gated). Dismissing the modal returns to the app. */}
        <Pressable onPress={() => nav.goBack()} className="mt-3 mb-2">
          <Text className="text-center text-sm text-gray-500 underline">
            Browse app in read-only mode
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

