import type { R2Bucket } from "@cloudflare/workers-types";
import { getCloudflareEnv } from "@/lib/cloudflareEnv";

/**
 * Returns the R2 bucket binding ("BUCKET" in wrangler.toml), or undefined
 * when there is no Cloudflare context. Callers must degrade gracefully on
 * undefined.
 *
 * NOTE: must only be called at request time in dynamic routes/actions.
 */
export function getBucket(): R2Bucket | undefined {
  return getCloudflareEnv()?.BUCKET;
}
