# XHSSpec

> 在 Claude Code、Codex、Cursor、VS Code 这类 AI 编码环境里，把小红书运营变成一个可复用、可归档、可续写的内容系统。

<p align="center">
  <img src="./assets/index.png" alt="XHSSpec cover" width="960" />
</p>

<p align="center">
  XHSSpec 是一个 repo-first、agent-first、spec-driven 的小红书内容运营系统。
</p>

<p align="center">
  <a href="https://github.com/liyown/XHSSpec">GitHub</a> ·
  <a href="https://liyown.github.io/XHSSpec/">文档站</a> ·
  <a href="https://www.npmjs.com/package/xhs-spec">npm</a>
</p>

---

## 这个项目为什么存在

大多数人做小红书内容，实际流程大概是这样的：

- 突然想到一个选题
- 和 AI 聊了一长串
- 产出一篇 draft
- 复制出去发布
- 这次过程里的经验和判断，全部散在聊天记录里

这套方式不是完全没用。
但它只能解决“这一次”，不能解决“以后还能不能越来越顺”。

对很多技术创作者、独立开发者、技术品牌和小团队来说，真正的问题其实不是：

> 我还能不能再多出一篇稿子？

真正的问题是：

- 我的账号定位怎么持续一致？
- 这个热点到底适不适合我的品牌？
- 一篇效果不错的内容，怎么变成可复用的方法？
- 每一次创作之后，到底留下了什么？

**XHSSpec 做的，就是把这些问题从“临时聊天”变成“可执行系统”。**

---

## XHSSpec 到底在做什么

XHSSpec 会给你的 AI 工具一套完整的小红书工作流：

- 用 `brand` 和 `strategy` 文件保存长期上下文
- 用 `slash command` 决定当前走哪条 workflow
- 用 `artifact` 保存 brief、draft、review、publish、archive
- 用 `publish` 把终稿继续加工成可发布资产
- 用 `knowledge` 把经验写回 repo，给下一次继续用

核心思路可以压缩成这条链路：

```text
idea
  -> brief
  -> draft
  -> review
  -> publish package
  -> archive
  -> reusable knowledge
```

---

## 它和普通 AI 写稿工具有什么区别

很多 AI 写作工具停在这里：

```text
prompt -> draft
```

XHSSpec 做的是：

```text
brand context
  -> structured workflow
  -> agent execution
  -> publish assets
  -> archive + reuse
```

这意味着：

- 你的内容不会越来越偏离账号定位
- 系列内容可以一篇一篇持续推进
- 发布阶段不是“再给你一份 markdown”，而是真正的发布包
- 过去做过的内容，会变成后面能复用的资产，而不是死掉的聊天记录

---

## 真正的前台不是 CLI，而是 Slash Command

你不应该围着 CLI 生活。

CLI 是 deterministic engine，负责：

- 初始化
- 创建 run
- 校验状态
- 推进 publish / archive 这类确定性动作

真正的前台体验，发生在 AI 工具里：

| 命令 | 适合什么时候用 |
| --- | --- |
| `/xhs:quick` | 你有一个想法，想快速变成一篇内容 |
| `/xhs:hot` | 你看到一个热点，先判断该不该跟 |
| `/xhs:plan` | 你想做系列、周计划、月主题 |
| `/xhs:review` | 你想让 agent 按规范收紧当前稿子 |
| `/xhs:rewrite` | 你想要下一版，而不是只要评论 |
| `/xhs:publish` | 你想拿到一套可以直接发的发布包 |
| `/xhs:archive` | 你想把这次经验留下来，下次继续用 |

---

## 三条核心工作流

### 1. Quick

适合：

- 单篇内容
- 临时想法
- 快速启动一次创作

流程：

```text
/xhs:quick
  -> brief
  -> draft
  -> review
  -> publish
  -> archive
```

### 2. Trend

适合：

- 追热点
- 借势表达
- 先判断“适不适合品牌”，再决定要不要写

流程：

```text
/xhs:hot
  -> fit check
  -> draft
  -> review
  -> publish or drop
  -> archive
```

### 3. Campaign

适合：

- 周系列
- 月主题
- 多篇 note 实验

流程：

```text
/xhs:plan
  -> proposal
  -> brief
  -> tasks
  -> note-01 / note-02 / note-03
  -> publish timeline
  -> campaign retrospective
```

---

## Publish 才是价值真正显化的时刻

很多系统在 draft 完成时就结束了。

但对小红书来说，真正的工作并不是“写完一篇”。
而是：

> 怎么把这篇内容变成一个真的可以发出去的对象。

所以 XHSSpec 会在 repo 根目录下生成一套发布包：

```text
publish/<date>/<run-id>-<title>/
```

里面包括：

- `note.md`
- `first-screen.md`
- `visual-plan.md`
- `demo.html`
- `posting-guide.md`
- `post-meta.yaml`

这里的 `demo.html` 不是阅读预览。
它是一个 **可截图、可做封面草图、可做信息卡的演示稿**。

也就是说，publish 不是导出终稿。
它是在把终稿继续转成可发布资产。

---

## 你真正怎么开始

### 1. 先初始化一次

如果你主要用 Claude Code：

```bash
xhs-spec init --tools claude-code
```

如果你主要用 Codex / Cursor / VS Code：

```bash
xhs-spec init --tools codex,cursor,vscode
```

它会自动安装：

- `.xhsspec/`
- brand / strategy 模板
- specs / prompts / commands
- 对应工具的集成文件

### 2. 先把账号定位补到可用

至少补这 5 个文件：

- `.xhsspec/brand/profile.md`
- `.xhsspec/brand/audience.md`
- `.xhsspec/brand/offer.md`
- `.xhsspec/brand/tone.md`
- `.xhsspec/brand/taboo.md`

### 3. 然后就回到 AI 工具里

例如在 Claude Code 里直接说：

```text
/xhs:quick

帮我写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手，
而应该把它接进 repo workflow。
```

从这一步开始，agent 就应该去做这些事：

- 读 `.xhsspec/brand/*`
- 读 `.xhsspec/strategy/*`
- 建或续正确的 run
- 写回 brief / draft / review / publish
- 把你带到下一步，而不是只给你一段聊天回复

---

## 每次运行之后，你真正留下了什么

这是 XHSSpec 和很多工具最不一样的地方。

每次完整运行之后，你留下来的不是“一段对话”。
而是：

- 一个 brief
- 一个 draft
- 一个 review artifact
- 一个 publish package
- 一个 retrospective
- 一条 knowledge 经验

也就是说，**每一次内容创作，都会把你的系统再往前推一点。**

---

## 谁最适合现在就开始

XHSSpec 特别适合这些人：

- 技术创作者
- 一人公司 / 独立开发者
- 技术品牌内容团队
- 已经在用 AI coding tools 的运营 / 增长团队
- 希望把内容从“临时生成”变成“长期资产”的人

---

## 推荐阅读

- [快速开始](./pages/guide/getting-started.md)
- [第一次完整运行](./pages/guide/first-run.md)
- [为什么要用 XHSSpec](./pages/concepts/why-xhs-spec.md)
- [Publish 工作流](./pages/workflows/publish.md)
- [Claude Code 集成](./pages/integrations/claude-code.md)
- [Codex / Cursor / VS Code 集成](./pages/integrations/codex-cursor-vscode.md)

---

## 一句话总结

**XHSSpec 把小红书内容创作，从一次次临时对话，变成一个 agent 可以持续工作的 repo-backed 内容系统。**
