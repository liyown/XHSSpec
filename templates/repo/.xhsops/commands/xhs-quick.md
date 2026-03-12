# `/xhs:quick`

Use this command when the user wants to turn a single idea into a Xiaohongshu note quickly.

## Read

- `.xhsops/config.yaml`
- `.xhsops/brand/*`
- `.xhsops/strategy/*`
- `.xhsops/specs/note.spec.md`
- `.xhsops/specs/creation.spec.md`
- `.xhsops/knowledge/winning-patterns.md`
- target quick run `brief.md`
- `.xhsops/prompts/quick-brief.md`
- `.xhsops/prompts/quick-draft.md`

## Write

- target quick run `brief.md`
- target quick run `draft.md`

## Writeback Protocol

1. Fill `brief.md` first, then draft from that brief.
2. Keep frontmatter intact.
3. Replace `<placeholder>...</placeholder>` when repo context is sufficient.
4. If context is still missing, either write one explicit assumption or keep a precise `<placeholder>...</placeholder>` block.

## Response Shape

1. One-sentence angle summary
2. Key hook options
3. Draft body
4. CTA rationale
5. Recommended next step
