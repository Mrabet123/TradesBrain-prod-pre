// Rex message bubble — M2 will build full implementation
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  photoUrl?: string | null;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginVertical: 4, marginHorizontal: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#2E75B6' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#F0F0F0' },
  text: { fontSize: 15, lineHeight: 20 },
  userText: { color: '#fff' },
  assistantText: { color: '#333' },
});
