# ng-fixit

### Point to the UI. Tell your agent what to change.

Select a Target in your Angular app, add a correction note, and copy a Markdown Report with the context your coding agent needs.

[npm](https://www.npmjs.com/package/ng-fixit) · [CI](https://github.com/driie/ng-fixit-workspace/actions/workflows/ci.yml) · [MIT license](https://github.com/driie/ng-fixit-workspace/blob/main/LICENSE)

[**Quick start →**](#quick-start) · [Install](#install) · [How it works](#how-it-works) · [API](#public-api)

![Workflow illustration: select a Target, add a correction note, and copy a Markdown Report with a Locator for your coding agent.](docs/assets/readme-hero-light.svg)

## Install

Install ng-fixit as a development dependency using your preferred package manager:

npm:

```bash
npm install --save-dev ng-fixit
```

Yarn:

```bash
yarn add --dev ng-fixit
```

pnpm:

```bash
pnpm add -D ng-fixit
```

Add its stylesheet to the host application's `angular.json` `styles` array:

```json
"styles": ["src/styles.css", "node_modules/ng-fixit/styles.css"]
```

Do not rely on a TypeScript `import 'ng-fixit/styles.css'`. It can fail type checking with `TS2882` and may not inject the stylesheet with Angular's application builder.

## Quick start

Import `NgFixit` into your application shell:

```ts
import { Component } from '@angular/core';
import { NgFixit } from 'ng-fixit';

@Component({
  imports: [NgFixit],
  templateUrl: './app.html',
})
export class App {}
```

Mount it once in the shell template:

```html
<ng-fixit />
```

That is all the setup required. The Annotation Mode control appears in the bottom-right corner during development.

## Features

- **Click to annotate** — select a rendered Angular UI element and attach a required note.
- **Precise Locators** — capture CSS paths, element details, and position data for each Target.
- **Agent-ready Reports** — copy structured Markdown directly into any AI coding agent.
- **Annotation management** — edit, delete, or clear Annotations before sharing a Report.
- **Safe by default** — the overlay follows Angular's `isDevMode()` and stays disabled in production builds.
- **Lightweight integration** — one standalone component, one stylesheet, and no UI-kit dependency.

## Requirements

- Angular 22
- `@angular/core` and `@angular/common` `^22.1.0`
- A desktop browser

## How it works

1. Run your Angular application with its usual development server.
2. Select **Annotation Mode** in the bottom-right corner.
3. Hover over the host UI to highlight a selectable Target.
4. Select a Target, write the required note, and press Enter.
5. Repeat for every change you want the coding agent to make.
6. Select **Copy Report** and paste the Markdown into your coding agent.
7. Press Escape or use the toggle to leave Annotation Mode.

Each Annotation pairs your note with a Locator for the selected DOM element. The resulting Report gives the agent concrete selectors and UI context instead of a vague visual description.

## Configuration

ng-fixit is enabled by Angular's `isDevMode()` by default, so production builds do not render the annotation UI.

You can explicitly control it from the application configuration or a parent injector:

```ts
import { NG_FIXIT_ENABLED } from 'ng-fixit';

{ provide: NG_FIXIT_ENABLED, useValue: false }
```

Use an explicit host flag when your environment needs stricter control. Do not enable ng-fixit in production by default.

## Behavior and limitations

- Annotations remain in memory for the current browser tab. Reloading clears them.
- Copying a Report does not clear the Annotation list.
- Library chrome cannot be selected as a Target.
- Target clicks are captured while Annotation Mode is active, so the host UI does not perform its normal click action.
- Each Annotation refers to one DOM element. Area selection and multi-element Targets are not supported.

## Public API

| Export             | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `NgFixit`          | Standalone component mounted once in the application shell.       |
| `NG_FIXIT_ENABLED` | Injection token for explicitly enabling or disabling the library. |
| `AnnotationMode`   | Type and values for Annotation Mode state.                        |
| `ANNOTATION_MODES` | List of supported Annotation Mode values.                         |

## Contributing

Issues and pull requests are welcome in the [GitHub repository](https://github.com/driie/ng-fixit-workspace). Please use the project's established Angular and product-language conventions.

## License

[MIT](https://github.com/driie/ng-fixit-workspace/blob/main/LICENSE) © driie
