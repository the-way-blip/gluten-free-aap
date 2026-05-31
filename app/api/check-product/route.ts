import { NextResponse } from "next/server";
import type { GFProfile } from "@/lib/types";
import { GLUTEN_TERMS } from "@/lib/gluten-reference";

interface Body {
  /** Optional photo of a product label / ingredient list (data URL or base64). */
  image?: string;
  /** Optional typed product name or pasted ingredient list. */
  text?: string;
  profile?: GFProfile | null;
}

export interface ProductVerdict {
  verdict: "safe" | "likely-safe" | "risky" | "not-safe" | "unknown";
  headline: string;
  explanation: string;
  /** Ingredients that triggered concern. */
  flagged: { name: string; reason: string }[];
}

const MODEL = process.env.SIFT_MODEL || "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const image = body.image ?? "";
  const text = (body.text ?? "").trim();
  const profile = body.profile ?? null;

  if (!image && !text) {
    return NextResponse.json({ error: "Provide an image or text" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key → deterministic keyword scan against the reference table.
  if (!apiKey) {
    return NextResponse.json({
      result: keywordScan(text),
      mode: "fallback",
    });
  }

  try {
    const strictness = profile?.strictness ?? "relaxed";
    const instruction = `You are helping someone who eats gluten-free at a "${strictness}" level decide whether a packaged product is safe.
${
  strictness === "strict"
    ? "They have celiac-level needs: flag 'may contain wheat', shared-facility warnings, and ambiguous ingredients as risky."
    : "They mainly avoid gluten ingredients; trace/'may contain' warnings are less critical for them."
}
Assess the ${image ? "product label in the image" : `product/ingredients: "${text}"`}.
Return ONLY JSON (no markdown):
{
  "verdict": "safe" | "likely-safe" | "risky" | "not-safe" | "unknown",
  "headline": string (short, e.g. "Looks gluten-free" or "Contains barley malt"),
  "explanation": string (1-2 sentences),
  "flagged": [{"name": string, "reason": string}]
}`;

    const content: unknown[] = [];
    if (image) {
      const { mediaType, data } = parseImage(image);
      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data },
      });
    }
    content.push({ type: "text", text: instruction });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        messages: [{ role: "user", content }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const json = await res.json();
    const raw: string = json?.content?.[0]?.text ?? "";
    const result = extractJson(raw);
    return NextResponse.json({ result, mode: "ai" });
  } catch (err) {
    return NextResponse.json({
      result: keywordScan(text),
      mode: "fallback",
      error: String(err),
    });
  }
}

function parseImage(raw: string): { mediaType: string; data: string } {
  const match = raw.match(/^data:(image\/[a-zA-Z+]+);base64,([\s\S]*)$/);
  if (match) return { mediaType: match[1], data: match[2] };
  return { mediaType: "image/jpeg", data: raw };
}

function extractJson(text: string): ProductVerdict {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1)) as ProductVerdict;
    } catch {
      /* fall through */
    }
  }
  return {
    verdict: "unknown",
    headline: "Couldn't read that",
    explanation: "Try a clearer photo of the ingredient list, or type it in.",
    flagged: [],
  };
}

/** Offline fallback: scan typed text against the known gluten terms. */
function keywordScan(text: string): ProductVerdict {
  const t = text.toLowerCase();
  if (!t) {
    return {
      verdict: "unknown",
      headline: "Add ingredients to check",
      explanation:
        "Type or paste the product's ingredient list (photo scanning needs an API key).",
      flagged: [],
    };
  }

  const flagged: { name: string; reason: string }[] = [];
  let worst: "contains" | "risky" | null = null;

  for (const entry of GLUTEN_TERMS) {
    if (entry.status !== "contains" && entry.status !== "risky") continue;
    const needles = [entry.term, ...(entry.aliases ?? [])].map((s) =>
      s.toLowerCase()
    );
    if (needles.some((n) => n.length > 2 && t.includes(n))) {
      flagged.push({ name: entry.term, reason: entry.note });
      if (entry.status === "contains") worst = "contains";
      else if (worst !== "contains") worst = "risky";
    }
  }

  if (worst === "contains") {
    return {
      verdict: "not-safe",
      headline: "Contains gluten",
      explanation: "Found one or more gluten-containing ingredients.",
      flagged,
    };
  }
  if (worst === "risky") {
    return {
      verdict: "risky",
      headline: "Some ingredients need checking",
      explanation:
        "Found ingredients that can sometimes contain gluten — verify the source.",
      flagged,
    };
  }
  return {
    verdict: "likely-safe",
    headline: "No gluten keywords found",
    explanation:
      "We didn't spot known gluten ingredients, but this is a basic text scan — always confirm with the label and any 'may contain' warnings.",
    flagged: [],
  };
}
