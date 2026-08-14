import { Locale, LOCALES } from "@/i18n/routing";
import { getChangelog } from "@/lib/content";
import { constructMetadata } from "@/lib/metadata";
import { Rss } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Changelog" });

  return constructMetadata({
    page: "Changelog",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/changelog`,
    canonicalUrl: `/changelog`,
  });
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({
    locale,
  }));
}

export default async function ChangelogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Changelog" });
  const { entries } = await getChangelog(locale);

  return (
    <div className="w-full md:w-3/5 px-2 md:px-12 py-16">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-200">
            {t("title")}
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl">
            {t("description")}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("subscribeHint")}{" "}
            <Link
              href="/api/changelog/rss"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
            >
              <Rss className="w-3.5 h-3.5" />
              {t("rss")}
            </Link>
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {entries.map((entry) => (
          <article key={entry.version} className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-600" />
            <header className="flex flex-wrap items-baseline gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-gray-200">
                {entry.title || entry.version}
              </h2>
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                {entry.version}
              </span>
              <time
                dateTime={new Date(entry.date).toISOString()}
                className="text-sm text-slate-500 dark:text-slate-400"
              >
                {new Date(entry.date).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </header>
            {entry.Component && <entry.Component />}
          </article>
        ))}
      </div>
    </div>
  );
}
