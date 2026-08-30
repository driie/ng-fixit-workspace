---
name: frontend
description: >-
  Component conventions for ng-fixit: Angular 22 standalone library components,
  OnPush, .ts + .html split files, fixit- selector prefix, public-api discipline,
  plain CSS in a single global styles.css (no per-component CSS). Use when
  scaffolding or modifying code under projects/ng-fixit/**.
---

# frontend — ng-fixit library conventions

Procedural detail for scaffolding and modifying Angular code under `projects/ng-fixit/**`. Hard musts: `AGENTS.md`.

## TypeScript file structure

### Imports

Tiered groups with a blank line between tiers. Alphabetical within each tier.

1. **Angular** — `@angular/...`
2. **Third-party** — `rxjs`, other packages
3. **Library** — relative imports within `projects/ng-fixit/src/`

RxJS operators from `rxjs`, not `rxjs/operators`.

```ts
import { EMPTY, catchError, finalize, switchMap, tap } from 'rxjs';
```

### Class member order

Blank line between tiers.

1. **Injected dependencies** — `private readonly x = inject(...)` (feature → shared → framework)
2. **Private state** — `private readonly model = signal(...)`
3. **Template / public API** — `protected readonly` (static config, then reactive bindings, then derived values), then `readonly` inputs/outputs. Do not place template model re-exports here.

   ```ts
   protected readonly modeOptions: ModeOption[] = [/* … */];
   protected readonly annotations = this.annotationStore.annotations;
   protected readonly hasAnnotations = computed<boolean>(() => this.annotations().length > 0);
   ```

4. **Methods** — class methods; constructor last in this tier when present
5. **Template model re-exports** — last in the class (`protected readonly AnnotationMode = AnnotationMode`)

### Visibility

| Modifier                 | Use                                             |
| ------------------------ | ----------------------------------------------- |
| `private readonly`       | Implementation detail, inject, private signals  |
| `protected readonly`     | Fields bound only in this component's template  |
| `readonly` (no modifier) | Inputs, outputs, or API consumed by hosts/tests |

### Types

`interface` for object shapes in `lib/models/`. `type` for unions. No TypeScript `enum`. Pure functions that build or format models live under `lib/utils/` (import types from `models/`).

### Array iteration

Prefer functional array methods over `for...of` in `.ts` files: `map`, `filter`, `reduce`, `forEach`, `some`, `every`, `find`.

```ts
const total = items.reduce((sum, item) => sum + item.value, 0);
```

### Naming

| Symbol           | Pattern                                  | Examples                                     |
| ---------------- | ---------------------------------------- | -------------------------------------------- |
| Action handlers  | Outcome, not the DOM event               | `addAnnotation`, `copyReport`. Not `onClick` |
| Boolean signals  | State adjective / noun                   | `annotationModeActive`, `hasAnnotations`     |
| Model signals    | Domain noun                              | `draftNote`, `activeTarget`                  |
| Module constants | `SCREAMING_SNAKE`                        | `REPORT_MIME_TYPE`                           |
| Files / folders  | kebab-case                               | `annotation-list.ts`                         |
| Selectors        | `fixit-` + kebab-case (root: `ng-fixit`) | `fixit-annotation-list`                      |

### Spec files

Same import, member, arrow, and naming rules as production `.ts`.

- File pairs: `foo.spec.ts` beside `foo.ts`
- `describe` names the subject
- `it` states behavior (`'copies report markdown to the clipboard'`), not `'should …'`
- Nested `describe` only when grouping distinct behaviors

## Component file shape — `.ts` + `.html` are mandatory

Every Angular component MUST be split into two files:

- `foo.ts` — the `@Component` class
- `foo.html` — the template

**Never** use inline templates (no `template: \`...\``). **Never** add `styleUrl`, `styleUrls`, or `styles: [...]`. All styles go in the global stylesheet. Prefer `input()`/`output()`/`model()`over`@Input`/`@Output` for new code.

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
pnpm ng generate component components/annotation-list --project=ng-fixit
pnpm ng generate service services/annotation-session-store --project=ng-fixit
pnpm ng generate pipe pipes/locator-label --project=ng-fixit
```

After generation, verify: external template, **no** `styleUrl` / generated `.css`, `ChangeDetectionStrategy.OnPush`, `fixit-` selector (except public root `ng-fixit`), no NgModule. Delete any CLI-generated component stylesheet and keep styles in `src/styles.css`. Place artifacts under the layered `src/lib/` layout:

| Kind        | Path                                       |
| ----------- | ------------------------------------------ |
| Shell root  | `lib/shell/ng-fixit/`                      |
| Component   | `lib/components/<name>/` (`.ts` + `.html`) |
| Model       | `lib/models/`                              |
| Service     | `lib/services/`                            |
| Pure helper | `lib/utils/`                               |

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

Every piece of code under `projects/ng-fixit/**` is English: identifiers, templates, styles content if textual, string literals, UI labels, messages, and tests. Use `GLOSSARY.md` product terms where they apply. Full policy: `AGENTS.md`.

## Domain models

Keep models aligned with `GLOSSARY.md`:

| Term            | Role                                             |
| --------------- | ------------------------------------------------ |
| Annotation      | Target + required correction note                |
| Target          | Single DOM element                               |
| Report          | Structured Markdown for the agent                |
| Locator         | How to find the Target again                     |
| Annotation Mode | Active selection state                           |
| Host Component  | Nearest Angular component owning/wrapping Target |

Do not rename these concepts to comment/pin/issue/payload/etc.

## Public API surface

1. Implement under the layered tree in `projects/ng-fixit/src/lib/` (`shell/`, `components/`, `models/`, `services/`, `utils/`).
2. Export only intentional symbols from `projects/ng-fixit/src/public-api.ts` (re-export from the real paths, e.g. `./lib/shell/ng-fixit/ng-fixit`).
3. Prefer exporting: root shell component, public config tokens, and stable types needed by hosts.
4. Keep report builders, DOM locators, and internal panels unexported until they are part of the contract.

## Signal typing

Type every `signal()` and `computed()` through its generic parameter — never on the variable, never via a `computed`'s inline return-type annotation. Full rule: `AGENTS.md`.

```ts
private readonly draftNote = signal<string>('');
protected readonly canAdd = computed<boolean>(() => this.draftNote().trim().length > 0);
```

## Finite string unions

For fixed string sets, use the `as const` object pattern:

```ts
export const AnnotationMode = {
  Off: 'off',
  On: 'on',
} as const;

export type AnnotationMode = (typeof AnnotationMode)[keyof typeof AnnotationMode];

export const ANNOTATION_MODES = Object.values(AnnotationMode) as AnnotationMode[];
```

## Arrow functions

Standalone functions and callbacks use arrow syntax. Do not use `function` declarations or named `function` expressions. Module-level helpers export as `const` with an explicit return type when not `void`.

```ts
export const buildLocator = (element: Element): Locator => {
  return {
    /* … */
  };
};

