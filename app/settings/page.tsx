"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { AccountSection } from "@/components/AccountSection";
import { useSift } from "@/lib/store";
import {
  REASON_LABELS,
  STRICTNESS_LABELS,
  STRICTNESS_BLURBS,
  defaultCrossContamination,
  summarizeProfile,
} from "@/lib/profile";
import {
  CARNIVORE_LEVELS,
  CARNIVORE_LABELS,
  CARNIVORE_BLURBS,
} from "@/lib/carnivore";
import { COMMON_ALLERGENS } from "@/lib/common-foods";
import type {
  CarnivoreLevel,
  CrossContaminationPrefs,
  Strictness,
} from "@/lib/types";

const STRICTNESS_LEVELS: Strictness[] = ["strict", "moderate", "relaxed"];

const CC_QUESTIONS: {
  key: keyof CrossContaminationPrefs;
  label: string;
  detail: string;
}[] = [
  { key: "sharedFryer", label: "Shared fryers OK", detail: "e.g. fries cooked in oil shared with breaded items." },
  { key: "sharedSurfaces", label: "Shared surfaces OK", detail: "Same grill or cutting board as gluten items." },
  { key: "mayContainTraces", label: "“May contain traces” OK", detail: "Packaged foods made in a facility with wheat." },
  { key: "regularOats", label: "Regular oats OK", detail: "Non-certified oats (often cross-contaminated)." },
];

