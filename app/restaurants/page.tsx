"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { RestaurantCard } from "@/components/RestaurantCard";
import { useSift } from "@/lib/store";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { gradeFor } from "@/lib/grading";
import type { Restaurant, RestaurantSegment } from "@/lib/types";

const GRADE_ORDER = { A: 0, B: 1, C: 2, D: 3, F: 4 } as const;

const SEGMENTS: { key: RestaurantSegment | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fast-food", label: "Fast food" },
  { key: "fast-casual", label: "Fast casual" },
  { key: "sit-down", label: "Sit-down" },
  { key: "pizza", label: "Pizza" },
  { key: "cafe", label: "Cafe" },
];

// Quick grade filters so users can jump straight to places safe for them.
type GradeFilter = "all" | "A" | "AB";
const GRADE_FILTERS: { key: GradeFilter; label: string }[] = [
  { key: "all", label: "Any grade" },
  { key: "AB", label: "🟢 Safe (A & B)" },
  { key: "A", label: "⭐ Best (A only)" },
];

export default function RestaurantsPage() {
  const { profile } = useSift();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<RestaurantSegment | "all">("all");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [searchResult, setSearchResult] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);

  // Sort seed restaurants best→worst for THIS user.
  const ranked = useMemo(() => {
    return SEED_RESTAURANTS.map((r) => ({
      r,
      grade: gradeFor(r, profile).letter,
    })).sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]);
  }, [profile]);

  const filtered = ranked.filter(({ r, grade }) => {
    const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase());
    const matchesSegment = segment === "all" || r.segment === segment;
    const matchesGrade =
      gradeFilter === "all" ||
      (gradeFilter === "A" && grade === "A") ||
      (gradeFilter === "AB" && (grade === "A" || grade === "B"));
    return matchesQuery && matchesSegment && matchesGrade;
  });

  const hasLocalMatch = filtered.length > 0;

  async function searchAnywhere() {
    if (!query.trim()) return;
    setLoading(true);
    setSearchResult(null);
    setMode(null);
    try {
      const res = await fetch("/api/ordering-guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: query.trim(), profile }),
      });
      const data = await res.json();
      setSearchResult(data.restaurant ?? null);
      setMode(data.mode ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header
        title="Eating Out"
        subtitle="Grades personalized to your profile"
      />

      <div className="space-y-5 px-5 pt-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchResult(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && searchAnywhere()}
            placeholder="Search a restaurant…"
            className="flex-1 rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
          />
          <button
            onClick={searchAnywhere}
            disabled={loading || !query.trim()}
            className="btn-primary"
          >
            {loading ? "…" : "Ask AI"}
          </button>
        </div>

        <p className="-mt-2 text-xs text-gray-400">
          Grades adapt to you. A shared fryer drops a place if you avoid
          cross-contamination, but not if you don't.
        </p>

        {/* Segment filter: fast food vs sit-down, etc. */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SEGMENTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSegment(s.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                segment === s.key
                  ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                  : "border-grain-200 bg-white text-gray-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Grade filter: jump straight to places safe for this profile */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GRADE_FILTERS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGradeFilter(g.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                gradeFilter === g.key
                  ? "border-clay-500 bg-clay-50 text-clay-700"
                  : "border-grain-200 bg-white text-gray-600"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* AI search result for a place not in our DB */}
        {searchResult && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Ordering guide
              </h2>
              {mode === "fallback" && (
                <span className="chip bg-grain-100 text-grain-600">
                  general guidance
                </span>
              )}
            </div>
            <RestaurantCard
              restaurant={searchResult}
              profile={profile}
              defaultOpen
            />
          </section>
        )}

        {/* Local DB */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {query && hasLocalMatch ? "Matches" : "Graded for you"} (
            {filtered.length})
          </h2>
          {filtered.map(({ r }) => (
            <RestaurantCard key={r.id} restaurant={r} profile={profile} />
          ))}

          {!query && !hasLocalMatch && (
            <div className="card flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-2xl">🍽️</span>
              <p className="font-semibold text-grain-900">
                No places match this filter
              </p>
              <p className="px-8 text-sm text-gray-500">
                {gradeFilter !== "all"
                  ? "Try loosening the grade filter — with your cross-contamination settings, fewer chains make the cut."
                  : "Try a different category."}
              </p>
            </div>
          )}

          {query && !hasLocalMatch && !searchResult && (
            <div className="card flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-2xl">🔍</span>
              <p className="font-semibold text-grain-900">
                Not in our database yet
              </p>
              <p className="px-8 text-sm text-gray-500">
                Tap “Ask AI” to get a gluten-free ordering guide for “{query}”.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
