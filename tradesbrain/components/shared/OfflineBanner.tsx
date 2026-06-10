// D6 Flow12 S4 + S7 — App-wide network status banner. Pinned to the top of the
// screen stack so every screen surfaces the state.
//   offline      → red bar "No internet connection"           (S7)
//   on reconnect → green bar "Connected — syncing…" for ~3s    (S7 reconnect)

import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { useNetworkContext } from '../../context/NetworkContext';

const RECONNECT_BANNER_MS = 3000;

export default function OfflineBanner() {
  const { isConnected, initialized } = useNetworkContext();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!initialized) return;
    if (!isConnected) {
      // Went (or started) offline — remember it so we can flash the green
      // "syncing" banner once connectivity returns.
      wasOffline.current = true;
      setShowReconnected(false);
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setShowReconnected(true);
      const t = setTimeout(() => setShowReconnected(false), RECONNECT_BANNER_MS);
      return () => clearTimeout(t);
    }
  }, [isConnected, initialized]);

  if (!initialized) return null;

  if (!isConnected) {
    return (
      <View style={{ backgroundColor: '#E53935' }} className="px-3 py-1.5">
        <Text className="text-white text-xs font-semibold text-center">
          No internet connection
        </Text>
      </View>
    );
  }

  if (showReconnected) {
    return (
      <View style={{ backgroundColor: '#0A7A3A' }} className="px-3 py-1.5">
        <Text className="text-white text-xs font-semibold text-center">
          Connected — syncing…
        </Text>
      </View>
    );
  }

  return null;
}
