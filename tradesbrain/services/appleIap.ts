// services/appleIap.ts — Apple In-App Purchase (StoreKit 2) via expo-iap.
// iOS ONLY. Android keeps Stripe (services/payments.ts). All purchases are
// verified server-side by the apple-iap-validate Edge Function — the client
// never decides entitlement (CLAUDE.md Rule 1/7).
//
// expo-iap is event-based: requestPurchase() does NOT return the result; the
// outcome arrives via purchaseUpdatedListener / purchaseErrorListener. Those
// listeners are owned by context/IapProvider, which turns them into a promise.

import { Platform, Linking } from 'react-native';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  deepLinkToSubscriptions,
  type Purchase,
} from 'expo-iap';
import { supabase } from './supabase';
import type { PlanType, BillingCycle } from './payments';

// Must match the App Store Connect product IDs and the server PRODUCT_MAP in
// supabase/functions/_shared/appleIap.ts.
export function iapProductId(plan: PlanType, cycle: BillingCycle): string {
  return `app.tradesbrain.${plan}.${cycle}`;
}
export const IAP_PRODUCT_IDS: string[] = (['solo', 'pro', 'team'] as PlanType[]).flatMap((p) =>
  (['monthly', 'annual'] as BillingCycle[]).map((c) => iapProductId(p, c)),
);

export function planFromProductId(
  id: string,
): { plan: PlanType; cycle: BillingCycle } | null {
  const m = /^app\.tradesbrain\.(solo|pro|team)\.(monthly|annual)$/.exec(id);
  return m ? { plan: m[1] as PlanType, cycle: m[2] as BillingCycle } : null;
}

/** The signed StoreKit 2 transaction (JWS) lives on `purchase.purchaseToken` on iOS. */
export function jwsOf(purchase: Purchase): string | undefined {
  return (purchase as unknown as { purchaseToken?: string }).purchaseToken;
}

export async function connect(): Promise<void> {
  await initConnection();
}
export async function disconnect(): Promise<void> {
  try { await endConnection(); } catch { /* already closed */ }
}

/** Load the 6 subscription products with Apple-localized prices. */
export async function loadProducts() {
  const res = await fetchProducts({ skus: IAP_PRODUCT_IDS, type: 'subs' });
  return Array.isArray(res) ? res : [];
}

/** Kick off the StoreKit purchase sheet. Result arrives via the listeners. */
export async function buy(productId: string): Promise<void> {
  await requestPurchase({ request: { apple: { sku: productId } }, type: 'subs' });
}

/** Server-side verification + entitlement write. Returns true on success. */
export async function validate(jws: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('apple-iap-validate', {
    body: { jws },
  });
  if (error) return false;
  return !!data?.ok;
}

export async function finish(purchase: Purchase): Promise<void> {
  // Subscriptions are non-consumable. Unfinished iOS transactions replay on
  // every launch until finished.
  await finishTransaction({ purchase, isConsumable: false });
}

export async function listAvailable(): Promise<Purchase[]> {
  return await getAvailablePurchases();
}

/** Deep-link to the iOS system Subscriptions page (manage / cancel). */
export async function openManageSubscriptions(): Promise<void> {
  try {
    await deepLinkToSubscriptions({ skuAndroid: '', packageNameAndroid: 'app.tradesbrain' });
  } catch {
    if (Platform.OS === 'ios') {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    }
  }
}
