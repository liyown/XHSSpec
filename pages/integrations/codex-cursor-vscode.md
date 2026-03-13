# Codex / Cursor / VS Code 集成

XHSSpec 不是只为某一个工具做的。

它的核心策略是：

**把 workflow 放进 repo，把具体执行交给 agent。**

这意味着只要一个 AI 工具能：

- 读 repo
- 写文件
- 按指令工作

它就能接入 XHSSpec。

---

## 先说一句最重要的话

不管你用 Codex、Cursor 还是 VS Code，**用户的正确体验都不该是“背 CLI 命令”**。

CLI 只负责：

- `init`
- 状态推进
- 校验
- publish / archive 这些确定性动作

真正的创作入口，依然应该是：

- `/xhs:quick`
- `/xhs:hot`
- `/xhs:plan`
- `/xhs:review`
- `/xhs:rewrite`
- `/xhs:publish`
- `/xhs:archive`

---

## 初始化方式

### Codex

```bash
xhs-spec init --tools codex
```

### Cursor

```bash
xhs-spec init --tools cursor
```

### VS Code

```bash
xhs-spec init --tools vscode
```

### 一次性装多个

```bash
xhs-spec init --tools codex,cursor,vscode
```

所有工具都会共享同一套 `.xhsspec/` 资产。

---

## Codex

Codex 的接入核心是：

- `AGENTS.md`
- `.xhsspec/commands/*.md`
- `.xhsspec/prompts/*.md`

正确用法不是让用户一直敲：

```bash
xhs-spec quick ...
```

而是让 Codex 按 repo 协议执行，例如：

```text
/xhs:quick

写一篇给程序员的内容：
为什么团队不该继续把 AI 当临时写手。
```

或者：

```text
/xhs:publish

把这篇内容变成一个可直接交付的发布包。
```

### 你应该期待 Codex 做什么

- 读取 `AGENTS.md`
- 读取当前 workflow 对应的 command / prompt / spec
- 写回 artifact
- 被 gate 卡住时先回填，而不是跳步骤

---

## Cursor

Cursor 的体验通常会更接近“边聊边做”。

初始化后，Cursor 会有 repo 内规则和命令约束，agent 应该沿着这些工作。

推荐用法：

```text
/xhs:hot

这个热点适合我写吗？
如果适合，给我一个 draft 方向。
```

或者：

```text
/xhs:plan

帮我规划一个 3 篇系列：
主题是 AI workflow，不只是 prompt。
```

### 在 Cursor 里重点看什么

- 它会不会先读 brand / strategy
- 它会不会正确写回 repo
- 它会不会尊重 `<placeholder>...</placeholder>` gate
- 它会不会在 publish 前先把 review 收完整

---

## VS Code

VS Code 本身不是一个 agent 产品，但如果你在里面配合 AI 扩展使用，它依然可以跑 XHSSpec。

更准确地说：

- VS Code 提供的是工作区
- AI 扩展提供的是 agent 能力
- XHSSpec 提供的是 workflow 协议

所以在 VS Code 场景里，XHSSpec 更像“内容 ops runtime”。

如果你的 VS Code 当前没有合适的 agent 扩展，也可以先这样理解：

- `init` 把 repo 和集成准备好
- 之后在支持 agent 的工具里继续工作

---

## 三个工具的共同标准

不管哪个工具，正确体验都应该满足这 4 条：

### 1. 入口靠 slash command

而不是让用户自己拼 CLI 参数。

### 2. 内容必须写回 repo

不是只留在聊天记录里。

### 3. 被 gate 卡住时先回填

不是跳过流程继续往后生成。

### 4. publish 要产出真实发布包

不是只再给你一份 draft。

---

## 如果你是第一次选工具

我的建议很简单：

- 想要最顺手的 repo agent 体验：先用 Claude Code
- 想在现有 coding workflow 里顺手集成：用 Codex 或 Cursor
- 想把 repo 作为中心、工具只是入口：三者都可以

XHSSpec 的重点不是绑定某个工具。
重点是：**不管你在哪个工具里工作，内容 workflow 都是同一套。**
