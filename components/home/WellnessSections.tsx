import FeatureGrid from "@/components/home/FeatureGrid";
import { useTranslations } from "next-intl";

export default function WellnessSections() {
  const t = useTranslations("Home");

  return (
    <>
      {/* Philosophy quote — 接纳所有情绪，温柔治愈自己 */}
      <section className="w-full py-20 bg-gradient-to-b from-transparent via-blue-50/40 to-transparent dark:via-blue-950/10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800 dark:text-gray-200 leading-relaxed">
            “{t("quoteTitle")}”
          </p>
        </div>
      </section>

      {/* Feature grid — 六项产品功能 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-gray-200 mb-14">
          {t("careTitle")}
        </h2>
        <FeatureGrid />
      </section>

      {/* Closing CTA — 让AI，成为你的专属心灵树洞 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 sm:p-14 text-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {t("ctaTitle")}
            </h2>
          </div>
        </div>
      </section>
    </>
  );
}
