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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Image,
  Linking,
  FlatList,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  updateJobName,
  type DocVersion,
  type HistoryJob,
  type MessageRow,
} from '../../../services/history';
import { sharePdf, sharePhoto } from '../../../services/share';
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

// Mirrors STAGE_NAMES in app/job/[sessionId].tsx so stage groupings on the
// Photos tab stay in sync with the live session header.
const STAGE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Problem ID',
  2: 'Diagnosis',
  3: 'Steps',
  4: 'Final check',
  5: 'Close',
};

export default function JobDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const insets = useSafeAreaInsets();
  const jobId = route.params.jobId;
  const { hasAccess: hasFeatureAccess } = useSubscriptionContext();

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

  // D6 Flow08 NEW SCREEN A — inline-edit the job name in the header. This is
  // the only field editable on an archived job (M5 LOCKED RULE).
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');

  // D6 Flow08 NEW SCREEN D — fullscreen photo viewer with swipe pagination.
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoListRef = useRef<FlatList<any>>(null);
  const screenWidth = Dimensions.get('window').width;

  // D6 Flow08 Screen 5 — long threads collapse to first + last few messages
  // with a "N more — tap to expand" affordance.
  const [rexExpanded, setRexExpanded] = useState(false);
  const REX_COLLAPSE_THRESHOLD = 12;
  const REX_HEAD_TAIL = 4;

  // M5 RULE 6 — read-write access is gated by subscription (hasAccess, the
  // single source of truth in SubscriptionContext). PDF view/share is always
  // allowed; feature buttons (reopen, generate new version) route to the
  // paywall when subscription is expired/cancelled.

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

  function beginEditName() {
    if (!job) return;
    setDraftName(job.jobName ?? '');
    setEditing(true);
  }

  async function saveEditName() {
    const name = draftName.trim();
    if (!name || !job) {
      setEditing(false);
      return;
    }
    await updateJobName(jobId, name);
    setJob({ ...job, jobName: name });
    setEditing(false);
  }

  function onDeleteTap() {
    // M5 LOCKED RULE — Delete is locked when subscription is expired so the
    // worker can't permanently destroy records they can no longer regenerate.
    if (!hasFeatureAccess) {
      nav.navigate('Paywall');
      return;
    }
    setDeleteVisible(true);
  }

  // Track the active photo in the fullscreen pager for the "2 of 8" indicator.
  function onPhotoScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (i !== photoIndex) setPhotoIndex(i);
  }

  function openPhotoAt(uri: string) {
    const idx = photos.findIndex((p) => p.uri === uri);
    setPhotoIndex(idx < 0 ? 0 : idx);
    setPhotoModal(uri);
  }

  // D6 Flow08 Screen 8 — "Download all photos" loops through every photo in
  // the session and offers the system share sheet for each. The worker can
  // cancel mid-loop; iOS / Android both surface "Save Image" in the sheet.
  const [downloading, setDownloading] = useState(false);
  async function downloadAllPhotos() {
    if (downloading || photos.length === 0) return;
    setDownloading(true);
    try {
      for (let i = 0; i < photos.length; i++) {
        await sharePhoto(photos[i].uri, `Photo ${i + 1} of ${photos.length}`);
      }
    } catch (e) {
      setPdfError('One or more photos could not be downloaded.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading || !job) {
    // D6 Flow12 S21 — skeleton during Supabase fetch (no blank screen).
    return (
      <View className="flex-1 bg-white px-4" style={{ paddingTop: insets.top + 8 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
    >
      {/* Header — D6 Flow08 NEW SCREEN A */}
      <View className="px-4 pb-2 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={() => nav.goBack()} hitSlop={8}>
            <Text className="text-brand text-base">← Back</Text>
          </Pressable>
          {editing ? (
            <View className="flex-1 mx-2 flex-row items-center">
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                autoFocus
                placeholder="Job name"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={saveEditName}
                className="flex-1 border border-brand rounded-lg px-2 py-1 text-base text-gray-900"
              />
              <Pressable onPress={saveEditName} className="px-2">
                <Text className="text-brand text-sm font-semibold">Save</Text>
              </Pressable>
              <Pressable onPress={() => setEditing(false)} className="px-1">
                <Text className="text-gray-500 text-sm">Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={beginEditName}
              className="flex-1 flex-row items-center justify-center"
            >
              <Text className="text-base font-semibold text-center">
                {job.jobName || 'Untitled job'}
              </Text>
              <Text className="text-gray-400 text-xs ml-1">  ✎</Text>
            </Pressable>
          )}
          <Pressable onPress={onDeleteTap} disabled={!hasFeatureAccess}>
            <Text
              className={`text-base ${
                hasFeatureAccess ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              {hasFeatureAccess ? 'Delete' : '🔒 Delete'}
            </Text>
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
              ↩ Reopen Job
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
          ) : messages.length > REX_COLLAPSE_THRESHOLD && !rexExpanded ? (
            <>
              {messages.slice(0, REX_HEAD_TAIL).map((m) => (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  content={m.contentText ?? ''}
                  photoUrl={m.photoUrl}
                  transcript={m.transcriptEdited ?? m.transcriptOriginal}
                />
              ))}
              <Pressable
                onPress={() => setRexExpanded(true)}
                className="mx-4 my-3 py-3 rounded-lg border border-dashed border-gray-300 bg-gray-50"
              >
                <Text className="text-center text-sm text-gray-600 font-medium">
                  {messages.length - REX_HEAD_TAIL * 2} more messages — tap to expand
                </Text>
              </Pressable>
              {messages.slice(-REX_HEAD_TAIL).map((m) => (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  content={m.contentText ?? ''}
                  photoUrl={m.photoUrl}
                  transcript={m.transcriptEdited ?? m.transcriptOriginal}
                />
              ))}
            </>
          ) : (
            <>
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  content={m.contentText ?? ''}
                  photoUrl={m.photoUrl}
                  transcript={m.transcriptEdited ?? m.transcriptOriginal}
                />
              ))}
              {messages.length > REX_COLLAPSE_THRESHOLD && rexExpanded && (
                <Pressable
                  onPress={() => setRexExpanded(false)}
                  className="mx-4 my-2 py-2"
                >
                  <Text className="text-center text-xs text-gray-500">Collapse thread</Text>
                </Pressable>
              )}
            </>
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
            <>
              <Pressable
                onPress={downloadAllPhotos}
                disabled={downloading}
                className={`py-3 rounded-xl mb-3 border border-brand ${
                  downloading ? 'opacity-50' : ''
                }`}
              >
                <Text className="text-center text-brand font-semibold">
                  {downloading ? 'Preparing…' : `+ Download all ${photos.length} photos`}
                </Text>
              </Pressable>
              {/* D6 Flow08 Screen 8 — stage-grouped photo grid. */}
              {[1, 2, 3, 4, 5].map((stage) => {
                const inStage = photos.filter((p) => (p.stage ?? 0) === stage);
                if (inStage.length === 0) return null;
                const stageLabel = STAGE_LABELS[stage as 1 | 2 | 3 | 4 | 5];
                return (
                  <View key={stage} className="mb-5">
                    <Text className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                      Stage {stage} — {stageLabel}
                    </Text>
                    <View className="flex-row flex-wrap -mx-1">
                      {inStage.map((p) => (
                        <Pressable
                          key={p.id}
                          onPress={() => openPhotoAt(p.uri)}
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
                  </View>
                );
              })}
            </>
          )}
          {/* Photos not tagged to a stage (legacy or non-Rex sources). */}
          {photos.some((p) => !p.stage) && (
            <View className="mb-5">
              <Text className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                Other
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {photos
                  .filter((p) => !p.stage)
                  .map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => openPhotoAt(p.uri)}
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
            </View>
          )}
        </ScrollView>
      )}

      {/* Full-screen photo viewer — D6 Flow08 NEW SCREEN D.
          Horizontal pager + "N of M" indicator + stage label overlay. */}
      <Modal
        visible={!!photoModal}
        animationType="fade"
        onRequestClose={() => setPhotoModal(null)}
        transparent
      >
        <View className="flex-1 bg-black">
          {/* Top bar: close + counter */}
          <View
            className="flex-row items-center justify-between px-4 pb-2"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Pressable onPress={() => setPhotoModal(null)}>
              <Text className="text-white text-base">Close</Text>
            </Pressable>
            <Text className="text-white text-sm font-semibold">
              {photos.length > 0 ? `${photoIndex + 1} of ${photos.length}` : ''}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <FlatList
            ref={photoListRef}
            data={photos}
            horizontal
            pagingEnabled
            initialScrollIndex={photoIndex}
            getItemLayout={(_, i) => ({
              length: screenWidth,
              offset: screenWidth * i,
              index: i,
            })}
            onScroll={onPhotoScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{ width: screenWidth }}
                className="items-center justify-center"
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: screenWidth, height: '80%' }}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Stage label overlay for the current photo. */}
          {photos[photoIndex]?.stage ? (
            <View className="absolute bottom-12 left-0 right-0 items-center">
              <View className="bg-white/15 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-semibold tracking-wider">
                  STAGE {photos[photoIndex].stage} —{' '}
                  {STAGE_LABELS[photos[photoIndex].stage as 1 | 2 | 3 | 4 | 5]}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Pagination dots. */}
          {photos.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
              {photos.map((_, i) => (
                <View
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === photoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </View>
          )}
        </View>
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
