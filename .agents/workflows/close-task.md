# Workflow: /close-task

Follow this step-by-step workflow when completing and closing an active task.

## Step 1 — Verification & Gate Checks
- Verify that **Adversarial QA** status in `CURRENT_TASK.md` is set to `Approved`.
- Confirm that the **Pending** checklist in `CURRENT_TASK.md` is empty.
- Ensure all tests pass clean with zero failing or skipped assertions.

## Step 2 — Archive to Changelog
- Copy the completion summary from `CURRENT_TASK.md`.
- Append a new log entry to `CHANGELOG.md` using the `[TEMPLATE]` structure:
  - Date & Timestamp
  - Completed items & features
  - Pending follow-ups (if any)
  - Execution notes

## Step 3 — Reset Task State
- Clear the active body of `CURRENT_TASK.md`.
- Reset `CURRENT_TASK.md` to its default empty state, ready for the next task.
- Update `ROADMAP.md` to move the completed item from `In Progress` to `Completed`.
