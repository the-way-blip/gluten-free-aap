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
  // Public homepage: first-time web visitors to eatsift.app/ get the
  // server-rendered marketing page (/welcome) instead of the client-only app
  // shell. The iOS app uses sift-self.vercel.app, so it is never rewritten.
  // "?app=1" (or the sift_web cookie it sets) opts into the web app.
  const host = req.headers.get("host") ?? "";
  if (host === "eatsift.app" && req.nextUrl.pathname.startsWith("/onboarding") && !req.cookies.get("sift_web")) {
    // Someone starting the web app directly — don't bounce them to /welcome after.
    const res = NextResponse.next();
    res.cookies.set("sift_web", "1", { maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }
  if (host === "eatsift.app" && req.nextUrl.pathname === "/") {
    if (req.nextUrl.searchParams.get("app") === "1") {
      const res = NextResponse.next();
      res.cookies.set("sift_web", "1", { maxAge: 60 * 60 * 24 * 365, path: "/" });
      return res;
    }
    if (!req.cookies.get("sift_web")) {
      return NextResponse.rewrite(new URL("/welcome", req.url));
    }
  }

  if (!CLERK_ENABLED) return NextResponse.next();
  const { clerkMiddleware } = await import("@clerk/nextjs/server");
  // No routes are protected by default (the app is usable signed-out); this
  // just attaches Clerk's auth context so /api/sync can read the user id.
  return clerkMiddleware()(req, event);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
