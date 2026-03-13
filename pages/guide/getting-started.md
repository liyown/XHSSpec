# 快速开始

这份指南的目标不是教你记命令。

它的目标是让你在 3 分钟内明白一件事：

**XHSSpec 的正确使用方式，是在 AI 工具里用 slash command 开始创作。**

CLI 只负责初始化和确定性动作。
真正的前台入口，是 Claude Code、Codex、Cursor、VS Code 里的 agent。

---

## 先理解一件事

如果你把 XHSSpec 当成一个 CLI 工具来用，你会觉得它有点重。

如果你把它当成一个装进 AI coding tool 里的内容运营系统来用，它就会非常顺。

所以推荐心智是：

```text
我负责说目标
AI 负责推进 workflow
repo 负责保存资产
```

---

## 第 1 步：初始化你的工作空间

在你准备做内容的目录里执行一次：

```bash
xhs-spec init --tools claude-code
```

如果你主要用 Codex / Cursor / VS Code：

```bash
xhs-spec init --tools codex,cursor,vscode
```

执行完之后，XHSSpec 会帮你做好两类东西：

### 1. repo 资产

- `.xhsspec/brand/`
- `.xhsspec/strategy/`
- `.xhsspec/specs/`
- `.xhsspec/prompts/`
- `.xhsspec/commands/`
- `.xhsspec/knowledge/`

### 2. 工具集成

- `CLAUDE.md`
- `SKILL.md`
- `AGENTS.md`
- `.cursor/`
- `.vscode/`

你不需要自己手装 skill。
`init` 已经把“这个 repo 应该怎么被 agent 使用”一起装好了。

---

## 第 2 步：先把品牌定位补到能用

第一次使用之前，至少补这 5 个文件：

- `.xhsspec/brand/profile.md`
- `.xhsspec/brand/audience.md`
- `.xhsspec/brand/offer.md`
- `.xhsspec/brand/tone.md`
- `.xhsspec/brand/taboo.md`

为什么这一步不能省？

因为如果品牌上下文是空的，AI 写出来的东西只会是“看起来像内容”，不是“像你的内容”。

你不需要一开始写得特别完整。
只要能回答这几个问题就够：

- 我是谁？
- 我写给谁看？
- 我提供什么价值？
- 我说话是什么感觉？
- 我不想写什么？

---

## 第 3 步：回到 AI 工具里，真正开始

从现在开始，你不该围着 CLI 转。

你应该回到你的 AI 工具里，直接发起工作流。

### 如果你想先写一篇

在 Claude Code / Codex / Cursor 里说：

```text
/xhs:quick

写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手。
```

### 如果你想先判断一个热点

```text
/xhs:hot

帮我判断这个热点值不值得写：
OpenClaw / 个人 AI 助手。
```

### 如果你想做一个系列

```text
/xhs:plan

帮我做一个 3 篇系列：
主题是 AI workflow，不只是 prompt。
```

---

## AI 会帮你做什么

你发起 slash command 之后，agent 应该会：

1. 读取 `.xhsspec/brand/*`
2. 读取 `.xhsspec/strategy/*`
3. 读取当前 workflow 对应的 command / prompt / spec
4. 创建或继续正确的 run
5. 写入相应 artifacts
6. 告诉你下一步该 review、publish 还是 archive

换句话说，**你看到的应该是一条工作流，不是一段随手对话。**

---

## 第一次推荐你这样用

如果你是第一次上手，我建议你走这条最短路径：

```text
init
  -> 填 brand
  -> /xhs:quick
  -> /xhs:review
  -> /xhs:publish
  -> /xhs:archive
```

为什么先从 Quick 开始？

因为这条线最短，也最容易让你感受到 XHSSpec 的核心价值：

- AI 不只是写草稿
- 它还会产生 review
- 会给你 publish package
- 会留下可归档的知识

---

## 你会在 repo 里看到什么

如果你走一轮 Quick，大概会留下这些：

```text
.xhsspec/quick/<run-id>/
  brief.md
  draft.md
  review.md
  retrospective.md

publish/<date>/<run-id>-<title>/
  note.md
  first-screen.md
  visual-plan.md
  demo.html
  posting-guide.md
  post-meta.yaml
```

这就是 XHSSpec 和普通 AI 聊天最大的差别。

你留下来的不是“一段对话”。
你留下来的是“一套以后还能继续用的资产”。

---

## 如果你只记住一件事

请记住这一句：

**XHSSpec 最适合的用法，不是你手敲很多命令，而是你在 AI 工具里发起 slash command，让 agent 带着你走完整个流程。**

下一步建议直接看：

- [第一次完整运行](/guide/first-run)
- [Claude Code 集成](/integrations/claude-code)
- [Codex / Cursor / VS Code 集成](/integrations/codex-cursor-vscode)
