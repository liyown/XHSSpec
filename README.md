# XHSSpec

> 在 Claude Code 里打 `/xhs:quick`，一篇笔记就写好了。经验还能沉淀下来。

---

# 当程序员开始做内容

你可能是这种感觉——

写代码的时候，你很自信。一个需求来了，你会先想架构、拆任务、定接口，然后一行一行把代码码出来。你知道怎么把一个大问题拆成小问题，也知道怎么让代码可维护、可扩展。

但是让你写一篇小红书笔记？

完了，完全是另外一套思路。

你打开编辑器，憋了半小时，写了两行字。你不知道读者爱看什么，不知道标题怎么起，甚至不知道一篇笔记应该多长。你去刷别人的爆款，看完还是一头雾水——「他们怎么做到的？」

**写代码和做内容，用的是两套完全不同的思维方式。**

---

## 一人公司的困境

现在很多人都在说「一人公司」——一个人就是一个公司，既要写代码，又要写内容，又要搞运营。

听起来很酷，但实际上：

- 你花 3 小时写代码，产生 3 小时的价值
- 你花 3 小时写内容，产生 3 小时的价值

**但问题是：你写的内容，下个月还能用吗？**

大多数人的答案是：不能。

因为：

- 你的选题是随机想的
- 你的写作风格是随机的
- 你的经验是散落的
- 你的复盘是空白的

你不是在运营一个「系统」，你只是在「随机生产内容」。

---

## 所以这个项目是干什么的

XHSOps 是为所有程序员同行做的。

我是一个写了十多年代码的程序员，最近两年才开始认真做小红书。跟大多数人一样，一开始我觉得内容嘛，不就是「写」吗？

结果发现完全不是那么回事。

**内容创作是一个系统性工程：**

- 你需要知道你的读者是谁
- 你需要确定你的内容定位
- 你需要规划选题方向
- 你需要判断热点值不值得跟
- 你需要审核自己的内容
- 你需要沉淀复盘经验

这些问题，写代码的时候你根本没遇到过。

**于是我做了一件事：把内容运营，变成我可以理解的「工程问题」。**

---

## 安装

推荐直接通过 npm 安装：

```bash
npm install -g xhs-spec
```

不想全局安装的话，也可以直接运行：

```bash
npx xhs-spec init --tools claude-code
```

如果你想提供一条一键安装命令，可以直接复用仓库里的安装脚本：

```bash
curl -fsSL https://raw.githubusercontent.com/liyown/XHSSpec/main/scripts/install.sh | sh
```

脚本默认执行 `npm install -g xhs-spec`。

安装后主命令为 `xhs-spec`，同时保留 `xhsops` 作为兼容别名。

## 快速开始

```bash
# 1. 初始化项目
xhs-spec init --tools claude-code
```

然后在 AI 工具里，直接说：

```
/xhs:quick

主题：程序员如何用 AI 做周报
```

AI 会自动：
- 读取你的品牌配置
- 生成 brief
- 写出草稿

然后：

```
/xhs:review    → 审核
/xhs:publish   → 生成发布包
/xhs:archive   → 归档经验
```

---

## 为什么你可能需要这个项目

### 场景 1：你想用 AI 但不知道怎么让 AI 帮你「持续」产出内容

很多人试过让 AI 写一篇笔记，但很快就放弃了——因为不知道该怎么把 AI 的输出变成可持续的「内容资产」。

XHSOps 把整个内容生产过程拆成了**确定性的步骤**：
- 选题 → brief → 起草 → 审核 → 改写 → 发布 → 归档

每一步都有据可查，每一篇笔记都能追溯。

### 场景 2：你在跟热点，但不想「蹭热点变成抄热点」

热点来了，全网都在发同质化的内容。你也想蹭，但又不想随大流。

XHSOps 的 **Trend 工作流** 专门解决这个痛点：

```
/xhs:hot → /xhs:fit → 起草 → review → 发布
```

fit-check 是整个工作流的关键——它强制你思考：这个热点跟我有什么关系？受众真的需要这个吗？我的差异化视角是什么？

不是盲目追热点，而是**有策略地回应热点**。

### 场景 3：你在做周期性内容规划，比如每周 3 篇

月更、周更听起来简单，但实际操作起来——
- 选题从哪来？
- 每篇的角度怎么避免重复？
- 发了之后效果怎么样？

XHSOps 的 **Campaign 工作流** 把这些问题都装了进来：

