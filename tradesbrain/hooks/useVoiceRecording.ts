import { useRef, useState } from 'react';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';

// Why expo-audio (not expo-av): expo-av's Audio.Recording is deprecated and
// unreliable on the New Architecture (default in SDK 55) — recording would throw
// on prepare/start, which the screen then mislabelled as "mic denied" (TC-031:
// "appears denied but the mic is enabled in settings"). expo-audio is the
// supported recorder for SDK 54+.

// The result of startRecording, so the caller can show the CORRECT surface:
//   'denied' → amber "Microphone access denied" banner + Open Settings (TC-069)
//   'error'  → transient "couldn't start recording" toast (mic busy / hw fault)
//   'ok'     → recording is live
export type StartRecordingResult = 'ok' | 'denied' | 'error';

export function useVoiceRecording() {
  // expo-audio's recorder is a hook — instantiate it once per mount and reuse
  // it across record/stop cycles. prepareToRecordAsync() re-arms it each time.
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  // D6 Flow12 S2 — a denied mic permission surfaces the amber banner + greys the
  // voice button. Kept separate from a generic recording error so the screen can
  // show the right message instead of always saying "denied".
  const [permissionDenied, setPermissionDenied] = useState(false);

  // TC-031 — this is a HOLD-to-record control, not a tap-toggle. A quick tap
  // fires onPressIn→onPressOut almost instantly and captures a sub-second clip
  // that Whisper can't transcribe (looks like "transcription always fails").
  // We stamp the start time and discard anything shorter than MIN_RECORDING_MS
  // so only a deliberate press-and-hold produces audio.
  const startedAtRef = useRef(0);
  const MIN_RECORDING_MS = 600;
  // Press-and-hold race guards. The mic button fires onPressIn → startRecording
  // (several awaits) and onPressOut → stopRecording. A quick tap can fire
  // onPressOut BEFORE startRecording resolves. Without these guards that leaves
  // a dangling recording that is never stopped, and the next attempt fails.
  const startingRef = useRef(false);
  const cancelledRef = useRef(false);
  // Tracks whether a recording is actually live (recorder.record() succeeded),
  // so stopRecording knows there is something to stop.
  const activeRef = useRef(false);

  // Returns 'ok' if recording started, 'denied' if the mic permission was
  // refused, or 'error' for any other failure (mic busy, hardware fault). The
  // caller uses the result to pick the right UI surface.
  const startRecording = async (): Promise<StartRecordingResult> => {
    // Already preparing or recording — ignore re-entrant presses.
    if (startingRef.current || activeRef.current) return 'error';
    startingRef.current = true;
    cancelledRef.current = false;
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setPermissionDenied(true);
        return 'denied';
      }
      setPermissionDenied(false);

      // expo-audio uses platform-neutral keys (allowsRecording / playsInSilentMode)
      // — the iOS-only allowsRecordingIOS keys from expo-av no longer apply.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();

      // If the user already released (tapped) while we were preparing, unwind now
      // so we never leave a recording running with no way to stop it.
      if (cancelledRef.current) {
        try {
          await recorder.stop();
        } catch {
          /* nothing was captured — safe to ignore */
        }
        return 'error';
      }

      recorder.record();
      activeRef.current = true;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      return 'ok';
    } catch {
      // Mic busy (another app), hardware error, or a prepare/record fault.
      // Surface a generic error — NOT "denied" — so the screen shows the right
      // message and no state leaks.
      activeRef.current = false;
      setIsRecording(false);
      return 'error';
    } finally {
      startingRef.current = false;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    // Stop pressed before start finished: flag it so startRecording unwinds the
    // recording it is about to create instead of leaving it dangling.
    if (startingRef.current) cancelledRef.current = true;

    if (!activeRef.current) {
      setIsRecording(false);
      return null;
    }
    activeRef.current = false;
    setIsRecording(false);

    const heldMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    startedAtRef.current = 0;
    let uri: string | null = null;
    try {
      await recorder.stop();
      uri = recorder.uri ?? null;
    } catch {
      // Recording was too short / never produced audio — treat as "nothing to
      // transcribe" rather than crashing the caller with an unhandled rejection.
      uri = null;
    }
    // TC-031 — a tap (not a hold) produced an unusable sub-second clip. Discard
    // it so the caller no-ops instead of firing a doomed transcription request.
    if (uri && heldMs > 0 && heldMs < MIN_RECORDING_MS) {
      uri = null;
    }
    // Release the recording audio mode so later playback isn't forced to the
    // earpiece on Android.
    try {
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      /* non-fatal */
    }
    setRecordingUri(uri);
    return uri;
  };

  return { isRecording, recordingUri, permissionDenied, startRecording, stopRecording };
}
