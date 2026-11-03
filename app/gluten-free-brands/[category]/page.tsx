import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND_CATEGORIES } from "@/lib/gf-brands";
import { BRAND_PAGE_LABEL, brandCategorySlug, brandsIn, findBrandCategory } from "@/lib/brand-pages";
import { SITE, clip, breadcrumbLd, faqLd } from "@/lib/seo";
import { GuideCta, JsonLd } from "@/components/GuideCta";

/** Public SEO page: best gluten-free brands in one grocery category. */

export function generateStaticParams() {
  return BRAND_CATEGORIES.map((c) => ({ category: brandCategorySlug(c) }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const c = findBrandCategory(params.category);
  if (!c) return {};
  const label = BRAND_PAGE_LABEL[c];
  const names = brandsIn(c)
    .map((b) => b.brand)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4)
    .join(", ");
  return {
    title: `Best ${label} Brands | Sift`,
    description: clip(
      `The ${label.toLowerCase()} worth buying, including ${names}. Which are certified gluten-free, where they're made and what they're best for.`
    ),
    alternates: { canonical: `${SITE}/gluten-free-brands/${params.category}` },
  };
}

export default function BrandCategoryPage({ params }: { params: { category: string } }) {
  const c = findBrandCategory(params.category);
  if (!c) notFound();
  const label = BRAND_PAGE_LABEL[c];
  const brands = brandsIn(c);
  const certified = brands.filter((b) => b.certified);
  const others = BRAND_CATEGORIES.filter((o) => o !== c);

  const faqs = [
    {
      q: `What is the best ${label.toLowerCase()} brand?`,
      a: `Popular, widely available picks include ${brands
        .slice(0, 3)
        .map((b) => `${b.brand} ${b.product}`)
        .join(", ")}. The best one depends on taste and how strict you need to be.`,
    },
    {
      q: `Which ${label.toLowerCase()} brands are certified gluten-free?`,
      a:
        certified.length > 0
          ? `On this list: ${certified.map((b) => `${b.brand} ${b.product}`).join(", ")}. Certification means a third party tests the product for gluten.`
          : "None of the picks on this list carry a third-party certification, so check each label carefully.",
    },
  ];

  const ld = [
    breadcrumbLd([
      { name: "Gluten-free brands", path: "/gluten-free-brands" },
      { name: label, path: `/gluten-free-brands/${params.category}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${label} Brands`,
      itemListElement: brands.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${b.brand} ${b.product}`,
      })),
    },
    faqLd(faqs),
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd data={ld} />
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        <Link href="/gluten-free-brands" className="hover:underline">Gluten-free brands</Link>
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        Best {label.toLowerCase()} brands
      </h1>
      <p className="mt-3 leading-relaxed text-gray-700">
        These are {brands.length} {label.toLowerCase()} products that are easy to
        find in US grocery stores. {certified.length} of them carry a third-party
        gluten-free certification. If you have celiac disease, certified products
        made in a dedicated gluten-free facility are the safest choice.
      </p>

      <ol className="mt-6 space-y-3">
        {brands.map((b, i) => (
          <li key={`${b.brand}-${b.product}`} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-grain-900">
                {i + 1}. {b.brand} {b.product}
              </h2>
              {b.certified ? (
                <span className="chip shrink-0 bg-leaf-100 text-leaf-800">Certified GF</span>
              ) : (
                <span className="chip shrink-0 bg-grain-100 text-grain-800">Not certified</span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{b.note}</p>
          </li>
        ))}
      </ol>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">FAQ</h2>
      <dl className="mt-3 space-y-4">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-grain-900">{f.q}</dt>
            <dd className="mt-1 text-gray-700">{f.a}</dd>
          </div>
        ))}
      </dl>

      <GuideCta text="Add these to a gluten-free shopping list in one tap, and check any other label with your camera." />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">More brand guides</h2>
        <ul className="mt-2 space-y-1">
          {others.map((o) => (
            <li key={o}>
              <Link href={`/gluten-free-brands/${brandCategorySlug(o)}`} className="font-semibold text-leaf-700 underline">
                Best {BRAND_PAGE_LABEL[o].toLowerCase()} brands
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        Brands and certifications change. Always confirm the current label.
        Sift isn&apos;t paid by any brand listed here.
      </p>
    </main>
  );
}
