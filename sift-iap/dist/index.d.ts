import type { PluginListenerHandle } from '@capacitor/core';

export interface SiftProduct {
  id: string;
  displayName: string;
  description: string;
  /** Localized price string, e.g. "$4.99". */
  displayPrice: string;
  /** Numeric price in the storefront currency. */
  price: number;
  /** e.g. "1 month", "1 year". */
  period: string;
  hasFreeTrial: boolean;
}

export interface EntitlementInfo {
  premium: boolean;
  productId?: string;
  /** ISO-8601 expiration of the active subscription, if any. */
  expirationDate?: string;
}

export interface PurchaseResult extends EntitlementInfo {
  status: 'purchased' | 'cancelled' | 'pending' | 'unknown' | 'unavailable';
}

export interface SiftIapPlugin {
  /** True only on native iOS with StoreKit available. */
  isAvailable(): Promise<{ available: boolean }>;
  getProducts(): Promise<{ products: SiftProduct[] }>;
  purchase(options: { productId: string }): Promise<PurchaseResult>;
  restore(): Promise<EntitlementInfo>;
  requestReview(): Promise<Record<string, never>>;
  getEntitlement(): Promise<EntitlementInfo>;
  addListener(
    eventName: 'entitlementChanged',
    listener: (info: EntitlementInfo) => void,
  ): Promise<PluginListenerHandle>;
}

export declare const SiftIap: SiftIapPlugin;
