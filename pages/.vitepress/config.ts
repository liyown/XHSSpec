import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "XHSSpec",
  description: "在 Claude Code、Codex、Cursor、VS Code 里，把小红书运营变成一个可复用、可归档、可续写的内容系统。",
  lang: "zh-CN",
  base: "/XHSSpec/",
  cleanUrls: true,
  outDir: "../.site",
  buildEnd(siteConfig) {
    writeFileSync(join(siteConfig.outDir, ".nojekyll"), "");
  },
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "为什么用它", link: "/concepts/why-xhs-spec" },
      { text: "适合谁", link: "/use-cases" },
      { text: "示例", link: "/examples" },
      { text: "工作流", link: "/workflows/quick" },
      { text: "集成", link: "/integrations/claude-code" },
    ],
    sidebar: [
      {
        text: "开始使用",
        items: [
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "第一次完整运行", link: "/guide/first-run" },
        ],
      },
      {
        text: "理解 XHSSpec",
        items: [
          { text: "为什么做这个", link: "/concepts/why-xhs-spec" },
          { text: "核心模型", link: "/concepts/core-model" },
          { text: "谁适合用", link: "/use-cases" },
          { text: "真实示例", link: "/examples" },
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
        text: "参考资料",
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
