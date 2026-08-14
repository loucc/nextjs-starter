---
Ship your SaaS faster with Nexty

NEXTY.DEV is a comprehensive Next.js SaaS boilerplate that provides everything developers need to rapidly build and launch modern AI web applications

Try [NEXTY.DEV today](https://nexty.dev?utm_source=github-nextjs-starter)
---

[<img src="/public/try-nexty.webp">](https://nexty.dev?utm_source=github-nextjs-starter)


🌍 *[English](README.md) ∙ [简体中文](README_zh.md) ∙ [日本語](README_ja.md)*

# Next.js Starter - Multilingual Next.js 16 Starter

A feature-rich Next.js 16 multilingual starter template to help you quickly build globally-ready websites.

- [👉 Source Code](https://github.com/weijunext/nextjs-starter)
- [👉 Live Demo](https://nextjsstarter.io/)

**🚀 Looking for a full-featured SaaS Starter Template? [Check out the complete version](https://nexty.dev)**

## ✨ Features

- 🌐 Built-in i18n support (English, Chinese, Japanese)
- 🎨 Modern UI design with Tailwind CSS
- 🌙 Dark/Light theme toggle
- 📱 Responsive layout
- 📝 MDX blog system 
- 🔍 SEO optimization
- 📊 Integrated analytics tools
  - Google Analytics
  - Baidu Analytics
  - Google Adsense
  - Vercel Analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 20.9 or higher
- pnpm 9.0 or higher (recommended)

> **Note**: The project has configured `packageManager` field, we recommend using pnpm for the best experience.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/weijunext/nextjs-starter.git
cd nextjs-starter
```

2. Enable Corepack (recommended):
```bash
corepack enable
```

3. Install dependencies:
```bash
pnpm install
# or use other package managers
npm install
yarn
```

4. Copy environment variables:
```bash
cp .env.example .env
```

5. Start the development server:
```bash
pnpm dev
# or npm run dev
```

Visit http://localhost:3000 to view your application.

## ⚙️ Configuration

1. Basic Setup
   - Edit `config/site.ts` for website information
   - Update icons and logo in `public/`
   - Configure `app/sitemap.ts` for sitemap
   - Update `app/robots.ts` for robots.txt

2. i18n Setup
   - Add/modify language files in `i18n/messages/`
   - Configure supported languages in `i18n/routing.ts`
   - Set up i18n routing in `middleware.ts`
   - Create pages under `app/[locale]/`
   - Use the `Link` component from `i18n/routing.ts` instead of Next.js default

## 📝 Content Management

### Blog Posts
Create MDX files in `blog/[locale]` with the following format:

```markdown
---
title: Post Title
description: Post Description
image: /image.png
slug: /url-path
tags: tag1,tag2
date: 2025-02-20
visible: published
pin: true
---

Post content...
```

Reference `types/blog.ts` for supported fields.

### Static Pages
Manage static page content in `content/[page]/[locale].mdx`.

## 🔍 SEO Optimization

Built-in comprehensive SEO features:
   - Server-side rendering and static generation
   - Automatic sitemap.xml generation
   - robots.txt configuration
   - Optimized metadata
   - Open Graph support
   - Multilingual SEO support

## 📊 Analytics

Enable analytics by adding IDs in `.env`:
```
NEXT_PUBLIC_GOOGLE_ANALYTICS=
NEXT_PUBLIC_BAIDU_TONGJI=
NEXT_PUBLIC_GOOGLE_ADSENSE=
```

## 📁 Project Structure

```
nextjs-starter/
├── app/                      # App directory
│   ├── [locale]/            # Internationalized routes
│   │   ├── about/           # About page
│   │   ├── blog/           # Blog pages
│   │   └── ...              # Other pages
│   ├── api/                 # API routes
│   └── globals/             # Global components
├── blog/                   # Blog content (MDX)
│   ├── en/                  # English blog
│   ├── ja/                  # Japanese blog
│   └── zh/                  # Chinese blog
├── components/              # Reusable components
│   ├── ui/                  # Base UI components
│   ├── header/              # Header components
│   ├── footer/              # Footer components
│   └── ...                  # Other components
├── config/                  # Configuration files
├── content/                 # Static content (MDX)
├── i18n/                    # Internationalization
│   ├── messages/            # Translation files
│   ├── routing.ts           # Routing configuration
│   └── request.ts           # Request configuration
├── lib/                     # Utility functions
├── public/                  # Static assets
└── types/                   # Type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Internationalization**: next-intl
- **Content**: MDX
- **State Management**: Zustand
- **Deployment**: Vercel
- **Package Manager**: pnpm (recommended)

## 🚀 Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/weijunext/nextjs-starter&project-name=&repository-name=nextjs-starter&demo-title=NextjsStarter&demo-description=Nextjs%2015%20starter.&demo-url=https://nextjsstarter.io&demo-image=https://nextjsstarter.io/og.png)

### Manual Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Manual Deployment to Cloudflare Workers

The project is wired for [Cloudflare Workers](https://developers.cloudflare.com/workers/) via the
[OpenNext adapter](https://opennext.js.org/cloudflare) (`wrangler.toml` + `open-next.config.ts`).

**Prerequisites:**

1. A Cloudflare account. Create an API token with **Workers Scripts: Edit** permission
   (Dashboard → My Profile → API Tokens) and note your Account ID.
2. A D1 database for submissions / waitlist / showcase: create it in the dashboard
   (Workers & Pages → D1 SQL), then replace `database_id` in `wrangler.toml` with
   the real UUID.
3. Configure runtime env vars for the Worker (see `.dev.vars.example`): set them as
   wrangler secrets with `pnpm dlx wrangler secret put <NAME>` for secrets, or in
   `wrangler.toml` `[vars]` for non-secret values.

**D1 migrations:**

```bash
pnpm db:migrate:local   # applies migrations/ to the local SQLite (.wrangler/state)
pnpm db:migrate:remote  # applies migrations/ to the production D1 database
```

**R2 download assets (trial builds, press kit, docs):**

For production, create an R2 bucket named `nextjs-starter-assets` in the
dashboard (binding is already configured in `wrangler.toml`; local dev uses
automatic emulation). Then set `ASSET_UPLOAD_SECRET` (wrangler secret) and:

```bash
# Upload (admin only, Bearer secret required)
curl -X POST http://localhost:8787/api/assets \
  -H "Authorization: Bearer $ASSET_UPLOAD_SECRET" \
  -F "file=@./press-kit.pdf"

# List uploaded assets
curl -H "Authorization: Bearer $ASSET_UPLOAD_SECRET" \
  http://localhost:8787/api/assets

# Download (public)
curl http://localhost:8787/api/download/assets/press-kit.pdf
```

Manual upload via wrangler also works:
`pnpm dlx wrangler r2 object put nextjs-starter-assets/assets/foo.pdf --file=./foo.pdf`

**Local preview (workerd runtime):**

```bash
pnpm build:worker   # next build + OpenNext transform into .open-next/
pnpm preview:worker # wrangler dev against the built worker
```

**Deploy:**

```bash
pnpm deploy:worker  # build + wrangler deploy
```

Or push to `main` — the GitHub Actions workflow in `.github/workflows/deploy.yml` builds,
lints and deploys automatically. Add repo secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` first.

## 💡 Development Best Practices

### Package Manager

- Project configured with `packageManager: "pnpm@10.12.4"`
- Enable Corepack: `corepack enable`
- Team members should use the same pnpm version

### Code Quality

```bash
# Lint code
pnpm lint

# Type checking
pnpm type-check
```

### Internationalization Development

1. Adding new language support:
   - Add new language files in `i18n/messages/`
   - Update `i18n/routing.ts` configuration
   - Create corresponding language directories in `blog/` and `content/`

2. Using translations:
```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

## 🔧 Troubleshooting

### Common Issues

**1. Package manager version mismatch**
```bash
# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml
# Reinstall
pnpm install
```

**2. MDX files not displaying**
- Check file path is correct
- Verify frontmatter format
- Ensure `visible` field is set to `published`

**3. Internationalization routing issues**
- Use `Link` component from `i18n/routing.ts`
- Check `middleware.ts` configuration

**4. Styles not working**
- Verify Tailwind CSS class names are correct
- Try restarting development server

### Environment Variables

Ensure `.env` file contains necessary configuration:
```bash
# Copy example config
cp .env.example .env
# Modify as needed
```

## 📄 License

MIT

## 🤝 Contributing

Issues and Pull Requests are welcome!

## About the Author

Next.js full-stack specialist providing expert services in project development, performance optimization, and SEO improvement.

For consulting and training opportunities, reach out at weijunext@gmail.com

- [Github](https://github.com/weijunext)
- [Bento](https://bento.me/weijunext)
- [Twitter/X](https://twitter.com/judewei_dev)

<a href="https://www.buymeacoffee.com/weijunext" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G6TWWMG)
