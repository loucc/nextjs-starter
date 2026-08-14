// ---------------------------------------------------------------------------
// Google OAuth ID-token verification (Google Identity Services client flow).
//
// The client sends the GIS `credential` JWT to /api/auth/google; we verify
// it against Google's tokeninfo endpoint (iss/aud/exp) and upsert the user
// into D1. Upgrade path if tokeninfo rate limits bite in production:
// verify the JWT locally with `jose` + Google's JWKS endpoint (~20KB).
// ---------------------------------------------------------------------------

import type { D1Database } from "@cloudflare/workers-types";

export interface GoogleProfile {
  googleSub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  locale: string | null;
}

interface TokenInfo {
  sub: string;
  iss?: string;
  aud?: string;
  exp?: string;
  email?: string;
  name?: string;
  picture?: string;
  locale?: string;
}

/**
 * Verifies a Google ID token and returns the profile. Throws
 * "Google sign-in is not configured" (503) or "Invalid Google ID token" (401).
 */
export async function verifyGoogleIdToken(
  credential: string,
  fetchFn: typeof fetch = fetch
): Promise<GoogleProfile> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "Google sign-in is not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID)"
    );
  }

  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
    credential
  )}`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error("Invalid Google ID token");

  const info = (await res.json()) as TokenInfo;
  if (info.iss !== "accounts.google.com") throw new Error("Invalid Google ID token");
  if (info.aud !== clientId) throw new Error("Invalid Google ID token");

  const expMs = Number(info.exp) * 1000;
  if (!Number.isFinite(expMs) || expMs < Date.now()) {
    throw new Error("Invalid Google ID token");
  }

  return {
    googleSub: info.sub,
    email: info.email ?? null,
    name: info.name ?? null,
    picture: info.picture ?? null,
    locale: info.locale ?? null,
  };
}

export interface UserRow {
  id: string;
  google_sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  locale: string | null;
}

/**
 * Inserts or updates the user row for a Google profile, returning the row.
 * Single-statement upsert so concurrent logins cannot race.
 */
export async function upsertUser(
  db: D1Database,
  profile: GoogleProfile
): Promise<UserRow> {
  const now = Date.now();
  const row = await db
    .prepare(
      `INSERT INTO users (id, google_sub, email, name, picture, locale, created_at, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(google_sub) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture,
         locale = excluded.locale,
         last_login_at = excluded.last_login_at
       RETURNING id, google_sub, email, name, picture, locale`
    )
    .bind(
      crypto.randomUUID(),
      profile.googleSub,
      profile.email,
      profile.name,
      profile.picture,
      profile.locale,
      now,
      now
    )
    .first();

  if (!row) {
    throw new Error("User upsert failed");
  }

  return {
    id: row.id as string,
    google_sub: row.google_sub as string,
    email: (row.email as string | null) ?? null,
    name: (row.name as string | null) ?? null,
    picture: (row.picture as string | null) ?? null,
    locale: (row.locale as string | null) ?? null,
  };
}
