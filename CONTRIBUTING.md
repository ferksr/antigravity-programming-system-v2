# Contribution Guidelines

Guidelines for developers and AI agents contributing to this codebase.

## Branching Strategy
- `main`: Stable release branch. Always kept in a deployable state.
- Feature/Fix branches: Use descriptive prefixes:
  - `feature/<short-description>` for new capabilities.
  - `fix/<short-description>` for bug repairs.
  - `chore/<short-description>` for maintenance or documentation updates.

## Commit Conventions
All commit messages must follow standard Conventional Commits:
- `feat: <description>` — New feature.
- `fix: <description>` — Bug fix.
- `docs: <description>` — Documentation update.
- `refactor: <description>` — Code change that neither fixes a bug nor adds a feature.
- `test: <description>` — Adding or updating test cases.

Commit rules:
- Commit messages must use imperative mood (e.g., `feat: add user authentication handler`).
- Commits must be atomic and represent a single complete unit of work.

## Pull Request (PR) Process
1. Create a descriptive PR using `.github/PULL_REQUEST_TEMPLATE.md`.
2. Mandatory Adversarial QA approval before merging.
3. Synchronize documentation (`README.md`, `CHANGELOG.md`) as part of the PR commit set.
