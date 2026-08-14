import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createD1Stub } from "@/lib/testing/d1Stub";
import { upsertUser, verifyGoogleIdToken } from "./google";

const CLIENT_ID = "test-client-id.apps.googleusercontent.com";

beforeEach(() => {
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = CLIENT_ID;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
});

function tokenInfo(overrides: Record<string, unknown> = {}) {
  return {
    sub: "google-sub-123",
    iss: "accounts.google.com",
    aud: CLIENT_ID,
    exp: String(Math.floor(Date.now() / 1000) + 3600),
    email: "user@example.com",
    name: "Test User",
    picture: "https://lh3.googleusercontent.com/a/photo",
    locale: "en",
    ...overrides,
  };
}

function okFetch(info: Record<string, unknown>) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => info,
  }) as unknown as typeof fetch;
}

describe("verifyGoogleIdToken", () => {
  it("verifies a valid token and maps the profile", async () => {
    const profile = await verifyGoogleIdToken("credential", okFetch(tokenInfo()));
    expect(profile.googleSub).toBe("google-sub-123");
    expect(profile.email).toBe("user@example.com");
    expect(profile.name).toBe("Test User");
    expect(profile.locale).toBe("en");
  });

  it("rejects a token from the wrong issuer", async () => {
    await expect(
      verifyGoogleIdToken(
        "credential",
        okFetch(tokenInfo({ iss: "accounts.evil.com" }))
      )
    ).rejects.toThrow("Invalid Google ID token");
  });

  it("rejects a token for a different audience", async () => {
    await expect(
      verifyGoogleIdToken(
        "credential",
        okFetch(tokenInfo({ aud: "other-client" }))
      )
    ).rejects.toThrow("Invalid Google ID token");
  });

  it("rejects an expired token", async () => {
    await expect(
      verifyGoogleIdToken(
        "credential",
        okFetch(tokenInfo({ exp: String(Math.floor(Date.now() / 1000) - 60) }))
      )
    ).rejects.toThrow("Invalid Google ID token");
  });

  it("rejects a non-200 tokeninfo response", async () => {
    const failing = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as unknown as typeof fetch;
    await expect(
      verifyGoogleIdToken("credential", failing)
    ).rejects.toThrow("Invalid Google ID token");
  });

  it("throws when the client id is not configured", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    await expect(
      verifyGoogleIdToken("credential", okFetch(tokenInfo()))
    ).rejects.toThrow("Google sign-in is not configured");
  });
});

describe("upsertUser", () => {
  it("upserts and returns the user row", async () => {
    const { db, statements } = createD1Stub({
      rows: {
        "RETURNING id": [
          {
            id: "user-1",
            google_sub: "google-sub-123",
            email: "user@example.com",
            name: "Test User",
            picture: "https://lh3.googleusercontent.com/a/photo",
            locale: "en",
          },
        ],
      },
    });

    const row = await upsertUser(db, {
      googleSub: "google-sub-123",
      email: "user@example.com",
      name: "Test User",
      picture: "https://lh3.googleusercontent.com/a/photo",
      locale: "en",
    });

    expect(row.id).toBe("user-1");
    expect(row.google_sub).toBe("google-sub-123");
    expect(row.email).toBe("user@example.com");

    const insert = statements[0];
    expect(insert.sql).toContain("ON CONFLICT(google_sub) DO UPDATE");
    expect(insert.args).toHaveLength(8);
    expect(insert.args[1]).toBe("google-sub-123");
  });
});
