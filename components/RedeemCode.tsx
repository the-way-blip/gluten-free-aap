"use client";

import { useState } from "react";
import { usePremium } from "@/components/PremiumProvider";

/**
 * "Redeem a code" field for Settings. A valid comp code unlocks Premium for
 * good on this device (see COMP_CODE in lib/subscription.ts). Used to gift
 * lifetime access without an App Store purchase.
 */
export function RedeemCode() {
  const { redeemCode, comped } = usePremium();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");

  if (comped) {
    return (
      <div className="card border-leaf-200 bg-leaf-50 p-4 text-sm text-leaf-800">
        ✓ Premium is unlocked on this device. Enjoy Sift!
      </div>
    );
  }

  function submit() {
    const ok = redeemCode(code);
    setStatus(ok ? "ok" : "bad");
    if (ok) setCode("");
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-grain-900">Have a code?</h3>
      <p className="mt-0.5 text-sm text-gray-500">
        Redeem a code to unlock Sift Premium.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setStatus("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 rounded-xl border border-grain-200 bg-white px-3 py-2 text-sm uppercase tracking-wide text-grain-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 focus:border-leaf-400 focus:outline-none"
        />
        <button
          onClick={submit}
          disabled={!code.trim()}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          Redeem
        </button>
      </div>
      {status === "ok" && (
        <p className="mt-2 text-sm text-leaf-700">
          🎉 Premium unlocked — everything's yours now.
        </p>
      )}
      {status === "bad" && (
        <p className="mt-2 text-sm text-clay-600">
          That code didn't work. Double-check it and try again.
        </p>
      )}
    </div>
  );
}
