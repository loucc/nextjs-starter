import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createD1Stub } from "@/lib/testing/d1Stub";
import { signSessionToken } from "@/lib/session";
import { GET, POST } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

const USER_ROW = {
  id: "user-1",
  google_sub: "google-sub-123",
  email: "user@example.com",
  name: null,
  picture: null,
  locale: null,
};

const CONV_ROW = {
  id: "conv-1",
  title: "My feelings today",
  created_at: 1000,
  updated_at: 2000,
};

function injectEnv(env: Record<string, unknown>) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = { env };
}

async function authedRequest(init?: RequestInit): Promise<Request> {
  const token = await signSessionToken("google-sub-123");
  return new Request("http://localhost/api/conversations", {
    headers: { cookie: `serenai_session=${token}` },
    ...init,
  });
}

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
});

describe("GET /api/conversations", () => {
  it("returns 401 without a session", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    const res = await GET(new Request("http://localhost/api/conversations"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when D1 is missing", async () => {
    const res = await GET(new Request("http://localhost/api/conversations"));
    expect(res.status).toBe(503);
  });

  it("lists the user's conversations", async () => {
    const { db } = createD1Stub({
      rows: {
        "SELECT id, google_sub": [USER_ROW],
        "ORDER BY updated_at DESC": [CONV_ROW],
      },
    });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });

    const res = await GET(await authedRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.conversations).toEqual([
      { id: "conv-1", title: "My feelings today", createdAt: 1000, updatedAt: 2000 },
    ]);
  });
});

describe("POST /api/conversations", () => {
  it("creates a conversation for the user", async () => {
    const { db } = createD1Stub({
      rows: { "SELECT id, google_sub": [USER_ROW] },
    });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });

    const res = await POST(await authedRequest({ method: "POST" }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.conversation.title).toBeNull();
    expect(body.conversation.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns 401 without a session", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    const res = await POST(
      new Request("http://localhost/api/conversations", { method: "POST" })
    );
    expect(res.status).toBe(401);
  });
});
