# 示例

这一页不讲抽象概念。

只讲 3 个最常见的使用路径，让你看到 XHSSpec 到底是怎么工作的。

---

## 示例 1：Quick

### 场景

你今天突然想写一篇：

> 为什么团队不该继续把 AI 当临时写手

### 你在 AI 工具里说

```text
/xhs:quick

写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手，
而应该把它接进 repo workflow。
CTA 是收藏这套方法。
```

### 这时系统会做什么

1. 创建一个 quick run
2. 生成 `brief.md`
3. 生成 `draft.md`
4. 引导你进入 `review`

### 最终你会得到什么

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

### 这条路径为什么值钱

因为它不是“让 AI 帮你写了一篇”。
而是让这篇内容留下了：

- draft 轨迹
- review 结果
- 发布包
- 归档经验

---

## 示例 2：Trend

### 场景

你看到一个热点：

> OpenClaw / 个人 AI 助手

你不确定该不该跟。

### 你在 AI 工具里说

```text
/xhs:hot

帮我判断这个热点值不值得写：
OpenClaw / 个人 AI 助手。
```

### 这时系统会做什么

1. 创建 trend run
2. 补 `trend-brief.md`
3. 补 `fit-check.md`
4. 判断：
   - fit approved
   - fit rejected

### 如果通过

继续：

```text
/xhs:publish
```

### 如果不通过

它也不会白做。
因为你仍然会留下一个 trend judgment artifact，未来看到类似话题时可以复用。

### 这条路径为什么值钱

因为热点不是“看到就写”。
对品牌来说，更重要的是：

- 这个热点适不适合我
- 我能不能讲出不一样的角度
- 这次不写，未来还能从这次判断里学到什么

---

## 示例 3：Campaign

### 场景

你想做一个 3 篇系列：

> AI workflow，不只是 prompt

### 你在 AI 工具里说

```text
/xhs:plan

做一个 3 篇系列：
主题是 AI workflow，不只是 prompt。
受众是技术创业者和小团队。
```

### 这时系统会做什么

1. 创建 campaign
2. 生成：
   - `proposal.md`
   - `brief.md`
   - `tasks.md`
3. 把每一篇 note 的角色写清楚
4. 让你逐篇推进：
   - note-01
   - note-02
   - note-03

### 你会在 status 里看到什么

不是一句模糊的“继续写”。

而是：

- 当前系列发了几篇
- 下一篇最该推进哪篇
- 为什么是它
- 当前应该 `draft / review / publish` 哪一步
- 一句可复制给 agent 的下一步消息

### 这条路径为什么值钱

因为 campaign 的核心不是“多写几篇”。
而是：

- 每篇承担不同角色
- 系列节奏可见
- 发布节奏可见
- 复盘可以按系列发生

---

## 一个真实的 publish package 长什么样

无论是 quick、trend 还是 campaign，最终都会产出：

```text
publish/<date>/<run-id>-<title>/
  note.md
  first-screen.md
  visual-plan.md
  demo.html
  posting-guide.md
  post-meta.yaml
```

### `note.md`

给发布面直接用的正文。

### `first-screen.md`

告诉你：

- 首屏主文案
- 副文案
- 情绪目标
- 优先截图哪一页

### `visual-plan.md`

告诉你：

- 哪几张图最值得做
- 每张图承担什么角色
- 哪张截图最关键

### `demo.html`

不是给你“看预览”的。
是给你“截图、做封面、做信息卡”的。

### `posting-guide.md`

告诉你：

- 发布前要检查什么
- 发布时怎么操作
- 发布后该记录什么

---

## 推荐你先跑哪一个

如果你是第一次上手，推荐顺序是：

1. `Quick`
2. `Trend`
3. `Campaign`

原因很简单：

- Quick 最短，最容易感知价值
- Trend 能让你体验 fit-check 这个差异化
- Campaign 最能体现“这是系统，不是 prompt”

---

## 一个更像产品而不是命令行的理解方式

你不用记住一堆 CLI。

你只要记住三句：

```text
/xhs:quick
/xhs:hot
/xhs:plan
```

剩下的，agent 会带着你继续往前走。
