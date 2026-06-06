// D6 Flow11 — Member card.
// Badges: Active · First login pending · KYC pending · KYC rejected.
// O-2: swipe-left reveals a Delete action (D6 Flow11 / 2.3.2). Implemented with
// the built-in Animated + PanResponder — NO native dependency and no new dev
// build (react-native-gesture-handler is not installed). Long-press is retained
// as an accessible fallback to the same destructive action.

import React, { useRef } from 'react';
import { View, Text, Pressable, Alert, Animated, PanResponder } from 'react-native';
import type { TeamMember } from '../../services/team';

interface Props {
  member: TeamMember;
  onPress: () => void;
  onDeleteRequest: () => void;
}

const ACTION_WIDTH = 88; // width of the revealed Delete action
const OPEN_THRESHOLD = ACTION_WIDTH / 2;

export default function MemberCard({ member, onPress, onDeleteRequest }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false); // is the row currently swiped open?

  function snap(toOpen: boolean) {
    openRef.current = toOpen;
    Animated.spring(translateX, {
      toValue: toOpen ? -ACTION_WIDTH : 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }

  const pan = useRef(
    PanResponder.create({
      // Claim the gesture only for a deliberate horizontal swipe so vertical
      // list scrolling and plain taps continue to work.
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => {
        const base = openRef.current ? -ACTION_WIDTH : 0;
        let next = base + g.dx;
        if (next > 0) next = 0;
        if (next < -ACTION_WIDTH) next = -ACTION_WIDTH;
        translateX.setValue(next);
      },
      onPanResponderRelease: (_e, g) => {
        const base = openRef.current ? -ACTION_WIDTH : 0;
        snap(base + g.dx < -OPEN_THRESHOLD);
      },
      onPanResponderTerminate: () => snap(openRef.current),
    }),
  ).current;

  function onLongPress() {
    Alert.alert(member.fullName, undefined, [
      { text: 'Cancel' },
      { text: 'Delete member', style: 'destructive', onPress: onDeleteRequest },
    ]);
  }

  function onDeletePress() {
    snap(false);
    onDeleteRequest();
  }

  function onCardPress() {
    // A tap while the row is open should close it rather than navigate.
    if (openRef.current) {
      snap(false);
      return;
    }
    onPress();
  }

  const kycPending =
    member.nationalIdKycStatus === 'pending' || member.licenseKycStatus === 'pending';
  const kycRejected =
    member.nationalIdKycStatus === 'rejected' || member.licenseKycStatus === 'rejected';

  return (
    <View className="relative mb-2">
      {/* Delete action revealed behind the card on swipe-left */}
      <View className="absolute right-0 top-0 bottom-0 justify-center">
        <Pressable
          accessibilityLabel={`Delete ${member.fullName}`}
          onPress={onDeletePress}
          className="bg-red-600 rounded-xl items-center justify-center"
          style={{ width: ACTION_WIDTH, height: '100%' }}
        >
          <Text className="text-white text-xs font-semibold">Delete</Text>
        </Pressable>
      </View>

      <Animated.View style={{ transform: [{ translateX }] }} {...pan.panHandlers}>
        <Pressable
          onPress={onCardPress}
          onLongPress={onLongPress}
          delayLongPress={500}
          className="bg-white border border-gray-200 rounded-xl p-4"
        >
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-1 mr-2">
              <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                {member.fullName}
              </Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {member.tradeType} · {member.email}
              </Text>
            </View>
            {member.isActive ? (
              <View className="bg-green-100 rounded-full px-2 py-0.5">
                <Text className="text-[10px] text-green-700 font-semibold uppercase">
                  Active
                </Text>
              </View>
            ) : (
              <View className="bg-gray-100 rounded-full px-2 py-0.5">
                <Text className="text-[10px] text-gray-700 font-semibold uppercase">
                  Inactive
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row flex-wrap gap-1 mt-1">
            {member.temporaryPasswordSet && (
              <Badge tone="amber" label="First login pending" />
            )}
            {kycRejected && <Badge tone="red" label="KYC rejected" />}
            {kycPending && !kycRejected && <Badge tone="amber" label="KYC pending" />}
          </View>

          <Text className="text-[10px] text-gray-400 mt-2">
            Swipe left to delete
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function Badge({
  tone,
  label,
}: {
  tone: 'amber' | 'red' | 'green';
  label: string;
}) {
  const palette =
    tone === 'amber'
      ? { bg: 'bg-amber-100', fg: 'text-amber-700' }
      : tone === 'red'
      ? { bg: 'bg-red-100', fg: 'text-red-700' }
      : { bg: 'bg-green-100', fg: 'text-green-700' };
  return (
    <View className={`rounded-full px-2 py-0.5 ${palette.bg}`}>
      <Text className={`text-[10px] font-semibold ${palette.fg}`}>{label}</Text>
    </View>
  );
}
