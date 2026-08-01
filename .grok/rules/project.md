---
description: Project overview, architecture, and conventions for ng-fixit.
globs: **/*
---

# ng-fixit — Project Overview & Conventions

`ng-fixit` is a **development-only** Angular library that turns visual UI selections and correction notes into paste-ready Markdown for AI coding agents. Host apps mount a drop-in root component; developers enter **Annotation Mode**, select **Targets**, add notes, and copy a **Report**.

This workspace publishes the library under `projects/ng-fixit/`. It is not a full SPA product shell.

## Domain & decisions

| Source              | Use                                                                 |
| ------------------- | ------------------------------------------------------------------- |
| `GLOSSARY.md`       | Canonical product terms (Annotation, Target, Report, Locator, …)  |
| Engram (`mem_save`) | Architectural decisions, API surface choices, runtime gating notes |

Prefer glossary terms in code, UI copy, commits, and docs. Avoid the glossary’s listed synonyms.

## Repo Layout

Angular workspace with one publishable library:

- `projects/ng-fixit/` — library root (`ng-packagr`)
- `projects/ng-fixit/src/lib/` — library source
- `projects/ng-fixit/src/styles.css` — sole stylesheet (plain CSS; no per-component CSS)
- `projects/ng-fixit/src/public-api.ts` — public API surface (only export what consumers may use)
- `GLOSSARY.md` — shared product language
- `.grok/` — project rules, skills, MCP config

Selector prefix: **`fixit`**. Public drop-in root selector: **`ng-fixit`**.

## Commands

```bash
pnpm install          # dependencies (packageManager: pnpm@10.x)
pnpm build            # ng build ng-fixit → dist/ng-fixit/
pnpm watch            # library build in watch mode
pnpm test             # Vitest via Angular unit-test builder
```

Use **pnpm** only. Do not reintroduce `package-lock.json`.

## Architecture & Constraints

- **Library, not an app**: Implement features inside `projects/ng-fixit/`. Do not scaffold a host SPA unless the user explicitly asks for a demo app.
- **Plain CSS styling**: Single global `projects/ng-fixit/src/styles.css` only. No per-component CSS, no Tailwind.
- **Development-only runtime**: Gate activation with `isDevMode()` (or an equivalent host-provided flag). Production builds must not enable Annotation Mode by default.
- **v1 product shape** (see README): Annotation Mode toggle, single-element Target, required note per Annotation, list CRUD (no reorder), copy Report as Markdown, in-memory tab lifetime. Out of v1: screenshots, persistence, freeform regions, live agent/MCP bridge.
- **Signals** for local UI/library state; standalone Angular APIs only (no NgModules).
- **Public API discipline**: Export only intentional symbols from `public-api.ts`. Prefer a small, stable surface.

## Code Style (Enforced)

- **English only — every piece of code**: All source under this repo must be written in English. That includes identifiers (variables, functions, classes, types, selectors, routes), filenames, folder names, string literals, UI labels, ARIA text, error/status messages, log messages, test `describe`/`it` titles, fixtures, and any other source text. Do not introduce Spanish or other non-English wording in code. Product terms from `GLOSSARY.md` (Annotation, Target, Report, Locator, Annotation Mode, Host Component) are English domain vocabulary and are preferred where they apply.
- **No code comments**: Do not add inline, block, or JSDoc comments in new or modified code. Prefer clear naming and small functions. Exception: tool-required directives only (e.g. lint disable on the same line as the violation).
- **TypeScript file structure**: Member order, imports, naming, specs — see `.grok/rules/typescript.md`.

## Strict Constraints (Enforced)

- **Destructive commands**: Never run `rm -rf *` or `git push --force` (or variants).
- **Git**: Check `git status` before committing.
- **Secrets**: Never commit `.env` or credentials.

## Grok Conventions

- Rules: `.grok/rules/*.md`
- Skills: `.grok/skills/`
- MCPs: `.grok/config.toml` — Angular CLI only
