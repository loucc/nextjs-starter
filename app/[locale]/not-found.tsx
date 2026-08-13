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
      <Button asChild>
        <I18nLink href="/">{t("backHome")}</I18nLink>
      </Button>
    </div>
  );
}
