/**
 * Standardized pick-lists used across the app so users can tap common options
 * instead of typing everything. Free-text entry stays available everywhere.
 */

/** Common allergens / avoidances people add alongside gluten. */
export const COMMON_ALLERGENS = [
  "Dairy",
  "Eggs",
  "Soy",
  "Peanuts",
  "Tree nuts",
  "Shellfish",
  "Fish",
  "Sesame",
  "Corn",
  "Nightshades",
  "Sugar",
  "Pork",
];

export interface PantryGroup {
  category: string;
  emoji: string;
  items: string[];
}

/**
 * Common pantry/fridge/freezer items grouped for quick tapping. Kept broad and
 * naturally-gluten-free-leaning so they're useful starting points.
 */
export const COMMON_PANTRY: PantryGroup[] = [
  {
    category: "Proteins",
    emoji: "🍗",
    items: [
      "Eggs",
      "Chicken",
      "Ground beef",
      "Steak",
      "Bacon",
      "Salmon",
      "Shrimp",
      "Turkey",
      "Tofu",
      "Greek yogurt",
    ],
  },
  {
    category: "Produce",
    emoji: "🥦",
    items: [
      "Onion",
      "Garlic",
      "Tomatoes",
      "Spinach",
      "Bell peppers",
      "Carrots",
      "Broccoli",
      "Potatoes",
      "Avocado",
      "Lemon",
      "Mushrooms",
      "Zucchini",
    ],
  },
  {
    category: "Grains & starches",
    emoji: "🍚",
    items: [
      "Rice",
      "Quinoa",
      "Corn tortillas",
      "GF pasta",
      "GF oats",
      "Potatoes",
    ],
  },
  {
    category: "Dairy & fridge",
    emoji: "🧀",
    items: [
      "Cheese",
      "Butter",
      "Milk",
      "Heavy cream",
      "Sour cream",
      "Parmesan",
    ],
  },
  {
    category: "Pantry staples",
    emoji: "🫙",
    items: [
      "Olive oil",
      "Black beans",
      "Canned tomatoes",
      "Chicken broth",
      "Tamari (GF soy sauce)",
      "Honey",
      "Peanut butter",
      "Salt",
    ],
  },
  {
    category: "Freezer",
    emoji: "❄️",
    items: [
      "Frozen mixed veg",
      "Frozen berries",
      "Frozen chicken",
      "Frozen shrimp",
    ],
  },
];
