"use client";

import { joinWaitlist } from "@/actions/waitlist";
import TurnstileWidget, {
  TurnstileWidgetHandle,
} from "@/components/TurnstileWidget";
import { Button } from "@/components/ui/button";
import { normalizeEmail, validateEmail } from "@/lib/email";
import { AlertCircleIcon, CheckCircleIcon, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const ERROR_KEYS: Record<string, string> = {
  alreadyJoined: "alreadyJoined",
  notConfigured: "errorMessage",
  errorMessage: "errorMessage",
};

export default function Waitlist() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations("Waitlist");

  const showError = (message: string) => {
    setStatus("error");
    setErrorMessage(message);
    setTimeout(() => setStatus("idle"), 5000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const rawEmail = new FormData(form).get("email") as string;
    const normalizedEmail = normalizeEmail(rawEmail);
    const { isValid, error } = validateEmail(normalizedEmail);

    if (!isValid) {
      showError(error || t("errorMessage"));
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileInputRef.current?.value) {
      showError(t("turnstileRequired"));
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");

      const result = await joinWaitlist(new FormData(form));

      if (!result.success) {
        const key = ERROR_KEYS[result.error || ""] || "errorMessage";
        throw new Error(t(key));
      }

      setStatus("success");
      form.reset();
      turnstileRef.current?.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : t("errorMessage")
      );
    }
  };

  return (
    <section
      id="waitlist"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium mb-4">
              <Mail className="w-4 h-4" />
              {t("badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg">
              {t("description")}
            </p>
          </div>

          <div className="w-full lg:w-[420px]">
            <form
              onSubmit={handleSubmit}
              className="bg-muted/50 rounded-2xl p-6 border flex flex-col justify-between gap-4"
            >
              <div>
                <label
                  htmlFor="waitlist-email"
                  className="block text-sm font-medium mb-2"
                >
                  {t("emailLabel")}
                </label>
                <input
                  type="email"
                  id="waitlist-email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  disabled={status === "loading"}
                />
              </div>
              <TurnstileWidget
                ref={turnstileRef}
                onToken={(token) => {
                  if (turnstileInputRef.current) {
                    turnstileInputRef.current.value = token || "";
                  }
                }}
                theme="auto"
              />
              <input
                type="hidden"
                name="cf-turnstile-response"
                ref={turnstileInputRef}
              />
              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("joining")}
                  </span>
                ) : (
                  t("join")
                )}
              </Button>

              <div className="flex items-center justify-center min-h-10">
                {status === "success" && (
                  <div className="flex items-start gap-2 text-green-600 text-sm bg-green-500/10 px-4 py-2 rounded-xl w-full">
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-left">{t("joined")}</span>
                  </div>
                )}
                {status === "error" && (
                  <div className="flex items-start gap-2 text-red-600 text-sm bg-red-500/10 px-4 py-2 rounded-xl w-full">
                    <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-left break-words w-full">
                      {errorMessage}
                    </span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
