"use client";

import { useEffect, useRef, useState } from "react";
import type { GFProfile } from "@/lib/types";
import type { BarcodeResult } from "@/app/api/lookup-barcode/route";

const VERDICT_STYLE: Record<
  BarcodeResult["verdict"],
  { label: string; cls: string; emoji: string }
> = {
  safe: { label: "Gluten-free", cls: "bg-leaf-100 text-leaf-800 border-leaf-200", emoji: "✅" },
  "likely-safe": { label: "Likely safe", cls: "bg-leaf-50 text-leaf-700 border-leaf-200", emoji: "👍" },
  risky: { label: "Verify carefully", cls: "bg-orange-100 text-orange-700 border-orange-200", emoji: "⚠️" },
  "not-safe": { label: "Contains gluten", cls: "bg-red-100 text-red-700 border-red-200", emoji: "🚫" },
  unknown: { label: "Unclear", cls: "bg-grain-100 text-grain-700 border-grain-200", emoji: "❓" },
};

// Minimal typing for the experimental BarcodeDetector API.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: {
  formats?: string[];
}) => BarcodeDetectorLike;

export function BarcodeScanner({ profile }: { profile: GFProfile | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [supported, setSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "BarcodeDetector" in window
    );
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  async function startCamera() {
    setError(null);
    setResult(null);
    try {
      const Ctor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor })
        .BarcodeDetector;
      const detector = new Ctor({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const code = codes[0].rawValue;
            stopCamera();
            lookup(code);
            return;
          }
        } catch {
          /* keep trying */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Couldn't access the camera. Enter the barcode number instead.");
      setScanning(false);
    }
  }

  async function lookup(code: string) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/lookup-barcode", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ barcode: code, profile }),
      });
      const data = await res.json();
      setResult(data.result ?? null);
    } catch {
      setError("Lookup failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const v = result ? VERDICT_STYLE[result.verdict] : null;

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-4">
        <h2 className="font-semibold text-grain-900">Scan a barcode 📷</h2>
        <p className="text-sm text-gray-500">
          Point your camera at a product barcode, or type the number below.
          Looks it up in the Open Food Facts database.
        </p>

        {supported && !scanning && (
          <button onClick={startCamera} className="btn-primary w-full">
            📷 Scan with camera
          </button>
        )}

        {scanning && (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-xl bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="h-48 w-full object-cover"
                playsInline
                muted
              />
            </div>
            <p className="text-center text-xs text-gray-500">
              Hold a barcode steady in view…
            </p>
            <button onClick={stopCamera} className="btn-secondary w-full">
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && manual && lookup(manual)}
            inputMode="numeric"
            placeholder="Barcode number (UPC/EAN)…"
            className="flex-1 rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
          />
          <button
            onClick={() => manual && lookup(manual)}
            disabled={loading || !manual}
            className="btn-primary"
          >
            {loading ? "…" : "Look up"}
          </button>
        </div>

        {!supported && (
          <p className="text-xs text-gray-400">
            Live camera scanning isn't supported in this browser — type the
            number under the barcode instead.
          </p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-grain-200 border-t-leaf-600" />
          Looking it up…
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && v && (
        <div className={`rounded-2xl border p-4 ${v.cls}`}>
          <div className="flex items-center gap-3">
            {result.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt=""
                className="h-12 w-12 rounded-lg bg-white object-contain"
              />
            )}
            <div className="min-w-0">
              {result.found && (
                <div className="truncate text-sm font-semibold text-grain-900">
                  {result.name}
                  {result.brand ? ` · ${result.brand}` : ""}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span>{v.emoji}</span>
                <span className="font-bold">{v.label}</span>
              </div>
            </div>
          </div>
          <p className="mt-2 font-medium">{result.headline}</p>
          <p className="mt-1 text-sm opacity-90">{result.explanation}</p>
          {result.flagged.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {result.flagged.map((f, i) => (
                <div key={i} className="rounded-lg bg-white/60 p-2 text-sm">
                  <span className="font-semibold">{f.name}</span> — {f.reason}
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs opacity-70">
            Data from Open Food Facts and can be incomplete — always confirm
            against the actual package.
          </p>
        </div>
      )}
    </div>
  );
}
