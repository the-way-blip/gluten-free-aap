"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

/**
 * Handles URLs that open the native app:
 *   sift://import?url=<encoded link>   ← from the Share Extension
 *   sift://import?text=<encoded text>
 *   https://sift-self.vercel.app/recipes?import=<link>  (universal link)
 *
 * Routes them to the Recipes page, which auto-runs the importer.
 */
export function DeepLinks() {
  const router = useRouter();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let remove: (() => void) | undefined;
    (async () => {
      const { App } = await import("@capacitor/app");
      const handle = (url: string) => {
        try {
          const u = new URL(url);
          const isImport =
            u.host === "import" || u.pathname.replace(/\/$/, "").endsWith("/import") || u.searchParams.has("import");
          if (!isImport) return;
          const link = u.searchParams.get("url") || u.searchParams.get("import") || "";
          const text = u.searchParams.get("text") || "";
          const param = link || text || "1";
          router.push(`/recipes?import=${encodeURIComponent(param)}`);
        } catch {
          /* ignore malformed */
        }
      };
      const sub = await App.addListener("appUrlOpen", (e) => handle(e.url));
      remove = () => sub.remove();
      // Cold start: the URL that launched us.
      const launch = await App.getLaunchUrl();
      if (launch?.url) handle(launch.url);
    })();
    return () => remove?.();
  }, [router]);
  return null;
}
