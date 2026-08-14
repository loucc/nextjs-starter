import { describe, expect, it } from "vitest";
import { BlogPost } from "@/types/blog";
import {
  blogPostingJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "./jsonLd";

describe("organizationJsonLd", () => {
  it("builds an Organization with url, logo and sameAs", () => {
    const data = organizationJsonLd();
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBeTruthy();
    expect(String(data.url)).toContain("http");
    expect(String(data.logo)).toContain("/logo.png");
    expect(Array.isArray(data.sameAs)).toBe(true);
  });
});

describe("webSiteJsonLd", () => {
  it("builds a WebSite entry", () => {
    const data = webSiteJsonLd();
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBeTruthy();
    expect(data.description).toBeTruthy();
  });
});

describe("softwareApplicationJsonLd", () => {
  it("builds a SoftwareApplication entry with an author", () => {
    const data = softwareApplicationJsonLd();
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.applicationCategory).toBe("DeveloperApplication");
    expect((data.author as Record<string, unknown>)["@type"]).toBe(
      "Organization"
    );
  });
});

describe("blogPostingJsonLd", () => {
  const basePost: BlogPost = {
    title: "Test Post",
    description: "A test post",
    slug: "/test-post",
    date: new Date("2026-01-10"),
    metadata: {},
  };

  it("builds a BlogPosting with url, dates and language", () => {
    const data = blogPostingJsonLd(basePost, "en");
    expect(data["@type"]).toBe("BlogPosting");
    expect(data.headline).toBe("Test Post");
    expect(String(data.url)).toContain("/blog/test-post");
    expect(data.datePublished).toEqual(new Date("2026-01-10"));
    expect(data.inLanguage).toBe("en");
  });

  it("prefers updatedAt from metadata for dateModified", () => {
    const post: BlogPost = {
      ...basePost,
      metadata: { updatedAt: new Date("2026-02-01") },
    };
    const data = blogPostingJsonLd(post, "en");
    expect(data.dateModified).toEqual(new Date("2026-02-01"));
  });

  it("does not prefix the default locale in the url", () => {
    const data = blogPostingJsonLd(basePost, "en");
    expect(String(data.url)).not.toContain("/en/");
  });

  it("prefixes non-default locales in the url", () => {
    const data = blogPostingJsonLd(basePost, "zh");
    expect(String(data.url)).toContain("/zh/blog/test-post");
  });
});
