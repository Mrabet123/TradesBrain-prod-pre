// D6 Flow04 + Flow12 — Active Rex session screen.
// Owns: messages list, streaming bubble, contextual buttons (stage-aware),
// apprentice Yes/No prompt, input row (text + voice + photo), Close Job (with
// job-naming modal), Report/Quote buttons (post-close), soft-cap banner with
// linked-session action, offline send queue, and the trial-exhaustion notice.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../_layout';

import MessageBubble from '../../components/rex/MessageBubble';
import StreamingText from '../../components/rex/StreamingText';
import VoiceRecordButton from '../../components/rex/VoiceRecordButton';
import PhotoCapture from '../../components/rex/PhotoCapture';
import ContextualButtons from '../../components/rex/ContextualButtons';
import ToastNotification from '../../components/shared/ToastNotification';

import { useAuthContext } from '../../context/AuthContext';
import { useTradeProfileContext } from '../../context/TradeProfileContext';
import { useSubscriptionContext } from '../../context/SubscriptionContext';
import { useRexSession } from '../../hooks/useRexSession';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { usePhotoCapture, type CapturedPhoto } from '../../hooks/usePhotoCapture';
import { useOfflineQueue, type QueuedMessage } from '../../hooks/useOfflineQueue';
import { transcribeAudio } from '../../services/openai';
import { useNetworkContext } from '../../context/NetworkContext';
import { SESSION_SOFT_CAP } from '../../constants/limits';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteT = RouteProp<RootStackParamList, 'Job'>;

// CC-5 Fix C — human-readable date for the Close Job auto-name fallback
// (e.g. "20 May 2026"). Built manually so it does not depend on Intl, which
// is not reliably bundled with Hermes on Android.
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
function formatJobDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// D7 §6.1 — when a worker is registered as 'other' / General Contractor (which
// has no inherent code/safety ruleset), a new Rex session must first ask which
// concrete trade this job is, then route to that profile. These are the four
// shipped profiles offered in that picker — 'other' is deliberately excluded so
// the session can never silently fall back to Plumber.
const PICK_TRADES: { value: string; label: string }[] = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'hvac', label: 'HVAC Technician' },
  { value: 'roofer', label: 'Roofer' },
];

// ISS-M10 (RX-4): D6 Flow04 locks a visible stage indicator. The five Rex
// stages, used by the header pill and the ①→⑤ progress strip.
const STAGE_NAMES: Record<number, string> = {
  1: 'Problem ID',
  2: 'Diagnosis',
  3: 'Steps',
  4: 'Final check',
  5: 'Close',
};

