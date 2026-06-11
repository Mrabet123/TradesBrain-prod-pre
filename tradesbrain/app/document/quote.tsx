// D3 F3, D6 Flow06 — Quote builder screen.
// Path A: route params { sessionId } — reuses report data if a report exists.
// Path B: no sessionId — standalone quote, creates session_source='quote_standalone'.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';

import { supabase } from '../../services/supabase';
import {
  createQuoteDraft,
  saveQuoteDraft,
  discardQuoteDraft,
  confirmQuote,
  loadPrefs,
  savePrefs,
  quoteSubtotal,
  type QuoteDraft,
  type QuoteLineItem,
  type ProfileBlock,
} from '../../services/documents';
import { sharePdf } from '../../services/share';
import { transcribeAudio } from '../../services/openai';
import { useAuthContext } from '../../context/AuthContext';
import { useTradeProfileContext } from '../../context/TradeProfileContext';
import { useNetworkContext } from '../../context/NetworkContext';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import QuotePreview from '../../components/documents/QuotePreview';
import SectionPicker from '../../components/documents/SectionPicker';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import VoiceRecordButton from '../../components/rex/VoiceRecordButton';
import { DEFAULT_QUOTE_SECTIONS } from '../../constants/paymentMethods';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteT = RouteProp<RootStackParamList, 'QuoteBuilder'>;

