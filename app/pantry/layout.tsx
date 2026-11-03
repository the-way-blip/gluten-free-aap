import type { Metadata } from "next";

// In-app screen (client-rendered, personalized). Kept out of search so the
// public guides (/eat, /gf) and the homepage are what Google indexes.
export const metadata: Metadata = {
  title: "Pantry — Sift",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
