// services/deepLinks.ts — central deep-link router for push-notification taps.
//
// Push notifications (send-push-notification Edge Function) carry a
// `data.deep_link` such as `tradesbrain://team/member/<id>` or
// `tradesbrain://settings/subscription`. Notification taps do NOT flow through
// React Navigation's `linking` config (that only sees OS Linking URL events),
// so we route them imperatively through a navigation ref instead.
//
// Cold-start safety: if a tap launched the app, navigation is not ready yet —
// the link is held in `pending` and flushed from NavigationContainer.onReady.
// Screens that only exist in the authenticated stack are guarded: navigate()
// is wrapped in try/catch, so a tap while signed out is a clean no-op.

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../app/_layout';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pending: string | null = null;

interface Target {
  name: keyof RootStackParamList;
  params?: Record<string, unknown>;
}

// Map a `tradesbrain://…` deep link to a stack route. Returns null for links
// we don't recognise (auth links like reset-password are handled by the
// NavigationContainer `linking` config, not here).
function resolve(url: string): Target | null {
  const path = url
    .replace(/^tradesbrain:\/\//i, '')
    .replace(/^\/+/, '')
    .split('?')[0];
  const [head, ...rest] = path.split('/').filter(Boolean);

  switch (head) {
    case 'home':
      return { name: 'Tabs' };
    case 'paywall':
      return { name: 'Paywall' };
    case 'settings':
      if (rest[0] === 'profile') return { name: 'SettingsProfile' };
      // subscription + subscription/payment both land on the subscription hub.
      if (rest[0] === 'subscription') return { name: 'SubscriptionSettings' };
      if (rest[0] === 'team') return { name: 'SettingsTeam' };
      return { name: 'Settings' };
    case 'team':
      // tradesbrain://team/member/<id> → that member's detail screen (M8 #15).
      if (rest[0] === 'member' && rest[1]) {
        return { name: 'TeamMemberDetail', params: { memberId: rest[1] } };
      }
      // tradesbrain://team or tradesbrain://team/members → the team hub.
      return { name: 'SettingsTeam' };
    default:
      return null;
  }
}

function go(url: string): void {
  const target = resolve(url);
  if (!target) return;
  try {
    // navigate() is typed per-route; the dynamic name/params shape is validated
    // at runtime by React Navigation and guarded by the surrounding try/catch.
    (navigationRef.navigate as (name: string, params?: unknown) => void)(
      target.name,
      target.params,
    );
  } catch {
    // Target screen not present in the current stack (e.g. signed out). No-op.
  }
}

// Entry point for notification handlers. Defers until navigation is ready.
export function routeDeepLink(url: string | null | undefined): void {
  if (!url) return;
  if (!navigationRef.isReady()) {
    pending = url;
    return;
  }
  go(url);
}

// Called from NavigationContainer.onReady — replays a link captured at cold
// start once the tree is mounted.
export function flushPendingDeepLink(): void {
  if (!pending) return;
  const url = pending;
  pending = null;
  go(url);
}
