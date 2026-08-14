import { unsubscribeFromNewsletter } from "@/actions/newsletter";
import { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function UnsubscribePage(props: {
  searchParams: SearchParams;
  params: Promise<{ locale: string }>;
}) {
  let status: "error" | "success" = "error";
  let email = "";
  let errorMessage = "";

  const { locale } = await props.params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Unsubscribe" });

  const searchParams = await props.searchParams;
  const token = searchParams.token as string;

  if (!token) {
    errorMessage = t("errorHint");
  } else {
    try {
      const result = await unsubscribeFromNewsletter(token);
      if (result.success) {
        status = "success";
        email = result.email;
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : t("errorHint");
    }
  }

  return (
    <div className="max-w-md mx-auto my-16 p-6 rounded-2xl border border-line/60 bg-white/60 shadow-soft-glow backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      {status === "success" ? (
        <div>
          <p className="mb-4">{t("success")}</p>
          <p className="text-sm text-text-muted">
            {t("emailLabel")}: {email}
          </p>
          <p className="mt-6">{t("resubscribe")}</p>
        </div>
      ) : (
        <div>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <p>{t("errorHint")}</p>
        </div>
      )}
    </div>
  );
}
