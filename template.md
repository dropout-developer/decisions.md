# Decisions

This file records why this codebase is shaped the way it is. Each entry is a
decision that was made on purpose, with the reasoning that led to it.

Rule for everyone, humans and agents: read this file before proposing or making
any architectural, infrastructural, data-model, auth, or integration change.
After making one, append a new record below using the same shape, update the
index, and do not edit past records except to change a status.

Full format: https://github.com/dropout-developer/decisions.md

<!-- Nested logs, if this is a monorepo:
- packages/api/DECISIONS.md
- packages/web/DECISIONS.md
-->

## Index

- [DEC-0001: Keep a decision log](#dec-0001-keep-a-decision-log)

---

## DEC-0001: Keep a decision log

- Date: 2026-01-01
- Status: Accepted
- Context: Architectural reasoning in this project has lived in people's heads and
  in closed pull requests. New contributors and automated agents re-open settled
  questions or reverse choices without knowing why they were made.
- Decision: We will keep a single append-only `DECISIONS.md` at the repository
  root. Every substantial architectural or cross-cutting decision gets a record
  with Context, Decision, and Consequences. Records are immutable once accepted,
  except for a status change when superseded or deprecated.
- Consequences: A small tax on each architectural change (write the record). In
  return, the reasoning survives turnover and agent sessions. `AGENTS.md` links
  here and instructs agents to read before architectural work.

---

<!--
Copy this block for each new decision.

## DEC-0002: Title

- Date: YYYY-MM-DD
- Status: Proposed | Accepted | Deprecated | Superseded by DEC-XXXX
- Context:
- Decision: We will ...
- Consequences:

-->
