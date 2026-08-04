---
description: Angular 22 library conventions for ng-fixit under projects/ng-fixit/**.
globs: projects/ng-fixit/**
---

# Frontend Conventions — `projects/ng-fixit/**`

Mandatory for any work under the library source tree.

## Stack Snapshot

- **Angular 22** library (`ng-packagr`), standalone-only, signals, `@if` / `@for` / `@empty` control flow.
- **Styling**: plain CSS in a **single global** `styles.css` (no per-component CSS, no Tailwind, no CSS-in-JS)
- **Prefix**: `fixit` (public root selector: `ng-fixit`)
- **Tests**: Vitest via `pnpm test` / `ng test`
- **Domain language**: `GLOSSARY.md`
- **Source layout**: layered under `src/lib/` — `shell/`, `components/<name>/`, `models/`, `services/`, `utils/` (see `project.md`)

## The Six Hard "Never"s (Strictly Enforced)

1. **Never inline templates**: Every component must have a separate `.html` file.
2. **Never NgModules**: No `*.module.ts`. Standalone-only.
3. **Always `ChangeDetectionStrategy.OnPush`**.
4. **Never invent domain synonyms**: Use Glossary terms (Annotation, Target, Report, Locator, Annotation Mode, Host Component).
5. **Never enable production annotation by default**: Gate with `isDevMode()` or an explicit host-provided flag.
6. **Never non-English source**: Every piece of code is English — identifiers, strings, UI copy, messages, tests. Full policy: `project.md`.

## Styling — single global plain CSS

- **One stylesheet only**: `projects/ng-fixit/src/styles.css` is the sole place for library styles (tokens, overlay chrome, highlights, panels, animations).
- **No per-component CSS**: Do not add `styleUrl`, `styleUrls`, or `styles: [...]` on components. Do not create sibling `*.css` next to components.
- **No other CSS files** under `projects/ng-fixit/**` except that global `styles.css`.
- Templates use **class names** defined in `styles.css` (prefer a `fixit-` prefix / root scope such as `.fixit-root` so rules do not restyle the host app).
- Prefer `class` / `style` bindings over `ngClass` / `ngStyle`.
- Do not introduce Tailwind, Sass/SCSS pipelines, CSS modules, or UI-kit theme systems.
- Host apps must load the library stylesheet once (e.g. import `ng-fixit/styles.css` or the path documented in the package README) so global rules apply.

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
