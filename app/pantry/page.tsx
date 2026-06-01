"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { RecipeCard } from "@/components/RecipeCard";
import { CuisinePicker } from "@/components/CuisinePicker";
import { RecipeControls } from "@/components/RecipeControls";
import { RecipeSkeletonList } from "@/components/Skeletons";
import { ScanPantry } from "@/components/ScanPantry";
import { Doodle } from "@/components/Doodle";
import { COMMON_PANTRY } from "@/lib/common-foods";
import { useSift } from "@/lib/store";
import type { Cuisine, PantryLocation, Recipe, RecipeFilters } from "@/lib/types";

const LOCATIONS: { key: PantryLocation; label: string; emoji: string }[] = [
  { key: "fridge", label: "Fridge", emoji: "🧊" },
  { key: "pantry", label: "Pantry", emoji: "🥫" },
  { key: "freezer", label: "Freezer", emoji: "❄️" },
];

export default function PantryPage() {
  const { pantry, addPantryItem, removePantryItem, profile } = useSift();
  const [name, setName] = useState("");
  const [location, setLocation] = useState<PantryLocation>("fridge");

  const [cuisine, setCuisine] = useState<Cuisine>("any");
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);

  function add(n: string) {
    const v = n.trim();
    if (!v) return;
    addPantryItem(v, location);
    setName("");
  }

  function addMany(names: string[], loc: PantryLocation) {
    const existing = new Set(pantry.map((p) => p.name.toLowerCase().trim()));
    names.forEach((n) => {
      const v = n.trim();
      if (v && !existing.has(v.toLowerCase())) {
        addPantryItem(v, loc);
        existing.add(v.toLowerCase());
      }
    });
  }

  async function suggest() {
    setLoading(true);
    setMode(null);
    try {
      const res = await fetch("/api/generate-recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pantry: pantry.map((p) => p.name),
          cuisine,
          profile,
          count: 3,
          filters,
        }),
      });
      const data = await res.json();
      setRecipes(data.recipes ?? []);
      setMode(data.mode ?? null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header
        title="Pantry & Fridge"
        subtitle="Log what you have, get meal ideas"
      />

      <div className="space-y-6 px-5 pt-4">
        {/* Add item */}
        <section className="card p-4">
          <div className="mb-3 flex gap-2">
            {LOCATIONS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLocation(l.key)}
                className={`flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition ${
                  location === l.key
                    ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                    : "border-grain-200 bg-white text-gray-500"
                }`}
              >
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(name)}
              placeholder={`Add to ${location}…`}
              className="flex-1 rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
            />
            <button onClick={() => add(name)} className="btn-primary">
              Add
            </button>
          </div>
          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Quick add common items to {location}
          </p>
          <div className="space-y-3">
            {COMMON_PANTRY.map((group) => {
              const remaining = group.items.filter(
                (q) =>
                  !pantry.some(
                    (p) => p.name.toLowerCase() === q.toLowerCase()
                  )
              );
              if (remaining.length === 0) return null;
              return (
                <div key={group.category}>
                  <p className="mb-1.5 text-xs font-medium text-gray-500">
                    {group.emoji} {group.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {remaining.map((q) => (
                      <button
                        key={q}
                        onClick={() => add(q)}
                        className="chip border border-grain-200 bg-white text-gray-600 hover:bg-grain-50"
                      >
                        + {q}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Snap a photo of the fridge/pantry → detect items with Claude vision */}
        <ScanPantry location={location} onAdd={addMany} />

        {/* Items */}
        {LOCATIONS.map((l) => {
          const items = pantry.filter((p) => p.location === l.key);
          if (items.length === 0) return null;
          return (
            <section key={l.key}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                {l.emoji} {l.label} ({items.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-2 rounded-full border border-grain-200 bg-white py-1.5 pl-3 pr-1.5 text-sm text-grain-800"
                  >
                    {item.name}
                    <button
                      onClick={() => removePantryItem(item.id)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-grain-100 text-gray-400 hover:bg-red-100 hover:text-red-500"
                      aria-label={`Remove ${item.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </section>
          );
        })}

        {pantry.length === 0 && (
          <div className="card flex flex-col items-center gap-2 py-10 text-center">
            <Doodle name="basket" className="h-14 w-14 text-clay-400" />
            <p className="font-semibold text-grain-900">Your pantry is empty</p>
            <p className="px-8 text-sm text-gray-500">
              Add a few ingredients above, then let Sift suggest gluten-free
              meals you can make right now.
            </p>
          </div>
        )}

        {/* Suggest */}
        <section className="card space-y-3 p-4">
          <h2 className="font-semibold text-grain-900">
            What can I make? 🍳
          </h2>
          <p className="text-sm text-gray-500">
            Pick a style (or “Surprise me”) and we'll suggest gluten-free meals
            using your ingredients.
          </p>
          <CuisinePicker value={cuisine} onChange={setCuisine} />
          <RecipeControls filters={filters} onChange={setFilters} />
          <button
            onClick={suggest}
            disabled={loading || pantry.length === 0}
            className="btn-primary w-full"
          >
            {loading
              ? "Finding meals…"
              : pantry.length === 0
              ? "Add ingredients first"
              : "Suggest meals from my pantry"}
          </button>
        </section>

        {loading && recipes.length === 0 && (
          <RecipeSkeletonList count={3} caption="Finding meals from your pantry…" />
        )}

        {recipes.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                Made for your pantry
              </h2>
              {mode === "fallback" && (
                <span className="chip bg-grain-100 text-grain-600">
                  sample mode
                </span>
              )}
            </div>
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
