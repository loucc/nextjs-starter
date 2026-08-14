import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Buffer } from "node:buffer";
import { createD1Stub } from "@/lib/testing/d1Stub";
import {
  clearSessionCookie,
  getSessionUser,
  requireUser,
  SESSION_COOKIE,
  sessionCookieHeader,
  signSessionToken,
} from "./session";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");
const SECRET = "session-test-secret";

const USER_ROW = {
  id: "user-1",
  google_sub: "google-sub-123",
  email: "user@example.com",
  name: "Test User",
  picture: "https://lh3.googleusercontent.com/a/photo",
  locale: "en",
};

function injectEnv(env: Record<string, unknown>) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = { env };
}

function requestWithCookie(cookie?: string) {
  return new Request("http://localhost/api/test", {
    headers: cookie ? { cookie } : {},
  });
}

beforeEach(() => {
  process.env.SESSION_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
});

async function hmacPayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return Buffer.from(sig).toString("base64url");
}

describe("session cookies", () => {
  it("signs and resolves a session roundtrip", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db });

    const token = await signSessionToken("google-sub-123");
    const user = await getSessionUser(requestWithCookie(`${SESSION_COOKIE}=${token}`));
    expect(user).not.toBeNull();
    expect(user?.id).toBe("user-1");
    expect(user?.email).toBe("user@example.com");
    expect(user?.googleSub).toBe("google-sub-123");
  });

  it("returns null for a tampered token", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db });

    const token = await signSessionToken("google-sub-123");
    const [payload, sig] = token.split(".");
    const tampered = `${payload}.${sig[0] === "A" ? "B" : "A"}${sig.slice(1)}`;
    const user = await getSessionUser(requestWithCookie(`${SESSION_COOKIE}=${tampered}`));
    expect(user).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db });

    const payload = Buffer.from(
      JSON.stringify({ sub: "google-sub-123", exp: Date.now() - 1000 })
    ).toString("base64url");
    const token = `${payload}.${await hmacPayload(payload)}`;
    const user = await getSessionUser(requestWithCookie(`${SESSION_COOKIE}=${token}`));
    expect(user).toBeNull();
  });

  it("returns null without a cookie", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db });
    expect(await getSessionUser(requestWithCookie())).toBeNull();
  });

  it("returns null when the DB binding is missing", async () => {
    const token = await signSessionToken("google-sub-123");
    const user = await getSessionUser(requestWithCookie(`${SESSION_COOKIE}=${token}`));
    expect(user).toBeNull();
  });

  it("returns null for an unknown user", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [] } });
    injectEnv({ DB: db });

    const token = await signSessionToken("ghost-sub");
    expect(
      await getSessionUser(requestWithCookie(`${SESSION_COOKIE}=${token}`))
    ).toBeNull();
  });

  it("emits HttpOnly SameSite cookie headers", () => {
    const header = sessionCookieHeader("abc.def");
    expect(header).toContain(`${SESSION_COOKIE}=abc.def`);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
    expect(header).toContain("Path=/");
    expect(header).toContain("Max-Age=2592000");

    const cleared = clearSessionCookie();
    expect(cleared).toContain("Max-Age=0");
  });
});

describe("requireUser", () => {
  it("returns 503 when D1 is missing", async () => {
    const result = await requireUser(requestWithCookie());
    expect(result).toEqual({ error: "Database is not configured", status: 503 });
  });

  it("returns 401 when unauthenticated", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    const result = await requireUser(requestWithCookie());
    expect(result).toEqual({ error: "Unauthorized", status: 401 });
  });

  it("returns the user when authenticated", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db });

    const token = await signSessionToken("google-sub-123");
    const result = await requireUser(
      requestWithCookie(`${SESSION_COOKIE}=${token}`)
    );
    expect("user" in result).toBe(true);
    if ("user" in result) {
      expect(result.user.id).toBe("user-1");
    }
  });
});
