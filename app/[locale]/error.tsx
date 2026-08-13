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
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
