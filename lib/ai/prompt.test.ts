import { describe, expect, it } from "vitest";
import {
  getFallbackAssistantMessage,
  getSystemPrompt,
  sanitizeLocale,
} from "./prompt";

describe("chat prompts", () => {
  it("maps locale strings onto the supported prompt locales", () => {
    expect(sanitizeLocale("en")).toBe("en");
    expect(sanitizeLocale("zh-CN")).toBe("zh");
    expect(sanitizeLocale("ja-JP")).toBe("ja");
    expect(sanitizeLocale("de")).toBe("en");
    expect(sanitizeLocale(null)).toBe("en");
    expect(sanitizeLocale(undefined)).toBe("en");
  });

  it("provides a non-empty persona prompt per locale", () => {
    for (const locale of ["en", "zh", "ja"]) {
      const prompt = getSystemPrompt(locale);
      expect(prompt.length).toBeGreaterThan(50);
      expect(prompt).toContain("SerenAI");
    }
  });

  it("instructs the model to reply in the user's language", () => {
    expect(getSystemPrompt("en")).toContain("language");
    expect(getSystemPrompt("zh")).toContain("语言");
    expect(getSystemPrompt("ja")).toContain("言語");
  });

  it("provides a fallback assistant message per locale", () => {
    for (const locale of ["en", "zh", "ja"]) {
      expect(getFallbackAssistantMessage(locale).length).toBeGreaterThan(10);
    }
  });
});
