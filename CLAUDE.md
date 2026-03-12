# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XHSOps is a repo-first, spec-driven Xiaohongshu (Little Red Book) content operations CLI designed for coding-agent environments. It manages content creation workflows through versioned Markdown/YAML artifacts instead of one-off prompts.

## Commands

```bash
bun run src/cli.ts init              # Initialize operating repo with .xhsops/
bun run src/cli.ts doctor            # Check setup and configuration
bun run src/cli.ts plan --theme "AI效率"     # Plan a campaign
bun run src/cli.ts quick --idea "程序员如何做周报"  # Create quick note
bun run src/cli.ts hot --topic "AI产品更新"    # React to trend
bun run src/cli.ts fit --target trend-xxx --verdict approved  # Trend fit check
bun run src/cli.ts draft --target campaign-xxx --note note-01  # Draft content
bun run src/cli.ts review --target quick-xxx   # Review draft
bun run src/cli.ts iterate --target quick-xxx --round 2  # Iterate on draft
bun run src/cli.ts publish --target quick-xxx   # Publish content
bun run src/cli.ts archive --target quick-xxx --outcome completed  # Archive
bun run src/cli.ts status --all          # Show all runs
bun run src/cli.ts validate --target repo  # Validate setup
bun test                                # Run tests
```

## Architecture

```
src/
├── cli.ts              # Entry point, parses args, creates context
├── commands.ts         # Routes commands to handlers
├── types.ts            # TypeScript types (WorkflowKind, RunStatus, etc.)
├── utils.ts            # Utilities (arg parsing)
├── commands/           # Command implementations
│   ├── index.ts        # Command registry
│   ├── init.ts         # Initialize .xhsops/ repo
│   ├── quick.ts        # Quick note workflow
│   ├── hot.ts          # Trend reaction workflow
│   ├── campaign.ts     # Campaign workflow
│   ├── draft.ts        # Create draft
│   ├── fit.ts          # Trend fit check
│   ├── review.ts       # Review draft
│   ├── iterate.ts      # Iteration workflow
│   ├── publish.ts      # Publish content
│   ├── archive.ts      # Archive completed work
│   ├── status.ts       # Show run status
│   ├── validate.ts     # Validate configuration
│   └── doctor.ts       # Check setup
├── services/           # Business logic
│   ├── workflow.ts     # Workflow state management
│   ├── campaign.ts     # Campaign-specific logic
│   ├── completeness.ts # Completeness checks
│   └── publish.ts      # Publishing logic
└── lib/                # Utilities
    ├── context.ts      # Command context creation
    └── output.ts       # Output formatting
```

## Workflows

- **quick**: Single-note, low-ceremony requests (status: initialized → briefed → drafting → reviewed → done → archived)
- **trend**: Trend fit checks, hot takes, event-driven content (status: initialized → fit-checking → fit-approved/fit-rejected → drafting → reviewed → done/dropped → archived)
- **campaign**: Multi-note planning, weekly/monthly themes (status: initialized → planned → briefing → drafting → reviewing → iterating → ready → archived)

## Key Concepts

- Artifacts stored in `.xhsops/` directory (quick/, trends/, campaigns/)
- CLI manages deterministic state transitions
- Claude handles drafting, reviewing, rewriting, and retrospective synthesis
- Use `<placeholder>...</placeholder>` for intentionally incomplete fields
