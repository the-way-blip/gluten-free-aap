# Turning on paid subscriptions (Sift Premium)

The app already has the pricing page, legal pages, and subscription config in
place. To start charging, complete these steps **you** must do (they involve
account creation and financial/banking details, which can't be automated).

Model: **7-day free trial → then a subscription is required.**
Price: **$4.99/month or $39/year** (set in Stripe; edit anytime).

---

## 1. Stripe account (money + payouts)
1. Create a Stripe account at https://stripe.com and complete business + bank
   details so you can receive payouts. (Web payments → you keep ~97%; no
   Apple/Google cut.)
2. You do **not** need to build Stripe Checkout by hand — Clerk Billing connects
   to Stripe and handles checkout, the customer portal, trials, and renewals.

## 2. Clerk account + Billing
1. Create a Clerk app at https://clerk.com (if you haven't already).
2. In the Clerk dashboard: **Billing → enable it and connect your Stripe
   account.**
3. Create a **Plan** with slug exactly `premium` (matches `PREMIUM_PLAN` in
   `lib/subscription.ts`), with a **$4.99/mo** price and a **$39/yr** price, and
   set a **7-day free trial** on the plan.
4. Confirm your Clerk SDK supports Billing components (`<PricingTable />`,
   `has({ plan })`). If the dashboard prompts you to upgrade `@clerk/nextjs`,
   tell me the target version and I'll handle the code upgrade + the live
   paywall gate (Stage B).

## 3. Environment variables (you paste these — I never handle keys)
In Vercel → Project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...     # from Clerk
CLERK_SECRET_KEY                  = sk_live_...     # from Clerk
POSTGRES_URL (or DATABASE_URL)    = ...             # a Marketplace Postgres (e.g. Neon)
NEXT_PUBLIC_BILLING_ENABLED       = 1               # flips the paywall ON
```

Leaving `NEXT_PUBLIC_BILLING_ENABLED` unset keeps the app **free** (current
behavior), so nothing breaks until you're ready.

## 4. Tell me, and I'll do Stage B (code)
Once Billing is enabled and the `premium` plan exists, I will:
- Mount Clerk's `<PricingTable />` in Settings → Account
- Add the access gate: full access during the 7-day trial, then the paywall
- Gate premium features (AI generation, label checker, pantry photo scan, sync)
- Wire `has({ plan: "premium" })` checks

## Before launch (recommended)
- Have the **Terms, Privacy, and Medical Disclaimer** templates reviewed by a
  qualified attorney — especially important for a health-adjacent app.
- Decide on a support email / simple support flow.
- Sanity-check unit economics: each AI call costs money (your Anthropic key),
  so the "AI = premium" gating protects your margin.
