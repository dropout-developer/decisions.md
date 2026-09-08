# Agent guide

This repo defines the `DECISIONS.md` standard and follows it.

## Before you change anything structural

Read [`DECISIONS.md`](DECISIONS.md). It records why the spec, the record format,
and the linter are the way they are. Do not contradict an Accepted record. If you
think one is wrong, add a new record that supersedes it, with reasoning.

After a change to the spec (`README.md`), the record format, or the linter,
append a new `DEC-` record to `DECISIONS.md` and update its index.

## What lives where

- `README.md`: the spec. Keep it small. Spec changes go through a proposal issue
  first (see [`CONTRIBUTING.md`](CONTRIBUTING.md)).
- `template.md`, `DECISIONS.example.md`: the blank and the worked example. If the
  record format changes, both must change with it.
- `bin/check-decisions.mjs`: the linter. One file, no dependencies. A new check
  needs a matching case in `test/check-decisions.test.mjs`.
- `CHANGELOG.md`: add an `Unreleased` entry for any behavior change.

## Checks

```bash
node --test        # linter tests
npm run check      # lint the shipped example and template
```

## Style

No em-dashes or en-dashes anywhere, including commit messages. Use a colon, a
hyphen, parentheses, or two sentences. Wrap prose near 80 columns.
