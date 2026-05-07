// Report preview component — M6 will build
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReportPreview() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Preview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
