#!/usr/bin/env node
// check-decisions.mjs
// Validates a DECISIONS.md file against the spec:
// https://github.com/dropout-developer/decisions.md
// No dependencies. Usage: check-decisions [path ...]   (default: DECISIONS.md)
// Exit code 0 when every file passes, 1 otherwise.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const HELP = `check-decisions [path ...]

Validate one or more DECISIONS.md files against the spec at
https://github.com/dropout-developer/decisions.md

With no path, checks ./DECISIONS.md. Prints "ok <path>" per passing file and
"err <path>:<line> ..." per problem. Exits non-zero if any file fails.

  --version   print version and exit
  --help      print this message and exit`;

function version() {
  try {
    const pkg = JSON.parse(
      readFileSync(fileURLToPath(new URL("../package.json", import.meta.url))),
    );
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

const STATUS_RE =
  /^(Proposed|Accepted|Deprecated|Superseded by (DEC|ADR)-\d{3,})$/;
const HEADING_RE = /^##\s+((?:DEC|ADR)-(\d{3,})):\s+(.+?)\s*$/;
const FIELD_RE = /^-\s+(Date|Status|Context|Decision|Consequences):\s*(.*)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED = ["Date", "Status", "Context", "Decision", "Consequences"];

function checkFile(path) {
  const problems = [];
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return [`${path}: cannot read file`];
  }

  // Ignore anything inside HTML comments (template blocks, notes).
  const scannable = text.replace(/<!--[\s\S]*?-->/g, (m) =>
    m.replace(/[^\n]/g, " "),
  );
  const lines = scannable.split("\n");
  const records = [];
  let current = null;

  lines.forEach((line, i) => {
    const h = line.match(HEADING_RE);
    if (h) {
      if (current) records.push(current);
      current = {
        line: i + 1,
        id: h[1],
        num: Number(h[2]),
        title: h[3],
        fields: {},
      };
      return;
    }
    if (!current) return;
    const f = line.match(FIELD_RE);
    if (f) current.fields[f[1]] = f[2].trim();
  });
  if (current) records.push(current);

  if (records.length === 0) {
    problems.push(`${path}: no DEC- or ADR- records found`);
    return problems;
  }

  const seen = new Map();
  let lastNum = 0;
  let ascending = true;

  for (const r of records) {
    const where = `${path}:${r.line} ${r.id}`;

    if (seen.has(r.num)) {
      problems.push(
        `${where}: duplicate id, already used at line ${seen.get(r.num)}`,
      );
    }
    seen.set(r.num, r.line);

    if (r.num <= lastNum) ascending = false;
    lastNum = Math.max(lastNum, r.num);

    for (const key of REQUIRED) {
      if (!(key in r.fields)) {
        problems.push(`${where}: missing required field "${key}"`);
        continue;
      }
      if (r.fields[key] === "") {
        problems.push(`${where}: field "${key}" is empty`);
      }
    }

    if (r.fields.Date && !DATE_RE.test(r.fields.Date)) {
      problems.push(
        `${where}: Date "${r.fields.Date}" is not ISO 8601 (YYYY-MM-DD)`,
      );
    }

    if (r.fields.Status && !STATUS_RE.test(r.fields.Status)) {
      problems.push(
        `${where}: Status "${r.fields.Status}" is not one of ` +
          `Proposed, Accepted, Deprecated, "Superseded by DEC-XXXX"`,
      );
    }

    const sup = r.fields.Status && r.fields.Status.match(/Superseded by ((?:DEC|ADR)-\d{3,})/);
    if (sup && !text.includes(`## ${sup[1]}:`)) {
      problems.push(
        `${where}: Status points to ${sup[1]} but no such record exists in this file`,
      );
    }
  }

  if (!ascending) {
    problems.push(
      `${path}: record ids are not strictly ascending by file order`,
    );
  }

  return problems;
}

const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(version());
  process.exit(0);
}
if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

const paths = args.filter((a) => !a.startsWith("-"));
if (paths.length === 0) paths.push("DECISIONS.md");

let failed = false;
for (const p of paths) {
  const problems = checkFile(p);
  if (problems.length === 0) {
    console.log(`ok  ${p}`);
  } else {
    failed = true;
    for (const line of problems) console.error(`err ${line}`);
  }
}

process.exit(failed ? 1 : 0);
