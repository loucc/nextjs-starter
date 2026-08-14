"use client";

import GoogleSignInButton from "@/components/chat/GoogleSignInButton";
import { useChatStore } from "@/stores/chatStore";
import { useTranslations } from "next-intl";

/** Centered frosted sign-in card shown to guests on /chat. */
export default function SignInPanel() {
  const t = useTranslations("Chat");
  const signInError = useChatStore((s) => s.signInError);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line/60 bg-white/55 p-10 text-center shadow-soft-glow backdrop-blur-xl dark:border-night-line dark:bg-night-card/50">
        <h1 className="text-2xl font-semibold tracking-tight text-text-main dark:text-gray-100">
          {t("signInTitle")}
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-text-muted dark:text-slate-400">
          {t("signInDescription")}
        </p>
        <div className="mt-8 flex justify-center">
          <GoogleSignInButton />
        </div>
        {signInError && (
          <p className="mt-4 text-sm text-red-500">{signInError}</p>
        )}
      </div>
    </div>
  );
}
