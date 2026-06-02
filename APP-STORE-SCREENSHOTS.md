# Sift — App Store screenshots playbook

Apple needs screenshots for **6.7"** (1290×2796) and **6.5"** (1242×2688) iPhones.
The easiest way to get exact-resolution, Apple-accepted images:

## How to capture (iOS Simulator — exact resolution, zero tools)
1. `npm run ios:open` → run on **iPhone 16 Pro Max** (a 6.7" device).
2. Set the app up per each shot below.
3. In the Simulator menu: **File → Save Screen** (or `Cmd+S`). PNGs land on your Desktop at the device's native resolution — drop them straight into App Store Connect.
4. Capture the same shots on an **iPhone 8 Plus / SE-class 6.5"** device too (or App Store Connect can scale 6.7" → smaller; 6.7" is the only strictly required size now).

> Apple accepts plain screenshots — captions/frames are optional polish. Ship plain first; add branded versions later if you want.

## The 5 shots (verified to look great, in this order)

**1 — Home / "Everything in one calm place"**
- Setup: completed profile (any). Home screen as-is.
- Caption: **"Your whole gluten-free kitchen, in one calm place."**

**2 — Recipes + servings scaler / "Cook without the guesswork"**
- Setup: Recipes tab → open a recipe → tap **+** on Servings a couple times so "Scaled from 3 → 5 servings" shows with fraction amounts.
- Caption: **"Scale any recipe to how many you're feeding."**

**3 — Eating Out / "Eat out without the worry"**
- Setup: Dining tab → the graded restaurant list (A/B grades visible). Optionally tap "🟢 Safe (A & B)".
- Caption: **"Know where you can safely eat — graded for you."**

**4 — Shopping list / "Ready for the store"**
- Setup: List tab with several items (grouped). 
- Caption: **"A smart list you can share and take with you."**

**5 — Ingredient lookup / "Is this gluten-free?"**
- Setup: open Ingredient lookup; optionally run a check so a verdict card shows.
- Caption: **"Check a label in seconds — then verify with confidence."**

(Optional 6 — Pantry "What can I make?" scan screen. Caption: "Snap your pantry, get dinner ideas.")

## Caption styling (if you add branded panels)
- Background: clay→cream gradient (`#e0a484` → `#faf7f0`) or solid cream `#f7f1e6`
- Headline font: Fraunces (serif), deep green `#266c44` or grain `#583a25`
- Keep captions short, warm, benefit-first (above the phone image)

## Want me to build branded marketing panels?
Send me your raw simulator PNGs (or drop them in `sift/screenshots/`) and I'll
composite finished 1290×2796 panels — caption + framed screenshot on-brand
backgrounds — and hand them back ready to upload.
