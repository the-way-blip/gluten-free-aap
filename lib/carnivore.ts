import type { CarnivoreLevel, Recipe } from "./types";

export const CARNIVORE_LEVELS: CarnivoreLevel[] = [
  "relaxed",
  "dairy",
  "strict",
  "lion",
];

export const CARNIVORE_LABELS: Record<CarnivoreLevel, string> = {
  lion: "Lion",
  strict: "Strict carnivore",
  dairy: "Carnivore + dairy",
  relaxed: "Relaxed",
};

export const CARNIVORE_BLURBS: Record<CarnivoreLevel, string> = {
  lion: "Ruminant meat (beef, lamb), salt & water only — the strictest elimination level.",
  strict: "All meat, poultry, fish, and eggs. No dairy, no plants.",
  dairy: "Strict carnivore plus butter, cheese, and cream.",
  relaxed: "Mostly animal-based, with seasonings, coffee, and a few low-carb extras.",
};

// ---- Ingredient keyword groups (lowercased substring match) ----

const RUMINANT = [
  "beef", "steak", "ribeye", "rib eye", "sirloin", "brisket", "chuck",
  "lamb", "bison", "venison", "goat", "veal", "mutton", "ground beef",
  "burger patty", "short rib",
];

const OTHER_MEAT = [
  "chicken", "turkey", "duck", "pork", "bacon", "ham", "sausage",
  "pancetta", "prosciutto", "pepperoni", "salami", "ribs",
];

const SEAFOOD = [
  "fish", "salmon", "tuna", "cod", "halibut", "shrimp", "prawn", "crab",
  "lobster", "scallop", "sardine", "mackerel", "anchovy", "trout",
  "oyster", "mussel", "tilapia",
];

const EGG = ["egg"];

const ANIMAL_FAT = [
  "tallow", "lard", "suet", "schmaltz", "duck fat", "bone broth",
  "beef broth", "chicken broth", "bone marrow", "gelatin", "collagen",
];

const DAIRY = [
  "milk", "cheese", "butter", "cream", "yogurt", "mozzarella", "parmesan",
  "ricotta", "feta", "ghee", "custard", "heavy cream",
];

const SEASONING_BASIC = ["salt", "pepper", "water"];

// Allowed only at the "relaxed" level — common low-carb seasonings/extras.
const RELAXED_EXTRA = [
  "garlic", "onion", "spice", "herb", "coffee", "lemon", "lime",
  "olive oil", "avocado oil", "mustard", "hot sauce", "vinegar",
  "paprika", "cumin", "rosemary", "thyme", "basil", "parsley", "chili",
];

function matchesAny(name: string, words: string[]): boolean {
  const n = name.toLowerCase();
  return words.some((w) => n.includes(w));
}

/** Is this single ingredient allowed at the given carnivore level? */
function ingredientAllowed(
  name: string,
  level: CarnivoreLevel,
  allowDairy: boolean
): boolean {
  if (matchesAny(name, SEASONING_BASIC)) return true;
  if (matchesAny(name, ANIMAL_FAT)) return true;

  if (level === "lion") {
    return matchesAny(name, RUMINANT);
  }

  // strict / dairy / relaxed all allow the full animal-protein set
  if (
    matchesAny(name, RUMINANT) ||
    matchesAny(name, OTHER_MEAT) ||
    matchesAny(name, SEAFOOD) ||
    matchesAny(name, EGG)
  ) {
    return true;
  }

  if (allowDairy && matchesAny(name, DAIRY)) return true;
  if (level === "relaxed" && matchesAny(name, RELAXED_EXTRA)) return true;

  return false;
}

const ANY_PROTEIN = [...RUMINANT, ...OTHER_MEAT, ...SEAFOOD, ...EGG];

/**
 * A recipe is carnivore-friendly at `level` if it contains at least one
 * animal protein and every ingredient is allowed at that level.
 * `dairyAllowed` lets a dairy-free profile override the dairy/relaxed levels.
 */
export function isCarnivore(
  recipe: Recipe,
  level: CarnivoreLevel,
  dairyAllowed: boolean
): boolean {
  const hasProtein = recipe.ingredients.some((i) =>
    matchesAny(i.name, ANY_PROTEIN)
  );
  if (!hasProtein) return false;
  return recipe.ingredients.every((i) =>
    ingredientAllowed(i.name, level, dairyAllowed)
  );
}

/** Human-readable list of what's allowed/excluded, for the AI prompt. */
export function carnivorePromptText(
  level: CarnivoreLevel,
  dairyAllowed: boolean
): string {
  switch (level) {
    case "lion":
      return "CARNIVORE (Lion level): ONLY ruminant meat (beef, lamb, bison, venison), salt, and water. No poultry, pork, fish, eggs, dairy, or any plants/seasonings.";
    case "strict":
      return "CARNIVORE (strict): ONLY animal products — meat, poultry, fish, seafood, eggs, and animal fats (tallow, lard). NO dairy, NO plants, NO sugar, NO seasonings beyond salt & pepper.";
    case "dairy":
      return `CARNIVORE + dairy: ONLY animal products — meat, poultry, fish, seafood, eggs, animal fats${
        dairyAllowed ? ", and dairy (butter, cheese, cream)" : " (dairy excluded for this person)"
      }. NO plants, NO sugar.`;
    case "relaxed":
      return `RELAXED CARNIVORE: animal-products-first — meat, poultry, fish, eggs, animal fats${
        dairyAllowed ? ", dairy" : ""
      }. Small amounts of seasonings, herbs, coffee, and low-carb oils are okay. No grains, sugar, or starchy plants.`;
  }
}