export default function QuoteBuilderScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { user } = useAuthContext();
  const { tradeType, hourlyRate } = useTradeProfileContext();
  const { isConnected } = useNetworkContext();

  const incomingSessionId = route.params?.sessionId ?? null;
  const [sessionId, setSessionId] = useState<string | null>(incomingSessionId);
  const [jobName, setJobName] = useState('');
  // ISS-9: Path A — digest of the prior Rex session, fed to the AI quote draft.
  const [sessionContext, setSessionContext] = useState('');
  // ISS-H5: job description drives Rex's line-item / labour draft generation.
  const [description, setDescription] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const voice = useVoiceRecording();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  const [draft, setDraft] = useState<QuoteDraft | null>(null);
  const [confirming, setConfirming] = useState(false);
  // D6 Flow12 S6 — a confirm requested while offline is deferred and fires
  // automatically once the connection returns (see effect below).
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileBlock | null>(null);
  const [loading, setLoading] = useState(true);

  // CC-5 Fix A — in-app styled prompts (replace OS Alert dialogs).
  const [pendingNav, setPendingNav] = useState<any>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // ISS-9: Path A — pull the prior Rex session transcript so the AI quote
      // draft reflects the actual diagnosis and work done.
      const messagesFetch = incomingSessionId
        ? supabase
            .from('messages')
            .select('role, content_text')
            .eq('session_id', incomingSessionId)
            .order('created_at', { ascending: true })
        : Promise.resolve({ data: null });

      const [profileRes, prefs, messagesRes] = await Promise.all([
        supabase
          .from('users')
          .select('full_name, trade_type, hourly_rate, vat_number, license_number, company_name')
          .eq('id', user.id)
          .single(),
        loadPrefs(user.id, 'quote'),
        messagesFetch,
      ]);

      // ISS-9: build a compact transcript digest (cap ~4000 chars).
      const msgRows = (messagesRes as any)?.data as
        | Array<{ role: string; content_text: string | null }>
        | null;
      if (msgRows?.length) {
        setSessionContext(
          msgRows
            .filter((m) => m.content_text)
            .map((m) => `${m.role === 'user' ? 'Worker' : 'Rex'}: ${m.content_text}`)
            .join('\n')
            .slice(0, 4000),
        );
      }

      if (profileRes.data) {
        setProfile({
          fullName: profileRes.data.full_name,
          tradeType: profileRes.data.trade_type,
          hourlyRate: Number(profileRes.data.hourly_rate),
          vatNumber: profileRes.data.vat_number ?? '',
          licenseNumber: profileRes.data.license_number ?? '',
          companyName: profileRes.data.company_name ?? null,
        });
      }

      if (!prefs?.sections?.length) setPickerVisible(true);
      setPrefsLoaded(true);
      setLoading(false);
    })();
  }, [user]);

  // Discard prompt on back nav
  // CC-5 Fix A — intercept the navigation and show the in-app discard prompt
  // instead of an OS Alert.
  useEffect(() => {
    const unsub = nav.addListener('beforeRemove', (e) => {
      if (!draft || pdfUri || confirming) return;
      e.preventDefault();
      setPendingNav(e.data.action);
    });
    return unsub;
  }, [nav, draft, pdfUri, confirming]);

  // Worker confirmed the discard — delete the draft, then replay the
  // intercepted navigation. The draft never reaches Job History.
  async function onConfirmDiscard() {
    const action = pendingNav;
    setPendingNav(null);
    if (draft) await discardQuoteDraft(draft.id);
    if (action) nav.dispatch(action);
  }

  // ISS-H5 — voice → transcribe → job description.
  async function onVoiceStop() {
    const uri = await voice.stopRecording();
    if (!uri) return;
    setTranscribing(true);
    const res = await transcribeAudio(uri);
    setTranscribing(false);
    if (!res.ok || !res.text) {
      Alert.alert('Voice failed', 'Could not transcribe — type the description instead.');
      return;
    }
    const text = res.text;
    setDescription((prev) => (prev ? `${prev}\n\n${text}` : text));
  }

  async function onGenerate() {
    if (!user || !profile) return;
    setConfirming(true);
    try {
      let sid = sessionId;

      if (!sid) {
        if (!jobName.trim()) {
          setConfirming(false);
          Alert.alert('Name the job', 'Type a name before generating.');
          return;
        }
        const { data, error } = await supabase
          .from('job_sessions')
          .insert({
            user_id: user.id,
            trade_type: tradeType || 'plumber',
            session_source: 'quote_standalone',
            status: 'completed',
            closed_at: new Date().toISOString(),
            job_name: jobName.trim(),
          })
          .select()
          .single();
        if (error || !data) throw error;
        sid = data.id;
        setSessionId(sid);
      } else if (jobName.trim()) {
        // D6 Flow06 S2 Path A — if the worker named the job here, persist it
        // back to the existing session so History reflects the chosen name.
        await supabase
          .from('job_sessions')
          .update({ job_name: jobName.trim() })
          .eq('id', sid);
      }

      // Path A — reuse a prior report's confirmed_amount and time-on-site
      let seedLineItems: QuoteLineItem[] = [];
      let labourHoursSeed = 0;
      if (incomingSessionId) {
        const { data: report } = await supabase
          .from('job_reports')
          .select('confirmed_amount, sections_config')
          .eq('session_id', incomingSessionId)
          .eq('status', 'finalised')
          .order('version_number', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (report?.confirmed_amount) {
          seedLineItems = [
            { id: 'li-seed', name: 'Work completed (from report)', qty: 1, unitCost: Number(report.confirmed_amount) },
          ];
        }
        const { data: ses } = await supabase
          .from('job_sessions')
          .select('time_on_jobsite_seconds')
          .eq('id', incomingSessionId)
          .maybeSingle();
        if (ses?.time_on_jobsite_seconds) {
          labourHoursSeed = Math.round((ses.time_on_jobsite_seconds / 3600) * 10) / 10;
        }
      }

      const prefs = await loadPrefs(user.id, 'quote');
      // ISS-H5: Rex drafts line items + a labour estimate from the description.
      // ISS-9: Path A also feeds the prior Rex session transcript to the draft.
      const d = await createQuoteDraft(
        sid!,
        user.id,
        profile.hourlyRate || hourlyRate || 0,
        prefs,
        seedLineItems,
        tradeType || 'plumber',
        description.trim(),
        sessionContext,
      );
      // Path A's session-time labour estimate takes precedence when present.
      if (labourHoursSeed > 0) d.labourHours = labourHoursSeed;
      setDraft(d);
      // ISS-H5: surface Rex's follow-up questions (non-blocking).
      if (d.aiFollowUps && d.aiFollowUps.length) {
        Alert.alert(
          'Rex has a few follow-up questions',
          d.aiFollowUps.map((q) => `• ${q}`).join('\n') +
            '\n\nAdd any missing detail directly in the draft below.',
        );
      }
    } catch (e: any) {
      Alert.alert('Could not start quote', e?.message ?? 'Unknown error');
    } finally {
      setConfirming(false);
    }
  }

  function onDraftChange(next: QuoteDraft) {
    setDraft(next);
    saveQuoteDraft(next);
  }

  // ISS-26: build summary lines shown in the confirm dialog before locking.
  function buildConfirmSummary(): string[] {
    if (!draft) return [];
    const total = draft.confirmedTotal ?? quoteSubtotal(draft);
    const lines: string[] = [];
    lines.push(`Line items: ${draft.lineItems.length}`);
    lines.push(`Total: $${total.toFixed(2)}`);
    lines.push(`VAT included: ${draft.includesVat ? 'Yes' : 'No'}`);
    lines.push(`License included: ${draft.includesLicense ? 'Yes' : 'No'}`);
    return lines;
  }

  // CC-5 Fix A — open the in-app confirm-and-lock prompt (no OS Alert).
  function doConfirm() {
    if (!draft || !profile || !user) return;
    setConfirmVisible(true);
  }

  // Runs the permanent lock after the worker confirms via the in-app prompt.
  async function runConfirm() {
    if (!draft || !profile || !user) return;
    // ISS-M12 (RQ-5): PDF generation + storage upload need a connection.
    if (!isConnected) {
      setConfirmVisible(false);
      setPendingConfirm(true);
      Alert.alert(
        'You are offline',
        'Your draft is saved. The PDF will generate and lock automatically as soon as you reconnect.',
      );
      return;
    }
    // D6 Flow06 S7 — quote with labour hours but no hourly rate is invalid:
    // the locked PDF would show $0 labour. Block the confirm and offer a
    // direct route to set the rate.
    if ((draft.labourHours ?? 0) > 0 && (!profile.hourlyRate || profile.hourlyRate <= 0)) {
      setConfirmVisible(false);
      Alert.alert(
        'Hourly rate missing',
        'Set your hourly rate before locking a quote with labour. Open Settings → Profile to add it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => (nav as any).navigate('SettingsProfile'),
          },
        ],
      );
      return;
    }
    setConfirmVisible(false);
    setPendingConfirm(false);
    setConfirming(true);
    try {
      const total = draft.confirmedTotal ?? quoteSubtotal(draft);
      const next: QuoteDraft = { ...draft, confirmedTotal: total };
      const { pdfUri } = await confirmQuote(next, profile);
      setDraft(next);
      setPdfUri(pdfUri);
      // Remember these choices as the worker's quote defaults (D3 RULE 6)
      savePrefs(user.id, 'quote', {
        defaultIncludeVat: next.includesVat,
        defaultIncludeLicense: next.includesLicense,
        defaultPaymentTerms: next.paymentTerms,
        paymentMethods: next.paymentMethods,
      }).catch(() => {});
      // AUDIT-005 — success state renders inline below the button (locked PDF
      // panel becomes visible when pdfUri is set); no Alert toast needed.
    } catch {
      // CC-4 (D6 Flow12 S18) — exact PDF-failure copy + a Retry action.
      Alert.alert('Could not generate PDF', 'Could not generate PDF — try again.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => runConfirm() },
      ]);
    } finally {
      setConfirming(false);
    }
  }

  // D6 Flow12 S6 — auto-fire the deferred confirm once the connection returns.
  useEffect(() => {
    if (isConnected && pendingConfirm && draft && !confirming) {
      setPendingConfirm(false);
      runConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, pendingConfirm]);

  async function onSavePrefs(sections: string[]) {
    if (!user) return;
    await savePrefs(user.id, 'quote', { sections });
    setPickerVisible(false);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAwareScreen bottomInset={96} contentContainerClassName="px-5">
      {/* D6 Flow06 S6 — confirmed state flips the header background green and
          shows "🔒 Quote N" with version. Green bar bleeds horizontally
          (-mx-5 px-5); top spacing comes from the KeyboardAwareScreen inset. */}
      <View
        className={`flex-row items-center justify-between mb-2 -mx-5 px-5 pt-1 pb-3 ${
          pdfUri ? 'bg-green-50' : ''
        }`}
      >
        <Pressable onPress={() => nav.goBack()} hitSlop={8}>
          <Text className={`text-base ${pdfUri ? 'text-green-700' : 'text-brand'}`}>← Back</Text>
        </Pressable>
        <Text
          className={`text-base font-semibold ${pdfUri ? 'text-green-700' : 'text-gray-900'}`}
        >
          {pdfUri
            ? `🔒 Quote ${draft?.versionNumber ?? ''}`.trim()
            : `Quote ${incomingSessionId ? 'Path A' : 'Path B'}`}
        </Text>
        <View className="w-12" />
      </View>

      <SectionPicker
        visible={pickerVisible && prefsLoaded}
        title="Quote sections"
        defaultSections={DEFAULT_QUOTE_SECTIONS}
        onConfirm={onSavePrefs}
        onCancel={() => setPickerVisible(false)}
      />

      {!draft ? (
        <View>
          {/* D6 Flow06 S2 — Path A also lets the worker name the job so it
              shows clearly in History. Path B requires it (no source session). */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              {incomingSessionId ? 'Job name (optional — for History)' : 'Job name'}
            </Text>
            <TextInput
              value={jobName}
              onChangeText={setJobName}
              placeholder="e.g. Bathroom remodel — 47 Oak Lane"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900"
            />
          </View>

          <Text className="text-sm font-semibold text-brand mb-1">Job description</Text>
          <Text className="text-xs text-gray-500 mb-2">
            {incomingSessionId
              ? 'Describe the job — Rex drafts the line items and labour estimate, on top of anything reused from this session and the latest confirmed report.'
              : 'Describe the job in full — Rex will draft the quote line items and a labour estimate from this.'}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Type or use the mic below…"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 min-h-[110px] mb-3"
          />
          {/* D6 Flow12 S2 — mic denied also covers the Quote voice summary. */}
          {voice.permissionDenied && (
            <View className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3">
              <Text className="text-amber-800 text-sm font-medium mb-0.5">
                Microphone access denied
              </Text>
              <Text className="text-amber-700 text-xs">
                Voice input is off — type the description above, or{' '}
                <Text
                  className="underline font-semibold"
                  onPress={() => Linking.openSettings()}
                >
                  open Settings
                </Text>{' '}
                to enable the mic.
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-4">
            <VoiceRecordButton
              isRecording={voice.isRecording}
              onPressIn={voice.startRecording}
              onPressOut={onVoiceStop}
              disabled={voice.permissionDenied}
            />
            {transcribing && (
              <View className="flex-row items-center ml-3">
                <ActivityIndicator size="small" />
                <Text className="text-xs text-gray-500 ml-2">Transcribing…</Text>
              </View>
            )}
          </View>

          {!profile?.hourlyRate && (
            <Pressable
              onPress={() => nav.navigate('SettingsTrade')}
              className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3"
            >
              <Text className="text-amber-800 text-sm">
                Hourly rate not set — the labour line will be skipped. Set it in
                Settings → Trade.
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={onGenerate}
            disabled={confirming || (!incomingSessionId && !jobName.trim())}
            className={`py-4 rounded-xl ${
              confirming || (!incomingSessionId && !jobName.trim())
                ? 'bg-gray-300'
                : 'bg-brand'
            }`}
          >
            <Text className="text-center text-white font-semibold text-base">
              {confirming ? 'Working…' : 'Generate quote'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <QuotePreview draft={draft} onChange={onDraftChange} />

          {pdfUri ? (
            <View className="mt-2 gap-2">
              <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                <Text className="text-green-800 font-semibold">Quote locked ✓</Text>
                <Text className="text-green-700 text-xs">
                  Saved to Job History. Cannot be edited.
                </Text>
              </View>
              <Pressable
                onPress={() => sharePdf(pdfUri, 'Quote')}
                className="bg-brand py-4 rounded-xl"
              >
                <Text className="text-center text-white font-semibold">Share PDF</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={doConfirm}
              disabled={confirming || !isConnected}
              className={`mt-2 py-4 rounded-xl ${
                confirming || !isConnected ? 'bg-gray-300' : 'bg-brand'
              }`}
            >
              <Text className="text-center text-white font-semibold text-base">
                {confirming
                  ? 'Locking…'
                  : !isConnected
                  ? 'Confirm — waiting for connection'
                  : 'Confirm & generate PDF'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* CC-5 Fix A — in-app confirm-and-lock prompt (D6 Flow06) */}
      {/* ISS-26: summaryLines provides a brief document summary before locking */}
      <ConfirmDialog
        visible={confirmVisible}
        title="This action permanently locks all sections."
        message="The quote cannot be edited after confirming."
        summaryLines={buildConfirmSummary()}
        primaryLabel="Yes — confirm and generate PDF"
        secondaryLabel="Go back and edit"
        onPrimary={runConfirm}
        onSecondary={() => setConfirmVisible(false)}
        busy={confirming}
      />

      {/* CC-5 Fix A — in-app discard prompt (D6 Flow06) */}
      <ConfirmDialog
        visible={!!pendingNav}
        title="This document has not been confirmed. It will be discarded."
        message="Your draft will be permanently removed and will not appear in Job History."
        primaryLabel="Go back and confirm"
        secondaryLabel="Discard — I am sure"
        destructiveSecondary
        onPrimary={() => setPendingNav(null)}
        onSecondary={onConfirmDiscard}
      />
    </KeyboardAwareScreen>
  );
}
