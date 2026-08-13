"use client";

import { CONSENT_CHANGED_EVENT } from "@/components/CookieConsent";
import Cookies from "js-cookie";
import { ReactNode, useSyncExternalStore } from "react";

const CONSENT_COOKIE = "cookieConsent";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}

/**
 * Renders analytics/ads scripts only when the visitor accepted cookies
 * (value "accepted" in the cookieConsent cookie). Renders nothing until
 * mounted to avoid SSR/CSR mismatches and accidental script loading.
 */
export default function AnalyticsGate({ children }: { children: ReactNode }) {
  const accepted = useSyncExternalStore(
    subscribe,
    () => Cookies.get(CONSENT_COOKIE) === "accepted",
    () => false
  );

  if (!accepted) return null;
  return <>{children}</>;
}
