// Team member card — M8 will build
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MemberCardProps {
  name: string;
  trade: string;
  isActive: boolean;
}

export default function MemberCard({ name, trade, isActive }: MemberCardProps) {
  return (
    <View style={[styles.card, !isActive && styles.inactive]}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.trade}>{trade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 8, backgroundColor: '#f5f5f5', marginVertical: 4 },
  inactive: { opacity: 0.5 },
  name: { fontSize: 16, fontWeight: '600' },
  trade: { fontSize: 14, color: '#666', marginTop: 4 },
});
