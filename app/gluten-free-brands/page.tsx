import Link from "next/link";
import type { Metadata } from "next";
import { BRAND_CATEGORIES } from "@/lib/gf-brands";
import { BRAND_PAGE_LABEL, brandCategorySlug, brandsIn } from "@/lib/brand-pages";
import { breadcrumbLd } from "@/lib/seo";
import { GuideCta, JsonLd } from "@/components/GuideCta";

export const metadata: Metadata = {
  title: "Best Gluten-Free Brands by Category (Celiac-Friendly Picks) | Sift",
  description:
    "The gluten-free bread, pasta, flour, crackers, cereal, cookies, sauces, frozen pizza and baking mixes worth buying, with which ones are certified gluten-free.",
  alternates: { canonical: "/gluten-free-brands" },
};

export default function BrandsIndexPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Gluten-free brands", path: "/gluten-free-brands" }])} />
      <h1 className="font-display text-3xl font-semibold text-grain-900">
        The best gluten-free brands to buy
      </h1>
      <p className="mt-2 text-gray-600">
        Widely available gluten-free products, sorted by aisle. We note which
        ones carry a third-party gluten-free certification. Formulations change,
        so always check the current label.
      </p>
      <ul className="mt-6 space-y-3">
        {BRAND_CATEGORIES.map((c) => (
          <li key={c} className="card p-4">
            <Link
              href={`/gluten-free-brands/${brandCategorySlug(c)}`}
              className="font-semibold text-leaf-700 underline"
            >
              Best {BRAND_PAGE_LABEL[c].toLowerCase().replace("gluten-free", "gluten-free")} brands
            </Link>
            <p className="mt-1 text-sm text-gray-600">
              {brandsIn(c)
                .map((b) => b.brand)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(", ")}
            </p>
          </li>
        ))}
      </ul>
      <GuideCta text="Sift builds your gluten-free shopping list with these brands and checks any label you're unsure about." />
    </main>
  );
}
