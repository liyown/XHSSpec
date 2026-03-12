# Slash Command Contracts

This file defines host-agnostic behavior for coding-agent environments such as Codex CLI, Cursor, VS Code, and Claude Code.

## `/xhs:init`

- Intent: initialize or complete repo setup
- Read: `.xhsops/config.yaml`, `.xhsops/brand/*`, `.xhsops/strategy/*`
- Write: missing brand/strategy/spec files
- Response: setup summary, missing inputs, next command

## `/xhs:specify`

- Intent: refine brand, strategy, or spec files
- Read: `.xhsops/brand/*`, `.xhsops/strategy/*`, `.xhsops/specs/*`, `.xhsops/knowledge/*`
- Write: relevant spec markdown files
- Response: changes made, assumptions, next command

## `/xhs:plan`

- Intent: plan a structured campaign
- Read: `.xhsops/brand/*`, `.xhsops/strategy/*`, `.xhsops/specs/note.spec.md`, `.xhsops/knowledge/*`
- Write: `.xhsops/campaigns/<id>/proposal.md`, `brief.md`, `tasks.md`
- Response: proposal summary, candidate note list, risks, next command

## `/xhs:quick`

- Intent: turn a single note idea into a brief and draft
- Read: `.xhsops/brand/*`, `.xhsops/strategy/*`, `.xhsops/specs/note.spec.md`, `.xhsops/specs/creation.spec.md`, `.xhsops/knowledge/winning-patterns.md`
- Write: `.xhsops/quick/<id>/brief.md`, `draft.md`
- Response: brief summary, draft, review recommendation, next command
- Writeback rule: fill `brief.md` first, then update `draft.md`

## `/xhs:hot`

- Intent: evaluate a trend and optionally draft a response
- Read: `.xhsops/brand/*`, `.xhsops/brand/taboo.md`, `.xhsops/specs/trend.spec.md`, `.xhsops/specs/creation.spec.md`, `.xhsops/knowledge/trend-lessons.md`
- Write: `.xhsops/trends/<id>/trend-brief.md`, `fit-check.md`, optional `draft.md`
- Response: fit verdict, rationale, risk notes, and whether the user should run `xhsops fit --verdict approved|rejected`
- Writeback rule: do not update `draft.md` before a positive fit verdict

## `/xhs:draft`

- Intent: generate or refine draft content from an existing brief
- Read: target `brief.md` or `fit-check.md`, brand files, note spec, creation spec
- Write: target `draft.md` or campaign `drafts/<note>.md`
- Response: draft body, open assumptions, next command

## `/xhs:review`

- Intent: critique a draft against repo rules
- Read: draft artifact, `.xhsops/specs/review.spec.md`, `.xhsops/brand/tone.md`, `.xhsops/brand/taboo.md`
- Write: `review.md`
- Response: verdict, prioritized fixes, rewrite guidance, next command
- Writeback rule: include both what to change and what to preserve

## `/xhs:iterate`

- Intent: revise a draft from review feedback
- Read: latest draft, `review.md`, note spec, tone, taboo
- Write: updated draft artifact
- Response: change summary, revised draft, next command

## `/xhs:publish`

- Intent: turn a finished draft into a publish package
- Read: latest draft, latest review, `.xhsops/specs/publish.spec.md`, `.xhsops/prompts/publish.md`, brand files
- Write: `publish/<date>/<run-id>-<title>/note.md`, `cover-brief.md`, `assets.md`, `demo.html`, `publish-guide.md`
- Response: final title, visual directions, publish checklist, next command
- Writeback rule: treat `demo.html` as a screenshot-ready artifact rather than a plain reading preview

## `/xhs:archive`

- Intent: capture learnings and close a run
- Read: brief, draft, review, optional outcome notes
- Write: `retrospective.md`, `.xhsops/knowledge/*.md`
- Response: what worked, what failed, reusable lessons, next command
- Writeback rule: update both retrospective and the relevant knowledge file

## `/xhs:status`

- Intent: inspect repo or run status
- Read: run metadata files and artifact frontmatter
- Write: none
- Response: current status, blockers, next command
