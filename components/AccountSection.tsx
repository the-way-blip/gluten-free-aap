"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/cloud-config";

/**
 * Account / cloud-sync controls. Renders nothing unless Clerk is configured,
 * so the local-only build is unaffected. Lives at the top of Settings.
 */
export function AccountSection() {
  if (!CLERK_ENABLED) return null;
  return <AccountInner />;
}

function AccountInner() {
  const { user } = useUser();
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Account
      </h2>
      <div className="card p-4">
        <SignedOut>
          <p className="text-sm text-gray-600">
            Sign in to back up your profile, pantry, recipes, and journal and
            sync them across your devices.
          </p>
          <SignInButton mode="modal">
            <button className="btn-primary mt-3 w-full">
              Sign in / Create account
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-grain-900">
                {user?.primaryEmailAddress?.emailAddress ??
                  user?.fullName ??
                  "Signed in"}
              </p>
              <p className="text-xs text-leaf-700">
                ☁︎ Your data is syncing across devices
              </p>
            </div>
            <SignOutButton>
              <button className="btn-secondary shrink-0">Sign out</button>
            </SignOutButton>
          </div>
        </SignedIn>
      </div>
    </section>
  );
}
