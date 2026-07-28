# Testing Strategy & Policy

Guidelines for testing, test organization, and quality assurance gating.

## Project Test Configuration [EDITABLE]
- **Test Verification Command**: `[COMPLETE: command to run project tests, e.g. npm test, pytest, go test ./...]`
- **Lint / Style Command**: `[COMPLETE: command to run linter, e.g. npm run lint, ruff check, cargo clippy]`

## Testing Levels
1. **Unit Tests**: Verify isolated functions, classes, and utility modules.
2. **Integration Tests**: Verify interactions between database layers, API modules, and external interfaces.
3. **End-to-End (E2E) Tests**: Verify user flows and application behavior (if applicable).

## Mandatory Testing Rules
- **Bug Regression Testing**: Every corrected bug MUST be accompanied by an automated regression test covering the failure scenario.
- **Feature Test Coverage**: Every new feature MUST include automated test coverage for both happy-path execution and relevant edge cases.
- **Green Suite Requirement**: No pull request or task closure is permitted while any test is failing ("red").

## Running Tests
- Execute the command declared under **Project Test Configuration** above before submitting tasks for Adversarial QA approval.
