"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Mirrors the local `sift.*` state to the user's cloud row when signed in.
 * Only rendered when Clerk is configured (see layout). Behavior:
 *  - On sign-in: GET the cloud blob. If it has data, write it locally and tell
 *    the store to reload (cloud wins). If the cloud is empty, seed it from the
 *    current local data (first-device adoption).
 *  - While signed in: poll the local snapshot and debounce-push on change,
 *    plus a final push when the tab is hidden/closed.
 */

const SIFT_KEYS = [
  "sift.profile",
  "sift.pantry",
  "sift.shopping",
  "sift.savedRecipes",
  "sift.mealPlan",
  "sift.reactions",
  "sift.startTasks",
  "sift.recentRecipes",
  "sift.savedRestaurants",
];

function snapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of SIFT_KEYS) {
    const raw = window.localStorage.getItem(k);
    if (raw != null) {
      try {
        out[k] = JSON.parse(raw);
      } catch {
        /* skip unparseable */
      }
    }
  }
  return out;
}

function applySnapshot(data: Record<string, unknown>) {
  for (const k of SIFT_KEYS) {
    if (k in data && data[k] != null) {
      window.localStorage.setItem(k, JSON.stringify(data[k]));
    }
  }
  // Tell the store to re-read localStorage so the UI updates immediately.
  window.dispatchEvent(new Event("sift:reload"));
}

export function CloudSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const lastPushed = useRef<string>("");
  const pulledFor = useRef<string | null>(null);

  // Pull (or seed) once per signed-in session.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (pulledFor.current === "done") return;
    pulledFor.current = "done";

    (async () => {
      try {
        const res = await fetch("/api/sync");
        if (!res.ok) return; // 401 race etc; stay local
        const json = (await res.json()) as {
          enabled?: boolean;
          data?: Record<string, unknown> | null;
        };
        if (json.enabled === false) return; // cloud not configured; stay local
        if (json.data && Object.keys(json.data).length > 0) {
          applySnapshot(json.data);
          lastPushed.current = JSON.stringify(json.data);
        } else {
          // Cloud empty → seed from local.
          const snap = snapshot();
          lastPushed.current = JSON.stringify(snap);
          await fetch("/api/sync", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ data: snap }),
          });
        }
      } catch {
        /* offline / not configured — stay local */
      }
    })();
  }, [isLoaded, isSignedIn]);

  // Debounced push of local changes while signed in.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function push() {
      const snap = snapshot();
      const serialized = JSON.stringify(snap);
      if (serialized === lastPushed.current) return;
      lastPushed.current = serialized;
      try {
        await fetch("/api/sync", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ data: snap }),
        });
      } catch {
        /* will retry on next tick */
      }
    }

    const interval = setInterval(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(push, 400);
    }, 4000);

    const onHide = () => {
      if (document.visibilityState === "hidden") push();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      clearInterval(interval);
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [isLoaded, isSignedIn]);

  return null;
}
