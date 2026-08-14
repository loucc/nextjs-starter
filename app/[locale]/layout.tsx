import BaiDuAnalytics from "@/app/BaiDuAnalytics";
import GoogleAdsense from "@/app/GoogleAdsense";
import GoogleAnalytics from "@/app/GoogleAnalytics";
import PlausibleAnalytics from "@/app/PlausibleAnalytics";
import AnalyticsGate from "@/components/AnalyticsGate";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import HtmlLang from "@/components/HtmlLang";
import { LanguageDetectionAlert } from "@/components/LanguageDetectionAlert";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { ThemeProvider } from "@/components/ThemeProvider";
import { siteConfig } from "@/config/site";
import { Locale, routing } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import "@/styles/globals.css";
import { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return constructMetadata({
    page: "Home",
    title: t("title"),
    description: t("description"),
    locale: locale as Locale,
    path: `/`,
    canonicalUrl: `/`,
  });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <>
      <HtmlLang locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme={siteConfig.defaultNextTheme}
          enableSystem
        >
          {messages.LanguageDetection && <LanguageDetectionAlert />}
          {messages.Header && <Header />}

          <main className="flex-1 flex flex-col items-center">
            {children}
          </main>

          {messages.Footer && <Footer />}
          {messages.CookieConsent && <CookieConsent />}
        </ThemeProvider>
      </NextIntlClientProvider>
      <TailwindIndicator />
      {process.env.NODE_ENV === "development" ? (
        <></>
      ) : (
        <>
          {/* Vercel Analytics removed (not meaningful on Cloudflare) —
              Cloudflare Web Analytics is planned (see biz.md P1).
              All scripts are gated on cookie consent (AnalyticsGate). */}
          <AnalyticsGate>
            <BaiDuAnalytics />
            <GoogleAnalytics />
            <GoogleAdsense />
            <PlausibleAnalytics />
          </AnalyticsGate>
        </>
      )}
    </>
  );
}
