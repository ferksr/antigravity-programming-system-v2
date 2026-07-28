#!/usr/bin/env python3
"""
PostInvocation hook: injects a reminder to invoke the adversarial-qa subagent
when the active task is in Step 3 (Plan QA Review) and QA status is still Pending.

The reminder fires only while the condition is true — once the agent invokes the
subagent and QA resolves, the condition clears automatically.

Input (stdin):  JSON with invocationNum, initialNumSteps, conversationId, etc.
Output (stdout): JSON { "injectSteps": [...], "terminationBehavior": "" }
"""
import json
import re
import sys

TASK_FILE = "CURRENT_TASK.md"


def main():
    # Consume stdin (required by hook contract even if unused)
    sys.stdin.read()

    try:
        with open(TASK_FILE) as f:
            content = f.read()

        step_match = re.search(r"\*\*Current Step\*\*:(.*)", content, re.IGNORECASE)
        qa_match = re.search(r"Adversarial QA\**:?\**\s*(.*)", content, re.IGNORECASE)

        active_step = step_match.group(1).strip() if step_match else ""
        qa_status = qa_match.group(1).strip() if qa_match else ""

        in_qa_step = bool(re.search(r"step\s*3|qa\s*review", active_step, re.IGNORECASE))
        qa_pending = "pending" in qa_status.lower()

        if in_qa_step and qa_pending:
            message = (
                "Reminder: The active task is in Step 3 — Plan QA Review. "
                "Use invoke_subagent to spawn the adversarial-qa subagent "
                "(defined in .agents/agents/adversarial-qa.md) to evaluate "
                "the plan in CURRENT_TASK.md before presenting it to the user."
            )
            print(json.dumps({
                "injectSteps": [{"ephemeralMessage": message}],
                "terminationBehavior": "",
            }))
            return

    except FileNotFoundError:
        pass

    print(json.dumps({"injectSteps": [], "terminationBehavior": ""}))


if __name__ == "__main__":
    main()
