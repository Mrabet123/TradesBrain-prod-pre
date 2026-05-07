// D6 Flow02 S2 — Welcome screen
// M1 will implement: Create Account + Sign In buttons
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TradesBrain</Text>
      <Text style={styles.subtitle}>AI co-pilot for skilled trade professionals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2E75B6' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});
