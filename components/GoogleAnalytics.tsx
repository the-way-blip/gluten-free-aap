"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js) — usage analytics for the web app AND the iOS
 * app, which loads this same site inside its native shell. Measurement IDs are
 * public. Page views are sent manually so client-side route changes in this
 * single-page app are counted (send_page_view is disabled in config).
 */
export const GA_ID = "G-90GZ1KPM5R";

/** Fire a GA4 event (safe no-op if gtag isn't loaded). */
export function trackGA(event: string, params?: Record<string, unknown>) {
  try {
    (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
      "event",
      event,
      params,
    );
  } catch {
    /* ignore */
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();

  // Manual page_view on every route change (App Router doesn't reload the page).
  useEffect(() => {
    try {
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
        "event",
        "page_view",
        { page_path: pathname }
      );
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });`}
      </Script>
    </>
  );
}
