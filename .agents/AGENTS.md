# Agent Rules & Governance

This repository enforces operational governance and file protection rules for the AI coding system.

## Critical Protections
- **Antigravity System Protection**: NEVER delete, overwrite, or purge the `.agents/` directory, `antigravity-programming-system.md`, `ARCHITECTURE.md`, `CURRENT_TASK.md`, `ROADMAP.md`, `LEARNINGS.md`, `KNOWN_ISSUES.md`, or any agent rules/workflows/hooks under ANY circumstances — including during project initialization or scaffolding CLI commands (e.g., `npm create`, `npx create-vite --overwrite`, etc.).
- Always preserve governance files and restore them immediately if any external script touches them.

## Working Operational State Files
- The operational files (`CURRENT_TASK.md`, `KNOWN_ISSUES.md`, `ROADMAP.md`, `CHANGELOG.md`, `LEARNINGS.md`, `README.md`) are active working files used daily during workflows (`/new-task`, `/close-task`, `/new-adr`). They are continually updated by the agent as work progresses, but must NEVER be wiped or reset by external project scaffolding commands.
