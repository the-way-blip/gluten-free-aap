import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GLUTEN_TERMS, STATUS_META } from "@/lib/gluten-reference";
import { slugify, SITE, DOWNLOAD_PATH } from "@/lib/seo";

/** Public, server-rendered SEO page: "Is <ingredient> gluten-free?" */

export function generateStaticParams() {
  return GLUTEN_TERMS.map((t) => ({ slug: slugify(t.term) }));
}

function find(slug: string) {
  return GLUTEN_TERMS.find((t) => slugify(t.term) === slug);
}

const ANSWER: Record<string, string> = {
  contains: "No — it contains gluten.",
  risky: "Sometimes — it depends on the brand, so verify the label.",
  "usually-safe": "Usually — but check the label to be sure.",
  safe: "Yes — it's gluten-free.",
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = find(params.slug);
  if (!t) return {};
  return {
    title: `Is ${t.term} Gluten-Free? | Sift`,
    description: `${ANSWER[t.status]} ${t.note}`.slice(0, 155),
    alternates: { canonical: `${SITE}/gf/${params.slug}` },
  };
}

export default function GfTermPage({ params }: { params: { slug: string } }) {
  const t = find(params.slug);
  if (!t) notFound();
  const meta = STATUS_META[t.status];

  const related = GLUTEN_TERMS.filter(
    (o) => o.status === t.status && o.term !== t.term
  ).slice(0, 6);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        Gluten-free ingredient guide
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        Is {t.term.toLowerCase()} gluten-free?
      </h1>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-block h-3 w-3 rounded-full ${meta.dot}`} />
        <span className={`chip ${meta.chip}`}>{meta.label}</span>
      </div>
      <p className="mt-4 text-lg font-semibold text-grain-900">{ANSWER[t.status]}</p>
      <p className="mt-2 leading-relaxed text-gray-700">{t.note}</p>
      {t.aliases && t.aliases.length > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Also appears on labels as: {t.aliases.join(", ")}.
        </p>
      )}

      <div className="card mt-10 p-5 text-center">
        <p className="font-semibold text-grain-900">
          Standing in the aisle? Photograph the ingredient list and Sift flags
          hidden gluten in seconds — tuned to how strict you need to be.
        </p>
        <a href={DOWNLOAD_PATH} className="btn-primary mt-3 inline-flex">
          Get Sift free for iPhone
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Related</h2>
          <ul className="mt-2 space-y-1">
            {related.map((o) => (
              <li key={o.term}>
                <Link href={`/gf/${slugify(o.term)}`} className="font-semibold text-leaf-700 underline">
                  Is {o.term.toLowerCase()} gluten-free?
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        General guidance, not medical advice. Formulations change — always
        confirm with the current label. <Link href="/gf" className="underline">All ingredient guides</Link>
      </p>
    </main>
  );
}
