---
trigger: always_on
glob: ""
description: "Language-agnostic code quality standards, clean documentation conventions, dead code policies, and naming practices."
---

# Universal Language-Agnostic Coding Conventions

## Code Comments & Documentation
- **Explain "Why", Not "What"**: Comments must explain architectural decisions, business logic rationale, trade-offs, and non-obvious constraints. Do not write redundant comments stating what the syntax already expresses.
- **Self-Documenting Code**: Choose descriptive symbol names and clean abstraction boundaries to make code self-explanatory.

## Code Hygene & Integrity
- **Zero Dead Code**: Remove unused functions, dead variables, unreachable branches, and commented-out code blocks before submitting changes.
- **No Temporary Stubs**: Never leave empty stubs, mock implementations, or silent fallback returns without explicit user authorization and documentation.

## Naming & Structure Conventions
- **Idiomatic Naming**: Adhere strictly to the established casing and naming conventions of the chosen programming language and ecosystem (e.g., camelCase, PascalCase, snake_case, kebab-case).
- **Consistent File Naming**: Match file names to the primary component or module exported. Keep file names uniform and predictable across the codebase.
- **Explicit Error Handling**: Catch and handle specific error types near the call site. Never catch and suppress generic exceptions silently.
