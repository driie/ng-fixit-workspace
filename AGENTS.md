# ng-fixit

Development-only Angular 22 library. Hosts mount `<ng-fixit />`. Developers enter Annotation Mode, select Targets, add notes, and copy a Report. This workspace publishes `projects/ng-fixit/` (`ng-packagr`). It is not a product SPA. Product language: `GLOSSARY.md`. Architecture: Engram.

## Language

English-only source: identifiers, filenames, folders, string literals, UI labels, ARIA, messages, spec titles. Use glossary terms (Annotation, Target, Report, Locator, Annotation Mode, Host Component). Do not invent synonyms. No comments (tool-required directives exempt).

## Six nevers

1. No inline templates. Every component has a separate `.html` file.
2. No `*.module.ts`. Standalone only (do not set `standalone: true`).
3. Always `ChangeDetectionStrategy.OnPush`.
4. No invented domain synonyms. Use `GLOSSARY.md`.
5. Do not enable Annotation Mode in production by default. Gate with `isDevMode()` or an explicit host flag.
6. No non-English source.

## Library

- Work in `projects/ng-fixit/`. Layer `src/lib/` as `shell/`, `components/<name>/`, `models/`, `services/`, `utils/`. Specs sit beside the unit.
- Selector prefix `fixit`. Public drop-in root selector is `ng-fixit`.
- Export only intentional symbols from `projects/ng-fixit/src/public-api.ts`.
- One stylesheet: `projects/ng-fixit/src/styles.css`. No `styleUrl` / `styleUrls` / `styles: [...]`. No Tailwind, Sass, or UI-kit themes. Scope under `.fixit-root` / `fixit-` class names.
- No Taiga, Material, or similar as library peers unless the user asks.

## Angular

- Signals for local state. Do not `mutate()` signals. Use `update()` or `set()`.
- Native control flow (`@if`, `@for`, `@switch`). Lists that may be empty: `@for` with `@empty`.
- No template methods for derived values. Use `computed()` or a pure pipe.
- No `ngClass` / `ngStyle`. Use `class` / `style` bindings.
- No `@HostBinding` / `@HostListener`. Use `host` on the decorator.
- Prefer `input()` / `output()` / `model()` over `@Input` / `@Output` for new code.
- `inject()` as `private readonly` fields. Shell-scoped services may use component `providers`. `providedIn: 'root'` only for true host-wide singletons.
- WCAG AA for overlay chrome. Annotation Mode must have an obvious escape (toggle off / Escape).

## TypeScript

- Import order: Angular, third-party, library. Blank line between tiers. Alphabetical within. RxJS operators from `rxjs`.
- Class member order: inject → private state → `protected readonly` (static, then reactive, then derived) → methods → template model re-exports last.
- `interface` for object shapes in `lib/models/`. `type` for unions. No TypeScript `enum`. Use an `as const` object, a derived type, and `Object.values()`.
- Type `signal()` and `computed()` via the generic, not the variable.
- Arrow functions for module helpers and callbacks. Class methods exempt.
- Action handlers name the outcome (`addAnnotation`, `copyReport`), not the DOM event.
- Specs: `foo.spec.ts` beside `foo.ts`. English `it(...)` (not `should`). Focused `TestBed` per subject.

## Skills

`.agents/skills/`: `frontend`. Load it when touching `projects/ng-fixit/**`.

## Commands

```
pnpm install
pnpm start
pnpm build
pnpm watch
pnpm test
pnpm test:demo
pnpm run lint
pnpm run format
pnpm run quality
```

pnpm only. Do not add `package-lock.json`. Run `pnpm test` after library changes. If the CLI rejects Node, report `node --version`. Do not skip tests.

## MCP

Angular CLI only. No UI-kit or DB tooling.

## Other

- Never `rm -rf *` or `git push --force`.
- Check `git status` before committing. Never commit `.env` or credentials.
- v1: Annotation Mode toggle, single-element Target, required note, list CRUD (no reorder), copy Report Markdown, in-memory tab lifetime. Out of v1: screenshots, persistence, freeform regions, live agent/MCP bridge.