```
/xhs:plan → /xhs:draft note-01 → review → /xhs:draft note-02 → ... → /xhs:publish
```

### 场景 4：你想把「经验」沉淀下来

很多内容创作者最大的痛点是：写了很多，但「经验」都散落在各个文档里，下次还是得重新想。

XHSOps 的 `.xhsops/knowledge/` 目录会自动收集：
- `winning-patterns.md` —— 有效的创作模式
- `failed-patterns.md` —— 踩过的坑
- `trend-lessons.md` —— 跟热点的经验教训

下次 AI 帮你写笔记时，它会自动参考这些「经验」。

---

## 核心概念

### 工作流（Workflow）

XHSOps 有三种工作流：

| 工作流 | 场景 | 交互方式 |
|--------|------|----------|
| **Quick** | 快速笔记、临时想法 | `/xhs:quick` |
| **Trend** | 跟热点，做趋势分析 | `/xhs:hot` |
| **Campaign** | 周期性主题、多篇系列 | `/xhs:plan` |

### Brand（品牌）

在让 AI 帮你写东西之前，先告诉它「你是谁」：
- profile.md - 你是谁
- audience.md - 你的读者是谁
- offer.md - 你提供什么价值
- tone.md - 你的语气风格
- taboo.md - 你不写什么

### Artifact（产物）

你每次运营动作，都会生成一组文件：
- brief.md - 选题计划
- draft.md - 草稿
- review.md - 审核意见
- fit-check.md - 热点适切性判断

**不要把内容留在聊天里。**

### Knowledge（经验）

每次归档，经验会自动沉淀到知识库。下次 AI 写东西时会参考这些经验。

---

## 常用命令速查

记住：**你是通过 slash command 跟 AI 交互，AI 在后台调用 CLI。**

| 你说的话 | AI 帮你做 |
|----------|-----------|
| `/xhs:quick` | 创建选题，写出草稿 |
| `/xhs:hot` | 跟进热点 |
| `/xhs:fit approved` | 判断热点适合跟进 |
| `/xhs:plan` | 规划系列 |
| `/xhs:review` | 审核草稿 |
| `/xhs:rewrite` | 改写 |
| `/xhs:publish` | 生成发布包 |
| `/xhs:archive` | 归档经验 |

---

## 常见问题

**Q: 我不会编程能用吗？**

能。你只需要会复制粘贴命令就行。核心创作还是由 AI 完成。

**Q: 我用的是 Windows 怎么办？**

可以。推荐直接使用 `npm` 安装；如果你走 shell 脚本方式，建议在 macOS/Linux 或 WSL 下执行。

**Q: 这个工具是免费的吗？**

是的，完全免费，开源项目。

## 发布到 npm

这个仓库已经补齐了 npm 发布所需的构建和脚本：

```bash
# 1. 安装开发依赖
bun install

# 2. 运行测试
bun run test

# 3. 构建 CLI
bun run build

# 4. 检查打包内容
npm pack --dry-run

# 5. 登录并发布
npm login
npm publish --access public
```

也可以直接用仓库内脚本串起来：

```bash
./scripts/release-npm.sh --access public
```

构建后会生成 `dist/cli.js`，npm 包只会携带运行时必须的 `dist/`、`templates/` 和 `README.md`。

## 文档发布

文档的打包和上传现在走 GitHub Actions，不再依赖把构建产物手动提交进仓库。

- 工作流文件: [docs.yml](/Users/liuyaowen/Workspace/xhs/.github/workflows/docs.yml)
- 构建命令: `bun run docs:build`
- 构建产物目录: `.site/`
- 触发条件: 推送到 `main` 且命中文档相关文件，或手动触发

如果你要启用 GitHub Pages:

1. 在 GitHub 仓库设置里把 Pages Source 设为 `GitHub Actions`
2. 合并到 `main` 后，Actions 会自动构建并部署

---

## 技术栈

- **运行时**: Node.js（发布产物） / Bun（开发与测试）
- **语言**: TypeScript
- **存储**: 文件系统（Markdown/YAML）
- **AI 集成**: Claude Code, Cursor, VS Code, Cline

---

**最后说一句：**

AI 工具正在改变一切——包括内容创作。

与其抗拒变化，不如学会驾驭变化。

XHSOps 不是要取代你，而是让你成为 AI 的「指挥官」——你说话， AI 干活，所有的经验都被沉淀下来。

Star the repo if you find it useful.
