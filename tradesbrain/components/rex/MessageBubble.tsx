// D6 Flow04 — message bubble for Rex session.
// User messages: right-aligned, brand colour. Assistant: left-aligned, gray with Rex compass avatar.
// Photos render inline above the text. Transcript shown for voice messages.
//
// CC-5 Fix B — an assistant message tagged with [[PUSHBACK:1]] (Rex holds) gets
// an amber bubble; [[PUSHBACK:2]] (Rex adopts) gets a green bubble. The marker
// is stripped from the displayed text (same pattern as [[STAGE:n]]).

import React from 'react';
import { View, Text, Image } from 'react-native';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  photoUrl?: string | null;
  transcript?: string | null;
}

const PUSHBACK_TAG = /\[\[PUSHBACK:([12])\]\]/;

export default function MessageBubble({ role, content, photoUrl, transcript }: Props) {
  const isUser = role === 'user';

  // CC-5 Fix B — detect + strip the pushback marker before display.
  const pushbackMatch = !isUser ? content.match(PUSHBACK_TAG) : null;
  const pushbackLevel = pushbackMatch ? Number(pushbackMatch[1]) : 0;
  const displayText = pushbackMatch ? content.replace(PUSHBACK_TAG, '').trim() : content;

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
        <Text className={`text-[15px] leading-5 ${isUser ? 'text-white' : 'text-gray-800'}`}>
          {displayText}
        </Text>
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
