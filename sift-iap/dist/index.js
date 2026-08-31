import { registerPlugin } from '@capacitor/core';

/**
 * SiftIap plugin proxy. On native iOS it bridges to StoreKit 2 (SiftIapPlugin.swift).
 * On the web (and any non-native platform) the fallback below reports "not
 * available" so the app stays fully free and functional without a store.
 */
export const SiftIap = registerPlugin('SiftIap', {
  web: () => ({
    isAvailable: async () => ({ available: false }),
    getProducts: async () => ({ products: [] }),
    purchase: async () => ({ status: 'unavailable', premium: false }),
    restore: async () => ({ premium: false }),
    getEntitlement: async () => ({ premium: false }),
    requestReview: async () => ({}),
    addListener: async () => ({ remove: async () => {} }),
  }),
});
