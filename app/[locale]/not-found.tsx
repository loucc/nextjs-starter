import { Button } from "@/components/ui/button";
import { Link as I18nLink } from "@/i18n/routing";
import { FileQuestionIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

// NOTE: must be a server component — a client not-found renders with
// status 200 (streaming can't set the status code), which creates soft
// 404s that hurt SEO.
export default async function NotFoundPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Error" });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <FileQuestionIcon className="w-12 h-12 text-muted-foreground" />
      <h1 className="text-3xl font-bold">{t("notFoundTitle")}</h1>
      <p className="text-muted-foreground max-w-md">{t("notFoundDescription")}</p>
      <Button asChild className="rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.05] hover:brightness-105 active:scale-[0.98]">
        <I18nLink href="/">{t("backHome")}</I18nLink>
      </Button>
    </div>
  );
}
