// Trade settings — M8 will build
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TradeSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trade Settings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
