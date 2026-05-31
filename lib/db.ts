import { sql } from "@vercel/postgres";

/**
 * Minimal cloud store: one row per user holding their whole Sift state as JSON.
 * Simple and robust — the app already serializes everything to localStorage,
 * so we mirror that same shape to a single JSONB blob keyed by Clerk user id.
 */

let ensured = false;

async function ensureTable() {
  if (ensured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS sift_user_data (
      user_id TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  ensured = true;
}

export async function getUserData(
  userId: string
): Promise<Record<string, unknown> | null> {
  await ensureTable();
  const { rows } = await sql`
    SELECT data FROM sift_user_data WHERE user_id = ${userId}
  `;
  if (rows.length === 0) return null;
  return rows[0].data as Record<string, unknown>;
}

export async function putUserData(
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  await ensureTable();
  const json = JSON.stringify(data);
  await sql`
    INSERT INTO sift_user_data (user_id, data, updated_at)
    VALUES (${userId}, ${json}::jsonb, now())
    ON CONFLICT (user_id)
    DO UPDATE SET data = ${json}::jsonb, updated_at = now()
  `;
}
