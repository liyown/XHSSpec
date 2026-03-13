# Tasks: Productize Agent Flow And Publish Experience

## P0: Handoff And Navigation

- [x] Add a dedicated `created` run state for quick, trend, and campaign workflows
- [x] Define exact transition rules from `created` into formal workflow states
- [x] Update status and next-step logic to stop recommending run-creation commands for existing runs
- [x] Split next-step guidance conceptually into human-facing and agent-facing outputs
- [x] Improve gate messages so they explain why a step is blocked and what file must be completed

## P0: Slash-Command-First Experience

- [x] Rework slash-command guidance so users are led through `/xhs:*` flows instead of CLI-first usage
- [x] Tighten command contracts for `/xhs:quick`, `/xhs:hot`, `/xhs:review`, `/xhs:rewrite`, and `/xhs:publish`
- [x] Ensure integrations explain what the agent should read, write, and do when blocked by placeholders

## P1: Publish As Product Payoff

- [x] Redefine the publish package around posting assets, not just export artifacts
- [x] Decide final package structure (`first-screen`, `visual-plan`, `demo`, `posting-guide`, `post-meta`)
- [x] Update publish contracts so `demo.html` is explicitly a screenshot asset, not a reading preview
- [x] Strengthen publish guidance for before-posting, posting, and after-posting actions

## P1: Status, Docs, And Product Surface

- [x] Update README and docs to describe XHSSpec as a slash-command-first content operations product
- [x] Reframe publish as the first major value moment in docs and integrations
- [x] Improve status output so it clearly shows missing artifact completion and recommended agent action

## P2: Lightweight Learning Loop

- [x] Keep archive lightweight while still producing durable retrospectives
- [x] Ensure knowledge writeback remains useful without adding too much first-use friction
- [x] Define a later-phase direction for cross-run learning and spec-update suggestions
