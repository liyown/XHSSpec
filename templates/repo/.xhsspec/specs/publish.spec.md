# Publish Spec

## Purpose

Turn a reviewed final draft into a screenshot-ready and posting-ready publish package.

## Required Publish Outputs

- repo-root `publish/<date>/<run-id>-<title>/`
- `note.md` with the final post copy
- `first-screen.md` for first-screen messaging and layout strategy
- `visual-plan.md` for visual breakdown, storyboard, and supporting asset suggestions
- `demo.html` as a screenshot-ready visual companion
- `posting-guide.md` with posting steps and checks
- `post-meta.yaml` for posting metadata and follow-up tracking

## Style Selection

- Prefer `.xhsspec/config.yaml` `publish_default_style` when present
- If no default is configured, the agent should ask the user which style they want before generating assets
- Current style presets:
  - `clean-card`
  - `warm-editorial`
  - `bold-contrast`

## Publish Quality Bar

- The package should help a human publish faster, not just duplicate the draft
- Visual suggestions should be concrete enough to design or screenshot
- HTML output should be optimized for screenshot use, not just reading
- `first-screen.md` should explain headline, support line, emotional target, and capture priority
- `visual-plan.md` should describe slide roles, capture directions, and what each visual is proving
- Keep `<placeholder>...</placeholder>` only for genuinely unresolved decisions
- Publish guidance should mention what to do before, during, and after posting
- The chosen style should be reflected in the demo asset and recorded in `post-meta.yaml`
