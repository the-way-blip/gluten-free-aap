import { Header } from "@/components/Header";

export const metadata = { title: "Privacy Policy — Sift" };

export default function PrivacyPage() {
  return (
    <div>
      <Header title="Privacy Policy" />
      <div className="space-y-4 px-5 pb-10 pt-5 text-sm leading-relaxed text-gray-700">
        <p className="text-xs text-gray-400">Last updated: June 2026</p>

        <Section title="The short version">
          Sift is built to work locally on your device. Your profile, pantry,
          recipes, and lists are stored in your browser. If you create an
          account, that data is also synced to our database so it follows you
          across devices.
        </Section>

        <Section title="What we collect">
          <ul className="ml-4 list-disc space-y-1">
            <li>
              Account info (email) via our authentication provider, if you sign
              up.
            </li>
            <li>
              Your app data (dietary profile, pantry, saved recipes, shopping
              list, saved restaurants) — to provide the service and sync it.
            </li>
            <li>
              Payment status via our payment provider. We never see or store
              your full card details.
            </li>
            <li>Basic, privacy-respecting usage diagnostics.</li>
          </ul>
        </Section>

        <Section title="How we use it">
          To run the app, personalize recipes and grades to your profile, sync
          across your devices, and process subscriptions. We do not sell your
          personal data.
        </Section>

        <Section title="AI processing">
          When you use AI features, the relevant inputs (e.g. pantry items, a
          product name) are sent to our AI provider to generate a response. Don’t
          submit information you don’t want processed this way.
        </Section>

        <Section title="Your choices">
          You can edit or clear your data anytime in Settings (“Reset all my
          data”), and you can request account deletion by contacting us.
        </Section>

        <Section title="Contact">
          Privacy questions: dillon@branddesignco.com.
        </Section>

        <p className="text-xs text-gray-400">
          This is a starting template, not legal advice. Review it (and any GDPR
          / CCPA obligations) with a qualified professional before launch.
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
      <div className="mt-1">{children}</div>
    </div>
  );
}
