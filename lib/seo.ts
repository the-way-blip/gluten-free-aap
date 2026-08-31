/** Shared helpers for the public SEO guide pages (server-side). */

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SITE = "https://sift-self.vercel.app";

export const DOWNLOAD_PATH = "/download?utm_source=seo&utm_medium=guide";
