"use client";

import { useState } from "react";

/**
 * Brand logo with a bulletproof fallback.
 *
 * A colored letter monogram is always rendered as the base layer. The real
 * logo image (Clearbit → Google favicon) is layered on top and only becomes
 * visible once it actually loads. If every source fails — or the network is
 * blocked (e.g. a sandboxed preview) — you simply see the clean monogram
 * instead of a broken-image icon.
 *
 * Uses a plain <img> (not next/image) so no remote-domain config is needed.
 */
export function Logo({
  domain,
  name,
  size = 44,
}: {
  domain: string;
  name: string;
  size?: number;
}) {
  const sources = [
    `https://logo.clearbit.com/${domain}?size=128`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [dead, setDead] = useState(false);

  const letter = name.trim().charAt(0).toUpperCase();
  const bg = colorFor(name);

  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-grain-100"
      style={{ width: size, height: size }}
    >
      {/* Monogram base layer — always present, hidden once a logo loads. */}
      <span
        className="absolute inset-0 flex items-center justify-center font-bold text-white"
        style={{ backgroundColor: bg, fontSize: size * 0.42 }}
        aria-hidden
      >
        {letter}
      </span>

      {!dead && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sources[idx]}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className={`relative h-full w-full bg-white object-contain p-1 transition-opacity ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (idx < sources.length - 1) setIdx(idx + 1);
            else setDead(true);
          }}
        />
      )}
    </span>
  );
}

/** Deterministic pleasant color from the name (for the monogram base). */
function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 45%, 45%)`;
}
