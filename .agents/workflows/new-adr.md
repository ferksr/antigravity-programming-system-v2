# Workflow: /new-adr

Follow this workflow whenever making or changing a structural or architectural decision.

## Step 1 — Copy ADR Template
- Open `ARCHITECTURE.md`.
- Copy the ADR Template from the `[TEMPLATE]` section.

## Step 2 — Complete ADR Details
- Assign the next sequential ADR number (e.g., `ADR-001`).
- Fill in all sections:
  - **Title**: Descriptive decision name.
  - **Date**: Current date.
  - **Status**: Set initial status to `Proposed`.
  - **Context**: The problem statement and background motivation.
  - **Decision**: The selected architectural approach.
  - **Alternatives Considered**: Options evaluated and why they were rejected.
  - **Consequences**: Positive, negative, and neutral trade-offs.

## Step 3 — Record Proposal
- Append the completed ADR to the end of `ARCHITECTURE.md`.
- Never delete or overwrite previous ADRs; if superseding an old decision, create a new ADR referencing the superseded ADR number.

## Step 4 — Update Decision Index
- Add a new row to the **Decision Index** table at the top of `ARCHITECTURE.md`.
- Seek user review for proposal approval before marking status as `Accepted`.
