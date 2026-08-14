import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareEnv } from "@/lib/cloudflareEnv";

/**
 * Returns the D1 database binding ("DB" in wrangler.toml), or undefined
 * when there is no Cloudflare context — e.g. plain `next dev`/`next start`
 * on Node, or SSG at build time. Callers must degrade gracefully on
 * undefined.
 *
 * NOTE: must only be called at request time in dynamic routes/actions.
 */
export function getDB(): D1Database | undefined {
  return getCloudflareEnv()?.DB;
}
