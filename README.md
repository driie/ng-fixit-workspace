# ng-fixit

Development-only Angular library. You pick UI on a running app, write a correction note, and copy a Markdown **Report** to paste into an AI coding agent.

Mount `<ng-fixit />` once. Enter **Annotation Mode**, click a **Target**, type a note, copy the **Report**.

Domain terms live in [`GLOSSARY.md`](./GLOSSARY.md).

|         |                                                             |
| ------- | ----------------------------------------------------------- |
| Package | `ng-fixit` on [npm](https://www.npmjs.com/package/ng-fixit) |
| Stack   | Angular 22                                                  |
| Prefix  | `fixit` (public root selector: `ng-fixit`)                  |
| Runtime | Development only (`isDevMode()` unless you override it)     |

## Use it in a host app

Needs Angular 22 (`@angular/core` and `@angular/common` `^22.1.0`).

```bash
pnpm add ng-fixit
```

Add the library stylesheet to the host `angular.json` `styles` array. A TypeScript `import 'ng-fixit/styles.css'` can fail typecheck (`TS2882`) and may not inject CSS with the application builder.

```json
"styles": ["src/styles.css", "node_modules/ng-fixit/styles.css"]
```

Import `NgFixit` on the application shell and mount it once:

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

The drop-in root stays inert unless `NG_FIXIT_ENABLED` is true. That token defaults to Angular `isDevMode()`, so production builds do not turn on Annotation Mode. You can force it:

```ts
import { NG_FIXIT_ENABLED } from 'ng-fixit';

{ provide: NG_FIXIT_ENABLED, useValue: false }
```

### Using Annotation Mode

1. Run the app with `ng serve` (or your usual dev server).
2. The Annotation Mode button sits at the bottom right. Click it. Escape turns it off.
3. Hover host UI. A highlight marks a selectable Target. Library chrome is not selectable.
4. Click a Target, type a required note, press Enter to save the Annotation.
5. Edit, delete, or clear notes in the list.
6. Click **Copy Report** and paste the Markdown into your agent. Copy does not clear the list.

Annotations live in memory for the current tab. A reload clears them.

Public API: `NgFixit`, `NG_FIXIT_ENABLED`, `AnnotationMode`, `ANNOTATION_MODES`.

## Publish a new version

CI publishes `dist/ng-fixit` to npm when you merge to `main` **and** `projects/ng-fixit/package.json` has a version that is not already on npm. Same version, no publish.

1. Bump `version` in `projects/ng-fixit/package.json` (semver).
2. Merge to `main`.
3. The **Publish** workflow tests, builds, then runs `.github/scripts/publish-if-new.sh`.

### One-time npm trusted publisher

Do this before the first publish (and before merging `0.1.0` to `main`):

1. Create an [npmjs.com](https://www.npmjs.com) account and enable 2FA.
2. Add a GitHub Actions **pending** trusted publisher for a new package named `ng-fixit`.
3. GitHub user: `MrPaYu`. Repository: `ng-fixit-workspace`. Workflow filename: `publish.yml`.

Docs: [Trusted publishing for npm](https://docs.npmjs.com/trusted-publishers/). The workflow uses OIDC (`id-token: write`). There is no `NPM_TOKEN` secret.

## Develop this repo

pnpm 11.x and a Node version that Angular 22 accepts.

```bash
pnpm install
pnpm build          # output: dist/ng-fixit/
pnpm start          # demo host at http://localhost:4200/
pnpm test           # library
pnpm test:demo      # demo
```

The demo consumes `dist/ng-fixit/` through tsconfig paths. After library edits, run `pnpm watch` in a second terminal. This demo is for dogfooding, not a production host.

```text
projects/ng-fixit/                 # publishable library
  src/
    lib/
      shell/ng-fixit/              # public drop-in root
      components/
      models/
      services/
      utils/
    public-api.ts
    styles.css                     # sole stylesheet
projects/ng-fixit-demo/            # development-only host
```

Use **pnpm** only. Prefer terms from `GLOSSARY.md`.

## v1 shape

- Drop-in root owns overlay chrome, Annotation Mode, the Annotation list, and copy Report
- Annotation Mode is an explicit toggle. When off, the host gets normal clicks. When on, Target clicks do not run host UI
- Target is a single DOM element
- An Annotation is a Target plus a required note. List CRUD, no reorder
- Report Markdown includes Locator, note, and Host Component when it can be discovered
- Out of v1: screenshots, persistence, freeform regions, live agent/MCP bridge

## License

[MIT](./LICENSE)
