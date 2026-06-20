// services/externalPurchase.ts — Stripe external web-checkout link (Task 3).
//
// HYBRID payment on iOS: Apple IAP stays the primary, fully-available path for
// everyone. IN ADDITION, US App Store customers may choose our web checkout
// (lower fees, and the only way to reach Pro/Team ANNUAL on iOS — see Task 1).
//
// COMPLIANCE (Apple External Purchase Link rules):
//   • US-ONLY. Gated on the live App Store *storefront* country code, not the
//     device locale — this is what Apple's entitlement scopes to.
//   • The link must open in the system default browser (Safari), NOT an in-app
//     browser / SFSafariViewController. We use Linking.openURL.
//   • A clear disclosure must be shown before leaving the app (the paywall
//     presents EXTERNAL_PURCHASE_DISCLOSURE before calling openExternalCheckout).
//   • IAP is never disadvantaged: this is presented as an additional option,
//     never replacing or out-styling the Subscribe (IAP) buttons.
//
// On Android there is no Apple constraint — Stripe is the native path already,
// so this module's US gate is a no-op there.

import { Platform, Linking } from 'react-native';
import { getStorefront } from 'expo-iap';
import type { PlanType, BillingCycle } from './payments';

// Where US users land for web checkout. Configurable per environment; defaults
// to the public pricing page, which carries the same prices as the app (Task 4).
const WEB_CHECKOUT_URL =
  process.env.EXPO_PUBLIC_WEB_CHECKOUT_URL?.trim() || 'https://tradesbrain.app/pricing';

// Apple's required pre-departure disclosure shown before opening the browser.
export const EXTERNAL_PURCHASE_DISCLOSURE =
  "You're about to subscribe on TradesBrain's website using your browser. " +
  'This purchase is handled by TradesBrain, not the App Store — Apple is not ' +
  'responsible for the privacy or security of purchases made on the web.';

/**
 * Is the external Stripe link allowed for this user?
 * iOS  → only when the live App Store storefront is the United States.
 * Android → always (Stripe is the native checkout there; no Apple gate).
 */
export async function isExternalCheckoutAllowed(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  try {
    // StoreKit returns an ISO 3166-1 country code for the signed-in Apple ID's
    // storefront (e.g. "USA" alpha-3, or "US" alpha-2 on some versions).
    const code = (await getStorefront())?.toUpperCase?.() ?? '';
    return code === 'USA' || code === 'US';
  } catch {
    // If we can't confirm the storefront, fail CLOSED — never show the external
    // option to a non-US (or unknown) storefront. IAP remains fully available.
    return false;
  }
}

/** Build the web-checkout URL with the plan/cycle preselected. */
export function externalCheckoutUrl(plan: PlanType, cycle: BillingCycle): string {
  const sep = WEB_CHECKOUT_URL.includes('?') ? '&' : '?';
  return `${WEB_CHECKOUT_URL}${sep}plan=${encodeURIComponent(plan)}&cycle=${encodeURIComponent(cycle)}`;
}

/**
 * Open the external web checkout in the system browser.
 * Call ONLY after the user has accepted EXTERNAL_PURCHASE_DISCLOSURE.
 * Returns false if the URL could not be opened.
 */
export async function openExternalCheckout(
  plan: PlanType,
  cycle: BillingCycle,
): Promise<boolean> {
  const url = externalCheckoutUrl(plan, cycle);
  try {
    await Linking.openURL(url); // system browser — required for compliance
    return true;
  } catch {
    return false;
  }
}
