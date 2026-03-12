# CLI 命令参考

XHSOps CLI 提供 12 个核心命令，覆盖从初始化到归档的完整工作流。

## 初始化

| 命令 | 作用 | 常用示例 |
|------|------|----------|
| `init` | 初始化工作区，安装必要配置 | `xhsops init --tools claude-code` |
| `doctor` | 检查环境健康度 | `xhsops doctor` |

**init** 会创建 `.xhsops/` 目录结构，并安装宿主集成文件（`CLAUDE.md`、`AGENTS.md` 等）。

**doctor** 检查配置完整性、errors/warnings 数量、最近 run 状态。

---

## 创建内容

| 命令 | 作用 | 常用示例 |
|------|------|----------|
| `quick` | 单篇快速笔记 | `xhsops quick --idea "程序员如何用AI做周报"` |
| `hot` | 热点响应 | `xhsops hot --topic "OpenAI新模型发布"` |
| `plan` | 策划 Campaign | `xhsops plan --theme "AI效率工具" --count 3` |

### quick

```bash
# 最简用法
xhsops quick --idea "程序员如何用AI做周报"

# 完整参数
xhsops quick --idea "..." --angle "角度" --cta "引导互动" --id quick-001
```

### hot

```bash
xhsops hot --topic "热点话题" --source "来源"
```

### plan

```bash
xhsops plan --theme "AI效率工具" --goal growth --count 3 --window weekly
```

| 参数 | 说明 |
|------|------|
| `--goal` | 目标：growth / engagement / authority |
| `--count` | 计划篇数 |
| `--window` | 时间范围：weekly / monthly |

---

## 流程控制

| 命令 | 作用 | 常用示例 |
|------|------|----------|
| `fit` | 判断热点适切性 | `xhsops fit --target trend-xxx --verdict approved` |
| `draft` | 进入起草阶段 | `xhsops draft --target quick-xxx` |
| `review` | 审核内容 | `xhsops review --target quick-xxx` |
| `iterate` | 迭代改写 | `xhsops iterate --target quick-xxx --round 2` |

### fit

```bash
xhsops fit --target trend-xxx --verdict approved
xhsops fit --target trend-xxx --verdict rejected
```

### draft

```bash
# quick/trend
xhsops draft --target quick-xxx

# campaign 需要指定 note
xhsops draft --target campaign-xxx --note note-01
```

### iterate

```bash
xhsops iterate --target quick-xxx --round 2
```

---

## 发布与归档

| 命令 | 作用 | 常用示例 |
|------|------|----------|
| `publish` | 生成发布包 | `xhsops publish --target quick-xxx --date 2026-03-13` |
| `archive` | 归档并复盘 | `xhsops archive --target quick-xxx --outcome completed` |

### publish

```bash
xhsops publish --target quick-xxx --date 2026-03-13
```

生成 `publish/2026-03-13/quick-xxx-标题/` 目录，包含终稿、封面、素材等。

### archive

```bash
xhsops archive --target quick-xxx --outcome completed
xhsops archive --target trend-xxx --outcome published
xhsops archive --target trend-xxx --outcome dropped
```

outcome 取值：`completed` / `published` / `dropped`

---

## 查看状态

| 命令 | 作用 | 常用示例 |
|------|------|----------|
| `status` | 查看运行状态 | `xhsops status --all` / `xhsops status --target quick-xxx` |
| `validate` | 校验配置 | `xhsops validate --target repo` |

---

## 典型工作流

```bash
# 完整 quick 流程
xhsops init --tools claude-code
xhsops quick --idea "为什么团队需要repo-first内容系统"
xhsops review --target quick-001
xhsops iterate --target quick-001 --round 2
xhsops publish --target quick-001 --date 2026-03-13
xhsops archive --target quick-001 --outcome published
```
