// D6 Flow12 S22–S25 — Rex safety-escalation panels.
// Three variants, matched to the wireframe:
//   stop    — IMMEDIATE life-threatening hazard (gas, CO / cracked heat
//             exchanger, water+electrical, active fall). Solid red, white "!"
//             badge. Rendered FIRST, before the diagnosis.        (S22, S23)
//   confirm — required safety CONFIRMATION before at-height / live guidance
//             (fall protection). Solid orange, white "⚠" badge.    (S24)
//   note    — NON-immediate safety note (lockout/tagout, PPE). Dark panel with
//             an amber left border + amber title. Rendered LAST.   (S25)
//
// Content comes from Rex (D7 SAFETY RULES), wrapped server-side in
// [[SAFETY:type]] … [[/SAFETY]] markers; MessageBubble extracts the inner text
// and the variant and passes them here.

import React from 'react';
import { View, Text } from 'react-native';

export type SafetyVariant = 'stop' | 'confirm' | 'note';

interface Props {
  variant: SafetyVariant;
  content: string;
}

interface VariantStyle {
  bg: string;
  border?: string;
  badge: string;
  badgeBg: string; // 'transparent' → render the glyph alone (no circle)
  badgeFg: string;
  titleColor: string;
  bodyColor: string;
  defaultTitle: string;
}

const VARIANTS: Record<SafetyVariant, VariantStyle> = {
  stop: {
    bg: '#C62828',
    badge: '!',
    badgeBg: '#ffffff',
    badgeFg: '#C62828',
    titleColor: '#ffffff',
    bodyColor: 'rgba(255,255,255,0.95)',
    defaultTitle: 'STOP',
  },
  confirm: {
    bg: '#E65100',
    badge: '⚠',
    badgeBg: '#ffffff',
    badgeFg: '#E65100',
    titleColor: '#ffffff',
    bodyColor: 'rgba(255,255,255,0.95)',
    defaultTitle: 'CONFIRM BEFORE PROCEEDING',
  },
  note: {
    bg: '#1A1A2E',
    border: '#FFB74D',
    badge: '⚠',
    badgeBg: 'transparent',
    badgeFg: '#FFB74D',
    titleColor: '#FFB74D',
    bodyColor: 'rgba(255,255,255,0.9)',
    defaultTitle: 'SAFETY',
  },
};

// If the first line reads like a heading ("STOP — …", "FALL PROTECTION — …",
// "SAFETY — LOCKOUT/TAGOUT REQUIRED"), promote it to the panel title; otherwise
// use the variant default and keep all text as the body.
function splitTitle(content: string, fallback: string): { title: string; body: string } {
  const trimmed = content.trim();
  const nl = trimmed.indexOf('\n');
  const firstRaw = nl === -1 ? trimmed : trimmed.slice(0, nl);
  const first = firstRaw.replace(/\*\*/g, '').trim();
  const rest = nl === -1 ? '' : trimmed.slice(nl + 1).trim();
  const looksLikeTitle =
    first.length <= 70 &&
    /(STOP|FALL PROTECTION|SAFETY|LOCKOUT|TAGOUT|CARBON MONOXIDE|CO RISK|DANGER|WARNING)/i.test(
      first,
    );
  if (looksLikeTitle) return { title: first.toUpperCase(), body: rest };
  return { title: fallback, body: trimmed };
}

// Minimal **bold** renderer (mirrors MessageBubble) line-by-line.
function renderBody(text: string, color: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <View key={i} style={{ height: 4 }} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    return (
      <Text key={i} style={{ color, fontSize: 12, lineHeight: 19, marginBottom: 2 }}>
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**') ? (
            <Text key={j} style={{ fontWeight: '700' }}>
              {p.slice(2, -2)}
            </Text>
          ) : (
            p
          ),
        )}
      </Text>
    );
  });
}

export default function SafetyBlock({ variant, content }: Props) {
  const v = VARIANTS[variant];
  const { title, body } = splitTitle(content, v.defaultTitle);

  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: v.bg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        ...(v.border ? { borderLeftWidth: 4, borderLeftColor: v.border } : null),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: body ? 8 : 0 }}>
        {v.badgeBg !== 'transparent' ? (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: v.badgeBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Text style={{ color: v.badgeFg, fontWeight: '900', fontSize: 13 }}>{v.badge}</Text>
          </View>
        ) : (
          <Text style={{ color: v.badgeFg, fontSize: 15, marginRight: 8 }}>{v.badge}</Text>
        )}
        <Text
          style={{
            color: v.titleColor,
            fontWeight: '900',
            fontSize: 13,
            letterSpacing: 0.5,
            flex: 1,
          }}
        >
          {title}
        </Text>
      </View>
      {body ? <View>{renderBody(body, v.bodyColor)}</View> : null}
    </View>
  );
}
