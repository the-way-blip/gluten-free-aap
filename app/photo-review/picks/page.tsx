import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { reviewEnabled } from "@/lib/pexels-candidates";
import { PHOTO_PICKS } from "@/lib/recipe-photo-picks";
import { PUBLIC_RECIPES, recipeSlug } from "@/lib/recipe-pages";

/** Preview-only contact sheet of the picked recipe photos. 404s on production. */
export const dynamic = "force-static";
export const metadata: Metadata = { title: "Photo picks", robots: { index: false, follow: false } };

export default function PhotoPicks() {
  if (!reviewEnabled()) notFound();
  const titles = new Map(PUBLIC_RECIPES.map((r) => [recipeSlug(r), r.title]));
  const picks = Object.entries(PHOTO_PICKS);
  return (
    <main style={{ padding: 8, maxWidth: "none" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {picks.map(([slug, id], i) => (
          <figure key={slug} style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=600&h=338`}
              alt=""
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
            />
            <figcaption style={{ fontSize: 12, fontWeight: 700 }}>
              {i + 1}. {titles.get(slug) ?? slug}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
