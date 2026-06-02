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
  className = 'flex-1 bg-white',
  contentContainerClassName = 'px-5 pt-12',
  scrollable = true,
  dismissOnTap = true,
  scrollViewProps,
}: Props) {
  // Add the device's bottom inset (Android nav bar / iOS home indicator) on top
  // of the caller's bottomInset so the final CTA (Create Account / Save / Confirm)
  // is never hidden behind the system navigation bar on any phone.
  const insets = useSafeAreaInsets();
  const paddingBottom = bottomInset + insets.bottom;
  const body = scrollable ? (
    <ScrollView
      className={className}
      contentContainerClassName={contentContainerClassName}
      contentContainerStyle={{ paddingBottom }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={className} style={{ paddingBottom }}>
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
