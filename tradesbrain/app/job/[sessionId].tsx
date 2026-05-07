// Active Rex session screen — M2 will build
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ActiveSessionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rex Session</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
