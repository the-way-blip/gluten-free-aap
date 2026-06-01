"use client";

import { useEffect, useState } from "react";

/**
 * A gentle, dismissible "Add Sift to your home screen" hint.
 *
 * - Android / desktop Chrome fire `beforeinstallprompt`; we capture it and show
 *   a one-tap Install button that triggers the native prompt.
 * - iOS Safari has no install API, so we show the manual Share → Add to Home
 *   Screen instructions instead.
 * - Hidden entirely if the app is already installed (standalone display) or the
 *   user dismissed it before (remembered in localStorage).
 */

const DISMISS_KEY = "sift.installDismissed";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed? Never show.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari exposes this non-standard flag when launched from home screen
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    if (standalone) return;

    // Previously dismissed? Respect that.
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const ua = window.navigator.userAgent;
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /^((?!chrome|crios|android).)*safari/i.test(ua);

    if (iOS && isSafari) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Android / desktop Chrome: wait for the install event.
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="card flex items-start gap-3 border-leaf-200 bg-leaf-50 p-4">
      <span className="text-2xl">📲</span>
      <div className="flex-1">
        <div className="font-semibold text-leaf-800">Add Sift to your phone</div>
        {isIOS ? (
          <p className="mt-0.5 text-xs text-leaf-700">
            Tap the Share button, then{" "}
            <span className="font-semibold">“Add to Home Screen”</span> — Sift
            opens full-screen like a real app, even offline-friendly.
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-leaf-700">
            Install it for one-tap access and a full-screen, app-like
            experience.
          </p>
        )}
        {!isIOS && deferred && (
          <button
            onClick={install}
            className="btn-primary mt-2 px-4 py-1.5 text-sm"
          >
            Install Sift
          </button>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-full text-leaf-500 hover:bg-leaf-100"
      >
        ×
      </button>
    </div>
  );
}
