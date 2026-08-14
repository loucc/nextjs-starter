"use client";

import { useTranslations } from "next-intl";

// Minimal healing illustrations (low-saturation line art), keyed by card
// index: venting, analysis, stress, bedtime, journal, healing.
function Illustration({ index }: { index: number }) {
  const common = {
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (index) {
    case 0: // speech bubble + heart
      return (
        <svg viewBox="0 0 64 64" className="h-14 w-14">
          <path d="M14 18a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H30l-10 8v-8h-6a8 8 0 0 1-8-8z" stroke="#93c5fd" strokeWidth="2.5" {...common} />
          <path d="M27 22c0-3 2.5-5 5.5-5s4.5 2 4.5 4c0 3.5-5 5-5 6.5V30" stroke="#c4b5fd" strokeWidth="2.2" {...common} />
          <circle cx="32" cy="35.5" r="1.4" fill="#c4b5fd" />
        </svg>
      );
    case 1: // pulse in a circle
      return (
        <svg viewBox="0 0 64 64" className="h-14 w-14">
          <circle cx="32" cy="32" r="22" stroke="#c4b5fd" strokeWidth="2.5" {...common} />
          <path d="M18 32h7l4-10 7 20 4-10h6" stroke="#93c5fd" strokeWidth="2.5" {...common} />
        </svg>
      );
    case 2: // soft waves
      return (
        <svg viewBox="0 0 64 64" className="h-14 w-14">
          <path d="M10 26c7-6 14 6 21 0s14 6 21 0" stroke="#93c5fd" strokeWidth="2.5" {...common} />
          <path d="M10 38c7-6 14 6 21 0s14 6 21 0" stroke="#c4b5fd" strokeWidth="2.5" opacity="0.7" {...common} />
          <path d="M10 50c7-6 14 6 21 0s14 6 21 0" stroke="#ddd6fe" strokeWidth="2.5" opacity="0.6" {...common} />
        </svg>
      );
    case 3: // crescent moon + stars
      return (
        <svg viewBox="0 0 64 64" className="h-14 w-14">
          <path d="M40 12a19 19 0 1 0 12 28 19 19 0 0 1-12-28z" stroke="#c4b5fd" strokeWidth="2.5" {...common} />
          <path d="M45 20l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#93c5fd" opacity="0.9" />
          <circle cx="20" cy="16" r="1.6" fill="#ddd6fe" />
          <circle cx="16" cy="30" r="1.2" fill="#ddd6fe" />
        </svg>
      );
    case 4: // open book + heart
      return (
        <svg viewBox="0 0 64 64" className="h-14 w-14">
          <path d="M10 18a6 6 0 0 1 6-6h10c5 0 8 3 8 8v28c0-5-3-8-8-8H16a6 6 0 0 1-6-6z" stroke="#93c5fd" strokeWidth="2.5" {...common} />
          <path d="M54 18a6 6 0 0 0-6-6H38c-5 0-8 3-8 8v28c0-5 3-8 8-8h10a6 6 0 0 0 6-6z" stroke="#93c5fd" strokeWidth="2.5" {...common} />
          <path d="M30 24c0-3 2-4.8 3.5-4.8 1.2 0 2.2 1 2.5 2.2.3-1.2 1.3-2.2 2.5-2.2 1.5 0 3.5 1.8 3.5 4.8 0 4-6 6.8-6 6.8s-6-2.8-6-6.8z" stroke="#c4b5fd" strokeWidth="2" {...common} />
        </svg>
      );
    default: // gentle flower
      return (
        <svg viewBox="0 0 64 64" className="h-14 w-14">
          <circle cx="32" cy="32" r="6.5" fill="#fbcfe8" opacity="0.8" />
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="32"
              cy="19.5"
              rx="6.5"
              ry="10"
              transform={`rotate(${angle} 32 32)`}
              stroke="#c4b5fd"
              strokeWidth="2.2"
              {...common}
            />
          ))}
          <path d="M32 42v8" stroke="#93c5fd" strokeWidth="2.2" {...common} />
          <path d="M27 50h10" stroke="#93c5fd" strokeWidth="2.2" {...common} />
        </svg>
      );
  }
}

export default function FeatureGrid() {
  const t = useTranslations("Home");
  const cards = t.raw("featureCards") as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="group relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/50 p-8 shadow-soft-glow backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-400/10 dark:border-white/10 dark:bg-slate-800/40"
        >
          {/* soft inner light */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-100/70 to-violet-100/50 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/10 dark:to-violet-400/10" />

          <div className="relative">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100/70 to-violet-100/60 dark:from-blue-400/10 dark:to-violet-400/10">
              <Illustration index={index} />
            </div>
            <h3 className="mb-2 text-lg font-medium tracking-wide text-slate-800 dark:text-gray-200">
              {card.title}
            </h3>
            <p className="text-sm font-light leading-relaxed text-slate-500 dark:text-slate-400">
              {card.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
