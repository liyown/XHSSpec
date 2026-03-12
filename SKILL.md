---
name: xhs-ops
description: Use when managing Xiaohongshu content operations in a repo-first, spec-driven workflow: planning campaigns, drafting quick notes, reacting to trends, reviewing drafts, and archiving lessons into Markdown/YAML artifacts.
user-invocable: true
---

# XHSOps Skill

## Purpose

Operate Xiaohongshu work as versioned repo artifacts instead of one-off prompts.

## Non-goals

- Do not act like a publishing tool.
- Do not store brand knowledge inside the skill.
- Do not skip artifact creation when a workflow is requested.

## Routing Rules

- Use `quick` workflow for single-note, low-ceremony requests.
- Use `trend` workflow for trend fit checks, hot takes, or event-driven content.
- Use `campaign` workflow for multi-note planning, weekly/monthly themes, or experiments.

## Required Repo Files

Always read:

- `.xhsops/config.yaml`
- `.xhsops/brand/profile.md`
- `.xhsops/brand/audience.md`
- `.xhsops/brand/offer.md`
- `.xhsops/brand/tone.md`
- `.xhsops/brand/taboo.md`
- `.xhsops/strategy/content-pillars.md`
- `.xhsops/strategy/topic-frameworks.md`
- `.xhsops/specs/note.spec.md`
- `.xhsops/specs/creation.spec.md`
- `.xhsops/specs/review.spec.md`
- `.xhsops/specs/trend.spec.md`

Read when available:

- `.xhsops/knowledge/winning-patterns.md`
- `.xhsops/knowledge/failed-patterns.md`
- `.xhsops/knowledge/trend-lessons.md`
- `.xhsops/prompts/*.md`
- Current run artifacts under `.xhsops/quick/`, `.xhsops/trends/`, `.xhsops/campaigns/`

## Shared Conventions

- Every workflow writes Markdown/YAML artifacts into `.xhsops/`.
- Do not keep the canonical result only in chat.
- Keep frontmatter intact.
- Respect deterministic status transitions managed by the CLI.
- Use `.xhsops/commands/*.md` as the canonical host-agnostic command behavior reference.
- Use `.xhsops/prompts/*.md` as the content-generation and rewrite contract.
- Use `<placeholder>...</placeholder>` for intentionally incomplete fields. Do not invent vague filler to bypass a gate.

## Quick Workflow

1. Confirm or create a quick run with `xhsops quick`.
2. Read brand, strategy, note spec, creation spec, prompt contracts, and winning patterns.
3. Fill `brief.md` first with a concise angle, audience, CTA, and constraints.
4. Fill `draft.md` with structured content aligned to `note.spec.md`.
5. If asked to review, write `review.md` against `review.spec.md`.

## Trend Workflow

1. Confirm or create a trend run with `xhsops hot`.
2. Read trend spec, creation spec, taboo rules, prompt contract, and trend lessons.
3. Fill `fit-check.md` before drafting.
4. Only draft when the fit verdict is positive.
5. If unfit, preserve the rejection rationale in artifacts.

## Campaign Workflow

1. Use campaign flow for multi-note planning.
2. Produce `proposal.md`, `brief.md`, `tasks.md`, then note drafts/reviews.
3. End with `retrospective.md` and knowledge updates.

## Review Rules

- Use light review for quick workflow unless the user asks for a stricter gate.
- Use standard review for trend and campaign outputs by default.
- Review must call out brand mismatch, weak hooks, CTA issues, and taboo risks.

## Archive Rules

- Summarize what worked, what failed, and what should be reused.
- Write reusable lessons back into `.xhsops/knowledge/`.
- Update both `retrospective.md` and the relevant knowledge file.

## Response Shape

- Keep chat output concise.
- Always cite the artifact paths you updated.
- End with the next recommended command or slash command.
