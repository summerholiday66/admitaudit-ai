# CLAUDE.md

## 项目定位

- 项目名：`admitaudit-ai`
- 品牌名：`AdmitAudit.ai`
- 这是一个面向国际学生的 AI 文书审计与逻辑优化工具。
- 核心卖点是 `Voice Preservation`：帮助用户优化文书表达、逻辑与感染力，但不代写整篇成稿。
- 当前阶段：MVP 初始化阶段。

## 技术架构

- 框架：`Next.js` App Router + `TypeScript` + `Tailwind CSS`
- 需要服务端逻辑：是
- 数据库与鉴权：`Supabase`（Google OAuth only）
- 支付：`PayPal` JavaScript SDK + server-side webhook
- AI：通过 OpenAI 兼容接口调用 `Claude 3.5 Sonnet`
- 部署目标：`Cloudflare Pages`
- Next.js 适配方式：优先按 `OpenNext` / `next-on-pages` 兼容部署设计

## 产品边界

- 不生成整篇申请文书成稿
- 不承诺录取结果
- 不做选校
- 不做推荐信代写
- 第一版重点支持：
- `Personal Statement`
- `Statement of Purpose`
- `UC PIQ`（可选支持）

## 核心功能

- 文书输入与保存
- 招生官维度评分
- 段落级诊断
- AI 痕迹风险提示
- 段落级重写建议
- Pay-per-essay 解锁完整报告

## 目录规则

- `app/`：Next.js 页面、路由、Server Actions
- `components/`：通用 UI 组件与页面模块
- `lib/ai/`：提示词、结构化输出 schema、AI 调用封装
- `lib/payments/`：PayPal 客户端逻辑与订单状态处理
- `lib/supabase/`：Supabase client、server helpers
- `references/`：文书分析参考材料、成功范文研究素材
- `workers/`：Cloudflare Worker 相关 webhook 代码
- `docs/`：产品文档、API 约定、数据流说明
- `public/`：静态资源

## 开发约束

- 界面文案默认使用英文。
- 所有 AI 输出必须经过结构化 schema 约束，不直接渲染自由文本长回复。
- 文书反馈必须强调 `feedback`, `revision`, `clarity`, `structure`, `authenticity`，避免使用 ghostwriting 语义。
- 不在仓库内写入真实 secrets。
- 环境变量只记录变量名和 secret 来源路径，不记录真实值。
- 当前标准 secret 来源路径：`/root/.openclaw/secrets/credentials.env`
- 涉及支付、鉴权、数据库 schema 的改动，先明确影响范围再动手。
- 优先保持 Cloudflare Pages 兼容性，避免依赖不兼容 Node 运行时能力。

## 验证要求

- 安装依赖后至少验证：
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- 如果新增支付或 AI 流程，补充对应的本地联调说明。
- 只有在关键页面可访问、类型检查通过、构建通过时，才算初始化完成。
