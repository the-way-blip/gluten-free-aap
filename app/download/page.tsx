import { AppStoreBadge, APP_STORE_URL } from "@/components/AppStoreBadge";
import { Doodle } from "@/components/Doodle";

export const metadata = {
  title: "Get Sift — Gluten-free, made easy",
  description:
    "Download Sift free on the App Store. Personalized gluten-free recipes, safe restaurants, and smart shopping — with a 7-day free Premium trial.",
};

const PERKS = [
  { emoji: "🍳", text: "Recipes tuned to how careful you need to be" },
  { emoji: "🍽️", text: "Restaurants graded for your safety" },
  { emoji: "🏷️", text: "Check any label or ingredient in seconds" },
  { emoji: "🛒", text: "Smart, gluten-free shopping lists" },
];

/**
 * Ad landing / bridge page. Meta Traffic ads can't link directly to an App
 * Store URL, so the "Download" ad points here; this page sends people to the
 * App Store. (No data capture yet — kept intentionally simple.)
 */
export default function DownloadPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center px-6 pb-16 pt-12 text-center">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/sift-icon.png"
          alt="Sift"
          className="h-16 w-16 rounded-2xl shadow-md"
        />
        <span className="font-display text-3xl font-bold text-grain-900">
          Sift
        </span>
      </div>

      <h1 className="mt-8 font-display text-4xl font-bold leading-tight text-leaf-700">
        Gluten-free,
        <br />
        <span className="text-clay-600">made easy.</span>
      </h1>
      <p className="mt-3 text-lg text-gray-600">
        Recipes, safe places to eat out, and smart shopping — for however
        careful you need to be.
      </p>

      <div className="mt-6 w-full rounded-2xl bg-leaf-50 p-4 text-leaf-800">
        <span className="font-semibold text-leaf-900">✨ Try Premium free</span>{" "}
        for 7 days — then cancel anytime.
      </div>

      <a href={APP_STORE_URL} className="mt-7" aria-label="Download Sift on the App Store">
        <AppStoreBadge height={56} />
      </a>
      <p className="mt-2 text-xs text-gray-400">Free on the App Store · iPhone</p>

      <ul className="mt-9 w-full space-y-3 text-left">
        {PERKS.map((p) => (
          <li
            key={p.text}
            className="flex items-center gap-3 rounded-xl bg-white/70 p-3 text-sm text-gray-700 shadow-sm"
          >
            <span className="text-xl">{p.emoji}</span>
            {p.text}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex items-center gap-2 text-grain-400">
        <Doodle name="wheat" className="h-5 w-5" />
        <span className="text-xs">
          Sift is guidance, not medical advice. Always confirm with labels and
          staff.
        </span>
      </div>
    </div>
  );
}
