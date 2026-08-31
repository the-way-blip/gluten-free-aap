"use client";

/**
 * In-app purchase bridge (iOS StoreKit 2 via the local `sift-iap` Capacitor
 * plugin). Everything here is a no-op that reports "not premium / not available"
 * unless we're running inside the native iOS app with billing enabled — so the
 * public website / PWA is completely unaffected and stays free.
 */

import { Capacitor } from "@capacitor/core";
import { SiftIap } from "sift-iap";
import type {
  EntitlementInfo,
  PurchaseResult,
  SiftProduct,
} from "sift-iap";
import { BILLING_ENABLED, PRODUCT_IDS } from "@/lib/subscription";

export type { SiftProduct, EntitlementInfo, PurchaseResult };

/** Cheap sync gate: billing flag on AND running on iOS. */
export function iapEnabled(): boolean {
  return BILLING_ENABLED && Capacitor.getPlatform() === "ios";
}

/**
 * Confirms billing is actually usable: the flag is on, we're on iOS, AND the
 * native StoreKit plugin is present and reporting available. Older builds that
 * shipped before the plugin existed will fail this probe (the plugin call
 * throws, or the web fallback returns available:false), so they stay on the
 * free experience even after the billing flag is flipped — no broken gated
 * features for users who haven't updated.
 */
export async function probeBilling(): Promise<boolean> {
  if (!iapEnabled()) return false;
  try {
    const { available } = await SiftIap.isAvailable();
    return available === true;
  } catch {
    return false;
  }
}

/** Fetch the live products (localized prices) from the App Store. */
export async function getProducts(): Promise<SiftProduct[]> {
  if (!iapEnabled()) return [];
  try {
    const { products } = await SiftIap.getProducts();
    // Keep a stable order: monthly first, then yearly.
    const order = PRODUCT_IDS as readonly string[];
    return [...products].sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    );
  } catch {
    return [];
  }
}

/** Start a purchase (also begins the 7-day free trial for new subscribers). */
export async function purchase(productId: string): Promise<PurchaseResult> {
  if (!iapEnabled()) return { status: "unavailable", premium: false };
  return SiftIap.purchase({ productId });
}

/** Restore a previous purchase on this Apple ID. */
export async function restore(): Promise<EntitlementInfo> {
  if (!iapEnabled()) return { premium: false };
  return SiftIap.restore();
}

/** Current entitlement (active subscription or trial => premium: true). */
export async function getEntitlement(): Promise<EntitlementInfo> {
  if (!iapEnabled()) return { premium: false };
  try {
    return await SiftIap.getEntitlement();
  } catch {
    return { premium: false };
  }
}

/** Subscribe to entitlement changes (renewals, expirations, restores). */
export async function onEntitlementChange(
  cb: (info: EntitlementInfo) => void,
): Promise<() => void> {
  if (!iapEnabled()) return () => {};
  const handle = await SiftIap.addListener("entitlementChanged", cb);
  return () => {
    void handle.remove();
  };
}
