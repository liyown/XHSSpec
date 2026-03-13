# Claude Code 集成

如果你主要用 Claude Code，这会是 XHSSpec 最自然的使用方式。

因为 Claude Code 本来就擅长：

- 读取 repo
- 理解指令
- 写回文件
- 沿着流程继续推进

而 XHSSpec 正好把小红书运营拆成了可写回 repo 的 workflow。

---

## 先理解角色分工

在 Claude Code 里，XHSSpec 的正确分工是：

### 你

- 给目标
- 给方向
- 做取舍

### Claude

- 读 `.xhsspec/brand/*`
- 读 `.xhsspec/specs/*`
- 读 `.xhsspec/commands/*`
- 读 `.xhsspec/prompts/*`
- 写 brief / draft / review / publish package / archive

### CLI

- 初始化 repo
- 创建 run
- 校验状态
- 推进 deterministic 节点

所以你不应该把 Claude Code 当成“聊天工具”。
你应该把它当成“正在这个 repo 里执行内容 workflow 的 agent”。

---

## 初始化一次就够

```bash
xhs-spec init --tools claude-code
```

执行后你会得到：

- `.xhsspec/`
- `CLAUDE.md`
- `SKILL.md`
- `.claude/commands/*`

这些文件的作用不是“给你看热闹”。
而是告诉 Claude：

- 这个 repo 的内容运营规范是什么
- `/xhs:*` 各自应该怎么工作
- 被 gate 卡住时应该先回填什么

---

## Claude Code 里最推荐的用法

### Quick

```text
/xhs:quick

写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手。
```

### Trend

```text
/xhs:hot

帮我判断这个热点值不值得跟：
OpenClaw / 个人 AI 助手。
```

### Campaign

```text
/xhs:plan

做一个 3 篇系列：
AI workflow，不只是 prompt。
```

---

## Claude 应该表现成什么样

这是判断集成是否“真的工作”的标准。

当你发出 `/xhs:quick` 时，Claude 不应该只给你一段聊天回复。

它应该：

1. 读 repo 内上下文
2. 创建或继续当前 run
3. 把内容写回 artifact
4. 告诉你下一步是 review / rewrite / publish

如果它只是回复“这里是一篇稿子”，却没有写回 repo，那说明它没有按 XHSSpec 的方式工作。

---

## 最常用的 6 条指令

### 1. 开始一篇

```text
/xhs:quick

帮我写一篇：
为什么开发者做内容，不能只靠临时 prompt。
```

### 2. 跟一个热点

```text
/xhs:hot

判断这个热点是否适合我的账号。
```

### 3. 审稿

```text
/xhs:review

请按 review spec 审这篇，并写回 review.md。
```

### 4. 改稿

```text
/xhs:rewrite

只改最高优先级问题，不换题。
```

### 5. 生成发布包

```text
/xhs:publish

给我一个适合截图和发布的发布包。
```

### 6. 归档

```text
/xhs:archive

把这次内容沉淀成可复用经验。
```

---

## 如果 Claude 被卡住了

这是正常的，不是坏事。

XHSSpec 设计里本来就有 gate。
比如：

- brand 没补完
- review 还没完成
- 当前 artifact 里还有 `<placeholder>...</placeholder>`

理想行为不是“硬往下走”，而是 Claude 会告诉你：

- 为什么现在不能继续
- 卡在哪个文件
- 它应该先回填什么

也就是说，正确体验应该像这样：

```text
现在不能 publish，因为 review.md 还没有完成。
我先把 review.md 补完整，再继续生成 publish package。
```

如果 Claude 跳过这些 gate 直接继续，那不是更聪明，而是 workflow 失真了。

---

## publish 阶段尤其适合 Claude

Claude Code 在 `publish` 阶段会特别顺，因为这个阶段既需要读很多上下文，也需要生成多份结构化资产。

你应该期待它产出：

- `note.md`
- `first-screen.md`
- `visual-plan.md`
- `demo.html`
- `posting-guide.md`
- `post-meta.yaml`

如果 repo 里没设置默认风格，它还应该先问你一句：

```text
你想要哪种发布风格？
- clean-card
- warm-editorial
- bold-contrast
```

---

## 推荐你第一次就这样体验

```text
/xhs:quick
```

```text
/xhs:review
```

```text
/xhs:rewrite
```

```text
/xhs:publish
```

```text
/xhs:archive
```

这是 Claude Code 下最能体现 XHSSpec 价值的一条最短路径。
