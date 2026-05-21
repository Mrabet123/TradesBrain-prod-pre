// CC-5 Fix A (D6 Flow05 / Flow06) — in-app styled confirm/discard prompt that
// replaces native OS Alert dialogs at the document confirm + discard moments.
// A clear headline, a full-width primary action, and an outline secondary
// action below it. The destructiveSecondary flag tints the secondary button
// red for the "discard — I am sure" path.

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  /** Tints the secondary button red — used for the discard confirmation. */
  destructiveSecondary?: boolean;
  /** Disables both buttons while an action is running. */
  busy?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  destructiveSecondary,
  busy,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={busy ? undefined : onSecondary}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-8">
        <View className="bg-white rounded-2xl p-5 w-full">
          <Text className="text-lg font-bold text-gray-900 mb-1">{title}</Text>
          {message ? (
            <Text className="text-sm text-gray-500 mb-4">{message}</Text>
          ) : (
            <View className="mb-3" />
          )}

          {/* Primary — full width, Navy background, White text (D6). */}
          <Pressable
            onPress={onPrimary}
            disabled={busy}
            className={`py-3.5 rounded-xl ${busy ? 'bg-gray-300' : 'bg-brand'}`}
          >
            <Text className="text-center text-white font-semibold text-base">
              {primaryLabel}
            </Text>
          </Pressable>

          {/* Secondary — outline style, below the primary (D6). */}
          <Pressable
            onPress={onSecondary}
            disabled={busy}
            className={`py-3.5 rounded-xl mt-2 border ${
              destructiveSecondary ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                destructiveSecondary ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {secondaryLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
