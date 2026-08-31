/**
 * Server-only helpers that turn a link into recipe text Sift can reason about.
 *
 * Strategy, in order of reliability:
 *  1. Recipe sites → schema.org JSON-LD `Recipe` (name, ingredients, steps…)
 *  2. TikTok → public oEmbed (caption lives in `title`)
 *  3. Instagram / everything else → OpenGraph meta (og:title / og:description),
 *     falling back to the visible page text.
 *
 * Whatever we find is handed to the model as plain text; the model does the
 * actual recipe extraction + gluten analysis. If a platform blocks us (common
 * for Instagram), we return `blocked: true` so the UI can ask the user to paste
 * the caption instead.
 */

export interface SourceText {
  /** Text to feed the model — structured when we have it. */
  text: string;
  /** Human-readable source label, e.g. "Half Baked Harvest" or "TikTok". */
  sourceName: string;
  /** True when we found a real schema.org Recipe object. */
  structured: boolean;
  /** True when the platform refused to give us anything useful. */
  blocked: boolean;
  /** Diagnostic: what the fetch returned (status / content length). */
  detail?: string;
}

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

const FETCH_TIMEOUT_MS = 9000;
const MAX_TEXT = 12000;

export async function fetchSourceText(rawUrl: string): Promise<SourceText> {
  const url = normalizeUrl(rawUrl);
  const host = new URL(url).hostname.replace(/^www\./, "");

  if (/(^|\.)tiktok\.com$/.test(host)) return fetchTikTok(url);
  if (/(^|\.)instagram\.com$/.test(host)) return fetchInstagram(url);
  return fetchGeneric(url, host);
}

// ---------- Pure extraction (safe to run in the browser too) ----------

/**
 * Turn already-fetched HTML into recipe text. Used by the server after its own
 * fetch, and by the native app after fetching the page on-device (which gets
 * around publisher bot-blocks that reject datacenter IPs).
 */
export function extractFromHtml(html: string, rawUrl: string): SourceText {
  let host = "";
  try {
    host = new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    /* label only */
  }
  if (/(^|\.)instagram\.com$/.test(host)) return parseInstagramHtml(html);
  if (/(^|\.)tiktok\.com$/.test(host)) {
    const desc = meta(html, "og:description") || meta(html, "description");
    return {
      text: desc ? `TikTok caption:\n${desc}` : "",
      sourceName: "TikTok",
      structured: false,
      blocked: !desc || desc.length < 20,
    };
  }
  return parseGenericHtml(html, host);
}

function parseGenericHtml(html: string, host: string): SourceText {
  const siteName = meta(html, "og:site_name") || host;
  const recipe = findJsonLdRecipe(html);
  if (recipe) {
    return { text: recipeToText(recipe), sourceName: siteName, structured: true, blocked: false };
  }
  const title = meta(html, "og:title") || tag(html, "title") || "";
  const desc = meta(html, "og:description") || "";
  const body = htmlToText(html);
  const text = [title && `Title: ${title}`, desc && `Description: ${desc}`, body]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_TEXT);
  return {
    text,
    sourceName: siteName,
    structured: false,
    blocked: text.length < 80,
    detail: `no JSON-LD recipe; text ${text.length} chars`,
  };
}

function parseInstagramHtml(html: string): SourceText {
  const desc = decodeEntities(meta(html, "og:description") || meta(html, "description") || "");
  const title = decodeEntities(meta(html, "og:title") || "");
  // Instagram's og:description looks like: `123 likes, 4 comments - user on Aug 1, 2026: "caption…"`.
  const captionMatch = desc.match(/:\s*"([\s\S]+)"\s*$/);
  const caption = (captionMatch ? captionMatch[1] : desc).trim();
  const who = title.match(/^(.+?) on Instagram/)?.[1];
  const blocked = caption.length < 20 || /log in|login/i.test(title);
  return {
    text: blocked ? "" : `Instagram caption${who ? ` by ${who}` : ""}:\n${caption}`,
    sourceName: who ? `${who} on Instagram` : "Instagram",
    structured: false,
    blocked,
  };
}

// ---------- Recipe sites ----------

async function fetchGeneric(url: string, host: string): Promise<SourceText> {
  const got = await getHtmlDetailed(url);
  if (!got.html) return { text: "", sourceName: host, structured: false, blocked: true, detail: got.detail };
  const out = parseGenericHtml(got.html, host);
  return { ...out, detail: `${got.detail}; ${out.detail ?? "JSON-LD recipe"}` };
}

// ---------- TikTok ----------

async function fetchTikTok(url: string): Promise<SourceText> {
  // Public oEmbed — no auth needed, returns the caption as `title`.
  try {
    const res = await fetchWithTimeout(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { headers: { "user-agent": UA, accept: "application/json" } }
    );
    if (res.ok) {
      const j = (await res.json()) as { title?: string; author_name?: string };
      const caption = (j.title || "").trim();
      if (caption.length > 20) {
        return {
          text: `TikTok caption${j.author_name ? ` by @${j.author_name}` : ""}:\n${caption}`,
          sourceName: j.author_name ? `@${j.author_name} on TikTok` : "TikTok",
          structured: false,
          blocked: false,
        };
      }
    }
  } catch {
    /* fall through */
  }
  // Fallback: og tags on the page.
  const html = await getHtml(url);
  const desc = html ? meta(html, "og:description") || meta(html, "description") : "";
  return {
    text: desc ? `TikTok caption:\n${desc}` : "",
    sourceName: "TikTok",
    structured: false,
    blocked: !desc || desc.length < 20,
  };
}

// ---------- Instagram ----------

