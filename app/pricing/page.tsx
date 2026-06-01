"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Doodle } from "@/components/Doodle";
import { BILLING_ENABLED, PRICING, TRIAL_DAYS } from "@/lib/subscription";

const PREMIUM_FEATURES = [
  "Unlimited AI recipe generation, tuned to your strictness",
  "“What can I make?” meal ideas from your pantry",
  "Snap a photo of your pantry or fridge to add items",
  "Ingredient & label safety checker",
  "Personalized restaurant grades + AI ordering guides",
  "Save recipes & safe spots, synced across your devices",
];

export default function PricingPage() {
  return (
    <div>
      <Header title="Sift Premium" subtitle="Eat gluten-free with ease" />

      <div className="space-y-6 px-5 pt-5">
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <Doodle name="wheat" className="h-14 w-14 text-leaf-500" />
          <h2 className="font-display text-xl font-semibold text-grain-900">
            Everything you need to eat safely
          </h2>
          <p className="text-sm text-gray-500">
            Start with a {TRIAL_DAYS}-day free trial. Cancel anytime.
          </p>
        </div>

        {/* Price cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card flex flex-col items-center gap-1 border-leaf-200 bg-leaf-50 p-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
              Monthly
            </span>
            <span className="font-display text-2xl font-bold text-grain-900">
              {PRICING.monthly.amount}
            </span>
            <span className="text-xs text-gray-500">{PRICING.monthly.period}</span>
          </div>
          <div className="card relative flex flex-col items-center gap-1 border-clay-300 bg-clay-50 p-4 text-center">
            <span className="absolute -top-2 rounded-full bg-clay-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {PRICING.yearly.note}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-clay-600">
              Yearly
            </span>
            <span className="font-display text-2xl font-bold text-grain-900">
              {PRICING.yearly.amount}
            </span>
            <span className="text-xs text-gray-500">{PRICING.yearly.period}</span>
          </div>
        </div>

        {/* Feature list */}
        <ul className="space-y-2.5">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-xs text-leaf-700">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        {BILLING_ENABLED ? (
          // When billing is live, the Clerk <PricingTable /> is mounted in
          // Settings → Account; this CTA routes there to start a trial.
          <Link href="/settings" className="btn-primary block text-center">
            Start my {TRIAL_DAYS}-day free trial
          </Link>
        ) : (
          <div className="card border-leaf-200 bg-leaf-50 p-4 text-center text-sm text-leaf-800">
            🌱 Sift is currently free while in early access — enjoy everything,
            no card required.
          </div>
        )}

        <p className="pb-4 text-center text-xs text-gray-400">
          By subscribing you agree to our{" "}
          <Link href="/legal/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>
          . Sift is guidance, not medical advice —{" "}
          <Link href="/legal/disclaimer" className="underline">
            read more
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
