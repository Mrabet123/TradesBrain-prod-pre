// Photo capture button — M2 will build with stage-aware compression
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PhotoCaptureProps {
  onCapture: () => void;
}

export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onCapture}>
      <Text style={styles.text}>Camera</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderRadius: 24, backgroundColor: '#16A34A', alignItems: 'center' },
  text: { color: '#fff', fontWeight: '600' },
});
