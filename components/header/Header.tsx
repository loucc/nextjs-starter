"use client";

import HeaderLinks from "@/components/header/HeaderLinks";
import MobileMenu from "@/components/header/MobileMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteConfig } from "@/config/site";
import { Link as I18nLink } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";

const Header = () => {
  const t = useTranslations("Home");
  const tHeader = useTranslations("Header");

  return (
    <header className="sticky top-3 z-50 px-4">
      <nav className="mx-auto max-w-6xl flex items-center justify-between rounded-full border border-line/70 dark:border-white/10 bg-white/55 dark:bg-night/40 backdrop-blur-xl shadow-soft-glow px-4 sm:px-6 py-2">
        {/* Logo */}
        <I18nLink
          href="/"
          prefetch={false}
          className="flex items-center gap-2"
          aria-label={siteConfig.name}
        >
          <Image
            alt={siteConfig.name}
            src="/logo.svg"
            className="w-7 h-7 rounded-lg"
            width={28}
            height={28}
          />
          <span className="font-light tracking-[0.12em] text-slate-700 dark:text-slate-200">
            {siteConfig.name}
          </span>
        </I18nLink>

        {/* Desktop nav */}
        <div className="hidden md:block">
          <HeaderLinks />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Login / Sign up (coming soon with the auth feature) */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            title={tHeader("login")}
            aria-label={`${tHeader("login")} (coming soon)`}
            className="hidden md:inline-flex items-center rounded-full border border-white/60 bg-healing-purple/70 px-5 py-2 text-sm font-light tracking-wide text-text-main backdrop-blur-sm transition-colors duration-300 hover:bg-healing-purple dark:border-white/10 dark:bg-night-card/60 dark:text-slate-200 dark:hover:bg-night-card/90"
          >
            {tHeader("login")}
          </a>
          <LocaleSwitcher />
          <ThemeToggle />
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
};

export default Header;
