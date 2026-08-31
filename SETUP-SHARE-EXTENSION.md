# Sift — "Share to Sift" (iOS Share Extension) runbook

Goal: in Instagram / TikTok / Safari, tap **Share → Sift** and the post lands in
Sift's recipe importer, which checks it for gluten and converts it.

Already done (🤖):
- Web: `components/ImportRecipe.tsx`, `/api/import-recipe`, Home tile, Recipes card — **live now** at sift-self.vercel.app.
- Deep link handler: `components/DeepLinks.tsx` listens for `sift://import?url=…` and `?import=` links.
- URL scheme `sift://` registered in `ios/App/App/Info.plist`.
- Extension source: `ios/App/ShareExtension/ShareViewController.swift` + `Info.plist`.

What only you can do (🧑, ~10 minutes in Xcode):

## 1. Add the Share Extension target
1. `npx cap open ios` (or open `ios/App/App.xcodeproj`).
2. **File → New → Target…** → iOS → **Share Extension** → Next.
   - Product Name: `ShareExtension`
   - Bundle Identifier will become `com.glutenfreemadeeasy.app.ShareExtension` (keep it)
   - Language: Swift · uncheck "Include UI Extension" if offered
   - Finish. If asked to "Activate scheme", choose **Cancel** (keep the App scheme).
3. Xcode generates `ShareExtension/ShareViewController.swift` and `ShareExtension/Info.plist`.
   **Replace both** with the files in `ios/App/ShareExtension/` (drag-and-drop over, or copy contents).
   - The generated file subclasses `SLComposeServiceViewController`; ours subclasses `UIViewController`. Delete the Social framework import if Xcode left one.
4. Select the **ShareExtension** target → **General**:
   - Display Name: `Sift`
   - Deployment target: match the App target (iOS 14+ is fine)
5. **Signing & Capabilities** for ShareExtension: same Team as the App; Automatic signing.

## 2. Build + verify
1. Select the **App** scheme, run on a real iPhone (share sheets don't show custom extensions reliably in Simulator).
2. Open Safari → any recipe page → Share → scroll the app row → **Sift**.
   (First time: tap "More" → enable Sift → optionally drag it to the front.)
3. Sift should open on Recipes with the importer running.

## 3. Ship
1. Bump build number (App target) — the extension inherits versioning.
2. Product → Archive → Distribute → App Store Connect → new version → Submit.
   Add to "What's New": *Import any recipe — paste a link or share from Instagram/TikTok, and Sift makes it gluten-free.*

## Notes
- Instagram/TikTok share the post **URL**, not the caption. In the app, the importer fetches the page on-device (real iPhone + home IP) which usually gets the caption; if a platform blocks it, the importer flips to the Paste tab so the user can paste the caption.
- Big publishers (Allrecipes, Simply Recipes, Serious Eats — all Dotdash) return HTTP 402 to servers, so **web** users get the paste fallback; **app** users go through the on-device fetch and succeed.
- Every import is one Claude call (Haiku); gated behind Premium like the other AI features.
