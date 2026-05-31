import { NextResponse } from "next/server";
import { cloudReadyServer } from "@/lib/cloud-config";

/**
 * Pull (GET) and push (POST) the signed-in user's Sift data blob.
 * Gated: if Clerk/Postgres aren't configured, returns 501 so the client
 * silently stays in local-only mode.
 */

export async function GET() {
  if (!cloudReadyServer()) {
    return NextResponse.json({ enabled: false }, { status: 501 });
  }
  // Dynamic imports so the app builds/runs even when Clerk isn't installed-config.
  const { auth } = await import("@clerk/nextjs/server");
  const { getUserData } = await import("@/lib/db");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const data = await getUserData(userId);
    return NextResponse.json({ enabled: true, data: data ?? null });
  } catch (err) {
    return NextResponse.json(
      { enabled: true, error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!cloudReadyServer()) {
    return NextResponse.json({ enabled: false }, { status: 501 });
  }
  const { auth } = await import("@clerk/nextjs/server");
  const { putUserData } = await import("@/lib/db");
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { data?: Record<string, unknown> };
    await putUserData(userId, body.data ?? {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
