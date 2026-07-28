#!/usr/bin/env python3
"""
PreToolUse hook: guards .agents/rules/ and ARCHITECTURE.md from accidental modification.
Set env var ALLOW_PROTECTED_EDIT=1 to bypass for authorized changes.

Input (stdin):  JSON with toolCall.args.TargetFile
Output (stdout): JSON { "decision": "allow"|"deny", "reason": "..." }
"""
import json
import re
import sys
import os

PROTECTED = re.compile(r"(^|[/\\])(\.agents[/\\]rules[/\\]|ARCHITECTURE\.md$)")


def main():
    if os.environ.get("ALLOW_PROTECTED_EDIT", "0") == "1":
        print(json.dumps({"decision": "allow"}))
        return

    data = json.load(sys.stdin)
    target_file = data.get("toolCall", {}).get("args", {}).get("TargetFile", "")

    if PROTECTED.search(target_file):
        print(json.dumps({
            "decision": "deny",
            "reason": (
                f"'{target_file}' is a protected governance file. "
                f"Explicit user authorization required. "
                f"Set ALLOW_PROTECTED_EDIT=1 to override."
            ),
        }))
    else:
        print(json.dumps({"decision": "allow"}))


if __name__ == "__main__":
    main()
