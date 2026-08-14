import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin();

// Makes `next dev` aware of Cloudflare bindings (D1/R2/KV in wrangler.toml)
// via the wrangler platform proxy — getCloudflareContext() and lib/db.ts
// then work in local dev. Self-gates: no-op outside of development.
initOpenNextCloudflareForDev();

// Compile .mdx files to React components at BUILD time. Required because
// Cloudflare Workers forbids eval/new Function, so runtime MDX compilation
// (next-mdx-remote-client) cannot work there. remark-mdx-frontmatter strips
// the frontmatter and exposes it as a named `frontmatter` export on each
// compiled module (consumed by content-loader.ts).
//
// NOTE: plugins are passed as package-name strings (resolved by the
// @next/mdx loader) because Turbopack requires loader options to be
// serializable — function references are not.
const withMDX = createMDX({
  options: {
    // remark-frontmatter parses the YAML block into an AST node;
    // remark-mdx-frontmatter then exposes it as a `frontmatter` export.
    remarkPlugins: ["remark-frontmatter", "remark-mdx-frontmatter", "remark-gfm"],
  },
});

/**
 * Security response headers. CSP is applied in production only — a strict
 * CSP would break `next dev` HMR (eval/websockets) during development.
 */
function securityHeaders() {
  const plausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC;
  const plausibleOrigin = plausibleSrc
    ? new URL(plausibleSrc).origin
    : null;

  const scriptSrc = [
    "'self'",
    // Analytics/ads inject inline snippets via next/script
    // dangerouslySetInnerHTML, so nonces are not feasible without a larger
    // rework — 'unsafe-inline' in script-src is the pragmatic tradeoff.
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://hm.baidu.com",
    "https://pagead2.googlesyndication.com",
    "https://challenges.cloudflare.com",
    ...(plausibleOrigin ? [plausibleOrigin] : []),
  ].join(" ");

  const connectSrc = [
    "'self'",
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://*.baidu.com",
    "https://*.googlesyndication.com",
    ...(plausibleOrigin ? [plausibleOrigin] : []),
  ].join(" ");

  return [
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "X-Frame-Options",
      value: "SAMEORIGIN",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        "frame-src https://challenges.cloudflare.com https://googleads.g.doubleclick.net",
        `connect-src ${connectSrc}`,
        "img-src 'self' data: blob: https:",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; "),
    },
  ];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized:
      process.env.NEXT_PUBLIC_OPTIMIZED_IMAGES &&
      process.env.NEXT_PUBLIC_OPTIMIZED_IMAGES === "false",
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              hostname: process.env.R2_PUBLIC_URL.replace("https://", ""),
            },
          ]
        : []),
    ],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers:
          process.env.NODE_ENV === "production"
            ? securityHeaders()
            : // CSP only in production; keep the rest available in dev too
              securityHeaders().filter((h) => h.key !== "Content-Security-Policy"),
      },
    ];
  },
};

export default withNextIntl(withMDX(nextConfig));
