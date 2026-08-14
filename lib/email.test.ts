import { describe, expect, it } from "vitest";
import { normalizeEmail, validateEmail } from "./email";

describe("normalizeEmail", () => {
  it("lowercases the address", () => {
    expect(normalizeEmail("USER@Example.COM")).toBe("user@example.com");
  });

  it("strips dots and plus-suffixes for gmail.com", () => {
    expect(normalizeEmail("a.b.c+newsletter@gmail.com")).toBe(
      "abc@gmail.com"
    );
  });

  it("strips plus-suffixes for outlook/hotmail/live", () => {
    expect(normalizeEmail("user+tag@outlook.com")).toBe("user@outlook.com");
    expect(normalizeEmail("user+tag@hotmail.com")).toBe("user@hotmail.com");
    expect(normalizeEmail("user+tag@live.com")).toBe("user@live.com");
  });

  it("strips dash-suffixes for yahoo.com", () => {
    expect(normalizeEmail("user-spam@yahoo.com")).toBe("user@yahoo.com");
  });

  it("strips plus-suffixes for other providers", () => {
    expect(normalizeEmail("user+tag@example.com")).toBe("user@example.com");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeEmail("")).toBe("");
  });
});

describe("validateEmail", () => {
  it("accepts valid addresses", () => {
    expect(validateEmail("user@example.com").isValid).toBe(true);
    expect(validateEmail("firstlast+tag@sub.example.co.uk").isValid).toBe(
      true
    );
  });

  it("rejects dotted local parts (existing special-char policy)", () => {
    // Note: the local-part special-character blacklist includes ".", so
    // dotted addresses are intentionally rejected — documented behavior.
    expect(validateEmail("first.last@example.com").isValid).toBe(false);
  });

  it("rejects malformed addresses", () => {
    expect(validateEmail("not-an-email").isValid).toBe(false);
    expect(validateEmail("user@").isValid).toBe(false);
    expect(validateEmail("@example.com").isValid).toBe(false);
    expect(validateEmail("user@example").isValid).toBe(false);
    expect(validateEmail("user@@example.com").isValid).toBe(false);
  });

  it("rejects disposable email domains", () => {
    expect(validateEmail("user@tempmail.com").isValid).toBe(false);
    expect(validateEmail("user@throwawaymail.com").isValid).toBe(false);
    expect(validateEmail("user@tempmail100.com").isValid).toBe(false);
  });

  it("rejects special characters in the local part", () => {
    expect(validateEmail("us er@example.com").isValid).toBe(false);
    expect(validateEmail("us\"er@example.com").isValid).toBe(false);
  });

  it("accepts normalized gmail addresses", () => {
    const normalized = normalizeEmail("a.b+tag@gmail.com");
    expect(validateEmail(normalized).isValid).toBe(true);
  });
});
