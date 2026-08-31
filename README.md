# ng-fixit

Development-only Angular library for turning visual UI selections and correction notes into a Markdown **Report** for an AI coding agent.

## Requirements

- Angular 22
- `@angular/core` and `@angular/common` `^22.1.0`

## Install

```bash
pnpm add ng-fixit
```

Add the library stylesheet to the host application's `angular.json` `styles` array:

```json
"styles": ["src/styles.css", "node_modules/ng-fixit/styles.css"]
```

Do not rely on a TypeScript `import 'ng-fixit/styles.css'`. It can fail type checking with `TS2882` and may not inject the stylesheet with Angular's application builder.

## Mount ng-fixit

Import `NgFixit` into the application shell:

```ts
import { Component } from '@angular/core';
import { NgFixit } from 'ng-fixit';

@Component({
  imports: [NgFixit],
  templateUrl: './app.html',
})
export class App {}
```

Mount the component once in the shell template:

```html
<ng-fixit />
```

`ng-fixit` defaults to Angular's `isDevMode()`, so production builds leave it disabled.

To explicitly disable it, provide `NG_FIXIT_ENABLED` from the application configuration or a parent injector:

```ts
import { NG_FIXIT_ENABLED } from 'ng-fixit';

{ provide: NG_FIXIT_ENABLED, useValue: false }
```

## Use Annotation Mode

1. Run the host application with its usual development server.
2. Click the **Annotation Mode** button at the bottom right.
3. Hover the host UI. A highlight marks a selectable **Target**.
4. Click a Target, type a required note, and press Enter to add the **Annotation**.
5. Edit, delete, or clear Annotations from the list when needed.
6. Click **Copy Report** and paste the Markdown into your AI coding agent.
7. Press Escape or use the toggle to leave Annotation Mode.

Annotations live in memory for the current browser tab. Reloading the page clears them. Copying a Report does not clear the Annotation list.

Library chrome is not selectable as a Target. When Annotation Mode is active, Target clicks are captured so the host UI does not perform its normal click action.

## Public API

- `NgFixit`
- `NG_FIXIT_ENABLED`
- `AnnotationMode`
- `ANNOTATION_MODES`

## Source and license

Source and product terminology: [github.com/driie/ng-fixit-workspace](https://github.com/driie/ng-fixit-workspace).

Licensed under the [MIT License](./LICENSE).