async function fetchInstagram(url: string): Promise<SourceText> {
  // Instagram often serves OpenGraph tags to logged-out mobile UAs for public
  // posts/reels; when it doesn't, we report `blocked` and the UI asks the user
  // to paste the caption (or the native app fetches on-device).
  const got = await getHtmlDetailed(url);
  if (!got.html) return { text: "", sourceName: "Instagram", structured: false, blocked: true, detail: got.detail };
  return { ...parseInstagramHtml(got.html), detail: got.detail };
}

// ---------- JSON-LD ----------

type JsonLdRecipe = {
  name?: string;
  description?: string;
  recipeIngredient?: string[];
  recipeInstructions?: unknown;
  totalTime?: string;
  prepTime?: string;
  cookTime?: string;
  recipeYield?: string | string[] | number;
  recipeCuisine?: string | string[];
  recipeCategory?: string | string[];
  author?: { name?: string } | { name?: string }[] | string;
};

function findJsonLdRecipe(html: string): JsonLdRecipe | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1].trim());
    } catch {
      continue;
    }
    const found = walkForRecipe(parsed);
    if (found) return found;
  }
  return null;
}

function walkForRecipe(node: unknown, depth = 0): JsonLdRecipe | null {
  if (!node || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = walkForRecipe(n, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof node === "object") {
    const o = node as Record<string, unknown>;
    const type = o["@type"];
    const types = Array.isArray(type) ? type : [type];
    if (types.some((t) => typeof t === "string" && t.toLowerCase() === "recipe")) {
      return o as JsonLdRecipe;
    }
    if (o["@graph"]) return walkForRecipe(o["@graph"], depth + 1);
    // Some sites nest the recipe under mainEntity / itemListElement.
    for (const k of ["mainEntity", "itemListElement", "hasPart"]) {
      if (o[k]) {
        const r = walkForRecipe(o[k], depth + 1);
        if (r) return r;
      }
    }
  }
  return null;
}

function recipeToText(r: JsonLdRecipe): string {
  const lines: string[] = [];
  if (r.name) lines.push(`Title: ${decodeEntities(String(r.name))}`);
  if (r.description) lines.push(`Description: ${decodeEntities(stripTags(String(r.description)))}`);
  const author =
    typeof r.author === "string"
      ? r.author
      : Array.isArray(r.author)
        ? r.author[0]?.name
        : r.author?.name;
  if (author) lines.push(`Author: ${author}`);
  const cuisine = arr(r.recipeCuisine).join(", ");
  if (cuisine) lines.push(`Cuisine: ${cuisine}`);
  const category = arr(r.recipeCategory).join(", ");
  if (category) lines.push(`Category: ${category}`);
  const total = isoMinutes(r.totalTime) || isoMinutes(r.prepTime) + isoMinutes(r.cookTime);
  if (total) lines.push(`Total time: ${total} minutes`);
  const yieldText = arr(r.recipeYield as string | string[])[0];
  if (yieldText) lines.push(`Yield: ${yieldText}`);
  if (r.recipeIngredient?.length) {
    lines.push("Ingredients:");
    for (const i of r.recipeIngredient) lines.push(`- ${decodeEntities(stripTags(String(i)))}`);
  }
  const steps = flattenInstructions(r.recipeInstructions);
  if (steps.length) {
    lines.push("Instructions:");
    steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  }
  return lines.join("\n").slice(0, MAX_TEXT);
}

function flattenInstructions(v: unknown, out: string[] = []): string[] {
  if (!v) return out;
  if (typeof v === "string") {
    // Some sites cram all steps into one string separated by newlines.
    for (const s of v.split(/\n+/)) {
      const t = decodeEntities(stripTags(s)).trim();
      if (t) out.push(t);
    }
    return out;
  }
  if (Array.isArray(v)) {
    for (const item of v) flattenInstructions(item, out);
    return out;
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.itemListElement) return flattenInstructions(o.itemListElement, out);
    const text = (o.text ?? o.name) as string | undefined;
    if (text) out.push(decodeEntities(stripTags(String(text))).trim());
  }
  return out;
}

// ---------- utils ----------

function normalizeUrl(raw: string): string {
  let u = raw.trim();
  // Users often paste "check this out https://…" — pull the first URL.
  const m = u.match(/https?:\/\/[^\s"'<>]+/i);
  if (m) u = m[0];
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  const parsed = new URL(u);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("Only http(s) links are supported");
  return parsed.toString();
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

async function getHtml(url: string): Promise<string | null> {
  return (await getHtmlDetailed(url)).html;
}

async function getHtmlDetailed(url: string): Promise<{ html: string | null; detail: string }> {
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
      },
    });
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) return { html: null, detail: `HTTP ${res.status}` };
    if (!/html|xml|text/.test(ct)) return { html: null, detail: `content-type ${ct}` };
    const html = await res.text();
    return { html: html.slice(0, 1_500_000), detail: `HTTP ${res.status}, ${html.length} bytes` };
  } catch (e) {
    return { html: null, detail: `fetch failed: ${String(e)}` };
  }
}

function meta(html: string, name: string): string {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i"
  );
  const m = html.match(re) || html.match(re2);
  return m ? decodeEntities(m[1]).trim() : "";
}

function tag(html: string, t: string): string {
  const m = html.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, "i"));
  return m ? decodeEntities(stripTags(m[1])).trim() : "";
}

function htmlToText(html: string): string {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<(br|p|div|li|h[1-6]|tr)[^>]*>/gi, "\n");
  s = stripTags(s);
  return decodeEntities(s).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function arr(v: string | string[] | number | undefined): string[] {
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).map(String).filter(Boolean);
}

/** ISO-8601 duration ("PT1H30M") → minutes. */
function isoMinutes(v?: string): number {
  if (!v) return 0;
  const m = v.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return 0;
  return (Number(m[1] || 0) * 24 + Number(m[2] || 0)) * 60 + Number(m[3] || 0);
}
