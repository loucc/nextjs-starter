import { siteConfig } from "@/config/site";
import { Inter, Noto_Sans_JP, Noto_Sans_SC } from "next/font/google";
import { Viewport } from "next";
import Script from "next/script";

// Healing-tech font system: Inter for latin, Noto Sans SC/JP for CJK —
// self-hosted at build time via next/font (no runtime external requests).
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-sc",
  display: "swap",
  preload: false,
});
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-jp",
  display: "swap",
  preload: false,
});

// Root layout: owns <html>/<body> and the beforeInteractive theme
// bootstrap. Root layouts never re-mount on client navigation — the
// [locale] layout does (locale switches), and rendering a Script there
// triggers React 19's "Encountered a script tag" error.
//
// html lang is updated per-locale after mount (components/HtmlLang.tsx);
// hreflang alternates and og:locale carry the language signal for SEO.
export const viewport: Viewport = {
  themeColor: siteConfig.themeColors,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansSC.variable} ${notoSansJP.variable}`}
    >
      <head>
        <Script
          id="theme-init"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-background flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
