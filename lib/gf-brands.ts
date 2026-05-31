/**
 * Recommended gluten-free product brands, to answer the #1 shopper question:
 * "what GF [bread/pasta/snack] should I actually buy?" Static, no API needed.
 *
 * `certified` = the line carries a third-party GF certification (e.g. GFCO).
 * Always tells users to confirm the label — formulations and lines change.
 */

export type BrandCategory =
  | "Bread"
  | "Pasta"
  | "Flour & baking"
  | "Crackers & snacks"
  | "Cereal"
  | "Cookies & sweets"
  | "Sauces & condiments"
  | "Frozen & pizza"
  | "Baking mixes";

export interface GFBrand {
  category: BrandCategory;
  brand: string;
  product: string;
  note: string;
  certified: boolean;
}

export const BRAND_CATEGORIES: BrandCategory[] = [
  "Bread",
  "Pasta",
  "Flour & baking",
  "Crackers & snacks",
  "Cereal",
  "Cookies & sweets",
  "Sauces & condiments",
  "Frozen & pizza",
  "Baking mixes",
];

// Starter set — confident, widely-available picks. Augmented by research data.
export const GF_BRANDS: GFBrand[] = [
  { category: "Bread", brand: "Canyon Bakehouse", product: "Mountain White Bread", note: "GFCO certified and made in a zero-gluten facility; soft sandwich loaf widely sold at Kroger, Safeway and Target.", certified: true },
  { category: "Bread", brand: "Canyon Bakehouse", product: "100% Whole Grain Ancient Grain Bread", note: "Hearty multigrain loaf, free of gluten, dairy, nuts and soy; a celiac staple.", certified: true },
  { category: "Bread", brand: "Udi's", product: "Gluten Free White Sandwich Bread", note: "The original mainstream GF bread; certified gluten-free with no artificial dyes, best toasted.", certified: true },
  { category: "Bread", brand: "Little Northern Bakehouse", product: "Seeds & Grains Bread", note: "Vegan and Non-GMO; made in a 100% gluten-free facility with GFCO certification.", certified: true },
  { category: "Bread", brand: "Schar", product: "Gluten Free Artisan Baker White Bread", note: "Shelf-stable European loaf, certified gluten-free and lactose-free; good for travel.", certified: true },
  { category: "Bread", brand: "Against The Grain", product: "Original Baguette", note: "Grain-free and gum-free tapioca-and-cheese baguette made in a dedicated GF facility; crispy and chewy.", certified: true },
  { category: "Bread", brand: "Kinnikinnick", product: "Soft White Sandwich Bread", note: "Certified GF and free of gluten, dairy, nuts and soy from a dedicated facility.", certified: true },
  { category: "Pasta", brand: "Tinkyada", product: "Brown Rice Pasta Spaghetti", note: "Made in a dedicated wheat-free facility; least likely GF pasta to go mushy, though it carries no GFCO seal.", certified: false },
  { category: "Pasta", brand: "Jovial", product: "Organic Brown Rice Spaghetti", note: "GFCO certified to under 10 ppm and made in a dedicated facility; a top-rated GF pasta.", certified: true },
  { category: "Pasta", brand: "Banza", product: "Chickpea Rotini", note: "GFCO certified chickpea pasta with about 20g protein per serving; rinse and don't overcook for best texture.", certified: true },
  { category: "Pasta", brand: "Barilla", product: "Gluten Free Spaghetti", note: "GFCO certified corn-and-rice blend on a dedicated line; cooks and tastes close to regular spaghetti at a low price.", certified: true },
  { category: "Pasta", brand: "Barilla", product: "Gluten Free Oven-Ready Lasagna", note: "No-boil GF lasagna sheets, a rare and convenient find for celiac households.", certified: true },
  { category: "Pasta", brand: "Jovial", product: "Organic Brown Rice Penne", note: "Two-ingredient organic brown rice and water; GFCO certified and made in Italy.", certified: true },
  { category: "Pasta", brand: "Banza", product: "Chickpea Shells", note: "Higher protein and fiber than wheat pasta; great for mac-and-cheese, GFCO certified.", certified: true },
  { category: "Flour & baking", brand: "Bob's Red Mill", product: "Gluten Free 1-to-1 Baking Flour", note: "1:1 wheat-flour swap for cookies, cakes and muffins; tested in a dedicated GF facility (not for yeast doughs).", certified: false },
  { category: "Flour & baking", brand: "Bob's Red Mill", product: "Super-Fine Almond Flour", note: "Blanched almond flour for grain-free and paleo baking; tested gluten-free in a dedicated facility.", certified: false },
  { category: "Flour & baking", brand: "King Arthur", product: "Gluten Free Measure for Measure Flour", note: "Certified gluten-free 1:1 blend fortified with iron, calcium and B vitamins; ideal for non-yeasted recipes.", certified: true },
  { category: "Flour & baking", brand: "Bob's Red Mill", product: "Gluten Free All-Purpose Baking Flour", note: "Bean-based blend suited to yeast breads; tested GF in a dedicated facility.", certified: false },
  { category: "Flour & baking", brand: "Jovial", product: "Organic Brown Rice Flour", note: "Finely milled single-ingredient flour, GFCO certified for from-scratch GF baking.", certified: true },
  { category: "Flour & baking", brand: "Cup4Cup", product: "Multipurpose Flour", note: "Chef-developed 1:1 blend praised for closest-to-wheat results; certified gluten-free (contains dairy).", certified: true },
  { category: "Crackers & snacks", brand: "Mary's Gone Crackers", product: "Original Seed Crackers", note: "GFCO certified and organic, baked in a dedicated GF bakery; brown rice, quinoa, flax and sesame.", certified: true },
  { category: "Crackers & snacks", brand: "Schar", product: "Gluten Free Table Crackers", note: "Light, crisp everyday cracker; certified gluten-free and also Monash Low-FODMAP certified.", certified: true },
  { category: "Crackers & snacks", brand: "Simple Mills", product: "Almond Flour Crackers, Sea Salt", note: "GFCO certified grain-free crackers; very sensitive celiacs may proceed with care per some independent tests.", certified: true },
  { category: "Crackers & snacks", brand: "Glutino", product: "Gluten Free Pretzel Twists", note: "The go-to GF pretzel; clearly labeled gluten-free and free of wheat, milk and casein.", certified: false },
  { category: "Crackers & snacks", brand: "Kinnikinnick", product: "S'moreables Graham Style Crackers", note: "Hard-to-find GF graham cracker for s'mores and crusts; vegan and made in a dedicated facility.", certified: true },
  { category: "Crackers & snacks", brand: "Mary's Gone Crackers", product: "Real Thin Sea Salt Crackers", note: "Thin, crunchy organic crackers, GFCO certified and great with cheese.", certified: true },
  { category: "Cereal", brand: "Chex", product: "Rice Chex", note: "Mainstream, budget-friendly cereal clearly labeled gluten-free; note that Wheat Chex is NOT GF.", certified: false },
  { category: "Cereal", brand: "Chex", product: "Corn Chex", note: "Widely available GF cereal, also handy for making homemade Chex mix; gluten-free labeled.", certified: false },
  { category: "Cereal", brand: "Three Wishes", product: "Grain-Free Cinnamon Cereal", note: "Certified gluten-free, grain-free and high-protein chickpea-based cereal; vegan and soy-free.", certified: true },
  { category: "Cereal", brand: "Magic Spoon", product: "Cocoa Cereal", note: "High-protein, low-sugar cereal made with milk protein; naturally and clearly gluten-free though not certified.", certified: false },
  { category: "Cereal", brand: "Three Wishes", product: "Honey Cereal", note: "Certified gluten-free with more protein and less sugar than typical cereal; kid-friendly.", certified: true },
  { category: "Cereal", brand: "Nature's Path", product: "Honey'd Corn Flakes (Gluten Free)", note: "Organic GF corn flakes; check for the certified gluten-free label on GF varieties.", certified: true },
  { category: "Cookies & sweets", brand: "Tate's Bake Shop", product: "Gluten Free Chocolate Chip Cookies", note: "Thin, crispy, buttery cookies that taste like the regular version; clearly labeled gluten-free.", certified: false },
  { category: "Cookies & sweets", brand: "Enjoy Life", product: "Soft Baked Chocolate Chip Cookies", note: "Certified gluten-free and free of 14 allergens; school-safe and made in a dedicated facility.", certified: true },
  { category: "Cookies & sweets", brand: "Glutino", product: "Gluten Free Vanilla Creme Cookies", note: "Sandwich cookies reminiscent of Golden Oreos; clearly labeled gluten-free.", certified: false },
  { category: "Cookies & sweets", brand: "Kinnikinnick", product: "Vanilla Glazed Donuts", note: "A popular GF donut in North America; certified and free of gluten, dairy, nuts and soy.", certified: true },
  { category: "Cookies & sweets", brand: "Enjoy Life", product: "Soft Baked Snickerdoodle Cookies", note: "Certified gluten-free and top-allergen-free; vegan, kosher and halal.", certified: true },
  { category: "Cookies & sweets", brand: "Tate's Bake Shop", product: "Gluten Free Double Chocolate Chip Cookies", note: "Rich, crispy chocolate cookies; gluten-free labeled.", certified: false },
  { category: "Sauces & condiments", brand: "San-J", product: "Tamari Gluten Free Soy Sauce (Black Label)", note: "GFCO certified, 100% soy with no wheat; richer umami than regular soy sauce and a celiac kitchen staple.", certified: true },
  { category: "Sauces & condiments", brand: "Kikkoman", product: "Gluten Free Tamari Soy Sauce", note: "Traditionally brewed tamari, Non-GMO and certified gluten-free by GIG; widely stocked.", certified: true },
  { category: "Sauces & condiments", brand: "Coconut Secret", product: "Coconut Aminos", note: "Soy-free, wheat-free soy-sauce alternative from coconut sap; lower sodium and naturally gluten-free.", certified: false },
  { category: "Sauces & condiments", brand: "Bragg", product: "Organic Coconut Aminos", note: "Popular gluten-free and soy-free seasoning for marinades and stir-fries; widely available.", certified: false },
  { category: "Sauces & condiments", brand: "San-J", product: "Organic GF Reduced Sodium Tamari", note: "Certified gluten-free organic tamari with less sodium; FODMAP-friendly.", certified: true },
  { category: "Sauces & condiments", brand: "Kikkoman", product: "Gluten Free Hoisin Sauce", note: "GF version of a classic Asian sauce for stir-fries and glazes; check for the GF label.", certified: false },
  { category: "Frozen & pizza", brand: "Caulipower", product: "Margherita Cauliflower Crust Pizza", note: "All Caulipower frozen pizzas are certified gluten-free; cauliflower crust under $10 at most major chains.", certified: true },
  { category: "Frozen & pizza", brand: "Against The Grain", product: "Three Cheese Pizza", note: "Naturally gluten- and grain-free pizza made in a dedicated facility; known for a real bread-like crust.", certified: true },
  { category: "Frozen & pizza", brand: "Daiya", product: "Cheeze Lover's Gluten Free Pizza", note: "Certified gluten-free and also dairy-, soy- and egg-free; the most allergy-inclusive frozen pizza.", certified: true },
  { category: "Frozen & pizza", brand: "Feel Good Foods", product: "Gluten Free Chicken Potstickers", note: "Rice-flour wrappers with antibiotic-free chicken and a GF tamari dip; clearly labeled gluten-free.", certified: false },
  { category: "Frozen & pizza", brand: "Against The Grain", product: "Original Bagels", note: "Grain-free frozen bagels made in a dedicated GF facility; crispy outside, chewy inside.", certified: true },
  { category: "Frozen & pizza", brand: "Feel Good Foods", product: "Gluten Free Vegetable Egg Rolls", note: "Non-GMO, all-natural frozen egg rolls; a rare GF take on a takeout favorite.", certified: false },
  { category: "Baking mixes", brand: "King Arthur", product: "Gluten Free Chocolate Cake Mix", note: "Reliable certified gluten-free cake mix from a trusted baking brand; bakes up moist.", certified: true },
  { category: "Baking mixes", brand: "Pamela's", product: "Gluten Free Pancake & Baking Mix", note: "GFCO certified and tested to 10 ppm or less; versatile mix for pancakes and more.", certified: true },
  { category: "Baking mixes", brand: "Krusteaz", product: "Gluten Free Buttermilk Pancake Mix", note: "GFCO certified rice-and-sorghum mix; just add milk, water and eggs for fluffy pancakes.", certified: true },
  { category: "Baking mixes", brand: "Bob's Red Mill", product: "Gluten Free Chocolate Chip Cookie Mix", note: "Tested gluten-free in a dedicated facility; easy from-mix cookies with classic flavor.", certified: false },
  { category: "Baking mixes", brand: "Simple Mills", product: "Almond Flour Vanilla Cake Mix", note: "GFCO certified grain-free mix made with almond and coconut flour; clean ingredient list.", certified: true },
  { category: "Baking mixes", brand: "Pamela's", product: "Gluten Free Bread Mix", note: "GFCO certified mix for making fresh GF sandwich loaves at home.", certified: true },
];
