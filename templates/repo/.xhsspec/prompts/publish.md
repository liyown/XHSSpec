# Publish Prompt Contract

Read:

- latest final draft
- latest review
- `.xhsspec/specs/publish.spec.md`
- `.xhsspec/specs/creation.spec.md`
- `.xhsspec/brand/*`
- publish package files if they already exist
- `.xhsspec/config.yaml`

Write:

- `note.md`
- `first-screen.md`
- `visual-plan.md`
- `demo.html`
- `posting-guide.md`
- `post-meta.yaml`
- place the package under repo-root `publish/<date>/<run-id>-<title>/`

Output requirements:

- if `.xhsspec/config.yaml` defines `publish_default_style`, use it
- otherwise ask the user which style they want before generating assets
- supported presets: `clean-card`, `warm-editorial`, `bold-contrast`
- turn the final draft into a posting-ready package
- give concrete cover and visual directions
- make `demo.html` screenshot-ready rather than plain reading preview
- make `first-screen.md` actionable for someone choosing cover copy and layout
- make `visual-plan.md` actionable for someone preparing screenshots or simple design assets
- keep CTA, tone, and offer aligned with brand files
- use `<placeholder>...</placeholder>` only for genuinely unresolved details
