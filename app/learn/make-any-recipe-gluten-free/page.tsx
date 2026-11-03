import Link from "next/link";
import type { Metadata } from "next";
import { COMMON_SWAPS, HARD_TO_CONVERT } from "@/lib/swaps";
import { slugify, breadcrumbLd, faqLd } from "@/lib/seo";
import { GLUTEN_TERMS } from "@/lib/gluten-reference";
import { GuideCta, JsonLd } from "@/components/GuideCta";

export const metadata: Metadata = {
  title: "How to Make Any Recipe Gluten-Free (Swap Chart) | Sift",
  description:
    "A simple swap chart for turning any recipe gluten-free: flour, soy sauce, pasta, breadcrumbs, thickeners, beer and more, plus the dishes that don't convert.",
  alternates: { canonical: "/learn/make-any-recipe-gluten-free" },
};

const STEPS = [
  "Read the ingredient list and mark anything made from wheat, barley or rye, including hidden sources like soy sauce, malt and some broths.",
  "Swap each one using the chart below.",
  "Check the labels on packaged ingredients (spices, sauces, broth, chocolate chips) for a gluten-free claim.",
  "Expect small technique changes: gluten-free flour often needs a bit more liquid or a short rest, and gluten-free pasta cooks faster.",
  "If you have celiac, keep the cooking gluten-free too: clean pans, separate toaster, and fresh oil for frying.",
];

export default function MakeAnyRecipeGfPage() {
  const faqs = [
    {
      q: "Can I just swap regular flour for gluten-free flour?",
      a: "For cookies, cakes, muffins and quick breads, a 1-to-1 gluten-free flour blend usually works. Yeast breads need a blend made for bread or a dedicated gluten-free bread recipe.",
    },
    {
      q: "What can I use instead of soy sauce?",
      a: "Tamari or a soy sauce labeled gluten-free. Regular soy sauce is brewed with wheat.",
    },
    {
      q: "Which recipes can't be made gluten-free?",
      a: `Dishes where gluten is the structure, such as ${HARD_TO_CONVERT.join(", ").toLowerCase()}. Look for a recipe written to be gluten-free instead.`,
    },
  ];
  const linkable = new Set(GLUTEN_TERMS.map((t) => t.term.toLowerCase()));

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Gluten-free guides", path: "/learn" },
            { name: "Make any recipe gluten-free", path: "/learn/make-any-recipe-gluten-free" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "How to make any recipe gluten-free",
            step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
          },
          faqLd(faqs),
        ]}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        <Link href="/learn" className="hover:underline">Gluten-free guides</Link>
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        How to make any recipe gluten-free
      </h1>
      <p className="mt-3 leading-relaxed text-gray-700">
        Most recipes only need a few swaps. Here&apos;s how to convert one, plus a
        chart of the most common gluten-free substitutes.
      </p>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">5 steps</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-700">
        {STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">Gluten-free swap chart</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-grain-200 text-gray-500">
              <th className="py-2 pr-3 font-semibold">Instead of</th>
              <th className="py-2 pr-3 font-semibold">Use</th>
              <th className="py-2 font-semibold">Tip</th>
            </tr>
          </thead>
          <tbody>
            {COMMON_SWAPS.map((s) => (
              <tr key={s.original} className="border-b border-grain-100 align-top">
                <td className="py-2 pr-3 font-semibold text-grain-900">{s.original}</td>
                <td className="py-2 pr-3 text-gray-700">{s.swap}</td>
                <td className="py-2 text-gray-600">{s.tip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">When a recipe won&apos;t convert</h2>
      <p className="mt-2 text-gray-700">
        Some dishes depend on gluten for their structure, so there&apos;s no honest swap:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
        {HARD_TO_CONVERT.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">FAQ</h2>
      <dl className="mt-3 space-y-4">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-semibold text-grain-900">{f.q}</dt>
            <dd className="mt-1 text-gray-700">{f.a}</dd>
          </div>
        ))}
      </dl>

      <GuideCta text="Skip the chart: share any recipe link, text or photo to Sift and it flags the gluten and suggests the swaps for you." />

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Check an ingredient</h2>
        <ul className="mt-2 space-y-1">
          {["soy sauce", "malt", "oats", "modified food starch", "maltodextrin"]
            .filter((t) => linkable.has(t))
            .map((t) => (
              <li key={t}>
                <Link href={`/gf/${slugify(t)}`} className="font-semibold text-leaf-700 underline">
                  Is {t} gluten-free?
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
