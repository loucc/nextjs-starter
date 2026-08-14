import { Heart, Moon, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURE_ICONS = [Heart, Sparkles, Moon];

export default function WellnessSections() {
  const t = useTranslations("Home");

  const features = t.raw("features") as Array<{
    title: string;
    description: string;
  }>;

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

      {/* Feature trio — 全天候AI情绪疏导 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-gray-200 mb-12">
          {t("careTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 p-8 backdrop-blur-sm"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-200 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Closing CTA — 让AI，成为你的专属心灵树洞 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 sm:p-14 text-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t("ctaTitle")}
            </h2>
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-indigo-600 font-semibold hover:bg-white/90 transition-colors"
            >
              {t("ctaButton")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
