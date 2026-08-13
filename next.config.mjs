import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";

const withNextIntl = createNextIntlPlugin();

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
};

export default withNextIntl(withMDX(nextConfig));
