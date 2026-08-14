import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Build-time content source globs.
//
// Turbopack's import.meta.glob does not match patterns that escape the
// file's own directory with `..`, so these globs must live at the project
// root (patterns are relative to this file). lib/content.ts consumes them.
//
// .mdx files are compiled to React components at build time via @next/mdx
// (see next.config.mjs); remark-mdx-frontmatter exposes each file's
// frontmatter as a named `frontmatter` export.
// ---------------------------------------------------------------------------

export interface MDXModule {
  default: ComponentType;
  frontmatter?: Record<string, any>;
}

function normalize(map: Record<string, unknown>): Record<string, MDXModule> {
  const out: Record<string, MDXModule> = {};
  for (const [key, mod] of Object.entries(map)) {
    // Strip any leading './' so keys are stable and predictable
    // (e.g. 'blogs/en/1.demo.mdx', 'content/about/en.mdx').
    out[key.replace(/^\.\//, "")] = mod as MDXModule;
  }
  return out;
}

export const blogModules = normalize(
  import.meta.glob("blogs/**/*.mdx", { eager: true })
);

export const pageModules = normalize(
  import.meta.glob("content/**/*.mdx", { eager: true })
);
