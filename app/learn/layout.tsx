import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_GUIDES } from "@/lib/learn-content";
import { LEARN_PAGE, learnSlug } from "@/lib/learn-pages";

export const metadata: Metadata = {
  title: "Living Gluten-Free: Practical Guides | Sift",
  description:
    "Plain-English gluten-free guides: just diagnosed with celiac, where gluten hides, keeping your kitchen safe, ordering at restaurants and reading labels.",
  alternates: { canonical: "/learn" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <nav className="mx-auto max-w-2xl px-5 pb-10" aria-label="Gluten-free guides">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Read the full guides</h2>
        <ul className="mt-2 space-y-1">
          {LEARN_GUIDES.map((g) => (
            <li key={g.id}>
              <Link href={`/learn/${learnSlug(g)}`} className="font-semibold text-leaf-700 underline">
                {LEARN_PAGE[g.id]?.h1 ?? g.title}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/learn/make-any-recipe-gluten-free" className="font-semibold text-leaf-700 underline">
              How to make any recipe gluten-free
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
