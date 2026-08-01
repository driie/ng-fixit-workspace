---
description: Angular and TypeScript best practices for the ng-fixit library.
globs: projects/ng-fixit/**
---

# Angular & TypeScript — ng-fixit

Expert TypeScript and Angular development following project conventions in `frontend.md` and `typescript.md`.

## Project-specific overrides

These take precedence over generic Angular guidance:

- **External templates only** — every component has a separate `.html` file (no inline templates).
- **OnPush always** — `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- **Selector prefix `fixit`** — workspace `prefix` is `fixit`. Component selectors use the `fixit-` prefix, except the public drop-in root which uses **`ng-fixit`**.
- **Library public API** — only re-export intentional symbols from `projects/ng-fixit/src/public-api.ts`.
- **No app UI kit dependency** — do not introduce Taiga, Material, or similar as library peers unless explicitly requested. Prefer Angular primitives and focused custom overlay UI.
- **Plain CSS, single global file** — all styles live in `projects/ng-fixit/src/styles.css`. No `styleUrl` / `styleUrls` / `styles: [...]` on components. No Tailwind or Sass/SCSS pipeline. Scope rules under `.fixit-root` / `fixit-` class names.

## TypeScript file style

Import order, member order, visibility, naming, and spec conventions: **`typescript.md`**. Arrow functions: **`arrow-functions.md`**.

## Angular

- Standalone-only; do not set `standalone: true` (default in v20+).
- Signals for local state.
- Native control flow (`@if`, `@for`, `@switch`); no `*ngIf` / `*ngFor`.
- **Empty collections** — when rendering a list that may be empty, use `@for` with `@empty`. Do not gate the list with `@if (items.length === 0)` / `@else` (or equivalent length checks) just to choose empty copy vs rows.
- Do not use `ngClass` / `ngStyle` — use `class` / `style` bindings.
- Do not use `@HostBinding` / `@HostListener` — use the `host` object on decorators.
- Prefer `input()` / `output()` / `model()` signal APIs over decorator-based `@Input` / `@Output` for new code.
- **Dev-only**: code paths that enable Annotation Mode must respect `isDevMode()` or an explicit host gate.

## State & services

- Do not `mutate()` signals — use `update()` or `set()`.
- Services: single responsibility; prefer `providedIn: 'root'` only for truly app-wide singletons. Library services that should scope to the root fixit shell may use component-level `providers` instead of root.
- Use `inject()` over constructor DI.
- In components, declare injected deps as `private readonly` fields (feature → shared → framework order).

## Accessibility

- WCAG AA minimums: focus, contrast, ARIA — especially for overlay chrome and Annotation Mode UI.
- Annotation Mode must not trap keyboard users without an obvious escape (toggle off / Escape when designed).
