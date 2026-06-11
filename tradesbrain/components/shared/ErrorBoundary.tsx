import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep diagnostics in the console only — never surface raw error text to
    // the user (it can leak internals and means nothing to a tradesperson).
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-white items-center justify-center px-8">
          <Text className="text-lg font-bold text-gray-900 mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            The app hit an unexpected problem. Tap below to try again — your work
            is saved.
          </Text>
          {/* Recovery action — clears the error state so the user is not stuck
              on a dead screen until they force-restart the app. */}
          <Pressable
            accessibilityRole="button"
            onPress={this.reset}
            className="bg-brand py-3 px-8 rounded-xl"
          >
            <Text className="text-white font-semibold text-base">Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
