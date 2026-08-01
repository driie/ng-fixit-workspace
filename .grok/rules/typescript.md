---
description: TypeScript file structure, imports, naming, and testing conventions for the ng-fixit library.
globs: projects/ng-fixit/**/*.ts
---

# TypeScript — `projects/ng-fixit/**/*.ts`

Canonical style for production and spec TypeScript. Language policy (English identifiers, no comments) lives in `project.md`. Arrow-function syntax details: `arrow-functions.md`.

## Imports

Tiered groups with a blank line between tiers. Alphabetical within each tier.

1. **Angular** — `@angular/...`
2. **Third-party** — `rxjs`, other packages
3. **Library** — relative imports within `projects/ng-fixit/src/`

**RxJS**: import operators from `rxjs`, not `rxjs/operators`.

```ts
import { EMPTY, catchError, finalize, switchMap, tap } from 'rxjs';
```

## Class member order

Blank line between tiers.

1. **Injected dependencies** — `private readonly x = inject(...)` (feature → shared → framework within tier)
2. **Private state** — `private readonly model = signal(...)`
3. **Template / public API** — all `protected readonly` (template-only), then `readonly` inputs/outputs/forms and external API

   Within `protected readonly`, order:
   - **Static config** — fixed option arrays and values that do not depend on signals
   - **Reactive bindings** — `asReadonly()` exports, service state references
   - **Derived values** — `computed(...)` and other derivations

   Do **not** place template model re-exports here (see tier 5).

   ```ts
   protected readonly modeOptions: ModeOption[] = [/* … */];
   protected readonly annotations = this.annotationStore.annotations;
   protected readonly hasAnnotations = computed<boolean>(() => this.annotations().length > 0);
   ```

4. **Methods** — class methods; constructor last in this tier when present

5. **Template model re-exports** — `protected readonly Model = Model` aliases that exist only so templates can reference `as const` objects. Place **last** in the class.

   ```ts
   protected readonly AnnotationMode = AnnotationMode;
   ```

## Visibility

| Modifier                 | Use                                                      |
| ------------------------ | -------------------------------------------------------- |
| `private readonly`       | Implementation detail, inject, private signals           |
| `protected readonly`     | Fields bound only in this component's template           |
| `readonly` (no modifier) | Inputs, outputs, forms, or API consumed by parents/tests |

## Types

- **`interface`** — object shapes (models, DTOs)
- **`type`** — unions, aliases, mapped types
- **Do not use TypeScript `enum`** — use the finite string union pattern below instead

### Signal typing

Always type `signal()` and `computed()` through the generic parameter — never on the variable. Type both `WritableSignal`s and `computed()`s; do not rely on inference, and do not annotate the field itself or use a `computed`'s inline return-type annotation.

```ts
// ✅ type in the signal "constructor"
private readonly activeTarget = signal<Target | null>(null);
protected readonly reportMarkdown = computed<string>(() => /* … */);

// ❌ inferred — no explicit type
private readonly activeTarget = signal(null);

// ❌ type on the variable instead of the generic
private readonly activeTarget: WritableSignal<Target | null> = signal(null);

// ❌ inline return-type annotation instead of the generic
protected readonly reportMarkdown = computed((): string => /* … */);
```

### Finite string unions (`as const` object)

When a model is a fixed set of string values, define it as a **`as const` object**, a derived **`type`**, and an **`Object.values()` array**:

```ts
export const AnnotationMode = {
  Off: 'off',
  On: 'on',
} as const;

export type AnnotationMode = (typeof AnnotationMode)[keyof typeof AnnotationMode];

export const ANNOTATION_MODES = Object.values(AnnotationMode) as AnnotationMode[];
```

- **Object** (`AnnotationMode`) — runtime constants for templates and comparisons
- **Type** (`AnnotationMode`) — compile-time union
- **Array** (`ANNOTATION_MODES`) — iterate all values; derive with `Object.values()`, cast once
- **Naming** — PascalCase object matches the type name; array is `SCREAMING_SNAKE` plural

Use named members in application code — avoid raw string literals when a constant exists. Plain `type Foo = 'a' | 'b'` without the object is only for trivial one-off unions that are not iterated or referenced from templates.

## Array iteration

Prefer **functional array methods** over `for...of` loops in `.ts` files.

| Intent                 | Method                  |
| ---------------------- | ----------------------- |
| Transform each element | `map`                   |
| Select elements        | `filter`                |
| Fold or accumulate     | `reduce`                |
| Side effect, no result | `forEach`               |
| Predicate check        | `some`, `every`, `find` |

```ts
// ❌ for...of
let total = 0;
for (const item of items) {
  total += item.value;
}

// ✅ reduce
const total = items.reduce((sum, item) => sum + item.value, 0);
```

Use arrow-function callbacks in array methods (`arrow-functions.md`). `@for` in templates is Angular control flow — not a substitute for these rules in TypeScript.

## Naming

| Symbol           | Pattern                                 | Examples                                                                          |
| ---------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| Action handlers  | Describe the outcome, not the DOM event | `addAnnotation`, `copyReport`, `enterAnnotationMode` — not `onClick`, `handleSubmit` |
| Boolean signals  | State adjective / noun                  | `annotationModeActive`, `hasAnnotations`, `copySucceeded`                         |
| Model signals    | `<noun>Model` or domain noun            | `draftNote`, `activeTarget`                                                       |
| Module constants | `SCREAMING_SNAKE`                       | `REPORT_MIME_TYPE`, `DEFAULT_HIGHLIGHT_Z`                                         |
| Files / folders  | kebab-case                              | `annotation-list.ts`, `report-builder.ts`                                         |
| Selectors        | `fix-` + kebab-case                    | `fix-root`, `fix-annotation-list`                                                 |

## Spec files (`*.spec.ts`)

Same import, member, arrow, and naming rules as production `.ts`.

- **File pairs** — `foo.spec.ts` beside `foo.ts`
- **`describe`** — names the subject (`ReportBuilder`, `NgFixitRoot`)
- **`it`** — states behavior in plain language (`'copies report markdown to the clipboard'`), not `'should …'`
- **Setup** — prefer focused `TestBed` configuration per subject; extract shared helpers under the library when patterns repeat
- **Nested `describe`** — only when grouping distinct behaviors

## Cross-references

- Angular API choices (signals, OnPush, control flow): `angular.md`
- Component scaffolding: `.grok/skills/frontend/SKILL.md`
- Arrow functions: `arrow-functions.md`
