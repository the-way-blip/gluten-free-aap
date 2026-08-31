"use client";

import { trackPixel } from "@/components/MetaPixel";

/**
 * Official-style "Download on the App Store" badge, rendered as inline SVG so it
 * works offline and needs no external asset. Links to Sift's App Store listing.
 * Clicking fires a Meta Pixel "Lead" event (the download-intent conversion the
 * ad campaign optimizes toward).
 *
 * Apple marketing guidelines: use the badge as-is (don't recolor/redraw the
 * wordmark), keep clear space around it, and don't make it smaller than ~40px tall.
 */

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/sift-gluten-free-made-easy/id6775724538";

export function AppStoreBadge({
  className = "",
  height = 44,
}: {
  className?: string;
  height?: number;
}) {
  // Official badge aspect ratio is ~120 x 40 (3:1).
  const width = Math.round((height * 120) / 40);
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download Sift on the App Store"
      onClick={() => trackPixel("Lead")}
      className={`inline-block ${className}`}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
      >
        <rect
          x="0.5"
          y="0.5"
          width="119"
          height="39"
          rx="6.5"
          fill="#000"
          stroke="#A6A6A6"
          strokeWidth="1"
        />
        {/* Apple logo */}
        <g fill="#fff" transform="translate(11.5, 8.5)">
          <path d="M8.6 12.1c-.5.6-1 .6-1.6.4-.6-.2-1.1-.2-1.7 0-.8.3-1.2.2-1.6-.4C1.3 9.2 1.7 5 4 4.9c.7 0 1.2.4 1.6.4.4 0 1.2-.5 2-.4.4 0 1.4.1 2.1 1.1-1.9 1.1-1.6 3.9.2 4.7-.4 1-.9 1.9-1.3 1.4zM6.9 4.2C6.8 3 7.8 2 8.9 1.9c.2 1.3-1 2.4-2 2.3z" />
        </g>
        {/* Text */}
        <text
          x="30"
          y="15.5"
          fill="#fff"
          fontFamily="-apple-system, Helvetica, Arial, sans-serif"
          fontSize="6.5"
        >
          Download on the
        </text>
        <text
          x="29.5"
          y="30"
          fill="#fff"
          fontFamily="-apple-system, Helvetica, Arial, sans-serif"
          fontSize="15"
          fontWeight="600"
        >
          App Store
        </text>
      </svg>
    </a>
  );
}
