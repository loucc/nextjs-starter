# 出海产品官网 — 项目分析

> 分析日期:2026-08-13
> 目标:基于 nextjs-starter(v2.2.0)搭建出海产品官网,结合 Cloudflare 生态(D1 / R2 / KV / Workers / Turnstile 等)

## 一、现状盘点(已有基础)

| 模块 | 状态 |
|---|---|
| 技术栈 | Next.js 16.1.1 + React 19 + Tailwind 3 + Radix UI |
| i18n | next-intl,en/zh/ja 三语,中间件路由 + hreflang alternates |
| SEO | metadata 构造器、sitemap、robots、静态 OG 图 |
| 博客 | MDX + gray-matter 三语 |
| 邮件 | Resend / Cloudflare Email(REST API)双 Provider + react-email 模板 |
| 订阅 | 订阅/退订 + 邮箱归一化(Gmail alias 处理)+ Upstash 限流 |
| 分析 | GA4 / 百度统计 / Plausible / Vercel Analytics / AdSense |

## 二、核心结论

当前是 **Vercel/Node 运行时架构,Cloudflare 生态集成几乎为零**:
- R2 仅在 `next.config.mjs` 有 remotePatterns 占位,无任何存储代码
- D1 / KV / Workers / Turnstile 完全未接入
- 无 wrangler.toml、无 @opennextjs/cloudflare 适配器、无 CI

## 三、缺失功能清单

### 🔴 P0 — 部署阻塞与运行时不兼容

1. 无 Cloudflare 部署配置(wrangler.toml / @opennextjs/cloudflare / .github CI)
2. `lib/logger.ts` 用 winston 写本地文件 → Workers 无文件系统,必崩。改 console + Logpush / Axiom / Baselime
3. `@vercel/analytics` 在 Cloudflare 无意义 → 换 Cloudflare Web Analytics / Zaraz
4. Upstash 为外部依赖 → 限流/订阅者可迁移到 D1/KV 自托管

### 🔴 P0 — 安全与反滥用

5. 无 Turnstile 人机验证(newsletter / submission 只靠 IP 限流,易绕过、误伤 NAT)
6. 无安全响应头(CSP / HSTS / X-Frame-Options)
7. 退订 token = base64(email),可伪造批量退订 → 需 HMAC 签名或 D1 随机 token
8. 表单无 honeypot

### 🔴 P0 — 出海合规(GDPR/CCPA)

9. 无 Cookie 同意横幅(GA/AdSense 未同意即加载)
10. 无 Double Opt-In(直接订阅进列表)
11. 隐私政策为模板内容,未覆盖数据处理方、存储位置、删除权

### 🟡 P1 — D1 数据层(完全缺失)

12. Product submission 只发邮件不落库 → 无法后台管理。D1 最自然切入点
13. Showcase 硬编码在 `components/home/Showcase.tsx` → D1 后可后台管理
14. 订阅者依赖 Resend contacts / Upstash;Cloudflare Email Provider 无 Redis 时静默丢弃联系人(`lib/audience.ts` none 分支)
15. 无 waitlist / contact form 落库 / 博客评论

### 🟡 P1 — 产品官网转化功能

16. 无 Pricing 页面(多币种、payment link)
17. 无 Changelog / Release Notes
18. 无 Case studies / Testimonials / Comparison pages
19. 无 Docs(MDX 基建已有)
20. 无站内搜索(D1 FTS5 或 Orama)

### 🟢 P2 — R2 及其他 Cloudflare 能力

21. R2 零实现(无 S3 SDK / presigned URL / 上传管线)。用途:博客配图、用户上传、动态 OG 缓存、下载资源、Cloudflare Image Optimization 源站
22. 无 KV 场景(缓存、feature flags、A/B 测试、会话)
23. 无独立 Workers(geo 重定向、价格本地化、edge 个性化)

### 🟢 P2 — SEO / 性能 / 工程化

24. 无 JSON-LD 结构化数据(Organization / SoftwareApplication / FAQPage)
25. 无 error.tsx / not-found.tsx / loading.tsx / global-error.tsx
26. OG 图为静态,无动态生成
27. 无测试(vitest/playwright)、无 CI、无 env schema 校验(zod 已装未用于 env)
28. 无错误追踪(Sentry)、无性能监控

## 四、风险提示

- **架构改造风险**:全部后端逻辑走 Node 运行时(winston fs、Buffer),迁 Cloudflare 需 OpenNext 适配器 + nodejs_compat,是最大一次性成本,建议先小规模验证
- **支付(SaaS 场景)**:出海倾向 Lemon Squeezy / Paddle(MoR 免全球税务),需预留 D1 + webhook 授权表
- **值得保留**:i18n 三语体系、metadata/hreflang、双邮件 Provider 是代码最扎实的部分

## 五、建议实施顺序

> **2026-08-13 进度:① OpenNext/Cloudflare 部署打通已完成**(Next 16.3 + @opennextjs/cloudflare 1.20,MDX 构建期编译,Tailwind 4,本地 workerd 预览全路由 200)。真实部署仍需 Cloudflare API Token(见 wrangler.toml / CI secrets)。

1. **① OpenNext/Cloudflare 部署打通** + logger 改造 + CI(先跑起来)
2. **② 合规底线**:Turnstile + 安全头 + token 签名 + Cookie 同意
3. **③ D1 第一个业务**:submission / waitlist / showcase 落库
4. **④ 按需推进**:R2、Pricing、搜索、Changelog、动态 OG、测试
