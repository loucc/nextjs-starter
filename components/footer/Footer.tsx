import { Newsletter } from "@/components/footer/Newsletter";
import { siteConfig } from "@/config/site";
import { Link as I18nLink } from "@/i18n/routing";
import { HeaderLink } from "@/types/common";
import { getMessages, getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";

// Minimal light footer: logo + intro, product nav, support links,
// customer-service entry, newsletter and copyright — separated by
// hairline dividers, gentle and low-key.
export default async function Footer() {
  const messages = await getMessages();

  const tFooter = await getTranslations("Footer");
  const tHeader = await getTranslations("Header");

  const navLinks: HeaderLink[] = tHeader.raw("links");
  const supportLinks: HeaderLink[] = [
    { name: tFooter("Pricing"), href: "/pricing" },
    { name: tFooter("Changelog"), href: "/changelog" },
    { name: tFooter("PrivacyPolicy"), href: "/privacy-policy" },
    { name: tFooter("TermsOfService"), href: "/terms-of-service" },
  ];

  const contactEmail = process.env.ADMIN_EMAIL;

  return (
    <footer className="border-t border-line/70 bg-healing-mist/70 dark:border-slate-800/70 dark:bg-slate-900/30 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand + intro */}
          <div className="md:col-span-4 space-y-4">
            <I18nLink
              href="/"
              prefetch={false}
              className="flex items-center gap-2"
              aria-label={siteConfig.name}
            >
              <Image
                alt={siteConfig.name}
                src="/logo.svg"
                className="h-8 w-8 rounded-lg"
                width={32}
                height={32}
              />
              <span className="font-light tracking-[0.12em] text-text-main dark:text-slate-200">
                {siteConfig.name}
              </span>
            </I18nLink>
            <p className="max-w-sm text-sm font-light leading-relaxed text-text-muted dark:text-slate-400">
              {tFooter("intro")}
            </p>
          </div>

          {/* Product nav */}
          <div className="md:col-span-3">
            <h3 className="mb-4 text-sm font-medium tracking-wide text-text-main dark:text-slate-300">
              {tFooter("productTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm font-light text-text-muted dark:text-slate-400">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <I18nLink
                    href={link.href}
                    prefetch={false}
                    className="transition-colors duration-300 hover:text-blue-500"
                  >
                    {link.name}
                  </I18nLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-2">
            <h3 className="mb-4 text-sm font-medium tracking-wide text-text-main dark:text-slate-300">
              {tFooter("supportTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm font-light text-text-muted dark:text-slate-400">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <I18nLink
                    href={link.href}
                    prefetch={false}
                    className="transition-colors duration-300 hover:text-blue-500"
                  >
                    {link.name}
                  </I18nLink>
                </li>
              ))}
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="transition-colors duration-300 hover:text-blue-500"
                  >
                    {tFooter("contactUs")}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          {messages.Footer.Newsletter && (
            <div className="md:col-span-3">
              <Newsletter />
            </div>
          )}
        </div>

        {/* hairline divider */}
        <div className="mt-12 border-t border-line/70 dark:border-slate-800/70 pt-6">
          <p className="text-center text-xs font-light tracking-wide text-text-muted/80 dark:text-slate-500">
            {tFooter("Copyright", {
              year: new Date().getFullYear(),
              name: siteConfig.name,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
