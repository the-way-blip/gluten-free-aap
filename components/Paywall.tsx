"use client";

import Link from "next/link";
import { Doodle } from "@/components/Doodle";
import { PRICING, TRIAL_DAYS } from "@/lib/subscription";

/**
 * The locked-state screen shown when a user's free trial has ended and they
 * don't have an active subscription. Dormant until billing is enabled (Stage
 * B wires this into the access gate). Presentational only.
 */
export function Paywall({
  feature = "this feature",
  trialEnded = true,
}: {
  /** What the user was trying to reach, e.g. "AI recipe generation". */
  feature?: string;
  /** True if shown because the trial lapsed (vs. a hard premium gate). */
  trialEnded?: boolean;
}) {
  const PERKS = [
    "Unlimited AI recipe generation",
    "Pantry photo scan & meal ideas",
    "Ingredient & label lookup",
    "Personalized restaurant guidance",
    "Sync across all your devices",
  ];

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="card w-full max-w-sm p-6">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-50">
          <Doodle name="wheat" className="h-9 w-9 text-leaf-600" />
        </div>

        <h2 className="font-display text-xl font-semibold text-grain-900">
          {trialEnded ? "Your free trial has ended" : "A Premium feature"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {trialEnded
            ? `Keep using ${feature} and everything else in Sift with Premium.`
            : `${feature} is part of Sift Premium.`}
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

        <Link href="/pricing" className="btn-primary mt-4 block">
          See Premium
        </Link>
        <p className="mt-3 text-xs text-gray-400">
          {TRIAL_DAYS}-day free trial · cancel anytime
        </p>
      </div>
    </div>
  );
}
