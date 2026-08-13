"use client";

import Script from "next/script";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export interface TurnstileWidgetHandle {
  /** Resets the widget (call after a successful form submission). */
  reset: () => void;
}

interface TurnstileWidgetProps {
  onToken: (token: string | null) => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

export default function TurnstileWidget({
  onToken,
  className,
  theme = "auto",
  ref,
}: TurnstileWidgetProps & { ref?: React.Ref<TurnstileWidgetHandle> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Keep the latest callback without re-rendering the widget (inline
  // arrow props would otherwise trigger a render loop).
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        onTokenRef.current(null);
      }
    },
  }));

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme,
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => onTokenRef.current(null),
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded]);

  // Not configured (local dev / CI): render nothing, verification is
  // skipped server-side too (see lib/turnstile.ts).
  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className={className} />
    </>
  );
}
