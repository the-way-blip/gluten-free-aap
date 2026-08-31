"use client";

import { useState } from "react";
import Link from "next/link";
import { Doodle } from "@/components/Doodle";
import { PRICING, TRIAL_DAYS } from "@/lib/subscription";
import { usePremium } from "@/components/PremiumProvider";

/**
 * The locked-state screen shown (inside the native iOS app) when a user without
 * an active subscription reaches a Premium feature. Drives real StoreKit
 * purchases via usePremium(); on the web it shows the plan info with the
 * "free while in early access" note (billing there is off).
 */
export function Paywall({
  feature = "this feature",
  trialEnded = false,
}: {
  feature?: string;
  trialEnded?: boolean;
}) {
  const { billingActive, products, purchase, restore } = usePremium();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const PERKS = [
    "Import any recipe (links, TikTok, Instagram) — made gluten-free",
    "Unlimited AI recipe generation",
    "Pantry photo scan & meal ideas",
    "Ingredient & label lookup",
    "Personalized restaurant guidance",
    "Save recipes & safe spots",
  ];

  // Prefer live App Store products; fall back to the static pricing on web.
  const monthly = products.find((p) => p.id === "sift_premium_monthly");
  const yearly = products.find((p) => p.id === "sift_premium_yearly");

  async function buy(productId: string) {
    setNote(null);
    setBusy(productId);
    try {
      const result = await purchase(productId);
      if (result.status === "cancelled") setNote(null);
      else if (result.status === "pending")
        setNote("Your purchase is pending approval.");
      else if (!result.premium && result.status !== "purchased")
        setNote("Couldn't complete the purchase. Please try again.");
    } catch {
      setNote("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onRestore() {
    setNote(null);
    setBusy("restore");
    try {
      const ok = await restore();
      if (!ok) setNote("No previous purchase found on this Apple ID.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="card w-full max-w-sm p-6">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-50">
          <Doodle name="wheat" className="h-9 w-9 text-leaf-600" />
        </div>

        <h2 className="font-display text-xl font-semibold text-grain-900">
          {trialEnded ? "Your free trial has ended" : "Unlock Sift Premium"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {trialEnded
            ? `Keep using ${feature} and everything else in Sift.`
            : `${feature} is part of Sift Premium — free for your first ${TRIAL_DAYS} days.`}
        </p>

        <ul className="mt-4 space-y-2 text-left">
          {PERKS.map((p) => (
            <li
              key={p}
              className="flex items-start gap-2.5 text-sm text-gray-700"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-xs text-leaf-700">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>

        {billingActive ? (
          <div className="mt-5 space-y-2">
            <div className="rounded-2xl border-2 border-leaf-600 bg-leaf-50/60 p-3">
              <div className="mb-2 flex items-center justify-center gap-2">
                <span className="rounded-full bg-leaf-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                  Best value
                </span>
                <span className="text-xs font-bold text-leaf-700">Save 35%</span>
              </div>
              <div className="mb-2 text-center">
                <span className="font-display text-2xl font-semibold text-grain-900">
                  $3.25
                </span>
                <span className="text-sm text-gray-500">/month</span>
                <div className="text-[11px] text-gray-500">
                  billed {yearly ? yearly.displayPrice : "$39"} once a year
                </div>
              </div>
              <button
                disabled={busy !== null}
                onClick={() => buy("sift_premium_yearly")}
                className="btn-primary block w-full disabled:opacity-60"
              >
                {busy === "sift_premium_yearly"
                  ? "Starting…"
                  : `Start my ${TRIAL_DAYS}-day free trial`}
              </button>
            </div>
            <button
              disabled={busy !== null}
              onClick={() => buy("sift_premium_monthly")}
              className="block w-full py-1.5 text-center text-xs font-semibold text-gray-500 underline disabled:opacity-60"
            >
              {busy === "sift_premium_monthly"
                ? "Starting…"
                : `or ${monthly ? monthly.displayPrice : "$4.99"}/month — also with a free week`}
            </button>
            <button
              disabled={busy !== null}
              onClick={onRestore}
              className="mt-1 text-xs text-gray-500 underline disabled:opacity-60"
            >
              {busy === "restore" ? "Restoring…" : "Restore purchases"}
            </button>
            {note && <p className="text-xs text-clay-600">{note}</p>}
            <p className="pt-1 text-[11px] leading-relaxed text-gray-400">
              {TRIAL_DAYS}-day free trial, then auto-renews until cancelled.
              Cancel anytime in Settings. Payment is charged to your Apple ID.
            </p>
            <p className="pt-1 text-[11px] text-gray-400">
              <Link href="/legal/terms" className="underline">
                Terms of Use (EULA)
              </Link>{" "}
              ·{" "}
              <Link href="/legal/privacy" className="underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-xl bg-grain-50 p-3 text-sm text-grain-700">
              <span className="font-semibold text-grain-900">
                {PRICING.monthly.amount}
              </span>
              {PRICING.monthly.period} ·{" "}
              <span className="font-semibold text-grain-900">
                {PRICING.yearly.amount}
              </span>
              {PRICING.yearly.period}{" "}
              <span className="text-clay-600">({PRICING.yearly.note})</span>
            </div>
            <div className="mt-3 rounded-xl border border-leaf-200 bg-leaf-50 p-3 text-xs text-leaf-800">
              🌱 Sift is free while in early access — enjoy everything, no card
              required.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
