import HomeComponent from "@/components/home";
import { JsonLd } from "@/components/JsonLd";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "@/lib/jsonLd";

// The homepage reads the showcase from D1 at request time
// (components/home/Showcase.tsx → lib/showcase.ts). getCloudflareContext
// is unavailable during static generation, so this route must be dynamic.
// Cloudflare CDN caching can be layered on later if needed.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd()} />
      <HomeComponent />
    </>
  );
}
