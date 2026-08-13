import type { D1Database } from "@cloudflare/workers-types";

// NOTE: do NOT import @opennextjs/cloudflare here. Importing the adapter in
// route-rendered code crashes Next 16.3 dev with "Expected a suspended
// thenable". Instead we read the adapter's global context symbol directly —
// it is set on globalThis by the OpenNext worker entrypoint (production)
// and by initOpenNextCloudflareForDev / wrangler dev (local). The symbol is
// part of the adapter's stable contract (kept in sync by the adapter).
const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

interface CloudflareContextGlobal {
  env?: CloudflareEnv;
}

/**
 * Returns the D1 database binding ("DB" in wrangler.toml), or undefined
 * when there is no Cloudflare context — e.g. plain `next dev`/`next start`
 * on Node, or SSG at build time. Callers must degrade gracefully on
 * undefined.
 *
 * NOTE: must only be called at request time in dynamic routes/actions.
 */
export function getDB(): D1Database | undefined {
  try {
    const context = (globalThis as Record<symbol | string, unknown>)[
      CLOUDFLARE_CONTEXT_SYMBOL
    ] as CloudflareContextGlobal | undefined;
    return context?.env?.DB;
  } catch (err) {
    console.warn("[D1] No Cloudflare context available:", err);
    return undefined;
  }
}
