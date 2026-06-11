// Shared inline rich-text helpers for Rex bubbles.
//
// renderWithBold is used by BOTH the persisted MessageBubble and the live
// StreamingText so the word-by-word reveal and the final message render
// IDENTICALLY — same bold handling, same layout. This removes two reported
// bugs: (1) raw "**" markers flashing while Rex types, and (2) the screen
// "flicker" when the streaming bubble was swapped for the persisted bubble
// (previously a different component with different markup).

import React from 'react';
import { Text } from 'react-native';

// Minimal inline bold parser — splits on **...** segments so safety-critical
// text like "**STOP — POTENTIAL GAS PRESENCE**" renders bold. Only handles
// **bold**; no nesting. An unclosed "**" (mid-stream) simply renders literally
// until its closing pair arrives on the next chunk.
export function renderWithBold(text: string, baseClass: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) {
    // Fast path — no bold markers present.
    return <Text className={baseClass}>{text}</Text>;
  }
  return (
    <Text className={baseClass}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: 'bold' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part ? <Text key={i}>{part}</Text> : null;
      })}
    </Text>
  );
}
