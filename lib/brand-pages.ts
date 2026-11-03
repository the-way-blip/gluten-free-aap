import { BRAND_CATEGORIES, GF_BRANDS, type BrandCategory } from "./gf-brands";
import { slugify } from "./seo";

/** Public SEO page copy for each brand category (/gluten-free-brands/[category]). */
export const BRAND_PAGE_LABEL: Record<BrandCategory, string> = {
  Bread: "Gluten-Free Bread",
  Pasta: "Gluten-Free Pasta",
  "Flour & baking": "Gluten-Free Flour",
  "Crackers & snacks": "Gluten-Free Crackers & Snacks",
  Cereal: "Gluten-Free Cereal",
  "Cookies & sweets": "Gluten-Free Cookies & Sweets",
  "Sauces & condiments": "Gluten-Free Sauces & Condiments",
  "Frozen & pizza": "Gluten-Free Frozen Pizza & Meals",
  "Baking mixes": "Gluten-Free Baking Mixes",
};

export function brandCategorySlug(c: BrandCategory): string {
  return slugify(c);
}

export function findBrandCategory(slug: string): BrandCategory | undefined {
  return BRAND_CATEGORIES.find((c) => brandCategorySlug(c) === slug);
}

export function brandsIn(c: BrandCategory) {
  // Certified picks first, then the rest, keeping the curated order.
  const list = GF_BRANDS.filter((b) => b.category === c);
  return [...list.filter((b) => b.certified), ...list.filter((b) => !b.certified)];
}
