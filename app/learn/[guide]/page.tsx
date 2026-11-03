import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEARN_GUIDES } from "@/lib/learn-content";
import { LEARN_PAGE, learnSlug, findGuide } from "@/lib/learn-pages";
import { SITE, clip, breadcrumbLd } from "@/lib/seo";
import { GuideCta, JsonLd } from "@/components/GuideCta";

/** Public, server-rendered version of one Learn guide. */

export function generateStaticParams() {
  return LEARN_GUIDES.map((g) => ({ guide: learnSlug(g) }));
}

export function generateMetadata({ params }: { params: { guide: string } }): Metadata {
  const g = findGuide(params.guide);
  if (!g) return {};
  const meta = LEARN_PAGE[g.id];
  const first = g.sections[0]?.points.slice(0, 2).join(" ") ?? "";
  return {
    title: meta?.title ?? `${g.title} | Sift`,
    description: clip(`${g.blurb} ${first}`),
    alternates: { canonical: `${SITE}/learn/${params.guide}` },
  };
}

export default function LearnGuidePage({ params }: { params: { guide: string } }) {
  const g = findGuide(params.guide);
  if (!g) notFound();
  const h1 = LEARN_PAGE[g.id]?.h1 ?? g.title;

  const ld = [
    breadcrumbLd([
      { name: "Gluten-free guides", path: "/learn" },
      { name: h1, path: `/learn/${params.guide}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: h1,
      description: g.blurb,
      author: { "@type": "Organization", name: "Sift" },
      publisher: { "@type": "Organization", name: "Sift" },
      mainEntityOfPage: `${SITE}/learn/${params.guide}`,
    },
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd data={ld} />
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        <Link href="/learn" className="hover:underline">Gluten-free guides</Link>
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">{h1}</h1>
      <p className="mt-3 text-lg text-gray-600">{g.blurb}</p>

      {g.sections.map((s) => (
        <section key={s.heading} className="mt-8">
          <h2 className="font-display text-xl font-semibold text-grain-900">{s.heading}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
            {s.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}

      <GuideCta text="Sift tunes recipes, restaurant grades and label checks to how strict you need to be." />


      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        General guidance, not medical advice. Talk to your doctor or a dietitian
        about your own diet.
      </p>
    </main>
  );
}
