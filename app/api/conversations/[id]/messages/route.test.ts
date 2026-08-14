import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  locale: "en",
};

const CONV_ROW = {
  id: "conv-1",
  title: "My feelings today",
  created_at: 1000,
  updated_at: 2000,
};

function sseStream(frames: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const f of frames) controller.enqueue(encoder.encode(`data: ${f}\n\n`));
      controller.close();
    },
  });
}

function injectEnv(env: Record<string, unknown>) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = { env };
}

function mockAi(frames: string[] | Error) {
  return {
    run: vi.fn().mockImplementation(() =>
      frames instanceof Error
        ? Promise.reject(frames)
        : Promise.resolve(sseStream(frames))
    ),
  };
}

async function authedRequest(body?: unknown): Promise<Request> {
  const token = await signSessionToken("google-sub-123");
  return new Request("http://localhost/api/conversations/conv-1/messages", {
    method: "POST",
    headers: {
      cookie: `serenai_session=${token}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function baseDb() {
  return createD1Stub({
    rows: {
      "SELECT id, google_sub": [USER_ROW],
      "WHERE id = ? AND user_id = ?": [CONV_ROW],
      "ORDER BY created_at ASC": [
        { id: "m1", role: "user", content: "hi", created_at: 1 },
        { id: "m2", role: "assistant", content: "hello", created_at: 2 },
      ],
    },
  });
}

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

afterEach(() => {
  delete process.env.SESSION_SECRET;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
});

describe("GET /api/conversations/[id]/messages", () => {
  it("returns 401 without a session", async () => {
    const { db } = baseDb();
    injectEnv({ DB: db });
    const res = await GET(new Request("http://localhost/api/conversations/conv-1/messages"), {
      params: Promise.resolve({ id: "conv-1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 for a foreign conversation", async () => {
    const { db } = createD1Stub({ rows: { "SELECT id, google_sub": [USER_ROW] } });
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });
    const req = await authedRequest();
    const res = await GET(new Request(req.url, { headers: req.headers }), {
      params: Promise.resolve({ id: "foreign" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns the message history", async () => {
    const { db } = baseDb();
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });
    const req = await authedRequest();
    const res = await GET(new Request(req.url, { headers: req.headers }), {
      params: Promise.resolve({ id: "conv-1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe("user");
  });
});

describe("POST /api/conversations/[id]/messages (SSE)", () => {
  it("returns 503 when the AI binding is missing", async () => {
    const { db } = baseDb();
    injectEnv({ DB: db, SESSION_SECRET: "test-session-secret" });
    const res = await POST(await authedRequest({ content: "hi" }), {
      params: Promise.resolve({ id: "conv-1" }),
    });
    expect(res.status).toBe(503);
  });

  it("returns 400 for empty or over-long content", async () => {
    const { db } = baseDb();
    injectEnv({ DB: db, AI: mockAi([]), SESSION_SECRET: "test-session-secret" });

    const empty = await POST(await authedRequest({ content: "   " }), {
      params: Promise.resolve({ id: "conv-1" }),
    });
    expect(empty.status).toBe(400);

    const tooLong = await POST(
      await authedRequest({ content: "a".repeat(4001) }),
      { params: Promise.resolve({ id: "conv-1" }) }
    );
    expect(tooLong.status).toBe(400);
  });

  it("persists the user message, auto-titles, streams deltas and completes", async () => {
    const { db, statements } = baseDb();
    injectEnv({
      DB: db,
      AI: mockAi(['{"response":"I hear"}', '{"response":" you."}']),
      SESSION_SECRET: "test-session-secret",
    });

    const res = await POST(await authedRequest({ content: "I feel anxious" }), {
      params: Promise.resolve({ id: "conv-1" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");

    const text = await res.text();
    const frames = text
      .trim()
      .split("\n\n")
      .map((f) => JSON.parse(f.replace(/^data: /, "")));

    expect(frames.map((f) => f.type)).toEqual(["delta", "delta", "done"]);
    expect(frames[0].content).toBe("I hear");
    expect(frames[2].message.role).toBe("assistant");
    expect(frames[2].message.content).toBe("I hear you.");
    expect(frames[2].conversation.id).toBe("conv-1");
    expect(frames[2].conversation.title).toBe("My feelings today");

    // The user message was persisted before streaming...
    const insertUser = statements.find(
      (s) => s.sql.includes("INSERT INTO messages") && s.args[2] === "user"
    );
    expect(insertUser?.args).toContain("I feel anxious");

    // ...and the auto-title ran with COALESCE.
    const titleUpdate = statements.find((s) => s.sql.includes("COALESCE(title, ?)"));
    expect(titleUpdate?.args[0]).toBe("I feel anxious");
  });

  it("persists the fallback message and emits an error frame on AI failure", async () => {
    const { db, statements } = baseDb();
    injectEnv({
      DB: db,
      AI: mockAi(new Error("model exploded")),
      SESSION_SECRET: "test-session-secret",
    });

    const res = await POST(await authedRequest({ content: "hello" }), {
      params: Promise.resolve({ id: "conv-1" }),
    });
    const text = await res.text();
    const frames = text
      .trim()
      .split("\n\n")
      .map((f) => JSON.parse(f.replace(/^data: /, "")));

    expect(frames.map((f) => f.type)).toEqual(["error"]);
    expect(frames[0].error).toBe("AI stream failed");

    const fallbackInsert = statements.find(
      (s) => s.sql.includes("INSERT INTO messages") && s.args[2] === "assistant"
    );
    expect(fallbackInsert).toBeDefined();
    expect(String(fallbackInsert?.args[3]).length).toBeGreaterThan(10);
  });
});
