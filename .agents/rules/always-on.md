---
trigger: always_on
glob: ""
description: "Core task lifecycle rules, step declarations, next step suggestions, document maintenance, error handling, adversarial QA, scope discipline, protected boundaries, and content markers."
---

# Always-On Agent Operational Rules

## Task Workflow & Step Discipline
- **Step Declaration at Start**: At the beginning of every response, explicitly declare which step of the current workflow you are in (e.g., `Step 2: Planning in CURRENT_TASK.md`).
- **Step Status at End**: At the end of every response, state explicitly whether the active step is complete or remains open.
- **Strict Step Gating**: Never advance to the next workflow step without explicitly declaring that the current step is completed.
- **Workflow Triggers**: When starting a task, follow the `/new-task` workflow. When completing a task, follow the `/close-task` workflow.
- **Process Feedback**: If the user provides workflow or process feedback, record it immediately in `LEARNINGS.md`.

## Next Step Suggestion
- When completing a response or wrapping up a step, review `ROADMAP.md` and `CURRENT_TASK.md` to suggest the next logical step.
- If there is no active task or planned item, explicitly state this and ask the user how they would like to proceed.

## Documentation Synchronization
- **Structure Updates**: If adding, deleting, or renaming directories/files, update the "Structure" section of `README.md` in the same commit.
- **Session Closure**: Upon completing a session or task, append an entry to `CHANGELOG.md`.
- **Architectural Decisions**: Whenever an architectural decision is made or modified, update or create an ADR in the same commit following the `/new-adr` workflow.
- **Roadmap Sync**: Any movement of roadmap items must be reflected in `ROADMAP.md` in the same commit.

## Error Handling & Root Cause Analysis
- **Pattern Search**: Search for other instances of the same error across the codebase before applying a fix.
- **Step-by-Step Reasoning**: Identify the true root cause using step-by-step diagnostic reasoning. Do not apply superficial patches or mask errors.
- **Comprehensive Fix**: Fix the root cause and all identified secondary occurrences simultaneously.
- **Known Issues Log**: Document the root cause and resolution in `KNOWN_ISSUES.md`.
- **Failure Threshold**: If the same fix attempt fails 2 or more times consecutively, stop execution immediately and consult the user.

## Adversarial QA
- **Independent Validation Role**: Act with an adversarial mindset during QA execution—assume the changes contain errors and actively seek edge-case failures rather than seeking validation.
- **Justified Approval**: Approval must be accompanied by explicit justification detailing why the change satisfies all criteria.
- **Hook Trigger**: Adversarial QA is triggered mechanically via hook upon reaching the "Execution QA" step.

## Persistence
- All work products, scratchpads, plans, and state files MUST be saved directly in the repository filesystem, never kept solely in ephemeral chat memory or IDE artifacts.

## Scope Discipline
- Do not add features, libraries, refactors, or optimizations that were not explicitly requested.
- If an out-of-scope improvement is identified, propose it in conversational text only; do not implement it autonomously.

## Protected Boundaries (Do Not Touch Without Explicit Authorization)
- Do not modify files outside those specified in the task request without explicit user approval.
- Do not edit `.agents/rules/`, `ARCHITECTURE.md`, or CI configuration files unless explicitly requested.
- Do not perform `git push` or merge branches without human confirmation.
- **Exception**: Files covered under "Documentation Synchronization" (`README.md`, `CHANGELOG.md`, `ROADMAP.md`, `CURRENT_TASK.md`, `KNOWN_ISSUES.md`, `LEARNINGS.md`) are automatically updated as required by workflow steps.

## Content Marking Conventions
- `[COMPLETE: instruction]` — Specific missing item to be filled in; replaced entirely when completed.
- `[TEMPLATE]` — Standard template block; copied and completed for new instances, template itself remains intact.
- `[APPEND]` — Log section; new entries are appended at the bottom, existing history is never modified or erased.
- `[EDITABLE]` — Active state block; reflects current status and is overwritten as state evolves.
- *Unmarked text* — Static governance text; not edited during routine operations.
