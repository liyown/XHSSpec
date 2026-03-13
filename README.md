# XHSSpec

> Turn Xiaohongshu content ops into a reusable system inside Claude Code, Codex, Cursor, and VS Code.

<p align="center">
  <img src="./assets/index.png" alt="XHSSpec cover" width="960" />
</p>

<p align="center">
  <strong>Not a SaaS dashboard.</strong>
  <strong>Not an auto-posting bot.</strong>
  <strong>Not another “AI writes a post” wrapper.</strong>
</p>

<p align="center">
  XHSSpec is a repo-first, agent-first content operations system for Xiaohongshu.
</p>

<p align="center">
  <a href="https://github.com/liyown/XHSSpec">GitHub</a> ·
  <a href="https://liyown.github.io/XHSSpec/">Docs</a> ·
  <a href="https://www.npmjs.com/package/xhs-spec">npm</a>
</p>

---

## Why This Project Exists

Most people do Xiaohongshu content like this:

- a random idea appears
- a chat thread gets long
- AI writes a draft
- the final post gets copied out
- everything learned disappears

That works once.
It does not scale into a system.

If you are a founder, indie hacker, developer creator, or small content team, the real problem is usually not “how do I get one more draft?”

The real problem is:

- how do I keep my positioning consistent?
- how do I know whether a hot topic fits my brand?
- how do I turn one good post into a repeatable workflow?
- how do I leave behind assets that the next post can reuse?

**XHSSpec answers that by treating content ops like an engineering system.**

You keep long-term knowledge in the repo.
You let the agent do the messy thinking.
You keep every run inspectable, archivable, and reusable.

---

## What XHSSpec Actually Does

XHSSpec gives your AI coding tool a complete Xiaohongshu workflow:

- `brand` and `strategy` files define who you are and what you want to say
- `slash commands` decide what kind of workflow you are running
- `artifacts` capture brief, draft, review, publish package, and retrospective
- `publish` turns a finished draft into assets you can actually use
- `knowledge` keeps lessons so the next run starts smarter

This is the core idea:

```text
idea
  -> brief
  -> draft
  -> review
  -> publish package
  -> archive
  -> reusable knowledge
```

---

## Why It Feels Different

Most AI writing tools stop at:

```text
prompt -> draft
```

XHSSpec is built for:

```text
brand context
  -> structured workflow
  -> agent execution
  -> publish assets
  -> archive + reuse
```

That means:

- your drafts do not drift away from your positioning
- your series content can be tracked note by note
- your publish step produces actual posting assets
- your past work becomes operating knowledge instead of dead chat logs

---

## The Real Frontend: Slash Commands

You do **not** need to live in the CLI.

The CLI is the deterministic engine.
The real user experience happens inside your AI tool through slash commands and agent behavior.

Typical entry points:

| Command | Use it when |
| --- | --- |
| `/xhs:quick` | you want to turn one idea into one post quickly |
| `/xhs:hot` | you want to react to a trend but need a fit check first |
| `/xhs:plan` | you want to build a series or campaign |
| `/xhs:review` | you want the agent to tighten the current draft |
| `/xhs:rewrite` | you want the next version, not just comments |
| `/xhs:publish` | you want a posting package, not just another markdown file |
| `/xhs:archive` | you want to preserve what worked and what failed |

---

## Three Core Workflows

### 1. Quick

Best for:

- one post
- one idea
- one fast content push

Flow:

```text
/xhs:quick
  -> brief
  -> draft
  -> review
  -> publish
  -> archive
```

### 2. Trend

Best for:

- reacting to a hot topic
- deciding whether a trend fits your account
- moving quickly without dropping brand discipline

Flow:

```text
/xhs:hot
  -> fit check
  -> draft
  -> review
  -> publish or drop
  -> archive
```

### 3. Campaign

Best for:

- a weekly series
- a monthly theme
- a multi-note experiment

Flow:

```text
/xhs:plan
  -> proposal
  -> brief
  -> tasks
  -> note-01 / note-02 / note-03
  -> publish timeline
  -> campaign retrospective
```

---

## Publish Is The Payoff

A draft is not the end of the workflow.

On Xiaohongshu, the real work is not just writing a post.
It is turning that post into something you can actually publish.

That is why XHSSpec generates a posting package at:

```text
publish/<date>/<run-id>-<title>/
```

Inside it:

- `note.md`
- `first-screen.md`
- `visual-plan.md`
- `demo.html`
- `posting-guide.md`
- `post-meta.yaml`

`demo.html` is not a reading preview.
It is a screenshot-ready visual companion for:

- cover ideas
- information cards
- CTA slides
- lightweight demo-style assets you can capture and post

---

## How You Actually Start

### 1. Initialize once

```bash
xhs-spec init --tools claude-code
```

or:

```bash
xhs-spec init --tools codex,cursor,vscode
```

This installs:

- `.xhsspec/`
- brand and strategy templates
- specs, prompts, and workflow contracts
- tool-specific integration files

### 2. Fill your positioning once

Minimum files:

- `.xhsspec/brand/profile.md`
- `.xhsspec/brand/audience.md`
- `.xhsspec/brand/offer.md`
- `.xhsspec/brand/tone.md`
- `.xhsspec/brand/taboo.md`

### 3. Then stay inside your AI tool

Example in Claude Code:

```text
/xhs:quick

写一篇给技术创业者看的内容：
为什么团队不该继续把 AI 当临时写手，
而应该把它接进 repo workflow。
```

From there, the agent should:

- read your `.xhsspec/brand/*`
- build or continue the correct run
- write the right artifacts
- guide you toward review, publish, and archive

---

## What You Keep After Every Run

This is the part most tools never solve.

Every finished run leaves behind:

- a brief
- a draft
- a review artifact
- a publish package
- a retrospective
- a knowledge entry

So the output is not “one more chat”.
The output is “one more reusable operating asset”.

---

## Who This Is For

XHSSpec is especially good for:

- technical founders building personal brands
- indie hackers and creators who think in systems
- devrel, growth, or content teams already using AI coding tools
- operators who want process, not just copywriting

---

## Docs

Start here:

- [Getting Started](./pages/guide/getting-started.md)
- [First Full Run](./pages/guide/first-run.md)
- [Why XHSSpec](./pages/concepts/why-xhs-spec.md)
- [Publish Workflow](./pages/workflows/publish.md)
- [Claude Code Integration](./pages/integrations/claude-code.md)
- [Codex / Cursor / VS Code Integration](./pages/integrations/codex-cursor-vscode.md)

---

## One-Sentence Summary

**XHSSpec turns Xiaohongshu content creation from temporary chat output into a repo-backed operating system your agent can keep working inside.**
