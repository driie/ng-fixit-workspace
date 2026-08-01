---
name: frontend
description: >-
  Component conventions for ng-fixit: Angular 22 standalone library components,
  OnPush, .ts + .html split files, fixit- selector prefix, public-api discipline,
  plain CSS in a single global styles.css (no per-component CSS). Use when
  scaffolding or modifying code under projects/ng-fixit/**.
---

# frontend — ng-fixit library conventions

Procedural detail for scaffolding and modifying Angular code under `projects/ng-fixit/**`.

TypeScript file structure (imports, member order, naming, specs): `.grok/rules/typescript.md`.

## Component file shape — `.ts` + `.html` are mandatory

Every Angular component MUST be split into two files:

- `foo.ts` — the `@Component` class
- `foo.html` — the template

**Never** use inline templates (no `template: \`...\``). **Never** add `styleUrl`, `styleUrls`, or `styles: [...]` — all styles go in the global stylesheet.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'fixit-annotation-list',
  templateUrl: './annotation-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationList {}
```

**Exempt**: templateless artifacts (directives, services, pipes).

## Selectors — `fixit-` prefix

Workspace prefix is `fixit`. Generated and internal components use `fixit-` (e.g. `fixit-annotation-list`, `fixit-target-highlight`). The public drop-in root is an intentional exception: selector **`ng-fixit`**, class `NgFixit`.

Do not use `app-` selectors inside the library.

## Template logic — prefer pipes / computed over component methods

Do **not** call component methods from the template for formatting, filtering, or derived display values (e.g. `{{ formatLocator(value) }}`, `@for (x of getFiltered(); track x.id)`).

Methods bound in templates run on **every** change-detection pass — even with `OnPush`. **Prefer pure pipes** or **`computed()`** signals instead.

Use `ng generate pipe` for reusable transforms. For one-off derivations that stay in one component, a `computed()` signal is fine when a pipe is not warranted.

## Empty collections — `@for` / `@empty`

When a template lists a collection that may be empty, prefer **`@for` with `@empty`** over a length check that branches with `@if` / `@else`.

```html
<ul>
  @for (annotation of annotations(); track annotation.id) {
    <li>{{ annotation.note }}</li>
  } @empty {
    <li>No annotations yet</li>
  }
</ul>
```

Use `@if` for true conditionals (flags, optional models, mutually exclusive layouts) — not as a substitute for empty-list rendering.

## Styling — single global `styles.css`

- **Sole stylesheet**: `projects/ng-fixit/src/styles.css`.
- **No per-component CSS**: never `styleUrl` / `styleUrls` / `styles: [...]`, never sibling `component.css`.
- Put overlay chrome, highlights, panels, and tokens in that file.
- Scope under `.fixit-root` and prefer `fixit-` class names so the host app is not restyled by accident.
- Templates: bind those class names (`class="fixit-annotation-list"`). Use `class` / `style` bindings, not `ngClass` / `ngStyle`.
- No Tailwind, Sass/SCSS pipeline, or UI-kit themes.
- Ensure the published package exposes this CSS and hosts import it once (document in package README when wiring the build).

## Generation — use `ng g`

From workspace root, target the library project:

```bash
pnpm ng generate component annotation-list --project=ng-fixit
pnpm ng generate service annotation-store --project=ng-fixit
pnpm ng generate pipe locator-label --project=ng-fixit
```

After generation, verify: external template, **no** `styleUrl` / generated `.css`, `ChangeDetectionStrategy.OnPush`, `fixit-` selector (except public root `ng-fixit`), no NgModule. Delete any CLI-generated component stylesheet and keep styles in `src/styles.css`. Adjust generated paths into a clear folder layout under `src/lib/` as the library grows.

## Standalone-only — no NgModules

- Do **not** create or edit `*.module.ts`.
- Library providers: component `providers` for shell-scoped state, or `providedIn: 'root'` only when a true singleton is correct for the host app.

## Service injection — field-level `inject()`

Inject dependencies as `private readonly` class fields. Do not use constructor DI.

Order: feature-local service → shared library service → Angular framework service.

```ts
private readonly annotationStore = inject(AnnotationStore);
private readonly document = inject(DOCUMENT);
```

## Language — English only

Every piece of code under `projects/ng-fixit/**` is English: identifiers, templates, styles content if textual, string literals, UI labels, messages, and tests. Use `GLOSSARY.md` product terms where they apply. Full policy: `.grok/rules/project.md`.

## Domain models

Keep models aligned with `GLOSSARY.md`:

| Term            | Role                                              |
| --------------- | ------------------------------------------------- |
| Annotation      | Target + required correction note                 |
| Target          | Single DOM element                                |
| Report          | Structured Markdown for the agent                 |
| Locator         | How to find the Target again                      |
| Annotation Mode | Active selection state                            |
| Host Component  | Nearest Angular component owning/wrapping Target  |

Do not rename these concepts to comment/pin/issue/payload/etc.

## Public API surface

1. Implement under `projects/ng-fixit/src/lib/`.
2. Export only intentional symbols from `projects/ng-fixit/src/public-api.ts`.
3. Prefer exporting: root shell component, public config tokens, and stable types needed by hosts.
4. Keep report builders, DOM locators, and internal panels unexported until they are part of the contract.

## Signal typing

Type every `signal()` and `computed()` through its generic parameter — never on the variable, never via a `computed`'s inline return-type annotation. Full rule: `typescript.md`.

```ts
private readonly draftNote = signal<string>('');
protected readonly canAdd = computed<boolean>(() => this.draftNote().trim().length > 0);
```

## Finite string unions

For fixed string sets, use the `as const` object pattern — see `typescript.md`.

## Arrow functions

Standalone functions and callbacks use arrow syntax. Do not use `function` declarations. Class methods keep standard method syntax. Details: `.grok/rules/arrow-functions.md`.

## Event / action handler naming

Name handlers for the **outcome or action**, not the DOM event.

| Prefer                         | Avoid                    |
| ------------------------------ | ------------------------ |
| `addAnnotation`, `copyReport`  | `onClick`, `handleSubmit` |
| `enterAnnotationMode`          | `onToggle`               |
| `selectTarget`                 | `onElementClick`         |

## Dev-only gate

When implementing the root entry or mode toggle:

- Default off when not in development.
- Prefer `isDevMode()` from `@angular/core`, or an injectable config token the host can set.
- Do not ship always-on capture UI for production hosts.

## Testing

- Place `*.spec.ts` beside the unit under test.
- `describe` names the subject; `it` states behavior without `'should …'`.
- Use `TestBed` with standalone imports; keep fixtures focused.
- Cover Report formatting and Locator building with pure unit tests where possible (no full DOM when not needed).

## Domain context

Product terms and v1 scope: `GLOSSARY.md` and root `README.md`.
