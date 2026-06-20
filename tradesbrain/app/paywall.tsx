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
  Modal,
  Platform,
  Linking,
} from 'react-native';
import LottieIllustration from '../components/shared/LottieIllustration';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRICING, IOS_ANNUAL_AVAILABILITY_NOTE } from '../constants/pricing';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { useIapContext } from '../context/IapProvider';
import { useAuthContext } from '../context/AuthContext';
import { checkKycStatus } from '../services/stripe';
import { iapProductId, iapOffered } from '../services/appleIap';
import {
  isExternalCheckoutAllowed,
  openExternalCheckout,
  EXTERNAL_PURCHASE_DISCLOSURE,
} from '../services/externalPurchase';
import {
  purchaseSubscription,
  restoreSubscription,
  type BillingCycle,
  type PlanType,
} from '../services/payments';

const IS_IOS = Platform.OS === 'ios';
// Apple's standard EULA for auto-renewable subscriptions (App Store requirement).
const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

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
  const iap = useIapContext();

  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [busyPlan, setBusyPlan] = useState<PlanType | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [kycReady, setKycReady] = useState<boolean | null>(null);
  const [kycMessage, setKycMessage] = useState<string>('Checking verification status…');
  // Subscription-activated success overlay (D6 Flow09 S6 — celebratory confirm).
  const [activated, setActivated] = useState(false);
  // Hybrid payment (Task 3): is the US-only external Stripe web checkout allowed
  // for this user? null = still resolving the App Store storefront.
  const [externalAllowed, setExternalAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    isExternalCheckoutAllowed().then(setExternalAllowed).catch(() => setExternalAllowed(false));
  }, []);

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

    if (IS_IOS) {
      const restored = await iap.restore();
      await refreshSubscription();
      setRestoring(false);
      Alert.alert(
        restored ? 'Purchase restored' : 'Nothing to restore',
        restored
          ? 'Your subscription has been restored.'
          : 'We could not find an active subscription to restore on this Apple ID.',
        [{ text: 'OK', onPress: () => { if (restored) nav.goBack(); } }],
      );
      return;
    }

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

    // iOS → Apple In-App Purchase (StoreKit). The provider verifies server-side
    // and optimistically activates on success; we just surface the result.
    if (IS_IOS) {
      const r = await iap.purchase(iapProductId(plan, cycle));
      setBusyPlan(null);
      if (r.ok) {
        setActivated(true);
        return;
      }
      if (r.reason === 'cancelled') return;
      if (r.reason === 'validation_failed') {
        Alert.alert(
          'Purchase not verified',
          'Your purchase could not be verified. If you were charged, tap “Restore purchase” or contact support.',
        );
        return;
      }
      Alert.alert('Purchase failed', 'Something went wrong starting the purchase. Please try again.');
      return;
    }

    const result = await purchaseSubscription(plan, cycle);
    setBusyPlan(null);

    if (result.ok) {
      // RULE 6 — optimistic activation. optimisticActivate() now polls the DB
      // internally until the Stripe webhook lands, so we no longer call
      // refreshSubscription() here (which used to race the webhook and
      // regress 'active' back to 'trial').
      optimisticActivate(plan);
      // Celebratory confirm overlay instead of a plain alert; dismiss → back.
      setActivated(true);
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

  // Hybrid (Task 3) — US iOS users may opt into Stripe web checkout instead of
  // IAP (lower fees; also the only iOS route to Pro/Team annual). Apple requires
  // a clear disclosure before leaving the app and that the link open in the
  // system browser (handled in services/externalPurchase). IAP stays the primary
  // path — this is always an additional, secondary option.
  function onExternalCheckout(plan: PlanType) {
    AsyncStorage.setItem('tb_last_selected_plan', plan).catch(() => {});
    Alert.alert('Continue on the web', EXTERNAL_PURCHASE_DISCLOSURE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: async () => {
          const ok = await openExternalCheckout(plan, cycle);
          if (!ok) {
            Alert.alert('Could not open web checkout', 'Please try again, or use the in-app option.');
          }
        },
      },
    ]);
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
        <Pressable onPress={() => nav.goBack()} hitSlop={8}>
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
          // Is this plan+cycle sellable via Apple IAP? (Android always uses
          // Stripe, so it's always "offered" there.) On iOS, Pro/Team ANNUAL are
          // NOT on IAP (over Apple's $999.99 cap) — they route to web checkout.
          const offeredOnIap = !IS_IOS || iapOffered(p.value, cycle);
          // On iOS, show Apple's localized StoreKit price (the source of truth
          // for what the user is charged); fall back to the Stripe-derived
          // figures if products haven't loaded yet (or aren't on IAP at all).
          const iosProd = IS_IOS && offeredOnIap
            ? iap.products.find(
                (pr: { id?: string }) => pr?.id === iapProductId(p.value, cycle),
              )
            : null;
          const display = iosProd?.displayPrice
            ? `${iosProd.displayPrice}/${cycle === 'monthly' ? 'mo' : 'yr'}`
            : cycle === 'monthly'
              ? `$${price.monthly.toFixed(2)}/month`
              : `$${price.monthlyEquivalent.toFixed(2)}/month`;
          // "Billed $X/year" line: shown on Android (Stripe) and on the iOS
          // web-only annual cards (Pro/Team), where the real annual value
          // applies. Suppressed for iOS IAP annual (StoreKit price is the total).
          const annualTotal =
            cycle === 'annual' && (!IS_IOS || !offeredOnIap)
              ? offeredOnIap
                ? `Billed $${price.annual.toFixed(2)}/year`
                : `$${price.annual.toFixed(2)}/year · via web checkout`
              : null;
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
                  {offeredOnIap && (
                    <View className="ml-2 bg-green-100 rounded-full px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-green-700">
                        Save 20%
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {p.perks.map((perk) => (
                <Text key={perk} className="text-sm text-gray-700">
                  • {perk}
                </Text>
              ))}

              {offeredOnIap ? (
                <>
                  {/* Primary path — Apple IAP (iOS) / Stripe (Android). */}
                  <Pressable
                    onPress={() => onSubscribe(p.value)}
                    disabled={disabled}
                    className={`mt-4 py-3 rounded-xl ${disabled ? 'bg-gray-300' : 'bg-brand'}`}
                  >
                    <Text
                      className={`text-center font-semibold ${disabled ? 'text-gray-500' : 'text-white'}`}
                    >
                      {busy ? 'Opening checkout…' : `Subscribe to ${p.label}`}
                    </Text>
                  </Pressable>
                  {/* US iOS only — additional, secondary web-checkout option.
                      IAP above stays the primary, full-size button so it is
                      never disadvantaged (Apple external-link compliance). */}
                  {IS_IOS && externalAllowed === true && (
                    <Pressable
                      onPress={() => onExternalCheckout(p.value)}
                      disabled={busy}
                      className="mt-2 py-2"
                    >
                      <Text className="text-center text-xs text-brand underline">
                        or subscribe on the web
                      </Text>
                    </Pressable>
                  )}
                </>
              ) : (
                // iOS Pro/Team ANNUAL — not available via IAP (over Apple's cap).
                // LINE 2 transparency note + US web-checkout route (Task 4 / Task 3).
                <View className="mt-4">
                  <Text className="text-xs text-gray-500 mb-3">
                    {IOS_ANNUAL_AVAILABILITY_NOTE}
                  </Text>
                  {externalAllowed === true ? (
                    <Pressable
                      onPress={() => onExternalCheckout(p.value)}
                      className="py-3 rounded-xl border-2 border-brand"
                    >
                      <Text className="text-center font-semibold text-brand">
                        Subscribe annually on the web
                      </Text>
                    </Pressable>
                  ) : externalAllowed === false ? (
                    <Text className="text-xs text-gray-400">
                      Annual billing for {p.label} isn't available on iOS. Choose
                      Monthly here, or subscribe annually on Android or the web.
                    </Text>
                  ) : (
                    <ActivityIndicator size="small" />
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Team seat note — per-seat add-ons are web/Stripe only, so on iOS
            Team is a flat base of 3 seats (Apple IAP can't do per-seat quantity). */}
        {IS_IOS ? (
          <Text className="text-xs text-gray-500 text-center mt-2">
            Team plan includes 3 seats. Additional seats can be added from the
            TradesBrain web dashboard.
          </Text>
        ) : (
          <Text className="text-xs text-gray-500 text-center mt-2">
            Team plan adds seats at ${PRICING.seat.monthly.toFixed(2)}/month
            (${PRICING.seat.monthlyEquivalent.toFixed(2)} on annual) beyond the base of 3.
          </Text>
        )}

        {IS_IOS ? (
          // App Store review REQUIREMENT for auto-renewable subscriptions:
          // state the auto-renew terms and link Terms of Use (EULA) + Privacy.
          <View className="mt-6">
            <Text className="text-[11px] text-gray-400 text-center leading-4">
              Subscriptions are billed to your Apple ID. Your plan renews
              automatically for the same price and period unless auto-renew is
              turned off at least 24 hours before the current period ends. Manage
              or cancel anytime in your App Store account settings.
            </Text>
            <View className="flex-row justify-center mt-2">
              <Pressable onPress={() => Linking.openURL(APPLE_EULA_URL)} hitSlop={8}>
                <Text className="text-[11px] text-brand underline">Terms of Use (EULA)</Text>
              </Pressable>
              <Text className="text-[11px] text-gray-400 mx-2">·</Text>
              <Pressable onPress={() => nav.navigate('SettingsLegal')} hitSlop={8}>
                <Text className="text-[11px] text-brand underline">Privacy Policy</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text className="text-xs text-gray-400 text-center mt-6">
            Apple Pay and Google Pay available at checkout. Cancel any time — access
            continues until the end of the period.
          </Text>
        )}

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

      {/* Subscription activated — celebratory confirm overlay (D6 Flow09 S6) */}
      <Modal visible={activated} transparent animationType="fade" onRequestClose={() => {}}>
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <View className="bg-white rounded-3xl items-center px-6 pt-6 pb-7 w-full max-w-sm">
            <LottieIllustration
              source={require('../assets/animations/subscription-activated.json')}
              size={160}
              loop={false}
            />
            <Text className="text-xl font-bold text-gray-900 mt-1">Welcome aboard</Text>
            <Text className="text-sm text-gray-600 text-center mt-1 mb-5">
              Your subscription is active. Rex is unlocked.
            </Text>
            <Pressable
              onPress={() => {
                setActivated(false);
                nav.goBack();
              }}
              className="bg-brand py-3 rounded-xl w-full"
            >
              <Text className="text-center text-white font-semibold">Start using Rex</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

