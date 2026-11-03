import Link from "next/link";
import type { Metadata } from "next";
import { AppStoreBadge, APP_STORE_URL } from "@/components/AppStoreBadge";

/**
 * Public marketing homepage. Middleware rewrites eatsift.app/ → /welcome for
 * first-time web visitors (search, outreach links), because the app home at "/"
 * is client-rendered and shows only "Loading Sift…" to crawlers and new visitors.
 * The iOS app loads sift-self.vercel.app, so it never sees this page.
 */
export const metadata: Metadata = {
  title: "Sift — Gluten-Free Made Easy | Recipes, Restaurants & Label Checks",
  description:
    "Turn any recipe gluten-free, check ingredient labels, and see what's safe to order at 80+ restaurant chains. Free on iPhone, with a 7-day free Premium trial.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sift — Gluten-Free Made Easy",
    description:
      "Turn any recipe gluten-free, check labels, and order safely at 80+ chains. Free on iPhone.",
    url: "https://eatsift.app",
    images: ["/ad/sift-ad-import.png"],
  },
};

const FEATURES = [
  {
    emoji: "🔗",
    title: "Make any recipe gluten-free",
    body: "Share a recipe link, paste the text, or snap a photo. Sift flags what has gluten and suggests swaps.",
  },
  {
    emoji: "🏷️",
    title: "Check labels and ingredients",
    body: "Look up an ingredient or scan a label to see whether it's typically gluten-free.",
  },
  {
    emoji: "🍽️",
    title: "Eat out with less guessing",
    body: "Ordering guides for 80+ US chains: what's naturally gluten-free, what to modify, and shared-fryer notes.",
  },
  {
    emoji: "🛒",
    title: "Plan meals and shop",
    body: "Recipes matched to how strict you need to be, a meal planner, and a shopping list that builds itself.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Sift - Gluten-Free Made Easy",
    operatingSystem: "iOS",
    applicationCategory: "HealthApplication",
    url: "https://eatsift.app",
    downloadUrl: APP_STORE_URL,
    installUrl: APP_STORE_URL,
    image: "https://eatsift.app/sift-icon.png",
    description:
      "Turn any recipe gluten-free, check ingredient labels, and see what's safe to order at 80+ restaurant chains.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sift",
    url: "https://eatsift.app",
  },
];

export default function WelcomePage() {
  return (
    <main className="px-6 pb-20 pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sift-icon.png" alt="" className="h-12 w-12 rounded-2xl shadow-md" />
        <span className="font-display text-2xl font-bold text-grain-900">Sift</span>
      </div>

      <h1 className="mt-8 font-display text-4xl font-bold leading-tight text-leaf-700">
        Gluten-free,
        <br />
        <span className="text-clay-600">made easy.</span>
      </h1>
      <p className="mt-3 text-lg text-gray-600">
        Turn any recipe gluten-free, check labels, and know what to order when you
        eat out — set to how careful you need to be.
      </p>

      <AppStoreBadge height={56} className="mt-7" />
      <p className="mt-2 text-sm text-gray-500">
        Free on iPhone · Premium includes a 7-day free trial
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ad/sift-ad-import.png"
        alt="Sift turning a recipe link into a gluten-free version with swaps"
        className="mt-10 w-full rounded-3xl shadow-lg"
      />

      <ul className="mt-10 space-y-4">
        {FEATURES.map((f) => (
          <li key={f.title} className="card p-4">
            <p className="font-semibold text-grain-900">
              <span className="mr-2">{f.emoji}</span>
              {f.title}
            </p>
            <p className="mt-1 text-sm text-gray-600">{f.body}</p>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-grain-900">Free guides</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <Link href="/eat" className="font-semibold text-leaf-700 underline">
              Gluten-free restaurant guides (80+ chains)
            </Link>
          </li>
          <li>
            <Link href="/gf" className="font-semibold text-leaf-700 underline">
              Is it gluten-free? Ingredient guide (110+ ingredients)
            </Link>
          </li>
        </ul>
      </section>

      <div className="card mt-12 p-5 text-center">
        <p className="font-semibold text-grain-900">Ready to try it?</p>
        <AppStoreBadge height={48} className="mt-3" />
        <p className="mt-3 text-sm text-gray-500">
          No iPhone?{" "}
          <a href="/?app=1" className="underline">
            Use Sift on the web
          </a>
        </p>
      </div>

      <p className="mt-10 text-center text-xs text-gray-400">
        Sift is guidance, not medical advice. Always confirm with labels and staff.
        <br />
        <Link href="/legal/privacy" className="underline">Privacy</Link> ·{" "}
        <Link href="/support" className="underline">Support</Link>
      </p>
    </main>
  );
}
