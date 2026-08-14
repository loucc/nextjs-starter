import { siteConfig } from "@/config/site";
import { Viewport } from "next";
import Script from "next/script";

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
    <html lang="en" suppressHydrationWarning>
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
