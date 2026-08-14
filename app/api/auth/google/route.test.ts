import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createD1Stub } from "@/lib/testing/d1Stub";
import { POST } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");
const CLIENT_ID = "test-client-id.apps.googleusercontent.com";

function injectEnv(env: Record<string, unknown>) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = { env };
}

function tokenInfo() {
  return {
    sub: "google-sub-123",
    iss: "accounts.google.com",
    aud: CLIENT_ID,
    exp: String(Math.floor(Date.now() / 1000) + 3600),
    email: "user@example.com",
    name: "Test User",
    picture: "https://lh3.googleusercontent.com/a/photo",
    locale: "en",
  };
}

function postCredential(credential?: string) {
  return new Request("http://localhost/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = CLIENT_ID;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/auth/google", () => {
  it("returns 503 when D1 is not configured", async () => {
    const res = await POST(postCredential("credential"));
    expect(res.status).toBe(503);
  });

  it("returns 400 when credential is missing", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    const res = await POST(postCredential());
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("credential is required");
  });

  it("returns 401 for an invalid token", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    );

    const res = await POST(postCredential("bad-credential"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when the Google client id is not configured", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => tokenInfo() })
    );

    const res = await POST(postCredential("credential"));
    expect(res.status).toBe(503);
  });

  it("verifies the token, upserts the user and sets the session cookie", async () => {
    const { db, statements } = createD1Stub({
      rows: {
        "RETURNING id": [
          {
            id: "user-1",
            google_sub: "google-sub-123",
            email: "user@example.com",
            name: "Test User",
            picture: "https://lh3.googleusercontent.com/a/photo",
            locale: "en",
          },
        ],
      },
    });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => tokenInfo() })
    );

    const res = await POST(postCredential("credential"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      picture: "https://lh3.googleusercontent.com/a/photo",
      locale: "en",
    });
    expect(body.user.google_sub).toBeUndefined();

    const setCookie = res.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toContain("serenai_session=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");

    // The upsert must have been the first prepared statement.
    expect(statements[0].sql).toContain("ON CONFLICT(google_sub)");
  });
});
