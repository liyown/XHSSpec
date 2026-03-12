import { defineConfig } from "vitepress";

export default defineConfig({
  title: "XHSOps",
  description: "小红书内容运营的正确打开方式 - 在 AI 工具里用 slash command 完成整个工作流",
  lang: "zh-CN",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "工作流", link: "/workflows/quick" },
      { text: "集成", link: "/integrations/claude-code" },
    ],
    sidebar: [
      {
        text: "指南",
        items: [
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "第一次完整运行", link: "/guide/first-run" },
        ],
      },
      {
        text: "核心概念",
        items: [
          { text: "为什么做这个", link: "/concepts/why-xhsops" },
          { text: "核心模型", link: "/concepts/core-model" },
        ],
      },
      {
        text: "工作流",
        items: [
          { text: "Quick - 快速笔记", link: "/workflows/quick" },
          { text: "Trend - 热点跟进", link: "/workflows/trend" },
          { text: "Campaign - 系列内容", link: "/workflows/campaign" },
          { text: "Publish - 发布包", link: "/workflows/publish" },
          { text: "状态流转图", link: "/workflows/state-machines" },
        ],
      },
      {
        text: "集成",
        items: [
          { text: "Claude Code", link: "/integrations/claude-code" },
          { text: "Cursor / Codex / VS Code", link: "/integrations/codex-cursor-vscode" },
        ],
      },
      {
        text: "参考",
        items: [
          { text: "CLI 命令", link: "/reference/cli" },
          { text: "项目结构", link: "/reference/repo-structure" },
          { text: "Spec / Command / Prompt", link: "/reference/spec-command-prompt" },
        ],
      },
      {
        text: "FAQ",
        items: [
          { text: "常见问题", link: "/faq/" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/" },
    ],
    search: {
      provider: "local",
    },
    outline: {
      level: [2, 3],
    },
  },
});
