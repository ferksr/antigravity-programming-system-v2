# Workflow: /close-task

Follow this step-by-step workflow when completing and closing an active task.

## Step 1 — Initiate Closure & Run Adversarial QA
- Update **Closing** in `CURRENT_TASK.md` to `Initiated`.
  *(This activates the closing-checklist-gate Stop hook.)*
- Update **Current Step** in `CURRENT_TASK.md` to `Step 6: Closing`.
- If **Adversarial QA** is not already `Approved`:
  - Update **Adversarial QA** in `CURRENT_TASK.md` to `In Progress`.
  - Use `invoke_subagent` to spawn the `adversarial-qa` subagent (`.agents/agents/adversarial-qa.md`).
  - Wait for the subagent to set **Adversarial QA** to `Approved` or `Rejected`.
  - If `Rejected`: address the blocking defects, reset **Adversarial QA** to `Pending`, re-run the subagent, and repeat until `Approved`.

## Step 2 — Verification Gate
- Confirm **Adversarial QA** is `Approved` in `CURRENT_TASK.md`.
- Confirm the **Pending** checklist in `CURRENT_TASK.md` is empty.
- Ensure all tests pass clean with zero failing or skipped assertions.

## Step 3 — Archive to Changelog
- Copy the completion summary from `CURRENT_TASK.md`.
- Append a new log entry to `CHANGELOG.md` using the `[TEMPLATE]` structure:
  - Date & Timestamp
  - Completed items & features
  - Pending follow-ups (if any)
  - Execution notes

## Step 4 — Reset Task State
- Reset `CURRENT_TASK.md` to its default empty state (all fields cleared, Closing back to `Idle`).
- Update `ROADMAP.md` to move the completed item from `In Progress` to `Completed`.
