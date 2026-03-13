# Proposal: Productize Agent Flow And Publish Experience

## Summary

Turn XHSSpec from a technically correct workflow engine into a more usable Xiaohongshu operations product inside AI coding tools.

This change focuses on four product-facing improvements:

1. Make first-run creation feel natural in slash-command environments
2. Clarify the handoff boundary between deterministic CLI steps and agent-authored artifacts
3. Make `publish` a visible product payoff, not just a terminal export step
4. Keep archive and knowledge loop lightweight enough for early adoption

## Why

The current system already has the right primitives:

- repo-first artifacts
- deterministic workflow steps
- spec / command / prompt contracts
- review / iterate / publish / archive stages

But the first-use experience is still too engine-shaped.

Current pain points:

- newly created runs immediately look like “in-progress” workflow states
- next-step guidance is too command-centric and not agent-oriented enough
- being blocked by gates is technically correct, but not yet product-friendly
- `publish` exists, but is not yet framed or structured as the most visible value moment
- archive and knowledge loop are useful, but should not feel heavy for first-time users

The product goal is not just “make the workflow more correct.”

The product goal is:

**make XHSSpec feel like a practical Xiaohongshu operations companion that is easy to start, easy to continue, and worth coming back to.**

## Goals

- Introduce a clear run-creation state that means “scaffold created, waiting for agent completion”
- Make status and next-step outputs guide both the human and the agent
- Make slash-command usage the primary mental model in docs and integrations
- Redefine publish as a posting-package stage, not a simple export
- Preserve versioned artifacts, review loop, archive loop, and repo-first knowledge

## Non-goals

- No GUI
- No account integration
- No automatic publishing
- No analytics ingestion
- No cloud sync or multi-user backend
- No rewrite of the deterministic CLI model

## Scope

### In scope

- workflow state refinement
- next-step and status UX
- gate messaging
- publish package structure and contracts
- slash-command-facing docs and host integration guidance
- lightweight archive / knowledge positioning

### Out of scope

- post-performance dashboards
- external content fetching
- AI model routing / provider abstraction
- collaborative approval workflows

## Expected Outcome

After this change, the ideal user path should feel like:

```text
xhs-spec init --tools claude-code
  ↓
user says /xhs:quick
  ↓
agent completes first-round artifacts
  ↓
/xhs:review
  ↓
/xhs:rewrite
  ↓
/xhs:publish
  ↓
user gets a real posting package
  ↓
/xhs:archive
  ↓
knowledge is retained without feeling heavy
```

The result should be a system that is:

- easier to start
- easier to continue
- easier to publish with
- easier to learn from over time
