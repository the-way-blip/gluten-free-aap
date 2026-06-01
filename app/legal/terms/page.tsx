import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata = { title: "Terms of Service — Sift" };

export default function TermsPage() {
  return (
    <div>
      <Header title="Terms of Service" />
      <div className="space-y-4 px-5 pb-10 pt-5 text-sm leading-relaxed text-gray-700">
        <p className="text-xs text-gray-400">Last updated: June 2026</p>

        <Section title="1. Acceptance">
          By using Sift you agree to these Terms. If you do not agree, please do
          not use the app.
        </Section>

        <Section title="2. What Sift is">
          Sift helps you discover gluten-free recipes, meal ideas, shopping
          lists, and restaurant guidance. It is informational only — see our{" "}
          <Link href="/legal/disclaimer" className="underline">
            Medical Disclaimer
          </Link>
          . You are responsible for verifying that any food is safe for you.
        </Section>

        <Section title="3. Accounts">
          You are responsible for activity under your account and for keeping
          your login secure. You must provide accurate information and be old
          enough to form a binding contract in your jurisdiction.
        </Section>

        <Section title="4. Subscriptions & billing">
          Premium features are offered on a paid subscription after any free
          trial. Subscriptions renew automatically until cancelled. You can
          cancel anytime from your account; access continues through the end of
          the paid period. Payments are processed by our payment provider; we do
          not store your card details. Prices may change with notice.
        </Section>

        <Section title="5. Refunds">
          Except where required by law, payments are non-refundable. Cancelling
          stops future charges.
        </Section>

        <Section title="6. Acceptable use">
          Don’t misuse the service, attempt to break or overload it, or use it
          for unlawful purposes.
        </Section>

        <Section title="7. No warranty / limitation of liability">
          Sift is provided “as is,” without warranties of any kind. To the
          maximum extent permitted by law, we are not liable for any damages
          arising from your use of the app, including any reliance on its
          gluten-free assessments.
        </Section>

        <Section title="8. Changes & contact">
          We may update these Terms; continued use means acceptance. Questions?
          Contact dillon@branddesignco.com.
        </Section>

        <p className="text-xs text-gray-400">
          This is a starting template, not legal advice. Have it reviewed by a
          qualified attorney before launch.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-base font-semibold text-grain-900">
        {title}
      </h2>
      <p className="mt-1">{children}</p>
    </div>
  );
}
