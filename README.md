# ng-fixit

Development-only Angular library that turns visual UI selections and correction notes into paste-ready Markdown for AI coding agents.

Mount a drop-in root component, enter **Annotation Mode**, select a **Target**, add a required correction note, then copy a **Report** into your agent.

Domain terms live in [`GLOSSARY.md`](./GLOSSARY.md).

## Status

v1 library path is in place. Use the workspace demo to dogfood the drop-in root.

|         |                                                       |
| ------- | ----------------------------------------------------- |
| Package | `ng-fixit`                                            |
| Stack   | Angular 22, TypeScript ~6, Vitest, pnpm               |
| Prefix  | `fixit` (public root selector: `ng-fixit`)            |
| Runtime | Development only (`isDevMode` / equivalent host gate) |

## Workspace layout

```text
projects/ng-fixit/                 # publishable library
  src/
    lib/
      shell/ng-fixit/              # public drop-in root
      components/                   # internal UI (one folder per component)
      models/                       # domain types and as-const models
      services/                     # session/store services
      utils/                        # pure helpers (locator, report, clipboard, …)
    public-api.ts                   # public API surface
    styles.css                      # sole stylesheet
projects/ng-fixit-demo/            # development-only host for dogfooding
GLOSSARY.md                         # canonical domain language
```

## Prerequisites

- Node.js (compatible with Angular 22)
- [pnpm](https://pnpm.io/) 11.x

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

## Demo

The demo app mounts `<ng-fixit />` against sample UI (including a nested Host Component). It consumes the built library from `dist/ng-fixit/`.

```bash
pnpm build          # required once, or after library changes
pnpm start          # ng serve ng-fixit-demo
```

For library edits, run `pnpm watch` in a second terminal.

This workspace demo is for development dogfooding, not a production host.

## Test

```bash
pnpm test           # library (Vitest via Angular unit-test builder)
pnpm test:demo      # demo host integration
```

## v1 shape

- **Drop-in UI** — shell-mounted root component owns overlay chrome, Annotation Mode toggle, Annotation list, and copy Report
- **Annotation Mode** — explicit toggle; when off, the host app receives normal clicks; when on, Target clicks do not run host UI
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
