# ng-fixit

Development-only Angular library: visual **Annotations** → paste-ready **Report** Markdown for AI coding agents.

Do not ship Annotation Mode to production users. The drop-in root stays inert unless `NG_FIXIT_ENABLED` is true. That token defaults to Angular `isDevMode()`.

## Host integration

Mount the drop-in root once at the application shell. Gate it with `isDevMode()` (or provide `NG_FIXIT_ENABLED`) so production builds do not render the chrome.

```ts
import { isDevMode } from '@angular/core';
import { NgFixit } from 'ng-fixit';
import 'ng-fixit/styles.css';
```

```html
@if (isDevMode()) {
<ng-fixit />
}
```

Load `ng-fixit/styles.css` once in the host. If TypeScript reports `TS2882` on that side-effect import, add `declare module 'ng-fixit/styles.css';` in the host.

Public surface: `NgFixit`, `AnnotationMode`, `ANNOTATION_MODES`, `NG_FIXIT_ENABLED`.

## Workspace demo

This repo includes `projects/ng-fixit-demo/`, a development-only host that mounts `<ng-fixit />` against sample UI.

```bash
pnpm build
pnpm start
```

See the workspace README and `projects/ng-fixit-demo/README.md`.

Domain terms: see workspace `GLOSSARY.md`.
