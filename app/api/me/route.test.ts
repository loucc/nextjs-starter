import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createD1Stub } from "@/lib/testing/d1Stub";
import { signSessionToken } from "@/lib/session";
import { GET } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

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

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
});

describe("GET /api/me", () => {
  it("returns 503 when D1 is missing", async () => {
    const res = await GET(new Request("http://localhost/api/me"));
    expect(res.status).toBe(503);
  });

  it("returns 401 without a session", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    const res = await GET(new Request("http://localhost/api/me"));
    expect(res.status).toBe(401);
  });

  it("returns the current user with a valid session", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });

    const token = await signSessionToken("google-sub-123");
    const res = await GET(
      new Request("http://localhost/api/me", {
        headers: { cookie: `serenai_session=${token}` },
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toEqual({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      picture: "https://lh3.googleusercontent.com/a/photo",
      locale: "en",
    });
  });
});
