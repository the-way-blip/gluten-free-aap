import { LEARN_GUIDES, type LearnGuide } from "./learn-content";

/** SEO slugs and titles for the Learn guides published as public pages. */
export const LEARN_PAGE: Record<string, { slug: string; title: string; h1: string }> = {
  "start-here": {
    slug: "just-diagnosed-with-celiac",
    title: "Just Diagnosed With Celiac? What to Know First | Sift",
    h1: "Just diagnosed with celiac? Start here",
  },
  "hidden-gluten": {
    slug: "where-gluten-hides",
    title: "Where Gluten Hides: Surprising Sources of Gluten | Sift",
    h1: "Where gluten hides",
  },
  "kitchen-safe": {
    slug: "gluten-free-kitchen",
    title: "How to Keep a Gluten-Free Kitchen Safe | Sift",
    h1: "Keeping your kitchen gluten-free",
  },
  "dining-out": {
    slug: "how-to-order-gluten-free-at-restaurants",
    title: "How to Order Gluten-Free at a Restaurant | Sift",
    h1: "How to order gluten-free at a restaurant",
  },
  labels: {
    slug: "how-to-read-gluten-free-labels",
    title: "How to Read Food Labels for Gluten | Sift",
    h1: "How to read food labels for gluten",
  },
};

export function learnSlug(g: LearnGuide): string {
  return LEARN_PAGE[g.id]?.slug ?? g.id;
}

export function findGuide(slug: string): LearnGuide | undefined {
  return LEARN_GUIDES.find((g) => learnSlug(g) === slug);
}
