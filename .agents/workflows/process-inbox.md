# Workflow: /process-inbox

Follow this workflow to process raw ideas, notes, or feature requests stored in `/notes/inbox/`.

## Step 1 — Read Raw Inbox Notes
- Read the target note file in `/notes/inbox/` completely before performing any mapping.

## Step 2 — Draft Target Mapping
- Map each note point or idea to its appropriate destination document:
  - System goals/overview -> `README.md`
  - High-level feature ideas -> `ROADMAP.md` (Wishlist / Planned)
  - Architectural proposals -> `ARCHITECTURE.md` (New ADR with status `Proposed`)
  - Known bugs or workarounds -> `KNOWN_ISSUES.md`

## Step 3 — Resolve Ambiguity
- If an idea is vague, underspecified, or contradicts existing architecture, consult the user. Do not force ambiguous items into governance docs.

## Step 4 — User Confirmation
- Present the complete proposed note mapping to the user.
- Wait for user confirmation before writing changes to target files.

## Step 5 — Archive Processed Note
- Write the mapped items to the target governance documents.
- Create a copy of the processed note in `notes/processed/<filename>`.
- Prepend `[PROCESSED: YYYY-MM-DD]` to the original file in `notes/inbox/<filename>` to mark it as done.
  *(There is no delete_file tool in Antigravity — the original is marked, not removed.)*
