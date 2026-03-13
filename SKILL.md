---
name: xhs-spec
description: Use when managing Xiaohongshu content operations in a repo-first, spec-driven workflow: planning campaigns, drafting quick notes, reacting to trends, reviewing drafts, and archiving lessons into Markdown/YAML artifacts.
user-invocable: true
---

# XHSSpec Skill

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

- `.xhsspec/config.yaml`
- `.xhsspec/brand/profile.md`
- `.xhsspec/brand/audience.md`
- `.xhsspec/brand/offer.md`
- `.xhsspec/brand/tone.md`
- `.xhsspec/brand/taboo.md`
- `.xhsspec/strategy/content-pillars.md`
- `.xhsspec/strategy/topic-frameworks.md`
- `.xhsspec/specs/note.spec.md`
- `.xhsspec/specs/creation.spec.md`
- `.xhsspec/specs/review.spec.md`
- `.xhsspec/specs/trend.spec.md`

Read when available:

- `.xhsspec/knowledge/winning-patterns.md`
- `.xhsspec/knowledge/failed-patterns.md`
- `.xhsspec/knowledge/trend-lessons.md`
- `.xhsspec/prompts/*.md`
- Current run artifacts under `.xhsspec/quick/`, `.xhsspec/trends/`, `.xhsspec/campaigns/`

## Shared Conventions

- Every workflow writes Markdown/YAML artifacts into `.xhsspec/`.
- Do not keep the canonical result only in chat.
- Keep frontmatter intact.
- Respect deterministic status transitions managed by the CLI.
- Use `.xhsspec/commands/*.md` as the canonical host-agnostic command behavior reference.
- Use `.xhsspec/prompts/*.md` as the content-generation and rewrite contract.
- Use `<placeholder>...</placeholder>` for intentionally incomplete fields. Do not invent vague filler to bypass a gate.

## Quick Workflow

1. Confirm or create a quick run with `xhs-spec quick`.
2. Read brand, strategy, note spec, creation spec, prompt contracts, and winning patterns.
3. Fill `brief.md` first with a concise angle, audience, CTA, and constraints.
4. Fill `draft.md` with structured content aligned to `note.spec.md`.
5. If asked to review, write `review.md` against `review.spec.md`.

## Trend Workflow

1. Confirm or create a trend run with `xhs-spec hot`.
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
- Write reusable lessons back into `.xhsspec/knowledge/`.
- Update both `retrospective.md` and the relevant knowledge file.

## Response Shape

- Keep chat output concise.
- Always cite the artifact paths you updated.
- End with the next recommended command or slash command.
