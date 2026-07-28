#!/usr/bin/env python3
"""
PreToolUse hook: blocks source code file writes outside of Step 5 (Execution).
Governance, documentation, and agent configuration files are always allowed through.

Input (stdin):  JSON with toolCall.args.TargetFile
Output (stdout): JSON { "decision": "allow"|"deny", "reason": "..." }
"""
import json
import re
import sys
import os

# Governance, system spec, and configuration files that can be edited across any step.
# Uses re.search to match both relative and absolute paths on any OS.
ALWAYS_ALLOWED = re.compile(
    r"(CURRENT_TASK\.md|ROADMAP\.md|CHANGELOG\.md|KNOWN_ISSUES\.md|LEARNINGS\.md"
    r"|README\.md|ARCHITECTURE\.md|TESTING\.md|CONTRIBUTING\.md|LICENSE"
    r"|antigravity-programming-system\.md|\.gitignore|\.env\.example"
    r"|\.agents[/\\]|\.github[/\\]|(^|[/\\])notes[/\\]|\.gitkeep)"
)

TASK_FILE = "CURRENT_TASK.md"


def main():
    data = json.load(sys.stdin)
    target_file = data.get("toolCall", {}).get("args", {}).get("TargetFile", "")

    if ALWAYS_ALLOWED.search(target_file):
        print(json.dumps({"decision": "allow"}))
        return

    if not os.path.exists(TASK_FILE):
        print(json.dumps({
            "decision": "deny",
            "reason": (
                f"CURRENT_TASK.md does not exist. "
                f"Run /new-task to create a task plan before writing '{target_file}'."
            ),
        }))
        return

    with open(TASK_FILE, encoding="utf-8") as f:
        content = f.read()

    step_match = re.search(r"\*\*Current Step\*\*:(.*)", content, re.IGNORECASE)
    active_step = step_match.group(1).strip() if step_match else "(unknown step)"

    # Step check is the single source of truth — must be in Execution step to write source files.
    if "execution" in active_step.lower():
        print(json.dumps({"decision": "allow"}))
    else:
        print(json.dumps({
            "decision": "deny",
            "reason": (
                f"Write to '{target_file}' blocked: not in Execution step. "
                f"Current step: {active_step}"
            ),
        }))


if __name__ == "__main__":
    main()
