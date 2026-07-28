# Antigravity AI Agent Development System Specification

This document defines the architecture, operational rules, workflows, and governance structure for building applications using AI agents in Antigravity IDE.

---

## 1. Repository Structure Overview

- `README.md` — Project description, architecture overview, directory tree, and quick start instructions.
- `ARCHITECTURE.md` — Architectural design records (ADRs), system boundaries, and structural decisions.
- `CONTRIBUTING.md` — Git branching model, atomic commit conventions, PR workflows, and code review standards.
- `CHANGELOG.md` — Append-only record of completed tasks, feature releases, and version history.
- `TESTING.md` — Testing levels (Unit, Integration, E2E), coverage guidelines, and required test execution commands.
- `KNOWN_ISSUES.md` — Log of resolved errors, root cause analyses, symptoms, and workaround documentation.
- `ROADMAP.md` — Project backlog organized into Wishlist, Planned, In Progress, and Completed items.
- `CURRENT_TASK.md` — Active task operational state tracking steps, plans, pending items, and QA approval.
- `LEARNINGS.md` — Log of process feedback, user preferences, and operational guidelines learned over time.
- `.agents/rules/` — Core operational rules enforced on AI agents (`always-on.md`, `ai-pitfalls.md`, `conventions.md`).
- `.agents/workflows/` — Step-by-step callable workflows (`new-task.md`, `close-task.md`, `new-adr.md`, `process-inbox.md`).
- `.agents/hooks/` — Automated execution gates and validation hooks (`hooks.json`, shell scripts).
- `.agents/agents/` — Auto-discovered custom subagent definitions (`adversarial-qa.md`).
- `notes/inbox/`, `notes/processed/` — Unstructured idea inbox and archive for project planning.

---

## 2. Agent Operational Rules Summary

### 2.1 Always-On Operational Rules (`.agents/rules/always-on.md`)
- **Step Declaration**: Declare active workflow step at the start of every response.
- **Step Status**: State whether the active step is complete or open at the end of every response.
- **Strict Step Gating**: Never advance to implementation without completing step declarations.
- **Workflow Triggers**: Follow `/new-task` when starting a task, and `/close-task` when closing a task.
- **Documentation Maintenance**: Automatically update `README.md` structure, `CHANGELOG.md`, `ROADMAP.md`, and `ARCHITECTURE.md` as work completes.
- **Adversarial QA**: Mechanical verification step via independent QA subagent (`.agents/agents/adversarial-qa.md`). Invoked explicitly during Step 3 of /new-task and Step 1 of /close-task.
- **Scope Discipline**: Implement only explicitly requested changes. Propose out-of-scope improvements in text only.
- **Protected Boundaries**: Never modify `.agents/rules/`, `ARCHITECTURE.md`, or CI configurations without explicit authorization.

### 2.2 AI Pitfall Mitigations (`.agents/rules/ai-pitfalls.md`)
- Acknowledge uncertainty and inspect source files before making assumptions.
- Avoid over-explaining or writing verbose preamble.
- Report test outcomes and execution status in a neutral, objective tone without positive spin.
- Periodically re-inject context to prevent instruction decay during long sessions.

### 2.3 Universal Coding Conventions (`.agents/rules/conventions.md`)
- Comments explain "why", not "what".
- Zero dead code, temporary stubs, or commented-out blocks.
- Idiomatic file and variable naming matching target language standards.

---

## 3. Workflows (`.agents/workflows/`)

- `/new-task` (`.agents/workflows/new-task.md`): Requirements clarification -> Task planning in `CURRENT_TASK.md` -> Plan QA review -> User approval.
- `/close-task` (`.agents/workflows/close-task.md`): Invoke adversarial-qa subagent -> Verify QA Approved -> Append to `CHANGELOG.md` -> Reset `CURRENT_TASK.md` -> Update `ROADMAP.md`.
- `/new-adr` (`.agents/workflows/new-adr.md`): Copy ADR template -> Complete alternatives & context -> Add to decision index in `ARCHITECTURE.md`.
- `/process-inbox` (`.agents/workflows/process-inbox.md`): Read inbox note -> Propose destination mapping -> User confirmation -> Move to `/notes/processed/`.

---

## 4. Automated Hooks (`.agents/hooks/`)

The system enforces quality gates via `.agents/hooks/hooks.json`:
- `gate-execution-by-step`: Blocks file writes outside of `Step 5: Execution` via `python ./.agents/hooks/check-step-allows-write.py`.
- `protect-rigid-files`: Prevents accidental edits to `.agents/rules/` or `ARCHITECTURE.md` via `python ./.agents/hooks/protect-files.py`.
- `trigger-adversarial-qa`: When active task is in Step 3 (Plan QA Review) or Step 6 (Closing) with QA Pending, injects an ephemeral reminder to invoke the adversarial-qa subagent via `python ./.agents/hooks/trigger-qa-subagent.py`.
- `closing-checklist-gate`: Blocks task closure unless `Adversarial QA` is Approved via `python ./.agents/hooks/check-closing-checklist.py`.
- `reinject-current-step`: Re-injects active task context into prompt state via `python ./.agents/hooks/inject-current-task.py`.

---

## 5. Subagents (`.agents/agents/`)

- `adversarial-qa` (`.agents/agents/adversarial-qa.md`): Clean-context evaluation subagent for inspecting diffs, running tests, and granting or denying task completion approval.
