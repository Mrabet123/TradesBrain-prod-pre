// Splash / launch screen — shown by RootLayout while the session check and
// first profile lookup resolve (D6 Flow01/Flow02 S1).
//
// Plays the branded "App Store intro" motion deliverable (Motion System #02):
// the canonical Rex compass assembles from the centre, pulses, and the wordmark
// fades in. The navy background (#1E3A5F) matches the native splash (app.json),
// so the OS static splash hands off seamlessly into this animated brand moment —
// no jarring cut, no static logo sitting still.
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import LottieIllustration from './LottieIllustration';

// Brand navy — keep in sync with app.json `splash.backgroundColor`.
const BRAND_NAVY = '#1E3A5F';

export default function SplashScreen() {
  const { width } = useWindowDimensions();
  // Fill ~78% of the screen width, capped so it stays tasteful on tablets.
  const size = Math.min(Math.round(width * 0.78), 360);
  return (
    <View
      style={{ flex: 1, backgroundColor: BRAND_NAVY, alignItems: 'center', justifyContent: 'center' }}
    >
      <LottieIllustration
        // App Store intro — compass quadrants fade in → pulse → wordmark.
        // Plays once and settles on the wordmark frame if loading runs long.
        source={require('../../assets/animations/app-store-intro.json')}
        width={size}
        height={size}
        loop={false}
        autoPlay
      />
    </View>
  );
}
