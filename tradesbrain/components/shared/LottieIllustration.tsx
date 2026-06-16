// Brand Lottie wrapper — renders the approved TradesBrain animations from
// assets/animations/ at a consistent size. The Lottie `source` is passed in by
// the caller (require()'d at the call site so Metro can statically resolve the
// asset). Used for loaders, empty states and one-shot success moments.
import React from 'react';
import { View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface Props {
  source: number;
  size?: number;
  width?: number;
  height?: number;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  style?: ViewStyle;
  onAnimationFinish?: () => void;
}

export default function LottieIllustration({
  source,
  size,
  width,
  height,
  loop = true,
  autoPlay = true,
  speed = 1,
  style,
  onAnimationFinish,
}: Props) {
  const w = width ?? size ?? 120;
  const h = height ?? size ?? 120;
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <LottieView
        // require() returns a module id (number) at runtime, which LottieView
        // accepts, but its type only lists string/object — cast to satisfy TS.
        source={source as unknown as string}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={onAnimationFinish}
        style={{ width: w, height: h }}
      />
    </View>
  );
}
