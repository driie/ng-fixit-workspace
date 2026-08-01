---
description: Angular 22 library conventions for ng-fixit under projects/ng-fixit/**.
globs: projects/ng-fixit/**
---

# Frontend Conventions — `projects/ng-fixit/**`

Mandatory for any work under the library source tree.

## Stack Snapshot

- **Angular 22** library (`ng-packagr`), standalone-only, signals, `@if` / `@for` / `@empty` control flow.
- **Prefix**: `fix`
- **Tests**: Vitest via `pnpm test` / `ng test`
- **Domain language**: `GLOSSARY.md`

## The Six Hard "Never"s (Strictly Enforced)

1. **Never inline templates**: Every component must have a separate `.html` file.
2. **Never NgModules**: No `*.module.ts`. Standalone-only.
3. **Always `ChangeDetectionStrategy.OnPush`**.
4. **Never invent domain synonyms**: Use Glossary terms (Annotation, Target, Report, Locator, Annotation Mode, Host Component).
5. **Never enable production annotation by default**: Gate with `isDevMode()` or an explicit host-provided flag.
6. **Never non-English source**: Every piece of code is English — identifiers, strings, UI copy, messages, tests. Full policy: `project.md`.

## Styling stance

- Component-scoped styles (`styleUrl` / `styleUrls`) are **allowed** for overlay chrome, highlights, and panels.
- Prefer encapsulation defaults; avoid leaking global styles into the host app.
- Do **not** add Tailwind, Taiga, or a monorepo-wide design-token pipeline unless the user asks.
- Avoid inline `styles: [...]` for non-trivial CSS — use a sibling `.css` file.

## TypeScript & specs

File structure, imports, naming, and `.spec.ts` conventions: **`typescript.md`**. Language policy (English, no comments): **`project.md`**.

## Public API

- `public-api.ts` is the consumer contract.
- Do not export internal helpers, test utilities, or unstable private components by accident.
- Prefer a single root entry component plus intentional services/tokens over a large export surface.

## Accessibility

- WCAG AA: focus management, contrast, ARIA for overlay UI.
- Use host bindings only via the `host` object on `@Component` / `@Directive`.

## Procedural Details

- `.grok/skills/frontend/SKILL.md` — component scaffolding, selectors, state, exports, testing
- Domain reference: `GLOSSARY.md` + README v1 shape
