"use client";

import { useEffect, useState } from "react";
import { usePremium } from "@/components/PremiumProvider";
import { TRIAL_DAYS } from "@/lib/subscription";

const DISMISS_KEY = "sift.trialBannerDismissed";

/**
 * Home-screen nudge for the free Premium trial, so it's visible instead of
 * hidden behind a gated tap. Shows only inside the native app when billing is
 * active and the user isn't Premium yet; dismissible and remembered.
 */
export function TrialBanner() {
  const { billingActive, premium, requirePremium } = usePremium();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      // Dismissal expires after 3 days — a one-time × shouldn't hide the
      // trial forever from someone who installed on day one and never saw it.
      const raw = window.localStorage.getItem(DISMISS_KEY);
      const ts = raw ? Number(raw) : 0;
      setDismissed(!!ts && Date.now() - ts < 3 * 24 * 60 * 60 * 1000);
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!billingActive || premium || dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-leaf-600 to-leaf-700 p-5 text-white shadow-lg">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white/90"
      >
        ×
      </button>
      <div className="text-xs font-semibold uppercase tracking-wide text-white/80">
        ✨ Sift Premium
      </div>
      <h2 className="mt-1 font-display text-xl font-semibold">
        Try Premium free for {TRIAL_DAYS} days
      </h2>
      <p className="mt-1 text-sm text-white/85">
        Import any recipe & make it gluten-free, unlimited AI recipes, label
        checks, and personalized restaurant guides — free for a week, cancel
        anytime.
      </p>
      <button
        onClick={() => requirePremium("Sift Premium")}
        className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-bold text-leaf-700"
      >
        Start my free trial →
      </button>
    </div>
  );
}
