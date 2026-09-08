# Decisions

This repository follows its own spec. This file records why the project is shaped
the way it is.

Rule for everyone, humans and agents: read this file before proposing or making
any structural change to the spec, the record format, or the linter. After making
one, append a record below, update the index, and do not edit past records except
to change a status.

## Index

- [DEC-0001: Keep a decision log](#dec-0001-keep-a-decision-log)
- [DEC-0002: One file at the repo root, not a folder of records](#dec-0002-one-file-at-the-repo-root-not-a-folder-of-records)
- [DEC-0003: The linter is a single dependency-free Node script](#dec-0003-the-linter-is-a-single-dependency-free-node-script)
- [DEC-0004: DEC- prefix for ids, ADR- accepted for compatibility](#dec-0004-dec--prefix-for-ids-adr--accepted-for-compatibility)
- [DEC-0005: Distribute on npm as decisions.md with a check-decisions bin](#dec-0005-distribute-on-npm-as-decisionsmd-with-a-check-decisions-bin)

---

## DEC-0001: Keep a decision log

- Date: 2026-09-08
- Status: Accepted
- Context: The project defines a decision-log standard. Not using one here would be
  a credibility problem, and it removes the best test of whether the format is
  pleasant to maintain.
- Decision: We will keep this `DECISIONS.md` and hold it to the same rules the
  spec asks of adopters. `AGENTS.md` links here.
- Consequences: Every spec or format change carries a record. The file doubles as
  a second worked example next to `DECISIONS.example.md`.

---

## DEC-0002: One file at the repo root, not a folder of records

- Date: 2026-09-08
- Status: Accepted
- Context: The established ADR convention is `docs/adr/NNNN-title.md`, one file per
  record, with tooling like `adr-tools` and Log4brains. We had to choose what the
  spec recommends as the default.
- Decision: The spec recommends a single `DECISIONS.md` at the repository root,
  with nested files per package in a monorepo. The folder form stays explicitly
  compatible and is the recommended escape hatch once a file gets long (past
  roughly 40 records or 1500 lines).
- Consequences: "Append one record" is a trivial, low-conflict edit, which
  matters for agents. One predictable path sits next to `AGENTS.md`. The cost is
  that a very active project eventually outgrows the single file and has to split
  it, which the spec now tells them how to do.

---

## DEC-0003: The linter is a single dependency-free Node script

- Date: 2026-09-08
- Status: Accepted
- Context: Validation could be a real parser with a Markdown AST library, a
  published framework with plugins, or a thin script. The thing being validated
  is a handful of headings and bullet lines.
- Decision: `bin/check-decisions.mjs` is one file, no dependencies, line-based
  matching with regular expressions. It can be vendored by copying the file. It
  is also published so `npx check-decisions` works.
- Consequences: Zero supply-chain surface and trivial review. It will never
  understand full Markdown, so pathological formatting can slip past it. That is
  an acceptable trade for a format this small.

---

## DEC-0004: DEC- prefix for ids, ADR- accepted for compatibility

- Date: 2026-09-08
- Status: Accepted
- Context: Projects with an existing ADR history use `ADR-NNN` ids. A hard
  requirement to renumber would block adoption for exactly the projects that most
  need a decision log.
- Decision: The spec's canonical prefix is `DEC-`. The linter also accepts
  `ADR-`. The requirement is a stable, unique, ascending id, not a specific
  prefix.
- Consequences: An existing `ADR-`-numbered log is conformant as-is. New projects
  get a prefix that does not collide with the `ADR-` records they may copy in
  from elsewhere.

---

## DEC-0005: Distribute on npm as decisions.md with a check-decisions bin

- Date: 2026-09-08
- Status: Accepted
- Context: The linter needs a run path that does not ask people to clone this
  repo. Options were a curl-to-shell installer, a Go binary with releases, or an
  npm package. The audience already has Node in CI more often than anything else.
- Decision: Publish the package as `decisions.md` exposing a `check-decisions`
  binary, MIT, with provenance. Vendoring the single script stays a supported
  path for people who do not want `npx`.
- Consequences: One `npx check-decisions` line drops into most CI setups.
  Non-Node projects are not served directly, but the file is short enough to port
  or vendor.
