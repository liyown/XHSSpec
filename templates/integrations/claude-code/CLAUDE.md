# XHSOps Claude Code Integration

Use `.xhsops/` as the working memory and source of truth for Xiaohongshu operations in this repo.

## Read First

- `.xhsops/config.yaml`
- `.xhsops/brand/*`
- `.xhsops/strategy/*`
- `.xhsops/specs/*`
- `.xhsops/commands/*.md`
- `.xhsops/prompts/*.md`

## Workflow Routing

- Single note request: quick workflow
- Trend reaction or fit question: trend workflow
- Series or structured content planning: campaign workflow

## Available Commands

- `.claude/commands/xhs-quick.md`
- `.claude/commands/xhs-hot.md`
- `.claude/commands/xhs-plan.md`
- `.claude/commands/xhs-review.md`
- `.claude/commands/xhs-rewrite.md`
- `.claude/commands/xhs-publish.md`
- `.claude/commands/xhs-archive.md`

## Execution Boundary

- CLI handles initialization, status, validation, and workflow state changes.
- Claude handles drafting, reviewing, rewriting, and retrospective synthesis.

## Placeholder Protocol

- Use `<placeholder>...</placeholder>` for intentionally incomplete fields.
- Do not use vague filler like "待补充" or leave empty bullets.
- If a deterministic step is blocked, finish the placeholder-bearing artifact first.
