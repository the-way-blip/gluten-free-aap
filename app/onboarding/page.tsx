"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSift } from "@/lib/store";
import {
  defaultCrossContamination,
  defaultStrictnessFor,
  REASON_BLURBS,
  REASON_LABELS,
  STRICTNESS_BLURBS,
  STRICTNESS_LABELS,
} from "@/lib/profile";
import { COMMON_ALLERGENS } from "@/lib/common-foods";
import type {
  CrossContaminationPrefs,
  GFReason,
  Strictness,
} from "@/lib/types";

const REASONS: GFReason[] = ["celiac", "autoimmune", "sensitivity", "health"];
const STRICTNESS_LEVELS: Strictness[] = ["strict", "moderate", "relaxed"];

const CC_QUESTIONS: {
  key: keyof CrossContaminationPrefs;
  label: string;
  detail: string;
}[] = [
  {
    key: "sharedFryer",
    label: "Shared fryers are okay",
    detail:
      "e.g. fries cooked in the same oil as breaded chicken. A real issue for celiac; fine for many others.",
  },
  {
    key: "sharedSurfaces",
    label: "Shared surfaces & cookware are okay",
    detail:
      "Food prepped on the same grill or cutting board as gluten items.",
  },
  {
    key: "mayContainTraces",
    label: "“May contain traces of wheat” is okay",
    detail: "Packaged foods made in a facility that also handles wheat.",
  },
  {
    key: "regularOats",
    label: "Regular (non-GF-certified) oats are okay",
    detail: "Oats are often cross-contaminated with wheat during processing.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, profile } = useSift();

  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<GFReason | null>(
    profile?.reason ?? null
  );
  const [strictness, setStrictness] = useState<Strictness | null>(
    profile?.strictness ?? null
  );
  const [cc, setCc] = useState<CrossContaminationPrefs>(
    profile?.crossContamination ?? defaultCrossContamination("moderate")
  );
  const [avoidInput, setAvoidInput] = useState(
    (profile?.otherAvoidances ?? []).join(", ")
  );
  const [dairyFree, setDairyFree] = useState(profile?.dairyFree ?? false);
  const [carnivore, setCarnivore] = useState(profile?.carnivore ?? false);

  // Parsed view of the comma-separated avoidances, for the chip toggles.
  const avoidList = avoidInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const avoidSet = new Set(avoidList.map((s) => s.toLowerCase()));

  function toggleAvoid(item: string) {
    const exists = avoidSet.has(item.toLowerCase());
    const next = exists
      ? avoidList.filter((a) => a.toLowerCase() !== item.toLowerCase())
      : [...avoidList, item];
    setAvoidInput(next.join(", "));
  }

  const totalSteps = 4;

  function pickReason(r: GFReason) {
    setReason(r);
    const s = defaultStrictnessFor(r);
    setStrictness(s);
    setCc(defaultCrossContamination(s));
    setStep(1);
  }

  function pickStrictness(s: Strictness) {
    setStrictness(s);
    setCc(defaultCrossContamination(s));
  }

  function finish() {
    if (!reason || !strictness) return;
    setProfile({
      reason,
      strictness,
      crossContamination: cc,
      dairyFree,
      carnivore,
      carnivoreLevel: carnivore ? "strict" : undefined,
      otherAvoidances: avoidInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: Date.now(),
    });
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen flex-col px-5 pb-10 pt-10">
      {/* Hand-drawn wheat sprig — warm welcome */}
      {step === 0 && (
        <svg
          className="mx-auto mb-2 h-12 w-12 text-leaf-500"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M24 44V18" />
          <path d="M24 18c0-6 3-10 3-14-4 1-7 4-7 9M24 18c0-6-3-10-3-14 4 1 7 4 7 9" />
          <path d="M24 26c4-1 7-4 8-8-4 0-7 2-9 5M24 26c-4-1-7-4-8-8 4 0 7 2 9 5" />
          <path d="M24 34c4-1 7-4 8-8-4 0-7 2-9 5M24 34c-4-1-7-4-8-8 4 0 7 2 9 5" />
        </svg>
      )}
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${
              i <= step ? "bg-leaf-600" : "bg-grain-200"
            }`}
          />
        ))}
      </div>

      {step === 0 && (
        <Step
          eyebrow="Welcome to Sift"
          title="How careful do you need to be?"
          desc="This sets your starting point. You can fine-tune everything next."
        >
          <div className="space-y-3">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => pickReason(r)}
                className={`w-full rounded-2xl border p-4 text-left transition active:scale-[.99] ${
                  reason === r
                    ? "border-leaf-500 bg-leaf-50"
                    : "border-grain-200 bg-white hover:border-grain-300"
                }`}
              >
                <div className="font-semibold text-grain-900">
                  {REASON_LABELS[r]}
                </div>
                <div className="mt-0.5 text-sm text-gray-500">
                  {REASON_BLURBS[r]}
                </div>
              </button>
            ))}
          </div>
        </Step>
      )}

      {step === 1 && (
        <Step
          eyebrow="Step 2 of 4"
          title="How strict do you need to be?"
          desc={`Based on "${
            reason ? REASON_LABELS[reason] : ""
          }" we suggest the level below — change it if you'd like.`}
        >
          <div className="space-y-3">
            {STRICTNESS_LEVELS.map((s) => (
              <button
                key={s}
                onClick={() => pickStrictness(s)}
                className={`w-full rounded-2xl border p-4 text-left transition active:scale-[.99] ${
                  strictness === s
                    ? "border-leaf-500 bg-leaf-50"
                    : "border-grain-200 bg-white hover:border-grain-300"
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
          <NavButtons
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={!strictness}
          />
        </Step>
      )}

      {step === 2 && (
        <Step
          eyebrow="Step 3 of 4"
          title="Cross-contamination"
          desc="The most important part. Tell us what you're comfortable with — this is what makes the same restaurant safe for one person and risky for another."
        >
          <div className="space-y-3">
            {CC_QUESTIONS.map((q) => (
              <button
                key={q.key}
                onClick={() => setCc((c) => ({ ...c, [q.key]: !c[q.key] }))}
                className="flex w-full items-start gap-3 rounded-2xl border border-grain-200 bg-white p-4 text-left transition active:scale-[.99]"
              >
                <span
                  className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                    cc[q.key] ? "bg-leaf-500" : "bg-grain-200"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition ${
                      cc[q.key] ? "translate-x-5" : ""
                    }`}
                  />
                </span>
                <span>
                  <span className="font-semibold text-grain-900">
                    {q.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-500">
                    {q.detail}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </Step>
      )}

      {step === 3 && (
        <Step
          eyebrow="Step 4 of 4"
          title="Anything else to avoid?"
          desc="Optional. Add other allergies or foods you skip, comma-separated. We'll keep them out of your recipes."
        >
          <button
            onClick={() => setDairyFree((d) => !d)}
            className="mb-3 flex w-full items-start gap-3 rounded-2xl border border-grain-200 bg-white p-4 text-left transition active:scale-[.99]"
          >
            <span
              className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                dairyFree ? "bg-leaf-500" : "bg-grain-200"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition ${
                  dairyFree ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span>
              <span className="font-semibold text-grain-900">🥛 I'm also dairy-free</span>
              <span className="mt-0.5 block text-sm text-gray-500">
                Common alongside celiac. We'll keep dairy out of your recipes too.
              </span>
            </span>
          </button>
          <button
            onClick={() => setCarnivore((c) => !c)}
            className="mb-3 flex w-full items-start gap-3 rounded-2xl border border-grain-200 bg-white p-4 text-left transition active:scale-[.99]"
          >
            <span
              className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
                carnivore ? "bg-clay-500" : "bg-grain-200"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition ${
                  carnivore ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span>
              <span className="font-semibold text-grain-900">🥩 I eat carnivore</span>
              <span className="mt-0.5 block text-sm text-gray-500">
                Animal-products-only. We'll default to strict — fine-tune the
                level anytime in Settings.
              </span>
            </span>
          </button>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Common allergens — tap any you avoid
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
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
          <input
            value={avoidInput}
            onChange={(e) => setAvoidInput(e.target.value)}
            placeholder="Anything else? Type & separate with commas"
            className="w-full rounded-2xl border border-grain-200 bg-white px-4 py-3 text-grain-900 outline-none focus:border-leaf-500"
          />
          <div className="mt-6 rounded-2xl bg-leaf-50 p-4 text-sm text-leaf-800">
            <div className="font-semibold">You're all set 🎉</div>
            <p className="mt-1 text-leaf-700">
              We'll personalize recipes and restaurant grades to your profile.
              You can change any of this anytime.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={finish} className="btn-primary flex-[2]">
              Start using Sift
            </button>
          </div>
        </Step>
      )}
    </div>
  );
}

function Step({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-grain-900">
        {title}
      </h1>
      <p className="mt-2 text-gray-500">{desc}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex gap-3">
      <button onClick={onBack} className="btn-secondary flex-1">
        Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-primary flex-[2]"
      >
        Continue
      </button>
    </div>
  );
}
