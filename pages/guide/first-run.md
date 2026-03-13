# 第一次完整运行

这不是一份“命令参考”。

这是一次真正的上手演练。

目标只有一个：

**让你完整体验一次从想法，到 draft，到 publish package，再到 archive 的全过程。**

---

## 你今天要得到什么

假设你今天要做这篇内容：

> 主题：为什么团队不该继续把 AI 当临时写手  
> 受众：技术创业者 / 小团队  
> 角度：把 AI 接进 repo workflow，而不是停在 prompt  
> CTA：收藏这套工作流，后面继续拆解

我们不从 CLI 视角讲。
我们从“你在 AI 工具里到底该怎么说”开始。

---

## Step 0：先完成初始化

如果你还没做过初始化，先执行：

```bash
xhs-spec init --tools claude-code
```

或者：

```bash
xhs-spec init --tools codex,cursor,vscode
```

然后至少把这些文件补到可用：

- `.xhsspec/brand/profile.md`
- `.xhsspec/brand/audience.md`
- `.xhsspec/brand/offer.md`
- `.xhsspec/brand/tone.md`
- `.xhsspec/brand/taboo.md`

---

## Step 1：在 AI 工具里发起第一篇

打开 Claude Code、Codex 或 Cursor，对 agent 说：

```text
/xhs:quick

帮我写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手，
而应该把它接进 repo workflow。
CTA 是收藏这套方法。
```

### 这时候 AI 应该做什么

它不应该只是给你回复一段文字。

它应该：

1. 读取 brand / strategy / specs
2. 创建 quick run
3. 补 `brief.md`
4. 补 `draft.md`
5. 告诉你现在进入 review 还是还缺信息

如果它只是随手给你一段稿子，而没有写回 repo，那就不是正确用法。

---

## Step 2：看它产出的第一轮 artifacts

这一步你不用自己找太多文件，agent 应该能直接告诉你。

但你至少会看到：

```text
.xhsspec/quick/<run-id>/
  brief.md
  draft.md
```

你要重点检查两件事：

### 1. 方向对不对

看 brief 和 draft 有没有偏离：

- 受众是不是你真正想写的人
- 角度是不是你真正要讲的角度
- 语气是不是像你

### 2. 有没有大量 placeholder

少量 `<placeholder>...</placeholder>` 是允许的。
如果到处都是 placeholder，说明 agent 还没真正完成第一轮内容。

这时你不应该进入 review。
你应该让 agent 继续把首轮内容补完整。

---

## Step 3：进入 review

当你觉得 draft 已经像一篇“能改的稿子”了，就说：

```text
/xhs:review

请审核刚才这篇，按 repo 里的 review spec 给出优先修改项。
```

### 这时候你应该得到什么

不是一句“挺好的”。

而是一个真正写回 repo 的 review artifact，通常包括：

- verdict
- strengths
- issues
- rewrite guidance

这一步很关键。
因为 XHSSpec 的价值不在“AI 会写”，而在“AI 会按流程把内容收紧”。

---

## Step 4：如果 review 有问题，就继续 rewrite

如果 review 里有明显问题，对 agent 说：

```text
/xhs:rewrite

按 review 的最高优先级问题重写这一版，不要换题，只把它收紧。
```

正确体验应该是：

- agent 知道该读 `review.md`
- agent 知道该改 `draft`
- agent 不会重新开一个新的 run
- agent 不会跳过当前问题直接进入 publish

如果当前稿子还没收干净，系统也会 gate 住你，不让你继续往下走。

---

## Step 5：进入 publish

当内容已经通过 review，你就可以说：

```text
/xhs:publish

给我一个适合这篇内容的发布包。
```

如果 repo 里没有默认发布风格，理想行为是：

agent 先问你一句：

```text
你想要哪种发布风格？
- clean-card
- warm-editorial
- bold-contrast
```

如果 repo 里已经配置了默认风格，agent 就应该直接用，不再重复问你。

### publish 之后你应该得到什么

```text
publish/<date>/<run-id>-<title>/
  note.md
  first-screen.md
  visual-plan.md
  demo.html
  posting-guide.md
  post-meta.yaml
```

这里最值得看的不是 `note.md`，而是：

- `first-screen.md`
- `visual-plan.md`
- `demo.html`

因为这三样决定了它到底是不是“可发布资产”，而不是“又一份 markdown”。

---

## Step 6：最后归档

发布包出来之后，最后说：

```text
/xhs:archive

把这次内容的结果和经验归档。
```

这一步的目标不是写长篇复盘。
而是留下一个足够轻、但以后真的能用的记录：

- 这次写了什么
- 结果如何
- 发布包在哪
- 有什么可以下次复用

---

## 一次完整运行之后，你真正得到的是什么

不是一篇 draft。

而是一整条链路：

```text
idea
  -> brief
  -> draft
  -> review
  -> publish package
  -> archive
  -> knowledge
```

这也是 XHSSpec 最重要的区别：

**每做一次内容，不只是完成一次创作，而是在往你的内容系统里继续加资产。**

---

## 如果你第一次只想跑一条最短路径

直接照着这 5 句话说就够了：

```text
/xhs:quick
帮我写一篇：为什么团队不该继续把 AI 当临时写手。
```

```text
/xhs:review
请按 review spec 审这篇。
```

```text
/xhs:rewrite
只改最高优先级问题，不换题。
```

```text
/xhs:publish
给我一个可以直接发的发布包。
```

```text
/xhs:archive
把这次内容归档成可复用经验。
```

这就是第一次完整运行最推荐的体验路径。
