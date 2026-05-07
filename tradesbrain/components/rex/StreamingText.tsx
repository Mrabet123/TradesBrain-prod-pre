// Word-by-word streaming display — M2 will build
import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
}

export default function StreamingText({ text, isStreaming }: StreamingTextProps) {
  return (
    <Text style={styles.text}>
      {text}
      {isStreaming && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, lineHeight: 22, color: '#333' },
  cursor: { color: '#2E75B6', fontWeight: 'bold' },
});
