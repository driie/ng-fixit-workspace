---
description: Use arrow functions for standalone functions and callbacks in TypeScript.
globs: projects/ng-fixit/**
alwaysApply: false
---

# Arrow functions — `projects/ng-fixit/**`

Part of the TypeScript style system — see also `typescript.md` for imports, member order, and naming.

Create functions as **arrow function expressions**. Do not use `function` declarations or named `function` expressions.

## Required

- **Module-level helpers** — export as `const` with an explicit return type when not `void`:

```typescript
export const buildLocator = (element: Element): Locator => {
  // ...
};

export const formatReport = (annotations: readonly Annotation[]): string => {
  // ...
};
```

- **Callbacks** — RxJS operators, array methods (`map`, `filter`, `reduce`, `forEach`, …), DOM handlers, Vitest hooks. Prefer these over `for...of` in `.ts` files (`typescript.md`).

```typescript
.pipe(filter((event): event is MouseEvent => event instanceof MouseEvent))

annotations.reduce((markdown, annotation) => markdown + formatAnnotation(annotation), '');
```

- **Async helpers**:

```typescript
export const configureFixitTestingModule = async (
  imports: Type<unknown>[] = [],
): Promise<void> => {
  await TestBed.configureTestingModule({
    imports,
  }).compileComponents();
};
```

## Exempt

- **Class methods** on `@Component`, `@Injectable`, `@Pipe`, guards, resolvers — standard method syntax (`transform()`, `canActivate()`). These are class methods, not standalone functions.
- **Constructors** — `constructor() {}`

## Do not

```typescript
// ❌ function declaration
export function buildLocator(element: Element): Locator {
  return { /* … */ };
}

// ❌ named function expression
const handler = function onClick() {};
```

## Do

```typescript
// ✅ arrow assigned to const
export const buildLocator = (element: Element): Locator => {
  return { /* … */ };
};

// ✅ inline callback
element.addEventListener('click', () => {});
```
