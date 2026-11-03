/** Shared helpers for the public SEO guide pages (server-side). */

import type { GFProfile } from "./types";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SITE = "https://eatsift.app";

export const DOWNLOAD_PATH = "/download?utm_source=seo&utm_medium=guide";

/** Trim to <= max chars on a word boundary (for meta descriptions). */
export function clip(s: string, max = 155): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return (sp > 60 ? cut.slice(0, sp) : cut).replace(/[,;:—–-]+$/, "") + "…";
}

/** JSON-LD helpers. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** A strict celiac eater: no shared fryers, surfaces, traces or regular oats. */
export const STRICT_CELIAC: GFProfile = {
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
