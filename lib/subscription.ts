/**
 * Subscription / billing configuration.
 *
 * Like the cloud flags, billing is fully dormant until configured: with no
 * billing env set, the whole app stays free (current behavior). When billing
 * is turned on, access follows: 7-day free trial → then an active subscription
 * is required (the "mostly paid" model).
 *
 * The actual subscription check is done via Clerk Billing's `has({ plan })`,
 * wired in the access gate once Clerk Billing is enabled in the dashboard.
 */

/** Slug of the paid plan, as created in the Clerk dashboard (Billing → Plans). */
export const PREMIUM_PLAN = "premium";

/** Length of the free trial, in days, from account creation. */
export const TRIAL_DAYS = 7;

/** Pricing shown on the marketing/pricing page. Source of truth is Stripe. */
export const PRICING = {
  monthly: { amount: "$4.99", period: "/month" },
  yearly: { amount: "$39", period: "/year", note: "Save ~35%" },
};

/**
 * True when billing should be enforced. Build-inlined from a public env var so
 * client components can read it. Defaults to OFF, so the app is free until you
 * explicitly enable billing after completing the Clerk + Stripe setup.
 */
export const BILLING_ENABLED =
  process.env.NEXT_PUBLIC_BILLING_ENABLED === "1";

export type AccessStatus = "full" | "trial" | "locked";

/** Days remaining in trial given a trial-start timestamp (ms). */
export function trialDaysLeft(trialStart: number, now: number): number {
  const elapsedDays = (now - trialStart) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays));
}
