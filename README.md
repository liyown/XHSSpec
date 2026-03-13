# XHSSpec

> Spec-driven Xiaohongshu ops for coding tools.
> 在 Claude Code、Codex、Cursor、VS Code 这类 AI 编码环境里，用 slash command 跑完整个小红书内容工作流。

<p align="center">
  <img src="./assets/index.png" alt="XHSSpec cover" width="960" />
</p>

<p>
  <a href="https://github.com/liyown/XHSSpec">GitHub</a> ·
  <a href="https://liyown.github.io/XHSSpec/">Docs</a> ·
  <a href="https://www.npmjs.com/package/xhs-spec">npm</a>
</p>

---

## What Is XHSSpec

XHSSpec 不是自动发帖工具，不是内容后台，也不是“帮你写一篇爆文”的 prompt 套壳。

它更像一个运行在 AI 编码工具里的内容操作系统：

- 用 `spec` 约束内容标准
- 用 `workflow` 管理创作过程
- 用 repo 文件保存品牌、策略、草稿、复盘
- 用 agent 做理解、写作、审稿、归档学习

一句话说：

**XHSSpec 把小红书运营，从一次次临时对话，变成一个可执行、可复用、可版本化的内容系统。**

---

## Why This Exists

很多技术人做内容，卡的不是“不会写字”，而是没有系统。

常见状态是：

- 每次写内容都从头开始
- AI 每次都要重新解释背景
- 热点来了不知道该不该跟
- 写完就散，经验没有沉淀
- 下次继续写，还是重复踩坑

你会发现，内容团队最稀缺的不是灵感，而是：

- 稳定的判断标准
- 可复用的创作流程
- 能回流的复盘资产

XHSSpec 解决的就是这个问题。

它不是让 AI 替你发内容，而是让 AI 在你的工作流里干活。

---

## What It Feels Like

和写代码一样，在自己熟悉的 AI 工具里直接说：

```text
/xhs:quick

帮我写一篇：
主题是“为什么团队不该继续把 AI 当临时写手”
```

然后 agent 会在 repo 里完成这些事：

- 读取品牌和策略上下文
- 生成 brief
- 写 draft
- 做 review
- 生成 publish package
- 把经验写回 knowledge

你看到的不是一段聊天记录，而是一套真实落盘的产物。

---

## Core Ideas

### 1. Repo-first

长期知识不放在聊天里，放在 repo 里：

- `.xhsspec/brand/`
- `.xhsspec/strategy/`
- `.xhsspec/specs/`
- `.xhsspec/knowledge/`

### 2. Agent-first

真正需要判断和表达的部分交给 agent：

- 品牌理解
- 选题和 angle 提炼
- 草稿创作
- 审稿
- 复盘总结

### 3. Spec-driven

每次创作都不是自由漂移，而是基于已有规范工作：

- note spec
- review spec
- trend spec
- publish spec

### 4. Workflow, not prompts

XHSSpec 不强调“一个神奇 prompt”。

它强调：

`plan -> draft -> review -> publish -> archive`

或者：

`hot -> fit-check -> draft -> review -> publish`

---

## Workflows

### Quick

适合：

- 临时有个想法
- 想快速写一篇
- 不想先开完整 campaign

入口：

```text
/xhs:quick
```

产物：

- `brief.md`
- `draft.md`
- `review.md`
- `retrospective.md`

### Trend

适合：

- 跟热点
- 借势表达
- 先判断适不适合品牌

入口：

```text
/xhs:hot
```

关键区别：

- 先做 `fit-check`
- 不适合可以直接 drop
- 不强迫每个热点都硬写

### Campaign

适合：

- 周/月主题规划
- 多篇系列内容
- 多轮实验

入口：

```text
/xhs:plan
```

产物：

- `proposal.md`
- `brief.md`
- `tasks.md`
- `drafts/`
- `reviews/`
- `retrospective.md`

---

## Publish Package

XHSSpec 不把“终稿完成”当成流程结束。

在真实运营里，终稿只是进入发布阶段。

所以 publish 阶段会把 final draft 继续加工成一组可用发布产物，落到 repo 根目录：

```text
publish/<date>/<run-id>-<title>/
```

里面包括：

- `note.md`
- `cover-brief.md`
- `assets.md`
- `demo.html`
- `publish-guide.md`
- `package.yaml`

这里的 `demo.html` 不是普通预览页。

它是一个可截图的演示稿，你可以把其中的页面结构直接截图，作为封面草案、图文卡片、说明页素材。

---

