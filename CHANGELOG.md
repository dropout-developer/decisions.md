# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Before 1.0.0, minor
versions may contain breaking changes to the spec, called out explicitly here.

## [Unreleased]

## [0.1.0] - 2026-09-08

### Added

- Initial specification in `README.md`: file purpose, relationship to
  `README.md` and `AGENTS.md`, location and precedence rules for monorepos, the
  record template and field rules, the supersession procedure, the agent
  protocol, adoption steps, and FAQ.
- `template.md`: a blank `DECISIONS.md` seeded with `DEC-0001`.
- `DECISIONS.example.md`: a worked five-record example including a superseded
  decision.
- `bin/check-decisions.mjs`: a zero-dependency linter for numbering, required
  fields, ISO 8601 dates, valid status values, and dangling supersede pointers.
- `test/check-decisions.test.mjs`: tests for the linter using the Node built-in
  test runner.

[Unreleased]: https://github.com/dropout-developer/decisions.md/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/dropout-developer/decisions.md/releases/tag/v0.1.0
