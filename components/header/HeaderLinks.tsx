"use client";

import { Link as I18nLink, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { HeaderLink } from "@/types/common";
import { useTranslations } from "next-intl";

const HeaderLinks = () => {
  const tHeader = useTranslations("Header");
  const pathname = usePathname();

  const headerLinks: HeaderLink[] = tHeader.raw("links");

  return (
    <div className="hidden md:flex flex-row items-center gap-x-1">
      {headerLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <I18nLink
            key={link.name}
            href={link.href}
            title={link.name}
            prefetch={true}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-light tracking-wide transition-all duration-300",
              "text-slate-600 dark:text-slate-300",
              "hover:bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500",
              active &&
                "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500 font-normal"
            )}
          >
            {link.name}
          </I18nLink>
        );
      })}
    </div>
  );
};

export default HeaderLinks;
