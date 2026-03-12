---
name: xhs-ops
description: Use when managing Xiaohongshu content operations in a repo-first, spec-driven workflow inside Claude Code: quick notes, trend reactions, campaign planning, review, rewrite, and archive.
user-invocable: true
---

# XHSOps Claude Skill

Use `.xhsops/` as the source of truth.

## Always Read

- `.xhsops/config.yaml`
- `.xhsops/brand/*`
- `.xhsops/strategy/*`
- `.xhsops/specs/*`
- `.xhsops/commands/*.md`
- `.xhsops/prompts/*.md`

## Workflow Routing

- Single note request: quick workflow
- Trend or fit-check request: trend workflow
- Series or campaign request: campaign workflow

## Execution Boundary

- CLI handles init, state changes, validation, and status.
- Claude handles briefing, drafting, review, rewrite, and archive synthesis.

## Placeholder Protocol

- Use `<placeholder>...</placeholder>` for intentionally incomplete fields.
- Do not invent vague filler text to bypass validation.
- Replace placeholders when repo context is sufficient; otherwise keep them precise.
