# XHSSpec Tool Integration

This repo uses `xhs-spec` as a repo-first, spec-driven Xiaohongshu operations workflow.

## Required Context

Always read:

- `.xhsspec/config.yaml`
- `.xhsspec/brand/*`
- `.xhsspec/strategy/*`
- `.xhsspec/specs/*`

Read current run artifacts when the user is working on a specific campaign, quick note, or trend response.

## Workflow Entry Points

- `/xhs:quick`: start or continue a single-note workflow
- `/xhs:hot`: start or continue a trend workflow
- `/xhs:plan`: start or continue a campaign workflow
- `/xhs:review`: create or refine a review artifact
- `/xhs:rewrite`: iterate from the latest review
- `/xhs:publish`: turn the final draft into publish assets and guidance
- `/xhs:archive`: write retrospective and knowledge artifacts

## Deterministic Boundary

- Use `xhs-spec` CLI for initialization, state changes, validation, and status checks.
- Use the agent for brand interpretation, drafting, review reasoning, and retrospective synthesis.

## Placeholder Protocol

- Use `<placeholder>...</placeholder>` for intentionally incomplete fields.
- Do not use vague filler like "待补充" to bypass workflow gates.
- If validation blocks a step, finish the placeholder-bearing artifact first.
