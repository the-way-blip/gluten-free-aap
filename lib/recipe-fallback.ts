import type { Cuisine, GFProfile, Recipe, RecipeFilters } from "./types";
import { SEED_RECIPES } from "./seed-recipes";
import { carnivorePromptText, isCarnivore } from "./carnivore";

const CUISINE_LABELS: Record<Cuisine, string> = {
  any: "Any",
  italian: "Italian",
  mexican: "Mexican",
  french: "French",
  american: "American",
  asian: "Asian",
  mediterranean: "Mediterranean",
  indian: "Indian",
  dessert: "Dessert",
};

/** Rough dairy detector for the offline fallback. */
const DAIRY_WORDS = [
  "milk",
  "cheese",
  "butter",
  "cream",
  "yogurt",
  "mozzarella",
  "parmesan",
  "ricotta",
  "feta",
  "ghee",
  "custard",
];

// Nut/seed "butters" and coconut products contain a dairy keyword but are
// actually dairy-free — don't let them trip the detector.
const DAIRY_FALSE_POSITIVES = [
  "almond butter",
  "peanut butter",
  "cashew butter",
  "sunflower butter",
  "coconut butter",
  "coconut cream",
  "coconut milk",
  "nut butter",
];

export function looksDairyFree(r: Recipe): boolean {
  return !r.ingredients.some((i) => {
    const name = i.name.toLowerCase();
    if (DAIRY_FALSE_POSITIVES.some((f) => name.includes(f))) return false;
    return DAIRY_WORDS.some((d) => name.includes(d));
  });
}

/**
 * Build plausible recipe suggestions WITHOUT calling an LLM, so the
 * prototype is fully usable offline / without an API key. It reuses
 * seed recipes filtered by cuisine + the user's filters, and lightly
 * tailors them to the pantry by marking which ingredients they have.
 */
export function fallbackRecipes(
  pantry: string[],
  cuisine: Cuisine,
  profile: GFProfile | null,
  count = 3,
  filters: RecipeFilters = {}
): Recipe[] {
  const have = new Set(pantry.map((p) => p.toLowerCase().trim()));
  const wantDairyFree = filters.dairyFree || profile?.dairyFree;
  const wantCarnivore = filters.carnivore || profile?.carnivore;
  const carnLevel =
    filters.carnivoreLevel || profile?.carnivoreLevel || "strict";
  // Dairy is allowed on dairy/relaxed carnivore — unless they're dairy-free.
  const carnDairyOk =
    (carnLevel === "dairy" || carnLevel === "relaxed") && !wantDairyFree;

  const rank = (list: Recipe[]) =>
    list
      .map((r) => {
        const matches = r.ingredients.filter((i) =>
          [...have].some(
            (h) =>
              i.name.toLowerCase().includes(h) ||
              h.includes(i.name.toLowerCase())
          )
        ).length;
        return { r, matches };
      })
      .sort((a, b) => b.matches - a.matches)
      .map(({ r }) => r);

  // Apply hard filters.
  const passesFilters = (r: Recipe) => {
    if (filters.maxTime && r.time > filters.maxTime) return false;
    if (wantDairyFree && !looksDairyFree(r)) return false;
    if (wantCarnivore && !isCarnivore(r, carnLevel, carnDairyOk)) return false;
    if (
      filters.difficulty &&
      filters.difficulty !== "any" &&
      r.difficulty &&
      r.difficulty !== filters.difficulty
    )
      return false;
    if (
      filters.mealType &&
      filters.mealType !== "any" &&
      r.mealType &&
      r.mealType !== filters.mealType
    )
      return false;
    if (
      filters.ingredientLoad === "few" &&
      r.ingredients.length > 7
    )
      return false;
    return true;
  };

  let preferred =
    cuisine === "any"
      ? []
      : rank(SEED_RECIPES.filter((r) => r.cuisine === cuisine));
  // Only pad with other cuisines when the user said "any" — otherwise a
  // "Dessert" request shouldn't surface a savory main.
  let rest =
    cuisine === "any"
      ? rank(SEED_RECIPES.filter((r) => !preferred.includes(r)))
      : [];

  preferred = preferred.filter(passesFilters);
  rest = rest.filter(passesFilters);

  const seen = new Set<string>();
  let ranked = [...preferred, ...rest].filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // If a specific cuisine had nothing after filters, relax the FILTERS but keep
  // the cuisine; if still nothing, fall back to all recipes — but always honor
  // carnivore, since serving a plant dish to a carnivore eater is just wrong.
  if (ranked.length === 0 && cuisine !== "any") {
    ranked = rank(SEED_RECIPES.filter((r) => r.cuisine === cuisine));
  }
  if (ranked.length === 0) {
    ranked = rank(SEED_RECIPES);
  }
  if (wantCarnivore) {
    ranked = ranked.filter((r) => isCarnivore(r, carnLevel, carnDairyOk));
  }

  const note = profile?.strictness === "strict"
    ? " (filtered for celiac-safe, no cross-contamination)"
    : "";

  return ranked.slice(0, count).map((r) => ({
    ...r,
    id: `${r.id}-${cuisine}`,
    cuisine: r.cuisine,
    source: "seed" as const,
    dairyFree: looksDairyFree(r),
    carnivore: isCarnivore(r, "relaxed", true),
    description: r.description + note,
    ingredients: r.ingredients.map((i) => ({
      ...i,
      haveIt: [...have].some(
        (h) =>
          i.name.toLowerCase().includes(h) || h.includes(i.name.toLowerCase())
      ),
    })),
  }));
}

