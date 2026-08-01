---
description: How to run unit tests in this repo. Prefer pnpm test from the workspace root.
alwaysApply: true
---

# Running tests

You **can and should** run `pnpm test` in this repo. Do not skip tests because of assumed environment limits.

## Command

From the workspace root:

```bash
pnpm test
```

This runs Vitest through the Angular unit-test builder for the `ng-fixit` library project.

## Notes

- Package manager is **pnpm** only (`packageManager` field in `package.json`).
- If the Angular CLI rejects the Node version, report the `node --version` output and fix the environment; do not silently skip tests.
- After meaningful library changes, run tests before considering the work done.
