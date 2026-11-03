import { NextResponse } from "next/server";
import { allCandidates, reviewEnabled } from "@/lib/pexels-candidates";

/** Preview-only: compact candidate list for picking recipe photos. */
export const dynamic = "force-static";

export async function GET() {
  if (!reviewEnabled()) return new NextResponse("Not found", { status: 404 });
  const all = await allCandidates();
  return NextResponse.json(
    all.map((r) => ({
      slug: r.slug,
      q: r.query,
      c: r.candidates.map((c) => [c.id, c.alt, c.width, c.height, c.photographer]),
    })),
    { headers: { "X-Robots-Tag": "noindex" } }
  );
}
