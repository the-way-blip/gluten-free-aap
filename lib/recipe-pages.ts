import { SEED_RECIPES } from "./seed-recipes";
import type { Recipe } from "./types";
import { slugify } from "./seo";

/** Built-in recipes published as public SEO pages (/gluten-free-recipes/[slug]). */
export const PUBLIC_RECIPES: Recipe[] = SEED_RECIPES.filter(
  (r, i, all) => all.findIndex((o) => slugify(o.title) === slugify(r.title)) === i
);

export function recipeSlug(r: Recipe): string {
  return slugify(r.title);
}

export function findRecipe(slug: string): Recipe | undefined {
  return PUBLIC_RECIPES.find((r) => recipeSlug(r) === slug);
}

export const CUISINE_LABEL: Record<string, string> = {
  american: "American",
  asian: "Asian",
  dessert: "Desserts",
  french: "French",
  indian: "Indian",
  italian: "Italian",
  mediterranean: "Mediterranean",
  mexican: "Mexican",
};

export function cuisineLabel(c: string): string {
  return CUISINE_LABEL[c] ?? c.charAt(0).toUpperCase() + c.slice(1);
}
