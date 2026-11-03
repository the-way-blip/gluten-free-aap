import Link from "next/link";
import type { Metadata } from "next";
import { SEED_RESTAURANTS } from "@/lib/seed-restaurants";
import { gradeFor } from "@/lib/grading";
import { slugify, breadcrumbLd, faqLd, STRICT_CELIAC } from "@/lib/seo";
import { GuideCta, JsonLd } from "@/components/GuideCta";
import type { Letter } from "@/lib/types";

/** Public SEO hub: fast food chains ranked for a strict celiac eater. */

export const metadata: Metadata = {
  title: "Gluten-Free Fast Food Ranked for Celiac | Sift",
  description:
    "Fast food chains ranked by how safe they are for celiac: dedicated fryers, gluten-free buns, cross-contamination practices and what to order at each.",
  alternates: { canonical: "/gluten-free-fast-food" },
};

const ORDER: Letter[] = ["A", "B", "C", "D", "F"];

function ranked() {
  const fast = SEED_RESTAURANTS.filter((r) => r.segment === "fast-food");
  return fast
    .map((r) => ({ r, grade: gradeFor(r, STRICT_CELIAC).letter }))
    .sort(
      (a, b) =>
        ORDER.indexOf(a.grade) - ORDER.indexOf(b.grade) ||
        ORDER.indexOf(a.r.baseGrade) - ORDER.indexOf(b.r.baseGrade) ||
        a.r.name.localeCompare(b.r.name)
    );
}

export default function FastFoodPage() {
  const list = ranked();
  const noFryerRisk = SEED_RESTAURANTS.filter((r) => r.dedicatedFryer);
  const top = list.filter((x) => x.grade === "A" || x.grade === "B");

  const faqs = [
    {
      q: "What is the safest fast food for celiac?",
      a:
        top.length > 0
          ? `In Sift's grading, ${top.slice(0, 4).map((x) => x.r.name).join(", ")} rank highest for a strict celiac eater. Always tell staff about the allergy and confirm at your location.`
          : "Few fast food chains are fully safe for celiac. Choose places with no shared fryer and tell staff about the allergy.",
    },
    {
      q: "Which fast food places have a dedicated gluten-free fryer?",
      a: `Chains with no shared-fryer risk in Sift's data: ${noFryerRisk.map((r) => r.name).join(", ")}. Fryer practices can vary by location, so ask.`,
    },
    {
      q: "Are fast food fries gluten-free?",
      a: "Potatoes are, but fries cooked in the same oil as breaded chicken or onion rings pick up gluten. Only fries from a dedicated fryer are safe for celiac.",
    },
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Restaurant guides", path: "/eat" },
            { name: "Gluten-free fast food", path: "/gluten-free-fast-food" },
          ]),
          faqLd(faqs),
        ]}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-leaf-600">
        <Link href="/eat" className="hover:underline">Gluten-free restaurant guides</Link>
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold text-grain-900">
        Gluten-free fast food, ranked for celiac
      </h1>
      <p className="mt-3 leading-relaxed text-gray-700">
        Plenty of fast food is gluten-free on paper. For celiac, what matters is
        the kitchen: shared fryers, shared grills and how staff handle an allergy.
        This list grades {list.length} chains the way Sift grades them for a strict
        celiac eater, best first.
      </p>

      <ol className="mt-6 space-y-3">
        {list.map(({ r, grade }, i) => (
          <li key={r.id} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/eat/${slugify(r.name)}`} className="font-semibold text-leaf-700 underline">
                {i + 1}. {r.name}
              </Link>
              <span className="chip shrink-0 bg-grain-100 text-grain-800">Celiac grade {grade}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{r.summary}</p>
            <p className="mt-1 text-xs text-gray-500">
              {r.fryer === "none"
                ? "No fryer"
                : r.dedicatedFryer
                ? "Dedicated fryer"
                : "Shared fryer"}
              {r.hasGfMenu ? " · Gluten-free menu" : ""}
            </p>
          </li>
        ))}
      </ol>

      <h2 className="font-display mt-8 text-xl font-semibold text-grain-900">
        Chains with no shared-fryer risk
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
        {noFryerRisk.map((r) => (
          <li key={r.id}>
            <Link href={`/eat/${slugify(r.name)}`} className="text-leaf-700 underline">
              {r.name}
            </Link>{" "}
            ({r.fryer === "none" ? "no fryer" : "dedicated fryer"})
          </li>
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

      <GuideCta text="Not strict celiac? Sift re-grades every restaurant for how careful you need to be." />

      <p className="mt-8 text-xs leading-relaxed text-gray-400">
        Guidance, not medical advice. Menus and kitchen practices vary by location
        and change over time. Always confirm with staff.
      </p>
    </main>
  );
}
