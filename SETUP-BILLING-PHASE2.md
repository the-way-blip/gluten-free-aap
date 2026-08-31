# Sift — Phase 2: Subscriptions (go-live runbook)

Sell **Sift Premium** — **$4.99/month** or **$39/year**, with a **7-day free
trial** — on iOS via **Apple In-App Purchase (StoreKit 2)**.

> We went **direct to StoreKit 2** (no RevenueCat, no third-party account). A
> small custom Capacitor plugin (`sift-iap/`) talks to StoreKit; entitlements
> are verified on-device. The web app gates the premium features and shows the
> paywall.

Legend: 🧑 = you (accounts / signing — I can't) · 🤖 = me (code / App Store Connect metadata)

---

## ✅ Already done

- 🤖 **Native plugin** `sift-iap/` (StoreKit 2: products, purchase, restore,
  on-device entitlement check, renewal listener). Auto-wired via `npx cap sync ios`.
- 🤖 **Web billing layer**: `lib/iap.ts`, `PremiumProvider` / `usePremium()`,
  `PremiumGate`, `PaywallModal`, real purchase `Paywall.tsx`.
- 🤖 **Gates** on the 4 AI features (recipe generation, pantry meal ideas +
  photo scan, ingredient/label lookup, AI restaurant guide). Browsing, lists,
  and restaurant grades stay free.
- 🤖 **App Store Connect**: subscription group "Sift Premium", both products
  (`sift_premium_monthly` $4.99, `sift_premium_yearly` $39) with worldwide
  pricing, **7-day free trials**, display names, and **review screenshots + notes**.
- 🤖 **Verified** in the simulator: gated tap → paywall with live prices → (loop works).
- 🤖 **Safety hardening**: billing only activates when the native plugin is
  present (probe `isAvailable()`), so flipping the flag can't break older builds.
- 🧑 **Paid Applications Agreement** signed + banking/tax (pricing wouldn't have
  saved otherwise). ✅

## 🔑 Remaining — the signed build + submit (only you can do this)

Subscriptions must be submitted **with an app version**, and a new version needs
a new signed build. Building for the App Store needs your Distribution signing
identity, which I can't touch.

1. 🧑 **Bump the build number** (Xcode → target → General, or `CURRENT_PROJECT_VERSION`).
   > ⚠️ First confirm `capacitor.config.ts` `server.url` is
   > `https://sift-self.vercel.app` (NOT localhost). Then `npx cap sync ios`.
2. 🧑 **Archive & upload**: Xcode → Product → Archive → Distribute App → App Store Connect.
3. 🧑/🤖 In ASC: create a **new version** (e.g. 1.1), attach the build, **add both
   subscriptions** to the submission. (I can drive the ASC clicks with you.)
4. 🧑 **Submit for Review.**

## 🚀 Go-live (after Apple approves)

5. 🤖 Set **`NEXT_PUBLIC_BILLING_ENABLED=1`** on the Vercel prod env + redeploy
   (`cd sift && npx vercel deploy --yes --prod` on the-way-blip). Web users are
   unaffected (gating is iOS-only); older builds stay free (plugin probe).
6. 🧑 Release the approved version. Premium is live.

## 🧪 Testing a real purchase (optional, before go-live)

- **Xcode + StoreKit config**: open `ios/App/App.xcodeproj` → Edit Scheme → Run →
  Options → StoreKit Configuration → `Sift.storekit` → Run → tap a gated feature →
  Start free trial. No sandbox account needed.
- **Sandbox on device**: create a Sandbox Tester in ASC → Users and Access →
  Sandbox, sign into it on the device, run a TestFlight/dev build, purchase.

## Product IDs (permanent — must match ASC + the plugin)

| Product ID | Duration | Price | Trial |
|---|---|---|---|
| `sift_premium_monthly` | 1 month | $4.99 | 7-day free |
| `sift_premium_yearly` | 1 year | $39.00 | 7-day free |

## ⚠️ Reminders

- Bundle ID is **`com.glutenfreemadeeasy.app`** (Apple app id 6775724538).
- Get the Terms / Privacy / Disclaimer reviewed by an attorney before charging.
- Keep `capacitor.config.ts` on the production URL for any build you ship.
