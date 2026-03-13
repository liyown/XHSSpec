---
layout: home

hero:
  name: "XHSSpec"
  text: "把小红书运营变成一个能复用的系统"
  tagline: "在 Claude Code、Codex、Cursor、VS Code 里，用 slash command 驱动选题、写稿、审稿、发布和归档。"
  image:
    src: /assets/index.png
    alt: XHSSpec cover
  actions:
    - theme: brand
      text: 3 分钟开始
      link: /guide/getting-started
    - theme: alt
      text: 看完整工作流
      link: /guide/first-run
    - theme: alt
      text: 为什么这不是 AI 写稿器
      link: /concepts/why-xhs-spec
---

## 这不是又一个 AI 写稿工具

XHSSpec 不卖“帮你写一篇爆文”的幻觉。

它做的是另一件更难、也更有长期价值的事：

**把小红书运营从一次次临时对话，变成一个可执行、可复盘、可沉淀、可续写的系统。**

你不是只得到一篇稿子。
你会得到：

- 品牌上下文
- 系列规划
- draft 和 review 轨迹
- publish package
- retrospective
- knowledge

这才是一个内容系统该留下的东西。

---

## 为什么开发者和小团队会喜欢它

如果你本来就习惯在 AI coding tools 里工作，你会立刻明白它的价值。

因为它做的是你已经熟悉的那套事，只是对象从代码变成了内容：

- 有规范
- 有工作流
- 有 artifacts
- 有状态
- 有归档
- 有下次还能复用的资产

你不需要去学一套陌生的 SaaS 后台。
你只需要在已有的 AI 工具里说：

```text
/xhs:quick
```

或者：

```text
/xhs:plan
```

然后让 agent 接着往下干。

---

## 你会怎么使用它

### Quick

适合一篇临时想写的内容。

```text
/xhs:quick

写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手。
```

### Trend

适合热点响应，但先判断适不适合品牌。

```text
/xhs:hot

帮我判断 OpenClaw 这个话题值不值得写。
```

### Campaign

适合一个系列、一周、一月、或一个主题实验。

```text
/xhs:plan

做一个 3 篇的系列：
主题是 AI 工作流，不只是 prompt。
```

---

## 你真正买到的价值，不是 draft

真正的价值时刻，是 `publish`。

XHSSpec 会把一篇已经审好的内容，继续变成一套可交付的发布包：

```text
publish/<date>/<run-id>-<title>/
  note.md
  first-screen.md
  visual-plan.md
  demo.html
  posting-guide.md
  post-meta.yaml
```

这里的 `demo.html` 不是预览页。
它是给截图、封面、信息卡、简单视觉资产准备的演示稿。

所以你最后得到的，不只是“终稿”。
而是“可以真的去发”的东西。

---

## 一眼看懂工作流

```text
brand + strategy
      ↓
 /xhs:quick | /xhs:hot | /xhs:plan
      ↓
 brief / fit-check / proposal
      ↓
 draft
      ↓
 review
      ↓
 publish package
      ↓
 archive + knowledge
```

---

## 哪些人最适合现在就开始

- 技术创作者
- 一人公司 / 独立开发者
- 用 AI coding tools 做内容的运营团队
- 不想再把经验丢在聊天记录里的品牌和代运营团队

---

## 从这里开始

- [快速开始](/guide/getting-started)
- [第一次完整运行](/guide/first-run)
- [为什么要用 XHSSpec](/concepts/why-xhs-spec)
- [Publish 为什么是这个产品的亮点](/workflows/publish)
