// ---------------------------------------------------------------------------
// Cloudflare binding access without importing @opennextjs/cloudflare.
//
// NOTE: do NOT import @opennextjs/cloudflare in route-rendered code — it
// crashes Next 16.3 dev ("Expected a suspended thenable"). Instead read the
// adapter's global context symbol directly: it is set on globalThis by the
// OpenNext worker entrypoint (production) and by initOpenNextCloudflareForDev
// / wrangler dev (local). The symbol is part of the adapter's stable
// contract (kept in sync by the adapter).
// ---------------------------------------------------------------------------

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

interface CloudflareContextGlobal {
  env?: CloudflareEnv;
}

/**
 * Returns the worker's bindings env, or undefined when there is no
 * Cloudflare context (plain `next dev`/`next start` on Node without the
 * platform proxy, or SSG at build time). Only call at request time in
 * dynamic routes/actions.
 */
export function getCloudflareEnv(): CloudflareEnv | undefined {
  try {
    const context = (globalThis as Record<symbol | string, unknown>)[
      CLOUDFLARE_CONTEXT_SYMBOL
    ] as CloudflareContextGlobal | undefined;
    return context?.env;
  } catch (err) {
    console.warn("[Cloudflare] No bindings context available:", err);
    return undefined;
  }
}
