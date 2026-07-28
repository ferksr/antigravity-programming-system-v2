#!/usr/bin/env bash
# Verifies that CURRENT_TASK.md permits code modification in the active execution step.
set -euo pipefail

TASK_FILE="CURRENT_TASK.md"
TARGET_FILE="${1:-}"

# Always allow updates to governance state, documentation, and configuration files
if echo "$TARGET_FILE" | grep -qE "(CURRENT_TASK\.md|ROADMAP\.md|CHANGELOG\.md|KNOWN_ISSUES\.md|LEARNINGS\.md|README\.md|ARCHITECTURE\.md|TESTING\.md|\.gitignore|\.env\.example|\.agents/|notes/)"; then
  exit 0
fi

if [ ! -f "$TASK_FILE" ]; then
  echo "Hook Blocked: CURRENT_TASK.md does not exist. Create a task plan before writing source code files." >&2
  exit 1
fi

# Extract the active step header line strictly
ACTIVE_STEP=$(grep -i "\*\*Current Step\*\*:" "$TASK_FILE" || true)

if echo "$ACTIVE_STEP" | grep -qi "Execution"; then
  exit 0
fi

echo "Hook Blocked: File write attempted to '$TARGET_FILE' outside of Execution step (Step 5). Current step status: $ACTIVE_STEP" >&2
exit 1
