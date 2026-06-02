// Generates branded App Store screenshots (1290×2796, 6.7") from the live app.
// Captures real screens with Playwright at iPhone resolution, then composites
// each into an on-brand panel (caption + framed screenshot) with sharp.
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";

const BASE = "http://localhost:3000";
const ROOT = "/Users/dillonmccurdy1/Desktop/Claude Code/sift/screenshots";
fs.mkdirSync(`${ROOT}/raw`, { recursive: true });

const profile = {
  reason: "celiac",
  strictness: "strict",
  dairyFree: true,
  crossContamination: { sharedFryer: false, sharedSurfaces: false, mayContainTraces: false, regularOats: false },
  otherAvoidances: [],
  createdAt: 1717000000000,
};
const shopping = [
  { id: "s1", name: "Brown rice", quantity: "2 lb", checked: false, fromRecipe: "Burrito Bowl" },
  { id: "s2", name: "Corn tortillas", checked: false, fromRecipe: "Burrito Bowl" },
  { id: "s3", name: "Avocados", quantity: "3", checked: false },
  { id: "s4", name: "GF tamari", checked: true },
  { id: "s5", name: "Chicken thighs", quantity: "2 lb", checked: false },
];

const shots = [
  { name: "1-home", url: "/", caption: "Your whole gluten-free kitchen, in one calm place." },
  {
    name: "2-recipes", url: "/recipes", caption: "Scale any recipe to how many you're feeding.",
    setup: async (page) => {
      await page.locator(".card button").first().click().catch(() => {});
      await page.waitForTimeout(500);
      const plus = page.locator('button[aria-label="More servings"]').first();
      await plus.click().catch(() => {});
      await plus.click().catch(() => {});
      await page.evaluate(() => window.scrollTo(0, 260));
    },
  },
  { name: "3-dining", url: "/restaurants", caption: "Know where you can safely eat — graded for you." },
  { name: "4-list", url: "/shopping-list", caption: "A smart list you can share and take with you." },
  { name: "5-check", url: "/check", caption: "Check a label in seconds — then verify with confidence." },
];

function wrapTspans(text, maxChars, x, startY, lineH) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines
    .map((l, i) => `<tspan x="${x}" y="${startY + i * lineH}">${l.replace(/&/g, "&amp;").replace(/'/g, "&#39;")}</tspan>`)
    .join("");
}

async function brand(rawPath, caption, outPath) {
  const W = 1290, H = 2796;
  const shotW = 1040;
  const shot = await sharp(rawPath).resize(shotW).toBuffer();
  const meta = await sharp(shot).metadata();
  const shotH = meta.height;
  const r = 56;
  const mask = Buffer.from(`<svg width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="${r}" ry="${r}"/></svg>`);
  const rounded = await sharp(shot).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();

  const shotX = Math.round((W - shotW) / 2);
  const shotY = 560;
  const caps = wrapTspans(caption, 26, W / 2, 250, 110);

  const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6e3d8"/>
        <stop offset="1" stop-color="#faf7f0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="700" fill="#266c44">${caps}</text>
  </svg>`);

  // soft shadow behind the phone shot
  const shadow = Buffer.from(`<svg width="${shotW + 80}" height="${shotH + 80}"><rect x="40" y="48" width="${shotW}" height="${shotH}" rx="${r}" fill="#3a3a32" opacity="0.18"/></svg>`);
  const shadowBlur = await sharp(shadow).blur(28).png().toBuffer();

  await sharp(bg)
    .composite([
      { input: shadowBlur, left: shotX - 40, top: shotY - 40 },
      { input: rounded, left: shotX, top: shotY },
    ])
    .png()
    .toFile(outPath);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 });
  await ctx.addInitScript(([p, s]) => {
    try {
      localStorage.setItem("sift.profile", JSON.stringify(p));
      localStorage.setItem("sift.shopping", JSON.stringify(s));
    } catch (e) {}
  }, [profile, shopping]);
  const page = await ctx.newPage();

  for (const shot of shots) {
    await page.goto(BASE + shot.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    if (shot.setup) await shot.setup(page);
    await page.waitForTimeout(800);
    const raw = `${ROOT}/raw/${shot.name}.png`;
    await page.screenshot({ path: raw });
    await brand(raw, shot.caption, `${ROOT}/${shot.name}.png`);
    console.log("done", shot.name);
  }
  await browser.close();
  console.log("ALL DONE");
})();
