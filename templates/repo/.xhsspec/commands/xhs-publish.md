# `/xhs:publish`

Use this command when the user wants to turn a finished draft into a publish package.

If the repo already defines `publish_default_style` in `.xhsspec/config.yaml`, use that style automatically.
If no default style is configured, ask the user for a publish style before generating assets. Suggested presets:

- `clean-card`
- `warm-editorial`
- `bold-contrast`

## Read

- latest final draft
- latest review
- `.xhsspec/specs/publish.spec.md`
- `.xhsspec/specs/creation.spec.md`
- `.xhsspec/brand/*`
- `.xhsspec/prompts/publish.md`

## Write

- publish package under `publish/<date>/<run-id>-<title>/`
- `note.md`
- `first-screen.md`
- `visual-plan.md`
- `demo.html`
- `posting-guide.md`
- `post-meta.yaml`

## Writeback Protocol

1. Treat the latest reviewed draft as the source of truth.
2. Produce assets that help the human publish, not just another copy of the draft.
3. Make `demo.html` screenshot-ready for visuals or slides.
4. Keep the package visually consistent with the chosen style preset.
5. Keep `<placeholder>...</placeholder>` only for genuinely unresolved details.

## When Blocked

- If publish is blocked, finish the final draft or `review.md` first.
- Do not generate posting assets from a placeholder-heavy draft.
- `demo.html` is a screenshot asset, not a reading preview.

## Response Shape

1. Final publish title
2. First-screen direction
3. Visual/demo direction
4. Publishing checklist
5. Chosen style
6. Recommended next step
