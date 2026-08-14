"use client";

import TurnstileWidget, {
  TurnstileWidgetHandle,
} from "@/components/TurnstileWidget";
import { Button } from "@/components/ui/button";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const t = useTranslations("Footer.Newsletter");

  const showError = (message: string) => {
    setSubscribeStatus("error");
    setErrorMessage(message);
    setTimeout(() => setSubscribeStatus("idle"), 5000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const normalizedEmailAddress = normalizeEmail(email);
    const { isValid, error } = validateEmail(normalizedEmailAddress);

    if (!isValid) {
      showError(error || t("defaultErrorMessage"));
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      showError(t("turnstileRequired"));
      return;
    }

    try {
      setSubscribeStatus("loading");

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmailAddress,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errorMessage"));
      }

      setSubscribeStatus("success");
      setEmail("");
      setErrorMessage("");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setTimeout(() => setSubscribeStatus("idle"), 5000);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : t("errorMessage2")
      );
    }
  };
  return (
    <div className="">
      <h4 className="mb-3 font-semibold">{t("title")}</h4>
      <p className="text-sm mb-3">{t("description")}</p>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2 max-w-64">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 bg-white/70 border border-line/60 text-text-main text-sm rounded-lg backdrop-blur-sm placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-healing-blue/50 focus:border-healing-blue"
            disabled={subscribeStatus === "loading"}
          />
        </div>
        <TurnstileWidget
          ref={turnstileRef}
          onToken={setTurnstileToken}
          theme="auto"
        />
        <Button type="submit" disabled={subscribeStatus === "loading"} className="rounded-full bg-gradient-to-r from-blue-500 to-violet-500 shadow-lg shadow-blue-400/25 hover:opacity-90">
          {subscribeStatus === "loading" ? (
            t("subscribing")
          ) : (
            <>
              {t("subscribe")} <Send className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
        {subscribeStatus === "success" && (
          <p className="text-xs text-green-600 mt-1">{t("subscribed")}</p>
        )}
        {subscribeStatus === "error" && (
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
