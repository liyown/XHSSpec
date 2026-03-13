# `/xhs:publish`

Use this command when the user wants to turn a finished draft into a publish package.

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
- `cover-brief.md`
- `assets.md`
- `demo.html`
- `publish-guide.md`

## Writeback Protocol

1. Treat the latest reviewed draft as the source of truth.
2. Produce assets that help the human publish, not just another copy of the draft.
3. Make `demo.html` screenshot-ready for visuals or slides.
4. Keep `<placeholder>...</placeholder>` only for genuinely unresolved details.

## Response Shape

1. Final publish title
2. Cover direction
3. Visual/demo direction
4. Publishing checklist
5. Recommended next step
