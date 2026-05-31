"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSift } from "@/lib/store";
import { summarizeProfile, STRICTNESS_LABELS } from "@/lib/profile";

export default function HomePage() {
  const { ready, profile, pantry, shopping, saved, startTasks } = useSift();
  const router = useRouter();

  // First run → onboarding.
  useEffect(() => {
    if (ready && !profile) router.replace("/onboarding");
  }, [ready, profile, router]);

  if (!ready || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-grain-400">Loading Sift…</div>
      </div>
    );
  }

  const checkedCount = shopping.filter((s) => s.checked).length;

  return (
    <div>
      <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-sage-600 via-leaf-600 to-leaf-700 px-5 pb-9 pt-10 text-white">
        {/* Hand-painted botanical wash */}
        <svg
          className="pointer-events-none absolute -right-6 -top-4 h-44 w-44 text-white/10"
          viewBox="0 0 100 100"
          fill="currentColor"
          aria-hidden
        >
          <path d="M50 8c-9 14-9 28 0 42 9-14 9-28 0-42z" />
          <path d="M50 30c-12 8-18 20-16 36 13-7 19-19 16-36z" />
          <path d="M50 30c12 8 18 20 16 36-13-7-19-19-16-36z" />
          <rect x="48.5" y="50" width="3" height="40" rx="1.5" />
        </svg>
        <span
          className="pointer-events-none absolute bottom-3 left-6 h-10 w-10 rounded-full bg-clay-300/20 blur-md"
          aria-hidden
        />
        <div className="relative flex items-center justify-between text-leaf-100">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="text-sm font-bold tracking-[0.18em]">SIFT</span>
          </div>
          <Link href="/settings" aria-label="Settings" className="rounded-full p-1.5 transition hover:bg-white/15">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        </div>
        <h1 className="relative mt-4 text-3xl font-semibold leading-tight">
          {greeting()}.
        </h1>
        <p className="relative mt-1 text-leaf-50">{summarizeProfile(profile)}</p>
        <div className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-clay-200" />
          {STRICTNESS_LABELS[profile.strictness].split(" — ")[0]} mode
        </div>
      </header>

      <main className="space-y-6 px-5 pt-6">
        {startTasks.length < 5 && (
          <Link
            href="/start-here"
            className="card flex items-center gap-3 border-leaf-200 bg-leaf-50 p-4 transition active:scale-[.99]"
          >
            <span className="text-2xl">🌱</span>
            <div className="flex-1">
              <div className="font-semibold text-leaf-800">New to gluten-free?</div>
              <div className="text-xs text-leaf-700">
                Start Here — a calm, step-by-step first-week guide
              </div>
            </div>
            <span className="text-leaf-600">→</span>
          </Link>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Jump in
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              href="/pantry"
              title="What can I make?"
              desc="Cook from your pantry"
              accent="bg-leaf-50 text-leaf-700"
              emoji="🥘"
            />
            <ActionCard
              href="/recipes"
              title="Find recipes"
              desc="Browse & generate"
              accent="bg-grain-100 text-grain-800"
              emoji="📖"
            />
            <ActionCard
              href="/restaurants"
              title="Eating out"
              desc="Graded for you"
              accent="bg-orange-50 text-orange-700"
              emoji="🍴"
            />
            <ActionCard
              href="/shopping-list"
              title="Shopping list"
              desc={`${shopping.length} items`}
              accent="bg-blue-50 text-blue-700"
              emoji="🛒"
            />
            <ActionCard
              href="/planner"
              title="Plan my week"
              desc="Meals + auto shopping list"
              accent="bg-rose-50 text-rose-700"
              emoji="🗓️"
            />
            <ActionCard
              href="/check"
              title="Is it gluten-free?"
              desc="Scan a label, barcode, or look it up"
              accent="bg-purple-50 text-purple-700"
              emoji="🔍"
            />
            <ActionCard
              href="/journal"
              title="Reaction journal"
              desc="Track & spot patterns"
              accent="bg-pink-50 text-pink-700"
              emoji="📓"
            />
            <ActionCard
              href="/learn"
              title="Learn"
              desc="Guides & getting started"
              accent="bg-amber-50 text-amber-700"
              emoji="📚"
              wide
            />
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <Stat label="Pantry" value={pantry.length} href="/pantry" />
          <Stat label="Saved" value={saved.length} href="/recipes" />
          <Stat
            label="To buy"
            value={shopping.length - checkedCount}
            href="/shopping-list"
          />
        </section>

        <section className="card p-5">
          <h3 className="font-semibold text-grain-900">Your safety profile</h3>
          <p className="mt-1 text-sm text-gray-600">
            {summarizeProfile(profile)} This shapes your recipe filtering and
            restaurant grades.
          </p>
          <Link
            href="/settings"
            className="btn-secondary mt-4 w-full"
          >
            Update my profile
          </Link>
        </section>

        <div className="pt-2 text-center text-xs text-gray-400">
          Sift is a prototype. Always confirm with restaurant staff and labels.
        </div>
      </main>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function ActionCard({
  href,
  title,
  desc,
  accent,
  emoji,
  wide,
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
  emoji: string;
  wide?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card p-4 transition active:scale-[.98] ${
        wide ? "col-span-2 flex items-center gap-3" : ""
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
          wide ? "" : "mb-3"
        } ${accent}`}
      >
        {emoji}
      </div>
      <div>
        <div className="font-semibold text-grain-900">{title}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="card flex flex-col items-center py-4">
      <span className="text-2xl font-bold text-leaf-700">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </Link>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h14l-1 6a6 6 0 0 1-12 0z" /><path d="M8 4V2.5M12 4V2.5M16 4V2.5" /><path d="M9 16v4M15 16v4M7 20h10" />
    </svg>
  );
}
