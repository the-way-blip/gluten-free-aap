"use client";

import { useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { SkeletonCaption } from "@/components/Skeletons";
import { useSift } from "@/lib/store";
import {
  searchTerms,
  STATUS_META,
  type GlutenStatus,
} from "@/lib/gluten-reference";
import type { ProductVerdict } from "@/app/api/check-product/route";

type Tab = "check" | "barcode" | "reference";

const VERDICT_STYLE: Record<
  ProductVerdict["verdict"],
  { label: string; cls: string; emoji: string }
> = {
  safe: { label: "Gluten-free", cls: "bg-leaf-100 text-leaf-800 border-leaf-200", emoji: "✅" },
  "likely-safe": { label: "Likely safe", cls: "bg-leaf-50 text-leaf-700 border-leaf-200", emoji: "👍" },
  risky: { label: "Verify carefully", cls: "bg-orange-100 text-orange-700 border-orange-200", emoji: "⚠️" },
  "not-safe": { label: "Contains gluten", cls: "bg-red-100 text-red-700 border-red-200", emoji: "🚫" },
  unknown: { label: "Unclear", cls: "bg-grain-100 text-grain-700 border-grain-200", emoji: "❓" },
};

export default function CheckPage() {
  const { profile } = useSift();
  const [tab, setTab] = useState<Tab>("check");

  return (
    <div>
      <Header title="Is it gluten-free?" subtitle="Check a product or look up an ingredient" />

      <div className="px-5 pt-4">
        <div className="mb-4 flex gap-1 rounded-xl bg-grain-100 p-1">
          <TabBtn active={tab === "check"} onClick={() => setTab("check")}>
            Label
          </TabBtn>
          <TabBtn active={tab === "barcode"} onClick={() => setTab("barcode")}>
            Barcode
          </TabBtn>
          <TabBtn active={tab === "reference"} onClick={() => setTab("reference")}>
            Guide
          </TabBtn>
        </div>

        {tab === "check" && <ProductChecker profile={profile} />}
        {tab === "barcode" && <BarcodeScanner profile={profile} />}
        {tab === "reference" && <Reference />}
      </div>
    </div>
  );
}

function ProductChecker({ profile }: { profile: ReturnType<typeof useSift>["profile"] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductVerdict | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function run(payload: { image?: string; text?: string }) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/check-product", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, profile }),
      });
      const data = await res.json();
      setResult(data.result ?? null);
      setMode(data.mode ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    const dataUrl = await resizeImage(file, 1280);
    setPreview(dataUrl);
    run({ image: dataUrl });
  }

  const v = result ? VERDICT_STYLE[result.verdict] : null;

  return (
    <div className="space-y-4">
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

      <div className="card space-y-3 p-4">
        <h2 className="font-semibold text-grain-900">Scan the label 📷</h2>
        <p className="text-sm text-gray-500">
          Photograph the ingredient list and we'll flag anything with gluten,
          tuned to how strict you are.
        </p>
        <button onClick={() => inputRef.current?.click()} className="btn-primary w-full">
          📷 Photograph ingredient list
        </button>
      </div>

      <div className="card space-y-3 p-4">
        <h2 className="font-semibold text-grain-900">…or type it in</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Paste an ingredient list or a product name…"
          className="w-full resize-none rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-sm text-grain-900 outline-none focus:border-leaf-500"
        />
        <button
          onClick={() => run({ text })}
          disabled={loading || !text.trim()}
          className="btn-primary w-full"
        >
          {loading ? "Checking…" : "Check it"}
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          <SkeletonCaption>Analyzing ingredients…</SkeletonCaption>
          <div className="card animate-pulse space-y-3 p-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-grain-100" />
              <div className="h-4 w-28 rounded-full bg-grain-100" />
            </div>
            <div className="h-3 w-3/4 rounded-full bg-grain-50" />
            <div className="h-3 w-2/3 rounded-full bg-grain-50" />
          </div>
        </div>
      )}

      {preview && result && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="max-h-40 w-full rounded-xl object-cover" />
      )}

      {result && v && (
        <div className={`rounded-2xl border p-4 ${v.cls}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{v.emoji}</span>
            <span className="font-bold">{v.label}</span>
            {mode === "fallback" && (
              <span className="chip ml-auto bg-white/60 text-current">text scan</span>
            )}
          </div>
          <p className="mt-1 font-medium">{result.headline}</p>
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
            Always double-check the actual label and any “may contain” warnings.
          </p>
        </div>
      )}
    </div>
  );
}

function Reference() {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchTerms(q), [q]);

  return (
    <div className="space-y-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search an ingredient (e.g. malt, oats, maltodextrin)…"
        className="w-full rounded-xl border border-grain-200 bg-white px-4 py-2.5 text-grain-900 outline-none focus:border-leaf-500"
      />

      <div className="flex flex-wrap gap-2 text-xs">
        {(Object.keys(STATUS_META) as GlutenStatus[]).map((s) => (
          <span key={s} className={`chip ${STATUS_META[s].chip}`}>
            <span className={`mr-1 inline-block h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
            {STATUS_META[s].label}
          </span>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No match for “{q}”. Try a simpler word, or check a product directly.
        </p>
      ) : (
        <div className="card divide-y divide-grain-100">
          {results.map((t) => (
            <div key={t.term} className="flex items-start gap-3 p-3.5">
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_META[t.status].dot}`} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-grain-900">{t.term}</span>
                  <span className={`chip ${STATUS_META[t.status].chip}`}>
                    {STATUS_META[t.status].label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{t.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
        active ? "bg-white text-grain-900 shadow-sm" : "text-gray-500"
      }`}
    >
      {children}
    </button>
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
