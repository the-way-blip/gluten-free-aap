# Meta App Events + App Promotion — integration spec (staged)

Goal: report **real subscription conversions** from inside the native iOS app to
Meta, so a Meta **App Promotion** campaign can optimize toward people who
actually subscribe (not just download).

Status: **staged, not applied.** Nothing here is committed into the live iOS
build yet, on purpose (see "Why staged"). When Dillon provides the two config
values, apply steps 2–6, build, verify, submit.

We already ship an *interim* web-Pixel `StartTrial` event (see
`components/PremiumProvider.tsx` → `purchase()` → `trackPixel("StartTrial", …)`).
That is measurement + audience-building only; it can't cleanly attribute a
subscription back to an ad because the App Store breaks the click→install chain.
This spec is the real attribution path.

---

## Why staged (the one true blocker)

The Facebook SDK needs a **Facebook App ID** and a **Client Token**. Those come
from a Meta developer *App* linked to the ad account. Creating it requires
Dillon's Meta login (Claude can't create accounts / authenticate). Until those
exist, none of the native code below does anything.

Adding the SDK also changes the app's **App Store privacy labels** (it collects
data used to track you) and may warrant an **App Tracking Transparency** prompt.
That must be a conscious, configured step — which is why it is not pre-wired into
the live `Package.swift`.

### What Dillon must do (≈10 min, only he can)
1. Go to <https://developers.facebook.com/apps> → **Create App** → type
   **"Business"** → connect it to the **The Way** business + ad account
   `1987643905191351`.
2. Add the **iOS** platform. Bundle ID: `com.glutenfreemadeeasy.app`.
   App Store ID: `6775724538`.
3. From **Settings → Basic**, copy the **App ID** and the **Client Token**
   (Client Token is under Settings → Advanced → Security). Both are semi-public
   config values that ship in the binary — safe to paste to Claude. (Do **not**
   paste the App *Secret* — never needed here.)
4. In **Events Manager**, connect this app and enable **Advanced Mobile
   Measurement / Aggregated Event Measurement (AEM)**; add **`Subscribe`** and
   **`StartTrial`** to the app's configured events and rank `Subscribe` highest.

Then hand Claude the **App ID** + **Client Token** and Claude applies the rest.

---

## 1. Values (RESOLVED — Meta app created Aug 27 2026)

- `FACEBOOK_APP_ID` = **1745212116598148**
- `FACEBOOK_CLIENT_TOKEN` = **cc8014d69460e7870e40beed6fe07c5e**
  (semi-public — ships in the app binary; NOT the App Secret)
- Display name: `Sift`
- App: "Sift" under The Way business (biz id 2838308473167054), use case
  "Create & manage app ads with Meta Ads Manager", iOS platform added
  (bundle `com.glutenfreemadeeasy.app`, iPhone Store ID `6775724538`).
- "Log in-app events automatically" toggle is **OFF** — we log Subscribe /
  StartTrial manually from the StoreKit 2 plugin (§5) to avoid double-counting.

---

## 2. Add the SDK dependency — `sift-iap/Package.swift`

Add the Facebook SDK and depend on `FBSDKCoreKit` (App Events only; no Login/
Share needed). Pin a current major so builds are reproducible.

```swift
dependencies: [
    .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
    .package(url: "https://github.com/facebook/facebook-ios-sdk.git", from: "17.0.0")
],
targets: [
    .target(
        name: "SiftIapPlugin",
        dependencies: [
            .product(name: "Capacitor", package: "capacitor-swift-pm"),
            .product(name: "Cordova", package: "capacitor-swift-pm"),
            .product(name: "FBSDKCoreKit", package: "facebook-ios-sdk")
        ],
        path: "ios/Sources/SiftIapPlugin")
]
```

(`ios/App/CapApp-SPM/Package.swift` already pulls the SiftIap product, so no
change is needed there — the FB SDK rides in transitively.)

## 3. Initialize the SDK — `ios/App/App/AppDelegate.swift`

```swift
import UIKit
import Capacitor
import FBSDKCoreKit   // add

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        ApplicationDelegate.shared.application(application,
                                              didFinishLaunchingWithOptions: launchOptions)  // add
        return true
    }
    // ...keep the existing open-url / continue-userActivity methods...
    func application(_ app: UIApplication, open url: URL,
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        ApplicationDelegate.shared.application(app, open: url, options: options)  // add (before the return)
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
```

