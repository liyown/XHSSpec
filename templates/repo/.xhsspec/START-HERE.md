# XHSSpec Start Here

Use this checklist before your first real content run.

## Placeholder Rule

- Use `<placeholder>...</placeholder>` for any field that is intentionally incomplete.
- Do not leave empty bullets or vague filler text.
- Before moving to the next deterministic step, replace placeholders or keep the workflow blocked.

## Minimum Files To Fill

1. `brand/profile.md`
2. `brand/audience.md`
3. `brand/offer.md`
4. `brand/tone.md`
5. `brand/taboo.md`
6. `strategy/content-pillars.md`
7. `strategy/topic-frameworks.md`

Brand positioning must be complete before creation starts. You can keep refining it during creation, but you should not skip it.

## First Real Workflow

### Single note

1. Run `xhs-spec quick --idea "..."`
2. Use `/xhs:quick`
3. Run `xhs-spec review --target <id>`
4. Use `/xhs:rewrite`
5. Run `xhs-spec publish --target <id>`
6. Use `/xhs:publish`
7. Run `xhs-spec archive --target <id>`

### Trend reaction

1. Run `xhs-spec hot --topic "..."`
2. Use `/xhs:hot`
3. Run `xhs-spec fit --target <id> --verdict approved|rejected`
4. If approved, continue to draft and review
5. Archive the lesson

### Structured campaign

1. Run `xhs-spec plan --theme "..."`
2. Use `/xhs:plan`
3. Draft and review each note
4. Archive campaign lessons

## Rule Of Thumb

- CLI handles structure and state.
- Agent handles drafting and judgment.
- Repo files hold the lasting knowledge.
