import { afterEach, describe, expect, it, vi } from "vitest";

// Mock next/og (satori+resvg) — the actual rendering is verified on
// workerd; these tests cover validation, cache and fallback paths.
vi.mock("next/og", () => ({
  ImageResponse: class {
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(8));
    }
  },
}));

vi.mock("@/lib/content", () => ({
  getPosts: async () => ({
    posts: [
      {
        title: "Test Post",
        description: "A test post",
        slug: "/test-post",
        date: new Date("2026-01-10"),
        metadata: {},
      },
    ],
  }),
}));

// i18n/routing pulls in next-intl's navigation which imports
// next/navigation — unavailable in the vitest node environment.
vi.mock("@/i18n/routing", () => ({
  LOCALES: ["en", "zh", "ja"],
  DEFAULT_LOCALE: "en",
}));

import { GET } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

function mockBucket(getImpl: (key: string) => unknown, putImpl = vi.fn()) {
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = {
    env: { BUCKET: { get: getImpl, put: putImpl } },
  };
  return { put: putImpl };
}

afterEach(() => {
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
  vi.restoreAllMocks();
});

describe("GET /api/og", () => {
  it("falls back to og.png for invalid locales", async () => {
    const res = await GET(new Request("http://localhost/api/og?type=blog&locale=xx&slug=/test-post"));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/og.png");
  });

  it("falls back for unknown slugs", async () => {
    const res = await GET(new Request("http://localhost/api/og?type=blog&locale=en&slug=/nope"));
    expect(res.status).toBe(302);
  });

  it("serves the cached PNG when present", async () => {
    const png = new Uint8Array([1, 2, 3]).buffer;
    const { put } = mockBucket(async () => ({
      arrayBuffer: () => Promise.resolve(png),
    }));
    const res = await GET(new Request("http://localhost/api/og?type=home&locale=en"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(await res.arrayBuffer()).toEqual(png);
    expect(put).not.toHaveBeenCalled();
  });
});
