import HomeComponent from "@/components/home";

// The homepage reads the showcase from D1 at request time
// (components/home/Showcase.tsx → lib/showcase.ts). getCloudflareContext
// is unavailable during static generation, so this route must be dynamic.
// Cloudflare CDN caching can be layered on later if needed.
export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeComponent />;
}