export default function SettingsPage() {
  const { profile, setProfile, clearProfile } = useSift();
  const router = useRouter();
  const [customInput, setCustomInput] = useState("");

  if (!profile) {
    return (
      <div>
        <Header title="Settings" />
        <div className="px-5 pt-6">
          <p className="text-gray-500">No profile yet.</p>
          <button onClick={() => router.push("/onboarding")} className="btn-primary mt-4">
            Take the survey
          </button>
        </div>
      </div>
    );
  }

  function setStrictness(s: Strictness) {
    setProfile({ ...profile!, strictness: s, crossContamination: defaultCrossContamination(s) });
  }

  function toggle(key: keyof CrossContaminationPrefs) {
    setProfile({
      ...profile!,
      crossContamination: {
        ...profile!.crossContamination,
        [key]: !profile!.crossContamination[key],
      },
    });
  }

  const avoids = profile.otherAvoidances ?? [];
  const avoidSet = new Set(avoids.map((a) => a.toLowerCase()));
  // Custom = anything they typed that isn't one of the standard chips.
  const commonLower = new Set(COMMON_ALLERGENS.map((a) => a.toLowerCase()));
  const customAvoids = avoids.filter((a) => !commonLower.has(a.toLowerCase()));

  function toggleAvoid(item: string) {
    const exists = avoidSet.has(item.toLowerCase());
    const next = exists
      ? avoids.filter((a) => a.toLowerCase() !== item.toLowerCase())
      : [...avoids, item];
    setProfile({ ...profile!, otherAvoidances: next });
  }

  function resetAll() {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Reset everything? This clears your profile, pantry, saved recipes, meal plan, and shopping list."
      )
    ) {
      [
        "sift.pantry",
        "sift.shopping",
        "sift.savedRecipes",
        "sift.savedRestaurants",
        "sift.recentRecipes",
        "sift.mealPlan",
        "sift.reactions",
      ].forEach((k) => window.localStorage.removeItem(k));
      clearProfile();
      router.replace("/onboarding");
    }
  }

  return (
    <div>
      <Header title="Settings" subtitle="Tune your gluten-free profile" />

      <div className="space-y-6 px-5 pt-4">
        <AccountSection />

        <section className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Eating gluten-free for
          </p>
          <p className="mt-1 font-semibold text-grain-900">
            {REASON_LABELS[profile.reason]}
          </p>
          <p className="mt-2 text-sm text-gray-600">{summarizeProfile(profile)}</p>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Strictness
          </h2>
          <div className="space-y-2">
            {STRICTNESS_LEVELS.map((s) => (
              <button
                key={s}
                onClick={() => setStrictness(s)}
                className={`w-full rounded-2xl border p-4 text-left transition active:scale-[.99] ${
                  profile.strictness === s
                    ? "border-leaf-500 bg-leaf-50"
                    : "border-grain-200 bg-white"
                }`}
              >
                <div className="font-semibold text-grain-900">
                  {STRICTNESS_LABELS[s].split(" — ")[0]}
                </div>
                <div className="mt-0.5 text-sm text-gray-500">
                  {STRICTNESS_BLURBS[s]}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Cross-contamination
          </h2>
          <div className="space-y-2">
            {CC_QUESTIONS.map((q) => (
              <button
                key={q.key}
                onClick={() => toggle(q.key)}
                className="flex w-full items-start gap-3 rounded-2xl border border-grain-200 bg-white p-4 text-left transition active:scale-[.99]"
              >
                <span
                  className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                    profile.crossContamination[q.key] ? "bg-leaf-500" : "bg-grain-200"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition ${
                      profile.crossContamination[q.key] ? "translate-x-5" : ""
                    }`}
                  />
                </span>
                <span>
                  <span className="font-semibold text-grain-900">{q.label}</span>
                  <span className="mt-0.5 block text-sm text-gray-500">{q.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Other diets
          </h2>
          <button
            onClick={() => setProfile({ ...profile!, dairyFree: !profile!.dairyFree })}
            className="flex w-full items-start gap-3 rounded-2xl border border-grain-200 bg-white p-4 text-left transition active:scale-[.99]"
          >
            <span
              className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                profile.dairyFree ? "bg-leaf-500" : "bg-grain-200"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition ${
                  profile.dairyFree ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span>
              <span className="font-semibold text-grain-900">🥛 Also dairy-free</span>
              <span className="mt-0.5 block text-sm text-gray-500">
                Many celiacs are also dairy-intolerant. Turn this on to keep dairy
                out of your recipe suggestions too.
              </span>
            </span>
          </button>

          {/* Carnivore */}
          <button
            onClick={() =>
              setProfile({
                ...profile!,
                carnivore: !profile!.carnivore,
                carnivoreLevel: profile!.carnivoreLevel ?? "strict",
              })
            }
            className="mt-2 flex w-full items-start gap-3 rounded-2xl border border-grain-200 bg-white p-4 text-left transition active:scale-[.99]"
          >
            <span
              className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                profile.carnivore ? "bg-clay-500" : "bg-grain-200"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition ${
                  profile.carnivore ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span>
              <span className="font-semibold text-grain-900">🥩 Carnivore</span>
              <span className="mt-0.5 block text-sm text-gray-500">
                Animal-products-only eating, on top of gluten-free. Pick how
                strict below.
              </span>
            </span>
          </button>

          {profile.carnivore && (
            <div className="mt-2 space-y-2 rounded-2xl border border-clay-200 bg-clay-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-clay-700">
                Carnivore level
              </p>
              {CARNIVORE_LEVELS.map((lvl: CarnivoreLevel) => (
                <button
                  key={lvl}
                  onClick={() =>
                    setProfile({ ...profile!, carnivoreLevel: lvl })
                  }
                  className={`w-full rounded-xl border p-3 text-left transition active:scale-[.99] ${
                    (profile.carnivoreLevel ?? "strict") === lvl
                      ? "border-clay-500 bg-white"
                      : "border-grain-200 bg-white/60"
                  }`}
                >
                  <div className="text-sm font-semibold text-grain-900">
                    {CARNIVORE_LABELS[lvl]}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {CARNIVORE_BLURBS[lvl]}
                  </div>
                </button>
              ))}
              {profile.dairyFree && (
                <p className="px-1 text-xs text-clay-700">
                  Note: dairy-free is on, so dairy stays out even on the +dairy
                  and relaxed levels.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Other allergens / avoidances */}
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Other allergens to avoid
          </h2>
          <div className="card space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGENS.map((a) => {
                const on = avoidSet.has(a.toLowerCase());
                return (
                  <button
                    key={a}
                    onClick={() => toggleAvoid(a)}
                    className={`chip border transition ${
                      on
                        ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                        : "border-grain-200 bg-white text-gray-600"
                    }`}
                  >
                    {on ? "✓ " : "+ "}
                    {a}
                  </button>
                );
              })}
            </div>
            {customAvoids.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-grain-100 pt-3">
                {customAvoids.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full border border-grain-200 bg-white py-1 pl-3 pr-1.5 text-xs text-grain-800"
                  >
                    {a}
                    <button
                      onClick={() => toggleAvoid(a)}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-grain-100 text-gray-400 hover:bg-red-100 hover:text-red-500"
                      aria-label={`Remove ${a}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customInput.trim()) {
                    toggleAvoid(customInput.trim());
                    setCustomInput("");
                  }
                }}
                placeholder="Add your own…"
                className="flex-1 rounded-xl border border-grain-200 bg-white px-4 py-2 text-sm text-grain-900 outline-none focus:border-leaf-500"
              />
              <button
                onClick={() => {
                  if (customInput.trim()) {
                    toggleAvoid(customInput.trim());
                    setCustomInput("");
                  }
                }}
                className="btn-secondary px-3 py-2 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <button onClick={() => router.push("/onboarding")} className="btn-secondary w-full">
            Re-run the full survey
          </button>
          <button
            onClick={resetAll}
            className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Reset all my data
          </button>
        </section>

        <p className="pb-2 text-center text-xs text-gray-400">
          Changes save automatically and update your recipes and restaurant
          grades instantly.
        </p>
      </div>
    </div>
  );
}
