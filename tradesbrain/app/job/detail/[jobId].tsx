// D3 F5 / D6 Flow08 — Job Detail screen.
// Four tabs: Rex Conversation (read-only) · Reports · Quotes · Photos.
// Header actions: Reopen Job · Delete Job · Generate new version (per tab).
// Reopen: status → reopened, navigate to active Rex with recap=true so
// useRexSession dispatches a recap-trigger message (RULE 3).
//
// M5 RULE 6 — History stays browseable when the subscription is expired.
// View / Download / Share of confirmed PDFs always works; the feature
// buttons (Reopen job, Generate report N+1, Generate quote N+1) are
// disabled and tap-routed to the paywall instead.

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../_layout';

import MessageBubble from '../../../components/rex/MessageBubble';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import {
  deleteSessionCascade,
  fetchMessages,
  fetchQuoteVersions,
  fetchReportVersions,
  fetchSessionDetail,
  getSignedPdfUrl,
  reopenSession,
  type DocVersion,
  type HistoryJob,
  type MessageRow,
} from '../../../services/history';
import { sharePdf } from '../../../services/share';
import SkeletonCard from '../../../components/history/SkeletonCard';
import { useSubscriptionContext } from '../../../context/SubscriptionContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteT = RouteProp<RootStackParamList, 'JobDetail'>;

type Tab = 'rex' | 'reports' | 'quotes' | 'photos';
const TABS: { value: Tab; label: string }[] = [
  { value: 'rex', label: 'Rex' },
  { value: 'reports', label: 'Reports' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'photos', label: 'Photos' },
];

