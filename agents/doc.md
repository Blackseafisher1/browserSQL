# browserSQL — Developer Docs

## Autocomplete

The editor uses [`@codemirror/lang-sql`](https://codemirror.net/docs/ref/#lang-sql) for SQL parsing and completion. Table/column names from the loaded database are injected dynamically via a `Compartment`-based reconfiguration.

### How It Works

1. **Initial setup** — `initEditor()` creates a `Compartment` (`sqlConfig`) and passes it to the `sql()` extension:
   ```js
   sqlConfig.of(sql({ dialect: SQLite, schema: currentSchema }))
   ```
   At this point `currentSchema` is `{}` (no tables loaded yet).

2. **Schema loading** — When the user opens a DB or generates test data, `schemaView.renderSchema()` queries `sqlite_master` and calls `state.refreshEditorSchema(tableList)`.

3. **Compartment reconfigure** — `updateEditorSchema(tables)` builds a flat schema map:
   ```js
   { users: ['id', 'name', 'email'], products: ['product_id', 'name'] }
   ```
   Then dispatches:
   ```js
   view.dispatch({
     effects: sqlConfig.reconfigure(sql({ dialect: SQLite, schema }))
   })
   ```
   This replaces the `sql()` extension in-place, giving the editor the new table/column data without a full re-render.

4. **Completion sources** — `@codemirror/lang-sql` provides two sources:
   - **Keyword completion** — SQL keywords (`SELECT`, `FROM`, `WHERE`, `JOIN`, etc.)
   - **Schema completion** — table names appear after `FROM`, `JOIN`, etc. Column names appear after `table.` notation.
   
   Both are registered via `language.data.of({ autocomplete: ... })`. The autocomplete system from `@codemirror/autocomplete` (included in `basicSetup`) reads this facet when the user types.

5. **Triggering** — Completions appear automatically as the user types. The `.` character triggers column completion for the preceding table name. `Ctrl+Space` forces explicit completion.

### Schema Map Format

```js
{
  "users": ["customer_id", "first_name", "last_name", "email"],
  "products": ["product_id", "name", "price", "stock_quantity"],
  "orders": ["order_id", "customer_id", "order_date", "status"]
}
```

Keys = table names. Values = arrays of column names (strings). Built once per schema refresh, stored in `currentSchema` module variable.

### Key Files

| File | Role |
|------|------|
| `editorView.js` | `sqlConfig` Compartment, `updateEditorSchema()` |
| `schemaView.js` | `renderSchema()` queries tables, calls `state.refreshEditorSchema` |
| `app.js` | Wires `state.refreshEditorSchema = updateEditorSchema` |

### Common Issues

- **No table names in completion** → `updateEditorSchema` not called (check `state.refreshEditorSchema` is set before `state.renderSchema()`)
- **No completion at all** → `basicSetup` missing `autocompletion()` (check `codemirror` version in importmap)
- **`.notation` not working** → Schema map must use table names as keys. `@codemirror/lang-sql` traverses the namespace tree — `users.` looks up `currentSchema["users"]` and returns `{ label: col, type: "property" }` for each column
- **Stale completions after schema change** → `sqlConfig.reconfigure()` call may fail if `view` is null or `sqlConfig` was never initialized (init order problem)

---

## SQLite WASM

See `agents/sqlite-wasm.md` for the full integration guide.

Key points:
- CDN: `@sqlite.org/sqlite-wasm@3.51.2-build8/dist/index.mjs`
- Init: `await sqlite3InitModule({ locateFile: ... })`
- Deserialize: `sqlite3_malloc` + `heap8().set()` for WASM pointers
- Export: `db.export()` or `capi.sqlite3_js_db_export(db.pointer)`
- Persistence: IndexedDB for DB files, `saveToLocal()` / `loadFromLocal()`

## Editor Multi-File System

SQL files stored in localStorage under `browsersql-files`. Structure:
```json
{ "query.sql": "SELECT * FROM users;", "report.sql": "SELECT ..." }
```

Active file tracked in `browsersql-active-file`. `filesView.js` manages create/delete/switch. `saveCurrentFile()` reads editor content before switching. `setEditorContent()` writes to editor.

## Mobile

- **SQL keyboard toolbar**: Polls `document.activeElement` every 150ms. Shows `position: fixed; bottom: 0` when editor focused (keyboard open). Hides when focus lost.
- **Zoom disabled**: `user-scalable=no, maximum-scale=1.0` in viewport meta.
- **Touch targets**: All buttons forced to 16px font minimum on mobile (<768px).
- **Sidebar**: Hamburger button opens schema panel as slide-in drawer. File operations in sidebar toolbar.

## Settings

Stored in localStorage `browsersql-settings`:
```json
{ "fontSize": 14, "kbdEnabled": true, "kbdHeight": 40, "kbdForce": false }
```

- `fontSize` → `--editor-font-size` CSS variable
- `kbdEnabled` / `kbdForce` → keyboard toolbar visibility
- `kbdHeight` → `--kbd-height` CSS variable for button size
