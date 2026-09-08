# Contributing

Thanks for helping shape `DECISIONS.md`. There are two kinds of contribution and
they move at different speeds.

## Changes to the spec

The spec lives in [`README.md`](README.md). It aims to stay small and stable, so
changes to the format itself go through a proposal:

1. Open an issue using the **Spec proposal** template. State the problem with the
   current wording, the change you want, and at least one real repo where the
   current spec falls short.
2. Discussion happens on the issue. A proposal that only adds optional guidance
   moves faster than one that changes a required field.
3. Once there is rough agreement, open a pull request that edits `README.md`, and
   if the change touches record structure, update
   [`DECISIONS.example.md`](DECISIONS.example.md) and
   [`bin/check-decisions.mjs`](bin/check-decisions.mjs) to match.

Backward compatibility matters. A repo that was valid against the previous spec
should not silently become invalid. If it must, the pull request has to say so
and the change waits for a minor version bump.

## Changes to the linter or docs

Typos, clearer wording, linter bugs, new linter checks that enforce something the
spec already requires: open a pull request directly, no issue needed.

For a new linter check, add a case to
[`test/check-decisions.test.mjs`](test/check-decisions.test.mjs) that fails
before your change and passes after.

## Local setup

No dependencies. You need Node 18 or newer.

```bash
git clone https://github.com/dropout-developer/decisions.md
cd decisions.md
node --test            # run the linter tests
npm run check          # lint the worked example
```

## Style

- No em-dashes or en-dashes anywhere: files, commit messages, or comments. Use a
  colon, a hyphen, parentheses, or two sentences.
- Wrap prose near 80 columns.
- Commit messages: imperative mood, lowercase subject, explain the why in the
  body when it is not obvious.

## Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking
part you agree to uphold it.
