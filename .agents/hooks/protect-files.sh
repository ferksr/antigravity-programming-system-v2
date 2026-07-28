#!/usr/bin/env bash
# Guards core system files and rules from accidental unapproved modification.
set -euo pipefail

TARGET_FILE="${1:-}"

# Allow edit if override environment variable is set
if [ "${ALLOW_PROTECTED_EDIT:-0}" = "1" ]; then
  exit 0
fi

# Protect rule definition files and architectural records unless explicitly authorized
if echo "$TARGET_FILE" | grep -qE "^\.agents/rules/|^ARCHITECTURE\.md"; then
  echo "Hook Blocked: Modification to protected file '$TARGET_FILE' requires explicit user authorization or ALLOW_PROTECTED_EDIT=1." >&2
  exit 1
fi

exit 0
