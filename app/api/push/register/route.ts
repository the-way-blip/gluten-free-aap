import { NextResponse } from "next/server";

/**
 * Remote-push groundwork. Native builds will POST their APNs device token here
 * once the Push capability ships. Until a database is provisioned this accepts
 * and discards tokens (204) so old clients never error; wiring it up needs:
 *   1. Vercel Postgres (POSTGRES_URL) — store {token, premium, lastSeen}
 *   2. An APNs auth key (.p8) from developer.apple.com → env APNS_KEY etc.
 *   3. Push Notifications capability on the App target (Xcode) + build
 *   4. A send script/cron using token-based APNs JWT auth
 */
export async function POST(req: Request) {
  try {
    await req.json();
  } catch {
    /* ignore malformed */
  }
  return new NextResponse(null, { status: 204 });
}
