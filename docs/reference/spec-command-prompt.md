# Spec / Command / Prompt

这三个概念经常被混淆，其实各管一摊。

## 区别

| 概念 | 回答的问题 | 例子 |
|------|------------|------|
| **Spec** | 规则是什么？什么算合格？ | 笔记结构、审核标准、热点判断规则 |
| **Command** | workflow 行为怎么执行？ | 先读什么、再写什么、最后输出什么 |
| **Prompt** | agent 这个阶段产出什么？ | brief 模板、fit-check 输出格式 |

---

## 详细说明

### Spec — 规则定义

回答：**什么算合格？**

- 一篇笔记合格长什么样 → `note.spec.md`
- review 看哪些维度 → `review.spec.md`
- trend fit 判断什么 → `trend.spec.md`
- publish 包必须包含什么 → `publish.spec.md`

### Command — 行为约定

回答：**这个 workflow 怎么执行？**

- `/xhs:quick` 先读 spec、再写 brief、最后产 draft
- `/xhs:publish` 先生成终稿、再打包封面素材

它定义的是**步骤顺序和职责**，不关心具体输出格式。

### Prompt — 输出协议

回答：**agent 应该输出成什么样？**

- quick brief 应该补哪些字段
- trend fit-check 结论怎么写
- publish 包各文件什么格式

它定义的是**产出物的结构**，确保 AI 输出可预期。

---

## 一句话总结

- **Spec** — 规则（什么算合格）
- **Command** — 步骤（怎么做这个 workflow）
- **Prompt** — 格式（这一阶段产出什么）

---

## 在系统中的位置

不是摆设，已经进入系统层：

- `init` 安装这些文件到 `.xhsops/`
- `validate` / `doctor` 检查它们是否存在
- AI 执行 slash command 时自动读取
