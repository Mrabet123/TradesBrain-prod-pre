// Wraps a screen's body in a KeyboardAvoidingView + ScrollView so soft-keyboard
// pop-up never hides the focused input or the action button below it. Used by
// every form screen (sign-up, sign-in, OTP, forgot-password, profile editors,
// document builders) so the keyboard never covers the Create Account / Verify /
// Save buttons — especially on Android where the system nav bar + keyboard
// combined can push primary CTAs off-screen.

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  /** Extra padding (px) appended below the content. Default 48. Bump on screens
   *  whose final button sits flush at the bottom. */
  bottomInset?: number;
  /** Extra px added below the device top inset for breathing room under the
   *  status bar / notch. Default 8. (Replaces the old hardcoded `pt-12` hack —
   *  the real top inset is now applied automatically.) */
  topInset?: number;
  /** Pass-through ScrollView className (NativeWind). */
  className?: string;
  /** Pass-through ScrollView contentContainerClassName (NativeWind). */
  contentContainerClassName?: string;
  /** Use `false` if the screen handles its own scrolling. */
  scrollable?: boolean;
  /** Tap-outside-to-dismiss the keyboard. Default true. */
  dismissOnTap?: boolean;
  /** Forwarded to the inner ScrollView. */
  scrollViewProps?: ScrollViewProps;
};

export default function KeyboardAwareScreen({
  children,
  bottomInset = 48,
  topInset = 8,
  className = 'flex-1 bg-white',
  contentContainerClassName = 'px-5',
  scrollable = true,
  dismissOnTap = true,
  scrollViewProps,
}: Props) {
  // Apply the REAL device insets, not a fixed pad. Top: clears the status bar /
  // notch on any phone (replaces the old hardcoded `pt-12`, which was wrong on
  // every device with a different status-bar height). Bottom: clears the Android
  // nav bar / iOS home indicator so the final CTA (Create Account / Save /
  // Confirm) is never hidden behind the system navigation bar.
  const insets = useSafeAreaInsets();
  const paddingTop = insets.top + topInset;
  const paddingBottom = bottomInset + insets.bottom;
  const body = scrollable ? (
    <ScrollView
      className={className}
      contentContainerClassName={contentContainerClassName}
      contentContainerStyle={{ paddingTop, paddingBottom }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={className} style={{ paddingTop, paddingBottom }}>
      {children}
    </View>
  );

  const wrapped = dismissOnTap ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {body}
    </TouchableWithoutFeedback>
  ) : (
    body
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // Header is hidden across auth/form screens; 0 offset is correct.
      keyboardVerticalOffset={0}
    >
      {wrapped}
    </KeyboardAvoidingView>
  );
}
