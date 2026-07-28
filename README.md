# [COMPLETE: Project Name]

[COMPLETE: Short 1-line tag line / summary of the project]

## Objective
[COMPLETE: Describe what problem this application solves, target users, and key goals in 2-3 concise lines.]

## Getting Started

### Prerequisites
- [COMPLETE: List required runtime environment, SDKs, or tools, e.g., Node.js >= 20, Python >= 3.11, Docker, etc.]

### Quick Start
```bash
# [COMPLETE: Commands to clone, install dependencies, and run locally]
```

### AI-Assisted Development Workflow
This repository is pre-configured with the **Antigravity AI Agent System** for structured pair-programming.
- **Start a New Task**: Type `/new-task` in the chat to define goals, plan steps, and obtain approval before coding.
- **Close a Task**: Type `/close-task` to verify test coverage, pass Adversarial QA, and log changes to `CHANGELOG.md`.
- **Architectural Decisions**: Type `/new-adr` to propose and record architectural decision records in `ARCHITECTURE.md`.
- **Process Raw Ideas**: Type `/process-inbox` to ingest notes from `notes/inbox/` into project documentation.

---

## Project Structure
```text
.
├── .agents/
│   ├── agents/           # Auto-discovered custom subagent definitions
│   │   └── adversarial-qa.md # Adversarial QA subagent (invoke via invoke_subagent)
│   ├── rules/            # Always-on agent rules & code conventions
│   │   ├── always-on.md  # Core task lifecycle & step gating rules
│   │   ├── ai-pitfalls.md # Hallucination & context decay guardrails
│   │   └── conventions.md # Language-agnostic coding standards
│   ├── workflows/        # Executable step-by-step recipes (/workflow)
│   │   ├── new-task.md   # Initiate and plan new tasks
│   │   ├── close-task.md # Wrap up and archive completed tasks
│   │   ├── new-adr.md    # Record architectural decision records
│   │   └── process-inbox.md # Ingest raw notes from inbox
│   └── hooks/            # IDE hook definitions & enforcement scripts
│       ├── hooks.json    # Pre/Post tool use and lifecycle triggers
│       ├── check-step-allows-write.py
│       ├── inject-current-task.py
│       ├── trigger-qa-subagent.py
│       ├── check-closing-checklist.py
│       └── protect-files.py
├── src/                  # Application source code [COMPLETE]
├── tests/                # Automated unit, integration, and E2E test suites [COMPLETE]
├── notes/
│   ├── inbox/            # Staging directory for raw ideas/notes
│   └── processed/        # Archive directory for ingested notes
├── ARCHITECTURE.md       # ADR repository and architectural design index
├── CONTRIBUTING.md       # Git workflow, commit standards, and PR process
├── CHANGELOG.md          # Historical record of completed sessions/features
├── TESTING.md            # Testing strategy, mandatory regression policy
├── KNOWN_ISSUES.md       # Root-cause bug registry and resolution log
├── ROADMAP.md            # Project goals, wishlist, and active milestones
├── CURRENT_TASK.md       # Active operational task state & QA status
├── LEARNINGS.md          # Feedback log & user preference learnings
└── antigravity-programming-system.md # System architecture & agent spec
```

## Governance & Architecture Reference
- **Agent Rules**: [.agents/rules/always-on.md](.agents/rules/always-on.md)
- **Workflows**: [.agents/workflows/](.agents/workflows/)
- **Hooks & Safety**: [.agents/hooks/hooks.json](.agents/hooks/hooks.json)
- **Adversarial QA Subagent**: [.agents/agents/adversarial-qa.md](.agents/agents/adversarial-qa.md)
- **System Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