export default function ActiveSessionScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { tradeType } = useTradeProfileContext();
  const { subscriptionStatus, trialQueriesRemaining, syncTrialQueries } =
    useSubscriptionContext();

  const sessionId = route.params.sessionId === 'new' ? null : route.params.sessionId;
  const recapOnLoad = route.params.recap === true;

  // D7 §6.1 — an 'other' / General Contractor worker has no inherent trade
  // ruleset, so a NEW session asks which concrete trade this job is before it
  // starts and routes Rex to that profile (never silently Plumber). The chosen
  // trade is what the session is created with and what the proxy loads.
  const [chosenTrade, setChosenTrade] = useState<string | null>(null);
  const isNewSession = sessionId === null;
  const profileTradeLoaded = tradeType !== ''; // '' until TradeProfileContext resolves
  const needsTradePick = isNewSession && tradeType === 'other';
  // The trade the session is created with. For an existing session this value is
  // ignored (the hook uses the stored row trade); for a new non-'other' session
  // it is the worker's registered trade.
  const sessionTrade = needsTradePick ? chosenTrade ?? 'plumber' : tradeType || 'plumber';
  // Hold off creating a NEW session until: the profile trade has loaded, and (if
  // 'other') the worker has confirmed a concrete trade. Existing sessions load
  // immediately — they carry their own stored trade.
  const sessionEnabled = isNewSession
    ? profileTradeLoaded && (!needsTradePick || chosenTrade !== null)
    : true;

  const rex = useRexSession({
    sessionId,
    tradeType: sessionTrade,
    userId: user?.id ?? '',
    recapOnLoad,
    enabled: sessionEnabled,
    onTrialDecrementFailed: () => {
      setToast({
        msg: 'Trial count may be out of sync — server unreachable. We will retry on next message.',
        type: 'error',
      });
    },
    // Keep the local trial counter in lock-step with the server so the trial
    // banner and the in-session exhaustion notice update mid-session.
    onTrialQueriesUpdated: (remaining) => syncTrialQueries(remaining),
  });

  const voice = useVoiceRecording();
  const photo = usePhotoCapture();
  const { isConnected } = useNetworkContext();

  const [text, setText] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState<CapturedPhoto | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  // Transient toast used by the photo-recompression and trial-decrement
  // failure surfaces (both are silent failures the worker should be aware of).
  const [toast, setToast] = useState<{ msg: string; type: 'info' | 'warning' | 'error' } | null>(
    null,
  );
  const [transcribing, setTranscribing] = useState(false);
  const [voiceDenied, setVoiceDenied] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [closeName, setCloseName] = useState('');
  const [linking, setLinking] = useState(false);
  // CC-2 — voice contextual buttons (🎙 Describe problem, 🎙 Voice confirmation)
  // are hints, not press-and-hold triggers. Tapping them shows a transient
  // banner that points to the real mic button below the input.
  const [voiceHint, setVoiceHint] = useState(false);
  // CC-2 — soft-cap "Continue here" is sticky-dismissable per session.
  const [softCapDismissed, setSoftCapDismissed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Keyboard handling. This app runs edge-to-edge (gradle edgeToEdgeEnabled=true),
  // under which Android's adjustResize NO LONGER shrinks the React root view —
  // the IME simply floats over the content, hiding the input row behind it (the
  // reported bug). So instead of relying on the OS to lift the row, we measure
  // the keyboard height from the event and lift the content by exactly that
  // amount on Android. iOS keeps using KeyboardAvoidingView's 'padding' behavior.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => {
      setKeyboardOpen(true);
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hide = Keyboard.addListener(hideEvt, () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Trial gate. A trial user who has run out gets an in-thread notice (D6 S8) —
  // the session is preserved. expired/cancelled users go straight to Paywall.
  const trialExhausted = subscriptionStatus === 'trial' && trialQueriesRemaining <= 0;
  const subscriptionLapsed =
    subscriptionStatus !== 'active' && subscriptionStatus !== 'trial';

  useEffect(() => {
    if (subscriptionLapsed && !rex.closed) {
      nav.navigate('Paywall');
    }
  }, [subscriptionLapsed, rex.closed, nav]);

  // ── Offline send queue (D6 Flow12 S4-S7) ──────────────────────────────────
  const flushQueued = useCallback(
    (msg: QueuedMessage) =>
      rex.sendMessage({
        text: msg.text,
        photoUri: msg.photoUri,
        photoBase64: msg.photoBase64,
        photoMime: msg.photoMime,
        transcriptOriginal: msg.transcriptOriginal,
        transcriptEdited: msg.transcriptEdited,
      }),
    [rex.sendMessage],
  );
  const offlineQueue = useOfflineQueue(rex.session?.id ?? null, flushQueued);

  // Auto-scroll on new message / chunk
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [rex.messages.length, rex.streamingText, offlineQueue.queued]);

  async function handleVoiceStart() {
    try {
      // startRecording distinguishes a denied mic permission ('denied') from a
      // recording failure ('error') so we show the RIGHT surface — the old code
      // labelled every failure as "denied" even when the mic was granted
      // (TC-031). 'denied' → amber banner + Open Settings (TC-069); 'error' →
      // transient toast (mic busy / hardware fault).
      const result = await voice.startRecording();
      setVoiceDenied(result === 'denied');
      if (result === 'error') {
        setToast({
          msg: "Couldn't start recording — make sure no other app is using the mic, then try again.",
          type: 'error',
        });
      }
    } catch {
      setToast({
        msg: "Couldn't start recording — please try again.",
        type: 'error',
      });
    }
  }

  async function handleVoiceStop() {
    const uri = await voice.stopRecording();
    if (!uri) return;
    setTranscribing(true);
    try {
      const result = await transcribeAudio(uri);
      if (!result.ok || !result.text) {
        // CC-4 (D6 Flow12 S17) — exact Whisper-failure copy. The text input below
        // stays editable, so the worker can type their description instead.
        Alert.alert(
          'Voice transcription failed',
          'Could not transcribe — type your description instead.',
        );
        return;
      }
      setTranscript(result.text);
      setText(result.text);
    } finally {
      // Always clear the spinner — even if transcribeAudio throws unexpectedly —
      // so the input row can never get stuck showing "Transcribing…".
      setTranscribing(false);
    }
  }

  async function handlePhoto() {
    const result = await photo.capture(rex.stage);
    if (result.photo) {
      setPendingPhoto(result.photo);
      // D6 Flow12 RULE 5 — a photo over the 8 MB cap is downscaled SILENTLY in
      // usePhotoCapture. No toast, no "file too large" notice: the worker never
      // knows it happened. (result.recompressed is intentionally not surfaced.)
    }
  }

  async function handleSend() {
    if ((!text.trim() && !pendingPhoto) || rex.streaming || trialExhausted) return;
    const payload = {
      text: text.trim() || (pendingPhoto ? '[Photo attached]' : ''),
      photoUri: pendingPhoto?.uri ?? null,
      photoBase64: pendingPhoto?.base64 ?? null,
      photoMime: pendingPhoto?.mime ?? null,
      transcriptOriginal: transcript,
      transcriptEdited: transcript && transcript !== text ? text : null,
    };
    setText('');
    setPendingPhoto(null);
    setTranscript(null);

    // Offline → queue locally; useOfflineQueue auto-flushes on reconnect.
    if (!isConnected) {
      try {
        await offlineQueue.enqueue(payload);
      } catch {
        Alert.alert('Offline', 'Could not queue the message — try again when back online.');
      }
      return;
    }
    await rex.sendMessage(payload);
  }

  function openCloseModal() {
    setCloseName(rex.session?.jobName ?? '');
    setCloseModalVisible(true);
  }

  // CC-5 Fix C (D2 §F2 Stage 5) — when the worker skips the name, auto-name the
  // job as "Job — [date] — [jobsite]" (or just "Job — [date]" when there is no
  // jobsite). Close Job is never blocked by an empty name.
  function autoJobName(): string {
    const date = formatJobDate(new Date());
    const jobsite = rex.session?.jobsite?.trim();
    return jobsite ? `Job — ${date} — ${jobsite}` : `Job — ${date}`;
  }

  async function confirmClose() {
    setCloseModalVisible(false);
    await rex.closeJob(closeName.trim() || autoJobName());
  }

  // CC-2 — route the D6-verbatim action keys. Input-gathering buttons (photo /
  // voice) are owned by the screen because they touch device APIs; reaction
  // buttons go to the hook.
  function handleContextual(action: string) {
    if (action === 'close_job') {
      openCloseModal();
      return;
    }
    if (action === 'take_photo' || action === 'photo_step' || action === 'send_final_photo') {
      handlePhoto();
      return;
    }
    if (action === 'describe_problem' || action === 'voice_confirmation') {
      // Voice is press-and-hold — surface a short banner that points the worker
      // at the mic button below the input.
      setVoiceHint(true);
      setTimeout(() => setVoiceHint(false), 3000);
      return;
    }
    rex.onContextualAction(action);
  }

  async function onStartLinkedSession() {
    setLinking(true);
    const newId = await rex.startLinkedSession();
    setLinking(false);
    if (newId) nav.replace('Job', { sessionId: newId });
  }

  // D7 §6.1 — the trade picker is the universal resolver for 'other', for both
  // new and legacy sessions. A NEW 'other' session is created on the chosen
  // concrete trade (setChosenTrade un-gates session creation). A LEGACY 'other'
  // session row (loaded with an unresolved 'other' trade) is resolved in place:
  // the concrete trade is persisted onto the row so the session is permanently
  // resolved and Rex loads the correct profile — never a silent Plumber default.
  function handlePickTrade(value: string) {
    if (rex.needsTradeResolution) {
      rex.resolveSessionTrade(value);
    } else {
      setChosenTrade(value);
    }
  }

  // D7 §6.1 — trade confirmation gate. The picker is the universal resolver for
  // 'other': shown before a NEW 'other' session starts (creates it on the chosen
  // profile) AND when a LEGACY 'other' session row is reopened with no resolved
  // trade (resolves the row in place). Either way an 'other' session never runs
  // on an assumed trade. Placed after all hooks so hook order stays stable.
  const showTradePicker = (needsTradePick && chosenTrade === null) || rex.needsTradeResolution;
  if (showTradePicker) {
    return (
      <View
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}
      >
        <View className="px-4 pb-2 flex-row items-center border-b border-gray-200">
          <Pressable onPress={() => nav.goBack()} hitSlop={8}>
            <Text className="text-brand text-base">← Back</Text>
          </Pressable>
        </View>
        <ScrollView className="flex-1" contentContainerClassName="px-5 pt-8 pb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            What's your trade for this job?
          </Text>
          <Text className="text-sm text-gray-600 mb-6">
            You're set up as Other / General Contractor. Pick the trade that
            matches this job so Rex loads the right codes and safety rules. You
            can choose a different one next time.
          </Text>
          {PICK_TRADES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => handlePickTrade(t.value)}
              className="flex-row items-center py-4 px-4 rounded-xl mb-3 border border-gray-200 active:bg-gray-50"
            >
              <Text className="text-base font-medium text-gray-800">{t.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  const apprenticePending =
    rex.apprenticeAsked && !rex.apprenticeAnswered && !rex.streaming && !rex.closed;
  const inputDisabled = rex.streaming || trialExhausted;
  // ISS-L11 (RX-8): user-message count drives the "message N of 30" soft-cap copy.
  const userMsgCount = rex.messages.filter((m) => m.role === 'user').length;

  return (
    <KeyboardAvoidingView
      // Android already resizes the window for the keyboard (adjustResize in
      // AndroidManifest), so a 'height'/'padding' behavior here would
      // DOUBLE-compensate — that was the cause of the large gap and the input
      // row not returning to its original position. On Android we let the OS
      // handle it (behavior undefined); only iOS (no adjustResize) needs
      // 'padding'. Offset is 0 — the header is inside this view, not above it.
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={{ flex: 1 }}
    >
      {toast && (
        <ToastNotification
          message={toast.msg}
          visible={!!toast}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      {/* Real device insets: top clears the status bar / notch. Bottom clears
          the Android 3-button nav bar so the input row + hold-to-record button
          are never hidden behind it while the keyboard is CLOSED. While it is
          OPEN: on Android (edge-to-edge — adjustResize does not resize the root
          view) we lift the whole column by the measured keyboard height so the
          input row sits flush above the keyboard; on iOS the surrounding
          KeyboardAvoidingView 'padding' already does the lift, so we collapse
          the inset to 0 to avoid a double gap. The row snaps back exactly on
          close. */}
      <View
        className="flex-1 bg-white"
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: keyboardOpen
            ? Platform.OS === 'android'
              ? keyboardHeight
              : 0
            : insets.bottom,
        }}
      >
        {/* Header */}
        <View className="px-4 pb-2 flex-row items-center justify-between border-b border-gray-200">
          <Pressable onPress={() => nav.goBack()} hitSlop={8}>
            <Text className="text-brand text-base">← Back</Text>
          </Pressable>
          {/* ISS-M10 (RX-4): header stage pill — always visible (D6 Flow04). */}
          <View className="bg-brand/10 px-3 py-1 rounded-full">
            <Text className="text-sm font-semibold text-brand">
              Stage {rex.stage} · {STAGE_NAMES[rex.stage]}
            </Text>
          </View>
          {!rex.closed ? (
            <Pressable onPress={openCloseModal}>
              <Text className="text-red-600 text-base font-semibold">Close Job</Text>
            </Pressable>
          ) : (
            <Text className="text-green-700 text-base font-semibold">Closed</Text>
          )}
        </View>

        {/* ISS-M10 (RX-4): ①→⑤ stage progress strip (D6 Flow04 locked element) */}
        {!rex.closed && (
          <View className="flex-row items-center px-4 py-2 border-b border-gray-100">
            {([1, 2, 3, 4, 5] as const).map((n) => {
              const done = n < rex.stage;
              const current = n === rex.stage;
              return (
                <View key={n} className="flex-row items-center flex-1 last:flex-none">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      current ? 'bg-brand' : done ? 'bg-brand/40' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        current || done ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {n}
                    </Text>
                  </View>
                  {n < 5 && (
                    <View
                      className={`flex-1 h-0.5 mx-1 ${done ? 'bg-brand/40' : 'bg-gray-200'}`}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Offline indicator */}
        {!isConnected && (
          <View className="bg-gray-100 border-b border-gray-200 px-4 py-1.5">
            {/* CC-4 (D6 Flow12 S4) — exact offline copy. */}
            <Text className="text-gray-600 text-xs">
              No connection — recording saved. Tap send when you have signal.
            </Text>
          </View>
        )}
        {offlineQueue.queued > 0 && (
          <View className="bg-blue-50 border-b border-blue-200 px-4 py-1.5 flex-row items-center justify-center">
            <ActivityIndicator size="small" color="#1d4ed8" />
            <Text className="text-blue-700 text-xs ml-2">
              {offlineQueue.flushing
                ? `Sending ${offlineQueue.queued} queued message${
                    offlineQueue.queued > 1 ? 's' : ''
                  }…`
                : `Waiting for connection · ${offlineQueue.queued} queued`}
            </Text>
          </View>
        )}

        {/* Soft cap banners */}
        {rex.softCapReached && (
          <View className="bg-red-50 border-b border-red-200 px-4 py-2">
            <Text className="text-red-700 text-sm mb-2">
              Session reached 30 messages. Start a linked session to continue with
              compressed context.
            </Text>
            <Pressable
              onPress={onStartLinkedSession}
              disabled={linking}
              className={`py-2 rounded-lg ${linking ? 'bg-gray-300' : 'bg-red-600'}`}
            >
              <Text className="text-center text-white font-semibold text-sm">
                {linking ? 'Starting…' : 'Start linked session'}
              </Text>
            </Pressable>
          </View>
        )}
        {rex.softCapWarning && !rex.softCapReached && !softCapDismissed && (
          <View className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            {/* ISS-L11 (RX-8): show the message count + offer the linked-session
                choice at the warning point (D6 Flow04 State 8). */}
            <Text className="text-amber-700 text-sm mb-2">
              Approaching the session limit — message {userMsgCount} of {SESSION_SOFT_CAP}.
              Start a linked session now, or continue here.
            </Text>
            {/* CC-2 — D6 wireframe shows TWO buttons at the warning point:
                'Start linked session' (primary) and 'Continue here'
                (dismiss). The latter keeps the worker in the current session
                until the hard limit (banner returns at 30). */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={onStartLinkedSession}
                disabled={linking}
                className={`flex-1 py-2 rounded-lg ${linking ? 'bg-gray-300' : 'bg-amber-500'}`}
              >
                <Text className="text-center text-white font-semibold text-sm">
                  {linking ? 'Starting…' : 'Start linked session'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSoftCapDismissed(true)}
                className="flex-1 py-2 rounded-lg border border-amber-500 bg-white"
              >
                <Text className="text-center text-amber-700 font-semibold text-sm">
                  Continue here
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Error — with a Retry that re-runs the failed turn (D8 TC-058-060) */}
        {rex.error && (
          <View className="bg-red-50 border-b border-red-200 px-4 py-2">
            <Text className="text-red-700 text-sm">{rex.error}</Text>
            {rex.canRetry && (
              <Pressable
                onPress={rex.retry}
                className="mt-1.5 self-start bg-red-600 px-4 py-1.5 rounded-lg"
              >
                <Text className="text-white font-semibold text-sm">Retry</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="py-2"
          keyboardShouldPersistTaps="handled"
        >
          {rex.messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.contentText ?? ''}
              photoUrl={m.photoUrl}
              transcript={m.transcriptEdited ?? m.transcriptOriginal}
            />
          ))}
          {rex.streaming && <StreamingText text={rex.streamingText} isStreaming={true} />}
        </ScrollView>

        {/* Apprentice mode prompt (D7 APPRENTICE DETECTION) */}
        {/* ISS-33: Rex's bubble message contains the "walk through each step"
            question text, and this panel header repeats a shortened form.
            The duplication is intentional and accepted: the bubble is Rex's
            conversational message while this panel is the canonical action
            control. Removing the bubble text would break the conversation
            history; removing the panel header would lose clarity. */}
        {apprenticePending && (
          <View className="border-t border-gray-200 px-4 py-3 bg-indigo-50">
            <Text className="text-sm text-indigo-900 font-medium mb-2">
              Want Rex to walk through each step in more detail as you go?
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => rex.onApprenticeAnswer(true)}
                className="flex-1 bg-brand py-2.5 rounded-lg"
              >
                {/* CC-2 — D6 verbatim. */}
                <Text className="text-center text-white font-semibold text-sm">
                  Yes — walk me through in detail
                </Text>
              </Pressable>
              <Pressable
                onPress={() => rex.onApprenticeAnswer(false)}
                className="flex-1 border border-gray-300 py-2.5 rounded-lg"
              >
                {/* CC-2 — D6 verbatim. */}
                <Text className="text-center text-gray-700 font-semibold text-sm">
                  No — standard guidance
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Contextual buttons */}
        {!rex.closed && !rex.streaming && !apprenticePending && rex.messages.length > 0 && (
          <ContextualButtons
            stage={rex.stage}
            disabled={rex.streaming}
            onPress={handleContextual}
          />
        )}

        {/* CC-2 — voice contextual buttons are hints; show a transient banner
            pointing the worker at the press-and-hold mic below the input. */}
        {voiceHint && !rex.closed && (
          <View className="bg-indigo-50 border-t border-indigo-200 px-4 py-2">
            <Text className="text-indigo-800 text-xs text-center">
              Press and hold the 🎙 mic below to record your description.
            </Text>
          </View>
        )}

        {/* Trial exhaustion notice (D6 Flow12 S8) — session preserved */}
        {trialExhausted && !rex.closed && (
          <View className="bg-amber-50 border-t border-amber-200 px-4 py-3">
            <Text className="text-amber-800 font-semibold text-sm mb-1">
              Free trial complete
            </Text>
            <Text className="text-amber-700 text-xs mb-2">
              You've used all your free Rex queries. This session is saved — subscribe to
              keep going.
            </Text>
            <Pressable
              onPress={() => nav.navigate('Paywall')}
              className="bg-brand py-2.5 rounded-lg"
            >
              <Text className="text-center text-white font-semibold text-sm">View plans</Text>
            </Pressable>
          </View>
        )}

        {/* Post-close: Report + Quote buttons (D6 Flow04 — never during active session) */}
        {rex.canShowReportQuote && rex.session && (
          <View className="flex-row gap-2 px-3 pb-2">
            {/* CC-2 — D6 verbatim labels '📄 Job report' / '💰 Quote'. */}
            <Pressable
              onPress={() => nav.navigate('ReportBuilder', { sessionId: rex.session!.id })}
              className="flex-1 bg-brand py-3 rounded-xl"
            >
              <Text className="text-center text-white font-semibold">📄 Job report</Text>
            </Pressable>
            <Pressable
              onPress={() => nav.navigate('QuoteBuilder', { sessionId: rex.session!.id })}
              className="flex-1 bg-green-600 py-3 rounded-xl"
            >
              <Text className="text-center text-white font-semibold">💰 Quote</Text>
            </Pressable>
          </View>
        )}

        {/* Pending photo preview */}
        {pendingPhoto && !rex.closed && (
          <View className="flex-row items-center px-3 py-2 border-t border-gray-200">
            <Image
              source={{ uri: pendingPhoto.uri }}
              className="w-14 h-14 rounded-md mr-3"
              resizeMode="cover"
            />
            <Text className="text-sm text-gray-600 flex-1">
              Photo ready — will send with your message
            </Text>
            <Pressable onPress={() => setPendingPhoto(null)}>
              <Text className="text-red-600 font-semibold">Remove</Text>
            </Pressable>
          </View>
        )}

        {/* Input row */}
        {!rex.closed && (
          <View className="border-t border-gray-200 px-3 py-2 bg-white">
            {transcribing && (
              <View className="flex-row items-center mb-2">
                <ActivityIndicator size="small" />
                <Text className="text-xs text-gray-500 ml-2">Transcribing…</Text>
              </View>
            )}
            {/* ISS-13: transcript review row — shown after voice transcription so
                the worker can discard before sending. Editing the text input above
                implicitly becomes the "edited" version; Discard clears both. */}
            {transcript && !transcribing && (
              <View className="flex-row items-start bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 mb-2">
                <Text className="flex-1 text-xs text-gray-600 leading-4" numberOfLines={3}>
                  🎙 {transcript}
                </Text>
                <Pressable
                  onPress={() => { setTranscript(null); setText(''); }}
                  className="ml-2 mt-0.5"
                >
                  <Text className="text-xs text-red-600 font-semibold">Discard</Text>
                </Pressable>
              </View>
            )}
            <View className="flex-row items-end gap-2">
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={
                  trialExhausted
                    ? 'Free trial complete — subscribe to continue'
                    : rex.streaming
                    ? 'Rex is responding…'
                    : isConnected
                    ? 'Type a message to Rex'
                    : 'Offline — message will queue'
                }
                placeholderTextColor="#9CA3AF"
                editable={!inputDisabled}
                multiline
                className="flex-1 border border-gray-300 rounded-2xl px-3 py-2 text-base text-gray-900 max-h-32"
              />
              <Pressable
                onPress={handleSend}
                disabled={inputDisabled || (!text.trim() && !pendingPhoto)}
                className={`px-4 py-3 rounded-full ${
                  inputDisabled || (!text.trim() && !pendingPhoto) ? 'bg-gray-300' : 'bg-brand'
                }`}
              >
                <Text className="text-white font-semibold">Send</Text>
              </Pressable>
            </View>
            {(photo.permissionDenied || voiceDenied) && (
              <View className="bg-amber-50 border border-amber-300 rounded-lg px-3 py-2 mb-2">
                <Text className="text-xs text-amber-700">
                  {photo.permissionDenied && voiceDenied
                    ? 'Camera and microphone access denied'
                    : photo.permissionDenied
                    ? 'Camera access denied'
                    : 'Microphone access denied'}
                  {' — '}
                  <Text
                    onPress={() => Linking.openSettings()}
                    className="font-semibold underline"
                  >
                    Open Settings
                  </Text>
                </Text>
                <Text className="text-[11px] text-amber-600">Text input still works.</Text>
              </View>
            )}
            <View className="flex-row gap-2 mt-2">
              <VoiceRecordButton
                isRecording={voice.isRecording}
                disabled={inputDisabled || voiceDenied}
                onPressIn={handleVoiceStart}
                onPressOut={handleVoiceStop}
              />
              <PhotoCapture
                disabled={inputDisabled || photo.permissionDenied}
                onCapture={handlePhoto}
              />
            </View>
          </View>
        )}
      </View>

      {/* Close-job modal — Stage 5 job naming (D6 Flow04) */}
      <Modal
        visible={closeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCloseModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-8">
          <View className="bg-white rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-gray-900 mb-1">Close this job</Text>
            <Text className="text-sm text-gray-500 mb-3">
              Name the job so you can find it in History — or leave it blank and
              we'll name it by date. Report and Quote become available after
              closing.
            </Text>
            <TextInput
              value={closeName}
              onChangeText={setCloseName}
              placeholder="e.g. 122 Main St — water heater (optional)"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 mb-4"
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setCloseModalVisible(false)}
                className="flex-1 border border-gray-300 py-3 rounded-xl"
              >
                <Text className="text-center text-gray-700 font-semibold">Cancel</Text>
              </Pressable>
              {/* CC-5 Fix C — always enabled; an empty name auto-names the job. */}
              <Pressable
                onPress={confirmClose}
                className="flex-1 py-3 rounded-xl bg-red-600"
              >
                <Text className="text-center text-white font-semibold">Close job</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
