# Slash Command Contracts

This file defines host-agnostic behavior for coding-agent environments such as Codex CLI, Cursor, VS Code, and Claude Code.

## `/xhs:init`

- Intent: initialize or complete repo setup
- Read: `.xhsspec/config.yaml`, `.xhsspec/brand/*`, `.xhsspec/strategy/*`
- Write: missing brand/strategy/spec files
- Response: setup summary, missing inputs, next command

## `/xhs:specify`

- Intent: refine brand, strategy, or spec files
- Read: `.xhsspec/brand/*`, `.xhsspec/strategy/*`, `.xhsspec/specs/*`, `.xhsspec/knowledge/*`
- Write: relevant spec markdown files
- Response: changes made, assumptions, next command

## `/xhs:plan`

- Intent: plan a structured campaign
- Read: `.xhsspec/brand/*`, `.xhsspec/strategy/*`, `.xhsspec/specs/note.spec.md`, `.xhsspec/knowledge/*`
- Write: `.xhsspec/campaigns/<id>/proposal.md`, `brief.md`, `tasks.md`
- Response: proposal summary, candidate note list, risks, next command

## `/xhs:quick`

- Intent: turn a single note idea into a brief and draft
- Read: `.xhsspec/brand/*`, `.xhsspec/strategy/*`, `.xhsspec/specs/note.spec.md`, `.xhsspec/specs/creation.spec.md`, `.xhsspec/knowledge/winning-patterns.md`
- Write: `.xhsspec/quick/<id>/brief.md`, `draft.md`
- Response: brief summary, draft, review recommendation, next command
- Writeback rule: fill `brief.md` first, then update `draft.md`

## `/xhs:hot`

- Intent: evaluate a trend and optionally draft a response
- Read: `.xhsspec/brand/*`, `.xhsspec/brand/taboo.md`, `.xhsspec/specs/trend.spec.md`, `.xhsspec/specs/creation.spec.md`, `.xhsspec/knowledge/trend-lessons.md`
- Write: `.xhsspec/trends/<id>/trend-brief.md`, `fit-check.md`, optional `draft.md`
- Response: fit verdict, rationale, risk notes, and whether the user should run `xhs-spec fit --verdict approved|rejected`
- Writeback rule: do not update `draft.md` before a positive fit verdict

## `/xhs:draft`

- Intent: generate or refine draft content from an existing brief
- Read: target `brief.md` or `fit-check.md`, brand files, note spec, creation spec
- Write: target `draft.md` or campaign `drafts/<note>.md`
- Response: draft body, open assumptions, next command

## `/xhs:review`

- Intent: critique a draft against repo rules
- Read: draft artifact, `.xhsspec/specs/review.spec.md`, `.xhsspec/brand/tone.md`, `.xhsspec/brand/taboo.md`
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
- Read: latest draft, latest review, `.xhsspec/specs/publish.spec.md`, `.xhsspec/prompts/publish.md`, brand files
- Write: `publish/<date>/<run-id>-<title>/note.md`, `first-screen.md`, `visual-plan.md`, `demo.html`, `posting-guide.md`, `post-meta.yaml`
- Response: final title, chosen style, visual directions, publish checklist, next command
- Writeback rule: treat `demo.html` as a screenshot-ready artifact rather than a plain reading preview

## `/xhs:archive`

- Intent: capture learnings and close a run
- Read: brief, draft, review, optional outcome notes
- Write: `retrospective.md`, `.xhsspec/knowledge/*.md`
- Response: what worked, what failed, reusable lessons, next command
- Writeback rule: update both retrospective and the relevant knowledge file

## `/xhs:status`

- Intent: inspect repo or run status
- Read: run metadata files and artifact frontmatter
- Write: none
- Response: current status, blockers, next command
