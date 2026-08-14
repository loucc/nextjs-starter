import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) =>
      name === "cf-connecting-ip" ? "203.0.113.9" : null,
  }),
}));

import { verifyTurnstileToken } from "./turnstile";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  vi.restoreAllMocks();
});

afterEach(() => {
  delete process.env.TURNSTILE_SECRET_KEY;
});

describe("verifyTurnstileToken", () => {
  it("rejects missing tokens", async () => {
    await expect(verifyTurnstileToken(null)).rejects.toThrow(
      "Security verification is required"
    );
    await expect(verifyTurnstileToken("")).rejects.toThrow(
      "Security verification is required"
    );
  });

  it("skips verification when the secret is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(verifyTurnstileToken("any-token")).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });

  it("passes when siteverify returns success", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );
    await expect(verifyTurnstileToken("good-token")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(SITEVERIFY);
    expect(String(init?.body)).toContain("secret=test-secret");
    expect(String(init?.body)).toContain("remoteip=203.0.113.9");
  });

  it("throws with error codes when verification fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }),
        { status: 200 }
      )
    );
    await expect(verifyTurnstileToken("bad-token")).rejects.toThrow(
      "invalid-input-response"
    );
  });

  it("throws a friendly error when the service is unreachable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    await expect(verifyTurnstileToken("token")).rejects.toThrow(
      "Security verification service is unavailable"
    );
  });
});
