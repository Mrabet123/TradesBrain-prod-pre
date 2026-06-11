// D6 Flow04 (flow_04_rex_session.html) — Stage-aware contextual button row.
// Labels are now verbatim D6. Action keys are routed by the screen (some are
// input-gathering — photo / voice — and some are reactions handed off to
// useRexSession.onContextualAction). 'close_job' is handled by the screen (it
// opens the close-job naming modal).
//   Stage 1: '📷 Take photo' · '🎙 Describe problem' · '✕ Close job'
//   Stage 2: '✓ Confirm diagnosis' · '⏭ Skip to repair' · '✕ Close job'
//   Stage 3: '✓ Step done' · '📷 Photo this step' · '🎙 Voice confirmation' ·
//            '❓ Need clarification' · '⏭ Skip step' · '✕ Close job'
//   Stage 4: '📷 Send final photo' · '✓ All clear — no issues' ·
//            '⚠ Found an issue' · '✕ Close job'
//   Stage 5: 'Save and close ↗'

import React from 'react';
import { View, Pressable, Text } from 'react-native';

interface Props {
  stage: 1 | 2 | 3 | 4 | 5;
  disabled?: boolean;
  onPress: (action: string) => void;
}

type Tone = 'primary' | 'success' | 'warn' | 'danger' | 'default';
interface Btn {
  action: string;
  label: string;
  tone?: Tone;
}

const BUTTONS: Record<number, Btn[]> = {
  1: [
    { action: 'take_photo', label: '📷 Take photo', tone: 'primary' },
    { action: 'describe_problem', label: '🎙 Describe problem' },
    { action: 'close_job', label: '✕ Close job', tone: 'danger' },
  ],
  2: [
    { action: 'agree_diagnosis', label: '✓ Confirm diagnosis', tone: 'primary' },
    { action: 'skip_to_repair', label: '⏭ Skip to repair' },
    { action: 'close_job', label: '✕ Close job', tone: 'danger' },
  ],
  3: [
    { action: 'step_done', label: '✓ Step done', tone: 'success' },
    { action: 'photo_step', label: '📷 Photo this step', tone: 'primary' },
    { action: 'voice_confirmation', label: '🎙 Voice confirmation' },
    { action: 'need_clarification', label: '❓ Need clarification' },
    { action: 'skip_step', label: '⏭ Skip step' },
    { action: 'close_job', label: '✕ Close job', tone: 'danger' },
  ],
  4: [
    { action: 'send_final_photo', label: '📷 Send final photo', tone: 'primary' },
    { action: 'final_pass', label: '✓ All clear — no issues', tone: 'success' },
    { action: 'found_issue', label: '⚠ Found an issue', tone: 'warn' },
    { action: 'close_job', label: '✕ Close job', tone: 'danger' },
  ],
  5: [{ action: 'close_job', label: 'Save and close ↗', tone: 'primary' }],
};

function toneClasses(tone: Tone | undefined, disabled: boolean) {
  if (disabled) {
    return { border: 'border-gray-200 bg-gray-100', text: 'text-gray-400' };
  }
  switch (tone) {
    case 'primary':
      return { border: 'border-brand bg-brand', text: 'text-white' };
    case 'success':
      return { border: 'border-green-700 bg-green-50', text: 'text-green-700' };
    case 'warn':
      return { border: 'border-amber-500 bg-amber-50', text: 'text-amber-700' };
    case 'danger':
      return { border: 'border-red-600 bg-white', text: 'text-red-600' };
    default:
      return { border: 'border-gray-300 bg-white', text: 'text-gray-700' };
  }
}

export default function ContextualButtons({ stage, disabled, onPress }: Props) {
  const list = BUTTONS[stage] ?? [];
  return (
    <View className="flex-row flex-wrap gap-2 px-3 mt-2 mb-1">
      {list.map((b) => {
        const t = toneClasses(b.tone, !!disabled);
        return (
          <Pressable
            key={b.action}
            disabled={disabled}
            onPress={() => onPress(b.action)}
            accessibilityRole="button"
            accessibilityLabel={b.label.replace(/^[^A-Za-z0-9]+\s*/, '')}
            className={`px-3 py-2 rounded-full border ${t.border}`}
          >
            <Text className={`text-sm font-medium ${t.text}`}>{b.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
