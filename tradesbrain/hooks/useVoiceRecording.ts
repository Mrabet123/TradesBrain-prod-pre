import { useState, useRef } from 'react';
import { Audio } from 'expo-av';

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  // D6 Flow12 S2 — a denied mic permission must surface so the screen can show
  // the amber "Microphone access denied" banner + grey the voice button. A
  // silent early-return previously left the caller unable to detect denial.
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  // Press-and-hold race guards. The mic button fires onPressIn → startRecording
  // (several awaits) and onPressOut → stopRecording. A quick tap can fire
  // onPressOut BEFORE startRecording resolves. Without these guards, on Android
  // that leaves a dangling Audio.Recording that is never stopped, and the very
  // next attempt throws "Only one Recording object can be prepared at a given
  // time" — voice then stays broken for the rest of the session.
  const startingRef = useRef(false);
  const cancelledRef = useRef(false);

  // Returns true if recording started, false if permission was denied or the
  // mic could not be acquired. The caller uses the result to toggle the
  // mic-denied banner.
  const startRecording = async (): Promise<boolean> => {
    // Already preparing or recording — ignore re-entrant presses.
    if (startingRef.current || recordingRef.current) return false;
    startingRef.current = true;
    cancelledRef.current = false;
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        return false;
      }
      setPermissionDenied(false);

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      // If the user already released (tapped) while we were preparing, unwind
      // now so we never leave a recording running with no way to stop it.
      if (cancelledRef.current) {
        try {
          await recording.stopAndUnloadAsync();
        } catch {
          /* nothing was captured — safe to ignore */
        }
        return false;
      }

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      return true;
    } catch {
      // Mic busy (another app), hardware error, or the one-recording-at-a-time
      // constraint. Surface the fallback UI and make sure no state leaks.
      recordingRef.current = null;
      setIsRecording(false);
      return false;
    } finally {
      startingRef.current = false;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    // Stop pressed before start finished: flag it so startRecording unwinds the
    // recording it is about to create instead of leaving it dangling.
    if (startingRef.current) cancelledRef.current = true;

    const recording = recordingRef.current;
    recordingRef.current = null;
    setIsRecording(false);
    if (!recording) return null;

    let uri: string | null = null;
    try {
      await recording.stopAndUnloadAsync();
      uri = recording.getURI();
    } catch {
      // Recording was too short / never produced audio. On Android
      // stopAndUnloadAsync throws here — treat it as "nothing to transcribe"
      // rather than crashing the caller with an unhandled rejection.
      uri = null;
    }
    // Release the recording audio mode so later playback isn't forced to the
    // earpiece on Android.
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch {
      /* non-fatal */
    }
    setRecordingUri(uri);
    return uri;
  };

  return { isRecording, recordingUri, permissionDenied, startRecording, stopRecording };
}
