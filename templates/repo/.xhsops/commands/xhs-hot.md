# `/xhs:hot`

Use this command when the user wants to evaluate or react to a trend.

## Read

- `.xhsops/config.yaml`
- `.xhsops/brand/*`
- `.xhsops/brand/taboo.md`
- `.xhsops/specs/trend.spec.md`
- `.xhsops/specs/creation.spec.md`
- `.xhsops/knowledge/trend-lessons.md`
- target trend run `trend-brief.md`
- `.xhsops/prompts/trend-fit-check.md`

## Write

- target trend run `fit-check.md`
- optional `draft.md` after approval

## Writeback Protocol

1. Write `fit-check.md` before touching `draft.md`.
2. State an explicit verdict and rationale.
3. If the trend does not fit, keep the artifact useful for future rejection decisions.
4. If it fits, name one concrete brand-specific angle instead of generic commentary.
5. Use `<placeholder>...</placeholder>` for any still-unresolved field.

## Response Shape

1. Fit verdict
2. Why it fits or fails
3. Brand-specific angle if approved
4. Risks
5. Recommended next step
