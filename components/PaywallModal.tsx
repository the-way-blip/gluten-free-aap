"use client";

import { usePremium } from "@/components/PremiumProvider";
import { Paywall } from "@/components/Paywall";

/**
 * Global paywall overlay. Shown when a gated premium action is attempted via
 * `requirePremium(feature)`. Dormant unless billing is active AND the user
 * isn't premium, so it never appears on the web/PWA.
 */
export function PaywallModal() {
  const { paywallFeature, closePaywall } = usePremium();
  if (!paywallFeature) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={closePaywall}
    >
      <div
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePaywall}
          aria-label="Close"
          className="absolute -top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg text-gray-500 shadow"
        >
          ×
        </button>
        <Paywall feature={paywallFeature} />
      </div>
    </div>
  );
}
