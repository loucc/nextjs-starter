import HomeComponent from "@/components/home";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { Locale } from "@/i18n/routing";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "@/lib/jsonLd";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// The homepage reads the showcase from D1 at request time
// (components/home/Showcase.tsx → lib/showcase.ts). getCloudflareContext
// is unavailable during static generation, so this route must be dynamic.
// Cloudflare CDN caching can be layered on later if needed.
export const dynamic = "force-dynamic";

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return constructMetadata({
    page: "Home",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/`,
    canonicalUrl: `/`,
    ogImage: `${siteConfig.url}/api/og?type=home&locale=${locale}`,
  });
}

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
