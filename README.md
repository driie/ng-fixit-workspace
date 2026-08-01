# ng-fixit

Development-only Angular library that turns visual UI selections and correction notes into paste-ready Markdown for AI coding agents.

Mount a drop-in root component, enter **Annotation Mode**, select a **Target**, add a required correction note, then copy a **Report** into your agent.

Domain terms live in [`GLOSSARY.md`](./GLOSSARY.md).

## Status

Early workspace. Domain language and v1 product shape are defined; library implementation is in progress.

| | |
| --- | --- |
| Package | `ng-fixit` |
| Stack | Angular 22, TypeScript ~6, Vitest, pnpm |
| Prefix | `fixit` (public root selector: `ng-fixit`) |
| Runtime | Development only (`isDevMode` / equivalent host gate) |

## Workspace layout

```text
projects/ng-fixit/     # publishable library
  src/lib/              # library source
  src/public-api.ts     # public API surface
GLOSSARY.md             # canonical domain language
```

## Prerequisites

- Node.js (compatible with Angular 22)
- [pnpm](https://pnpm.io/) 10.x

## Setup

```bash
pnpm install
```

## Build

```bash
pnpm build          # or: pnpm ng build ng-fixit
```

Output lands in `dist/ng-fixit/`.

Watch mode:

```bash
pnpm watch
```

## Test

```bash
pnpm test           # Vitest via Angular unit-test builder
```

## v1 shape (planned)

- **Drop-in UI** — shell-mounted root component owns overlay chrome, Annotation Mode toggle, Annotation list, and copy Report
- **Annotation Mode** — explicit toggle; when off, the host app receives normal clicks
- **Target** — single DOM element (hover highlight + click)
- **Annotation** — Target + required correction note; full CRUD in the list (no reorder)
- **Report** — structured Markdown (Locator, note, light context including Host Component when discoverable); copy does not clear working Annotations
- **Lifetime** — in-memory for the current tab; reload clears state
- **Out of v1** — screenshots, persistence, freeform regions, live agent/MCP bridge

## Contributing notes

- Use **pnpm** only (do not reintroduce `package-lock.json`)
- Prefer terms from `GLOSSARY.md` in code, UI copy, and docs
- Library selector prefix is `fixit`; public drop-in root uses selector `ng-fixit`

## License

Private / unpublished for now.
