// D6 Flow01 — Dual OTP verification (email + SMS)
// M1 will implement dual OTP input with verification
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OtpVerifyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Identity</Text>
      <Text style={styles.subtitle}>Enter the codes sent to your email and phone</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 8 },
});
