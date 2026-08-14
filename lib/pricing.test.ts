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

  it("routes the business plan to a mailto contact", () => {
    expect(getPlanActionUrl("business")).toMatch(/^mailto:/);
  });
});
