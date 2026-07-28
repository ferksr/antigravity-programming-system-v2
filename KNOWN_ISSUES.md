# Known & Resolved Issues Log

Registry for logging bug investigations, root cause diagnoses, and resolution records.

## Issue Entry Template [TEMPLATE]

```markdown
### [ISSUE-ID]: [Issue Title]
- **Status**: Investigating | Resolved | Workaround
- **Reported**: [YYYY-MM-DD]
- **Symptom**: [Description of observed failing behavior]
- **Root Cause**: [Detailed step-by-step diagnostic conclusion]
- **Secondary Instantiations**: [Other instances of the same error found in codebase]
- **Resolution**: [Description of root-cause fix]
- **Reference**: [Commit hash or PR link]
```

---

## Resolved Log [APPEND]

*No resolved issues logged yet.*

---

### ISSUE-001: Seven Systemic Bugs in Initial Template Setup
- **Status**: Resolved
- **Reported**: 2026-07-28
- **Symptom**: Hooks using incorrect JSON contracts; workflow steps inconsistent; Stop hook blocked all agent pauses; regex missed relative paths.
- **Root Cause**:
  - BUG-1: `check-step-allows-write.sh` regex `[/\]\.agents[/\]` failed for relative paths starting with `.agents/`.
  - BUG-2: Same file — `[COMPLETE:` check ran before step check, blocking Execution-phase writes.
  - BUG-3: `check-closing-checklist.sh` Stop hook returned `continue` for ALL active tasks with QA Pending, preventing normal agent pauses.
  - BUG-4: `new-task.md` Step 3 never updated `Current Step`, so `trigger-qa-subagent.sh` hook never triggered.
  - BUG-5: `new-task.md` Step 4 referenced "Step 5: Execution" with no Step 5 section.
  - BUG-6: `close-task.md` verified QA approval without ever invoking the adversarial-qa subagent.
  - BUG-7: `antigravity-programming-system.md` had stale `.agents/subagents/` path after relocation.
- **Secondary Instantiations**: `README.md` directory tree was missing `antigravity-programming-system.md`.
- **Resolution**: Fixed regex for relative paths; reordered step-check logic; Stop hook now only activates on `Closing: Initiated` marker; updated workflows with step declarations, QA invocation steps, and Step 5; fixed all stale references.
- **Reference**: Session 2026-07-28 adversarial QA audit

---

### ISSUE-002: Three Additional Bugs Found in Second Audit Pass
- **Status**: Resolved
- **Reported**: 2026-07-28
- **Symptom**: Stale step name in rules; potential duplicate subagent invocations; workflow described impossible file operation.
- **Root Cause**:
  - BUG-8: `always-on.md` referenced "Execution QA step" — a step name that does not exist in any workflow file.
  - BUG-9: `new-task.md` and `close-task.md` did not set `Adversarial QA: In Progress` before invoking the subagent, allowing the PostInvocation hook to inject repeated reminders and potentially trigger duplicate subagent invocations.
  - BUG-10: `process-inbox.md` Step 5 instructed the agent to "move" a file, but Antigravity has no `delete_file` tool — the operation was physically impossible.
- **Resolution**: Updated `always-on.md` with correct step names. Added "set QA to In Progress" instruction before invoke_subagent in both workflows. Rewrote process-inbox Step 5 to copy + mark with [PROCESSED] prefix instead of move.
- **Reference**: Session 2026-07-28 second audit pass
