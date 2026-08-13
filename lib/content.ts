import { blogModules, MDXModule, pageModules } from '@/content-loader';
import { DEFAULT_LOCALE } from '@/i18n/routing';
import { BlogPost } from '@/types/blog';
import type { ComponentType } from 'react';

// ---------------------------------------------------------------------------
// Content repository
//
// All MDX content (blogs + static pages) is compiled to React components at
// build time (see content-loader.ts + next.config.mjs) so the app runs on
// runtimes without eval or a filesystem (e.g. Cloudflare Workers). This
// replaces the previous fs + runtime-MDX-compilation approach.
// ---------------------------------------------------------------------------

export type ContentPage = 'about' | 'privacy-policy' | 'terms-of-service';

// ---------------------------------------------------------------------------
// ContentRepository — the swappable seam
//
// Pages only depend on this interface, so a future phase can swap the
// source (e.g. R2-backed or CMS-backed) without touching any page.
// ---------------------------------------------------------------------------
export interface ContentRepository {
  getPosts(locale?: string): Promise<{ posts: BlogPost[] }>;
  getPageComponent(
    page: ContentPage,
    locale: string
  ): Promise<ComponentType | undefined>;
}

const globRepository: ContentRepository = {
  async getPosts(locale: string = DEFAULT_LOCALE) {
    // Deterministic key order (ascending, then reversed to mirror the old
    // readdir().reverse() order). Only relevant for sort ties — posts are
    // re-sorted by pin/date below.
    const keys = Object.keys(blogModules)
      .filter((key) => key.startsWith(`blogs/${locale}/`) && key.endsWith('.mdx'))
      .sort()
      .reverse();

    const posts: BlogPost[] = keys
      .map((key) => {
        const mod: MDXModule = blogModules[key];
        const data = mod.frontmatter || {};

        return {
          locale, // use locale parameter
          title: data.title,
          description: data.description,
          image: data.image || '',
          slug: data.slug,
          tags: data.tags,
          // remark-frontmatter leaves YAML dates as strings; normalize to
          // Date to match the previous gray-matter behavior.
          date: data.date ? new Date(data.date) : data.date,
          visible: data.visible || 'published',
          pin: data.pin || false,
          Component: mod.default,
          metadata: data,
        };
      })
      // filter out non-published articles
      .filter((post) => post.visible === 'published')
      // sort posts by pin and date
      .sort((a, b) => {
        if (a.pin !== b.pin) {
          return (b.pin ? 1 : 0) - (a.pin ? 1 : 0);
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    // Missing locale dir -> no matching keys -> { posts: [] }, same as the
    // old existsSync branch.
    return { posts };
  },

  async getPageComponent(page: ContentPage, locale: string) {
    const mod = pageModules[`content/${page}/${locale}.mdx`];
    // Missing file -> undefined, replicating the old fs try/catch semantics
    // (no default-locale fallback).
    return mod?.default;
  },
};

export const repository: ContentRepository = globRepository;

// ---------------------------------------------------------------------------
// Public API (same call shapes as the previous lib/getBlogs.ts / getMDXContent)
// ---------------------------------------------------------------------------
export async function getPosts(locale?: string): Promise<{ posts: BlogPost[] }> {
  return repository.getPosts(locale);
}

export async function getPageComponent(
  page: ContentPage,
  locale: string
): Promise<ComponentType | undefined> {
  return repository.getPageComponent(page, locale);
}
