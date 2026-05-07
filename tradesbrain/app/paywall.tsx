// Paywall screen — M8 will build full plan selection + Stripe checkout
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PaywallScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>Subscribe to unlock unlimited access</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8 },
});
