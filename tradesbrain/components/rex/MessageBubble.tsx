// D6 Flow04 — message bubble for Rex session.
// User messages: right-aligned, brand colour. Assistant: left-aligned, gray with Rex compass avatar.
// Photos render inline above the text. Transcript shown for voice messages.
//
// CC-5 Fix B — an assistant message tagged with [[PUSHBACK:1]] (Rex holds) gets
// an amber bubble; [[PUSHBACK:2]] (Rex adopts) gets a green bubble. The marker
// is stripped from the displayed text (same pattern as [[STAGE:n]]).

import React from 'react';
import { View, Text, Image } from 'react-native';
import SafetyBlock, { type SafetyVariant } from './SafetyBlock';

// ISS-02: minimal inline bold parser — splits on **...**  segments so that
// safety-critical text like "**STOP — POTENTIAL GAS PRESENCE**" renders bold.
// Only handles **bold**; no nesting, no escaping needed for current content.
function renderWithBold(text: string, baseClass: string) {
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

interface Props {
  role: 'user' | 'assistant';
  content: string;
  photoUrl?: string | null;
  transcript?: string | null;
}

const PUSHBACK_TAG = /\[\[PUSHBACK:([12])\]\]/;
const PUSHBACK_TAG_ALL = /\[\[PUSHBACK:[12]\]\]/g;

// M10 / D6 Flow12 S22–S25 — split an assistant message into ordered text and
// safety-panel segments. Safety blocks are wrapped server-side as
// [[SAFETY:type]] … [[/SAFETY]] (SAFETY_BLOCK_ADDENDUM).
type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'safety'; variant: SafetyVariant; text: string };

const SAFETY_BLOCK = /\[\[SAFETY:(stop|confirm|note)\]\]([\s\S]*?)\[\[\/SAFETY\]\]/gi;

function parseSegments(content: string): Segment[] {
  const segs: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  SAFETY_BLOCK.lastIndex = 0;
  while ((m = SAFETY_BLOCK.exec(content)) !== null) {
    const before = content.slice(last, m.index).trim();
    if (before) segs.push({ kind: 'text', text: before });
    segs.push({
      kind: 'safety',
      variant: m[1].toLowerCase() as SafetyVariant,
      text: m[2].trim(),
    });
    last = m.index + m[0].length;
  }
  if (segs.length) {
    const tail = content.slice(last).trim();
    if (tail) segs.push({ kind: 'text', text: tail });
    return segs;
  }

  // Fallback (life-safety): if the model omitted the [[SAFETY]] markers but the
  // text still contains a recognised safety heading, promote that paragraph to
  // the correct coloured panel so the warning is never lost in a plain bubble.
  // Covers all three panel types — stop (gas/CO), confirm (fall protection),
  // and note (lockout/tagout) — so a dropped marker can never silently degrade
  // a roofer or electrician safety warning to ordinary text.
  const fb = fallbackSafety(content);
  if (fb) return fb;

  return [{ kind: 'text', text: content }];
}

// Heading patterns matched in document order against the raw text. Each grabs
// the heading + its following lines up to the next blank line (or end). The
// surrounding text is preserved before/after the panel, so a note at the end of
// a diagnosis still renders last and a STOP at the start still renders first.
const SAFETY_FALLBACKS: { re: RegExp; variant: SafetyVariant }[] = [
  { re: /\**\s*(STOP\b[\s\S]*?)(?:\n\s*\n|$)/i, variant: 'stop' },
  { re: /\**\s*(FALL PROTECTION\b[\s\S]*?)(?:\n\s*\n|$)/i, variant: 'confirm' },
  {
    re: /\**\s*((?:SAFETY[^\n]*?)?(?:LOCKOUT\s*\/?\s*TAGOUT|\bLOTO\b)[\s\S]*?)(?:\n\s*\n|$)/i,
    variant: 'note',
  },
];

