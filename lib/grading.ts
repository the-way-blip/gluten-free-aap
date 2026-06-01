import type { GFProfile, Letter, Restaurant } from "./types";

const LETTERS: Letter[] = ["A", "B", "C", "D", "F"];

function letterToIndex(l: Letter): number {
  return LETTERS.indexOf(l);
}
function indexToLetter(i: number): Letter {
  return LETTERS[Math.max(0, Math.min(LETTERS.length - 1, i))];
}

export interface PersonalGrade {
  letter: Letter;
  /** Short reasons explaining the personalized grade. */
  reasons: string[];
}

/**
 * Compute a restaurant's grade *for this specific user*.
 *
 * The base grade assumes a relaxed eater (ingredients-only avoidance).
 * We then penalize based on the user's cross-contamination needs versus
 * what the restaurant actually offers. A burger joint with GF buns but a
 * shared fryer can be an "A" for a relaxed eater and a "D" for someone
 * with celiac.
 */
export function gradeFor(
  restaurant: Restaurant,
  profile: GFProfile | null
): PersonalGrade {
  let idx = letterToIndex(restaurant.baseGrade);
  const reasons: string[] = [];

  if (!profile) {
    return { letter: restaurant.baseGrade, reasons: ["General gluten-friendliness."] };
  }

  const cc = profile.crossContamination;

  // Shared fryer risk
  if (restaurant.fryer === "dedicated") {
    reasons.push("Fries in a dedicated gluten-free fryer.");
  } else if (restaurant.fryer === "none") {
    reasons.push("No deep fryer here — no shared-fryer risk.");
  } else if (!restaurant.dedicatedFryer && !cc.sharedFryer) {
    idx += 2;
    reasons.push("Shared fryer here — a real risk for you.");
  } else if (restaurant.dedicatedFryer) {
    reasons.push("No shared-fryer risk here.");
  } else if (cc.sharedFryer) {
    reasons.push("Shared fryer, which you're okay with.");
  }

  // Cross-contamination protocol
  if (!restaurant.crossContaminationProtocol && !cc.sharedSurfaces) {
    idx += 1;
    reasons.push("No documented cross-contamination protocol.");
  } else if (restaurant.crossContaminationProtocol) {
    reasons.push("Has cross-contamination protocols.");
  }

  // Bonus: dedicated GF menu helps everyone, more so for the cautious
  if (restaurant.hasGfMenu) {
    if (profile.strictness === "strict") idx -= 1;
    reasons.push("Publishes a gluten-free menu.");
  }

  // A strict eater at a place with neither protocol nor fryer control caps low
  if (
    profile.strictness === "strict" &&
    !restaurant.dedicatedFryer &&
    !restaurant.crossContaminationProtocol
  ) {
    idx = Math.max(idx, letterToIndex("D"));
  }

  return { letter: indexToLetter(idx), reasons };
}

export const GRADE_COLORS: Record<Letter, string> = {
  A: "bg-leaf-500 text-white",
  B: "bg-leaf-400 text-white",
  C: "bg-grain-400 text-white",
  D: "bg-orange-500 text-white",
  F: "bg-red-500 text-white",
};

export const GRADE_LABELS: Record<Letter, string> = {
  A: "Great options",
  B: "Good, with care",
  C: "Limited / be careful",
  D: "Risky for you",
  F: "Avoid",
};
