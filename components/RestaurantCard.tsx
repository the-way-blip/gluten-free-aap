"use client";

import { useState } from "react";
import type { GFProfile, MenuItem, Restaurant } from "@/lib/types";
import { gradeFor, GRADE_LABELS } from "@/lib/grading";
import { useSift } from "@/lib/store";
import { GradeBadge } from "./GradeBadge";
import { Logo } from "./Logo";

const STATUS_STYLES: Record<MenuItem["status"], { label: string; cls: string }> =
  {
    "naturally-gf": { label: "Naturally GF", cls: "bg-leaf-100 text-leaf-800" },
    "gf-menu-item": { label: "On GF menu", cls: "bg-leaf-100 text-leaf-800" },
    "gf-modifiable": {
      label: "GF if modified",
      cls: "bg-grain-100 text-grain-800",
    },
    risky: { label: "Risky", cls: "bg-red-100 text-red-700" },
  };

export function RestaurantCard({
  restaurant,
  profile,
  defaultOpen = false,
}: {
  restaurant: Restaurant;
  profile: GFProfile | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const grade = gradeFor(restaurant, profile);
  const { saveRestaurant, unsaveRestaurant, isRestaurantSaved } = useSift();
  const saved = isRestaurantSaved(restaurant.id);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <Logo domain={restaurant.domain} name={restaurant.name} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-grain-900">
            {restaurant.name}
          </h3>
          <p className="truncate text-xs text-gray-500">
            {restaurant.category}
          </p>
          <p className="mt-0.5 text-xs font-medium text-leaf-700">
            {GRADE_LABELS[grade.letter]}
          </p>
        </div>
        <GradeBadge letter={grade.letter} size="md" />
        <span
          className={`shrink-0 text-gray-300 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-grain-100 px-4 pb-4 pt-3">
          <button
            onClick={() =>
              saved
                ? unsaveRestaurant(restaurant.id)
                : saveRestaurant(restaurant)
            }
            className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition active:scale-[.99] ${
              saved
                ? "border-clay-300 bg-clay-50 text-clay-700"
                : "border-grain-200 bg-white text-grain-700"
            }`}
          >
            {saved ? "♥ Saved to my safe spots" : "♡ Save to my safe spots"}
          </button>
          <p className="text-sm text-gray-600">{restaurant.summary}</p>

          {/* Why this grade for you */}
          <div className="mt-3 rounded-xl bg-grain-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Why grade {grade.letter} for you
            </p>
            <ul className="mt-1.5 space-y-1">
              {grade.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-grain-300">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Menu */}
          <h4 className="mb-2 mt-4 text-sm font-semibold text-grain-900">
            What to look at
          </h4>
          <div className="space-y-1.5">
            {restaurant.menu.map((m, i) => {
              const s = STATUS_STYLES[m.status];
              return (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2 rounded-lg border border-grain-100 p-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-grain-900">
                      {m.name}
                    </div>
                    {m.note && (
                      <div className="text-xs text-gray-500">{m.note}</div>
                    )}
                  </div>
                  <span className={`chip shrink-0 ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Ordering tips */}
          <h4 className="mb-2 mt-4 text-sm font-semibold text-grain-900">
            How to order gluten-free here
          </h4>
          <ol className="space-y-2 text-sm text-gray-700">
            {restaurant.orderingTips.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-xs font-semibold text-leaf-700">
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
