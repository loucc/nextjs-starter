import { describe, expect, it, vi } from "vitest";
import { getPlanActionUrl } from "./pricing";

describe("getPlanActionUrl", () => {
  it("routes the free plan to the site root", () => {
    expect(getPlanActionUrl("free")).toBe("/");
  });

  it("uses the checkout url for the pro plan", () => {
    expect(
      getPlanActionUrl("pro", "https://store.example.com/checkout")
    ).toBe("https://store.example.com/checkout");
  });

  it("falls back to / for pro when no checkout url is configured", () => {
    expect(getPlanActionUrl("pro", undefined)).toBe("/");
  });

  it("falls back to / for the business plan (no contact email configured)", () => {
    // socialLinks were cleared with the rebrand — until a contact email is
    // added back to siteConfig, the business CTA falls back to the root.
    expect(getPlanActionUrl("business")).toBe("/");
  });
});
