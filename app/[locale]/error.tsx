"use client";

import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <AlertCircleIcon className="w-12 h-12 text-red-500" />
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground max-w-md">{t("description")}</p>
      <Button onClick={reset} className="rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.05] hover:brightness-105 active:scale-[0.98]">{t("retry")}</Button>
    </div>
  );
}
