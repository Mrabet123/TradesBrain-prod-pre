import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export default function ToastNotification({ message, visible, type = 'info', onDismiss, duration = 3000 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  // Hold the latest onDismiss in a ref so the show/hide animation effect only
  // re-runs when `visible` changes — not every time the parent re-renders with
  // a new callback identity (which would restart/cancel the toast).
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDismissRef.current());
    }
  }, [visible, duration, opacity]);

  if (!visible) return null;

  const bgColor = type === 'error' ? '#DC2626' : type === 'success' ? '#16A34A' : type === 'warning' ? '#D97706' : '#1E3A5F';

  return (
    <Animated.View
      // Sit below the status bar / notch on any device, not a fixed 60px.
      style={[styles.container, { top: insets.top + 12, opacity, backgroundColor: bgColor }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 20, right: 20, padding: 16, borderRadius: 8, zIndex: 9999 },
  text: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
