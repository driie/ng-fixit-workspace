# ng-fixit

Development-only Angular library: visual **Annotations** → paste-ready **Report** Markdown for AI coding agents.

## Host integration

```ts
import { NgFixit } from 'ng-fixit';
```

```html
@if (isDevMode()) {
  <ng-fixit />
}
```

Load styles once in the host app:

```ts
import 'ng-fixit/styles.css';
```

Public surface: `NgFixit`, `AnnotationMode`, `NG_FIXIT_ENABLED` (defaults to `isDevMode()`).

Domain terms: see workspace `GLOSSARY.md`.
