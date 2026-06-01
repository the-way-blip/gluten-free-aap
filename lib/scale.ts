/**
 * Scales recipe ingredient quantities when the user changes serving count.
 *
 * Quantities are free-text strings ("2 lb", "1½ cups", "2-3 cloves",
 * "a pinch"), so we parse the leading amount, scale just that, and leave the
 * unit/remainder text alone. Anything without a leading number (e.g. "to
 * taste") is returned unchanged. Results snap back to friendly cooking
 * fractions (½, ⅓, ¾, …) where possible, falling back to a trimmed decimal.
 */

const UNICODE_FRAC: Record<string, number> = {
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
  "⅕": 1 / 5,
  "⅖": 2 / 5,
  "⅗": 3 / 5,
  "⅘": 4 / 5,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
};

const FRAC_CLASS = "½⅓⅔¼¾⅛⅜⅝⅞⅕⅖⅗⅘⅙⅚";

/** Reads a leading amount (number/fraction/mixed) from a string. */
function readAmount(s: string): { value: number; len: number } | null {
  // Bare slash fraction first, e.g. "1/2" (a mixed "1 1/2" has a space, so it
  // won't match here and falls through to the integer branch below).
  const bareSlash = s.match(/^(\d+)\/(\d+)/);
  if (bareSlash) {
    return {
      value: parseInt(bareSlash[1], 10) / parseInt(bareSlash[2], 10),
      len: bareSlash[0].length,
    };
  }

  // Leading integer or decimal, e.g. "1", "1.5"
  const num = s.match(/^(\d+(?:\.\d+)?)/);
  if (num) {
    let value = parseFloat(num[1]);
    let len = num[1].length;
    const after = s.slice(len);

    // Mixed with a unicode fraction: "1½" or "1 ½"
    const uni = after.match(new RegExp(`^\\s*([${FRAC_CLASS}])`));
    if (uni) {
      value += UNICODE_FRAC[uni[1]];
      return { value, len: len + uni[0].length };
    }

    // Mixed with a slash fraction: "1 1/2"
    const slash = after.match(/^\s+(\d+)\/(\d+)/);
    if (slash) {
      value += parseInt(slash[1], 10) / parseInt(slash[2], 10);
      return { value, len: len + slash[0].length };
    }

    return { value, len };
  }

  // Bare unicode fraction: "½"
  const uni = s.match(new RegExp(`^([${FRAC_CLASS}])`));
  if (uni) return { value: UNICODE_FRAC[uni[1]], len: uni[0].length };

  return null;
}

const SNAP: [number, string][] = [
  [0, ""],
  [1 / 8, "⅛"],
  [1 / 6, "⅙"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [5 / 6, "⅚"],
  [7 / 8, "⅞"],
  [1, "+1"],
];

/** Formats a scaled number as a friendly cooking amount. */
export function formatAmount(n: number): string {
  if (!isFinite(n) || n <= 0) return "0";

  let whole = Math.floor(n + 1e-9);
  const frac = n - whole;

  // Find the closest friendly fraction to the leftover part.
  let best = SNAP[0];
  let bestDist = Infinity;
  for (const cand of SNAP) {
    const d = Math.abs(frac - cand[0]);
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
  }

  // If nothing fits well, show a trimmed decimal instead of a wrong fraction.
  if (bestDist > 0.06) {
    return String(Math.round(n * 100) / 100);
  }

  let fracStr = best[1];
  if (fracStr === "+1") {
    whole += 1;
    fracStr = "";
  }

  if (whole === 0 && fracStr === "") return "0";
  if (fracStr === "") return String(whole);
  if (whole === 0) return fracStr;
  return `${whole}${fracStr}`;
}

/** Scales a quantity string ("2 cups", "1-2 tbsp") by a factor. */
export function scaleQuantity(quantity: string, factor: number): string {
  if (!quantity || factor === 1) return quantity;
  const s = quantity.trim();

  const first = readAmount(s);
  if (!first) return quantity; // "to taste", "a pinch", etc. — leave alone

  const rest = s.slice(first.len);

  // Range like "2-3 cloves" or "1–2 tbsp": scale both ends.
  const dash = rest.match(/^\s*[-–—]\s*/);
  if (dash) {
    const second = readAmount(rest.slice(dash[0].length));
    if (second) {
      const tail = rest.slice(dash[0].length + second.len);
      return `${formatAmount(first.value * factor)}–${formatAmount(
        second.value * factor
      )}${tail}`;
    }
  }

  return `${formatAmount(first.value * factor)}${rest}`;
}
