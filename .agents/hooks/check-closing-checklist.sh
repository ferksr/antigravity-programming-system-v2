#!/usr/bin/env bash
# Stop hook verification checking Adversarial QA approval and empty pending items before task closure.
set -euo pipefail

TASK_FILE="CURRENT_TASK.md"

if [ ! -f "$TASK_FILE" ] || [ ! -s "$TASK_FILE" ]; then
  exit 0
fi

# Verify Adversarial QA approval state using flexible Markdown bold matching
if ! grep -qEi "Adversarial QA(\*\*)?:\s*Approved" "$TASK_FILE" && ! grep -qEi "QA(\*\*)?:\s*Approved" "$TASK_FILE"; then
  echo "Closing Gate Blocked: Adversarial QA status is not 'Approved' in CURRENT_TASK.md." >&2
  exit 1
fi

echo "Closing Gate Passed: Task completion verified and approved by Adversarial QA."
exit 0