function fallbackSafety(content: string): Segment[] | null {
  for (const { re, variant } of SAFETY_FALLBACKS) {
    const m = content.match(re);
    if (m && m.index !== undefined && m[1].trim()) {
      const block = m[1].trim();
      const before = content.slice(0, m.index).trim();
      const after = content.slice(m.index + m[0].length).trim();
      const out: Segment[] = [];
      if (before) out.push({ kind: 'text', text: before });
      out.push({ kind: 'safety', variant, text: block });
      if (after) out.push({ kind: 'text', text: after });
      return out;
    }
  }
  return null;
}

export default function MessageBubble({ role, content, photoUrl, transcript }: Props) {
  const isUser = role === 'user';

  // CC-5 Fix B — detect + strip the pushback marker before display.
  const pushbackMatch = !isUser ? content.match(PUSHBACK_TAG) : null;
  const pushbackLevel = pushbackMatch ? Number(pushbackMatch[1]) : 0;
  const displayText = pushbackMatch ? content.replace(PUSHBACK_TAG_ALL, '').trim() : content;

  // M10 — when Rex's message carries one or more safety panels, render the
  // assistant column as a stack of boxes (safety panels + gray text bubbles) in
  // document order: stop/confirm panels come first, a note panel comes last
  // (the placement is governed by the D7 prompt + SAFETY_BLOCK_ADDENDUM).
  const segments = !isUser ? parseSegments(displayText) : null;
  const hasSafety = !!segments && segments.some((seg) => seg.kind === 'safety');

  if (!isUser && hasSafety && segments) {
    return (
      <View className="my-1 mx-3 flex-row items-start">
        <Image
          source={require('../../assets/rex-compass.png')}
          style={{ width: 28, height: 28, marginRight: 6, marginTop: 2 }}
          accessibilityLabel="Rex"
        />
        <View style={{ flex: 1, maxWidth: '88%' }}>
          {photoUrl && (
            <Image
              source={{ uri: photoUrl }}
              className="w-full h-48 rounded-2xl mb-2"
              resizeMode="cover"
            />
          )}
          {transcript && (
            <Text className="text-xs mb-1 italic text-gray-500">🎙 {transcript}</Text>
          )}
          {segments.map((seg, i) =>
            seg.kind === 'safety' ? (
              <SafetyBlock key={i} variant={seg.variant} content={seg.text} />
            ) : (
              <View key={i} className="bg-gray-100 rounded-2xl px-3 py-2 mb-2 self-start">
                {renderWithBold(seg.text, 'text-[15px] leading-5 text-gray-800')}
              </View>
            ),
          )}
        </View>
      </View>
    );
  }

  const assistantBubbleClass =
    pushbackLevel === 1
      ? 'bg-[#FFF8E1] border-l-[3px] border-l-[#E65100]' // Pushback A — amber
      : pushbackLevel === 2
      ? 'bg-[#E8F5E9] border-l-[3px] border-l-[#0A7A3A]' // Pushback B — green
      : 'bg-gray-100';

  const bubble = (
    <View
      className={`max-w-[82%] rounded-2xl ${
        isUser ? 'self-end bg-brand' : assistantBubbleClass
      }`}
    >
      {photoUrl && (
        <Image
          source={{ uri: photoUrl }}
          className="w-full h-48 rounded-t-2xl"
          resizeMode="cover"
        />
      )}
      <View className="px-3 py-2">
        {transcript && (
          <Text
            className={`text-xs mb-1 italic ${isUser ? 'text-white/70' : 'text-gray-500'}`}
          >
            🎙 {transcript}
          </Text>
        )}
        {renderWithBold(
          displayText,
          `text-[15px] leading-5 ${isUser ? 'text-white' : 'text-gray-800'}`,
        )}
      </View>
    </View>
  );

  if (isUser) {
    return <View className="my-1 mx-3">{bubble}</View>;
  }

  return (
    <View className="my-1 mx-3 flex-row items-end">
      <Image
        source={require('../../assets/rex-compass.png')}
        style={{ width: 28, height: 28, marginRight: 6, marginBottom: 4 }}
        accessibilityLabel="Rex"
      />
      {bubble}
    </View>
  );
}
