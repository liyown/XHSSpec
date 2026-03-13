# Design: Productize Agent Flow And Publish Experience

## Design Intent

The current architecture is already structurally strong:

- deterministic commands create and advance artifacts
- agents interpret brand/spec context and write content
- repo files serve as the durable memory layer

The next step is not architectural reinvention.

The next step is product shaping.

This design treats the problem as four connected surfaces:

1. run creation and handoff
2. next-step navigation
3. publish as a media-package stage
4. lightweight archive and knowledge return

---

## 1. Run Creation And Handoff

### Problem

Today, `quick`, `hot`, and `plan` create workflow artifacts and immediately place the run into states that imply work has already started.

That collapses two distinct moments:

```text
scaffold created
!=
first meaningful artifact completed by agent
```

### Design Direction

Introduce a dedicated state:

```text
created
```

Meaning:

- repo directories and initial files exist
- deterministic setup is finished
- first-round artifact content is not yet considered complete
- the next actor is the agent

### Proposed State Shape

#### Quick

```text
created -> drafting -> reviewed -> done -> archived
```

#### Trend

```text
created -> fit-checking -> fit-approved|fit-rejected -> drafting -> reviewed -> done|dropped -> archived
```

#### Campaign

```text
created -> planned|briefing -> drafting -> reviewing -> iterating -> ready -> archived
```

### Key Rule

`created` is not a generic limbo state.

It only means:

- run scaffold exists
- initial artifacts are present
- agent has not yet completed the first required content pass

Once the first required artifacts are substantively filled, the run should transition into the formal workflow.

---

## 2. Next-Step As Product Navigation

### Problem

The current `nextStep` model is a single string. That is enough for an engine, but too thin for a product experience.

In practice there are two audiences:

- the human user
- the agent operating on repo contracts

These audiences need different next-step guidance.

### Design Direction

Status output should conceptually separate:

```text
human_next
agent_next
```

### Human-facing guidance should answer

- where am I in the workflow?
- why am I blocked?
- what should I ask the agent to do next?

### Agent-facing guidance should answer

- what command contract should I read?
- which prompt contracts matter?
- which artifacts do I need to complete?

### Target UX

```text
run: quick-001
status: created

human next:
  Ask the agent to complete the first brief and draft.

agent next:
  Read .xhsspec/commands/xhs-quick.md
  Read .xhsspec/prompts/quick-brief.md
  Read .xhsspec/prompts/quick-draft.md
  Write brief.md and draft.md
```

### Gate UX Principle

When blocked, the system should not merely say:

```text
Cannot proceed
```

It should say:

```text
You cannot continue because fit-check.md still has unresolved placeholders.
Ask the agent to finish fit-check.md first.
```

This keeps correctness while improving usability.

---

## 3. Publish As Posting Package

### Problem

If publish is treated as simple export, XHSSpec will still feel too close to a generic AI writing tool.

### Design Direction

Publish should be understood as:

```text
final draft -> posting package
```

Not:

```text
final draft -> copied note
```

### Product Meaning

Publish is where a draft becomes a post.

That means publish must transform writing artifacts into publishing artifacts.

### Current Output

Current package already includes:

- `note.md`
- `cover-brief.md`
- `assets.md`
- `demo.html`
- `publish-guide.md`
- `package.yaml`

### Refined Target Model

Recommended direction:

```text
publish/<date>/<run-id>-<title>/
  note.md
  first-screen.md
  visual-plan.md
  demo.html
  posting-guide.md
  post-meta.yaml
```

### Why This Structure

- `note.md`: final copy
- `first-screen.md`: first-screen strategy, not just “cover”
- `visual-plan.md`: visual breakdown, image directions, slide/storyboard logic
- `demo.html`: screenshot-ready visual asset, not reading preview
- `posting-guide.md`: publishing steps, checks, and post-publish follow-up
- `post-meta.yaml`: tracking surface for note ID / URL / publish time / follow-up observations

### Publish Product Principle

The publish package should help answer:

- what exactly do I post?
- what should the first screen say?
- what images or screenshots should I prepare?
- what can I screenshot directly from demo assets?
- what should I check before posting?
- what should I record after posting?

---

## 4. Archive And Knowledge Loop

### Problem

Archive and knowledge are crucial to the long-term value of XHSSpec, but they should not create too much drag in the first-use experience.

### Design Direction

Keep archive lightweight in the first product phase:

- always create durable retrospective artifacts
- always write back a usable knowledge entry
- avoid forcing deep retrospectives before users trust the system

### Product Principle

First:

```text
make completion feel good
```

Then:

```text
make learning accumulate naturally
```

### Long-term Direction

Later phases may add:

- cross-run lesson aggregation
- spec update suggestions
- stronger knowledge mining

But that is secondary to making the current workflow feel smooth.

---

## Design Summary

This change is not about adding more commands.

It is about rebalancing the product around four ideas:

```text
created handoff
  + clearer navigation
  + stronger publish payoff
  + lighter but durable learning loop
```

If done well, the system will still be repo-first and deterministic where needed, but it will feel much more like a real operating product inside AI coding tools.
