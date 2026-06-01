import type {
  CrossContaminationPrefs,
  GFProfile,
  GFReason,
  Strictness,
} from "./types";

/** Recommended default strictness for each reason. */
export function defaultStrictnessFor(reason: GFReason): Strictness {
  switch (reason) {
    case "celiac":
      return "strict";
    case "autoimmune":
      return "moderate";
    case "sensitivity":
      return "moderate";
    case "health":
      return "relaxed";
  }
}

/** Sensible default cross-contamination prefs for a strictness level. */
export function defaultCrossContamination(
  strictness: Strictness
): CrossContaminationPrefs {
  switch (strictness) {
    case "strict":
      return {
        sharedFryer: false,
        sharedSurfaces: false,
        mayContainTraces: false,
        regularOats: false,
      };
    case "moderate":
      return {
        sharedFryer: false,
        sharedSurfaces: true,
        mayContainTraces: true,
        regularOats: false,
      };
    case "relaxed":
      return {
        sharedFryer: true,
        sharedSurfaces: true,
        mayContainTraces: true,
        regularOats: true,
      };
  }
}

export const REASON_LABELS: Record<GFReason, string> = {
  celiac: "I avoid gluten completely",
  autoimmune: "I feel best avoiding it closely",
  sensitivity: "I'm sensitive to gluten",
  health: "I'm gluten-free by choice",
};

export const REASON_BLURBS: Record<GFReason, string> = {
  celiac:
    "Even tiny traces are a problem for you, so cross-contamination really matters.",
  autoimmune:
    "You feel noticeably better keeping gluten well away, beyond just the obvious sources.",
  sensitivity:
    "Gluten doesn't sit well with you, though small traces may vary day to day.",
  health:
    "You're going gluten-free for how it makes you feel — trace amounts usually aren't a worry.",
};

export const STRICTNESS_LABELS: Record<Strictness, string> = {
  strict: "Strict — avoid all cross-contamination",
  moderate: "Moderate — avoid obvious gluten, some caution",
  relaxed: "Relaxed — just avoiding gluten ingredients",
};

export const STRICTNESS_BLURBS: Record<Strictness, string> = {
  strict:
    "No shared fryers, no shared surfaces, no “may contain” foods. Built for the strictest gluten-free eating.",
  moderate:
    "Avoid clear gluten sources but a shared surface or trace warning won't necessarily rule something out.",
  relaxed:
    "If it doesn't have a gluten ingredient, it's fine — fries from a shared fryer are okay.",
}

const CARNIVORE_SHORT: Record<NonNullable<GFProfile["carnivoreLevel"]>, string> = {
  lion: "lion-level carnivore",
  strict: "strict carnivore",
  dairy: "carnivore + dairy",
  relaxed: "relaxed carnivore",
};

export function summarizeProfile(p: GFProfile): string {
  // Extra dietary layers come first — they're the headline.
  const layers: string[] = [];
  if (p.carnivore) {
    layers.push(CARNIVORE_SHORT[p.carnivoreLevel ?? "strict"]);
  }
  if (p.dairyFree) layers.push("dairy-free");

  const tolerated: string[] = [];
  if (p.crossContamination.sharedFryer) tolerated.push("shared fryers");
  if (p.crossContamination.sharedSurfaces) tolerated.push("shared surfaces");
  if (p.crossContamination.mayContainTraces) tolerated.push("trace warnings");
  if (p.crossContamination.regularOats) tolerated.push("regular oats");

  const gluten =
    tolerated.length === 0
      ? "You avoid gluten and all cross-contamination."
      : `You avoid gluten but are okay with ${listToText(tolerated)}.`;

  if (layers.length === 0) return gluten;
  return `${gluten} Also eating ${listToText(layers)}.`;
}

function listToText(items: string[]): string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
