import Link from "next/link";
import type { Metadata } from "next";
import { PUBLIC_RECIPES, recipeSlug, cuisineLabel } from "@/lib/recipe-pages";
import { breadcrumbLd } from "@/lib/seo";
import { GuideCta, JsonLd } from "@/components/GuideCta";

export const metadata: Metadata = {
  title: "Easy Gluten-Free Recipes: Dinners, Breakfasts & Desserts | Sift",
  description:
    "Simple gluten-free recipes for every meal, from skillet dinners to desserts, each with a note on what to check so it stays gluten-free.",
  alternates: { canonical: "/gluten-free-recipes" },
};

export default function RecipesIndexPage() {
  const byCuisine = new Map<string, typeof PUBLIC_RECIPES>();
  for (const r of PUBLIC_RECIPES) {
    const list = byCuisine.get(r.cuisine) ?? [];
    list.push(r);
    byCuisine.set(r.cuisine, list);
  }
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Gluten-free recipes", path: "/gluten-free-recipes" }])} />
      <h1 className="font-display text-3xl font-semibold text-grain-900">
        Easy gluten-free recipes
      </h1>
      <p className="mt-2 text-gray-600">
        {PUBLIC_RECIPES.length} recipes that are gluten-free as written, with a
        note on each one about which labels to check.
      </p>
      {[...byCuisine.entries()].map(([c, list]) => (
        <section key={c} className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            {cuisineLabel(c)}
          </h2>
          <ul className="mt-2 space-y-1">
            {list.map((r) => (
              <li key={r.id}>
                <Link href={`/gluten-free-recipes/${recipeSlug(r)}`} className="font-semibold text-leaf-700 underline">
                  {r.title}
                </Link>
                <span className="text-sm text-gray-500"> · {r.time} min</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <GuideCta text="Have a favorite recipe that isn't gluten-free? Share the link to Sift and it suggests the swaps." />
    </main>
  );
}
