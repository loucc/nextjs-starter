import { describe, expect, it } from "vitest";
import { filterPosts, SearchablePost } from "./search";

const POSTS: SearchablePost[] = [
  {
    slug: "/guide",
    title: "Next.js Starter Guide",
    description: "A complete guide to the starter template",
    tags: "nextjs,template,guide",
    date: "2026-01-10",
  },
  {
    slug: "/i18n",
    title: "Internationalization with next-intl",
    description: "Multilingual sites made easy",
    tags: "i18n,next-intl",
    date: "2026-02-01",
  },
];

describe("filterPosts", () => {
  it("returns all posts for an empty query", () => {
    expect(filterPosts(POSTS, "")).toHaveLength(2);
    expect(filterPosts(POSTS, "   ")).toHaveLength(2);
  });

  it("matches on title (case-insensitive)", () => {
    expect(filterPosts(POSTS, "STARTER")).toHaveLength(1);
    expect(filterPosts(POSTS, "starter")[0].slug).toBe("/guide");
  });

  it("matches on description", () => {
    expect(filterPosts(POSTS, "multilingual")[0].slug).toBe("/i18n");
  });

  it("matches on tags", () => {
    expect(filterPosts(POSTS, "next-intl")[0].slug).toBe("/i18n");
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterPosts(POSTS, "zzz-nope")).toHaveLength(0);
  });
});
