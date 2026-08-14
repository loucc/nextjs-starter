import { describe, expect, it } from "vitest";
import { isSafeObjectKey, sanitizeAssetKey } from "./assetKey";

describe("sanitizeAssetKey", () => {
  it("prefixes keys with assets/ and lowercases", () => {
    expect(sanitizeAssetKey("Press-Kit.PDF")).toBe("assets/press-kit.pdf");
  });

  it("replaces unsafe characters with dashes", () => {
    // Each unsafe character maps to its own dash.
    expect(sanitizeAssetKey("my file (final)!.pdf")).toBe(
      "assets/my-file--final--.pdf"
    );
  });

  it("handles unicode file names (keeps the extension)", () => {
    // CJK characters are replaced and leading dashes trimmed, so only the
    // extension survives — still a usable, collision-safe key.
    expect(sanitizeAssetKey("产品手册.pdf")).toBe("assets/pdf");
  });

  it("strips leading dots and traversal characters", () => {
    expect(sanitizeAssetKey("../../secret.txt")).toBe("assets/secret.txt");
    expect(sanitizeAssetKey(".hidden")).toBe("assets/hidden");
  });

  it("throws for names that sanitize to nothing", () => {
    expect(() => sanitizeAssetKey("...")).toThrow("Invalid file name");
    expect(() => sanitizeAssetKey("")).toThrow("Invalid file name");
  });
});

describe("isSafeObjectKey", () => {
  it("accepts normal keys", () => {
    expect(isSafeObjectKey("assets/press-kit.pdf")).toBe(true);
    expect(isSafeObjectKey("assets/sub/file.pdf")).toBe(true);
  });

  it("rejects traversal and empty segments", () => {
    expect(isSafeObjectKey("assets/../secret")).toBe(false);
    expect(isSafeObjectKey("assets//file")).toBe(false);
    expect(isSafeObjectKey("..")).toBe(false);
  });
});
