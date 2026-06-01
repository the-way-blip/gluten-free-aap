"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { useSift } from "@/lib/store";
import { START_SECTIONS, TOTAL_START_TASKS } from "@/lib/start-here";

export default function StartHerePage() {
  const { startTasks, toggleStartTask } = useSift();
  const done = startTasks.length;
  const pct = Math.round((done / TOTAL_START_TASKS) * 100);

  return (
    <div>
      <Header
        title="Start Here"
        subtitle="Your first steps, gluten-free"
      />

      <div className="space-y-5 px-5 pt-4">
        {/* Progress */}
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-grain-900">
              {done === TOTAL_START_TASKS
                ? "You're all set — nicely done! 🎉"
                : "Getting started"}
            </h2>
            <span className="text-sm font-semibold text-leaf-700">
              {done}/{TOTAL_START_TASKS}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-grain-100">
            <div
              className="h-full rounded-full bg-leaf-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            A calm, step-by-step path for eating gluten-free with ease.
            Check things off as you go — your progress saves automatically.
          </p>
        </section>

        {START_SECTIONS.map((section) => (
          <section key={section.id}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{section.emoji}</span>
              <div>
                <h2 className="font-semibold text-grain-900">{section.title}</h2>
                <p className="text-xs text-gray-500">{section.blurb}</p>
              </div>
            </div>
            <div className="card divide-y divide-grain-100">
              {section.tasks.map((task) => {
                const checked = startTasks.includes(task.id);
                return (
                  <div key={task.id} className="flex items-start gap-3 p-4">
                    <button
                      onClick={() => toggleStartTask(task.id)}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                        checked
                          ? "border-leaf-500 bg-leaf-500 text-white"
                          : "border-grain-300 bg-white"
                      }`}
                      aria-label={checked ? "Mark not done" : "Mark done"}
                    >
                      {checked && "✓"}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-medium ${
                          checked ? "text-gray-400 line-through" : "text-grain-900"
                        }`}
                      >
                        {task.title}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{task.detail}</p>
                      {task.href && (
                        <Link
                          href={task.href}
                          className="mt-1.5 inline-block text-sm font-semibold text-leaf-600"
                        >
                          {task.hrefLabel ?? "Open"} →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <p className="pb-2 text-center text-xs text-gray-400">
          Educational guidance, not medical advice. Work with your doctor or a
          dietitian for your personal care.
        </p>
      </div>
    </div>
  );
}
