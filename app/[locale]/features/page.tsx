import FeatureGrid from "@/components/home/FeatureGrid";
import { Locale, LOCALES } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Features" });

  return constructMetadata({
    page: "Features",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/features`,
    canonicalUrl: `/features`,
  });
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({
    locale,
  }));
}

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Features" });
  const tHome = await getTranslations({ locale, namespace: "Home" });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-200">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <FeatureGrid />

      <p className="mt-16 text-center text-xl font-light tracking-wide text-slate-600 dark:text-slate-400">
        “{tHome("quoteTitle")}”
      </p>
    </div>
  );
}
