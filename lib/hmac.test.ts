import { describe, expect, it, vi } from "vitest";
import {
  base64UrlDecode,
  base64UrlEncode,
  getSecret,
  signPayload,
  verifyPayload,
} from "./hmac";

const SECRET = "test-secret";

async function hmacPayload(payload: string, secret = SECRET): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
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

describe("hmac shared utilities", () => {
  it("base64url roundtrips bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252]);
    const encoded = base64UrlEncode(bytes);
    expect(encoded).not.toContain("=");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect([...base64UrlDecode(encoded)]).toEqual([...bytes]);
  });

  it("getSecret falls back to the dev value with a warning", () => {
    delete process.env.SOME_MISSING_SECRET;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(getSecret("SOME_MISSING_SECRET", "dev-fallback", "warning text")).toBe(
      "dev-fallback"
    );
    expect(warn).toHaveBeenCalledWith("warning text");
    warn.mockRestore();
  });

  it("getSecret prefers the configured env value", () => {
    process.env.SOME_SECRET = "real-secret";
    expect(getSecret("SOME_SECRET", "dev-fallback", "warning text")).toBe(
      "real-secret"
    );
    delete process.env.SOME_SECRET;
  });

  it("signs and verifies a payload roundtrip", async () => {
    const token = await signPayload(
      { sub: "user-1", exp: Date.now() + 60_000 },
      SECRET
    );
    const claims = await verifyPayload<{ sub: string; exp: number }>(
      token,
      SECRET,
      { requiredClaims: ["sub", "exp"] }
    );
    expect(claims.sub).toBe("user-1");
    expect(claims.exp).toBeGreaterThan(Date.now());
  });

  it("rejects tampered signatures", async () => {
    const token = await signPayload({ sub: "user-1" }, SECRET);
    const [payload, sig] = token.split(".");
    const tampered = `${payload}.${sig[0] === "A" ? "B" : "A"}${sig.slice(1)}`;
    await expect(
      verifyPayload(tampered, SECRET, { invalidMessage: "bad" })
    ).rejects.toThrow("bad");
  });

  it("rejects missing required claims", async () => {
    const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 60_000 })).toString("base64url");
    const token = `${payload}.${await hmacPayload(payload)}`;
    await expect(
      verifyPayload(token, SECRET, {
        requiredClaims: ["sub"],
        invalidMessage: "no sub",
      })
    ).rejects.toThrow("no sub");
  });

  it("rejects expired tokens with the custom message", async () => {
    const payload = Buffer.from(JSON.stringify({ sub: "u", exp: Date.now() - 1 })).toString("base64url");
    const token = `${payload}.${await hmacPayload(payload)}`;
    await expect(
      verifyPayload(token, SECRET, { expiredMessage: "expired custom" })
    ).rejects.toThrow("expired custom");
  });

  it("rejects malformed tokens", async () => {
    await expect(verifyPayload("no-dots", SECRET)).rejects.toThrow(
      "Invalid token"
    );
    await expect(verifyPayload("payload.", SECRET)).rejects.toThrow(
      "Invalid token"
    );
    await expect(verifyPayload(".sig", SECRET)).rejects.toThrow("Invalid token");
  });

  it("rejects invalid JSON payloads", async () => {
    const payload = Buffer.from("not-json").toString("base64url");
    const token = `${payload}.${await hmacPayload(payload)}`;
    await expect(verifyPayload(token, SECRET)).rejects.toThrow("Invalid token");
  });
});
