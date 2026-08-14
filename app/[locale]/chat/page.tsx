import ChatApp from "@/components/chat/ChatApp";
import { Locale } from "@/i18n/routing";
import { constructMetadata } from "@/lib/metadata";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Chat" });
  return constructMetadata({
    page: "Chat",
    title: t("title"),
    description: t("description"),
    noIndex: true,
    locale: locale as Locale,
    path: "/chat",
    canonicalUrl: "/chat",
  });
}

// Client-heavy page: session check + chat UI all run in the browser, so the
// server shell stays static (no force-dynamic needed).
export default function ChatPage() {
  return <ChatApp />;
}
