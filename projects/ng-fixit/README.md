# ng-fixit

Development-only Angular library. You pick UI on a running app, write a correction note, and copy a Markdown **Report** to paste into an AI coding agent.

The drop-in root stays inert unless `NG_FIXIT_ENABLED` is true. That token defaults to Angular `isDevMode()`.

Needs Angular 22 (`@angular/core` and `@angular/common` `^22.1.0`).

## Install

```bash
pnpm add ng-fixit
```

Add the stylesheet to the host `angular.json` `styles` array. Do not rely on `import 'ng-fixit/styles.css'` in TypeScript. That import can fail typecheck (`TS2882`) and may not inject CSS.

```json
"styles": ["src/styles.css", "node_modules/ng-fixit/styles.css"]
```

```ts
import { NgFixit } from 'ng-fixit';

@Component({
  imports: [NgFixit],
  templateUrl: './app.html',
})
export class App {}
```

```html
<ng-fixit />
```

To force the library off even in development:

```ts
import { NG_FIXIT_ENABLED } from 'ng-fixit';

{ provide: NG_FIXIT_ENABLED, useValue: false }
```

## Using Annotation Mode

1. Run the app with your usual dev server.
2. Click the Annotation Mode button at the bottom right. Escape turns it off.
3. Hover host UI and click a Target. Library chrome is not selectable.
4. Type a required note and press Enter.
5. Click **Copy Report** and paste the Markdown into your agent.

Annotations live in memory for the current tab. A reload clears them.

Public API: `NgFixit`, `NG_FIXIT_ENABLED`, `AnnotationMode`, `ANNOTATION_MODES`.

Source and glossary: [github.com/MrPaYu/ng-fixit-workspace](https://github.com/MrPaYu/ng-fixit-workspace).

## License

MIT
