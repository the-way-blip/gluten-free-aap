import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata = { title: "Support — Sift" };

const FAQ = [
  {
    q: "How do I get started?",
    a: "Open Sift and answer a few quick questions about how careful you need to be with gluten. That tunes your recipes and restaurant guidance. You can change it anytime in Settings.",
  },
  {
    q: "Do I need an account?",
    a: "No. Sift works fully without signing in — your profile, pantry, recipes, and lists are saved right on your device.",
  },
  {
    q: "Is Sift medical advice?",
    a: "No. Sift offers general gluten-free guidance to help you cook, shop, and eat out. Always confirm ingredients with current labels and restaurant staff, and consult a healthcare professional about your individual needs.",
  },
  {
    q: "The restaurant grades or recipes don't look right.",
    a: "Grades and suggestions are personalized estimates, not guarantees — menus and kitchens vary by location. Always verify with staff. If something seems off, email us and we'll take a look.",
  },
  {
    q: "How do I reset my data?",
    a: "Go to Settings → “Reset all my data.” This clears your profile, pantry, saved recipes, and lists from the device.",
  },
];

export default function SupportPage() {
  return (
    <div>
      <Header title="Help & Support" subtitle="We're happy to help" />
      <div className="space-y-6 px-5 pb-10 pt-5">
        <section className="card border-leaf-200 bg-leaf-50 p-5">
          <h2 className="font-display text-lg font-semibold text-grain-900">
            Contact us
          </h2>
          <p className="mt-1 text-sm text-leaf-800">
            Questions, feedback, or trouble with the app? Email us and we'll get
            back to you.
          </p>
          <a
            href="mailto:dillon@bigrapids.church"
            className="btn-primary mt-3 inline-block"
          >
            dillon@bigrapids.church
          </a>
          <p className="mt-2 text-xs text-leaf-700">
            We aim to reply within a couple of business days.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="card p-4">
                <h3 className="font-semibold text-grain-900">{f.q}</h3>
                <p className="mt-1 text-sm text-gray-600">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center text-sm text-gray-500">
          <p>
            See also our{" "}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/legal/terms" className="underline">
              Terms
            </Link>
            , and{" "}
            <Link href="/legal/disclaimer" className="underline">
              Medical Disclaimer
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
