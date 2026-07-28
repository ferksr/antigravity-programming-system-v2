#!/usr/bin/env python3
"""
PostInvocation hook: injects a reminder to invoke the adversarial-qa subagent
when the active task is in Step 3 (Plan QA Review) or Step 6 (Closing) and QA status is still Pending.

Input (stdin):  JSON with invocationNum, initialNumSteps, conversationId, etc.
Output (stdout): JSON { "injectSteps": [...], "terminationBehavior": "" }
"""
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
TASK_FILE = os.path.join(PROJECT_ROOT, "CURRENT_TASK.md")


def main():
    # Consume stdin (required by hook contract even if unused)
    sys.stdin.read()

    try:
        with open(TASK_FILE, encoding="utf-8") as f:
            content = f.read()

        step_match = re.search(r"\*\*Current Step\*\*:(.*)", content, re.IGNORECASE)
        qa_match = re.search(r"Adversarial QA\**:?\**\s*(.*)", content, re.IGNORECASE)

        active_step = step_match.group(1).strip() if step_match else ""
        qa_status = qa_match.group(1).strip() if qa_match else ""

        in_qa_step = bool(re.search(r"step\s*3|qa\s*review|step\s*6", active_step, re.IGNORECASE))
        qa_pending = "pending" in qa_status.lower()

        if in_qa_step and qa_pending:
            message = (
                "Reminder: Adversarial QA review is required for the active task step. "
                "Set 'Adversarial QA: In Progress' and use invoke_subagent to spawn the "
                "adversarial-qa subagent (.agents/agents/adversarial-qa.md) to evaluate "
                "the task changes in CURRENT_TASK.md."
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
