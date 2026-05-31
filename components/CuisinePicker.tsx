"use client";

import type { Cuisine } from "@/lib/types";

const CUISINES: { key: Cuisine; label: string; emoji: string }[] = [
  { key: "any", label: "Surprise me", emoji: "🎲" },
  { key: "italian", label: "Italian", emoji: "🍝" },
  { key: "mexican", label: "Mexican", emoji: "🌮" },
  { key: "french", label: "French", emoji: "🥖" },
  { key: "american", label: "American", emoji: "🍔" },
  { key: "asian", label: "Asian", emoji: "🥢" },
  { key: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { key: "indian", label: "Indian", emoji: "🍛" },
  { key: "dessert", label: "Dessert", emoji: "🍰" },
];

export function CuisinePicker({
  value,
  onChange,
}: {
  value: Cuisine;
  onChange: (c: Cuisine) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CUISINES.map((c) => (
        <button
          key={c.key}
          onClick={() => onChange(c.key)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition ${
            value === c.key
              ? "border-leaf-500 bg-leaf-50 text-leaf-700"
              : "border-grain-200 bg-white text-gray-600"
          }`}
        >
          <span>{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
