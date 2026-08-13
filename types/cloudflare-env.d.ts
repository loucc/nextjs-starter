import type { D1Database } from "@cloudflare/workers-types";

// Merge our D1 binding into the adapter's global CloudflareEnv interface
// (declared in @opennextjs/cloudflare). Bindings are configured in
// wrangler.toml and accessed via getCloudflareContext() (see lib/db.ts).
declare global {
  interface CloudflareEnv {
    DB?: D1Database;
  }
}

export {};
