"use client";

import { usePathname } from "next/navigation";
import { usePremium } from "@/components/PremiumProvider";
import { useSift } from "@/lib/store";
import { TRIAL_DAYS } from "@/lib/subscription";

/**
 * Slim, always-on "unlock Premium" bar that rides just above the bottom nav on
 * every screen for signed-out-of-Premium native users. Not dismissible on
 * purpose — it's small, and it's the one constant path to the paywall.
 * Disappears the moment the user is Premium (or on web, where billing is off).
 */
export function PremiumBar() {
  const { billingActive, premium, requirePremium, paywallFeature } = usePremium();
  const { profile, ready } = useSift();
  const pathname = usePathname();

  if (!ready || !profile) return null;
  if (!billingActive || premium) return null;
  if (paywallFeature) return null; // paywall is open — don't double up
  if (pathname?.startsWith("/onboarding") || pathname?.startsWith("/legal")) return null;

  return (
    <div className="fixed inset-x-0 bottom-[86px] z-40">
      <div className="mx-auto max-w-md px-3">
        <button
          onClick={() => requirePremium("Sift Premium")}
          className="flex w-full items-center justify-between gap-2 rounded-full bg-gradient-to-r from-leaf-600 to-leaf-700 py-2 pl-4 pr-2 text-left shadow-lg active:scale-[.99]"
        >
          <span className="truncate text-[13px] font-bold text-white">
            ✨ Unlock Premium — free for {TRIAL_DAYS} days
          </span>
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-leaf-700">
            Try free
          </span>
        </button>
      </div>
    </div>
  );
}
