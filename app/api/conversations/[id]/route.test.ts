import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createD1Stub } from "@/lib/testing/d1Stub";
import { signSessionToken } from "@/lib/session";
import { DELETE } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

const USER_ROW = {
  id: "user-1",
  google_sub: "google-sub-123",
  email: "user@example.com",
  name: null,
  picture: null,
  locale: null,
};

function injectEnv(env: Record<string, unknown>) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = { env };
}

async function authedRequest(conversationId: string): Promise<Request> {
  const token = await signSessionToken("google-sub-123");
  return new Request(`http://localhost/api/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { cookie: `serenai_session=${token}` },
  });
}

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
});

describe("DELETE /api/conversations/[id]", () => {
  it("returns 401 without a session", async () => {
    const { db } = createD1Stub();
    injectEnv({ DB: db });
    const res = await DELETE(
      new Request("http://localhost/api/conversations/conv-1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "conv-1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("deletes the owned conversation", async () => {
    const { db, batchStatements } = createD1Stub({
      rows: { "SELECT id, google_sub": [USER_ROW] },
      batchResult: [{ success: true }, { success: true, meta: { changes: 1 } }],
    });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });

    const res = await DELETE(await authedRequest("conv-1"), {
      params: Promise.resolve({ id: "conv-1" }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(batchStatements).toHaveLength(2);
    expect(batchStatements[1].sql).toContain("AND user_id = ?");
  });

  it("returns 404 when the conversation belongs to someone else", async () => {
    const { db } = createD1Stub({
      rows: { "SELECT id, google_sub": [USER_ROW] },
      batchResult: [{ success: true }, { success: true, meta: { changes: 0 } }],
    });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });

    const res = await DELETE(await authedRequest("foreign-conv"), {
      params: Promise.resolve({ id: "foreign-conv" }),
    });
    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe("Not found");
  });
});
