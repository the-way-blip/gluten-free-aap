import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { slugify, SITE, DOWNLOAD_PATH, clip, breadcrumbLd, faqLd } from "@/lib/seo";
import { gradeFor, GRADE_LABELS } from "@/lib/grading";
import type { GFProfile, Restaurant } from "@/lib/types";

/** Public, server-rendered SEO guide for one restaurant chain. */

export function generateStaticParams() {
  return SEED_RESTAURANTS.map((r) => ({ slug: slugify(r.name) }));
}

function find(slug: string) {
  return SEED_RESTAURANTS.find((r) => slugify(r.name) === slug);
}

/** A strict celiac eater: no shared fryers, surfaces, traces or regular oats. */
const STRICT_CELIAC: GFProfile = {
  reason: "celiac",
  strictness: "strict",
  crossContamination: {
    sharedFryer: false,
    sharedSurfaces: false,
    mayContainTraces: false,
    regularOats: false,
  },
  otherAvoidances: [],
  createdAt: 0,
};

function fryerAnswer(r: Restaurant): string {
  if (r.fryer === "none")
    return `${r.name} doesn't use a deep fryer, so there's no shared-fryer risk.`;
  if (r.fryer === "dedicated")
    return `No. ${r.name} cooks fries in a dedicated fryer, so they don't share oil with breaded food. Confirm at your location, since practices can vary.`;
  if (r.dedicatedFryer)
    return `There's no shared-fryer risk at ${r.name}.`;
  return `Yes. Fried food at ${r.name} shares oil with breaded items, so fried foods aren't safe for celiac even when the item itself has no gluten.`;
}

function faqsFor(r: Restaurant) {
  const strict = gradeFor(r, STRICT_CELIAC);
  return [
    {
      q: `Does ${r.name} have a gluten-free menu?`,
      a: r.hasGfMenu
        ? `Yes. ${r.name} publishes a gluten-free or allergen menu. Ask for it when you order, and confirm with staff since items vary by location.`
        : `${r.name} doesn't publish a dedicated gluten-free menu, so stick to the naturally gluten-free and modifiable items above and confirm with staff.`,
    },
    { q: `Does ${r.name} use a shared fryer?`, a: fryerAnswer(r) },
    {
      q: `Is ${r.name} safe for celiac?`,
      a: `Sift grades ${r.name} ${strict.letter} (${GRADE_LABELS[strict.letter].toLowerCase()}) for a strict celiac eater, versus ${r.baseGrade} for someone only avoiding gluten as an ingredient. ${strict.reasons.join(" ")}`,
    },
  ];
}

function titleFor(name: string): string {
  const t = `Is ${name} Gluten-Free? Celiac Ordering Guide`;
  return t.length + 7 <= 60 ? `${t} | Sift` : t;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = find(params.slug);
  if (!r) return {};
  const url = `${SITE}/eat/${params.slug}`;
  return {
    title: titleFor(r.name),
    description: clip(`${r.summary} What to order, shared-fryer info and celiac tips.`),
    alternates: { canonical: url },
    openGraph: {
      title: `Is ${r.name} gluten-free?`,
      description: clip(r.summary),
      url,
      siteName: "Sift",
      type: "article",
      images: ["/ad/sift-ad-import.png"],
    },
  };
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  "naturally-gf": { label: "Naturally gluten-free", cls: "bg-leaf-100 text-leaf-800" },
  "gf-modifiable": { label: "Gluten-free if modified", cls: "bg-grain-100 text-grain-800" },
  "gf-menu-item": { label: "On the GF menu", cls: "bg-leaf-100 text-leaf-800" },
  risky: { label: "Risky — skip or verify", cls: "bg-clay-100 text-clay-800" },
};

export default function EatPage({ params }: { params: { slug: string } }) {
  const r = find(params.slug);
  if (!r) notFound();
  const faqs = faqsFor(r);
  const strict = gradeFor(r, STRICT_CELIAC);
  const related = SEED_RESTAURANTS.filter(
    (o) => o.category === r.category && o.id !== r.id
  ).slice(0, 6);
  const ld = [
    breadcrumbLd([
      { name: "Restaurant guides", path: "/eat" },
      { name: r.name, path: `/eat/${params.slug}` },
    ]),
    faqLd(faqs),
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        <Link href="/eat" className="hover:underline">Gluten-free restaurant guides</Link>
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        Is {r.name} gluten-free?
      </h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="chip bg-leaf-50 text-leaf-700">Best-case grade: {r.baseGrade}</span>
        <span className="chip bg-grain-100 text-grain-800">Strict celiac grade: {strict.letter}</span>
        <span className={`chip ${r.dedicatedFryer ? "bg-leaf-50 text-leaf-700" : "bg-clay-100 text-clay-800"}`}>
          {r.fryer === "none" ? "No fryer" : r.dedicatedFryer ? "Dedicated fryer" : "Shared fryer — caution"}
        </span>
        {r.hasGfMenu && <span className="chip bg-grain-100 text-grain-800">Has a GF menu</span>}
      </div>

      <p className="mt-4 leading-relaxed text-gray-700">{r.summary}</p>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">
        What&apos;s safe to order at {r.name}
      </h2>
      <ul className="mt-3 space-y-3">
        {r.menu.map((m, i) => {
          const st = STATUS_LABEL[m.status] ?? STATUS_LABEL.risky;
          return (
            <li key={i} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-grain-900">{m.name}</span>
                <span className={`chip shrink-0 ${st.cls}`}>{st.label}</span>
              </div>
              {m.note && <p className="mt-1 text-sm text-gray-600">{m.note}</p>}
            </li>
          );
        })}
      </ul>

      {r.orderingTips.length > 0 && (
        <>
          <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">
            How to order gluten-free at {r.name}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
            {r.orderingTips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </>
      )}

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">
        {r.name} gluten-free FAQ
      </h2>
      <dl className="mt-3 space-y-4">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-grain-900">{f.q}</dt>
            <dd className="mt-1 text-gray-700">{f.a}</dd>
          </div>
        ))}
      </dl>

      <div className="card mt-10 p-5 text-center">
        <p className="font-semibold text-grain-900">
          The best-case grade assumes a relaxed eater. Strict celiac? Sift re-grades every
          restaurant for <em>your</em> level — shared fryers, oats, traces and all.
        </p>
        <a href={DOWNLOAD_PATH} className="btn-primary mt-3 inline-flex">
          Get Sift free for iPhone
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            More {r.category.toLowerCase()} guides
          </h2>
          <ul className="mt-2 space-y-1">
            {related.map((o) => (
              <li key={o.id}>
                <Link href={`/eat/${slugify(o.name)}`} className="font-semibold text-leaf-700 underline">
                  Is {o.name} gluten-free?
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        Guidance, not medical advice. Menus, ingredients and kitchen practices
        vary by location and change over time — always confirm with staff before
        ordering. <Link href="/eat" className="underline">All restaurant guides</Link>
      </p>
    </main>
  );
}
