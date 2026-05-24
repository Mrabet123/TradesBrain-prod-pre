// D3 F2, D6 Flow05 — Report builder screen.
// Path A: route params { sessionId } — Rex session context pre-loaded.
// Path B: no sessionId — Rex asks for full description by voice, builder creates
//   a new job_sessions row with session_source='report_standalone'.
// Confirm permanently locks via prevent_finalised_update trigger.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';

import { supabase } from '../../services/supabase';
import {
  createReportDraft,
  saveReportDraft,
  discardReportDraft,
  confirmReport,
  loadPrefs,
  savePrefs,
  type ReportDraft,
  type ReportSection,
  type ProfileBlock,
} from '../../services/documents';
import { sharePdf } from '../../services/share';
import { transcribeAudio } from '../../services/openai';
import { useAuthContext } from '../../context/AuthContext';
import { useTradeProfileContext } from '../../context/TradeProfileContext';
import { useNetworkContext } from '../../context/NetworkContext';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import ReportPreview from '../../components/documents/ReportPreview';
import SectionPicker from '../../components/documents/SectionPicker';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import VoiceRecordButton from '../../components/rex/VoiceRecordButton';
import { DEFAULT_REPORT_SECTIONS } from '../../constants/paymentMethods';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteT = RouteProp<RootStackParamList, 'ReportBuilder'>;

