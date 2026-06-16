# 🌟 小学生满分作文助手

AI 驱动的作文辅导工具。输入作文标题，AI 自动生成调研问卷，引导补充写作关键信息，最终产出符合年级要求的满分范文，并支持 AI 批改打分。

## 功能流程

```
输入标题 → AI 生成问卷 → 填写问卷 → 流式生成范文 → AI 批改打分
```

- **智能问卷**：AI 分析标题涉及的写作得分维度，自动生成结构化问卷（每题 4 个选项）
- **流式生成**：范文逐段流式输出，实时可见，不用干等
- **多篇范文**：支持生成 1-3 篇风格各异的范文，Tab 切换查看
- **AI 批改**：从字数、素材、语句、情感、结构五个维度打分，给出逐段修改建议
- **状态持久化**：刷新页面不丢失，localStorage 自动保存

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **AI**：DeepSeek API（兼容 OpenAI SDK）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制 `.env.local` 并填入你的 DeepSeek API Key：

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 项目结构

```
├── app/
│   ├── page.tsx                 # 主页面（状态机 + 四个步骤）
│   ├── layout.tsx               # 根布局
│   ├── globals.css              # 全局样式
│   └── api/
│       ├── gen-survey/route.ts  # 生成问卷 API
│       ├── gen-essay/route.ts   # 流式生成范文 API (SSE)
│       └── score-essay/route.ts # 批改打分 API
├── components/
│   ├── TitleInput.tsx           # Step 1：标题输入
│   ├── SurveyForm.tsx           # Step 2：问卷填写
│   ├── EssayViewer.tsx          # Step 3：范文展示 + Tab
│   └── ScoreReport.tsx          # Step 4：批改报告
├── lib/
│   ├── ai.ts                    # DeepSeek 调用封装
│   └── prompts.ts               # Prompt 模板
└── types/
    └── index.ts                 # TypeScript 类型定义
```

## License

MIT