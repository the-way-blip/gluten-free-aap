// Runs after `next build` (npm "postbuild" hook).
// On production builds, sends every URL in the built sitemap to IndexNow,
// so Bing (and other IndexNow engines) learn about new and changed pages
// right away instead of waiting for the next sitemap crawl.
// It never fails the build: any problem is logged and the build continues.

import { readFile } from "node:fs/promises";
import path from "node:path";

const HOST = "eatsift.app";
const KEY = "43fe0058c0b749377fbfe0039feac3df";
// Tried in order; stops at the first that accepts the list.
const ENDPOINTS = ["https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow"];
const SITEMAP_BODY = path.join(process.cwd(), ".next/server/app/sitemap.xml.body");

async function main() {
  const isProd = process.env.VERCEL_ENV === "production";
  if (!isProd && process.env.INDEXNOW_FORCE !== "1") {
    console.log("[indexnow] Skipped: not a production build.");
    return;
  }

  let xml;
  try {
    xml = await readFile(SITEMAP_BODY, "utf8");
  } catch {
    console.log("[indexnow] Skipped: built sitemap not found.");
    return;
  }

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => {
      try {
        return new URL(u).hostname === HOST;
      } catch {
        return false;
      }
    });
  const urlList = [...new Set(urls)].slice(0, 10000);
  if (urlList.length === 0) {
    console.log("[indexnow] Skipped: no URLs in sitemap.");
    return;
  }

  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  });
  for (const endpoint of ENDPOINTS) {
    const ok = await send(endpoint, body, urlList.length);
    if (ok) return;
  }
}

async function send(endpoint, body, count) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
      signal: controller.signal,
    });
    const text = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 300);
    console.log(`[indexnow] ${endpoint}: sent ${count} URLs, response ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    return res.ok;
  } catch (err) {
    console.log(`[indexnow] ${endpoint}: ping failed (build continues): ${err?.message ?? err}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

main().catch((err) => {
  console.log(`[indexnow] Error (build continues): ${err?.message ?? err}`);
});
