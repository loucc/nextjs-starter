"use client";

import { useEffect } from "react";

/**
 * Updates <html lang> to the active locale. The root layout renders a
 * static lang="en" (it cannot read the locale param); hreflang alternates
 * and og:locale provide the SSR-time language signal.
 */
export default function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
