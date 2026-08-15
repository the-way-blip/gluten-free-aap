# Sift — Phase 2: turn on the subscription (step-by-step)

Goal: sell **Sift Premium** — **$4.99/month** or **$39/year**, with a **7-day free
trial** — on iOS (Apple In-App Purchase) and on web (Stripe), behind one
"is this user Premium?" check using **RevenueCat**.

Legend: 🧑 = you (accounts / money / dashboards — I can't do these) · 🤖 = me (code)

> Do this while Apple reviews the free app. None of it changes the current
> (free) build. When it's ready, I flip it on and we test together.

---

## Why RevenueCat (the short version)
Apple **requires** its own In-App Purchase for digital subscriptions on iOS (you
can't use Stripe inside the iOS app). RevenueCat sits on top of both Apple IAP
(iOS) and Stripe (web) and gives the app a single `premium` entitlement to check.
Free tier covers you well past launch (up to ~$2.5k/mo tracked revenue).

---

## STEP 1 — Paid Applications Agreement + banking 🧑  (~15 min, do first)
You can't sell anything until this is signed.
1. App Store Connect → **Business** (top nav).
2. Sign the **Paid Applications Agreement**.
3. Add **Bank Account** + **Tax** info (U.S. + any regions you sell in).
4. Wait until the agreement shows **Active** (can take a bit).

## STEP 2 — Create the subscription products in App Store Connect 🧑  (~20 min)
1. Your app → left sidebar → **Subscriptions** (under Monetization).
2. Create a **Subscription Group** — name it `Sift Premium` (users can only hold
   one subscription from a group at a time; that's what we want).
3. Add **two** auto-renewable subscriptions in that group:

   | Reference Name | Product ID | Duration | Price |
   |---|---|---|---|
   | Sift Premium Monthly | `sift_premium_monthly` | 1 month | $4.99 |
   | Sift Premium Yearly | `sift_premium_yearly` | 1 year | $39.00 |

   *(Product IDs are permanent — use exactly these so my code matches.)*
4. For **each** product: add a **localization** (display name "Sift Premium
   (Monthly/Yearly)" + a short description), and set the **price**.
5. Add an **Introductory Offer → Free Trial → 7 days** to each (or to the group).
6. Add the **subscription group localization** (a display name + optional
   promo image) — App Store requires this before review.
7. Status will be "Ready to Submit." The **first** subscription must be submitted
   **with an app version** — so this rides along with our Phase-2 app update.

## STEP 3 — App Store Connect API key for RevenueCat 🧑  (~5 min)
RevenueCat needs this to read your subscription status.
1. App Store Connect → **Users and Access → Integrations → App Store Connect API**.
2. Generate an **In-App Purchase** key (or a Team key). Download the `.p8`
   (you can only download once) and note the **Issuer ID** + **Key ID**.
3. You'll paste these into RevenueCat in Step 4.

## STEP 4 — RevenueCat setup 🧑  (~20 min)
1. Create an account at **revenuecat.com** → new **Project** "Sift".
2. Add an **App** → platform **App Store** → Bundle ID `com.getsift.app`.
   - Upload the **App Store Connect API key** (.p8 + Issuer ID + Key ID) from Step 3.
   - Add the **App-Specific Shared Secret** (App Store Connect → your app →
     App Information → "App-Specific Shared Secret").
3. **Entitlements** → create one with identifier exactly **`premium`**.
4. **Products** → add `sift_premium_monthly` and `sift_premium_yearly` →
   attach both to the `premium` entitlement.
5. **Offerings** → create the default offering → add both products as packages
   (Monthly + Annual).
6. **API keys** → copy the **Public SDK key for Apple** (starts `appl_…`).
   → paste it to me (it's a *public* client key, safe to share — not a secret).

## STEP 5 — (Optional now) Stripe for web 🧑
Only needed if you also want to sell Premium on the website (not required for the
iOS launch). If yes: create Stripe, connect it in RevenueCat as a second app,
add matching products, and give me the RevenueCat **Stripe public key**. We can
defer this and do iOS-only first.

## STEP 6 — I wire the app 🤖  (after Steps 2 & 4)
Once the `premium` entitlement + offering exist and I have the RevenueCat Apple
public key, I will:
- Add `@revenuecat/purchases-capacitor`, initialize it with the key
- Mount a **Paywall** (the `Paywall.tsx` screen already exists) driven by the
  RevenueCat offering (real prices, "Start 7-day free trial" button)
- Gate the premium features (AI generation, ingredient lookup, pantry scan) —
  free during a 7-day trial window, then require the `premium` entitlement
- Flip `NEXT_PUBLIC_BILLING_ENABLED=1` and re-enable the /pricing + Settings
  Premium surfaces
- Rebuild the iOS app (new build) and submit it **together with** the
  subscription products (Apple reviews them as one)

## STEP 7 — Test 🧑 + 🤖
- In App Store Connect → **Sandbox** → create a **sandbox tester** account.
- Run the app, start the trial, subscribe with the sandbox account, confirm the
  `premium` entitlement unlocks features. RevenueCat's dashboard shows the event.

## STEP 8 — Submit & launch 🧑
Submit the Phase-2 app version + subscriptions for review. Once approved, Premium
is live. Switch RevenueCat/Apple to production; monitor in the RevenueCat dashboard.

---

## What I need from you to start coding (the two unblockers)
1. The **RevenueCat Apple public SDK key** (`appl_…`) — safe to paste here.
2. Confirmation the **`premium` entitlement + both products + offering** exist in
   RevenueCat.

Everything else (banking, agreements, sandbox testers) stays on your side.

## ⚠️ Reminders
- **Never paste** the `.p8` file contents, App-Specific Shared Secret, or any
  `sk_`/secret key to me — those go only into RevenueCat/Apple. The RevenueCat
  **public** SDK key (`appl_…`) is the only thing I need.
- Get the **Terms / Privacy / Disclaimer** reviewed by an attorney before charging.
- Product IDs (`sift_premium_monthly`, `sift_premium_yearly`) are **permanent** —
  set them exactly as above so the code matches.
