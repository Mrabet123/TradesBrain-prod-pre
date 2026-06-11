// D6 Flow04 — Assistant streaming bubble shown while Rex is responding.
//
// This bubble is structurally IDENTICAL to MessageBubble's assistant text
// bubble (same avatar, same gray bubble, same padding, same bold parser) so
// that when the stream ends and the persisted MessageBubble takes over there is
// NO visible flicker or layout jump. While there is no text yet (Rex is still
// generating) we show an animated three-dot "typing" indicator instead of an
// empty box + blinking cursor.

import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import { renderWithBold } from './richText';

function TypingDots() {
  // Three dots created with a stable hook order.
  const d0 = useRef(new Animated.Value(0.3)).current;
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const dots = [d0, d1, d2];
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(d, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0.3,
            duration: 320,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [d0, d1, d2]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
      {[d0, d1, d2].map((d, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: '#9CA3AF',
            marginHorizontal: 2,
            opacity: d,
            transform: [{ scale: d }],
          }}
        />
      ))}
    </View>
  );
}

interface Props {
  text: string;
  isStreaming: boolean;
}

export default function StreamingText({ text, isStreaming }: Props) {
  if (!text && !isStreaming) return null;

  return (
    <View className="my-1 mx-3 flex-row items-end">
      <Image
        source={require('../../assets/rex-compass.png')}
        style={{ width: 28, height: 28, marginRight: 6, marginBottom: 4 }}
        accessibilityLabel="Rex"
      />
      <View className="max-w-[82%] rounded-2xl bg-gray-100">
        <View className="px-3 py-2">
          {text ? (
            renderWithBold(text, 'text-[15px] leading-5 text-gray-800')
          ) : (
            <TypingDots />
          )}
        </View>
      </View>
    </View>
  );
}
