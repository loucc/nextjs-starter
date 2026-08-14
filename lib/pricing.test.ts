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

  it("falls back to discord for pro when no checkout url is set", async () => {
    // siteConfig reads the env at module load — reload with the env set.
    process.env.NEXT_PUBLIC_DISCORD_INVITE_URL = "https://discord.gg/test";
    vi.resetModules();
    const mod = await import("./pricing");
    expect(mod.getPlanActionUrl("pro", undefined)).toContain("discord");
    delete process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;
    vi.resetModules();
  });

  it("falls back to / for pro when neither url is configured", () => {
    expect(getPlanActionUrl("pro", undefined)).toBe("/");
  });

  it("routes the business plan to a mailto contact", () => {
    expect(getPlanActionUrl("business")).toMatch(/^mailto:/);
  });
});
