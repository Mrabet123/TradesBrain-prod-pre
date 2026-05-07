// Quote preview component — M6 will build
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QuotePreview() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quote Preview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
