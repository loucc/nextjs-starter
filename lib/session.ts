// ---------------------------------------------------------------------------
// Login session cookies — stateless HMAC-signed tokens (see lib/hmac.ts).
//
// The cookie carries only { sub (google_sub), exp } — profile data is read
// from D1 per request so names/avatars never go stale and the cookie stays
// small. SESSION_SECRET is a worker secret (env binding); process.env is
// the local-Node/dev path.
// ---------------------------------------------------------------------------

import { getCloudflareEnv } from "@/lib/cloudflareEnv";
import { getDB } from "@/lib/db";
import { getSecret, signPayload, verifyPayload } from "@/lib/hmac";

export const SESSION_COOKIE = "serenai_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEV_SECRET = "dev-only-session-secret-do-not-use-in-production";

export interface SessionUser {
  id: string;
  googleSub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  locale: string | null;
}

/** Minimal user shape returned to the client (never expose google_sub). */
export function toPublicUser(user: SessionUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    locale: user.locale,
  };
}

function getSessionSecret(): string {
  // Worker secrets arrive via the env binding; process.env covers local dev.
  const binding = getCloudflareEnv()?.SESSION_SECRET;
  if (binding) return binding;
  return getSecret(
    "SESSION_SECRET",
    DEV_SECRET,
    "[Session] SESSION_SECRET is not configured — using a development fallback. Set it before production!"
  );
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

export function sessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
    SESSION_TTL_MS / 1000
  )}${secure}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function signSessionToken(sub: string): Promise<string> {
  return signPayload(
    { sub, exp: Date.now() + SESSION_TTL_MS },
    getSessionSecret()
  );
}

/**
 * Resolves the authenticated user from a request's session cookie, or
 * null. Null on ANY failure — missing/invalid/expired token, missing DB
 * binding, or unknown user. Callers that must distinguish 503 check the
 * DB binding first via requireUser.
 */
export async function getSessionUser(
  request: Request
): Promise<SessionUser | null> {
  const db = getDB();
  if (!db) return null;

  const token = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
  if (!token) return null;

  try {
    const claims = await verifyPayload<{ sub: string }>(
      token,
      getSessionSecret(),
      {
        requiredClaims: ["sub", "exp"],
        invalidMessage: "Invalid session",
        expiredMessage: "Session expired",
      }
    );

    const row = await db
      .prepare(
        "SELECT id, google_sub, email, name, picture, locale FROM users WHERE google_sub = ?"
      )
      .bind(claims.sub)
      .first();
    if (!row) return null;

    return {
      id: row.id as string,
      googleSub: row.google_sub as string,
      email: (row.email as string | null) ?? null,
      name: (row.name as string | null) ?? null,
      picture: (row.picture as string | null) ?? null,
      locale: (row.locale as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export type AuthResult =
  | { user: SessionUser }
  | { error: string; status: 401 | 503 };

/** Route helper: 503 when D1 is missing, 401 when unauthenticated. */
export async function requireUser(request: Request): Promise<AuthResult> {
  if (!getDB()) return { error: "Database is not configured", status: 503 };
  const user = await getSessionUser(request);
  if (!user) return { error: "Unauthorized", status: 401 };
  return { user };
}
