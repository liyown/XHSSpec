# Claude Code 集成

在 Claude Code 里使用 XHSOps，你只需要说话，AI 会帮你调用 CLI。

## 初始化

在终端运行一次初始化命令：

```bash
xhsops init --tools claude-code
```

这会在项目中创建 `.xhsops/` 配置文件，Claude Code 会自动读取它们。

## 工作原理

XHSOps 通过 slash commands 与 Claude Code 集成。你说出需求，AI 在后台解析命令并调用相应的 CLI。整个过程你只需专注于内容创作，无需手动敲命令。

## 使用方式

### 方式一：Slash Command

```
/xhs:quick

主题：程序员如何用 AI 做周报
```

### 方式二：自然语言

```
帮我写一篇关于程序员用 AI 做周报的笔记
```

## 常用命令

| 命令 | 用途 |
|------|------|
| `/xhs:quick` | 快速创建一篇笔记 |
| `/xhs:hot` | 跟进热点话题 |
| `/xhs:fit` | 检查热点是否适合你的账号 |
| `/xhs:plan` | 规划系列内容 |
| `/xhs:draft` | 为活动创建草稿 |
| `/xhs:review` | 审核草稿 |
| `/xhs:publish` | 生成发布包 |
| `/xhs:archive` | 归档完成的工作 |

## 完整示例

```
/xhs:quick

帮我写一篇关于 AI 效率工具的笔记，主题是"5 个让程序员效率翻倍的 AI 工具"
```

Claude 会自动执行：生成 brief → 撰写草稿 → 审核 → 生成发布包。

---

**记住**：你不需要敲任何 CLI 命令，只需要说话，AI 会帮你完成整个工作流。
