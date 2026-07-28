# Changelog

All notable changes to this project will be documented in this file.

## How to Use [APPEND]
- Historical entries are immutable. Append new entries at the top of the log section upon task completion via `/close-task`.

---

## Log [APPEND]

*No changes logged yet.*

---

### [2026-07-28] Template System Bug Fixes & Hooks Redesign
- **Completed**: Rewrote all 5 hook scripts from bash echo patterns to correct Antigravity JSON I/O contract (stdin/stdout). Relocated adversarial-qa subagent to auto-discovery path `.agents/agents/`. Fixed 7 systemic bugs found during adversarial QA audit (see KNOWN_ISSUES ISSUE-001). Created `src/` and `tests/` directories. Cleaned up ADR-001 template in ARCHITECTURE.md.
- **Pending**: None.
- **Notes**: Stop hook redesigned to use `Closing: Initiated` marker to avoid blocking normal agent pauses. Workflows now document all steps including QA invocation and Step 5 Execution.

---

## Entry Template [TEMPLATE]

```markdown
### [[YYYY-MM-DD]] [Task Title]
- **Completed**: [Summary of completed features or fixes]
- **Pending**: [Items left for future tasks]
- **Notes**: [Execution context or relevant findings]
```
