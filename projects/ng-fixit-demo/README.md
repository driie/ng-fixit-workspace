# ng-fixit demo

Development-only host for dogfooding the `ng-fixit` drop-in root. It is not a production application.

The app mounts `<ng-fixit />` on a sample invoice page with a nested Host Component (`DemoInvoiceCard`) so you can exercise Target pick, Annotation create/list CRUD, and copy Report.

## Run

From the workspace root, after the library is built to `dist/ng-fixit/`:

```bash
pnpm build
pnpm start
```

Then open the printed local URL (default `http://localhost:4200/`).

For library edits, keep `pnpm watch` running in another terminal.

## Smoke path

1. Toggle **Annotation Mode** on.
2. Hover sample UI and confirm the Target highlight.
3. Click a Target (try **Pay invoice**), add a required note, commit.
4. Edit, delete, or clear Annotations in the list.
5. Copy Report and paste the Markdown into a text buffer.

Domain terms: workspace [`GLOSSARY.md`](../../GLOSSARY.md).
