"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Doodle } from "@/components/Doodle";
import { useSift } from "@/lib/store";
import type { Recipe } from "@/lib/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PlannerPage() {
  const {
    mealPlan,
    saved,
    addToPlan,
    removeFromPlan,
    clearPlan,
    pantry,
    addShoppingItems,
  } = useSift();

  const [pickingDay, setPickingDay] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const byDay = useMemo(() => {
    const map: Record<string, typeof mealPlan> = {};
    for (const d of DAYS) map[d] = [];
    for (const m of mealPlan) (map[m.day] ??= []).push(m);
    return map;
  }, [mealPlan]);

  // Consolidate every missing ingredient across all planned meals.
  const missing = useMemo(() => {
    const have = new Set(pantry.map((p) => p.name.toLowerCase().trim()));
    const seen = new Map<string, { name: string; quantity?: string; from: string }>();
    for (const m of mealPlan) {
      for (const ing of m.recipe.ingredients) {
        const key = ing.name.toLowerCase().trim();
        const inPantry =
          ing.haveIt ||
          [...have].some((h) => key.includes(h) || h.includes(key));
        if (inPantry || seen.has(key)) continue;
        seen.set(key, {
          name: ing.name,
          quantity: ing.quantity,
          from: m.recipe.title,
        });
      }
    }
    return [...seen.values()];
  }, [mealPlan, pantry]);

  function buildList() {
    if (missing.length === 0) return;
    addShoppingItems(
      missing.map((m) => ({
        name: m.name,
        quantity: m.quantity,
        fromRecipe: m.from,
      }))
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <Header
        title="Meal Planner"
        subtitle="Plan your week, then build one shopping list"
        right={
          mealPlan.length > 0 ? (
            <button onClick={clearPlan} className="text-sm font-medium text-leaf-600">
              Clear
            </button>
          ) : undefined
        }
      />

      <div className="space-y-4 px-5 pt-4">
        {saved.length === 0 && (
          <div className="card flex flex-col items-center gap-2 py-8 text-center">
            <Doodle name="wheat" className="h-14 w-14 text-clay-400" />
            <p className="font-semibold text-grain-900">Save some recipes first</p>
            <p className="px-8 text-sm text-gray-500">
              Star recipes you like, then come back here to drop them onto days of
              the week.
            </p>
          </div>
        )}

        {DAYS.map((day) => (
          <section key={day} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold text-grain-900">{dayLabel(day)}</h2>
              <button
                onClick={() => setPickingDay(day)}
                disabled={saved.length === 0}
                className="text-sm font-semibold text-leaf-600 disabled:text-gray-300"
              >
                + Add meal
              </button>
            </div>
            {byDay[day].length === 0 ? (
              <p className="text-sm text-gray-400">Nothing planned</p>
            ) : (
              <div className="space-y-2">
                {byDay[day].map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-xl border border-grain-100 p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-grain-900">
                        {m.recipe.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        ⏱ {m.recipe.time} min · {m.recipe.ingredients.length} ingredients
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromPlan(m.id)}
                      className="text-gray-300 hover:text-red-400"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {mealPlan.length > 0 && (
          <section className="card space-y-3 p-4">
            <h2 className="font-semibold text-grain-900">
              Shopping for the week 🛒
            </h2>
            <p className="text-sm text-gray-500">
              {missing.length === 0
                ? "You already have everything for these meals!"
                : `${missing.length} ingredients across ${mealPlan.length} meals aren't in your pantry.`}
            </p>
            <button
              onClick={buildList}
              disabled={missing.length === 0}
              className="btn-primary w-full"
            >
              {added
                ? "Added to your list!"
                : missing.length === 0
                ? "Nothing to buy"
                : `Add ${missing.length} items to shopping list`}
            </button>
          </section>
        )}
      </div>

      {/* Recipe picker sheet */}
      {pickingDay && (
        <PickerSheet
          day={pickingDay}
          recipes={saved}
          onPick={(r) => {
            addToPlan(pickingDay, r);
            setPickingDay(null);
          }}
          onClose={() => setPickingDay(null)}
        />
      )}
    </div>
  );
}

function PickerSheet({
  day,
  recipes,
  onPick,
  onClose,
}: {
  day: string;
  recipes: Recipe[];
  onPick: (r: Recipe) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="max-h-[70vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-grain-900">Add to {dayLabel(day)}</h3>
          <button onClick={onClose} className="text-gray-400">
            ✕
          </button>
        </div>
        <div className="space-y-2 pb-4">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => onPick(r)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-grain-200 p-3 text-left transition active:scale-[.99]"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-grain-900">{r.title}</div>
                <div className="text-xs text-gray-400">
                  ⏱ {r.time} min · {r.cuisine}
                </div>
              </div>
              <span className="shrink-0 font-bold text-leaf-600">+</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function dayLabel(d: string): string {
  const map: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };
  return map[d] ?? d;
}
