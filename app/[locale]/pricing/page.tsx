import { JsonLd } from "@/components/JsonLd";
import { Locale, LOCALES } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { getPlanActionUrl, PricingPlanId } from "@/lib/pricing";
import { Check } from "lucide-react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

const PLAN_IDS: PricingPlanId[] = ["free", "pro", "business"];

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });

  return constructMetadata({
    page: "Pricing",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/pricing`,
    canonicalUrl: `/pricing`,
  });
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({
    locale,
  }));
}

function faqJsonLd(locale: string, faq: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
    inLanguage: locale,
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });

  const plans = t.raw("plans") as Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
  }>;
  const faq = t.raw("faq") as Array<{ q: string; a: string }>;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <JsonLd data={faqJsonLd(locale, faq)} />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-gray-200">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const planId = PLAN_IDS[index];
          const featured = index === 1;
          const href = getPlanActionUrl(planId);
          const isMailto = href.startsWith("mailto:");

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[2rem] border p-8 backdrop-blur-md shadow-lg shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 ${
                featured
                  ? "border-blue-400/40 bg-blue-50/50 dark:border-blue-400/20 dark:bg-blue-900/10 shadow-xl shadow-blue-400/10"
                  : "border-white/50 bg-white/50 dark:border-white/10 dark:bg-slate-800/40"
              }`}
            >
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                  {t("popular")}
                </div>
              )}
              <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-200">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {plan.description}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-gray-100">
                  {plan.price}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {t("period")}
                </span>
              </div>

              <div className="mt-6 flex-grow">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-200 mb-3">
                  {t("featuresTitle")}
                </h3>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={href}
                {...(isMailto ? {} : { target: href.startsWith("http") ? "_blank" : undefined })}
                rel="noopener noreferrer"
                className={`mt-8 inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-light tracking-wide transition-all duration-300 ${
                  featured
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-400/30 hover:scale-[1.03]"
                    : "border border-white/60 bg-white/40 text-slate-700 backdrop-blur-sm hover:text-blue-600 dark:border-white/10 dark:bg-slate-800/40 dark:text-gray-200 dark:hover:text-blue-300"
                }`}
              >
                {planId === "free"
                  ? t("ctaStart")
                  : planId === "pro"
                    ? t("ctaGetPro")
                    : t("ctaContact")}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-gray-200 mb-8">
          {t("faqTitle")}
        </h2>
        <div className="space-y-6">
          {faq.map((item) => (
            <div key={item.q}>
              <h3 className="font-semibold text-slate-900 dark:text-gray-200">
                {item.q}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
