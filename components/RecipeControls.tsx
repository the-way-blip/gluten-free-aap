"use client";

import type { Difficulty, MealType, RecipeFilters } from "@/lib/types";

const MEAL_OPTIONS: { label: string; value: MealType | "any" }[] = [
  { label: "Any meal", value: "any" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Soup", value: "soup" },
  { label: "Side", value: "side" },
  { label: "Snack", value: "snack" },
  { label: "Dessert", value: "dessert" },
];

const TIME_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: "Any time", value: undefined },
  { label: "≤15 min", value: 15 },
  { label: "≤30 min", value: 30 },
  { label: "≤45 min", value: 45 },
];

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty | "any" }[] = [
  { label: "Any", value: "any" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Advanced", value: "advanced" },
];

const LOAD_OPTIONS: { label: string; value: "few" | "some" | "any" }[] = [
  { label: "Any", value: "any" },
  { label: "Few ingredients", value: "few" },
];

/**
 * Compact control panel for tuning recipe suggestions: how much time the user
 * has, difficulty level, ingredient load, and dairy-free.
 */
export function RecipeControls({
  filters,
  onChange,
}: {
  filters: RecipeFilters;
  onChange: (next: RecipeFilters) => void;
}) {
  function set<K extends keyof RecipeFilters>(key: K, value: RecipeFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-grain-100 bg-grain-50 p-3">
      <Row label="Meal">
        {MEAL_OPTIONS.map((o) => (
          <Pill
            key={o.value}
            active={(filters.mealType ?? "any") === o.value}
            onClick={() => set("mealType", o.value)}
          >
            {o.label}
          </Pill>
        ))}
      </Row>

      <Row label="Time to cook">
        {TIME_OPTIONS.map((o) => (
          <Pill
            key={o.label}
            active={filters.maxTime === o.value}
            onClick={() => set("maxTime", o.value)}
          >
            {o.label}
          </Pill>
        ))}
      </Row>

      <Row label="Difficulty">
        {DIFFICULTY_OPTIONS.map((o) => (
          <Pill
            key={o.value}
            active={(filters.difficulty ?? "any") === o.value}
            onClick={() => set("difficulty", o.value)}
          >
            {o.label}
          </Pill>
        ))}
      </Row>

      <Row label="Ingredients">
        {LOAD_OPTIONS.map((o) => (
          <Pill
            key={o.value}
            active={(filters.ingredientLoad ?? "any") === o.value}
            onClick={() => set("ingredientLoad", o.value)}
          >
            {o.label}
          </Pill>
        ))}
        <Pill
          active={!!filters.dairyFree}
          onClick={() => set("dairyFree", !filters.dairyFree)}
        >
          🥛 Dairy-free
        </Pill>
        <Pill
          active={!!filters.carnivore}
          onClick={() =>
            onChange({
              ...filters,
              carnivore: !filters.carnivore,
              carnivoreLevel: filters.carnivoreLevel ?? "strict",
            })
          }
        >
          🥩 Carnivore
        </Pill>
      </Row>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
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
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-leaf-500 bg-leaf-50 text-leaf-700"
          : "border-grain-200 bg-white text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
