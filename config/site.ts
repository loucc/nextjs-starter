import { SiteConfig } from "@/types/siteConfig";

const TWITTER_URL = 'https://x.com/weijunext'
const BSKY_URL = 'https://bsky.app/profile/judewei.bsky.social'
const EMAIL_URL = 'weijunext@gmail.com'
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL

export const siteConfig: SiteConfig = {
  name: "SerenAI",
  tagLine: 'Your AI emotional companion',
  description:
    "SerenAI is your dedicated AI emotional companion, providing professional mood healing, emotional guidance, stress relief and mental relaxation services. Powered by advanced AI emotion recognition technology, it offers personalized emotional comfort and round-the-clock mental support to ease anxiety, emotional burnout and loneliness. Discover gentle, tech-driven mental wellness and calm your mind with SerenAI.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://nextjsstarter.io",
  authors: [
    {
      name: "weijunext",
      url: "https://weijunext.com",
    }
  ],
  creator: '@weijunext',
  socialLinks: {
    discord: DISCORD_URL,
    twitter: TWITTER_URL,
    bluesky: BSKY_URL,
    email: EMAIL_URL
  },
  themeColors: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  defaultNextTheme: 'system', // next-theme option: system | dark | light
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.png", // TODO: regenerate apple-touch-icon with SerenAI branding
  },
}
