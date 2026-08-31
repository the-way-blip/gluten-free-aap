"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getEntitlement,
  getProducts,
  iapEnabled,
  onEntitlementChange,
  probeBilling,
  purchase as iapPurchase,
  restore as iapRestore,
  type SiftProduct,
} from "@/lib/iap";
import type { PurchaseResult } from "@/lib/iap";
import { COMP_CODE, COMP_KEY } from "@/lib/subscription";
import { trackPixel } from "@/components/MetaPixel";

interface PremiumContextValue {
  /** True when the user has an active subscription, free trial, or comp code. */
  premium: boolean;
  /** True only inside the native iOS app with billing enabled. */
  billingActive: boolean;
  /** Live products from the App Store (empty on web). */
  products: SiftProduct[];
  loading: boolean;
  purchase: (productId: string) => Promise<PurchaseResult>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
  /**
   * Gate a premium action. Returns true if allowed (premium / billing off);
   * otherwise opens the paywall and returns false. Use as:
   *   if (!requirePremium("AI recipe generation")) return;
   */
  requirePremium: (feature: string) => boolean;
  /** The feature the paywall is currently shown for, or null. */
  paywallFeature: string | null;
  closePaywall: () => void;
  /** Redeem a comp code for lifetime Premium. Returns true if the code matched. */
  redeemCode: (code: string) => boolean;
  /** True if this device unlocked Premium via a comp code. */
  comped: boolean;
}

const PremiumContext = createContext<PremiumContextValue>({
  premium: false,
  billingActive: false,
  products: [],
  loading: false,
  purchase: async () => ({ status: "unavailable", premium: false }),
  restore: async () => false,
  refresh: async () => {},
  requirePremium: () => true,
  paywallFeature: null,
  closePaywall: () => {},
  redeemCode: () => false,
  comped: false,
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  // Billing is proven active only after the native StoreKit plugin answers the
  // probe. Until then (and on web/PWA, older builds, or flag off) the app is
  // free: `premium` defaults to true so nothing is ever wrongly gated.
  const [billingActive, setBillingActive] = useState(false);
  const [premium, setPremium] = useState(true);
  const [comped, setComped] = useState(false);
  const [products, setProducts] = useState<SiftProduct[]>([]);
  const [loading, setLoading] = useState(iapEnabled());
  const [paywallFeature, setPaywallFeature] = useState<string | null>(null);

  // A comp code (redeemed once) unlocks Premium for good on this device.
  const isPremium = premium || comped;

  // Load any previously-redeemed comp code.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(COMP_KEY) === "1") setComped(true);
    } catch {
      /* ignore */
    }
  }, []);

  const redeemCode = useCallback((code: string) => {
    if ((code || "").trim().toUpperCase() !== COMP_CODE.toUpperCase()) return false;
    try {
      window.localStorage.setItem(COMP_KEY, "1");
    } catch {
      /* ignore */
    }
    setComped(true);
    return true;
  }, []);

  const refresh = useCallback(async () => {
    if (!(await probeBilling())) return;
    const info = await getEntitlement();
    setPremium(info.premium);
  }, []);

  useEffect(() => {
    if (!iapEnabled()) return;
    let unsub = () => {};
    let cancelled = false;
    (async () => {
      // Only gate if the native plugin is actually present in this build.
      const active = await probeBilling();
      if (cancelled) return;
      if (!active) {
        setLoading(false);
        return; // older build / no plugin → stay free, never gate
      }
      setBillingActive(true);
      const [info, prods] = await Promise.all([getEntitlement(), getProducts()]);
      if (cancelled) return;
      setPremium(info.premium);
      setProducts(prods);
      setLoading(false);
      unsub = await onEntitlementChange((next) => setPremium(next.premium));
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  // Once the user becomes premium, dismiss any open paywall.
  useEffect(() => {
    if (isPremium) setPaywallFeature(null);
  }, [isPremium]);

  const purchase = useCallback(
    async (productId: string) => {
      const result = await iapPurchase(productId);
      if (result.premium) {
        setPremium(true);
        // Report the conversion to Meta. The app is a WebView loading the site,
        // so the Pixel is live here; a new subscriber starts a 7-day free trial,
        // so StartTrial is the correct event. Value/currency come from the live
        // App Store product (localized). Attribution across the App Store gap is
        // imperfect — this is primarily for measurement + lookalike audiences
        // until the Meta SDK / App Promotion setup lands.
        if (result.status === "purchased") {
          const p = products.find((x) => x.id === productId);
          trackPixel("StartTrial", {
            content_name: productId,
            ...(p?.price != null ? { value: p.price, currency: "USD" } : {}),
          });
        }
      } else {
        await refresh();
      }
      return result;
    },
    [refresh, products],
  );

  const restore = useCallback(async () => {
    const info = await iapRestore();
    setPremium(info.premium);
    return info.premium;
  }, []);

  const requirePremium = useCallback(
    (feature: string) => {
      if (isPremium) return true;
      setPaywallFeature(feature);
      return false;
    },
    [isPremium],
  );

  const closePaywall = useCallback(() => setPaywallFeature(null), []);

  const value = useMemo(
    () => ({
      premium: isPremium,
      billingActive,
      products,
      loading,
      purchase,
      restore,
      refresh,
      requirePremium,
      paywallFeature,
      closePaywall,
      redeemCode,
      comped,
    }),
    [
      isPremium,
      billingActive,
      products,
      loading,
      purchase,
      restore,
      refresh,
      requirePremium,
      paywallFeature,
      closePaywall,
      redeemCode,
      comped,
    ],
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
