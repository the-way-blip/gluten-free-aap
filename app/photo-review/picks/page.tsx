import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pickedPhotos, reviewEnabled } from "@/lib/pexels-candidates";
import { PHOTO_PICKS } from "@/lib/recipe-photo-picks";

/** Preview-only contact sheet of the picked recipe photos. 404s on production. */
export const dynamic = "force-static";
export const metadata: Metadata = { title: "Photo picks", robots: { index: false, follow: false } };

export default async function PhotoPicks() {
  if (!reviewEnabled()) notFound();
  const picked = await pickedPhotos(PHOTO_PICKS);
  return (
    <main style={{ padding: 8, maxWidth: "none" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {picked.map((r, i) => (
          <figure key={r.slug} style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${r.photo.original}?auto=compress&cs=tinysrgb&fit=crop&w=600&h=338`}
              alt={r.photo.alt}
              style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }}
            />
            <figcaption style={{ fontSize: 12, fontWeight: 700 }}>
              {i + 1}. {r.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
