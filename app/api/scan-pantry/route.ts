import { NextResponse } from "next/server";

interface Body {
  /** Data URL or raw base64 of a JPEG/PNG photo. */
  image?: string;
}

const MODEL = process.env.SIFT_MODEL || "claude-haiku-4-5-20251001";

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const raw = body.image ?? "";

  if (!raw) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const { mediaType, data } = parseImage(raw);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key → return a small sample so the flow stays clickable in the prototype.
  if (!apiKey) {
    return NextResponse.json({
      items: ["Eggs", "Milk", "Butter", "Carrots", "Cheese"],
      mode: "fallback",
    });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data },
              },
              {
                type: "text",
                text: `Look at this photo of a fridge or pantry. List the distinct food ingredients you can identify.
Use simple, recipe-friendly names (e.g. "eggs", "cheddar cheese", "carrots", "ketchup").
Combine duplicates. Ignore non-food items.
Return ONLY a JSON array of strings, no prose or markdown. Example: ["eggs","milk","spinach"]`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const json = await res.json();
    const text: string = json?.content?.[0]?.text ?? "";
    const items = parseItems(text);
    return NextResponse.json({ items, mode: "ai" });
  } catch (err) {
    return NextResponse.json({
      items: [],
      mode: "error",
      error: String(err),
    });
  }
}

function parseImage(raw: string): { mediaType: string; data: string } {
  const match = raw.match(/^data:(image\/[a-zA-Z+]+);base64,([\s\S]*)$/);
  if (match) return { mediaType: match[1], data: match[2] };
  // Assume a bare base64 JPEG if there's no data-URL prefix.
  return { mediaType: "image/jpeg", data: raw };
}

function parseItems(text: string): string[] {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  const slice =
    start !== -1 && end !== -1 && end > start
      ? text.slice(start, end + 1)
      : text;
  try {
    const arr = JSON.parse(slice);
    if (Array.isArray(arr)) {
      return arr
        .map((x) => String(x).trim())
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .slice(0, 40);
    }
  } catch {
    /* fall through to empty */
  }
  return [];
}
