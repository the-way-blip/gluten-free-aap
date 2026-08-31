import Link from "next/link";
import type { Metadata } from "next";
import { GLUTEN_TERMS, STATUS_META } from "@/lib/gluten-reference";
import { slugify, DOWNLOAD_PATH } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Is It Gluten-Free? 100+ Ingredients Explained | Sift",
  description:
    "Quick answers for 100+ ingredients and label terms — soy sauce, malt, maltodextrin, oats, modified food starch and more. Know what contains gluten before you buy.",
};

export default function GfIndexPage() {
  const sorted = [...GLUTEN_TERMS].sort(
    (a, b) => STATUS_META[a.status].order - STATUS_META[b.status].order || a.term.localeCompare(b.term)
  );
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-display text-3xl font-semibold text-grain-900">
        Is it gluten-free?
      </h1>
      <p className="mt-2 text-gray-600">
        Plain-English answers for {GLUTEN_TERMS.length}+ ingredients and label
        terms. Always verify the actual label — formulations vary by brand.
      </p>
      <ul className="mt-6 space-y-1.5">
        {sorted.map((t) => (
          <li key={t.term} className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${STATUS_META[t.status].dot}`} />
            <Link href={`/gf/${slugify(t.term)}`} className="font-semibold text-leaf-700 underline">
              Is {t.term.toLowerCase()} gluten-free?
            </Link>
          </li>
        ))}
      </ul>
      <div className="card mt-10 p-5 text-center">
        <p className="font-semibold text-grain-900">
          Or just photograph the label — Sift flags hidden gluten in seconds.
        </p>
        <a href={DOWNLOAD_PATH} className="btn-primary mt-3 inline-flex">
          Get Sift free for iPhone
        </a>
      </div>
    </main>
  );
}
