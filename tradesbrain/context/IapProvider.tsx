// context/IapProvider.tsx — owns the single expo-iap connection + purchase
// listeners on iOS, and turns the event-based purchase flow into an awaitable
// promise so screens can use it like the Stripe path. No-op on Android (Stripe).
//
// Sits UNDER SubscriptionProvider so it can refresh entitlement after a verified
// purchase. The purchaseUpdatedListener also catches replayed/restored iOS
// transactions at startup and finishes them.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import {
  purchaseErrorListener,
  purchaseUpdatedListener,
  ErrorCode,
  type Purchase,
} from 'expo-iap';
import {
  connect,
  disconnect,
  loadProducts,
  buy,
  validate,
  finish,
  listAvailable,
  jwsOf,
  openManageSubscriptions,
  planFromProductId,
} from '../services/appleIap';
import { useSubscriptionContext } from './SubscriptionContext';

export interface PurchaseOutcome {
  ok: boolean;
  reason?: 'cancelled' | 'validation_failed' | 'error';
  message?: string;
}

// deno-lint-ignore no-explicit-any
type IapProduct = any;

interface IapContextType {
  available: boolean; // IAP usable on this platform (iOS only)
  products: IapProduct[];
  productsLoading: boolean;
  busyProductId: string | null;
  /** Awaitable purchase. Resolves when StoreKit + server validation complete. */
  purchase: (productId: string) => Promise<PurchaseOutcome>;
  restore: () => Promise<boolean>;
  openManage: () => Promise<void>;
  reloadProducts: () => Promise<void>;
}

const noop = async () => {};
const IapContext = createContext<IapContextType>({
  available: false,
  products: [],
  productsLoading: false,
  busyProductId: null,
  purchase: async () => ({ ok: false, reason: 'error', message: 'IAP unavailable' }),
  restore: async () => false,
  openManage: noop,
  reloadProducts: noop,
});

const IS_IOS = Platform.OS === 'ios';

export function IapProvider({ children }: { children: ReactNode }) {
  const { optimisticActivate, refreshSubscription } = useSubscriptionContext();
  const [products, setProducts] = useState<IapProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  // Resolver for the in-flight purchase(), keyed by productId.
  const pendingRef = useRef<{ productId: string; resolve: (o: PurchaseOutcome) => void } | null>(null);

  const reloadProducts = useCallback(async () => {
    if (!IS_IOS) return;
    setProductsLoading(true);
    try {
      setProducts(await loadProducts());
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Handle a delivered transaction (fresh purchase OR replayed/restored).
  const handlePurchase = useCallback(
    async (p: Purchase) => {
      const jws = jwsOf(p);
      const pending = pendingRef.current;
      const matches = pending && pending.productId === p.productId;
      try {
        const ok = jws ? await validate(jws) : false;
        // Always finish so the iOS queue is cleared and won't replay forever.
        await finish(p);
        if (ok) {
          const plan = planFromProductId(p.productId)?.plan;
          if (plan) optimisticActivate(plan);
          else await refreshSubscription();
        }
        if (matches) {
          pendingRef.current = null;
          setBusyProductId(null);
          pending!.resolve(ok ? { ok: true } : { ok: false, reason: 'validation_failed' });
        } else if (ok) {
          // Restored/replayed transaction with no awaiting caller — just refresh.
          await refreshSubscription();
        }
      } catch (e) {
        if (matches) {
          pendingRef.current = null;
          setBusyProductId(null);
          pending!.resolve({ ok: false, reason: 'error', message: String(e) });
        }
      }
    },
    [optimisticActivate, refreshSubscription],
  );

  useEffect(() => {
    if (!IS_IOS) return;
    let mounted = true;
    connect()
      .then(() => { if (mounted) void reloadProducts(); })
      .catch(() => {});
    const upd = purchaseUpdatedListener((p) => { handlePurchase(p); });
    const err = purchaseErrorListener((e) => {
      const pending = pendingRef.current;
      if (!pending) return;
      pendingRef.current = null;
      setBusyProductId(null);
      const cancelled = e.code === ErrorCode.UserCancelled;
      pending.resolve({ ok: false, reason: cancelled ? 'cancelled' : 'error', message: e.message });
    });
    return () => {
      mounted = false;
      upd.remove();
      err.remove();
      disconnect();
    };
  }, [handlePurchase, reloadProducts]);

  const purchase = useCallback(async (productId: string): Promise<PurchaseOutcome> => {
    if (!IS_IOS) return { ok: false, reason: 'error', message: 'IAP unavailable' };
    if (pendingRef.current) return { ok: false, reason: 'error', message: 'Purchase already in progress' };
    setBusyProductId(productId);
    return new Promise<PurchaseOutcome>((resolve) => {
      pendingRef.current = { productId, resolve };
      buy(productId).catch((e) => {
        // Synchronous rejection (e.g. not prepared) — resolve here since the
        // error listener won't fire for this case.
        if (pendingRef.current?.productId === productId) {
          pendingRef.current = null;
          setBusyProductId(null);
          resolve({ ok: false, reason: 'error', message: String(e) });
        }
      });
    });
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!IS_IOS) return false;
    try {
      const purchases = await listAvailable();
      let any = false;
      for (const p of purchases) {
        const jws = jwsOf(p);
        if (jws && (await validate(jws))) { any = true; await finish(p); }
      }
      await refreshSubscription();
      return any;
    } catch {
      return false;
    }
  }, [refreshSubscription]);

  return (
    <IapContext.Provider
      value={{
        available: IS_IOS,
        products,
        productsLoading,
        busyProductId,
        purchase,
        restore,
        openManage: openManageSubscriptions,
        reloadProducts,
      }}
    >
      {children}
    </IapContext.Provider>
  );
}

export const useIapContext = () => useContext(IapContext);
export default IapContext;
