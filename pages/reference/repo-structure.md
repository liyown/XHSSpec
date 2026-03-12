# 项目结构

XHSOps 将仓库划分为两层空间，分别承担不同职责。

## 两层空间

| 空间 | 位置 | 用途 |
|------|------|------|
| 系统工作区 | `.xhsops/` | 内部资产、workflow 产物、规范定义 |
| 人用交付区 | `publish/` | 直接给读者看的终稿成品 |

**为什么分开？**

- `.xhsops/` 是 AI 和系统内部用的，包含大量中间产物和协议文件
- `publish/` 是给人直接消费的，只有终稿和配套素材
- 分开后，不会把脏乱的工作区暴露给读者

---

## 完整目录结构

```
项目根目录/
├── .xhsops/                    # 系统工作区
│   ├── brand/                  # 品牌语境
│   │   ├── profile.md          # 你是谁
│   │   ├── audience.md         # 读者是谁
│   │   ├── offer.md             # 提供什么价值
│   │   ├── tone.md              # 语气风格
│   │   └── taboo.md             # 不写什么
│   ├── strategy/               # 内容策略
│   │   ├── content-pillars.md   # 内容支柱
│   │   └── topic-frameworks.md  # 选题框架
│   ├── specs/                  # 规则定义
│   ├── commands/               # workflow 定义
│   ├── prompts/                # agent 协议
│   ├── quick/                  # quick runs
│   ├── trends/                 # trend runs
│   ├── campaigns/              # campaigns
│   └── knowledge/              # 复盘经验
├── publish/                    # 交付区（按日期）
│   └── 2026-03-13/
│       └── quick-xxx-标题/
│           ├── note.md
│           ├── cover-brief.md
│           ├── assets.md
│           └── publish-guide.md
└── ...
```

---

## 各目录详解

### .xhsops/brand/ — 品牌语境

定义「你是谁」系列，回答：

- `profile.md` — 账号身份定位
- `audience.md` — 目标读者画像
- `offer.md` — 核心价值主张
- `tone.md` — 文风语气
- `taboo.md` — 绝对不写的内容

### .xhsops/strategy/ — 内容策略

- `content-pillars.md` — 内容支柱（主要写哪些方向）
- `topic-frameworks.md` — 选题框架（怎么想选题）

### .xhsops/specs/ — 规则定义

定义「什么算合格」：

| 文件 | 作用 |
|------|------|
| `note.spec.md` | 笔记结构规则 |
| `review.spec.md` | 审核标准 |
| `trend.spec.md` | 热点适切性判断 |
| `publish.spec.md` | 发布包要求 |

### .xhsops/commands/ — workflow 定义

host-agnostic 的步骤文档，定义每个 workflow 的具体行为。

### .xhsops/prompts/ — agent 协议

agent 在各阶段的输出模板，确保产出格式一致。

### .xhsops/quick/ — quick runs

每次 `quick` 命令创建的产物目录。

### .xhsops/trends/ — trend runs

每次 `hot` 命令创建的产物目录。

### .xhsops/campaigns/ — campaigns

每次 `plan` 命令创建的产物目录。

### .xhsops/knowledge/ — 复盘经验

| 文件 | 作用 |
|------|------|
| `winning-patterns.md` | 有效模式 |
| `failed-patterns.md` | 失败教训 |
| `trend-lessons.md` | 热点经验 |

这些是 AI 创作时的参考库，每次 `archive` 会自动回流经验。

### publish/ — 发布成品

最终给人看的发布制品，按日期组织。每个发布包含：

- `note.md` — 终稿正文
- `cover-brief.md` — 封面设计要求
- `assets.md` — 配图素材
- `publish-guide.md` — 发布引导
