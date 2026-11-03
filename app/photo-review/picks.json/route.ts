import { NextResponse } from "next/server";
import { pickedPhotos, reviewEnabled } from "@/lib/pexels-candidates";
import { PHOTO_PICKS } from "@/lib/recipe-photo-picks";

/** Preview-only: full credit data for the picked photos. */
export const dynamic = "force-static";

export async function GET() {
  if (!reviewEnabled()) return new NextResponse("Not found", { status: 404 });
  const picked = await pickedPhotos(PHOTO_PICKS);
  return NextResponse.json(
    picked.map(({ slug, photo: p }) => ({
      slug,
      id: p.id,
      alt: p.alt,
      photographer: p.photographer,
      photographerUrl: p.photographerUrl,
      pageUrl: p.pageUrl,
      original: p.original,
    })),
    { headers: { "X-Robots-Tag": "noindex" } }
  );
}
