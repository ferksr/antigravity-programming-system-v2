#!/usr/bin/env bash
# Re-injects current active task and step context into prompt state before invocation.
set -euo pipefail

TASK_FILE="CURRENT_TASK.md"

if [ -f "$TASK_FILE" ]; then
  echo "--- CURRENT ACTIVE TASK CONTEXT ---"
  cat "$TASK_FILE"
  echo "------------------------------------"
else
  echo "No active CURRENT_TASK.md found."
fi

exit 0
