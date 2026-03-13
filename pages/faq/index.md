# 常见问题

## 基础问题

### XHSSpec 是什么？

一个运行在 AI coding tools 里的小红书内容运营系统。它把选题、draft、review、publish、archive 这些动作落成 repo 里的可复用资产，而不只是聊天记录。

### 我不会编程能用吗？

能，只要你愿意在 Claude Code、Codex、Cursor 这类工具里和 agent 配合工作。你不需要理解底层实现，但最好愿意维护最基本的 brand / strategy 文件。

### 这个工具是免费的吗？

免费，开源。现在免费，以后也免费。

---

## 工作流问题

### Quick、Trend、Campaign 有什么区别？

- **Quick**：临时起意，想写一篇笔记
- **Trend**：追热点，想蹭流量
- **Campaign**：做系列，做月度规划

简单说：一篇 vs 蹭热点 vs 做系列。

### 我只想写一篇，为什么还要走流程？

不走流程也可以，但内容就散落在聊天记录里，下次想改都找不到。

走流程的好处：写过的内容能回顾、经验能积累、AI 以后能帮你写得更好。

### 为什么 brand 没填完不能开始？

因为后面写笔记、审笔记都需要 brand 作为参考。brand 没定，AI 写出来的东西容易跑偏。

先花 5 分钟把 brand 填好，后面省心。

---

## 技术问题

### 为什么要用 `<placeholder>`？

为了把「没完成」变成显式状态。系统会检查它，没填完就不让你进下一阶段。

相当于有人帮你盯着：嘿，这儿还没填完呢。

### command / prompt / spec 有什么区别？

- **spec**：规则文档（笔记应该怎么写）
- **command**：操作指令（怎么执行工作流）
- **prompt**：提示词模板（AI 怎么输出）

不用深究会用就行。

### publish 为什么不放在 `.xhsspec/`？

因为 `.xhsspec/` 是工作区，publish 是最终要发出去的成品。成品单独放，方便你直接复制粘贴到小红书后台。

---

## 经验沉淀

### 为什么要 archive？

把「做完」变成「经验」。每次 archive 后，内容会回流到 knowledge/ 目录，AI 下次写笔记时会自动参考这些经验。现在 archive 还会把关联的 publish package 一起挂进去，方便你下次回头看“当时到底发了什么”。

### 以后会不会支持跨 run 学习？

会，但不是第一阶段重点。当前版本先保证每次 archive 都留下可追踪的 retrospective 和 knowledge block。后续再叠加跨 run 聚合、`learn` 命令和 spec update suggestion。

### 我能不能跳过 archive？

可以。但你损失的不仅是一个命令，而是未来的 AI 加持。长期来看亏的是自己。

---

## 其他

### 支持 Windows 吗？

目前推荐 macOS 或 Linux。Windows 可以用 WSL，或者等原生支持。

### 可以用来运营其他平台吗？

目前专门为小红书优化。工作流思路通用，但字段和规则是小红书特定的。
