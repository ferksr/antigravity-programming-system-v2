#!/usr/bin/env python3
"""
Stop hook: prevents task closure if Adversarial QA has not been approved.

The gate only activates when the close-task workflow has explicitly initiated closure
by setting "Closing: Initiated" in CURRENT_TASK.md. This prevents the hook from
blocking normal agent pauses between workflow steps.

Input (stdin):  JSON with executionNum, terminationReason, fullyIdle, etc.
Output (stdout): JSON { "decision": "continue"|"", "reason": "..." }
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

        # Only enforce the gate when close-task has explicitly initiated closure.
        closing_initiated = bool(
            re.search(r"Closing\**:?\**\s*Initiated", content, re.IGNORECASE)
        )
        if not closing_initiated:
            print(json.dumps({"decision": ""}))
            return

        # Closing is in progress — block until QA is approved.
        if re.search(r"Adversarial\s+QA\**:?\**\s*Approved", content, re.IGNORECASE):
            print(json.dumps({"decision": ""}))
        else:
            print(json.dumps({
                "decision": "continue",
                "reason": (
                    "Closing Gate Blocked: Adversarial QA status is not 'Approved' "
                    "in CURRENT_TASK.md. The adversarial-qa subagent must approve "
                    "the task before it can be closed."
                ),
            }))

    except FileNotFoundError:
        print(json.dumps({"decision": ""}))


if __name__ == "__main__":
    main()
