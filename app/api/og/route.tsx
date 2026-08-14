import { siteConfig } from "@/config/site";
import { LOCALES } from "@/i18n/routing";
import { getBucket } from "@/lib/bucket";
import { getPosts } from "@/lib/content";
import { getOgFont } from "@/lib/ogFonts";
import { ImageResponse } from "next/og";

// Dynamic OG image generation (1200x630 PNG).
//
// GET /api/og?type=home&locale=en
// GET /api/og?type=blog&locale=en&slug=/my-post
//
// PNGs and fonts are cached in R2. Any failure falls back (302) to the
// static /og.png so share previews always have an image.

const SIZE = { width: 1200, height: 630 };

// Character budgets per locale (CJK glyphs are roughly twice as wide).
const TITLE_MAX: Record<string, number> = { en: 100, zh: 45, ja: 45 };
const DESC_MAX: Record<string, number> = { en: 160, zh: 70, ja: 70 };

function truncate(text: string, locale: string, max: Record<string, number>): string {
  const limit = max[locale] || max.en;
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function fallbackResponse() {
  return Response.redirect(`${siteConfig.url}/og.png`, 302);
}

function ogCacheKey(
  type: "home" | "blog",
  locale: string,
  slug: string,
  dateKey: string
): string {
  return `og/${locale}/${type === "home" ? "home" : slug.replace(/^\//, "").replace(/\//g, "-")}-${dateKey}.png`;
}

function pngResponse(png: ArrayBuffer) {
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "home" ? "home" : "blog";
    const locale = searchParams.get("locale") || "en";
    if (!LOCALES.includes(locale)) return fallbackResponse();

    const fallbackDescription =
      siteConfig.tagLine || siteConfig.description || "";

    let title = siteConfig.name;
    let description = fallbackDescription;
    let slug = "";
    let dateKey = "static";

    if (type === "blog") {
      slug = searchParams.get("slug") || "";
      if (!slug) return fallbackResponse();

      const { posts } = await getPosts(locale);
      const post = posts.find((p) => p.slug === slug || p.slug === `/${slug}`);
      if (!post) return fallbackResponse();

      title = post.title;
      description = post.description || fallbackDescription;
      dateKey = new Date(post.date).toISOString().slice(0, 10);
    }

    const cacheKey = ogCacheKey(type, locale, slug, dateKey);

    // 1. PNG cache hit (R2)
    const bucket = getBucket();
    if (bucket) {
      const cached = await bucket.get(cacheKey);
      if (cached) {
        return pngResponse(await cached.arrayBuffer());
      }
    }

    // 2. Render
    const font = await getOgFont(locale);
    const image = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            background:
              "linear-gradient(135deg, #eff6ff 0%, #ffffff 45%, #e0e7ff 100%)",
            color: "#111827",
            fontFamily: "og",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
              }}
            />
            <div style={{ fontSize: 32, fontWeight: 700, color: "#1e3a8a" }}>
              {siteConfig.name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ fontSize: type === "home" ? 72 : 56, fontWeight: 700, lineHeight: 1.2 }}>
              {truncate(title, locale, TITLE_MAX)}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#4b5563", lineHeight: 1.4 }}>
              {truncate(description, locale, DESC_MAX)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              fontWeight: 700,
              color: "#6b7280",
            }}
          >
            <div>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
            <div>{type === "blog" ? dateKey : ""}</div>
          </div>
        </div>
      ),
      { ...SIZE, fonts: [font] }
    );

    // 3. Cache the rendered PNG (R2)
    if (bucket) {
      const png = await image.arrayBuffer();
      await bucket.put(cacheKey, png, {
        httpMetadata: { contentType: "image/png" },
      });
      return pngResponse(png);
    }

    return image;
  } catch (err) {
    console.error("[OG] generation failed:", err);
    return fallbackResponse();
  }
}
