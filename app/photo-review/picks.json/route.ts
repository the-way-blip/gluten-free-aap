import { NextResponse } from "next/server";
import { pickedPhotos, reviewEnabled } from "@/lib/pexels-candidates";
import { PHOTO_PICKS } from "@/lib/recipe-photo-picks";

/** Preview-only: full credit data for the picked photos, fetched on request. */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!reviewEnabled()) return new NextResponse("Not found", { status: 404 });
  const only = new URL(req.url).searchParams.get("only");
  const wanted = only
    ? Object.fromEntries(Object.entries(PHOTO_PICKS).filter(([slug]) => only.split(",").includes(slug)))
    : PHOTO_PICKS;
  const { found: picked, missing } = await pickedPhotos(wanted);
  return NextResponse.json({
    missing,
    photos: picked.map(({ slug, photo: p }) => ({
      slug,
      id: p.id,
      alt: p.alt,
      photographer: p.photographer,
      photographerUrl: p.photographerUrl,
      pageUrl: p.pageUrl,
      original: p.original,
    })),
  },
    { headers: { "X-Robots-Tag": "noindex" } }
  );
}
