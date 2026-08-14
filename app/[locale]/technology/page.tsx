import { Locale, LOCALES } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { BrainCircuit, Fingerprint, Globe2, Lock } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const SECTION_ICONS = [BrainCircuit, Fingerprint, Lock, Globe2];

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Technology" });

  return constructMetadata({
    page: "Technology",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/technology`,
    canonicalUrl: `/technology`,
  });
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({
    locale,
  }));
}

export default async function TechnologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Technology" });

  const sections = t.raw("sections") as Array<{
    title: string;
    description: string;
  }>;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, index) => {
          const Icon = SECTION_ICONS[index % SECTION_ICONS.length];
          return (
            <div
              key={section.title}
              className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm p-8"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-gray-200 mb-2">
                {section.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
