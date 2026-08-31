"use client";

import { usePremium } from "@/components/PremiumProvider";
import { Paywall } from "@/components/Paywall";

/**
 * Gates a Premium-only feature. When billing is inactive (web/PWA, or the flag
 * is off) `premium` is always true, so children render normally and nothing is
 * ever locked. Inside the native iOS app, a non-subscriber sees the Paywall.
 *
 * Gate the *premium actions* (AI generation, pantry scan, ingredient/label
 * lookup, AI ordering guide) — not the free browsing/seed content.
 */
export function PremiumGate({
  feature = "This feature",
  children,
}: {
  feature?: string;
  children: React.ReactNode;
}) {
  const { premium, loading } = usePremium();
  if (loading) return null;
  if (!premium) return <Paywall feature={feature} />;
  return <>{children}</>;
}
