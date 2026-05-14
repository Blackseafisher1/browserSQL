# browserSQL

In-browser SQLite editor with CodeMirror 6, schema explorer, file management, and mobile support.

Access at:

**https://blackseafisher1.github.io/browserSQL/public**

## Features

- **SQL Editor** — CodeMirror 6 with SQLite dialect, table/column autocomplete, syntax highlighting
- **Schema Explorer** — Expandable table tree with column types, PK/FK badges, DDL view, drop table
- **File Management** — Multiple SQL files stored in localStorage, switch/rename/delete
- **Database Operations** — New, Open (`.sqlite`/`.db`), Export, Test Data with sample schema
- **Recent Databases** — Persisted to IndexedDB, auto-save on query execution, restore on reload
- **Mobile Optimized** — Touch-friendly toolbar above virtual keyboard, resizable editor/results, sidebar drawer
- **Results Table** — Zoom slider, alternating rows, vertical grid lines, sticky headers
- **Dark/Light Theme** — Toggle persisted to localStorage, respects `prefers-color-scheme`

## Usage

1. Serve `public/` with any static server:
   ```
   npx serve public/
   ```
2. Click **Test Data** to load a sample e-commerce schema (customers, products, orders, reviews)
3. Type SQL in the editor, press **Execute** or `Ctrl+Enter`
4. Click a table in the sidebar → **DDL** button shows schema, **Drop** deletes
5. Click the Files tab → create/switch between SQL files
6. Use the Settings gear for font size and word wrap

## Tech

| What | How |
|------|-----|
| Editor | CodeMirror 6 (`codemirror`, `@codemirror/lang-sql`) via CDN importmap |
| Database | `@sqlite.org/sqlite-wasm` — official SQLite WASM with oo1 API |
| Storage | IndexedDB for DB files, localStorage for settings/files |
| UI | Vanilla ES modules, CSS `@layer` architecture, `light-dark()` theming |
| Mobile | `visualViewport` + `activeElement` polling for keyboard detection |

## Known Quirks

- `lineWrapping` not exported from `@codemirror/view` CDN bundle — uses `EditorView.contentAttributes.of({ class: 'cm-lineWrapping' })` instead
- SQLite WASM C string conversion uses `sqlite3_malloc` + `heap8().set()` — `allocFromJs` and `_malloc` are stripped
- `@codemirror/lang-sql@6.8.1` not on esm.sh — use `6.8.0`
- Schema autocomplete via `Compartment.reconfigure` — updates table/column names dynamically
