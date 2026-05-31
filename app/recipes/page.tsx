"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { RecipeCard } from "@/components/RecipeCard";
import { CuisinePicker } from "@/components/CuisinePicker";
import { RecipeControls } from "@/components/RecipeControls";
import { Doodle } from "@/components/Doodle";
import { useSift } from "@/lib/store";
import { SEED_RECIPES } from "@/lib/seed-recipes";
import { isCarnivore } from "@/lib/carnivore";
import { looksDairyFree as recipeLooksDairyFree } from "@/lib/recipe-fallback";
import type { Cuisine, Recipe, RecipeFilters } from "@/lib/types";

type Tab = "discover" | "saved";

export default function RecipesPage() {
  const { profile, saved } = useSift();
  const [tab, setTab] = useState<Tab>("discover");
  const [cuisine, setCuisine] = useState<Cuisine>("any");
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [generated, setGenerated] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setMode(null);
    try {
      const res = await fetch("/api/generate-recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pantry: [], cuisine, profile, count: 3, filters }),
      });
      const data = await res.json();
      setGenerated(data.recipes ?? []);
      setMode(data.mode ?? null);
    } finally {
      setLoading(false);
    }
  }

  // Browse respects the user's dietary layers so a carnivore/dairy-free eater
  // isn't shown dishes they can't eat. Filter pills override the profile.
  const wantDairyFree = filters.dairyFree || profile?.dairyFree;
  const wantCarnivore = filters.carnivore || profile?.carnivore;
  const carnLevel = filters.carnivoreLevel || profile?.carnivoreLevel || "strict";
  const carnDairyOk =
    (carnLevel === "dairy" || carnLevel === "relaxed") && !wantDairyFree;

  const browse = SEED_RECIPES.filter((r) => {
    if (cuisine !== "any" && r.cuisine !== cuisine) return false;
    if (wantDairyFree && !recipeLooksDairyFree(r)) return false;
    if (wantCarnivore && !isCarnivore(r, carnLevel, carnDairyOk)) return false;
    if (
      filters.mealType &&
      filters.mealType !== "any" &&
      r.mealType &&
      r.mealType !== filters.mealType
    )
      return false;
    if (
      filters.difficulty &&
      filters.difficulty !== "any" &&
      r.difficulty &&
      r.difficulty !== filters.difficulty
    )
      return false;
    return true;
  });

  return (
    <div>
      <Header title="Recipes" subtitle="Gluten-free, filtered to your profile" />

      <div className="px-5 pt-4">
        <div className="mb-4 flex gap-1 rounded-xl bg-grain-100 p-1">
          <TabBtn active={tab === "discover"} onClick={() => setTab("discover")}>
            Discover
          </TabBtn>
          <TabBtn active={tab === "saved"} onClick={() => setTab("saved")}>
            Saved ({saved.length})
          </TabBtn>
        </div>

        {tab === "discover" && (
          <div className="space-y-4">
            <CuisinePicker value={cuisine} onChange={setCuisine} />
            <RecipeControls filters={filters} onChange={setFilters} />

            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Cooking up ideas…" : "✨ Generate fresh recipes"}
            </button>

            {generated.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Generated for you
                  </h2>
                  {mode === "fallback" && (
                    <span className="chip bg-grain-100 text-grain-600">
                      sample mode
                    </span>
                  )}
                </div>
                {generated.map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Browse
              </h2>
              {browse.length > 0 ? (
                browse.map((r) => <RecipeCard key={r.id} recipe={r} />)
              ) : (
                <div className="card px-6 py-8 text-center text-sm text-gray-500">
                  No saved samples match these filters. Tap{" "}
                  <span className="font-semibold text-leaf-700">
                    Generate fresh recipes
                  </span>{" "}
                  above for AI ideas that fit.
                </div>
              )}
            </section>
          </div>
        )}

        {tab === "saved" && (
          <div className="space-y-3">
            {saved.length === 0 ? (
              <Empty />
            ) : (
              saved.map((r) => <RecipeCard key={r.id} recipe={r} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
        active ? "bg-white text-grain-900 shadow-sm" : "text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

function Empty() {
  return (
    <div className="card flex flex-col items-center gap-2 py-12 text-center">
      <Doodle name="bowl" className="h-14 w-14 text-clay-400" />
      <p className="font-semibold text-grain-900">No saved recipes yet</p>
      <p className="px-8 text-sm text-gray-500">
        Tap Save on any recipe to keep it here for quick access.
      </p>
    </div>
  );
}
