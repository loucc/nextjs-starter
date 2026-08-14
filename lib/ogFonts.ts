import { getBucket } from "@/lib/bucket";

// ---------------------------------------------------------------------------
// OG image fonts: fetched once from Google Fonts, cached in R2.
//
// CJK fonts are multi-megabyte files, so they are deliberately NOT bundled
// in the repo — the first OG render per locale fetches the woff2 and stores
// it under fonts/<key> in the R2 bucket; subsequent renders read it from
// there. If everything fails, the OG route falls back to the static og.png.
// ---------------------------------------------------------------------------

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  // satori's FontOptions expects a numeric-literal weight
  weight: 700;
  style: "normal";
}

// Family names as used in the Google Fonts css2 API URL.
const FONT_FAMILIES: Record<string, string> = {
  en: "Inter",
  zh: "Noto+Sans+SC",
  ja: "Noto+Sans+JP",
};

const FONT_WEIGHT = 700;

function r2FontKey(family: string): string {
  return `fonts/${family.replace(/\+/g, "-").toLowerCase()}-${FONT_WEIGHT}.ttf`;
}

/**
 * Extracts the first font file URL from a Google Fonts css2 response body.
 * Returns null when no font source is present.
 *
 * NOTE: satori (ImageResponse) does NOT support woff2 — we request the
 * truetype sources by sending an older browser UA (see below), so this
 * extracts *.ttf URLs.
 */
export function extractFontUrl(css: string): string | null {
  const match = css.match(/url\((https:\/\/[^)]+\.(?:ttf|otf|woff))\)/);
  return match ? match[1] : null;
}

async function fetchFontFromGoogle(family: string): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${FONT_WEIGHT}&display=swap`;
  const cssResponse = await fetch(cssUrl, {
    headers: {
      // Older browser UA so Google serves truetype (ttf) sources instead of
      // woff2 — satori cannot parse woff2 fonts.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.101 Safari/537.36",
    },
  });
  if (!cssResponse.ok) {
    throw new Error(`Font CSS fetch failed: ${cssResponse.status}`);
  }
  const css = await cssResponse.text();

  const fontUrl = extractFontUrl(css);
  if (!fontUrl) {
    throw new Error("No ttf source found in Google Fonts CSS");
  }

  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) {
    throw new Error(`Font fetch failed: ${fontResponse.status}`);
  }
  return fontResponse.arrayBuffer();
}

/**
 * Returns the OG font for a locale, reading from R2 first and falling back
 * to Google Fonts (then caching the result in R2).
 */
export async function getOgFont(locale: string): Promise<OgFont> {
  const family = FONT_FAMILIES[locale] || FONT_FAMILIES.en;
  const key = r2FontKey(family);
  const bucket = getBucket();

  // 1. R2 cache hit
  if (bucket) {
    const cached = await bucket.get(key);
    if (cached) {
      return {
        name: family,
        data: await cached.arrayBuffer(),
        weight: FONT_WEIGHT,
        style: "normal",
      };
    }
  }

  // 2. Fetch from Google Fonts and cache
  const data = await fetchFontFromGoogle(family);
  if (bucket) {
    await bucket.put(key, data, {
      httpMetadata: { contentType: "font/ttf" },
    });
  }
  return { name: family, data, weight: FONT_WEIGHT, style: "normal" };
}
