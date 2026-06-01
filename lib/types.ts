// ---- Core domain types for Sift ----

/** Why the user is eating gluten-free. Drives default strictness. */
export type GFReason =
  | "celiac"
  | "autoimmune" // Hashimoto's, other autoimmune
  | "sensitivity" // non-celiac gluten sensitivity
  | "health"; // general health / diet choice

/**
 * How careful the user needs to be about cross-contamination.
 * This is the single most important axis in the app: it changes
 * recipe filtering, restaurant grades, and ordering advice.
 */
export type Strictness = "strict" | "moderate" | "relaxed";

/** Individual cross-contamination tolerances the survey captures. */
export interface CrossContaminationPrefs {
  /** OK with food fried in oil shared with breaded items (e.g. fries). */
  sharedFryer: boolean;
  /** OK with food prepped on shared surfaces / cookware. */
  sharedSurfaces: boolean;
  /** OK with "may contain traces of wheat" packaged foods. */
  mayContainTraces: boolean;
  /** OK with regular (non-certified-GF) oats. */
  regularOats: boolean;
}

/**
 * Carnivore diet strictness, from most to least restrictive.
 * - lion: ruminant meat + salt + water only
 * - strict: all meat, poultry, fish, eggs, animal fats; no dairy, no plants
 * - dairy: strict + dairy (butter, cheese, cream)
 * - relaxed: mostly animal-based, allows seasonings/coffee/oils
 */
export type CarnivoreLevel = "lion" | "strict" | "dairy" | "relaxed";

export interface GFProfile {
  reason: GFReason;
  strictness: Strictness;
  crossContamination: CrossContaminationPrefs;
  /** Also avoid dairy (many celiacs are also lactose/dairy intolerant). */
  dairyFree?: boolean;
  /** Eating carnivore (animal-products-only) in addition to gluten-free. */
  carnivore?: boolean;
  /** How strict the carnivore diet is, when enabled. */
  carnivoreLevel?: CarnivoreLevel;
  /** Other allergies/avoidances to factor into recipes (free text tags). */
  otherAvoidances: string[];
  createdAt: number;
}

/** How hard a recipe is to make. */
export type Difficulty = "easy" | "medium" | "advanced";

/** Filters the user can set before generating recipe ideas. */
export interface RecipeFilters {
  /** Max total time in minutes (prep + cook). 0/undefined = any. */
  maxTime?: number;
  difficulty?: Difficulty | "any";
  /** "few" = simple/short ingredient lists, "any" = no limit. */
  ingredientLoad?: "few" | "some" | "any";
  /** Require dairy-free in addition to gluten-free. */
  dairyFree?: boolean;
  /** Require carnivore (animal-products-only) for this batch. */
  carnivore?: boolean;
  /** Carnivore strictness for this batch. */
  carnivoreLevel?: CarnivoreLevel;
  /** Restrict to a meal type (breakfast/dinner/etc). */
  mealType?: MealType | "any";
}

// ---- Pantry ----

export type PantryLocation = "pantry" | "fridge" | "freezer";

export interface PantryItem {
  id: string;
  name: string;
  location: PantryLocation;
  addedAt: number;
}

// ---- Recipes ----

export type Cuisine =
  | "any"
  | "italian"
  | "mexican"
  | "french"
  | "american"
  | "asian"
  | "mediterranean"
  | "indian"
  | "dessert";

export interface RecipeIngredient {
  name: string;
  quantity: string;
  /** True if Sift thinks the user already has this (matched against pantry). */
  haveIt?: boolean;
}

/** What part of the day / course a recipe is for. */
export type MealType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "side"
  | "snack"
  | "soup"
  | "dessert";

export interface Recipe {
  id: string;
  title: string;
  cuisine: Cuisine;
  description: string;
  /** Minutes. */
  time: number;
  servings: number;
  /** How involved it is to make. */
  difficulty?: Difficulty;
  /** Meal/course type, when known. */
  mealType?: MealType;
  ingredients: RecipeIngredient[];
  steps: string[];
  /** Why this recipe is safe for the user's strictness level. */
  glutenFreeNote: string;
  /** True if the recipe contains no dairy. */
  dairyFree?: boolean;
  /** True if the recipe is carnivore-friendly (animal products only). */
  carnivore?: boolean;
  /** "ai" = generated this session, "seed" = bundled sample. */
  source: "ai" | "seed";
}

// ---- Meal plan ----

export interface PlannedMeal {
  id: string;
  /** Day key, e.g. "Mon". */
  day: string;
  recipe: Recipe;
}

// ---- Shopping list ----

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
  fromRecipe?: string;
  /** Which store the user plans to buy this at (free-form, e.g. "Walmart"). */
  store?: string;
}

// ---- Restaurants ----

export type Letter = "A" | "B" | "C" | "D" | "F";

export interface MenuItem {
  name: string;
  /** How safe, before adjusting for user profile. */
  status: "naturally-gf" | "gf-modifiable" | "gf-menu-item" | "risky";
  note?: string;
}

/** Coarse dining type, used for filtering. */
export type RestaurantSegment =
  | "fast-food"
  | "fast-casual"
  | "sit-down"
  | "pizza"
  | "cafe";

export interface Restaurant {
  id: string;
  name: string;
  /** Primary web domain, used to fetch the brand logo. */
  domain: string;
  /** Coarse dining type for the fast-food vs sit-down filter. */
  segment: RestaurantSegment;
  category: string; // "Fast food", "Burgers", "Mexican", etc.
  /** Base, "best case" grade assuming a relaxed eater. */
  baseGrade: Letter;
  /** True if there's no shared-fryer risk (a dedicated GF fryer OR no fryer). */
  dedicatedFryer: boolean;
  /**
   * Optional, more precise fryer status for accurate wording:
   * "dedicated" = fries in a separate GF fryer; "none" = no deep fryer at all.
   * Omit when it's a normal shared fryer.
   */
  fryer?: "dedicated" | "none";
  /** True if kitchen has documented cross-contamination protocols. */
  crossContaminationProtocol: boolean;
  hasGfMenu: boolean;
  summary: string;
  menu: MenuItem[];
  orderingTips: string[];
}
