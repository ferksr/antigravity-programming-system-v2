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
  - **Closing**: Set to `Idle`.
- Do NOT write or edit source code files during this planning phase.

## Step 3 — Plan QA Review
- Update **Current Step** in `CURRENT_TASK.md` to `Step 3: Plan QA Review`.
- Update **Adversarial QA** in `CURRENT_TASK.md` to `In Progress`.
  *(This silences the PostInvocation hook reminder to prevent duplicate invocations.)*
- Use `invoke_subagent` to spawn the `adversarial-qa` subagent (`.agents/agents/adversarial-qa.md`).
- The subagent will inspect the plan and set **Adversarial QA** to `Approved` or `Rejected`.
- If `Rejected`: address the blocking issues, reset **Adversarial QA** to `Pending`, and repeat step 3.

## Step 4 — User Confirmation & Approval
- Update **Current Step** in `CURRENT_TASK.md` to `Step 4: User Confirmation`.
- Present the approved plan to the user.
- Wait for explicit user confirmation before executing any code changes.
- Once approved, update **Current Step** to `Step 5: Execution` and proceed.

## Step 5 — Execution
- Implement the plan exactly as approved.
- Update **Completed So Far** and **Pending** as items are finished.
- Do not deviate from the approved plan scope. Propose any out-of-scope improvements in text only.
- When all **Pending** items are resolved, run `/close-task`.
