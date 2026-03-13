# `/xhs:plan`

Use this command when the user wants a structured campaign, series, or experiment.

## Read

- `.xhsspec/config.yaml`
- `.xhsspec/brand/*`
- `.xhsspec/strategy/*`
- `.xhsspec/specs/note.spec.md`
- `.xhsspec/specs/creation.spec.md`
- `.xhsspec/knowledge/*`
- target campaign `proposal.md`, `brief.md`, `tasks.md`
- `.xhsspec/prompts/campaign-plan.md`

## Write

- `proposal.md`
- `brief.md`
- `tasks.md`

## Writeback Protocol

1. Start with campaign thesis and audience.
2. Propose 3-5 notes, each with one angle and one hypothesis.
3. Keep sequence logic explicit.
4. Leave `tasks.md` aligned with the planned note sequence.
5. Use `<placeholder>...</placeholder>` for any still-unresolved field.

## When Blocked

- If `xhs-spec draft` is blocked, go back and finish `proposal.md`, `brief.md`, or `tasks.md`.
- Keep the note sequence in sync with `tasks.md`; do not draft against stale plan files.

## Response Shape

1. Campaign goal summary
2. 3-5 candidate notes
3. One hypothesis per note
4. Sequence recommendation
5. Recommended next step