## 4. Info.plist keys — `ios/App/App/Info.plist`

```xml
<key>FacebookAppID</key>
<string>FACEBOOK_APP_ID</string>
<key>FacebookClientToken</key>
<string>FACEBOOK_CLIENT_TOKEN</string>
<key>FacebookDisplayName</key>
<string>Sift</string>
<!-- Recommended: let the SDK auto-log installs/sessions -->
<key>FacebookAutoLogAppEventsEnabled</key>
<true/>
<!-- SKAdNetwork: paste Meta's CURRENT published SKAN ID list here.
     Get the live list from Meta docs (do not hand-copy a stale one):
     https://developers.facebook.com/docs/SKAdNetwork -->
<key>SKAdNetworkItems</key>
<array>
    <dict><key>SKAdNetworkIdentifier</key><string>v9wttpbfk9.skadnetwork</string></dict>
    <!-- + the rest of Meta's current list -->
</array>
```

No `CFBundleURLTypes` / `LSApplicationQueriesSchemes` needed — those are for FB
Login/Sharing, which we do not use.

## 5. Log the conversion — `sift-iap/ios/Sources/SiftIapPlugin/SiftIapPlugin.swift`

In `purchase(...)`, on the verified-success branch (right after
`await transaction.finish()`), log the Meta app event with revenue:

```swift
import FBSDKCoreKit   // add at top

// inside case .verified(let transaction):
await transaction.finish()
await self.notifyEntitlement()
// Report to Meta for App Promotion optimization. New subscribers begin a
// 7-day free trial, so log StartTrial; also log Subscribe for the value event.
let price = (product.price as NSDecimalNumber).doubleValue
AppEvents.shared.logEvent(.startTrial, valueToSum: price,
    parameters: [.currency: "USD", .contentID: productId as NSObject])
AppEvents.shared.logEvent(.subscribe, valueToSum: price,
    parameters: [.currency: "USD", .contentID: productId as NSObject])
call.resolve(["status": "purchased", "premium": true, "productId": productId])
```

(`product` and `productId` are already in scope in `purchase`.)

## 6. (Optional but recommended) App Tracking Transparency

For best matching, request ATT before logging. Add
`NSUserTrackingUsageDescription` to Info.plist and call
`ATTrackingManager.requestTrackingAuthorization` on first launch, then
`Settings.shared.isAdvertiserTrackingEnabled = true` when authorized. App Events
still feed **SKAN/AEM** aggregated attribution even if the user declines, so this
is an enhancement, not a requirement. If added, it also needs a privacy-label +
review note.

---

## 7. Build, verify, submit (Claude drives what it can)

1. `npx cap sync ios` (re-wires SPM; picks up the new FB dependency).
2. Bump `MARKETING_VERSION` → 1.2 and `CURRENT_PROJECT_VERSION` → 4 in
   `ios/App/App.xcodeproj/project.pbxproj`.
3. `xcodebuild … archive` (Claude can produce the signed archive headless;
   team NG6DBB2567, automatic signing).
4. **Dillon uploads** via Xcode Organizer (needs his Apple auth).
5. **Update App Privacy in ASC**: declare data collected by the FB SDK for
   **Tracking** (Advertising Data / Device ID / Usage Data → "Used to Track
   You"). Apple requires this before the build with the SDK is approved.
6. Claude drives ASC: new version 1.2, attach the build, submit.

## 8. Switch the campaign to App Promotion (Claude, after approval)

Once the SDK build is **live**:
- New campaign objective `OUTCOME_APP_PROMOTION` optimizing the **Subscribe**
  app event (start on **App Installs**, move to the Subscribe event once volume
  builds — optimizing a rare event on a small budget starves delivery).
- App Promotion ads can link **straight to the App Store**, so the
  `/download` web bridge page workaround is no longer required.
- Keep the current `OUTCOME_TRAFFIC` + Lead campaign running until the App
  Promotion campaign proves out.

---

## Sequencing summary

Interim web Pixel `StartTrial` (DONE, live) → Dillon creates Meta app + gives
App ID/Client Token → Claude applies §2–6 + archives → Dillon uploads + updates
privacy labels → Claude submits → after approval, Claude switches campaign to
App Promotion (§8).
