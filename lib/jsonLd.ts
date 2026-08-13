import { siteConfig } from "@/config/site";
import { BlogPost } from "@/types/blog";

/**
 * JSON-LD structured data builders (schema.org). Consumed by
 * components/JsonLd.tsx.
 */

export function organizationJsonLd(): Record<string, unknown> {
  const sameAs = [
    siteConfig.socialLinks?.twitter,
    siteConfig.socialLinks?.github,
    siteConfig.socialLinks?.discord,
    siteConfig.socialLinks?.bluesky,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    ...(siteConfig.description ? { description: siteConfig.description } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function webSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function softwareApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function blogPostingJsonLd(
  post: BlogPost,
  locale: string
): Record<string, unknown> {
  const published = post.metadata.updatedAt || post.date;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.description ? { description: post.description } : {}),
    url: `${siteConfig.url}${locale === "en" ? "" : `/${locale}`}/blog${post.slug}`,
    ...(post.image ? { image: post.image } : {}),
    datePublished: post.date,
    dateModified: published,
    inLanguage: locale,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
