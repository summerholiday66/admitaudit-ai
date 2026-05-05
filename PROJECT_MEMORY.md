# PROJECT_MEMORY.md

## 项目定位

- 项目名：`admitaudit-ai`
- 品牌名：`AdmitAudit.ai`
- 项目路径：`/root/.openclaw/workspace/project/admitaudit-ai`
- 仓库地址：未初始化
- 一句话定义：为国际学生提供申请文书审计、逻辑优化与保留原声重写建议的 AI 工具。

## 用户与范围

- 目标用户：申请美、英、港、新等高校的国际高中生与研究生
- 核心文书类型：
- `Personal Statement`
- `Statement of Purpose`
- `UC PIQ`（可选）
- 核心卖点：
- 比通用 AI 更懂招生官评分逻辑
- 比 Grammarly 更懂申请文书结构
- 比真人顾问更低价

## 产品边界

- 明确不做：
- 整篇代写
- 选校
- 推荐信代写
- 录取承诺
- MVP 必做：
- AI 痕迹检测
- 逻辑/叙事/具体性/契合度评分
- 段落级诊断
- 保留原意的两种改写建议

## 部署与访问

- 部署目标：`Cloudflare Pages`
- 兼容策略：`OpenNext` 或 `next-on-pages`
- 生产域名：待定
- 开发访问地址：待定
- 支付 webhook：计划由 `Cloudflare Worker` 处理

## 运行说明

- 包管理器：默认 `npm`
- 初始化阶段：仅完成项目骨架和规则文档
- 启动命令：待依赖安装后补充
- 后台运行命令：待补充
- 日志位置：待补充

## 技术架构

- 前端：`Next.js` App Router + `TypeScript` + `Tailwind CSS`
- 数据库：`Supabase PostgreSQL`
- 鉴权：`Supabase Auth`，仅 `Google OAuth`
- 支付：`PayPal` 单篇付费，预留 credits 套餐
- AI 模型：`Claude 3.5 Sonnet`
- AI 接入：OpenAI 兼容格式的中转 API

## 数据与流程

- 用户先登录
- 用户输入文书类型、题目和 draft
- 后端构造 system prompt
- AI 返回结构化 JSON 报告
- 免费用户可见总评分
- 付费后解锁完整诊断与段落改写建议

## 环境变量索引

- 不记录真实值
- 标准 secret 文件路径：`/root/.openclaw/secrets/credentials.env`
- 预计需要：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_COMPAT_BASE_URL`
- `OPENAI_COMPAT_API_KEY`
- `AI_MODEL_NAME`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`

## 仓库与部署约定

- 功能完成后创建独立 GitHub 仓库
- 仓库名默认与项目目录一致：`admitaudit-ai`
- 完成功能后接入 Cloudflare Pages 原生 GitHub 集成
- 部署配置与 secrets 注入优先从 `credentials.env` 映射，不在仓库内保存真实值

## 项目专属技术约束

- AI 输出必须是结构化 JSON
- 支付链路必须可校验订单状态，不能只依赖前端成功回调
- 文案与产品策略必须避免学术作弊导向
- 优先兼容 Cloudflare 部署运行时

## 当前状态

- 2026-05-05：完成项目立项信息确认，开始初始化目录结构与项目级文档。
