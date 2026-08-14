import FeatureGrid from "@/components/home/FeatureGrid";
import { useTranslations } from "next-intl";

export default function WellnessSections() {
  const t = useTranslations("Home");

  return (
    <>
      {/* Philosophy quote — 接纳所有情绪，温柔治愈自己 */}
      <section className="w-full py-20 bg-gradient-to-b from-transparent via-healing-purple/70 to-transparent dark:via-night-card/40">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-main dark:text-gray-200 leading-relaxed">
            “{t("quoteTitle")}”
          </p>
        </div>
      </section>

      {/* Feature grid — 六项产品功能 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-text-main dark:text-gray-200 mb-14">
          {t("careTitle")}
        </h2>
        <FeatureGrid />
      </section>

      {/* Closing CTA — 让AI，成为你的专属心灵树洞 (translucent light banner) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-healing-purple/90 via-healing-milk/80 to-healing-blue/90 p-12 sm:p-16 text-center shadow-soft-glow backdrop-blur-sm dark:border-white/10 dark:from-night-card/80 dark:via-night-card/60 dark:to-night-card/80">
          {/* soft micro-glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-healing-mist blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-healing-purple/70 blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-text-main dark:text-gray-100">
              {t("ctaPre")}
              <span className="bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
                {t("ctaHighlight")}
              </span>
              {t("ctaSuffix")}
            </h2>
          </div>
        </div>
      </section>
    </>
  );
}
