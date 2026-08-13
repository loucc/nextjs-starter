---
使用 Nexty 加速 SaaS 开发 - 唯一一个集成可视化定价面板、AI 开发环境和企业级 CMS 的 Next.js 模板，还包含多语言支持、身份验证、支付系统、电子邮件功能和 SEO 优化。

立即体验 [NEXTY.DEV](https://nexty.dev/?utm_source=github-nextjs-starter)
---

[<img src="/public/try-nexty.webp">](https://nexty.dev/?utm_source=github-nextjs-starter)

🌍 *[English](README.md) ∙ [简体中文](README_zh.md) ∙ [日本语](README_ja.md)*

# Next.js Starter - 多语言 Next.js 16 启动模板

一个轻量的 Next.js 16 多语言启动模板，帮助你快速构建面向全球的网站。

- [👉 源码地址](https://github.com/weijunext/nextjs-starter)
- [👉 在线预览](https://nextjsstarter.io/)

**🚀 如果你正在寻找功能完备的全栈启动模板，请了解我们的[高级版](https://nexty.dev/?utm_source=github-nextjs-starter)**

## ✨ 特性

- 🌐 内置多语言支持 (中文、英文、日语)
- 🎨 基于 Tailwind CSS 的现代 UI 设计
- 🌙 深色/浅色主题切换
- 📱 响应式布局
- 📝 MDX 博客系统
- 🔍 SEO 优化
- 📊 集成多个统计分析工具
  - Google Analytics
  - Baidu Analytics
  - Google Adsense
  - Vercel Analytics

## 🚀 快速开始

### 环境要求

- Node.js 20.9 或更高版本
- pnpm 9.0 或更高版本（推荐）

> **注意**: 项目已配置 `packageManager` 字段，推荐使用 pnpm 以获得最佳体验。

### 安装步骤

1. 克隆项目:
```bash
git clone https://github.com/weijunext/nextjs-starter.git
cd nextjs-starter
```

2. 启用 Corepack (推荐):
```bash
corepack enable
```

3. 安装依赖:
```bash
pnpm install
# 或使用其他包管理器
npm install
yarn
```

4. 复制环境变量文件:
```bash
cp .env.example .env
```

5. 启动开发服务器:
```bash
pnpm dev
# 或 npm run dev
```

访问 http://localhost:3000 查看你的应用。

## ⚙️ 配置

1. 基础配置
   - 修改 `config/site.ts` 配置网站信息
   - 修改 `public/` 下的图标和 logo
   - 更新 `app/sitemap.ts` 配置站点地图
   - 更新 `app/robots.ts` 配置 robots.txt

2. 多语言配置
   - 在 `i18n/messages/` 下添加或修改语言文件
   - 在 `i18n/routing.ts` 中配置支持的语言
   - 在 `middleware.ts` 中配置多语言路由
   - 在 `app/[locale]/` 目录下创建页面
   - 多语言页面使用 `i18n/routing.ts` 导出的 `Link` 组件替代 next.js 的

## 📝 内容管理

### 博客文章
在 `blog/[locale]` 目录下创建 MDX 文件，支持以下格式:

```markdown
---
title: 文章标题
description: 文章描述
image: /image.png
slug: /url-path
tags: tag1,tag2
date: 2025-02-20
visible: published
pin: true
---

文章内容...
```

可参考类型定义 `types/blog.ts` 确认支持的字段。

### 静态页面
在 `content/[page]/[locale].mdx` 下管理静态页面内容。

## 🔍 SEO 优化

模板内置了完整的 SEO 优化方案:
   - 服务端渲染和静态生成
   - 自动生成 sitemap.xml
   - 配置 robots.txt
   - 优化的 metadata
   - 支持 Open Graph
   - 多语言 SEO 支持

## 📊 统计分析

在 `.env` 文件中配置相应的 ID 即可启用:
```
NEXT_PUBLIC_GOOGLE_ANALYTICS=
NEXT_PUBLIC_BAIDU_TONGJI=
NEXT_PUBLIC_GOOGLE_ADSENSE=
```

## 📁 项目结构

```
nextjs-starter/
├── app/                      # 应用路由目录
│   ├── [locale]/            # 多语言路由
│   │   ├── about/           # 关于页面
│   │   ├── blog/           # 博客页面
│   │   └── ...              # 其他页面
│   ├── api/                 # API 路由
│   └── globals/             # 全局组件
├── blog/                   # 博客内容 (MDX)
│   ├── en/                  # 英文博客
│   ├── ja/                  # 日文博客
│   └── zh/                  # 中文博客
├── components/              # 可复用组件
│   ├── ui/                  # 基础 UI 组件
│   ├── header/              # 头部组件
│   ├── footer/              # 底部组件
│   └── ...                  # 其他组件
├── config/                  # 配置文件
├── content/                 # 静态内容 (MDX)
├── i18n/                    # 国际化配置
│   ├── messages/            # 翻译文件
│   ├── routing.ts           # 路由配置
│   └── request.ts           # 请求配置
├── lib/                     # 工具函数
├── public/                  # 静态资源
└── types/                   # 类型定义
```

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + Shadcn/ui
- **国际化**: next-intl
- **内容**: MDX
- **状态管理**: Zustand
- **部署**: Vercel
- **包管理器**: pnpm (推荐)


## 🚀 部署

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/weijunext/nextjs-starter&project-name=&repository-name=nextjs-starter&demo-title=NextjsStarter&demo-description=Nextjs%2015%20starter.&demo-url=https://nextjsstarter.io&demo-image=https://nextjsstarter.io/og.png)

### 手动部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 其他平台部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 部署到 Cloudflare Workers

项目已通过 [OpenNext 适配器](https://opennext.js.org/cloudflare) 接入
[Cloudflare Workers](https://developers.cloudflare.com/workers/)(`wrangler.toml` + `open-next.config.ts`)。

**前置条件:**

1. Cloudflare 账号:创建具有 **Workers Scripts: Edit** 权限的 API Token(控制台 → 我的个人资料 → API Tokens),并记录 Account ID。
2. D1 数据库(submission / waitlist / showcase 数据):在控制台(Workers & Pages → D1 SQL)创建,并将 `wrangler.toml` 中的 `database_id` 替换为真实 UUID。
3. Worker 运行时环境变量见 `.dev.vars.example`:密钥用 `pnpm dlx wrangler secret put <NAME>` 配置,非敏感变量写在 `wrangler.toml` 的 `[vars]` 中。

**D1 迁移:**

```bash
pnpm db:migrate:local   # 将 migrations/ 应用到本地 SQLite(.wrangler/state)
pnpm db:migrate:remote  # 将 migrations/ 应用到生产 D1 数据库
```

**本地预览(workerd 运行时):**

```bash
pnpm build:worker   # next build + OpenNext 转换,产物在 .open-next/
pnpm preview:worker # 基于构建产物的 wrangler dev
```

**部署:**

```bash
pnpm deploy:worker  # 构建 + wrangler deploy
```

或推送 `main` 分支:`.github/workflows/deploy.yml` 会自动 lint、构建并部署,
需先在仓库添加 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 两个 secrets。

## 💡 开发最佳实践

### 包管理器使用

- 项目已配置 `packageManager: "pnpm@10.12.4"`
- 建议启用 Corepack: `corepack enable`
- 团队成员应使用相同版本的 pnpm

### 代码规范

```bash
# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

### 多语言开发

1. 新增语言支持：
   - 在 `i18n/messages/` 添加新的语言文件
   - 更新 `i18n/routing.ts` 配置
   - 在 `blog/` 和 `content/` 下创建对应语言目录

2. 使用翻译：
```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

## 🔧 故障排除

### 常见问题

**1. 包管理器版本不一致**
```bash
# 删除 node_modules 和 lockfile
rm -rf node_modules pnpm-lock.yaml
# 重新安装
pnpm install
```

**2. MDX 文件不显示**
- 检查文件路径是否正确
- 确认 frontmatter 格式正确
- 检查 `visible` 字段是否设置为 `published`

**3. 多语言路由问题**
- 确保使用 `i18n/routing.ts` 中的 `Link` 组件
- 检查 `middleware.ts` 配置

**4. 样式不生效**
- 确认 Tailwind CSS 类名拼写正确
- 检查是否需要重启开发服务器

### 环境变量问题

确保 `.env` 文件包含必要的配置：
```bash
# 复制示例配置
cp .env.example .env
# 根据需要修改配置
```


## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 关于作者

专注于 Next.js 全栈开发，欢迎探讨开发、咨询与培训等合作机会，联系微信：bigye_chengpu

- [Github](https://github.com/weijunext)
- [Twitter/X](https://twitter.com/weijunext)
- [博客 - J实验室](https://weijunext.com)
- [Medium](https://medium.com/@weijunext)
- [掘金](https://juejin.cn/user/26044008768029)
- [知乎](https://www.zhihu.com/people/mo-mo-mo-89-12-11)

<a href="https://www.buymeacoffee.com/weijunext" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G6TWWMG)

<img src="./public/zs.jpeg" alt="赞赏作者" style="height: 200px; width: 200px">


