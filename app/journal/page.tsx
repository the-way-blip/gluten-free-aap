"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Doodle } from "@/components/Doodle";
import { useSift } from "@/lib/store";
import type { ReactionSeverity, ReactionTrigger } from "@/lib/types";

const SEVERITY: { key: ReactionSeverity; label: string; cls: string; dot: string }[] = [
  { key: "mild", label: "Mild", cls: "bg-grain-100 text-grain-700", dot: "bg-grain-400" },
  { key: "moderate", label: "Moderate", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  { key: "severe", label: "Severe", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
];

const TRIGGERS: { key: ReactionTrigger; label: string }[] = [
  { key: "gluten", label: "Gluten" },
  { key: "dairy", label: "Dairy" },
  { key: "both", label: "Both" },
  { key: "unsure", label: "Unsure" },
];

const TRIGGER_CHIP: Record<ReactionTrigger, string> = {
  gluten: "bg-amber-100 text-amber-700",
  dairy: "bg-blue-100 text-blue-700",
  both: "bg-purple-100 text-purple-700",
  unsure: "bg-grain-100 text-grain-600",
};

const SYMPTOM_OPTIONS = [
  "Bloating",
  "Stomach pain",
  "Diarrhea",
  "Nausea",
  "Fatigue",
  "Brain fog",
  "Headache",
  "Joint pain",
  "Skin rash",
  "Anxiety/mood",
];

export default function JournalPage() {
  const { reactions, addReaction, removeReaction } = useSift();
  const [open, setOpen] = useState(false);

  // Quick insight: most common suspected foods.
  const topFoods = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of reactions) {
      const f = r.suspectedFood.trim().toLowerCase();
      if (f) counts.set(f, (counts.get(f) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [reactions]);

  return (
    <div>
      <Header
        title="Reaction Journal"
        subtitle="Track reactions to spot patterns"
        right={
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-leaf-600 px-3 py-2 text-sm font-semibold text-white"
          >
            + Log
          </button>
        }
      />

      <div className="space-y-4 px-5 pt-4">
        {topFoods.length > 0 && (
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-grain-900">
              Possible patterns 🔎
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Foods you've linked to reactions more than once:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {topFoods.map(([food, n]) => (
                <span key={food} className="chip bg-orange-100 capitalize text-orange-700">
                  {food} ×{n}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Not a diagnosis — share patterns like these with your doctor.
            </p>
          </section>
        )}

        {reactions.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 py-12 text-center">
            <Doodle name="leaf" className="h-14 w-14 text-clay-400" />
            <p className="font-semibold text-grain-900">No entries yet</p>
            <p className="px-8 text-sm text-gray-500">
              If you have a reaction, log it here with what you suspect caused
              it. Over time, Sift highlights repeat offenders.
            </p>
            <button onClick={() => setOpen(true)} className="btn-primary mt-2">
              Log a reaction
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reactions.map((r) => {
              const sev = SEVERITY.find((s) => s.key === r.severity)!;
              return (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`chip ${sev.cls}`}>
                          <span className={`mr-1 inline-block h-2 w-2 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                        {r.trigger && (
                          <span className={`chip capitalize ${TRIGGER_CHIP[r.trigger]}`}>
                            {r.trigger === "both" ? "Gluten + Dairy" : r.trigger}
                          </span>
                        )}
                        <span className="text-sm text-gray-400">{formatDate(r.date)}</span>
                      </div>
                      <p className="mt-2 font-medium capitalize text-grain-900">
                        {r.suspectedFood || "Unknown trigger"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeReaction(r.id)}
                      className="text-gray-300 hover:text-red-400"
                      aria-label="Delete entry"
                    >
                      ×
                    </button>
                  </div>
                  {r.symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.symptoms.map((s) => (
                        <span key={s} className="chip bg-grain-50 text-grain-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.notes && (
                    <p className="mt-2 text-sm text-gray-500">{r.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="pb-2 text-center text-xs text-gray-400">
          This journal is for your own tracking and isn't medical advice.
        </p>
      </div>

      {open && (
        <LogSheet
          onClose={() => setOpen(false)}
          onSave={(entry) => {
            addReaction(entry);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LogSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (entry: {
    date: string;
    severity: ReactionSeverity;
    trigger: ReactionTrigger;
    symptoms: string[];
    suspectedFood: string;
    notes?: string;
  }) => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [severity, setSeverity] = useState<ReactionSeverity>("moderate");
  const [trigger, setTrigger] = useState<ReactionTrigger>("gluten");
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set());
  const [food, setFood] = useState("");
  const [notes, setNotes] = useState("");

  function toggleSymptom(s: string) {
    setSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-grain-900">Log a reaction</h3>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <label className="mb-1 block text-sm font-medium text-grain-900">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-4 w-full rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
        />

        <label className="mb-1 block text-sm font-medium text-grain-900">Severity</label>
        <div className="mb-4 flex gap-2">
          {SEVERITY.map((s) => (
            <button
              key={s.key}
              onClick={() => setSeverity(s.key)}
              className={`flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition ${
                severity === s.key
                  ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                  : "border-grain-200 bg-white text-gray-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium text-grain-900">
          Reaction to
        </label>
        <div className="mb-4 flex gap-2">
          {TRIGGERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTrigger(t.key)}
              className={`flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition ${
                trigger === t.key
                  ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                  : "border-grain-200 bg-white text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-sm font-medium text-grain-900">Symptoms</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((s) => {
            const on = symptoms.has(s);
            return (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`chip border transition ${
                  on
                    ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                    : "border-grain-200 bg-white text-gray-500"
                }`}
              >
                {on ? "✓ " : ""}
                {s}
              </button>
            );
          })}
        </div>

        <label className="mb-1 block text-sm font-medium text-grain-900">
          Suspected food / source
        </label>
        <input
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="e.g. shared-fryer fries, soy sauce…"
          className="mb-4 w-full rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
        />

        <label className="mb-1 block text-sm font-medium text-grain-900">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything else worth remembering…"
          className="mb-5 w-full resize-none rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-sm text-grain-900 outline-none focus:border-leaf-500"
        />

        <button
          onClick={() =>
            onSave({
              date,
              severity,
              trigger,
              symptoms: [...symptoms],
              suspectedFood: food.trim(),
              notes: notes.trim() || undefined,
            })
          }
          className="btn-primary w-full"
        >
          Save entry
        </button>
      </div>
    </div>
  );
}

function todayISO(): string {
  // Avoid Date.now timezone surprises by using local parts.
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
