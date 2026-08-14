import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");
const SECRET = "asset-secret";

function mockBucket() {
  const bucket = {
    put: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({
      objects: [{ key: "assets/a.pdf", size: 42, uploaded: "2026-01-01" }],
    }),
  };
  (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL] = {
    env: { BUCKET: bucket },
  };
  return bucket;
}

function authorizedRequest(init?: RequestInit) {
  return new Request("http://localhost/api/assets", {
    headers: { authorization: `Bearer ${SECRET}` },
    ...init,
  });
}

beforeEach(() => {
  process.env.ASSET_UPLOAD_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.ASSET_UPLOAD_SECRET;
  delete (globalThis as Record<symbol, unknown>)[CONTEXT_SYMBOL];
  vi.restoreAllMocks();
});

describe("GET /api/assets", () => {
  it("rejects requests without the secret", async () => {
    const res = await GET(new Request("http://localhost/api/assets"));
    expect(res.status).toBe(401);
  });

  it("returns a 503 when storage is not configured", async () => {
    const res = await GET(authorizedRequest());
    expect(res.status).toBe(503);
  });

  it("lists uploaded assets", async () => {
    mockBucket();
    const res = await GET(authorizedRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.objects).toHaveLength(1);
    expect(body.objects[0].key).toBe("assets/a.pdf");
  });
});

describe("POST /api/assets", () => {
  it("rejects uploads when the secret is not configured", async () => {
    delete process.env.ASSET_UPLOAD_SECRET;
    const form = new FormData();
    form.append("file", new File(["data"], "a.txt"));
    const res = await POST(
      new Request("http://localhost/api/assets", { method: "POST", body: form })
    );
    expect(res.status).toBe(401);
  });

  it("rejects requests without a file", async () => {
    mockBucket();
    const res = await POST(
      authorizedRequest({ method: "POST", body: new FormData() })
    );
    expect(res.status).toBe(400);
  });

  it("uploads a file with a sanitized key and returns its url", async () => {
    const bucket = mockBucket();
    const form = new FormData();
    form.append("file", new File(["hello"], "My Press-Kit.PDF", { type: "application/pdf" }));

    const res = await POST(
      authorizedRequest({ method: "POST", body: form })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.key).toBe("assets/my-press-kit.pdf");
    expect(body.url).toBe("/api/download/assets/my-press-kit.pdf");
    expect(bucket.put).toHaveBeenCalledOnce();
    const [key, , options] = bucket.put.mock.calls[0];
    expect(key).toBe("assets/my-press-kit.pdf");
    expect(options.httpMetadata.contentType).toBe("application/pdf");
  });
});
