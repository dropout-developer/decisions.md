# Decisions

Worked example for a fictional project, "Ledger", a small payments service.
This shows the shape of a real log, including one superseded decision.

Read this file before any architectural change. Append a record after one.
Do not edit past records except to change a status.

## Index

- [DEC-0001: Keep a decision log](#dec-0001-keep-a-decision-log)
- [DEC-0002: Postgres is the single system of record](#dec-0002-postgres-is-the-single-system-of-record)
- [DEC-0003: Store money as integer minor units](#dec-0003-store-money-as-integer-minor-units)
- [DEC-0004: Idempotency keys on every write endpoint](#dec-0004-idempotency-keys-on-every-write-endpoint)
- [DEC-0005: Move reads to replicas and cache balances](#dec-0005-move-reads-to-replicas-and-cache-balances)

---

## DEC-0001: Keep a decision log

- Date: 2026-01-04
- Status: Accepted
- Context: Two engineers have now independently proposed switching ORMs, not
  knowing the first attempt was reverted for migration-safety reasons. The
  reasoning was in a Slack thread that is gone.
- Decision: We will keep a single append-only `DECISIONS.md` at the repo root.
  Substantial architectural and cross-cutting choices get a record. Records are
  immutable once accepted, except for status changes.
- Consequences: A few minutes of writing per architectural change. The payoff is
  that the next person, or the next agent, sees the reasoning before acting.

---

## DEC-0002: Postgres is the single system of record

- Date: 2026-01-11
- Status: Superseded by DEC-0005
- Context: We need durable storage for accounts, transactions, and balances.
  Options considered: a single Postgres instance, Postgres plus a Redis cache
  from day one, or a document store. Team is three people. Transaction volume is
  under 20 writes per second.
- Decision: We will run one Postgres instance as the only system of record. No
  cache layer. Balances are computed by summing transaction rows inside a
  serializable transaction. Simplicity and correctness over throughput at this
  stage.
- Consequences: Every read hits the primary. Balance queries get slower as the
  transaction table grows. Acceptable until roughly 100 writes per second or
  when p95 read latency passes 200 ms, at which point this should be revisited.

---

## DEC-0003: Store money as integer minor units

- Date: 2026-01-11
- Status: Accepted
- Context: Floating point cannot represent most decimal currency values exactly.
  Rounding drift in a payments ledger is a correctness bug, not a cosmetic one.
- Decision: We will store all monetary amounts as signed 64-bit integers in the
  currency's minor unit (cents for USD, paise for INR). Currency code is stored
  alongside every amount. No floating point anywhere in the money path,
  including in transport (JSON numbers are strings for amounts).
- Consequences: Application code multiplies and divides by the minor-unit factor
  at the display boundary only. Currencies with three decimal places (for
  example BHD) are handled by the per-amount currency code. Clients must parse
  amount strings, not JSON numbers.

---

## DEC-0004: Idempotency keys on every write endpoint

- Date: 2026-02-02
- Status: Accepted
- Context: A client retry after a network timeout created a duplicate transfer in
  staging. Retries are unavoidable. The server currently has no way to tell a
  retry from a new request.
- Decision: We will require an `Idempotency-Key` header on every POST that moves
  money. The server stores the key with the response for 24 hours. A repeat of
  the same key returns the stored response and does not re-run the operation.
- Consequences: One extra table (`idempotency_records`) and a lookup on the
  write path. Clients must generate and reuse a key per logical operation. Keys
  older than 24 hours are swept nightly.

---

## DEC-0005: Move reads to replicas and cache balances

- Date: 2026-05-19
- Status: Accepted
- Context: Supersedes DEC-0002. We are now at 140 writes per second and p95 read
  latency on balance queries is 340 ms. The single-instance assumption in
  DEC-0002 has reached the limit it named.
- Decision: We will add two Postgres read replicas and route all non-critical
  reads to them. Account balances are cached in Redis, written through on every
  transaction commit, and reconciled against a full row sum nightly. The primary
  remains the only writer and the source of truth.
- Consequences: Reads can be stale by the replication lag, typically under
  100 ms, which is acceptable for everything except the pre-transfer balance
  check, which still reads the primary. New failure modes: replica lag spikes
  and cache and ledger divergence, both alerted on. Operational cost rises by
  the two replica instances and one Redis instance.
