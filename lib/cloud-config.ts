/**
 * Feature flags for optional cloud features. Both are inlined/checked so the
 * app runs fully local-only when unset — adding accounts never breaks the
 * existing localStorage experience.
 */

/** True when Clerk auth keys are present (publishable key is build-inlined). */
export const CLERK_ENABLED =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** Server-only: true when both Clerk secret + a Postgres URL are configured. */
export function cloudReadyServer(): boolean {
  return (
    !!process.env.CLERK_SECRET_KEY &&
    !!(process.env.POSTGRES_URL || process.env.DATABASE_URL)
  );
}
