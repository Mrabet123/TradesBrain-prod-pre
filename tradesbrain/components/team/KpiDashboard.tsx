// Team KPI dashboard — M8 will build
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function KpiDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team KPIs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
