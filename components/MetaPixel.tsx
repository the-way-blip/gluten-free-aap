"use client";

import Script from "next/script";

/**
 * Meta Pixel (The Way dataset 3564612140355598) for ad attribution +
 * conversion optimization. Fires PageView on load; the App Store button
 * (AppStoreBadge) fires a "Lead" event as the download-intent conversion the
 * Sift ad campaign optimizes toward. Pixel IDs are public, so no secret here.
 */
export const META_PIXEL_ID = "3564612140355598";

/**
 * Fire a Meta Pixel standard event (safe no-op if the pixel isn't loaded).
 * Optional params carry conversion value/metadata (e.g. { value, currency,
 * content_name }) so events like StartTrial/Subscribe report revenue to Meta.
 */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  try {
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.(
      "track",
      event,
      params,
    );
  } catch {
    /* ignore */
  }
}

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${META_PIXEL_ID}');
        fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
