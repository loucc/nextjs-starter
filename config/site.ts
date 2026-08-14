import { SiteConfig } from "@/types/siteConfig";

export const siteConfig: SiteConfig = {
  name: "SerenAI",
  tagLine: 'Your AI emotional companion',
  description:
    "SerenAI is your dedicated AI emotional companion, providing professional mood healing, emotional guidance, stress relief and mental relaxation services. Powered by advanced AI emotion recognition technology, it offers personalized emotional comfort and round-the-clock mental support to ease anxiety, emotional burnout and loneliness. Discover gentle, tech-driven mental wellness and calm your mind with SerenAI.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://nextjsstarter.io",
  authors: [
    {
      name: "SerenAI",
      url: process.env.NEXT_PUBLIC_SITE_URL || "https://nextjsstarter.io",
    }
  ],
  creator: '',
  themeColors: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  defaultNextTheme: 'system', // next-theme option: system | dark | light
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.png",
  },
}
