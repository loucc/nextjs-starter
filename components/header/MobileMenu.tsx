"use client";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as I18nLink } from "@/i18n/routing";
import { HeaderLink } from "@/types/common";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function MobileMenu() {
  const t = useTranslations("Home");
  const tHeader = useTranslations("Header");

  const headerLinks: HeaderLink[] = tHeader.raw("links");

  return (
    <div className="flex items-center gap-1 md:hidden">
      <LocaleSwitcher />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2">
          <Menu className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 rounded-2xl border-white/40 dark:border-white/10 bg-white/80 dark:bg-night/80 backdrop-blur-xl"
        >
          <DropdownMenuLabel>
            <I18nLink
              href="/"
              title={t("title")}
              prefetch={true}
              className="flex items-center gap-2 font-light tracking-wide"
            >
              <Image
                alt={t("title")}
                src="/logo.svg"
                className="w-7 h-7 rounded-lg"
                width={28}
                height={28}
              />
              <span>{t("title")}</span>
            </I18nLink>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {headerLinks.map((link) => (
              <DropdownMenuItem key={link.name}>
                <I18nLink
                  href={link.href}
                  title={link.name}
                  prefetch={true}
                  className="font-light tracking-wide"
                >
                  {link.name}
                </I18nLink>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem>
              <I18nLink
                href="/chat"
                className="w-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 px-4 py-1.5 text-center text-white shadow-[0_10px_30px_-8px_rgba(96,165,250,0.6),0_0_24px_rgba(167,139,250,0.4)] transition-all duration-300 hover:scale-[1.05] hover:brightness-105 active:scale-[0.98]"
              >
                {tHeader("login")}
              </I18nLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
