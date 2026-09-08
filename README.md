# DECISIONS.md

[![CI](https://github.com/dropout-developer/decisions.md/actions/workflows/ci.yml/badge.svg)](https://github.com/dropout-developer/decisions.md/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/decisions.md.svg)](https://www.npmjs.com/package/decisions.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A predictable file at the root of a repository that records why the system is
built the way it is, as an append-only log that both humans and AI coding agents
read before architectural work and append to after it.

If [`AGENTS.md`](https://agents.md) tells an agent *how to work* in your repo,
`DECISIONS.md` tells it *what has already been decided* and why, so it does not
quietly undo choices that were made on purpose.

## The idea in one paragraph

Codebases lose their reasoning. The framework choice, the service boundary, the
"we tried the other thing and it broke" all live in someone's memory or a closed
pull request. A new contributor, or the next agent session, re-litigates it or
reverses it by accident. `DECISIONS.md` is one file, always in the same place,
where each of those choices is written down once in a fixed shape and never
rewritten.

## Relationship to other files

| File | Question it answers | Lifecycle |
| :--- | :--- | :--- |
| `README.md` | How do I install, build, and run this? | Edited in place |
| `AGENTS.md` | How should an agent behave in this repo (commands, style, guardrails)? | Edited in place |
| `DECISIONS.md` | Why is the system shaped this way? | Appended; past entries are immutable |

They are complementary. `AGENTS.md` should link to `DECISIONS.md` and instruct
the agent to read it before architectural changes.

## Location and precedence

- The primary file is `DECISIONS.md` at the repository root.
- In a monorepo, a significant package may have its own nested `DECISIONS.md`
  for decisions local to that package. The root file stays the index and holds
  cross-cutting decisions.
- Nearest file wins for local context. The root file is always in scope for
  questions about the architecture as a whole.

## File structure

1. A short header: what the file is, and the one rule (read before architectural
   work, append after).
2. Optional: links to nested decision logs.
3. An index of records: id, title, and a link to the anchor.
4. The records, each following the template below, separated by a horizontal
   rule (`---`).

Order records oldest first or newest first. Pick one and keep it.

## Record template

```markdown
## DEC-0001: Short title, noun phrase or "We will ..."

- Date: 2026-01-31
- Status: Accepted
- Context: The forces at play. What made a decision necessary now. The
  constraints, and the alternatives that were genuinely considered.
- Decision: What was chosen, in full sentences, active voice. "We will ..."
- Consequences: What gets easier, what gets harder, what new constraint this
  imposes, and any follow-up work it creates.
```

### Field rules

- **id**: `DEC-` followed by a zero-padded number that only ever goes up and is
  never reused. If your repo already uses `ADR-`, keep it. The point is a stable
  unique id, not the prefix.
- **Date**: ISO 8601 (`YYYY-MM-DD`), the date the status last changed.
- **Status**: exactly one of `Proposed`, `Accepted`, `Deprecated`,
  `Superseded by DEC-XXXX`.
- **Context, Decision, Consequences**: all three are required. If you cannot
  write a real tension into Context, this is probably a task, not a decision, and
  it belongs in your changelog instead.

### Superseding a decision

You do not edit the old record's reasoning. You:

1. Add a new record that states the new decision.
2. In the new record's Context, add a line: `Supersedes DEC-0002.`
3. In the old record, change only the status to `Superseded by DEC-0007`.

History stays readable. Someone can see what was true before and why it changed.

## What belongs in DECISIONS.md

- Choice of language, runtime, framework, or a major dependency, when the
  alternatives were real.
- Service boundaries, data ownership, sync and consistency strategy.
- Auth model, session model, persistence model.
- Deployment topology and the release pipeline.
- Repository-wide constraints: naming, versioning policy, typography, error
  shapes.
- Anything a future contributor would otherwise reverse without knowing the cost.

## What does not belong

- Bug fixes and routine changes. That is the changelog and git history.
- Anything with only one viable option. No decision was made.
- Secrets, credentials, or host addresses that rotate. Link to where they live.
- Style nits a linter already enforces.

## The agent protocol

An agent working in a repository that contains a `DECISIONS.md`:

1. **Reads it first.** Before proposing or making any architectural,
   infrastructural, data-model, auth, or integration change, it reads the root
   `DECISIONS.md` and the nearest nested one.
2. **Does not contradict an Accepted record.** If it believes a record is wrong,
   it proposes a new record that supersedes it, with reasoning. It does not
   silently diverge.
3. **Appends after a qualifying change.** It adds a new record using the
   template, updates the index, and sets the status to `Accepted`, or `Proposed`
   if the change needs human review.
4. **Never rewrites history.** Existing records are immutable except for a status
   change when they are superseded or deprecated.

Copy this block into your `AGENTS.md` so the agent is told to follow it.

## Adopting it

1. Create `DECISIONS.md` at your repo root. See
   [`template.md`](template.md) for a blank file and
   [`DECISIONS.example.md`](DECISIONS.example.md) for a worked example.
2. Make `DEC-0001` the decision to keep a decision log.
3. Backfill three to five decisions you already regret explaining twice.
4. Link the file from `README.md` and `AGENTS.md`.
5. Optional: run the linter in CI to verify numbering, required fields, status
   values, and dangling supersede pointers.

```bash
npx check-decisions DECISIONS.md
```

The linter is a single file with no dependencies. Vendor
[`bin/check-decisions.mjs`](bin/check-decisions.mjs) directly if you would rather
not add `npx`.

## FAQ

**Is this just ADRs?**
The record shape is derived from ADRs (Michael Nygard, 2011) and MADR. What
`DECISIONS.md` adds is a fixed filename and location, a monorepo precedence rule,
and an explicit protocol for agents to read and append. If you already have
`ADR-` records, you already have most of this. Keep your ids.

**Why one file instead of `docs/adr/0001-*.md`?**
The folder-per-record format is fine and this is compatible with it. One file
keeps the whole history in a single predictable place next to `AGENTS.md`, and
makes "append one record" a small, low-risk edit for an agent. Split to a folder
if the file gets hard to scan. A rough threshold is past 40 records or 1500
lines.

**Why not put this in AGENTS.md?**
Different lifecycle. `AGENTS.md` is edited in place as rules change.
`DECISIONS.md` is appended and its past is immutable. Merging them makes
`AGENTS.md` grow without bound and buries the active rules under old history.

**Why not just the README?**
The README answers "how do I use and build this." `DECISIONS.md` answers "why is
it built this way." Different readers, different question.

**Can I have more than one?**
Yes. One per significant package in a monorepo. Nearest file wins for local
context; the root file is always in scope.

**What tool do I need?**
None. It is a Markdown file. The optional linter is a single Node script with no
dependencies.

## License

[MIT](LICENSE). Use it, fork it, adapt the wording.
