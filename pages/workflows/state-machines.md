# 状态流转图

**一句话理解：每一步都必须留下清晰的证据，半成品会被挡在门外。**

---

## 为什么要有状态

你可能想问：「不就是写一篇笔记吗？为什么要搞这么复杂，又是状态又是 Gate 的？」

让我告诉你为什么。

真实的运营团队经常遇到这种情况：

- 「那个热点文章写好了吗？」
  - 「还没，只有个开头」
- 「今天的发布包呢？」
  - 「还在改，上午再说」
- 「上周那个系列第二篇呢？」
  - 「卡住了，不知道该怎么写」

半成品在各个阶段流动，导致交付永远不确定。

**XHSSpec 的状态机就是为了解决这个问题。**

它会检查三件事：

1. **brand 是否 ready** —— 创作之前，你的账号定位必须填完
2. **artifact 是否完整** —— 上一步的产出必须完整，不能有半成品
3. **是否还有 `<placeholder>`** —— 没填完的地方不能往下走

每一步都必须有产出，每一步都必须有证据。这就是为什么你会感觉「被挡住了」——其实是被保护了。

---

## 三种工作流的状态对比

| 步骤 | Quick | Trend | Campaign |
|------|-------|-------|----------|
| 起点 | initialized | initialized | initialized |
| 第二步 | drafting | fit-checking | planned |
| 第三步 | reviewed | fit-approved / fit-rejected | briefing |
| 第四步 | iterating / done | drafting | drafting |
| 第五步 | done | reviewed | reviewing / iterating |
| 第六步 | archived | done | ready |
| 第七步 | - | archived | archived |

---

## 每个状态的含义

### Quick 状态

| 状态 | 意味着什么 |
|------|------------|
| `initialized` | 选题已创建，brief 正在形成 |
| `drafting` | 初稿已经生成，等待审核 |
| `reviewed` | 审核意见已经给出 |
| `iterating` | 正在根据审核意见改写 |
| `done` | 发布包已经生成 |
| `archived` | 经验已经沉淀到知识库 |

### Trend 状态

| 状态 | 意味着什么 |
|------|------------|
| `initialized` | 热点已创建，trend-brief 正在形成 |
| `fit-checking` | 正在判断热点与品牌是否匹配 |
| `fit-approved` | 允许进入草稿阶段 |
| `fit-rejected` | 热点被放弃，但判断过程值得归档 |
| `drafting` | 初稿正在撰写 |
| `reviewed` | 审核意见已经给出 |
| `done` | 发布包已经生成 |
| `archived` | 经验已经沉淀到知识库 |

### Campaign 状态

| 状态 | 意味着什么 |
|------|------------|
| `initialized` | campaign 已创建 |
| `planned` | proposal 已生成，规划已完成 |
| `briefing` | campaign brief 和 tasks 正在形成 |
| `drafting` | 至少有一篇 note 进入写作 |
| `reviewing` | 审核中（至少一篇 note 在审核） |
| `iterating` | 改写中（至少一篇 note 在改写） |
| `ready` | 所有笔记完成审核，可以发布 |
| `archived` | campaign 经验已经沉淀 |

---

## 最常见的 4 个拦截点

XHSSpec 有 4 个最常见的 Gate，也就是你会「被挡住」的地方。让我解释一下为什么这些 Gate 是必要的。

### Gate 1：brand 没完成就想创作

```
❌ brand ready → quick / hot / plan
```

报错信息：

```
Cannot start content creation because brand positioning is incomplete
```

**这是在保护你：**

如果你还没想清楚自己的账号定位是什么，你写出来的内容会没有一致性。这次写 AI 效率，下次写美妆，后天写职场——读者会困惑：「这个账号到底是干嘛的？」

Brand 是创作的基础。就像盖房子要打地基一样，brand 就是你内容的地基。

**解决方案**：运行 `xhs-spec doctor` 看看 brand 哪里没填完。

---

### Gate 2：草稿没写完就想审核

```
❌ drafting → reviewed
```

报错信息：

```
Cannot proceed to review because the previous artifact is incomplete
```

**这是在保护你：**

审核是一个「检查产出」的动作。如果草稿还是半成品（比如还有 `<placeholder>` 没填完），审核就没有意义——你审核的是一团浆糊，不是一篇稿子。

而且，审核意见是会给 AI 用的。如果草稿本身就是乱的，AI 收到的指令也是乱的，改写出来的内容只会更乱。

**解决方案**：先把草稿写完，确保没有 `<placeholder>`。

---

### Gate 3：审核没完成就想改写

```
❌ reviewed → iterating
```

报错信息：

```
Cannot proceed to rewrite because review has not been completed
```

**这是在保护你：**

改写是需要方向的。审核意见就是方向。

如果没有审核意见，AI 怎么知道改哪里？让它「随便改改」的结果通常是「改得面目全非」。

审核是一个「人类判断」的过程。你得先告诉 AI 哪里有问题、问题是什么，AI 才能针对性地改。

**解决方案**：认真写审核意见，这是在帮你打磨内容。

---

### Gate 4：终稿或审核没完成就想发布

```
❌ reviewed → done
❌ reviewing → ready
```

报错信息：

```
Cannot proceed to publish because review/final draft is incomplete
```

**这是在保护你：**

这是最重要的一个 Gate。

很多工具做到「有一篇终稿」就停了。但真实运营里，终稿只是进入了发布的门口，后面还有一堆事。

如果你把半成品发出去：

- 读者看到的是不完整的内容
- 你的专业形象会受损
- 运营同事会问你「这个怎么发」，你答不上来

Publish 需要终稿和审核都完成，这样 AI 才能生成完整的发布包。

**解决方案**：终稿和审核都必须完成，才能生成发布包。

---

## 为什么这些 Gate 是保护而不是麻烦

我知道你可能觉得这些 Gate 很烦人。

> 「我就是想写个笔记，为什么要填这填那的？」

> 「我就是想发个热点，为什么要审核来审核去的？」

让我换一个角度告诉你：

**Gate 不是在阻止你，而是在确保你真的在做有价值的事。**

没有 Gate 的创作流程是这样的：

1. 想写 → 开始写
2. 写了 → 发出去
3. 发了 → 不知道效果怎么样
4. 效果不好 → 不知道原因

有 Gate 的创作流程是这样的：

1. brand 填完 → 开始写
2. 草稿写完 → 审核
3. 审核改写 → 定稿
4. 定稿发布 → 归档
5. 归档复盘 → 下次更好

每一步都有产出，每一步都有证据。

这不是在增加步骤，而是在**确保每一步都有价值**。

---

## 状态机的设计原则

XHSSpec 的状态机遵循几个设计原则：

1. **不可跳跃**：你不能从 drafting 直接跳到 done，必须经过 reviewed
2. **不可逆流**：你不能从 done 回到 drafting，已发布的内容不能重写
3. **必须归档**：每一次创作（无论成功还是失败）都要归档，经验要沉淀
4. **Gate 必须过**：每个 Gate 都是一道门槛，跨不过去就不能往下走

这些原则确保了你的创作过程是可追溯、可复盘、可优化的。

---

## 总结

状态机不是限制你，而是保护你。

- 它确保你不会在 brand 还没想清楚时就乱写
- 它确保你不会把半成品带入审核
- 它确保你不会在没审核的情况下去改写
- 它确保你不会把不完整的内容发出去

每一步都有产出，每一步都有证据。

这就是为什么你会感觉「被挡住了」——其实是被保护了。
