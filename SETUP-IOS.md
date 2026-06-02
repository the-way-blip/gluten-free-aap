# Getting Sift onto the iOS App Store

The repo is now **iOS-ready**: Capacitor is installed and configured to load the
live web app (`capacitor.config.ts`). This runbook covers the remaining steps.
Items marked 🧑 require you (Mac + accounts + financial details); items marked
🤖 I can do in code.

> v1 architecture: the native app loads `https://sift-self.vercel.app` so the AI
> features keep working. Before submitting, we add native camera + push so Apple
> doesn't reject it as "just a website" (Guideline 4.2).

---

## A. One-time local tooling 🧑
- **CocoaPods is NOT required** — Capacitor 8 uses Swift Package Manager. 🎉
- Just make sure **Xcode** is installed and opened once (to accept its license).

## B. The native iOS project — already generated ✅
The `ios/` Xcode project is already created and committed (camera + app plugins
wired via SPM). The useful commands:
```
npm run ios:sync     # I run this after any web/plugin change
npm run ios:open     # 🧑 opens the project in Xcode to build/run
```
`npm run ios:add` is only needed if the `ios/` folder is ever deleted.

## C. Apple Developer Program 🧑
1. Enroll at developer.apple.com — **$99/year**.
2. In **App Store Connect**, create a new app record:
   - Bundle ID: must match `appId` in `capacitor.config.ts`
     (`com.getsift.app` — change both if you want a different one)
   - Name, category (Food & Drink), etc.

## D. App icons & splash 🤖
I'll generate the iOS icon set + splash from the existing brand icon and add
them to the project. (Quick once the `ios/` folder exists.)

## E. Subscriptions on iOS — IAP via RevenueCat 🤖 + 🧑
Apple requires **In-App Purchase** for the subscription (15% under the Small
Business Program). Recommended layer: **RevenueCat** (free under ~$2.5k/mo) — it
runs Apple IAP on iOS and Stripe on web behind one "is Premium?" check.

- 🧑 Create a RevenueCat account; create an **Entitlement** ("premium") and
  **Offerings** mapped to your App Store Connect IAP products
  ($4.99/mo, $39/yr, 7-day trial).
- 🧑 In App Store Connect → create the two **auto-renewable subscription**
  products + the free trial.
- 🤖 I add the `@revenuecat/purchases-capacitor` plugin, wire the paywall (the
  `Paywall.tsx` screen already exists) to RevenueCat's purchase flow, and gate
  premium features off the entitlement. This replaces the Clerk-Billing path on
  iOS; Stripe stays for web.

## F. Review-readiness (so it passes) 🤖
- Native **camera** for the pantry scan (plugin already installed).
- Native **push notifications** (optional but strengthens the case).
- Privacy "nutrition label" answers in App Store Connect 🧑.
- Keep the "guidance, not medical advice" framing (already done; the diary was
  removed, which also reduces health-app scrutiny).

## G. Build, sign, submit 🧑
1. In Xcode: set your Team (Apple account), signing, version/build number.
2. Test on a real device.
3. Archive → upload to App Store Connect → submit for review.
4. First review typically 1–3 days.

## H. Go-live checklist 🧑
- Switch RevenueCat/Stripe to production.
- Attorney-reviewed Terms / Privacy / Disclaimer linked in-app and in the
  App Store listing.
- Support contact (App Store requires one).

---

### What to send me to proceed
- Confirm CocoaPods is installed (so I can run `ios:add`/`ios:sync`), **or** run
  those three `npm run ios:*` commands yourself and tell me when the `ios/`
  folder exists.
- A "go" on RevenueCat as the billing layer, and I'll wire the IAP paywall.
