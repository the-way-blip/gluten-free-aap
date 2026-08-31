import Link from "next/link";
import type { Metadata } from "next";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { slugify, DOWNLOAD_PATH } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gluten-Free Restaurant Guides — What's Safe to Order | Sift",
  description:
    "Gluten-free guides for 80+ US restaurant chains: what's naturally gluten-free, what to modify, shared-fryer risks, and how to order safely with celiac.",
};

export default function EatIndexPage() {
  const byCategory = new Map<string, typeof SEED_RESTAURANTS>();
  for (const r of SEED_RESTAURANTS) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl font-semibold text-grain-900">
        Gluten-free restaurant guides
      </h1>
      <p className="mt-2 text-gray-600">
        What&apos;s safe to order at {SEED_RESTAURANTS.length}+ US chains — including
        shared-fryer risks and celiac-level ordering tips. Guidance, not medical
        advice; menus vary by location, so always confirm with staff.
      </p>
      {[...byCategory.entries()].map(([cat, list]) => (
        <section key={cat} className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{cat}</h2>
          <ul className="mt-2 space-y-1">
            {list.map((r) => (
              <li key={r.id}>
                <Link href={`/eat/${slugify(r.name)}`} className="font-semibold text-leaf-700 underline">
                  Is {r.name} gluten-free?
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="card mt-10 p-5 text-center">
        <p className="font-semibold text-grain-900">
          Get grades personalized to how careful you need to be
        </p>
        <a href={DOWNLOAD_PATH} className="btn-primary mt-3 inline-flex">
          Get Sift free for iPhone
        </a>
      </div>
    </main>
  );
}
