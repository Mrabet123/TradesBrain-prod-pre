// D2 F8 / D6 Flow10 + Flow10_S7 — Trade type and account type changes.
// • Trade type: writes to users.trade_type immediately; TradeProfileContext
//   refreshes so the NEXT Rex session loads the new prompt (RULE 2).
// • Solopreneur → Team Owner: inline notice, paywall pre-loaded with Team
//   selected (RULE 3 — upgrade path).
// • Team Owner → Solopreneur: inline RED warning + full downgrade screen,
//   DELETE typed exactly, team_members + all their data destroyed (RULE 3 —
//   downgrade path).

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';
import { useAuthContext } from '../../context/AuthContext';
import { useTradeProfileContext } from '../../context/TradeProfileContext';
import { supabase } from '../../services/supabase';
import { listMembers, removeMember } from '../../services/team';
import { changePlan } from '../../services/payments';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type TradeType = 'plumber' | 'electrician' | 'hvac' | 'roofer' | 'other';
type AccountType = 'solopreneur' | 'team_owner';

const TRADES: { value: TradeType; label: string }[] = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'hvac', label: 'HVAC Technician' },
  { value: 'roofer', label: 'Roofer' },
  { value: 'other', label: 'Other / General Contractor' },
];

export default function TradeSettingsScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuthContext();
  const { refreshProfile } = useTradeProfileContext();

  const [tradeType, setTradeType] = useState<TradeType>('plumber');
  const [accountType, setAccountType] = useState<AccountType>('solopreneur');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Downgrade flow
  const [downgradeMode, setDowngradeMode] = useState(false);
  const [downgradeText, setDowngradeText] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select('trade_type, account_type')
      .eq('id', user.id)
      .single();
    if (data) {
      setTradeType(data.trade_type as TradeType);
      setAccountType(data.account_type as AccountType);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeTrade(next: TradeType) {
    if (!user || next === tradeType) return;
    setBusy(true);
    const { error } = await supabase
      .from('users')
      .update({ trade_type: next })
      .eq('id', user.id);
    setBusy(false);
    if (error) {
      Alert.alert('Could not change trade', error.message);
      return;
    }
    setTradeType(next);
    refreshProfile(); // next Rex session uses the new system prompt
    Alert.alert(
      'Trade updated',
      `Rex now loads the ${TRADES.find((t) => t.value === next)?.label ?? next} system prompt on your next session.`,
    );
  }

  function onPickAccountType(next: AccountType) {
    if (next === accountType) return;
    if (accountType === 'solopreneur' && next === 'team_owner') {
      // Upgrade path — paywall pre-loaded with Team
      Alert.alert(
        'Upgrade to Team Owner',
        'Switching to Team Owner requires a Team plan. We will pre-load the paywall.',
        [
          { text: 'Cancel' },
          {
            text: 'See Team plan',
            onPress: () =>
              nav.navigate('Paywall', { preselectedPlan: 'team' } as any),
          },
        ],
      );
      return;
    }
    // Downgrade path
    setDowngradeMode(true);
  }

  async function confirmDowngrade() {
    if (!user || downgradeText !== 'DELETE') return;
    setBusy(true);
    try {
      // RULE 3 — fully destroy every team member, not just unlink the seat.
      // delete-team-member (service-role Edge Function) wipes each member's
      // auth record, Rex sessions, reports, quotes, photos + storage, removes
      // the team_members row AND decrements the Stripe seat. We must do this
      // BEFORE flipping account_type so a partial failure leaves the owner on
      // the Team plan with the still-present members, not a half-downgraded
      // account with orphaned member accounts.
      const members = await listMembers(user.id);
      const failures: string[] = [];
      for (const m of members) {
        const { ok, error } = await removeMember(m.memberId);
        if (!ok) failures.push(`${m.fullName || m.memberId}: ${error ?? 'failed'}`);
      }
      if (failures.length > 0) {
        throw new Error(
          `Could not remove ${failures.length} member(s). No changes were made to your account type. ${failures.join('; ')}`,
        );
      }

      // D-AUDIT (4.5 / 3.6.5): move the Stripe subscription off the Team base
      // price onto Solo. Removing the member seats alone left the ex-owner being
      // billed the Team base rate forever. Do this BEFORE flipping account_type
      // so the billing is corrected first. 'already_on_plan' (409) means a prior
      // partial attempt already switched the plan — treat that as success.
      const planResult = await changePlan('solo');
      if (!planResult.success && !/already_on_plan/i.test(planResult.error ?? '')) {
        throw new Error(
          `Team members were removed, but your plan could not be switched to Solo: ${
            planResult.error ?? 'unknown error'
          }. Your account type was not changed — please try again.`,
        );
      }

      const { error } = await supabase
        .from('users')
        .update({ account_type: 'solopreneur' })
        .eq('id', user.id);
      if (error) throw error;
      setAccountType('solopreneur');
      setDowngradeMode(false);
      setDowngradeText('');
      Alert.alert(
        'Downgraded',
        'You are now a Solopreneur on the Solo plan. All team members and their data have been permanently deleted, and your billing has been switched to Solo.',
      );
    } catch (e: any) {
      Alert.alert('Could not downgrade', e?.message ?? 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAwareScreen bottomInset={96} contentContainerClassName="pt-12 px-5">
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => nav.goBack()}>
          <Text className="text-brand text-base">← Back</Text>
        </Pressable>
        <Text className="text-base font-semibold">Trade & account</Text>
        <View className="w-12" />
      </View>

      <Text className="text-xs uppercase text-gray-500 font-medium mb-2">
        Trade type
      </Text>
      {TRADES.map((t) => {
        const on = t.value === tradeType;
        return (
          <Pressable
            key={t.value}
            onPress={() => changeTrade(t.value)}
            disabled={busy}
            className={`flex-row items-center py-3 px-3 rounded-lg mb-2 border ${
              on ? 'border-brand bg-brand/5' : 'border-gray-200'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                on ? 'border-brand bg-brand' : 'border-gray-400'
              }`}
            />
            <Text className="text-base text-gray-800">{t.label}</Text>
          </Pressable>
        );
      })}
      <Text className="text-xs text-gray-500 mb-6">
        Changing trade updates Rex on your next session.
      </Text>

      <Text className="text-xs uppercase text-gray-500 font-medium mb-2">
        Account type
      </Text>
      {(['solopreneur', 'team_owner'] as AccountType[]).map((t) => {
        const on = t === accountType;
        return (
          <Pressable
            key={t}
            onPress={() => onPickAccountType(t)}
            disabled={busy}
            className={`flex-row items-center py-3 px-3 rounded-lg mb-2 border ${
              on ? 'border-brand bg-brand/5' : 'border-gray-200'
            }`}
          >
            <View
              className={`w-5 h-5 rounded-full border-2 mr-3 ${
                on ? 'border-brand bg-brand' : 'border-gray-400'
              }`}
            />
            <Text className="text-base text-gray-800">
              {t === 'solopreneur' ? 'Solopreneur' : 'Team Owner'}
            </Text>
          </Pressable>
        );
      })}

      {/* Inline notices */}
      {accountType === 'solopreneur' && (
        <View className="bg-brand/10 border border-brand/30 rounded-lg p-3 mt-2">
          <Text className="text-xs text-brand">
            Switching to Team Owner requires a Team plan. We will pre-load the
            paywall when you tap the option.
          </Text>
        </View>
      )}
      {accountType === 'team_owner' && !downgradeMode && (
        <View className="bg-red-50 border border-red-300 rounded-lg p-3 mt-2">
          <Text className="text-xs text-red-700">
            Downgrading to Solopreneur permanently deletes all team member
            accounts and all their data. Tap Solopreneur above to begin.
          </Text>
        </View>
      )}

      {/* Downgrade confirm */}
      {downgradeMode && (
        <View className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mt-4">
          <Text className="text-sm font-bold text-red-700 mb-1">
            Confirm downgrade to Solopreneur
          </Text>
          <Text className="text-xs text-red-700 mb-3">
            All team members, their Rex sessions, reports, quotes and photos will
            be destroyed immediately. This cannot be undone.
          </Text>
          <Text className="text-xs text-gray-700 mb-1">
            Type <Text className="font-bold">DELETE</Text> exactly to confirm.
          </Text>
          <TextInput
            value={downgradeText}
            onChangeText={setDowngradeText}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
            className="border border-red-300 rounded-lg px-3 py-2 text-base text-gray-900 mb-3 bg-white"
          />
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => {
                setDowngradeMode(false);
                setDowngradeText('');
              }}
              className="flex-1 py-3 rounded-lg border border-gray-300"
            >
              <Text className="text-center text-gray-700 font-semibold">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={confirmDowngrade}
              disabled={downgradeText !== 'DELETE' || busy}
              className={`flex-1 py-3 rounded-lg ${
                downgradeText !== 'DELETE' || busy ? 'bg-gray-300' : 'bg-red-600'
              }`}
            >
              <Text className="text-center text-white font-semibold">
                {busy ? 'Working…' : 'Confirm downgrade'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAwareScreen>
  );
}