export const configureFixitTestingModule = async (imports: Type<unknown>[] = []): Promise<void> => {
  await TestBed.configureTestingModule({
    imports,
  }).compileComponents();
};
```

Exempt: class methods on `@Component`, `@Injectable`, `@Pipe` (`transform()`), and constructors.

## Event / action handler naming

Name handlers for the **outcome or action**, not the DOM event.

| Prefer                        | Avoid                     |
| ----------------------------- | ------------------------- |
| `addAnnotation`, `copyReport` | `onClick`, `handleSubmit` |
| `enterAnnotationMode`         | `onToggle`                |
| `selectTarget`                | `onElementClick`          |

## Dev-only gate

When implementing the root entry or mode toggle:

- Default off when not in development.
- Prefer `isDevMode()` from `@angular/core`, or an injectable config token the host can set.
- Do not ship always-on capture UI for production hosts.
- Annotation Mode must not trap keyboard users. Toggle off and Escape are the designed exits.

## Testing

- Place `*.spec.ts` beside the unit under test.
- `describe` names the subject; `it` states behavior without `'should …'`.
- Use `TestBed` with standalone imports; keep fixtures focused.
- Cover Report formatting and Locator building with pure unit tests where possible (no full DOM when not needed).

## Domain context

Product terms and v1 scope: `GLOSSARY.md` and root `README.md`.
