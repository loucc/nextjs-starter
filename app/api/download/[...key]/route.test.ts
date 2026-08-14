import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

function mockBucket(getImpl: (key: string) => unknown) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = {
    env: { BUCKET: { get: getImpl } },
  };
}

function params(key: string[]) {
  return { params: Promise.resolve({ key }) };
}

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
  vi.restoreAllMocks();
});

describe("GET /api/download/[...key]", () => {
  it("rejects traversal keys", async () => {
    mockBucket(vi.fn());
    const res = await GET(
      new Request("http://localhost/api/download/.."),
      params([".."])
    );
    expect(res.status).toBe(404);
  });

  it("returns 503 when storage is not configured", async () => {
    const res = await GET(
      new Request("http://localhost/api/download/assets/a.pdf"),
      params(["assets", "a.pdf"])
    );
    expect(res.status).toBe(503);
  });

  it("returns 404 for missing objects", async () => {
    mockBucket(vi.fn().mockResolvedValue(null));
    const res = await GET(
      new Request("http://localhost/api/download/assets/missing.pdf"),
      params(["assets", "missing.pdf"])
    );
    expect(res.status).toBe(404);
  });

  it("streams the object with content-type and cache headers", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("PDF!"));
        controller.close();
      },
    });
    mockBucket(
      vi.fn().mockResolvedValue({
        body: stream,
        httpMetadata: { contentType: "application/pdf" },
        etag: "abc",
      })
    );

    const res = await GET(
      new Request("http://localhost/api/download/assets/a.pdf"),
      params(["assets", "a.pdf"])
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(res.headers.get("etag")).toBe("abc");
    expect(await res.text()).toBe("PDF!");
  });
});
