/**
 * Static, practical guides for people new to (or living with) gluten-free.
 * No API needed — always available. Written for the celiac / autoimmune /
 * sensitivity audience the app serves.
 */

export interface LearnGuide {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  sections: { heading: string; points: string[] }[];
}

export const LEARN_GUIDES: LearnGuide[] = [
  {
    id: "start-here",
    emoji: "🌱",
    title: "Just diagnosed? Start here",
    blurb: "The 5-minute orientation to eating gluten-free.",
    sections: [
      {
        heading: "What gluten is",
        points: [
          "Gluten is a protein in wheat, barley, and rye (and anything made from them).",
          "It hides under many names — malt (barley), semolina/durum (wheat), and brewer's yeast all contain it.",
          "Oats are naturally gluten-free but usually cross-contaminated — buy certified GF oats.",
        ],
      },
      {
        heading: "How strict you need to be",
        points: [
          "Celiac disease: an autoimmune reaction where even tiny traces cause real intestinal damage. Cross-contamination matters a lot.",
          "Autoimmune (e.g. Hashimoto's) & sensitivity: many people feel better avoiding gluten closely, but trace amounts are usually less dangerous.",
          "Just for health: focus on ingredients, not trace cross-contact.",
          "Sift uses your profile to tune every recommendation to your level — update it anytime.",
        ],
      },
      {
        heading: "Your first week",
        points: [
          "Stock naturally gluten-free staples: rice, potatoes, eggs, beans, fresh produce, plain meat.",
          "Learn to read labels (see the Reading Labels guide).",
          "When in doubt, choose simple, whole foods over processed packaged items.",
        ],
      },
    ],
  },
  {
    id: "hidden-gluten",
    emoji: "🕵️",
    title: "Where gluten hides",
    blurb: "Sneaky sources beyond the obvious bread and pasta.",
    sections: [
      {
        heading: "Common surprises",
        points: [
          "Soy sauce & teriyaki — brewed with wheat (use gluten-free tamari).",
          "Gravy, soups, and sauces — usually thickened with wheat flour.",
          "Malt vinegar, malted milkshakes, and most beer — barley-based.",
          "Licorice candy — typically made with wheat flour.",
          "Imitation crab (surimi) — often contains wheat starch.",
          "Some medications and supplements — can use wheat starch as a binder.",
        ],
      },
      {
        heading: "Usually fine (don't over-worry)",
        points: [
          "Maltodextrin and caramel color — gluten-free in North America despite scary names.",
          "Distilled vinegar and distilled spirits — distillation removes gluten.",
          "Use Sift's 'Is it gluten-free?' tool to check any specific ingredient.",
        ],
      },
    ],
  },
  {
    id: "kitchen-safe",
    emoji: "🍳",
    title: "Keeping your kitchen safe",
    blurb: "Avoiding cross-contamination at home (matters most for celiac).",
    sections: [
      {
        heading: "The big offenders",
        points: [
          "Toaster: crumbs are everywhere. Get a separate toaster or use toaster bags.",
          "Condiments: double-dipping a knife into butter, jam, or peanut butter transfers crumbs. Use squeeze bottles or label 'GF only' jars.",
          "Colander: gluten pasta residue is hard to wash out — keep a dedicated one.",
          "Wooden spoons & cutting boards: porous and hold gluten. Use separate ones.",
        ],
      },
      {
        heading: "Shared-kitchen habits",
        points: [
          "Prep gluten-free food first, on a clean surface, before gluten foods.",
          "Use separate sponges or wash GF items first.",
          "Store gluten-free foods on upper shelves so crumbs don't fall onto them.",
          "Flour stays airborne for hours — don't prep GF food right after someone bakes with wheat flour.",
        ],
      },
    ],
  },
  {
    id: "dining-out",
    emoji: "🍴",
    title: "How to order at a restaurant",
    blurb: "A simple script and the questions that actually keep you safe.",
    sections: [
      {
        heading: "What to say",
        points: [
          "Lead with: \"I have a gluten allergy\" — kitchens take 'allergy' more seriously than 'preference,' even if it's celiac.",
          "Ask: \"Is there a dedicated fryer, or is the oil shared with breaded foods?\"",
          "Ask: \"Can the kitchen change gloves and use a clean prep surface?\"",
          "For sauces/marinades: \"Does this contain soy sauce, flour, or malt?\"",
        ],
      },
      {
        heading: "Safer choices when unsure",
        points: [
          "Grilled (not breaded or fried) proteins, plain.",
          "Plain rice, baked potatoes, steamed vegetables.",
          "Salads without croutons — confirm the dressing.",
          "Use Sift's Dining tab for chain-specific grades and ordering tips.",
        ],
      },
    ],
  },
  {
    id: "labels",
    emoji: "🏷️",
    title: "Reading labels like a pro",
    blurb: "What the claims and warnings actually mean.",
    sections: [
      {
        heading: "Trust these",
        points: [
          "\"Certified Gluten-Free\" (GFCO and similar) — tested to ≤10 ppm, the gold standard.",
          "\"Gluten-Free\" label — in the US (FDA) means under 20 ppm; safe for most celiacs.",
          "US allergen law: 'wheat' must be listed in plain language if present.",
        ],
      },
      {
        heading: "Read carefully",
        points: [
          "\"May contain wheat\" / \"made in a facility with wheat\" — voluntary warnings about cross-contact. Strict/celiac eaters should usually skip these.",
          "Barley and rye are NOT covered by US allergen labeling — scan the ingredient list for malt, etc.",
          "\"Wheat-free\" does NOT mean gluten-free (it can still contain barley or rye).",
        ],
      },
    ],
  },
];
