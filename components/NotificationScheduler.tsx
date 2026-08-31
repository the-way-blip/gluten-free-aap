"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { usePremium } from "@/components/PremiumProvider";
import { useSift } from "@/lib/store";

/**
 * Local (on-device) notifications — no server involved. Native builds with the
 * LocalNotifications plugin only; older builds and web no-op.
 *
 * Schedule, for non-Premium users:
 *   id 1 — day 1: try the free recipe import
 *   id 2 — day 3: trial nudge
 *   id 3 — day 5: trial nudge (last)
 * For everyone:
 *   id 10 — Sundays 5pm: plan your week (repeating)
 *   id 11 — 5 days of inactivity (re-scheduled forward on every app open)
 *
 * Trial nudges are cancelled the moment the user becomes Premium. All ids are
 * fixed so re-scheduling replaces rather than duplicates.
 */
export function NotificationScheduler() {
  const { profile, ready } = useSift();
  const { billingActive, premium } = usePremium();

  useEffect(() => {
    if (!ready || !profile) return;
    if (!Capacitor.isNativePlatform()) return;
    if (!Capacitor.isPluginAvailable("LocalNotifications")) return;

    (async () => {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        let perm = await LocalNotifications.checkPermissions();
        if (perm.display === "prompt") {
          // Ask only once the user has a profile — they've seen value by now.
          perm = await LocalNotifications.requestPermissions();
        }
        if (perm.display !== "granted") return;

        const day = 24 * 60 * 60 * 1000;
        const at = (ms: number) => new Date(Date.now() + ms);

        // Re-schedule the inactivity ping forward each open; cancel stale ones.
        await LocalNotifications.cancel({ notifications: [{ id: 11 }] });

        const toSchedule: import("@capacitor/local-notifications").LocalNotificationSchema[] = [
          {
            id: 11,
            title: "Your gluten-free kitchen misses you 🌱",
            body: "Got 2 minutes? See what you can make from your pantry tonight.",
            schedule: { at: at(5 * day) },
          },
          {
            id: 10,
            title: "Plan your gluten-free week 🗓️",
            body: "Pick a few dinners now and Sift builds the shopping list for you.",
            schedule: { on: { weekday: 1, hour: 17, minute: 0 }, allowWhileIdle: true },
          },
        ];

        if (billingActive && !premium) {
          const already = localStorage.getItem("sift.trialNudgesScheduled") === "1";
          if (!already) {
            toSchedule.push(
              {
                id: 1,
                title: "Try it: import any recipe 🪄",
                body: "Paste a link from Instagram or TikTok — your first gluten-free conversion is free.",
                schedule: { at: at(1 * day) },
              },
              {
                id: 2,
                title: "7 days of Premium, on us",
                body: "Unlimited imports, AI recipes, and label checks — free for a week, cancel anytime.",
                schedule: { at: at(3 * day) },
              },
              {
                id: 3,
                title: "Still cooking the hard way?",
                body: "Your free week of Sift Premium is waiting. It takes one tap to start.",
                schedule: { at: at(5 * day) },
              }
            );
            localStorage.setItem("sift.trialNudgesScheduled", "1");
          }
        } else {
          // Premium (or web): make sure no trial nudges linger.
          await LocalNotifications.cancel({
            notifications: [{ id: 1 }, { id: 2 }, { id: 3 }],
          });
        }

        await LocalNotifications.schedule({ notifications: toSchedule });
      } catch {
        /* never let notifications break the app */
      }
    })();
  }, [ready, profile, billingActive, premium]);

  return null;
}
