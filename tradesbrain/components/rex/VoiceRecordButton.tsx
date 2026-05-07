// Voice recording button — M2 will build full implementation with expo-av
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface VoiceRecordButtonProps {
  isRecording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export default function VoiceRecordButton({ isRecording, onPressIn, onPressOut }: VoiceRecordButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.recording]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Text style={styles.text}>{isRecording ? 'Recording...' : 'Hold to Record'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderRadius: 24, backgroundColor: '#2E75B6', alignItems: 'center' },
  recording: { backgroundColor: '#DC2626' },
  text: { color: '#fff', fontWeight: '600' },
});
