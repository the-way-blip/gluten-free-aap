/**
 * Static grocery helpers: common stores, gluten-free staples to suggest adding,
 * and which stores tend to have the best gluten-free selection / value.
 * No API needed — practical, community-informed guidance.
 */

export const COMMON_STORES = [
  "Walmart",
  "Target",
  "Kroger",
  "HyVee",
  "Aldi",
  "Costco",
  "Sam's Club",
  "Trader Joe's",
  "Whole Foods",
  "Publix",
  "Meijer",
  "Sprouts",
];

export interface StoreTip {
  store: string;
  strength: string;
}

/** Where gluten-free shoppers tend to get the best selection or value. */
export const STORE_GUIDE: StoreTip[] = [
  { store: "Aldi", strength: "Best budget GF — the 'liveGfree' line (bread, snacks, pasta) is cheap and clearly labeled." },
  { store: "Trader Joe's", strength: "Tons of items marked GF; maintains a printable GF product list. Great frozen meals." },
  { store: "Costco / Sam's Club", strength: "Bulk value on GF staples — almond flour, rice, nut butters, frozen proteins, snacks." },
  { store: "Whole Foods", strength: "Widest specialty GF selection and dedicated sections; pricier." },
  { store: "Sprouts", strength: "Strong natural/GF focus, good bulk bins and fresh options." },
  { store: "HyVee", strength: "Dietitian-tagged aisles and a solid 'That's Smart'/health-market GF range (Midwest)." },
  { store: "Kroger / Meijer", strength: "Mainstream prices; 'Simple Truth' (Kroger) has many GF items, well labeled." },
  { store: "Walmart / Target", strength: "Convenient + affordable; 'Great Value' and 'Good & Gather' carry GF basics." },
];

export interface StapleCategory {
  category: string;
  emoji: string;
  items: string[];
}

/**
 * Naturally gluten-free staples worth keeping stocked, grouped for a quick
 * "add to list" experience. Whole-food-first to keep cost down.
 */
export const GF_STAPLES: StapleCategory[] = [
  {
    category: "Proteins",
    emoji: "🍗",
    items: ["Eggs", "Chicken breast", "Ground beef", "Canned tuna", "Black beans", "Greek yogurt"],
  },
  {
    category: "Grains & starches",
    emoji: "🍚",
    items: ["Rice", "Quinoa", "Corn tortillas", "GF oats", "Potatoes", "GF pasta"],
  },
  {
    category: "Produce",
    emoji: "🥦",
    items: ["Spinach", "Bell peppers", "Onions", "Garlic", "Bananas", "Frozen mixed veg"],
  },
  {
    category: "Pantry & sauces",
    emoji: "🫙",
    items: ["Olive oil", "Tamari (GF soy sauce)", "Canned tomatoes", "Nut butter", "Honey", "GF broth"],
  },
  {
    category: "GF swaps",
    emoji: "🔁",
    items: ["GF bread", "Almond flour", "GF flour blend", "GF crackers", "GF cereal", "Rice cakes"],
  },
];
