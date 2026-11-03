import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allCandidates, reviewEnabled } from "@/lib/pexels-candidates";

/** Preview-only page for picking recipe photos. 404s on production. */

export const dynamic = "force-static";
export const metadata: Metadata = { title: "Photo review", robots: { index: false, follow: false } };

export default async function PhotoReview() {
  if (!reviewEnabled()) notFound();
  const all = await allCandidates();
  return (
    <main style={{ padding: 16, maxWidth: "none" }}>
      <h1>Recipe photo candidates ({all.length})</h1>
      {all.map((r) => (
        <section key={r.slug} id={r.slug} style={{ marginTop: 24 }}>
          <h2 style={{ fontWeight: 700 }}>
            {r.title} <small>({r.slug}, query: {r.query})</small>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {r.candidates.map((c, i) => (
              <figure key={c.id} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.thumb} alt={c.alt} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                <figcaption style={{ fontSize: 11 }}>
                  #{i + 1} {c.id}: {c.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
