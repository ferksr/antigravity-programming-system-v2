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
- Append a new entry to `CHANGELOG.md` under `## Log [APPEND]` using this exact structure:
  ```
  ### [YYYY-MM-DD] [Task Title]
  - **Completed**: [Summary of completed features or fixes]
  - **Pending**: [Items left for future tasks, or "None"]
  - **Notes**: [Execution context or relevant findings]
  ```
- Do not remove or modify any existing entries.

## Step 4 — Reset Task State
- Reset `CURRENT_TASK.md` to the following exact default state:
  ```
  # Current Active Task State [EDITABLE]

  This file maintains operational state for the active task. It is updated during workflow execution and reset upon task closure.

  - **Task**: [COMPLETE: Title of active task]
  - **Origin**: [COMPLETE: User prompt, feature issue, or roadmap item]
  - **Current Step**: Step 1: Requirements & Clarification
  - **Plan**:
    1. [COMPLETE: Step-by-step technical execution plan]
  - **Completed So Far**:
    - [COMPLETE: Items completed in active task]
  - **Pending**:
    - [COMPLETE: Action items remaining for completion]
  - **Notes**: [COMPLETE: Relevant technical constraints or decisions]
  - **Adversarial QA**: Pending
  - **Closing**: Idle
  ```
- Update `ROADMAP.md` to move the completed item from `In Progress` to `Completed`.
