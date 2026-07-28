#!/usr/bin/env python3
"""
Stop hook: prevents task closure if Adversarial QA has not been approved.

The gate only activates when the close-task workflow has explicitly initiated closure
by setting "Closing: Initiated" in CURRENT_TASK.md. This prevents the hook from
blocking every normal agent pause between workflow steps.

Input (stdin):  JSON with executionNum, terminationReason, fullyIdle, etc.
Output (stdout): JSON { "decision": "continue"|"", "reason": "..." }
              "continue" re-enters the execution loop; "" allows the stop.
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

        # Only enforce the gate when close-task has explicitly initiated closure.
        # Without this marker, the hook transparently allows all normal stops.
        closing_initiated = bool(
            re.search(r"\*\*Closing\*\*:\s*Initiated", content, re.IGNORECASE)
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
