"use client";

import AiAvatar from "@/components/home/AiAvatar";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Floating glow particles (positions/sizes/delays tuned by hand).
const PARTICLES = [
  { top: "18%", left: "12%", size: 6, delay: "0s", color: "bg-blue-300/60" },
  { top: "30%", left: "82%", size: 8, delay: "1.4s", color: "bg-violet-300/60" },
  { top: "64%", left: "8%", size: 5, delay: "2.6s", color: "bg-rose-200/70" },
  { top: "72%", left: "88%", size: 7, delay: "0.8s", color: "bg-blue-200/70" },
  { top: "12%", left: "46%", size: 4, delay: "3.4s", color: "bg-amber-200/80" },
  { top: "80%", left: "38%", size: 5, delay: "2s", color: "bg-violet-200/70" },
  { top: "42%", left: "94%", size: 4, delay: "4.2s", color: "bg-rose-300/50" },
];

export default function Hero() {
  const t = useTranslations("Home");
  const points = t.raw("heroPoints") as string[];

  return (
    <section className="relative flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center overflow-hidden px-4 py-16">
      {/* soft gradient backdrop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-healing-blue via-healing-purple/70 to-healing-pink/60 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950" />

      {/* ambient light blobs */}
      <div className="absolute -left-32 top-1/4 -z-10 h-96 w-96 rounded-full bg-healing-cyan/80 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute -right-32 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-healing-purple blur-3xl dark:bg-violet-500/10" />
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-amber-100/50 blur-3xl dark:bg-amber-400/5" />

      {/* flowing glow particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`animate-hero-float absolute -z-[5] rounded-full ${p.color}`}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* abstract emotion waves */}
      <svg
        className="animate-hero-wave absolute bottom-8 left-0 -z-[5] h-40 w-full opacity-30"
        viewBox="0 0 1440 160"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 96 C 180 48, 360 128, 540 88 S 900 48, 1080 88 S 1380 112, 1440 80"
          stroke="url(#hero-wave-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0 120 C 180 76, 360 148, 540 112 S 900 80, 1080 116 S 1380 136, 1440 108"
          stroke="url(#hero-wave-2)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="hero-wave-1" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="hero-wave-2" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#f9a8d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* content */}
      <div className="relative flex w-full max-w-6xl flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="flex max-w-2xl flex-col items-center gap-6 lg:items-start">
          <h1 className="font-light tracking-[0.18em] text-slate-700 dark:text-slate-300 text-2xl sm:text-3xl">
            Seren<span className="bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent font-normal">AI</span>
          </h1>

          <p className="text-4xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-gray-100 sm:text-5xl">
            {t("slogan")}
          </p>

          <div className="flex flex-wrap justify-center gap-2.5 lg:justify-start">
            {points.map((point) => (
              <span
                key={point}
                className="rounded-full border border-white/60 bg-white/50 px-4 py-1.5 text-sm font-light tracking-wide text-slate-600 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300"
              >
                {point}
              </span>
            ))}
          </div>

          {/* bottom-right buttons (in-flow, aligned right on desktop) */}
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row lg:self-end">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label={`${t("ctaTry")} (coming soon)`}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-9 py-3 text-sm font-light tracking-wide text-white shadow-lg shadow-blue-400/30 transition-transform duration-300 hover:scale-[1.04]"
            >
              {t("ctaTry")}
            </a>
            <Link
              href="/features"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/40 px-9 py-3 text-sm font-light tracking-wide text-slate-600 backdrop-blur-sm transition-colors duration-300 hover:text-blue-600 dark:border-white/10 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:text-blue-300"
            >
              {t("ctaLearn")}
            </Link>
          </div>
        </div>

        {/* gentle AI avatar */}
        <div className="order-first lg:order-last lg:mr-16">
          <AiAvatar />
        </div>
      </div>
    </section>
  );
}
