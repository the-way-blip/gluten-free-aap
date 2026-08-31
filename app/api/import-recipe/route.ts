import { NextResponse } from "next/server";
import type {
  GFProfile,
  ImportResult,
  ImportVerdict,
  Recipe,
  RecipeSwap,
} from "@/lib/types";
import { fetchSourceText } from "@/lib/import-source";
import { uid } from "@/lib/store-server";

/**
 * POST /api/import-recipe
 *
 * Turns a link, pasted text, or photo of a recipe into a Sift recipe, judged
 * and (when needed) converted for the user's gluten-free profile.
 *
 * Body: { url?: string; text?: string; image?: string (data URL); profile?: GFProfile }
 * Exactly one of url / text / image is required.
 */

interface Body {
  url?: string;
  text?: string;
  image?: string;
  /** Optional: label-only source link when the text was pasted / fetched on-device. */
  sourceUrl?: string;
  sourceName?: string;
  profile?: GFProfile | null;
}

const MODEL = process.env.SIFT_MODEL || "claude-haiku-4-5-20251001";

// Fetching + a vision call can take a while on cold starts.
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const profile = body.profile ?? null;
  const url = body.url?.trim();
  const pasted = body.text?.trim();
  const image = body.image?.trim();

  if (!url && !pasted && !image) {
    return NextResponse.json({ error: "Paste a link, some text, or a photo." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { mode: "error", error: "Recipe import isn't configured on this server yet." },
      { status: 503 }
    );
  }

  // 1) Gather the source text.
  let sourceText = pasted ?? "";
  let sourceName: string | undefined;
  let sourceUrl: string | undefined;
  if (!url && body.sourceUrl) {
    sourceUrl = body.sourceUrl;
    sourceName = body.sourceName;
    if (!sourceName) try {
      const h = new URL(body.sourceUrl).hostname.replace(/^www\./, "");
      sourceName = /instagram/.test(h) ? "Instagram" : /tiktok/.test(h) ? "TikTok" : h;
    } catch {
      /* ignore bad label url */
    }
  }

  if (url) {
    try {
      const src = await fetchSourceText(url);
      sourceUrl = url;
      sourceName = src.sourceName;
      if (src.blocked || !src.text) {
        return NextResponse.json({
          mode: "error",
          blocked: true,
          sourceName: src.sourceName,
          detail: src.detail,
          error:
            /instagram/i.test(src.sourceName)
              ? "Instagram didn't let us read that post. Copy the caption and paste it here instead."
              : /tiktok/i.test(src.sourceName)
                ? "TikTok didn't give us the caption. Copy the caption and paste it here instead."
                : "We couldn't read a recipe from that page. Try copying the recipe text and pasting it here.",
        });
      }
      sourceText = src.text;
    } catch (err) {
      return NextResponse.json({ mode: "error", error: `That link didn't work: ${String(err)}` });
    }
  }

  // 2) Ask the model to extract + judge + convert.
  try {
    const content: unknown[] = [];
    if (image) {
      const { mediaType, data } = parseImage(image);
      content.push({ type: "image", source: { type: "base64", media_type: mediaType, data } });
    }
    content.push({ type: "text", text: buildImportPrompt(sourceText, profile, !!image) });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        messages: [{ role: "user", content }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(extractJson(text)) as ModelOut;

    if (parsed.notARecipe) {
      return NextResponse.json({
        mode: "error",
        error: "That doesn't look like a recipe. Try a link to a recipe post or page.",
      });
    }

    const verdict = normalizeVerdict(parsed.verdict);
    const swaps: RecipeSwap[] = (parsed.swaps ?? []).map((s) => ({
      original: String(s.original ?? ""),
      replacement: String(s.replacement ?? ""),
      why: String(s.why ?? ""),
    }));
    const r = parsed.recipe ?? ({} as ModelRecipe);
    const recipe: Recipe = {
      id: uid(),
      title: r.title || parsed.originalTitle || "Imported recipe",
      cuisine: (r.cuisine as Recipe["cuisine"]) || "any",
      description: r.description || "",
      time: Number(r.time) || 30,
      servings: Number(r.servings) || 4,
      difficulty: r.difficulty,
      mealType: r.mealType,
      dairyFree: !!r.dairyFree,
      carnivore: !!r.carnivore,
      ingredients: (r.ingredients ?? []).map((i) => ({
        name: String(i.name ?? ""),
        quantity: String(i.quantity ?? ""),
      })),
      steps: (r.steps ?? []).map(String),
      glutenFreeNote: r.glutenFreeNote || parsed.summary || "",
      source: "imported",
      sourceUrl,
      sourceName,
      swaps,
      importVerdict: verdict,
    };

    const result: ImportResult = {
      verdict,
      summary: parsed.summary || defaultSummary(verdict, swaps.length),
      flagged: (parsed.flagged ?? []).map(String),
      swaps,
      recipe,
      originalTitle: parsed.originalTitle || recipe.title,
      sourceUrl,
      sourceName,
      mode: "ai",
    };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ mode: "error", error: String(err) });
  }
}

// ---------- prompt ----------

