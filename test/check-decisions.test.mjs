import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/check-decisions.mjs", import.meta.url));
const ROOT = fileURLToPath(new URL("..", import.meta.url));

function run(...args) {
  try {
    const stdout = execFileSync("node", [BIN, ...args], { encoding: "utf8" });
    return { code: 0, stdout, stderr: "" };
  } catch (err) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

function withFile(contents, fn) {
  const dir = mkdtempSync(join(tmpdir(), "dec-"));
  const path = join(dir, "DECISIONS.md");
  try {
    writeFileSync(path, contents);
    return fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const VALID = `# Decisions

## DEC-0001: First

- Date: 2026-01-01
- Status: Accepted
- Context: A real tension existed.
- Decision: We will do the thing.
- Consequences: Some tradeoff.

---

## DEC-0002: Second

- Date: 2026-02-01
- Status: Superseded by DEC-0003
- Context: It was fine at the time.
- Decision: We will do the other thing.
- Consequences: Worked until it did not.

---

## DEC-0003: Third

- Date: 2026-03-01
- Status: Accepted
- Context: Supersedes DEC-0002.
- Decision: We will do the better thing.
- Consequences: Costs more.
`;

test("shipped decision logs, example, and template all pass", () => {
  const res = run(
    join(ROOT, "DECISIONS.md"),
    join(ROOT, "DECISIONS.example.md"),
    join(ROOT, "template.md"),
  );
  assert.equal(res.code, 0, res.stderr);
});

test("a well-formed file passes", () => {
  withFile(VALID, (p) => {
    const res = run(p);
    assert.equal(res.code, 0, res.stderr);
  });
});

test("missing required field fails", () => {
  const bad = `## DEC-0001: X

- Date: 2026-01-01
- Status: Accepted
- Context: Something.
- Decision: We will.
`;
  withFile(bad, (p) => {
    const res = run(p);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /missing required field "Consequences"/);
  });
});

test("invalid status fails", () => {
  const bad = VALID.replace("Status: Accepted", "Status: Maybe");
  withFile(bad, (p) => {
    const res = run(p);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Status "Maybe" is not one of/);
  });
});

test("non-ISO date fails", () => {
  const bad = VALID.replace("2026-01-01", "Jan 1 2026");
  withFile(bad, (p) => {
    const res = run(p);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /not ISO 8601/);
  });
});

test("duplicate id fails", () => {
  const bad = VALID.replace("## DEC-0002: Second", "## DEC-0001: Second");
  withFile(bad, (p) => {
    const res = run(p);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /duplicate id/);
  });
});

test("non-ascending ids fail", () => {
  const bad = VALID.replace("## DEC-0002: Second", "## DEC-0009: Second").replace(
    "## DEC-0003: Third",
    "## DEC-0004: Third",
  );
  withFile(bad, (p) => {
    const res = run(p);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /not strictly ascending/);
  });
});

test("dangling supersede pointer fails", () => {
  const bad = VALID.replace("Superseded by DEC-0003", "Superseded by DEC-0404");
  withFile(bad, (p) => {
    const res = run(p);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /no such record exists/);
  });
});

test("HTML comment blocks are ignored", () => {
  const withComment =
    VALID +
    `\n<!--\n## DEC-9999: template stub\n- Status: bogus\n-->\n`;
  withFile(withComment, (p) => {
    const res = run(p);
    assert.equal(res.code, 0, res.stderr);
  });
});

test("--version prints a version", () => {
  const res = run("--version");
  assert.equal(res.code, 0);
  assert.match(res.stdout.trim(), /^\d+\.\d+\.\d+$/);
});