/** Prompt used when an Anthropic API key is configured. */
export function buildRecipePrompt(
  pantry: string[],
  cuisine: Cuisine,
  profile: GFProfile | null,
  count = 3,
  filters: RecipeFilters = {}
): string {
  const strictness = profile?.strictness ?? "relaxed";
  const cc = profile?.crossContamination;
  const ccText = cc
    ? [
        cc.sharedFryer ? "okay with shared fryers" : "must avoid shared fryers",
        cc.regularOats ? "okay with regular oats" : "needs certified GF oats only",
        cc.mayContainTraces
          ? "okay with 'may contain traces'"
          : "must avoid trace/'may contain' warnings",
      ].join("; ")
    : "general gluten-free";

  const wantDairyFree = filters.dairyFree || profile?.dairyFree;
  const wantCarnivore = filters.carnivore || profile?.carnivore;
  const carnLevel =
    filters.carnivoreLevel || profile?.carnivoreLevel || "strict";
  const carnDairyOk =
    (carnLevel === "dairy" || carnLevel === "relaxed") && !wantDairyFree;

  const constraints: string[] = [];
  if (filters.maxTime)
    constraints.push(`ready in ${filters.maxTime} minutes or less (total time)`);
  if (filters.difficulty && filters.difficulty !== "any")
    constraints.push(`${filters.difficulty} difficulty to cook`);
  if (filters.ingredientLoad === "few")
    constraints.push("short ingredient lists (about 7 ingredients or fewer)");
  if (wantDairyFree) constraints.push("completely DAIRY-FREE (no milk, cheese, butter, cream, yogurt)");
  if (wantCarnivore) constraints.push(carnivorePromptText(carnLevel, carnDairyOk));
  if (filters.mealType && filters.mealType !== "any")
    constraints.push(`suitable as a ${filters.mealType}`);

  const avoidList = [...(profile?.otherAvoidances ?? [])];
  const avoid = avoidList.length ? ` Also avoid: ${avoidList.join(", ")}.` : "";
  const constraintText = constraints.length
    ? ` The recipes MUST be: ${constraints.join("; ")}.`
    : "";

  return `Generate ${count} gluten-free recipes${
    cuisine !== "any" ? ` in ${CUISINE_LABELS[cuisine]} cuisine` : ""
  }.
The person eats gluten-free at a "${strictness}" level (${ccText}).${avoid}${constraintText}
${
  pantry.length
    ? `They have these ingredients on hand: ${pantry.join(", ")}. Prefer recipes that use as many of these as possible.`
    : "They have not listed pantry ingredients."
}

Return ONLY valid JSON, an array of ${count} objects with this exact shape:
[{
  "title": string,
  "cuisine": one of "italian"|"mexican"|"french"|"american"|"asian"|"mediterranean"|"indian",
  "description": string (one sentence),
  "time": number (minutes, total),
  "servings": number,
  "difficulty": "easy"|"medium"|"advanced",
  "mealType": "breakfast"|"lunch"|"dinner"|"side"|"snack"|"soup"|"dessert",
  "dairyFree": boolean (true if it has no dairy),
  "carnivore": boolean (true if it's animal-products-only),
  "ingredients": [{"name": string, "quantity": string}],
  "steps": [string],
  "glutenFreeNote": string (explain why it's safe at their strictness level${
    wantDairyFree ? ", and confirm it's dairy-free" : ""
  })
}]
No prose, no markdown fences — just the JSON array.`;
}
