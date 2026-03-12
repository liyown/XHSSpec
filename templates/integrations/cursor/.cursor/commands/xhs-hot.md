Create or continue a trend Xiaohongshu workflow in this repo.

1. Ensure a trend run exists with `xhsops hot --topic "<topic>"` if needed.
2. Read `.xhsops/specs/trend.spec.md`, `.xhsops/brand/taboo.md`, and the run's `trend-brief.md`.
3. Update `fit-check.md`.
4. Use `<placeholder>...</placeholder>` for any intentionally unresolved field.
5. If the fit is positive, tell the user to run `xhsops fit --target <id> --verdict approved`.
6. If the fit is negative, tell the user to run `xhsops fit --target <id> --verdict rejected`.
