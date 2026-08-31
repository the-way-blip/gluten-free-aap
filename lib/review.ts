import { Capacitor } from "@capacitor/core";

const ASKED_KEY = "sift.reviewAskedAt";
const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

/**
 * Ask for an App Store rating at a "win" moment (first saved recipe, first
 * successful import). Native-only; iOS itself throttles to ~3 prompts a year,
 * and we additionally hold off for 90 days between our own asks. Never throws.
 */
export async function maybeAskReview(): Promise<void> {
  try {
    if (!Capacitor.isNativePlatform()) return;
    if (!Capacitor.isPluginAvailable("SiftIap")) return;
    const last = Number(window.localStorage.getItem(ASKED_KEY) || 0);
    if (last && Date.now() - last < NINETY_DAYS) return;
    window.localStorage.setItem(ASKED_KEY, String(Date.now()));
    const { SiftIap } = await import("sift-iap");
    // Older builds without the method just reject — swallow it.
    await (SiftIap as unknown as { requestReview?: () => Promise<unknown> }).requestReview?.();
  } catch {
    /* never interrupt the user over a rating */
  }
}
