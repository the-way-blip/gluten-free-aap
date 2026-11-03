/**
 * Common gluten-free swaps, for the public "make any recipe gluten-free" guide.
 * Kept general on purpose; Sift's recipe import handles recipe-specific swaps.
 */
export interface Swap {
  original: string;
  swap: string;
  tip: string;
}

export const COMMON_SWAPS: Swap[] = [
  { original: "All-purpose flour (baking)", swap: "1-to-1 gluten-free flour blend", tip: "Works best in cookies, cakes, muffins and quick breads. Yeast breads need a blend made for bread." },
  { original: "Flour for thickening (gravy, sauces)", swap: "Cornstarch, arrowroot or sweet rice flour", tip: "Cornstarch thickens more than flour, so start with less and add as needed." },
  { original: "Soy sauce", swap: "Tamari or a soy sauce labeled gluten-free", tip: "Regular soy sauce is brewed with wheat." },
  { original: "Pasta", swap: "Gluten-free pasta (rice, corn or chickpea)", tip: "Cook to the low end of the time and rinse if the package says to. It goes soft fast." },
  { original: "Breadcrumbs or panko", swap: "Gluten-free panko, crushed GF crackers or crushed rice cereal", tip: "Check that the cereal is labeled gluten-free; some contain malt." },
  { original: "Flour tortillas", swap: "Corn tortillas or gluten-free wraps", tip: "Warm corn tortillas so they don't crack." },
  { original: "Couscous or bulgur", swap: "Quinoa, rice or millet", tip: "Both couscous and bulgur are wheat." },
  { original: "Barley in soups", swap: "Rice, wild rice or buckwheat groats", tip: "Buckwheat is not related to wheat and is gluten-free." },
  { original: "Regular oats", swap: "Certified gluten-free oats", tip: "Oats are usually cross-contaminated unless certified." },
  { original: "Beer (batter, chili, stew)", swap: "Gluten-free beer, hard cider or broth", tip: "Most beer is made with barley." },
  { original: "Malt vinegar", swap: "Apple cider, white or rice vinegar", tip: "Malt vinegar is barley-based; distilled vinegars are fine." },
  { original: "Teriyaki, hoisin and oyster sauce", swap: "Versions labeled gluten-free", tip: "Most bottled Asian sauces contain wheat." },
  { original: "Bouillon cubes and broth", swap: "Broth labeled gluten-free", tip: "Some contain wheat or barley-based flavorings." },
  { original: "Udon, ramen or wheat noodles", swap: "Rice noodles or 100% buckwheat soba", tip: "Many soba noodles are part wheat, so check the label." },
];

/** Dishes where gluten is the structure, so there isn't an honest swap. */
export const HARD_TO_CONVERT = [
  "Seitan (it is wheat gluten)",
  "Traditional sourdough made from a wheat starter",
  "Wheat-based ramen noodles",
];
