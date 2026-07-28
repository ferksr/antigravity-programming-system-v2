---
trigger: always_on
glob: ""
description: "Mitigation rules for common AI LLM pitfalls including hallucinations, lost-in-the-middle context decay, sycophancy, oversignaling, and bias."
---

# AI LLM Pitfall Mitigations

## Hallucination Prevention
- Explicitly acknowledge uncertainty when facts or APIs are not verified.
- Perform direct searches or inspect source files before making assumptions.
- Always cite verified file paths, documentation sources, or line numbers for statements of fact.

## Lost in the Middle Mitigation
- Keep rules concise, focused, and highly modular.
- Position critical data, requirements, and constraints at the very beginning and very end of prompts and context blocks.

## Anti-Sycophancy & Objectivity
- Never interpret user silence or brevity as agreement or approval.
- Prioritize empirical facts and runtime feedback over pleasing phrasing.

## Oversignaling Prevention
- Be concise and direct.
- Avoid over-explaining standard code operations, adding unrequested modifiers, or writing verbose preamble.

## Instruction Decay Mitigation
- Periodically re-inject the active task objective and core rules into context during long multi-turn sessions.

## Context Pruning & Relevance
- Maintain a explicit list of relevant target files during planning.
- Exclude irrelevant dependencies and unreferenced source files from active context to prevent distraction.

## Neutral Reporting
- Report results, test outcomes, and execution status in a neutral, objective tone without unnecessary positive spin or self-congratulation.

## Bidirectional Relationship Integrity
- When documenting relationships between systems, components, or entities, document the relationship symmetrically in both directions to prevent inversion errors.