export default function JobDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const jobId = route.params.jobId;
  const { subscriptionStatus, trialQueriesRemaining } = useSubscriptionContext();

  const [job, setJob] = useState<HistoryJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Tab>('rex');

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [reports, setReports] = useState<DocVersion[]>([]);
  const [quotes, setQuotes] = useState<DocVersion[]>([]);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  // M5 polish — in-app confirms (replaces Alert.alert for reopen + delete).
  const [reopenVisible, setReopenVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  // PDF-load failure surface (no Alert.alert anywhere).
  const [pdfError, setPdfError] = useState<string | null>(null);

  // M5 RULE 6 — read-write access is gated by subscription. PDF view/share is
  // always allowed; feature buttons (reopen, generate new version) route to
  // the paywall when subscription is expired/cancelled.
  const hasFeatureAccess =
    subscriptionStatus === 'active' ||
    (subscriptionStatus === 'trial' && trialQueriesRemaining > 0);

  const load = useCallback(async () => {
    setLoading(true);
    const [j, m, r, q] = await Promise.all([
      fetchSessionDetail(jobId),
      fetchMessages(jobId),
      fetchReportVersions(jobId),
      fetchQuoteVersions(jobId),
    ]);
    setJob(j);
    setMessages(m);
    setReports(r);
    setQuotes(q);
    setLoading(false);
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const photos = messages
    .filter((m) => !!m.photoUrl)
    .map((m) => ({ id: m.id, uri: m.photoUrl as string, stage: m.sessionStage }));

  async function onOpenPdf(path: string | null) {
    setPdfError(null);
    if (!path) return;
    const url = await getSignedPdfUrl(path);
    if (!url) {
      setPdfError('Could not load PDF — the file may have been removed.');
      return;
    }
    Linking.openURL(url);
  }

  async function onSharePdf(path: string | null) {
    if (!path) return;
    const url = await getSignedPdfUrl(path);
    if (!url) {
      setPdfError('Could not load PDF — the file may have been removed.');
      return;
    }
    sharePdf(url, 'TradesBrain Document');
  }

  function onReopenTap() {
    if (!hasFeatureAccess) {
      nav.navigate('Paywall');
      return;
    }
    setReopenVisible(true);
  }

  async function confirmReopen() {
    setBusy(true);
    try {
      await reopenSession(jobId);
      setReopenVisible(false);
      nav.replace('Job', { sessionId: jobId, recap: true } as any);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await deleteSessionCascade(jobId);
      setDeleteVisible(false);
      nav.goBack();
    } finally {
      setBusy(false);
    }
  }

  function onGenerate(kind: 'report' | 'quote') {
    if (!hasFeatureAccess) {
      nav.navigate('Paywall');
      return;
    }
    nav.navigate(kind === 'report' ? 'ReportBuilder' : 'QuoteBuilder', {
      sessionId: jobId,
    });
  }

  if (loading || !job) {
    // D6 Flow12 S21 — skeleton during Supabase fetch (no blank screen).
    return (
      <View className="flex-1 bg-white pt-12 px-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="px-4 pb-2 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={() => nav.goBack()}>
            <Text className="text-brand text-base">← Back</Text>
          </Pressable>
          <Text className="text-base font-semibold flex-1 text-center">
            {job.jobName || 'Untitled job'}
          </Text>
          <Pressable onPress={() => setDeleteVisible(true)}>
            <Text className="text-red-600 text-base">Delete</Text>
          </Pressable>
        </View>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs uppercase text-brand font-medium">
              {job.tradeType}
            </Text>
            <Text className="text-xs text-gray-500">
              · {new Date(job.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          <Pressable onPress={onReopenTap} disabled={!hasFeatureAccess}>
            <Text
              className={`font-semibold ${
                hasFeatureAccess ? 'text-brand' : 'text-gray-400'
              }`}
            >
              ↩ Reopen Rex
            </Text>
          </Pressable>
        </View>
        {!hasFeatureAccess && (
          <Text className="text-[11px] text-gray-500 mb-1">
            Subscription expired — viewing and PDF download still work. Reopen
            and generating new versions require an active plan.
          </Text>
        )}

        {/* Tab control */}
        <View className="flex-row border-b border-gray-100 -mx-4 px-4">
          {TABS.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => setActive(t.value)}
              className={`flex-1 py-2 ${
                active === t.value ? 'border-b-2 border-brand' : ''
              }`}
            >
              <Text
                className={`text-center text-sm ${
                  active === t.value ? 'text-brand font-semibold' : 'text-gray-500'
                }`}
              >
                {t.label}
                {t.value === 'reports' && reports.length > 0
                  ? ` (${reports.length})`
                  : ''}
                {t.value === 'quotes' && quotes.length > 0
                  ? ` (${quotes.length})`
                  : ''}
                {t.value === 'photos' && photos.length > 0
                  ? ` (${photos.length})`
                  : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* PDF error surface (replaces Alert.alert) */}
      {pdfError && (
        <View className="bg-red-50 border-b border-red-200 px-4 py-2 flex-row items-center justify-between">
          <Text className="text-red-700 text-xs flex-1 pr-2">{pdfError}</Text>
          <Pressable onPress={() => setPdfError(null)}>
            <Text className="text-red-600 text-xs font-semibold">Dismiss</Text>
          </Pressable>
        </View>
      )}

      {/* Tab content */}
      {active === 'rex' && (
        <ScrollView className="flex-1" contentContainerClassName="py-2">
          {messages.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10">
              No messages in this session.
            </Text>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.contentText ?? ''}
                photoUrl={m.photoUrl}
                transcript={m.transcriptEdited ?? m.transcriptOriginal}
              />
            ))
          )}
        </ScrollView>
      )}

      {active === 'reports' && (
        <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
          {/* M5 RULE 6 — disabled when subscription expired; PDFs below still
              open. D6 note: 'requires reopening the session first'. */}
          <Pressable
            onPress={() => onGenerate('report')}
            disabled={!hasFeatureAccess}
            className={`py-3 rounded-xl mb-1 ${
              hasFeatureAccess ? 'bg-brand' : 'bg-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                hasFeatureAccess ? 'text-white' : 'text-gray-500'
              }`}
            >
              + Generate Report {reports.length + 1} from this session
            </Text>
          </Pressable>
          <Text className="text-[11px] text-gray-500 text-center mb-4">
            Requires reopening the session first
          </Text>
          {reports.length === 0 ? (
            <Text className="text-center text-gray-400">
              No confirmed reports yet.
            </Text>
          ) : (
            reports.map((r) => (
              <DocVersionRow
                key={r.id}
                version={r}
                kind="report"
                onOpen={() => onOpenPdf(r.pdfUrl)}
                onShare={() => onSharePdf(r.pdfUrl)}
              />
            ))
          )}
        </ScrollView>
      )}

      {active === 'quotes' && (
        <ScrollView className="flex-1" contentContainerClassName="px-4 py-4">
          <Pressable
            onPress={() => onGenerate('quote')}
            disabled={!hasFeatureAccess}
            className={`py-3 rounded-xl mb-1 ${
              hasFeatureAccess ? 'bg-brand' : 'bg-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                hasFeatureAccess ? 'text-white' : 'text-gray-500'
              }`}
            >
              + Generate Quote {quotes.length + 1} from this session
            </Text>
          </Pressable>
          <Text className="text-[11px] text-gray-500 text-center mb-4">
            Requires reopening the session first
          </Text>
          {quotes.length === 0 ? (
            <Text className="text-center text-gray-400">
              No confirmed quotes yet.
            </Text>
          ) : (
            quotes.map((q) => (
              <DocVersionRow
                key={q.id}
                version={q}
                kind="quote"
                onOpen={() => onOpenPdf(q.pdfUrl)}
                onShare={() => onSharePdf(q.pdfUrl)}
              />
            ))
          )}
        </ScrollView>
      )}

      {active === 'photos' && (
        <ScrollView className="flex-1" contentContainerClassName="p-4">
          {photos.length === 0 ? (
            <Text className="text-center text-gray-400 mt-6">
              No photos in this session.
            </Text>
          ) : (
            <View className="flex-row flex-wrap -mx-1">
              {photos.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setPhotoModal(p.uri)}
                  className="w-1/3 aspect-square p-1"
                >
                  <Image
                    source={{ uri: p.uri }}
                    className="w-full h-full rounded-md"
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Full-screen photo modal */}
      <Modal
        visible={!!photoModal}
        animationType="fade"
        onRequestClose={() => setPhotoModal(null)}
        transparent
      >
        <Pressable
          onPress={() => setPhotoModal(null)}
          className="flex-1 bg-black items-center justify-center"
        >
          {photoModal && (
            <Image
              source={{ uri: photoModal }}
              style={{ width: '100%', height: '85%' }}
              resizeMode="contain"
            />
          )}
          <Text className="text-white mt-4">Tap to close</Text>
        </Pressable>
      </Modal>

      {/* Reopen confirm — in-app, no Alert.alert. */}
      <ConfirmDialog
        visible={reopenVisible}
        title="Reopen this job?"
        message="Rex will load the full prior conversation and give a recap of what you worked on last time."
        primaryLabel="Reopen Rex session"
        secondaryLabel="Cancel"
        onPrimary={confirmReopen}
        onSecondary={() => setReopenVisible(false)}
        busy={busy}
      />

      {/* Delete confirm — destructive secondary. */}
      <ConfirmDialog
        visible={deleteVisible}
        title="Delete this job?"
        message="All messages, reports, quotes, and PDFs are permanently removed. This cannot be undone."
        primaryLabel="Cancel"
        secondaryLabel="Delete — I am sure"
        onPrimary={() => setDeleteVisible(false)}
        onSecondary={confirmDelete}
        destructiveSecondary
        busy={busy}
      />
    </View>
  );
}

function DocVersionRow({
  version,
  kind,
  onOpen,
  onShare,
}: {
  version: DocVersion;
  kind: 'report' | 'quote';
  onOpen: () => void;
  onShare: () => void;
}) {
  return (
    <View className="bg-white border border-gray-200 rounded-xl p-3 mb-3">
      <Text className="text-base font-semibold text-gray-900">
        {kind === 'report' ? 'Report' : 'Quote'} {version.versionNumber}{' '}
        <Text className="text-xs text-green-700">🔒 Locked</Text>
      </Text>
      <Text className="text-xs text-gray-500 mb-3">
        Confirmed {new Date(version.createdAt).toLocaleString()}
      </Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={onOpen}
          disabled={!version.pdfUrl}
          className={`flex-1 py-2 rounded-lg ${
            version.pdfUrl ? 'bg-brand' : 'bg-gray-300'
          }`}
        >
          <Text className="text-center text-white font-semibold">View / Download</Text>
        </Pressable>
        <Pressable
          onPress={onShare}
          disabled={!version.pdfUrl}
          className={`flex-1 py-2 rounded-lg border ${
            version.pdfUrl ? 'border-brand' : 'border-gray-300'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              version.pdfUrl ? 'text-brand' : 'text-gray-400'
            }`}
          >
            Share
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
