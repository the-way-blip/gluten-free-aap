import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

/**
 * Auth middleware is only active when Clerk is configured. Without keys this is
 * a pass-through, so the app runs exactly as before (local-only). We avoid
 * importing Clerk's middleware unless a publishable key is present so an
 * unconfigured deploy can never crash on every request.
 */
const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent
) {
  if (!CLERK_ENABLED) return NextResponse.next();
  const { clerkMiddleware } = await import("@clerk/nextjs/server");
  // No routes are protected by default (the app is usable signed-out); this
  // just attaches Clerk's auth context so /api/sync can read the user id.
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
