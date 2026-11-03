import type { MetadataRoute } from "next";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { GLUTEN_TERMS } from "@/lib/gluten-reference";
import { slugify, SITE } from "@/lib/seo";
import { BRAND_CATEGORIES } from "@/lib/gf-brands";
import { brandCategorySlug } from "@/lib/brand-pages";
import { PUBLIC_RECIPES, recipeSlug } from "@/lib/recipe-pages";
import { LEARN_GUIDES } from "@/lib/learn-content";
import { learnSlug } from "@/lib/learn-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now },
    { url: `${SITE}/download`, lastModified: now },
    { url: `${SITE}/eat`, lastModified: now },
    { url: `${SITE}/gf`, lastModified: now },
    { url: `${SITE}/learn`, lastModified: now },
    { url: `${SITE}/learn/make-any-recipe-gluten-free`, lastModified: now },
    ...LEARN_GUIDES.map((g) => ({ url: `${SITE}/learn/${learnSlug(g)}`, lastModified: now })),
    { url: `${SITE}/gluten-free-fast-food`, lastModified: now },
    { url: `${SITE}/gluten-free-brands`, lastModified: now },
    ...BRAND_CATEGORIES.map((c) => ({
      url: `${SITE}/gluten-free-brands/${brandCategorySlug(c)}`,
      lastModified: now,
    })),
    { url: `${SITE}/gluten-free-recipes`, lastModified: now },
    ...PUBLIC_RECIPES.map((r) => ({
      url: `${SITE}/gluten-free-recipes/${recipeSlug(r)}`,
      lastModified: now,
    })),
    ...SEED_RESTAURANTS.map((r) => ({
      url: `${SITE}/eat/${slugify(r.name)}`,
      lastModified: now,
    })),
    ...GLUTEN_TERMS.map((t) => ({
      url: `${SITE}/gf/${slugify(t.term)}`,
      lastModified: now,
    })),
  ];
  // Some ingredient terms share a slug; list each URL once.
  return entries.filter((e, i, all) => all.findIndex((o) => o.url === e.url) === i);
}