## How You Actually Use It

用户不应该围着 CLI 生活。

CLI 是 backend engine，真正的前台入口是你在 AI 工具里说的话。

推荐使用方式：

### Claude Code

```bash
xhs-spec init --tools claude-code
```

然后在 Claude Code 里直接用：

```text
/xhs:quick
/xhs:hot
/xhs:plan
/xhs:review
/xhs:rewrite
/xhs:publish
/xhs:archive
```

### Codex

```bash
xhs-spec init --tools codex
```

然后让 Codex 按 repo 里的 `AGENTS.md`、`.xhsspec/commands/*.md`、`.xhsspec/prompts/*.md` 工作。

### Cursor / VS Code

```bash
xhs-spec init --tools cursor,vscode
```

初始化后会生成对应宿主的命令和规则文件，agent 会自动读取 `.xhsspec/` 工作区资产。

---

## Quick Start

### 1. Install

```bash
npm install -g xhs-spec
```

或者：

```bash
npx xhs-spec init --tools claude-code
```

### 2. Initialize

```bash
xhs-spec init --tools claude-code
```

这会创建：

- `.xhsspec/`
- 宿主集成文件，例如 `CLAUDE.md` 或 `AGENTS.md`
- specs / commands / prompts / templates

### 3. Fill your minimum brand context

至少先补这些文件：

- `.xhsspec/brand/profile.md`
- `.xhsspec/brand/audience.md`
- `.xhsspec/brand/offer.md`
- `.xhsspec/brand/tone.md`
- `.xhsspec/brand/taboo.md`

### 4. Start creating

在 AI 工具里说：

```text
/xhs:quick

帮我写一篇：
主题是“程序员为什么应该把内容系统做成 repo”
```

### 5. Continue the loop

```text
/xhs:review
/xhs:rewrite
/xhs:publish
/xhs:archive
```

---

## Example Paths

### Path 1: One quick note

```text
/xhs:quick
  -> brief
  -> draft
  -> /xhs:review
  -> /xhs:rewrite
  -> /xhs:publish
  -> /xhs:archive
```

### Path 2: React to a trend

```text
/xhs:hot
  -> fit-check
  -> approved or dropped
  -> draft
  -> review
  -> publish
  -> archive
```

### Path 3: Plan a series

```text
/xhs:plan
  -> proposal
  -> brief
  -> tasks
  -> note-01 / note-02 / note-03
  -> review each note
  -> publish
  -> archive
```

---

## Repo Layout

```text
.xhsspec/
  brand/
  strategy/
  specs/
  commands/
  prompts/
  campaigns/
  quick/
  trends/
  knowledge/
  templates/

publish/
  2026-03-13/
    quick-001-your-title/
```

原则很简单：

- `.xhsspec/` 是系统工作区
- `publish/` 是给人看的最终发布包

---

## Why Teams Like It

如果你只是想临时让 AI 帮你写一篇，市面上工具很多。

XHSSpec 更适合这些人：

- 想认真做技术内容的人
- 做品牌化表达的独立创作者
- 小红书代运营团队
- 内容策略团队
- 已经在用 Claude Code / Codex / Cursor 的增长团队

因为它解决的是“可持续”问题：

- 新成员接手时有上下文
- 每次内容动作都有迹可循
- 经验不会只存在于某个同事脑子里
- agent 不会每次都从零理解品牌

---

## State and Gates

XHSSpec 不是随便跳步骤的 prompt 工具。

它有明确 gate：

- brand 没完成，不能开始创作
- 上一步 artifact 还有 `<placeholder>...</placeholder>`，不能进下一步
- fit-check 没完成，trend 不能 draft
- review 没完成，不能 iterate
- final draft 和 review 没完成，不能 publish

这不是为了增加负担，而是为了防止流程草草了事。

---

## Documentation

更完整的文档在 `pages/`，并通过 VitePress 打包。

本地查看：

```bash
bun install
bun run docs:dev
```

构建文档：

```bash
bun run docs:build
```

---

## Development

安装依赖：

```bash
bun install
```

运行测试：

```bash
bun test
```

构建 CLI：

```bash
bun run build
```

本地直接运行：

```bash
bun run src/cli.ts help
```

---

## Philosophy

XHSSpec 不相信“多聊几轮，AI 总会写对”。

它相信的是另一件事：

**好的内容运营，应该像好的工程系统一样，可以积累、可以复用、可以复盘、可以迭代。**

如果你也想把内容从“随机发挥”做成“长期资产”，那这个项目就是为你准备的。