interface ModelRecipe {
  title?: string;
  cuisine?: string;
  description?: string;
  time?: number;
  servings?: number;
  difficulty?: Recipe["difficulty"];
  mealType?: Recipe["mealType"];
  dairyFree?: boolean;
  carnivore?: boolean;
  ingredients?: { name?: string; quantity?: string }[];
  steps?: string[];
  glutenFreeNote?: string;
}
interface ModelOut {
  notARecipe?: boolean;
  originalTitle?: string;
  verdict?: string;
  summary?: string;
  flagged?: string[];
  swaps?: Partial<RecipeSwap>[];
  recipe?: ModelRecipe;
}

function buildImportPrompt(source: string, profile: GFProfile | null, hasImage: boolean): string {
  const strictness = profile?.strictness ?? "relaxed";
  const cc = profile?.crossContamination;
  const ccText = cc
    ? [
        cc.sharedFryer ? "okay with shared fryers" : "must avoid shared fryers",
        cc.regularOats ? "okay with regular oats" : "needs certified gluten-free oats only",
        cc.mayContainTraces
          ? "okay with 'may contain traces' labels"
          : "must avoid 'may contain' / trace warnings",
      ].join("; ")
    : "general gluten-free";
  const extras: string[] = [];
  if (profile?.dairyFree) extras.push("also DAIRY-FREE (no milk, cheese, butter, cream, yogurt)");
  if (profile?.carnivore) extras.push("also eats carnivore (animal products only)");
  if (profile?.otherAvoidances?.length) extras.push(`also avoids: ${profile.otherAvoidances.join(", ")}`);
  const extraText = extras.length ? ` They ${extras.join("; ")}.` : "";

  const sourceBlock = hasImage
    ? source
      ? `The photo shows a recipe. Additional text from the user:\n${source}`
      : "The photo shows a recipe (cookbook page, screenshot, or handwritten card). Read it carefully."
    : `Here is the recipe source (it may be a web page, a social-media caption, or pasted text — ignore ads, comments, and unrelated chatter):\n"""\n${source}\n"""`;

  return `You are Sift, a careful gluten-free cooking assistant.

${sourceBlock}

The person eats gluten-free at a "${strictness}" level (${ccText}).${extraText}

Do three things:
1. Extract the recipe faithfully (title, ingredients with quantities, ordered steps, time, servings).
2. Judge it for THEIR gluten-free level. List every ingredient that contains or commonly hides gluten (wheat, barley, rye, malt, regular oats, soy sauce, seitan, many broths/sauces, "flour", breadcrumbs, beer, etc.) and note where cross-contamination matters at their level.
3. If it is not already safe, convert it: swap each problem ingredient for the closest gluten-free equivalent (e.g. soy sauce → tamari; all-purpose flour → 1:1 gluten-free flour blend; panko → gluten-free panko; regular oats → certified GF oats) and adjust steps or quantities if the swap changes technique (GF flour often needs a little more liquid or rest time; GF pasta cooks differently). Keep the dish recognizably the same. Prefer widely available swaps. If gluten is structural and there is no honest equivalent (seitan, real sourdough starter, true wheat-based ramen), set verdict to "not_convertible" and explain why — do NOT invent a bad substitute.

Verdict values:
- "gluten_free": original is already safe at their level with no changes (a note about double-checking labels is fine).
- "adapted": you made one or more swaps.
- "not_convertible": can't be made safe honestly.

If the source is clearly not a recipe at all, return {"notARecipe": true}.

Return ONLY valid JSON with this exact shape (no prose, no markdown fences):
{
  "originalTitle": string,
  "verdict": "gluten_free" | "adapted" | "not_convertible",
  "summary": string (one short line for a banner, e.g. "Already gluten-free — just check your broth label" or "Made gluten-free with 3 swaps"),
  "flagged": [string] (original ingredients that contain/may contain gluten; empty if none),
  "swaps": [{"original": string, "replacement": string, "why": string}] (empty if none),
  "recipe": {
    "title": string (the converted dish; keep the original name unless a swap changes it),
    "cuisine": one of "italian"|"mexican"|"french"|"american"|"asian"|"mediterranean"|"indian"|"any",
    "description": string (one sentence),
    "time": number (total minutes),
    "servings": number,
    "difficulty": "easy"|"medium"|"advanced",
    "mealType": "breakfast"|"lunch"|"dinner"|"side"|"snack"|"soup"|"dessert",
    "dairyFree": boolean,
    "carnivore": boolean,
    "ingredients": [{"name": string, "quantity": string}] (the CONVERTED list),
    "steps": [string] (the CONVERTED steps),
    "glutenFreeNote": string (why this version is safe at their level, and what to double-check on labels)
  }
}`;
}

// ---------- utils ----------

function normalizeVerdict(v?: string): ImportVerdict {
  if (v === "gluten_free" || v === "adapted" || v === "not_convertible") return v;
  return "adapted";
}

function defaultSummary(v: ImportVerdict, n: number): string {
  if (v === "gluten_free") return "Already gluten-free";
  if (v === "not_convertible") return "This one can't be made gluten-free";
  return n ? `Made gluten-free with ${n} swap${n === 1 ? "" : "s"}` : "Made gluten-free";
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}

function parseImage(raw: string): { mediaType: string; data: string } {
  const match = raw.match(/^data:(image\/[a-zA-Z+]+);base64,([\s\S]*)$/);
  if (match) return { mediaType: match[1], data: match[2] };
  return { mediaType: "image/jpeg", data: raw };
}
