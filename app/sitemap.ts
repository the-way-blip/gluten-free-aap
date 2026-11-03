import type { MetadataRoute } from "next";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { GLUTEN_TERMS } from "@/lib/gluten-reference";
import { slugify, SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now },
    { url: `${SITE}/download`, lastModified: now },
    { url: `${SITE}/eat`, lastModified: now },
    { url: `${SITE}/gf`, lastModified: now },
    { url: `${SITE}/learn`, lastModified: now },
    ...SEED_RESTAURANTS.map((r) => ({
      url: `${SITE}/eat/${slugify(r.name)}`,
      lastModified: now,
    })),
    ...GLUTEN_TERMS.map((t) => ({
      url: `${SITE}/gf/${slugify(t.term)}`,
      lastModified: now,
    })),
  ];
}
