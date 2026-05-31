import { NextResponse } from "next/server";
import type { Cuisine, GFProfile, Recipe, RecipeFilters } from "@/lib/types";
import {
  buildRecipePrompt,
  fallbackRecipes,
} from "@/lib/recipe-fallback";
import { uid } from "@/lib/store-server";

interface Body {
  pantry?: string[];
  cuisine?: Cuisine;
  profile?: GFProfile | null;
  count?: number;
  filters?: RecipeFilters;
}

const MODEL = process.env.SIFT_MODEL || "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const pantry = body.pantry ?? [];
  const cuisine = body.cuisine ?? "any";
  const profile = body.profile ?? null;
  const count = body.count ?? 3;
  const filters = body.filters ?? {};

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key configured → deterministic fallback so the app still works.
  if (!apiKey) {
    return NextResponse.json({
      recipes: fallbackRecipes(pantry, cuisine, profile, count, filters),
      mode: "fallback",
    });
  }

  try {
    const prompt = buildRecipePrompt(pantry, cuisine, profile, count, filters);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const json = extractJson(text);
    const parsed = JSON.parse(json) as Omit<Recipe, "id" | "source">[];

    const have = new Set(pantry.map((p) => p.toLowerCase().trim()));
    const recipes: Recipe[] = parsed.map((r) => ({
      ...r,
      id: uid(),
      source: "ai" as const,
      ingredients: r.ingredients.map((i) => ({
        ...i,
        haveIt: [...have].some(
          (h) =>
            i.name.toLowerCase().includes(h) ||
            h.includes(i.name.toLowerCase())
        ),
      })),
    }));

    return NextResponse.json({ recipes, mode: "ai" });
  } catch (err) {
    // Any failure → graceful fallback.
    return NextResponse.json({
      recipes: fallbackRecipes(pantry, cuisine, profile, count, filters),
      mode: "fallback",
      error: String(err),
    });
  }
}

function extractJson(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text;
}
