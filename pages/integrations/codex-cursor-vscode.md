# Codex / Cursor / VS Code 集成

不管你用哪个 AI 工具，核心原则不变：**你说话，AI 调 CLI。**

## 初始化

一次性初始化所有工具：

```bash
xhs-spec init --tools codex,cursor,vscode
```

或者只初始化特定工具：

```bash
xhs-spec init --tools cursor
```

## Codex

在 Codex 的对话界面直接使用 slash command：

```
/xhs:quick

主题：程序员的 AI 效率提升
```

或者用自然语言描述需求，Codex 会解析并调用相应命令。

## Cursor

在 Cursor 的 Chat 窗口输入：

```
/xhs:hot

话题：最新的 AI 产品动态
```

Cursor 会读取 `.xhsspec/` 配置，理解 XHSSpec 工作流，帮你完成从选题到发布的全流程。

## VS Code

VS Code 本身不直接支持 slash command，但可以通过以下方式使用：

1. **配合 AI 插件**（如 Cline）：在插件对话中使用 slash command
2. **终端直接运行**：

```bash
xhs-spec quick --idea "你的选题"
xhs-spec hot --topic "热点话题"
xhs-spec status --all
```

## 多工具共存

可以同时安装多个工具，初始化命令会自动检测并配置：

```bash
xhs-spec init --tools codex,cursor,vscode
```

每个工具会共享同一套 `.xhsspec/` 配置，数据和状态完全同步。

---

**记住**：在有 AI 助手的工具里，直接说话就行；在普通编辑器里，用终端命令。
