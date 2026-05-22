// D6 Flow04 (flow_04_rex_session.html) — Stage-aware contextual buttons shown
// below Rex's response.
// ISS-M10 (RX-5) — honest note: these are REACTION buttons (the worker reacts
// to Rex's latest message), not the input-gathering set ("Take photo / Describe
// further / …") that D6 Flow04 shows on some stages. The label strings are
// approximate, not verbatim-D6; an earlier comment claiming "D6 canonical text"
// was inaccurate and has been corrected. The free-text input + voice + photo
// controls cover the input-gathering actions; these buttons are the quick
// reaction shortcuts. Action keys map to handlers in useRexSession.
//   Stage 1: "✓ Looks right" / "Disagree" / "❓ Need more detail"
//   Stage 2: "✓ Confirm diagnosis" / "Disagree" / "❓ Ask follow-up"
//   Stage 3: "✓ Step done" / "Pushback" / "⏭ Pause"
//   Stage 4: "✓ All clear — no issues" / "⚠ Found an issue"
//   Stage 5: "Save and close ↗"

import React from 'react';
import { View, Pressable, Text } from 'react-native';

interface Props {
  stage: 1 | 2 | 3 | 4 | 5;
  disabled?: boolean;
  onPress: (action: string) => void;
}

const BUTTONS: Record<number, { action: string; label: string; tone?: 'primary' | 'warn' }[]> = {
  1: [
    { action: 'looks_right', label: '✓ Looks right', tone: 'primary' },
    { action: 'disagree', label: 'Disagree' },
    { action: 'more_detail', label: '❓ Need more detail' },
  ],
  2: [
    { action: 'agree_diagnosis', label: '✓ Confirm diagnosis', tone: 'primary' },
    { action: 'disagree', label: 'Disagree' },
    { action: 'followup', label: '❓ Ask follow-up' },
  ],
  3: [
    { action: 'step_done', label: '✓ Step done', tone: 'primary' },
    { action: 'pushback', label: 'Pushback' },
    { action: 'pause', label: '⏭ Pause' },
  ],
  4: [
    { action: 'final_pass', label: '✓ All clear — no issues', tone: 'primary' },
    { action: 'found_issue', label: '⚠ Found an issue', tone: 'warn' },
  ],
  5: [{ action: 'close_job', label: 'Save and close ↗', tone: 'primary' }],
};

export default function ContextualButtons({ stage, disabled, onPress }: Props) {
  const list = BUTTONS[stage] ?? [];
  return (
    <View className="flex-row flex-wrap gap-2 px-3 mt-2 mb-1">
      {list.map((b) => (
        <Pressable
          key={b.action}
          disabled={disabled}
          onPress={() => onPress(b.action)}
          className={`px-3 py-2 rounded-full border ${
            disabled
              ? 'border-gray-200 bg-gray-100'
              : b.tone === 'primary'
              ? 'border-brand bg-brand/10'
              : b.tone === 'warn'
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-300 bg-white'
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              disabled
                ? 'text-gray-400'
                : b.tone === 'primary'
                ? 'text-brand'
                : b.tone === 'warn'
                ? 'text-amber-700'
                : 'text-gray-700'
            }`}
          >
            {b.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
