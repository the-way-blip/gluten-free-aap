import { NextResponse } from "next/server";
import type { GFProfile } from "@/lib/types";

interface Body {
  barcode?: string;
  profile?: GFProfile | null;
}

export interface BarcodeResult {
  found: boolean;
  name?: string;
  brand?: string;
  imageUrl?: string;
  verdict: "safe" | "likely-safe" | "risky" | "not-safe" | "unknown";
  headline: string;
  explanation: string;
  flagged: { name: string; reason: string }[];
}

/**
 * Look up a packaged product by barcode via Open Food Facts (free, no key),
 * then translate its allergen/ingredient analysis into a gluten verdict tuned
 * to the user's strictness.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const code = (body.barcode ?? "").replace(/\D/g, "");
  const profile = body.profile ?? null;

  if (!code) {
    return NextResponse.json({ error: "Missing barcode" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,image_front_small_url,allergens_tags,traces_tags,ingredients_analysis_tags,ingredients_text`,
      { headers: { "User-Agent": "Sift-GlutenFree-App/1.0" } }
    );
    if (!res.ok) throw new Error(`OFF ${res.status}`);
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({
        result: {
          found: false,
          verdict: "unknown",
          headline: "Product not found",
          explanation:
            "This barcode isn't in the Open Food Facts database. Try the photo or text checker instead.",
          flagged: [],
        } satisfies BarcodeResult,
      });
    }

    const p = data.product;
    const result = assess(p, profile);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({
      result: {
        found: false,
        verdict: "unknown",
        headline: "Lookup failed",
        explanation:
          "Couldn't reach the product database. Check your connection, or use the photo/text checker.",
        flagged: [],
      } satisfies BarcodeResult,
      error: String(err),
    });
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max).trim() + "…" : s;
}

interface OFFProduct {
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  allergens_tags?: string[];
  traces_tags?: string[];
  ingredients_analysis_tags?: string[];
  ingredients_text?: string;
}

function assess(p: OFFProduct, profile: GFProfile | null): BarcodeResult {
  const rawName = p.product_name?.trim() || "";
  // OFF names can be very long/messy — keep it readable.
  const name = rawName ? truncate(rawName, 60) : "Unnamed product";
  const brand = p.brands?.split(",")[0]?.trim();
  const allergens = p.allergens_tags ?? [];
  const traces = p.traces_tags ?? [];
  const analysis = p.ingredients_analysis_tags ?? [];

  // Too little data to say anything useful — don't imply it's safe.
  const hasData =
    rawName ||
    allergens.length > 0 ||
    traces.length > 0 ||
    (p.ingredients_text && p.ingredients_text.trim().length > 0);
  if (!hasData) {
    return {
      found: false,
      verdict: "unknown",
      headline: "Not enough data",
      explanation:
        "This barcode exists but has no ingredient or allergen info on file. Use the photo or text checker on the actual label.",
      flagged: [],
    };
  }

  const flagged: { name: string; reason: string }[] = [];

  const hasGlutenAllergen = allergens.some((t) => t.includes("gluten"));
  const hasGlutenTrace = traces.some((t) => t.includes("gluten"));
  const markedGlutenFree = analysis.includes("en:gluten-free"); // OFF rarely sets this
  const strict = profile?.strictness === "strict";
  const okTraces = profile?.crossContamination?.mayContainTraces ?? false;

  let verdict: BarcodeResult["verdict"];
  let headline: string;
  let explanation: string;

  if (hasGlutenAllergen) {
    verdict = "not-safe";
    headline = "Contains gluten";
    explanation = "The label lists gluten as an allergen.";
    flagged.push({
      name: "Gluten (allergen)",
      reason: "Listed in the product's allergen declaration.",
    });
  } else if (hasGlutenTrace) {
    if (strict || !okTraces) {
      verdict = "risky";
      headline = "May contain traces of gluten";
      explanation = strict
        ? "Has a gluten trace/cross-contact warning — best avoided at your strictness level."
        : "Carries a 'may contain gluten' warning. Decide based on your sensitivity.";
    } else {
      verdict = "likely-safe";
      headline = "No gluten ingredients (trace warning present)";
      explanation =
        "No gluten in the ingredients, but it carries a trace warning you've said you're okay with.";
    }
    flagged.push({
      name: "Trace warning",
      reason: "Made in a facility / line that also handles gluten.",
    });
  } else if (markedGlutenFree) {
    verdict = "safe";
    headline = "Marked gluten-free";
    explanation = "The product data indicates it's gluten-free.";
  } else {
    verdict = "likely-safe";
    headline = "No gluten allergen listed";
    explanation =
      "No gluten is declared in the allergens. Always confirm against the on-pack label, as database data can be incomplete.";
  }

  return {
    found: true,
    name,
    brand,
    imageUrl: p.image_front_small_url,
    verdict,
    headline,
    explanation,
    flagged,
  };
}