export default function ReportBuilderScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const { user } = useAuthContext();
  const { tradeType, hourlyRate } = useTradeProfileContext();
  const { isConnected } = useNetworkContext();
  const voice = useVoiceRecording();

  // Path indicator
  const incomingSessionId = route.params?.sessionId ?? null;
  const [sessionId, setSessionId] = useState<string | null>(incomingSessionId);
  // ISS-16: session time-on-jobsite in seconds (fetched when Path A sessionId is present)
  const [jobsiteSeconds, setJobsiteSeconds] = useState<number | null>(null);
  // ISS-M12 (RQ-3): Path A — digest of the prior Rex session, fed to the draft.
  const [sessionContext, setSessionContext] = useState('');
  const [jobName, setJobName] = useState('');

  // Section picker (first-time gate)
  const [pickerVisible, setPickerVisible] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [prefsSections, setPrefsSections] = useState<readonly string[]>(DEFAULT_REPORT_SECTIONS);

  // Voice summary
  const [summary, setSummary] = useState('');
  const [transcribing, setTranscribing] = useState(false);

  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileBlock | null>(null);
  const [loading, setLoading] = useState(true);

  // CC-5 Fix A — in-app styled prompts (replace OS Alert dialogs).
  // `pendingNav` holds the intercepted navigation action while the discard
  // prompt is shown; `confirmVisible` drives the confirm-and-lock prompt.
  const [pendingNav, setPendingNav] = useState<any>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  // ── Load profile + prefs on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      // ISS-16: also fetch session time if Path A
      const sessionFetch = incomingSessionId
        ? supabase
            .from('job_sessions')
            .select('time_on_jobsite_seconds')
            .eq('id', incomingSessionId)
            .maybeSingle()
        : Promise.resolve({ data: null });
      // ISS-M12 (RQ-3): Path A — pull the prior Rex session transcript so the
      // report draft reflects the actual diagnosis and work done.
      const messagesFetch = incomingSessionId
        ? supabase
            .from('messages')
            .select('role, content_text')
            .eq('session_id', incomingSessionId)
            .order('created_at', { ascending: true })
        : Promise.resolve({ data: null });

      const [profileRes, prefs, sessionRes, messagesRes] = await Promise.all([
        supabase
          .from('users')
          .select('full_name, trade_type, hourly_rate, vat_number, license_number, company_name')
          .eq('id', user.id)
          .single(),
        loadPrefs(user.id, 'report'),
        sessionFetch,
        messagesFetch,
      ]);
      // ISS-M12 (RQ-3): build a compact transcript digest (cap ~4000 chars).
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
      // ISS-16: store time-on-jobsite so suggestedAmount can be derived
      if ((sessionRes as any)?.data?.time_on_jobsite_seconds) {
        setJobsiteSeconds((sessionRes as any).data.time_on_jobsite_seconds);
      }
      if (prefs?.sections?.length) {
        setPrefsSections(prefs.sections);
      } else {
        setPickerVisible(true);
      }
      setPrefsLoaded(true);
      setLoading(false);
    })();
  }, [user]);

  // ── Discard prompt on back navigation (D3 F2 DISCARD RULE) ────────────────
  // CC-5 Fix A — intercept the navigation and show the in-app discard prompt
  // instead of an OS Alert. The intercepted action is replayed only if the
  // worker confirms the discard.
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
    if (draft) await discardReportDraft(draft.id);
    if (action) nav.dispatch(action);
  }

  // ── Voice → transcribe → summary ──────────────────────────────────────────
  async function onVoiceStop() {
    const uri = await voice.stopRecording();
    if (!uri) return;
    setTranscribing(true);
    const res = await transcribeAudio(uri);
    setTranscribing(false);
    if (!res.ok || !res.text) {
      Alert.alert(
        'Voice failed',
        'Whisper proxy unavailable. Type the summary instead or deploy the Edge Function.',
      );
      return;
    }
    const text = res.text;
    setSummary((prev) => (prev ? `${prev}\n\n${text}` : text));
  }

  // ISS-21: track whether the worker has already seen the short-description warning.
  // Reset whenever the summary changes so an extended description clears the flag.
  const [shortDescWarningShown, setShortDescWarningShown] = useState(false);
  useEffect(() => { setShortDescWarningShown(false); }, [summary]);

  async function onGenerate() {
    if (!user) return;
    if (!summary.trim()) {
      Alert.alert('Add a summary first', 'Record or type a brief summary of the work done.');
      return;
    }
    // ISS-21: non-blocking short-description warning (TC-085).
    // Warn once if the description is very short (< 15 words or < 60 chars).
    // On a second tap the worker proceeds — it is never a hard block.
    const trimmed = summary.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (!shortDescWarningShown && (wordCount < 15 || trimmed.length < 60)) {
      setShortDescWarningShown(true);
      Alert.alert(
        'Short description',
        'Your description is very short — the report may lack detail. Add more, or tap Generate again to continue.',
      );
      return;
    }
    setConfirming(true);
    try {
      let sid = sessionId;

      // Path B: create standalone session row
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
            session_source: 'report_standalone',
            status: 'completed',
            closed_at: new Date().toISOString(),
            job_name: jobName.trim(),
          })
          .select()
          .single();
        if (error || !data) throw error;
        sid = data.id;
        setSessionId(sid);
      }

      const prefs = await loadPrefs(user.id, 'report');
      // ISS-H5 + ISS-M12 (RQ-3): Rex drafts the section content from the voice
      // summary and, on Path A, the prior Rex session transcript.
      const d = await createReportDraft(
        sid!,
        user.id,
        summary.trim(),
        prefs,
        tradeType || 'plumber',
        sessionContext,
      );
      // D5 §6.1 — capture Rex's suggested amount (range midpoint) on the draft
      // so confirmReport() persists it to job_reports.suggested_amount.
      const range = rawSuggestedRange();
      d.suggestedAmount = range
        ? Math.round(((range.min + range.max) / 2) * 100) / 100
        : null;
      setDraft(d);
      // ISS-H5: surface Rex's follow-up questions (non-blocking — the worker can
      // still edit the draft directly).
      if (d.aiFollowUps && d.aiFollowUps.length) {
        Alert.alert(
          'Rex has a few follow-up questions',
          d.aiFollowUps.map((q) => `• ${q}`).join('\n') +
            '\n\nAdd any missing detail directly in the draft below.',
        );
      }
    } catch (e: any) {
      Alert.alert('Could not start report', e?.message ?? 'Unknown error');
    } finally {
      setConfirming(false);
    }
  }

  function onSectionContentChange(id: string, content: string) {
    if (!draft) return;
    const next = {
      ...draft,
      sections: draft.sections.map((s) => (s.id === id ? { ...s, content } : s)),
    };
    setDraft(next);
    saveReportDraft(next);
  }

  function onAddCustomSection() {
    if (!draft) return;
    const id = `c-${Date.now()}`;
    const next: ReportDraft = {
      ...draft,
      sections: [
        ...draft.sections,
        { id, name: 'Custom section', content: '', custom: true },
      ],
    };
    setDraft(next);
    saveReportDraft(next);
  }

  function onRemoveSection(id: string) {
    if (!draft) return;
    const next: ReportDraft = {
      ...draft,
      sections: draft.sections.filter((s) => s.id !== id),
    };
    setDraft(next);
    saveReportDraft(next);
  }

  // ISS-15: reorder report sections (move up / move down). The section order
  // is what the PDF renders, so swapping the array entries is sufficient.
  function onMoveSection(id: string, dir: 'up' | 'down') {
    if (!draft) return;
    const idx = draft.sections.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= draft.sections.length) return;
    const sections = [...draft.sections];
    [sections[idx], sections[swap]] = [sections[swap], sections[idx]];
    const next: ReportDraft = { ...draft, sections };
    setDraft(next);
    saveReportDraft(next);
  }

  // ISS-16 + ISS-M12 (RQ-4) — derive Rex's suggested payment range from the
  // time on the jobsite and the worker's hourly rate. Low end = labour only;
  // high end adds a ~30% materials/contingency band. Returns null when there
  // is no rate to base it on.
  function rawSuggestedRange(): { min: number; max: number } | null {
    const rate = profile?.hourlyRate || hourlyRate || 0;
    if (!rate) return null;
    const hours =
      jobsiteSeconds && jobsiteSeconds > 0
        ? Math.round((jobsiteSeconds / 3600) * 10) / 10
        : 1;
    const base = hours * rate;
    return {
      min: Math.round(base * 100) / 100,
      max: Math.round(base * 1.3 * 100) / 100,
    };
  }

  // ISS-26: build summary lines shown in the confirm dialog before locking.
  function buildConfirmSummary(): string[] {
    if (!draft) return [];
    const lines: string[] = [];
    lines.push(`Sections: ${draft.sections.length}`);
    if (draft.confirmedAmount != null && draft.confirmedAmount > 0) {
      lines.push(`Confirmed amount: $${draft.confirmedAmount.toFixed(2)}`);
    } else {
      lines.push('Confirmed amount: not set');
    }
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
    // ISS-M12 (RQ-5): PDF generation + storage upload need a connection. Fail
    // fast with a clear message rather than a cryptic PDF error — the draft is
    // auto-saved on every edit, so the worker can confirm later when online.
    if (!isConnected) {
      setConfirmVisible(false);
      Alert.alert(
        'You are offline',
        'Connect to the internet to generate and lock the PDF. Your draft is saved — confirm again when you have signal.',
      );
      return;
    }
    setConfirmVisible(false);
    setConfirming(true);
    try {
      const { pdfUri } = await confirmReport(draft, profile);
      setPdfUri(pdfUri);
      // Remember the VAT/license choices as the worker's report defaults
      savePrefs(user.id, 'report', {
        defaultIncludeVat: draft.includesVat,
        defaultIncludeLicense: draft.includesLicense,
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

  async function onSavePrefs(sections: string[]) {
    if (!user) return;
    setPrefsSections(sections);
    await savePrefs(user.id, 'report', { sections });
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
    <KeyboardAwareScreen bottomInset={96} contentContainerClassName="px-5 pt-12">
      {/* D6 Flow05 S6 — when the doc is confirmed the header flips green and
          shows the versioned "🔒 Report N" badge. Otherwise the neutral Path
          A / Path B label stays. */}
      <View
        className={`flex-row items-center justify-between mb-2 -mx-5 -mt-12 px-5 pt-12 pb-3 ${
          pdfUri ? 'bg-green-50' : ''
        }`}
      >
        <Pressable onPress={() => nav.goBack()}>
          <Text className={`text-base ${pdfUri ? 'text-green-700' : 'text-brand'}`}>
            ← Back
          </Text>
        </Pressable>
        <Text
          className={`text-base font-semibold ${
            pdfUri ? 'text-green-700' : 'text-gray-900'
          }`}
        >
          {pdfUri
            ? `🔒 Report ${draft?.versionNumber ?? ''}`.trim()
            : `Report ${incomingSessionId ? 'Path A' : 'Path B'}`}
        </Text>
        <View className="w-12" />
      </View>

      <SectionPicker
        visible={pickerVisible && prefsLoaded}
        title="Report sections"
        defaultSections={DEFAULT_REPORT_SECTIONS}
        onConfirm={onSavePrefs}
        onCancel={() => setPickerVisible(false)}
      />

      {!draft ? (
        <View>
          {!incomingSessionId && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Job name</Text>
              <TextInput
                value={jobName}
                onChangeText={setJobName}
                placeholder="e.g. 122 Main St — leaking water heater"
                className="border border-gray-300 rounded-lg px-3 py-3 text-base"
              />
            </View>
          )}

          <Text className="text-sm font-semibold text-brand mb-1">Voice summary</Text>
          <Text className="text-xs text-gray-500 mb-2">
            {incomingSessionId
              ? 'Record a brief summary of the work done — Rex already has the session details.'
              : 'Describe the job in full — Rex will draft the report from this.'}
          </Text>

          <TextInput
            value={summary}
            onChangeText={setSummary}
            multiline
            placeholder="Type or use the mic below…"
            className="border border-gray-300 rounded-lg px-3 py-3 text-base min-h-[120px] mb-3"
          />

          <View className="flex-row items-center mb-4">
            <VoiceRecordButton
              isRecording={voice.isRecording}
              onPressIn={voice.startRecording}
              onPressOut={onVoiceStop}
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
                Hourly rate not set — payment calculation will be skipped. Set it
                in Settings → Trade.
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={onGenerate}
            disabled={!summary.trim() || confirming}
            className={`py-4 rounded-xl ${
              !summary.trim() || confirming ? 'bg-gray-300' : 'bg-brand'
            }`}
          >
            <Text className="text-center text-white font-semibold text-base">
              {confirming ? 'Working…' : 'Generate report'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <ReportPreview
            sections={draft.sections}
            confirmedAmount={draft.confirmedAmount}
            includesVat={draft.includesVat}
            includesLicense={draft.includesLicense}
            suggestedRange={
              // Skip the hint once the worker has set a confirmed amount.
              draft.confirmedAmount != null && draft.confirmedAmount > 0
                ? null
                : rawSuggestedRange()
            }
            onSectionContentChange={onSectionContentChange}
            onAddCustomSection={onAddCustomSection}
            onRemoveSection={onRemoveSection}
            onMoveSection={onMoveSection}
            onConfirmedAmountChange={(n) => {
              const next = { ...draft, confirmedAmount: n };
              setDraft(next);
              saveReportDraft(next);
            }}
            onIncludesVatChange={(v) => {
              const next = { ...draft, includesVat: v };
              setDraft(next);
              saveReportDraft(next);
            }}
            onIncludesLicenseChange={(v) => {
              const next = { ...draft, includesLicense: v };
              setDraft(next);
              saveReportDraft(next);
            }}
          />

          {pdfUri ? (
            <View className="mt-2 gap-2">
              <View className="bg-green-50 border border-green-200 rounded-lg p-3">
                <Text className="text-green-800 font-semibold">Report locked ✓</Text>
                <Text className="text-green-700 text-xs">
                  Saved to Job History. Cannot be edited.
                </Text>
              </View>
              <Pressable
                onPress={() => sharePdf(pdfUri, 'Job Report')}
                className="bg-brand py-4 rounded-xl"
              >
                <Text className="text-center text-white font-semibold">Share PDF</Text>
              </Pressable>
              {sessionId && (
                <Pressable
                  onPress={() =>
                    nav.replace('QuoteBuilder', { sessionId })
                  }
                  className="py-4 rounded-xl border border-brand"
                >
                  <Text className="text-center text-brand font-semibold">
                    Generate quote from this job
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              onPress={doConfirm}
              disabled={confirming}
              className={`mt-2 py-4 rounded-xl ${confirming ? 'bg-gray-300' : 'bg-brand'}`}
            >
              <Text className="text-center text-white font-semibold text-base">
                {confirming ? 'Locking…' : 'Confirm & generate PDF'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* CC-5 Fix A — in-app confirm-and-lock prompt (D6 Flow05) */}
      {/* ISS-26: summaryLines provides a brief document summary before locking */}
      <ConfirmDialog
        visible={confirmVisible}
        title="This action permanently locks all sections."
        message="The report cannot be edited after confirming."
        summaryLines={buildConfirmSummary()}
        primaryLabel="Yes — confirm and generate PDF"
        secondaryLabel="Go back and edit"
        onPrimary={runConfirm}
        onSecondary={() => setConfirmVisible(false)}
        busy={confirming}
      />

      {/* CC-5 Fix A — in-app discard prompt (D6 Flow05) */}
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
