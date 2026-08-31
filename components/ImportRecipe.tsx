"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { extractFromHtml } from "@/lib/import-source";
import { usePremium } from "@/components/PremiumProvider";
import { TRIAL_DAYS } from "@/lib/subscription";
import { RecipeCard } from "@/components/RecipeCard";
import { useSift } from "@/lib/store";
import type { ImportResult } from "@/lib/types";

type Mode = "link" | "paste" | "photo";

/**
 * "Import a recipe" — paste a link (Instagram / TikTok / any recipe site),
 * paste text, or snap a photo. Sift extracts the recipe, judges it against the
 * user's gluten-free profile, and converts it when needed.
 *
 * `initialUrl` lets the iOS share extension (or a `?import=` deep link) start
 * an import immediately.
 */
export function ImportRecipe({
  initialUrl,
  defaultOpen = false,
}: {
  initialUrl?: string;
  defaultOpen?: boolean;
}) {
  const { profile } = useSift();
  const { billingActive, premium, requirePremium } = usePremium();

  // Everyone gets ONE import free — people need to feel the magic before the
  // paywall makes sense. Tracked locally; after it succeeds, imports gate.
  const FREE_KEY = "sift.freeImportUsed";
  const freeImportUsed = () => {
    try {
      return window.localStorage.getItem(FREE_KEY) === "1";
    } catch {
      return false;
    }
  };
  const gateImport = () => {
    if (!billingActive || premium) return true; // web / already premium
    if (!freeImportUsed()) return true; // first one's on us
    return requirePremium("recipe import");
  };
  const [open, setOpen] = useState(defaultOpen || !!initialUrl);
  const [mode, setMode] = useState<Mode>("link");
  const [link, setLink] = useState(initialUrl ?? "");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoRan = useRef(false);

  // Shared pipeline.
  async function run(body: {
    url?: string;
    text?: string;
    image?: string;
    sourceUrl?: string;
    sourceName?: string;
  }) {
    if (!gateImport()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // In the native app, fetch the page on-device first: a real iPhone on a
      // home/cell IP gets past publisher bot-blocks (Allrecipes & co. return
      // 402 to servers) and usually gets Instagram/TikTok captions too.
      if (body.url && Capacitor.isNativePlatform()) {
        const native = await fetchOnDevice(body.url);
        if (native) body = { text: native.text, sourceUrl: body.url, sourceName: native.sourceName };
      }
      const res = await fetch("/api/import-recipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...body, profile }),
      });
      const data = await res.json();
      if (data.mode === "error" || data.error) {
        setError(data.error || "Something went wrong.");
        // A blocked social link → nudge to the paste tab with the link kept.
        if (data.blocked) setMode("paste");
        return;
      }
      setResult(data as ImportResult);
      try {
        window.localStorage.setItem(FREE_KEY, "1");
      } catch {
        /* ignore */
      }
    } catch {
      setError("Couldn't reach Sift. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Open when the page asks us to (Home tile / deep link).
  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  // Auto-run when launched from the share sheet / deep link.
  useEffect(() => {
    if (initialUrl && !autoRan.current) {
      autoRan.current = true;
      setOpen(true);
      setMode("link");
      setLink(initialUrl);
      void run({ url: initialUrl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  function submit() {
    if (mode === "link" && link.trim()) return run({ url: link.trim() });
    if (mode === "paste" && text.trim()) {
      // If they pasted a bare link into the text box, treat it as a link.
      const t = text.trim();
      if (/^https?:\/\/\S+$/i.test(t)) return run({ url: t });
      return run({ text: t, sourceUrl: link.trim() || undefined });
    }
  }

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (!t) return;
      if (/^https?:\/\/\S+$/i.test(t.trim())) {
        setMode("link");
        setLink(t.trim());
      } else {
        setMode("paste");
        setText(t);
      }
    } catch {
      /* clipboard not available — user can paste manually */
    }
  }

  async function handleFile(file: File) {
    try {
      const dataUrl = await resizeImage(file, 1280);
      setPreview(dataUrl);
      await run({ image: dataUrl, text: text.trim() || undefined });
    } catch {
      setError("Something went wrong reading that image.");
    }
  }

  async function takePhoto() {
    if (!gateImport()) return;
    if (!Capacitor.isNativePlatform()) {
      inputRef.current?.click();
      return;
    }
    try {
      const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
      const photo = await Camera.getPhoto({
        quality: 75,
        width: 1280,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });
      if (photo.dataUrl) {
        setPreview(photo.dataUrl);
        await run({ image: photo.dataUrl });
      }
    } catch {
      /* cancelled */
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setPreview(null);
    setLink("");
    setText("");
  }

  const canSubmit =
    !loading && ((mode === "link" && link.trim().length > 0) || (mode === "paste" && text.trim().length > 0));

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clay-100 text-xl text-clay-700">
          📥
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-grain-900">Import a recipe</span>
            {billingActive && !premium && !freeImportUsed() && (
              <span className="chip bg-leaf-50 text-leaf-700">1 free</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Paste a link from Instagram, TikTok, or any site — Sift makes it gluten-free
          </div>
        </div>
        <span className={`text-gray-300 transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="border-t border-grain-100 px-4 pb-4 pt-3">
          {!result && (
            <>
              <div className="mb-3 flex gap-1 rounded-xl bg-grain-100 p-1">
                {(["link", "paste", "photo"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-lg py-1.5 text-sm font-semibold capitalize transition ${
                      mode === m ? "bg-white text-grain-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {m === "link" ? "🔗 Link" : m === "paste" ? "📝 Paste" : "📷 Photo"}
                  </button>
                ))}
              </div>

              {mode === "link" && (
                <div className="space-y-2">
                  <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="https://www.instagram.com/reel/…"
                    className="w-full rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
                  />
                  <p className="text-xs text-gray-400">
                    Works with recipe blogs, TikTok, and public Instagram posts. Tip: on iPhone, tap
                    Share on any post → Sift.
                  </p>
                </div>
              )}

              {mode === "paste" && (
                <div className="space-y-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    placeholder="Paste the caption or the whole recipe here…"
                    className="w-full rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-sm text-grain-900 outline-none focus:border-leaf-500"
                  />
                  {link && (
                    <p className="text-xs text-gray-400">
                      We'll keep the link ({shortHost(link)}) as the source.
                    </p>
                  )}
                </div>
              )}

              {mode === "photo" && (
                <div className="space-y-2">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Recipe photo" className="max-h-56 w-full rounded-xl object-cover" />
                  ) : (
                    <button onClick={takePhoto} className="btn-secondary w-full py-6">
                      📷 Snap a cookbook page or screenshot
                    </button>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFile(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-xl bg-clay-50 p-3 text-sm text-clay-800">{error}</div>
              )}

              {mode !== "photo" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={submit} disabled={!canSubmit} className="btn-primary flex-1">
                    {loading ? "Checking for gluten…" : "✨ Check & make it gluten-free"}
                  </button>
                  {!link && !text && (
                    <button onClick={pasteFromClipboard} className="btn-secondary" aria-label="Paste">
                      Paste
                    </button>
                  )}
                </div>
              )}
              {mode === "photo" && loading && (
                <p className="mt-3 text-center text-sm text-gray-500">Reading the recipe…</p>
              )}
            </>
          )}

          {result && (
            <div className="space-y-3">
              <VerdictBanner result={result} />

              {result.swaps.length > 0 && (
                <div className="rounded-xl border border-grain-200 bg-white p-3">
                  <h4 className="mb-2 text-sm font-semibold text-grain-900">
                    What Sift swapped ({result.swaps.length})
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {result.swaps.map((s, i) => (
                      <li key={i}>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-clay-50 px-1.5 py-0.5 text-clay-800 line-through decoration-clay-400">
                            {s.original}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="rounded-md bg-leaf-50 px-1.5 py-0.5 font-semibold text-leaf-800">
                            {s.replacement}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">{s.why}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.verdict === "gluten_free" && result.flagged.length > 0 && (
                <p className="text-xs text-gray-500">
                  Double-check labels on: {result.flagged.join(", ")}.
                </p>
              )}

              {result.verdict !== "not_convertible" && <RecipeCard recipe={result.recipe} />}

              {billingActive && !premium && (
                <button
                  onClick={() => requirePremium("unlimited recipe imports")}
                  className="btn-primary w-full"
                >
                  ✨ Loved it? Unlimited imports — free for {TRIAL_DAYS} days
                </button>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {result.sourceName ? `From ${result.sourceName}` : "From pasted text"}
                  {result.originalTitle && result.originalTitle !== result.recipe.title
                    ? ` · originally “${result.originalTitle}”`
                    : ""}
                </span>
                <button onClick={reset} className="font-semibold text-leaf-700">
                  Import another
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VerdictBanner({ result }: { result: ImportResult }) {
  const styles =
    result.verdict === "gluten_free"
      ? "bg-leaf-50 text-leaf-800"
      : result.verdict === "adapted"
        ? "bg-amber-50 text-amber-900"
        : "bg-clay-50 text-clay-900";
  const icon = result.verdict === "gluten_free" ? "✅" : result.verdict === "adapted" ? "🔁" : "⚠️";
  return (
    <div className={`rounded-xl p-3 ${styles}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <div>
          <div className="font-semibold">{result.summary}</div>
          {result.verdict === "not_convertible" && (
            <p className="mt-1 text-sm">{result.recipe.glutenFreeNote}</p>
          )}
          {result.verdict === "adapted" && result.flagged.length > 0 && (
            <p className="mt-1 text-xs opacity-80">Found gluten in: {result.flagged.join(", ")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Fetch a page with the native HTTP stack and extract recipe text locally. */
async function fetchOnDevice(url: string): Promise<{ text: string; sourceName: string } | null> {
  try {
    const res = await CapacitorHttp.get({
      url,
      headers: {
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      responseType: "text",
      connectTimeout: 10000,
      readTimeout: 10000,
    });
    if (res.status < 200 || res.status >= 300 || typeof res.data !== "string") return null;
    const out = extractFromHtml(res.data, url);
    if (out.blocked || !out.text) return null;
    return { text: out.text, sourceName: out.sourceName };
  } catch {
    return null; // fall back to the server fetch
  }
}

function shortHost(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u.slice(0, 30);
  }
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
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
