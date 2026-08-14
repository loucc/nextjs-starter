"use client";

import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Cookie, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { useSyncExternalStore } from "react";

const CONSENT_COOKIE = "cookieConsent";
const CONSENT_EXPIRES_DAYS = 365;
export const CONSENT_CHANGED_EVENT = "cookie-consent-changed";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}

/**
 * Cookie consent banner (GDPR/CCPA). The consent cookie itself is an
 * essential cookie (exempt from the ePrivacy directive). Analytics/ads
 * scripts are gated on `accepted` — see components/AnalyticsGate.tsx.
 */
export default function CookieConsent() {
  const t = useTranslations("CookieConsent");

  // null = undecided (also the SSR snapshot — the banner appears only
  // after hydration, which is fine for a consent prompt).
  const consent = useSyncExternalStore(
    subscribe,
    () => Cookies.get(CONSENT_COOKIE) ?? null,
    () => null
  );

  const choose = (value: "accepted" | "declined") => {
    Cookies.set(CONSENT_COOKIE, value, {
      expires: CONSENT_EXPIRES_DAYS,
      sameSite: "lax",
    });
    // Let this banner and AnalyticsGate re-evaluate without a reload.
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  };

  if (consent !== null) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto sm:mx-0 sm:left-4 sm:right-auto sm:w-96",
        "bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg p-4"
      )}
      role="region"
      aria-label={t("title")}
    >
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
        <div className="flex-1">
          <h3 className="font-medium text-sm text-foreground mb-1">
            {t("title")}
          </h3>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {t("description")}{" "}
            <I18nLink
              href="/privacy-policy"
              className="underline underline-offset-2 hover:text-primary"
            >
              {t("privacyPolicyLink")}
            </I18nLink>
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => choose("accepted")} className="rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.05] hover:brightness-105 active:scale-[0.98]">
              {t("accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => choose("declined")}
            >
              {t("decline")}
            </Button>
          </div>
        </div>
        <button
          onClick={() => choose("declined")}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("decline")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
