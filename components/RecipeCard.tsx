"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/types";
import { useSift } from "@/lib/store";
import { scaleQuantity } from "@/lib/scale";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const {
    saveRecipe,
    unsaveRecipe,
    isSaved,
    addShoppingItems,
    pantry,
    markRecipeViewed,
  } = useSift();

  const saved = isSaved(recipe.id);

  // Servings scaler — defaults to the recipe's own serving count.
  const baseServings = recipe.servings || 1;
  const [servings, setServings] = useState(baseServings);
  const factor = servings / baseServings;

  // Determine which ingredients the user is missing (not in pantry).
  const haveNames = new Set(pantry.map((p) => p.name.toLowerCase().trim()));
  const missing = recipe.ingredients.filter((i) => {
    if (i.haveIt) return false;
    return ![...haveNames].some(
      (h) =>
        i.name.toLowerCase().includes(h) || h.includes(i.name.toLowerCase())
    );
  });

  const [added, setAdded] = useState(false);
  function addMissing() {
    addShoppingItems(
      missing.map((i) => ({
        name: i.name,
        quantity: scaleQuantity(i.quantity, factor),
        fromRecipe: recipe.title,
      }))
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) markRecipeViewed(recipe);
        }}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-semibold text-grain-900">{recipe.title}</h3>
            {recipe.source === "ai" && (
              <span className="chip bg-leaf-50 text-leaf-700">AI</span>
            )}
            {recipe.difficulty && (
              <span className="chip bg-clay-100 capitalize text-clay-700">
                {recipe.difficulty}
              </span>
            )}
            {recipe.dairyFree && (
              <span className="chip bg-sage-100 text-sage-700">🥛 DF</span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{recipe.description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
            <span>⏱ {recipe.time} min</span>
            <span>·</span>
            <span>🍽 {recipe.servings} servings</span>
            <span>·</span>
            <span className="capitalize">{recipe.cuisine}</span>
          </div>
        </div>
        <span
          className={`mt-1 shrink-0 text-gray-300 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-grain-100 px-4 pb-4 pt-3">
          <div className="rounded-xl bg-leaf-50 p-3 text-sm text-leaf-800">
            <span className="font-semibold">Why it's safe: </span>
            {recipe.glutenFreeNote}
          </div>

          <div className="mb-2 mt-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-grain-900">Ingredients</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Servings</span>
              <div className="flex items-center gap-1 rounded-full border border-grain-200 bg-white">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  disabled={servings <= 1}
                  aria-label="Fewer servings"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-grain-600 disabled:opacity-30"
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold text-grain-900">
                  {servings}
                </span>
                <button
                  onClick={() => setServings((s) => Math.min(99, s + 1))}
                  disabled={servings >= 99}
                  aria-label="More servings"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-grain-600 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          {servings !== baseServings && (
            <p className="mb-2 text-xs text-clay-600">
              Scaled from {baseServings} → {servings} servings
            </p>
          )}
          <ul className="space-y-1.5 text-sm">
            {recipe.ingredients.map((ing, i) => {
              const has =
                ing.haveIt ||
                [...haveNames].some(
                  (h) =>
                    ing.name.toLowerCase().includes(h) ||
                    h.includes(ing.name.toLowerCase())
                );
              return (
                <li key={i} className="flex items-center gap-2">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      has ? "bg-leaf-500" : "bg-grain-300"
                    }`}
                  />
                  <span className="text-gray-700">{ing.name}</span>
                  <span className="text-gray-400">
                    — {scaleQuantity(ing.quantity, factor)}
                  </span>
                  {has && (
                    <span className="ml-auto text-xs text-leaf-600">
                      have it
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <h4 className="mb-2 mt-4 text-sm font-semibold text-grain-900">
            Steps
          </h4>
          <ol className="space-y-2 text-sm text-gray-700">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grain-100 text-xs font-semibold text-grain-700">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => (saved ? unsaveRecipe(recipe.id) : saveRecipe(recipe))}
              className={saved ? "btn-secondary flex-1" : "btn-primary flex-1"}
            >
              {saved ? "★ Saved" : "☆ Save"}
            </button>
            <button
              onClick={addMissing}
              disabled={missing.length === 0}
              className="btn-secondary flex-1"
            >
              {added
                ? "Added!"
                : missing.length === 0
                ? "Have everything"
                : `+ ${missing.length} to list`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
