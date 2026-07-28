#!/usr/bin/env bash
# Triggers adversarial QA subagent evaluation (.agents/subagents/adversarial-qa.md) when task reaches QA step.
set -euo pipefail

TASK_FILE="CURRENT_TASK.md"

if [ -f "$TASK_FILE" ]; then
  if grep -qi "QA" "$TASK_FILE" || grep -qi "Adversarial QA" "$TASK_FILE"; then
    echo "Hook Trigger: Invoking Adversarial QA Subagent (.agents/subagents/adversarial-qa.md) for step verification."
  fi
fi

exit 0
