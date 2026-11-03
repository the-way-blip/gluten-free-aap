import { PUBLIC_RECIPES, recipeSlug } from "./recipe-pages";
import { PHOTO_QUERIES } from "./recipe-photo-queries";

/**
 * Preview-only helper: searches Pexels for candidate photos per recipe so a
 * person can pick close matches. Never runs on production builds, and the API
 * key is only read from the environment (never logged or rendered).
 */

export type Candidate = {
  id: number;
  alt: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  pageUrl: string;
  original: string;
  thumb: string;
};

export type RecipeCandidates = { slug: string; title: string; query: string; candidates: Candidate[] };

export function reviewEnabled(): boolean {
  return process.env.VERCEL_ENV === "preview" && !!process.env.PEXELS_API_KEY;
}

async function search(query: string): Promise<Candidate[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: process.env.PEXELS_API_KEY ?? "" },
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { photos?: any[] };
    return (json.photos ?? []).map((p) => ({
      id: p.id,
      alt: p.alt ?? "",
      width: p.width,
      height: p.height,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      pageUrl: p.url,
      original: p.src?.original,
      thumb: p.src?.medium,
    }));
  } catch {
    return [];
  }
}

export async function allCandidates(): Promise<RecipeCandidates[]> {
  if (!reviewEnabled()) return [];
  const out: RecipeCandidates[] = [];
  for (const r of PUBLIC_RECIPES) {
    const slug = recipeSlug(r);
    const query = PHOTO_QUERIES[slug] ?? r.title;
    out.push({ slug, title: r.title, query, candidates: await search(query) });
  }
  return out;
}

/** Preview-only: looks up one photo by id (one API call, cached). */
async function photoById(id: number): Promise<Candidate | null> {
  try {
    const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
      headers: { Authorization: process.env.PEXELS_API_KEY ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const p = (await res.json()) as any;
    return {
      id: p.id,
      alt: p.alt ?? "",
      width: p.width,
      height: p.height,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      pageUrl: p.url,
      original: p.src?.original,
      thumb: p.src?.medium,
    };
  } catch {
    return null;
  }
}

/** Preview-only: the picked photo for each recipe in PHOTO_PICKS, plus any ids that failed. */
export async function pickedPhotos(picks: Record<string, number>) {
  if (!reviewEnabled()) return { found: [], missing: [] as string[] };
  const titles = new Map(PUBLIC_RECIPES.map((r) => [recipeSlug(r), r.title]));
  const found: { slug: string; title: string; photo: Candidate }[] = [];
  const missing: string[] = [];
  for (const [slug, id] of Object.entries(picks)) {
    const photo = await photoById(id);
    if (photo) found.push({ slug, title: titles.get(slug) ?? slug, photo });
    else missing.push(slug);
  }
  return { found, missing };
}
