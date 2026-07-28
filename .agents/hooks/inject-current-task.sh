#!/usr/bin/env python3
"""
PreInvocation hook: re-injects the current active task context into the conversation
before each model call to prevent instruction decay during long sessions.

Input (stdin):  JSON with invocationNum, initialNumSteps, conversationId, etc.
Output (stdout): JSON { "injectSteps": [{ "ephemeralMessage": "..." }] }
"""
import json
import sys

TASK_FILE = "CURRENT_TASK.md"


def main():
    # Consume stdin (required by hook contract even if unused)
    sys.stdin.read()

    try:
        with open(TASK_FILE) as f:
            content = f.read()

        # Skip injection when file is still a blank template
        if "[COMPLETE:" in content or not content.strip():
            print(json.dumps({"injectSteps": []}))
            return

        message = (
            "--- CURRENT ACTIVE TASK CONTEXT ---\n"
            + content
            + "\n-----------------------------------"
        )
        print(json.dumps({"injectSteps": [{"ephemeralMessage": message}]}))

    except FileNotFoundError:
        print(json.dumps({"injectSteps": []}))


if __name__ == "__main__":
    main()
