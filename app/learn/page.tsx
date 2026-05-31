"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { LEARN_GUIDES } from "@/lib/learn-content";

export default function LearnPage() {
  const [open, setOpen] = useState<string | null>(LEARN_GUIDES[0].id);

  return (
    <div>
      <Header title="Learn" subtitle="Practical guides for living gluten-free" />

      <div className="space-y-3 px-5 pt-4">
        {LEARN_GUIDES.map((g) => {
          const isOpen = open === g.id;
          return (
            <div key={g.id} className="card overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : g.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-xl">
                  {g.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-grain-900">{g.title}</h2>
                  <p className="truncate text-xs text-gray-500">{g.blurb}</p>
                </div>
                <span
                  className={`shrink-0 text-gray-300 transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-grain-100 px-4 pb-4 pt-3">
                  {g.sections.map((s, i) => (
                    <div key={i}>
                      <h3 className="mb-1.5 text-sm font-semibold text-grain-900">
                        {s.heading}
                      </h3>
                      <ul className="space-y-1.5">
                        {s.points.map((p, j) => (
                          <li key={j} className="flex gap-2 text-sm text-gray-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-400" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <p className="px-2 pb-2 pt-1 text-center text-xs text-gray-400">
          Educational info, not medical advice. For diagnosis and personal
          guidance, talk to your doctor or a dietitian.
        </p>
      </div>
    </div>
  );
}
