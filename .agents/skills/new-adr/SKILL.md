---
name: new-adr
description: Documents an Architectural Decision Record (ADR) following standard structure and linking to architecture docs.
---

# Workflow: /new-adr

Follow this workflow whenever a significant architectural decision is made or modified.

## Steps
1. Create a new markdown file under `docs/adr/` using the naming pattern `YYYY-MM-DD-short-title.md`.
2. Populate using the standard ADR template:
   - **Title**: [Context / Decision]
   - **Status**: [Proposed | Accepted | Superseded]
   - **Context**: Problem statement and background.
   - **Decision**: Technical decision made and rationale.
   - **Consequences**: Positive and negative trade-offs.
3. Update `ARCHITECTURE.md` to reference the new ADR.
