<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## OpenSpec + Beads Integration

This project uses **OpenSpec for planning** and **Beads for work tracking**. They work together:

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **OpenSpec** | Plan and document significant work | Features, breaking changes, architecture |
| **Beads** | Track individual tasks across sessions | Each task from `tasks.md` becomes a bead |

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. PLAN (OpenSpec)                                         │
│     Create proposal.md, tasks.md, spec deltas               │
│     Run: openspec validate <id> --strict                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. TRACK (Beads)                                           │
│     Create bead for each task in tasks.md                   │
│     Include OpenSpec reference in description:              │
│     Run: bd create --title="Task 1.1: ..." --type=task      │
│          Description: "OpenSpec: <change-id>, Task: 1.1"    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. IMPLEMENT                                               │
│     Work through beads one at a time                        │
│     Run: bd update <id> --status=in_progress                │
│     When closing a bead, ALWAYS update tasks.md:            │
│       1. bd close <id>                                      │
│       2. Edit tasks.md: change [ ] to [x] for that task     │
│     ⚠️  A bead is NOT complete until tasks.md is updated    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. ARCHIVE (OpenSpec)                                      │
│     Once ALL beads closed, archive the change               │
│     Run: openspec archive <id> --yes                        │
│     Update specs/ if capabilities changed                   │
└─────────────────────────────────────────────────────────────┘
```

### Quick Reference

```bash
# OpenSpec commands
openspec list                    # See active changes
openspec show <id>               # View change details
openspec validate <id> --strict  # Validate before implementation
openspec archive <id> --yes      # Archive after all tasks complete

# Beads commands
bd ready                         # Find unblocked work
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id>
bd sync                          # Push to remote
```

## Project Workflow

**Before any implementation**, read `CLAUDE.md` for:
- Required workflow (run tests before/after work)
- Available commands (dev, build, lint, test, Prisma/database)
- Architecture overview and folder structure
- Naming conventions and coding patterns

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
