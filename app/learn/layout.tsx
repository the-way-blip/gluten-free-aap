import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Living Gluten-Free: Practical Guides | Sift",
  description:
    "Plain-English gluten-free guides: just diagnosed with celiac, where gluten hides, keeping your kitchen safe, ordering at restaurants and reading labels.",
  alternates: { canonical: "/learn" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
