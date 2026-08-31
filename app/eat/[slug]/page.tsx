import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { slugify, SITE, DOWNLOAD_PATH } from "@/lib/seo";

/** Public, server-rendered SEO guide for one restaurant chain. */

export function generateStaticParams() {
  return SEED_RESTAURANTS.map((r) => ({ slug: slugify(r.name) }));
}

function find(slug: string) {
  return SEED_RESTAURANTS.find((r) => slugify(r.name) === slug);
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = find(params.slug);
  if (!r) return {};
  return {
    title: `Is ${r.name} Gluten-Free? What's Safe to Order (Celiac Guide) | Sift`,
    description: `${r.summary.slice(0, 140)}… Gluten-free menu options, shared-fryer info, and ordering tips for ${r.name}.`,
    alternates: { canonical: `${SITE}/eat/${params.slug}` },
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

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        Gluten-free restaurant guide
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        Is {r.name} gluten-free?
      </h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="chip bg-leaf-50 text-leaf-700">Best-case grade: {r.baseGrade}</span>
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

      <div className="card mt-10 p-5 text-center">
        <p className="font-semibold text-grain-900">
          This grade assumes a relaxed eater. Strict celiac? Sift re-grades every
          restaurant for <em>your</em> level — shared fryers, oats, traces and all.
        </p>
        <a href={DOWNLOAD_PATH} className="btn-primary mt-3 inline-flex">
          Get Sift free for iPhone
        </a>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        Guidance, not medical advice. Menus, ingredients and kitchen practices
        vary by location and change over time — always confirm with staff before
        ordering. <Link href="/eat" className="underline">All restaurant guides</Link>
      </p>
    </main>
  );
}
