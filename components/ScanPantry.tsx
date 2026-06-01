"use client";

import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import type { PantryLocation } from "@/lib/types";

/**
 * Snap or upload a photo of a fridge/pantry, send it to Claude vision, and
 * confirm the detected ingredients before adding them to the chosen location.
 *
 * On mobile, `capture="environment"` opens the rear camera; on desktop it's a
 * normal file picker. The image is downscaled in-browser before upload to keep
 * the payload small and fast.
 */
export function ScanPantry({
  location,
  onAdd,
}: {
  location: PantryLocation;
  onAdd: (names: string[], location: PantryLocation) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [detected, setDetected] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shared pipeline: send a (downscaled) data URL to the vision endpoint.
  async function scan(dataUrl: string) {
    setError(null);
    setDetected(null);
    setLoading(true);
    try {
      setPreview(dataUrl);
      const res = await fetch("/api/scan-pantry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      setMode(data.mode ?? null);
      const items: string[] = data.items ?? [];
      if (items.length === 0) {
        setError(
          data.mode === "error"
            ? "Couldn't reach the vision model. Check your API key and try again."
            : "No ingredients detected — try a clearer, closer photo."
        );
      }
      setDetected(items);
      setSelected(new Set(items));
    } catch {
      setError("Something went wrong reading that image.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    try {
      const dataUrl = await resizeImage(file, 1024);
      await scan(dataUrl);
    } catch {
      setError("Something went wrong reading that image.");
    }
  }

  // On native iOS/Android, use the real camera/photo picker; on web, fall back
  // to the hidden file input. The native path is more reliable inside the app
  // and gives a proper permission prompt.
  async function takePhoto() {
    if (!Capacitor.isNativePlatform()) {
      inputRef.current?.click();
      return;
    }
    try {
      const { Camera, CameraResultType, CameraSource } = await import(
        "@capacitor/camera"
      );
      const photo = await Camera.getPhoto({
        quality: 70,
        width: 1024,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      if (photo.dataUrl) await scan(photo.dataUrl);
    } catch {
      // User cancelled the picker, or permission denied — stay quiet.
    }
  }

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function confirm() {
    const names = detected?.filter((n) => selected.has(n)) ?? [];
    if (names.length) onAdd(names, location);
    reset();
  }

  function reset() {
    setPreview(null);
    setDetected(null);
    setSelected(new Set());
    setError(null);
    setMode(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-grain-900">Scan with your camera 📷</h2>
          <p className="text-sm text-gray-500">
            Snap a photo of your fridge or pantry and we'll detect the items for
            you.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!detected && !loading && (
        <button onClick={takePhoto} className="btn-primary w-full">
          📷 Take or upload a photo
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-grain-200 border-t-leaf-600" />
          Looking at your photo…
        </div>
      )}

      {preview && (detected || loading) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Your photo"
          className="max-h-40 w-full rounded-xl object-cover"
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {detected && detected.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-grain-900">
              Found {detected.length} items — tap to deselect
            </p>
            {mode === "fallback" && (
              <span className="chip bg-grain-100 text-grain-600">demo</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {detected.map((name) => {
              const on = selected.has(name);
              return (
                <button
                  key={name}
                  onClick={() => toggle(name)}
                  className={`chip border transition ${
                    on
                      ? "border-leaf-500 bg-leaf-50 text-leaf-700"
                      : "border-grain-200 bg-white text-gray-400 line-through"
                  }`}
                >
                  {on ? "✓ " : ""}
                  {name}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={selected.size === 0}
              className="btn-primary flex-[2]"
            >
              Add {selected.size} to {location}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Downscale + re-encode an image file to a JPEG data URL, max `maxDim` px. */
function resizeImage(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
