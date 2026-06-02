// Safe-area-aware screen container.
//
// Replaces the old hardcoded `pt-12` top-padding hack used across the app.
// On modern Android (edge-to-edge is enforced from Android 15 / Expo SDK 55)
// and on notched iPhones, the app draws UNDER the system status bar and
// navigation bar. A fixed 48px top padding is wrong on every device with a
// different status-bar height, and nothing was reserving space for the bottom
// navigation bar — which is why bottom controls (e.g. the hold-to-record
// button in Rex) ended up hidden behind the 3-button nav bar.
//
// This component reads the REAL device insets and pads accordingly, so content
// clears the system bars on any phone (notch, punch-hole, gesture nav, or the
// classic 3-button bar). This is the same approach WhatsApp / Instagram use —
// draw edge-to-edge, then inset the content.
//
// Usage:
//   <Screen className="flex-1 bg-white px-5">…</Screen>            // top + bottom
//   <Screen edges={['top']} className="flex-1 bg-white px-5">…</Screen>  // tab screens
//     (bottom tab bar already reserves the bottom inset, so tab screens only
//      need the top edge)

import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Edge = 'top' | 'bottom';

type Props = ViewProps & {
  children: React.ReactNode;
  /** NativeWind classes — set bg colour + horizontal padding here. */
  className?: string;
  /** Which safe-area edges to pad. Default both. Tab screens pass ['top']. */
  edges?: Edge[];
  /** Extra px added below the top inset for visual breathing room. Default 8. */
  extraTop?: number;
  /** Extra px added above the bottom inset. Default 0. */
  extraBottom?: number;
};

export default function Screen({
  children,
  className = 'flex-1 bg-white',
  edges = ['top', 'bottom'],
  extraTop = 8,
  extraBottom = 0,
  style,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: edges.includes('top') ? insets.top + extraTop : extraTop,
    paddingBottom: edges.includes('bottom') ? insets.bottom + extraBottom : extraBottom,
  };
  return (
    <View className={className} style={[padding, style]} {...rest}>
      {children}
    </View>
  );
}
