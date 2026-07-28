# Workflow: /new-task

Follow this step-by-step workflow whenever initiating a new task or user request.

## Step 1 — Clarification & Requirements
- Review the user's prompt carefully.
- If the requirement is ambiguous, underspecified, or missing critical context, ask clarifying questions before attempting to plan.

## Step 2 — Task Planning
- Open `CURRENT_TASK.md`.
- Populate the initial task state:
  - **Task**: Concise summary of the goal.
  - **Origin**: Reference prompt or feature issue.
  - **Current Step**: Set to `Step 2: Planning`.
  - **Plan**: Outline the exact sequence of technical steps and target files to modify.
  - **Completed So Far**: Leave empty.
  - **Pending**: List the planned action items.
  - **Notes**: Any critical constraints or decisions.
  - **Adversarial QA**: Set to `Pending`.
- Do NOT write or edit source code files during this planning phase.

## Step 3 — Plan QA Review
- Trigger Adversarial QA review of the plan recorded in `CURRENT_TASK.md`.
- Verify that the plan is minimal, precise, addresses root causes, and avoids out-of-scope changes.

## Step 4 — User Confirmation & Approval
- Present the plan to the user.
- Wait for explicit user confirmation before executing any code changes.
- Once approved, update **Current Step** in `CURRENT_TASK.md` to `Step 5: Execution` and proceed with implementation.
