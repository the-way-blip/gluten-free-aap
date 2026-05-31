import { NextResponse } from "next/server";
import type { GFProfile, Restaurant } from "@/lib/types";

interface Body {
  name?: string;
  profile?: GFProfile | null;
}

const MODEL = process.env.SIFT_MODEL || "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const name = (body.name ?? "").trim();
  const profile = body.profile ?? null;

  if (!name) {
    return NextResponse.json({ error: "Missing restaurant name" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      restaurant: fallbackGuide(name),
      mode: "fallback",
    });
  }

  try {
    const prompt = buildPrompt(name, profile);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? "";
    const json = extractJson(text);
    const parsed = JSON.parse(json) as Restaurant;
    parsed.id = slug(name);
    parsed.domain = parsed.domain || domainGuess(name);
    parsed.segment = parsed.segment || "sit-down";
    return NextResponse.json({ restaurant: parsed, mode: "ai" });
  } catch (err) {
    return NextResponse.json({
      restaurant: fallbackGuide(name),
      mode: "fallback",
      error: String(err),
    });
  }
}

function buildPrompt(name: string, profile: GFProfile | null): string {
  const strictness = profile?.strictness ?? "relaxed";
  return `A person eating gluten-free at a "${strictness}" level wants to know how to order at "${name}".
Assess this restaurant's gluten-free friendliness honestly. If you're unsure it exists, give your best general guidance for a place by that name/type.

Return ONLY valid JSON (no markdown) with this shape:
{
  "name": string,
  "category": string,
  "baseGrade": "A"|"B"|"C"|"D"|"F" (best-case grade for an ingredients-only eater),
  "dedicatedFryer": boolean (true if no shared-fryer risk),
  "crossContaminationProtocol": boolean,
  "hasGfMenu": boolean,
  "summary": string (2 sentences, honest),
  "menu": [{"name": string, "status": "naturally-gf"|"gf-modifiable"|"gf-menu-item"|"risky", "note": string}],
  "orderingTips": [string]
}`;
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
  return text;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Best-guess web domain for logo lookup, e.g. "Five Guys" -> "fiveguys.com". */
function domainGuess(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
}

/** Generic, honest guidance when no AI key is available. */
function fallbackGuide(name: string): Restaurant {
  return {
    id: slug(name),
    name,
    domain: domainGuess(name),
    segment: "sit-down",
    category: "Unknown — general guidance",
    baseGrade: "C",
    dedicatedFryer: false,
    crossContaminationProtocol: false,
    hasGfMenu: false,
    summary: `We don't have a detailed profile for ${name} yet. Here's the general playbook for ordering gluten-free safely anywhere.`,
    menu: [
      { name: "Grilled proteins (no marinade/sauce)", status: "gf-modifiable", note: "Ask about marinades — many contain soy sauce or flour." },
      { name: "Salads, no croutons", status: "gf-modifiable", note: "Confirm dressing is GF." },
      { name: "Plain rice / potatoes", status: "naturally-gf" },
      { name: "Anything fried, breaded, or floured", status: "risky" },
    ],
    orderingTips: [
      "Tell the server it's a gluten allergy, not a preference — kitchens take it more seriously.",
      "Ask if there's a dedicated fryer; if not, skip all fried items.",
      "Ask them to change gloves and use clean prep surfaces.",
      "When unsure, choose simple grilled protein + plain veg or rice.",
    ],
  };
}
