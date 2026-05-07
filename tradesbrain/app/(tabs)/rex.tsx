// Rex AI Diagnostic entry — M2 will build full Rex session
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
