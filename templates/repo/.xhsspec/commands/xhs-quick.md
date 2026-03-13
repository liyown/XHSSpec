# `/xhs:quick`

Use this command when the user wants to turn a single idea into a Xiaohongshu note quickly.

## Read

- `.xhsspec/config.yaml`
- `.xhsspec/brand/*`
- `.xhsspec/strategy/*`
- `.xhsspec/specs/note.spec.md`
- `.xhsspec/specs/creation.spec.md`
- `.xhsspec/knowledge/winning-patterns.md`
- target quick run `brief.md`
- `.xhsspec/prompts/quick-brief.md`
- `.xhsspec/prompts/quick-draft.md`

## Write

- target quick run `brief.md`
- target quick run `draft.md`

## Writeback Protocol

1. Fill `brief.md` first, then draft from that brief.
2. Keep frontmatter intact.
3. Replace `<placeholder>...</placeholder>` when repo context is sufficient.
4. If context is still missing, either write one explicit assumption or keep a precise `<placeholder>...</placeholder>` block.

## When Blocked

- If `xhs-spec review` is blocked, go back and finish `brief.md` or `draft.md`.
- Do not ask the human to rerun `xhs-spec quick` for the same run.
- When blocked, name the exact file you will finish next.

## Response Shape

1. One-sentence angle summary
2. Key hook options
3. Draft body
4. CTA rationale
5. Recommended next step
