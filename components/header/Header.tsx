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
      <nav className="mx-auto max-w-6xl flex items-center justify-between rounded-full border border-line/70 dark:border-white/10 bg-white/55 dark:bg-slate-900/40 backdrop-blur-xl shadow-soft-glow px-4 sm:px-6 py-2">
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
            className="hidden md:inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-2 text-sm font-light tracking-wide text-white shadow-md shadow-blue-500/20 transition-transform duration-300 hover:scale-[1.03]"
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
