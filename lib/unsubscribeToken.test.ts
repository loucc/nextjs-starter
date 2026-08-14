import { describe, expect, it, beforeEach } from "vitest";
import {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
} from "./unsubscribeToken";

const SECRET = "test-secret";

// Tokens created via signUnsubscribeToken use process.env.UNSUBSCRIBE_SECRET
// with a dev fallback — pin the env for deterministic tests.
beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = SECRET;
});

async function hmacPayload(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
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

describe("unsubscribe tokens", () => {
  it("signs and verifies a token roundtrip", async () => {
    const token = await signUnsubscribeToken("test@example.com");
    expect(token).toContain(".");
    const email = await verifyUnsubscribeToken(token);
    expect(email).toBe("test@example.com");
  });

  it("rejects a tampered signature", async () => {
    const token = await signUnsubscribeToken("test@example.com");
    const [payload, sig] = token.split(".");
    const tampered = `${payload}.${sig[0] === "A" ? "B" : "A"}${sig.slice(1)}`;
    await expect(verifyUnsubscribeToken(tampered)).rejects.toThrow(
      "Invalid unsubscribe link"
    );
  });

  it("rejects a forged payload signed with a different key assumption", async () => {
    // Attacker re-signs a payload with the WRONG secret — signature
    // comparison must fail even though the format is valid.
    const token = await signUnsubscribeToken("test@example.com");
    const [payload] = token.split(".");
    const wrongKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode("attacker-secret"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const wrongSig = Buffer.from(
      await crypto.subtle.sign(
        "HMAC",
        wrongKey,
        new TextEncoder().encode(payload)
      )
    ).toString("base64url");
    await expect(
      verifyUnsubscribeToken(`${payload}.${wrongSig}`)
    ).rejects.toThrow("Invalid unsubscribe link");
  });

  it("rejects expired tokens", async () => {
    const payload = Buffer.from(
      JSON.stringify({ email: "test@example.com", exp: Date.now() - 1000 })
    ).toString("base64url");
    const sig = await hmacPayload(payload);
    await expect(verifyUnsubscribeToken(`${payload}.${sig}`)).rejects.toThrow(
      "expired"
    );
  });

  it("rejects malformed tokens", async () => {
    await expect(verifyUnsubscribeToken("no-dots")).rejects.toThrow(
      "Invalid unsubscribe link"
    );
    await expect(
      verifyUnsubscribeToken("payload.")
    ).rejects.toThrow("Invalid unsubscribe link");
    await expect(
      verifyUnsubscribeToken(".sig")
    ).rejects.toThrow("Invalid unsubscribe link");
  });

  it("rejects the legacy base64(email) format", async () => {
    const legacy = Buffer.from("test@example.com").toString("base64");
    await expect(verifyUnsubscribeToken(legacy)).rejects.toThrow(
      "Invalid unsubscribe link"
    );
  });

  it("rejects a payload with invalid JSON", async () => {
    const payload = Buffer.from("not-json").toString("base64url");
    const sig = await hmacPayload(payload);
    await expect(verifyUnsubscribeToken(`${payload}.${sig}`)).rejects.toThrow(
      "Invalid unsubscribe link"
    );
  });
});
