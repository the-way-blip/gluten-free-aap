/**
 * "Newly Diagnosed — Start Here" content. The #1 unmet need surfaced in
 * community research: a structured first-steps path for people who've just
 * gone gluten-free. Static, always-available, links into existing app tools.
 */

export interface StartTask {
  id: string;
  title: string;
  detail: string;
  /** Optional in-app link to the relevant tool. */
  href?: string;
  hrefLabel?: string;
}

export interface StartSection {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  tasks: StartTask[];
}

export const START_SECTIONS: StartSection[] = [
  {
    id: "learn",
    emoji: "🧠",
    title: "Understand the basics",
    blurb: "A few minutes here saves a lot of mistakes later.",
    tasks: [
      {
        id: "learn-gluten",
        title: "Learn what gluten is and its hidden names",
        detail:
          "Gluten lives in wheat, barley, and rye — and hides in malt, soy sauce, and more.",
        href: "/learn",
        hrefLabel: "Read the guides",
      },
      {
        id: "set-profile",
        title: "Set how strict you need to be",
        detail:
          "Celiac, autoimmune, sensitivity, or health — this tunes every recommendation in Sift.",
        href: "/settings",
        hrefLabel: "Open settings",
      },
      {
        id: "decide-dairy",
        title: "Decide if you also need to go dairy-free",
        detail:
          "Very common right after diagnosis while your gut heals — it's often temporary. You can toggle it anytime.",
        href: "/settings",
        hrefLabel: "Toggle dairy-free",
      },
    ],
  },
  {
    id: "kitchen",
    emoji: "🍳",
    title: "Set up a safe kitchen",
    blurb: "Cross-contamination at home is the most-missed risk for celiac.",
    tasks: [
      {
        id: "purge-pantry",
        title: "Do a pantry sweep",
        detail:
          "Pull obvious gluten foods, and check sauces, oats, and 'may contain' labels. Use the checker if unsure.",
        href: "/check",
        hrefLabel: "Check an ingredient",
      },
      {
        id: "swap-toaster",
        title: "Get a dedicated toaster (or toaster bags)",
        detail: "Crumbs are the #1 home cross-contact source — a shared toaster isn't safe.",
      },
      {
        id: "swap-gear",
        title: "Replace porous, crumb-trapping gear",
        detail:
          "Dedicate a colander, wooden spoons/boards, and consider squeeze-bottle condiments to avoid double-dipping.",
        href: "/learn",
        hrefLabel: "Kitchen-safety guide",
      },
    ],
  },
  {
    id: "stock",
    emoji: "🛒",
    title: "Stock up & cook your first meals",
    blurb: "Whole foods are naturally gluten-free — and cheaper than specialty products.",
    tasks: [
      {
        id: "add-staples",
        title: "Build a gluten-free staples list",
        detail: "One tap adds rice, eggs, beans, produce, and GF swaps to your shopping list.",
        href: "/shopping-list",
        hrefLabel: "Add GF staples",
      },
      {
        id: "first-recipe",
        title: "Save your first easy recipe",
        detail: "Filter to 'Easy' and a short cook time so the first one is a win.",
        href: "/recipes",
        hrefLabel: "Find recipes",
      },
      {
        id: "find-restaurant",
        title: "Find a safe restaurant near you",
        detail: "See which chains are graded well for your strictness, and how to order there.",
        href: "/restaurants",
        hrefLabel: "Browse dining",
      },
    ],
  },
  {
    id: "care",
    emoji: "🩺",
    title: "Take care of yourself",
    blurb: "Beyond food — the parts people wish they'd done sooner.",
    tasks: [
      {
        id: "see-dietitian",
        title: "Ask about a registered dietitian",
        detail:
          "A celiac-savvy dietitian helps you eat balanced and catch hidden gluten. Worth asking your doctor for a referral.",
      },
      {
        id: "check-meds",
        title: "Check your meds & supplements",
        detail:
          "Pills can use wheat starch as a binder, and aren't always labeled. Confirm with your pharmacist.",
      },
      {
        id: "start-journal",
        title: "Start a reaction journal",
        detail:
          "Logging how you feel after meals helps you (and your doctor) spot repeat triggers over time.",
        href: "/journal",
        hrefLabel: "Open journal",
      },
    ],
  },
];

export const TOTAL_START_TASKS = START_SECTIONS.reduce(
  (n, s) => n + s.tasks.length,
  0
);
