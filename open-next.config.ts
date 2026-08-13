import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({
  // All cache backends default to "dummy" — fine for this fully static
  // marketing site. When ISR / revalidateTag is needed later, switch to:
  //   import kvIncrementalCache from "@opennextjs/cloudflare/kvCache";
  //   incrementalCache: kvIncrementalCache, // requires a KV namespace bound
  //                                          // as NEXT_CACHE_WORKERS_KV
  tagCache: "dummy",
  queue: "dummy",
});
