import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

// Merge our bindings into the adapter's global CloudflareEnv interface
// (declared in @opennextjs/cloudflare). Bindings are configured in
// wrangler.toml and accessed via lib/cloudflareEnv.ts.
declare global {
  interface CloudflareEnv {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    // Worker env vars / secrets configured via wrangler (secrets are NOT
    // exposed through process.env on Workers — only via the env binding).
    ASSET_UPLOAD_SECRET?: string;
    TURNSTILE_SECRET_KEY?: string;
    UNSUBSCRIBE_SECRET?: string;
    RESEND_API_KEY?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
  }
}

export {};
