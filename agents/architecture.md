# Architecture

## Editor
Single `EditorView` instance. File switching replaces doc via `dispatch({ changes })` with empty `Annotation` to minimize cursor flicker. Schema autocomplete via module-level `Compartment` — `updateEditorSchema()` calls `sqlConfig.reconfigure()` with fresh table/column map.

## Files
Files stored in localStorage (`browsersql-files` object, `browsersql-active-file` key). Default `query.sql` created on first load. `saveCurrentFile()` reads editor content before switch/execute/tab-change. `setEditorContent()` writes to editor.

## Schema View
Two tabs: **Tables** (schema tree with expandable columns, PK/FK badges, DDL/Drop buttons) and **Files** (file list with create/delete). Click table name selects it for templates. DDL/Drop buttons appear on hover.

## SQLite WASM
CDN: `@sqlite.org/sqlite-wasm@3.51.2-build8/dist/index.mjs` with `locateFile` config for wasm resolution. Deserialize uses `sqlite3_malloc` + `heap8().set()` for WASM pointers. Auto-save to IndexedDB after query execution.

## Mobile
- Viewport `user-scalable=no` disables zoom.
- Touch elements forced 16px to prevent iOS zoom.
- SQL keyboard toolbar: `position: fixed; bottom: kbHeight` when virtual keyboard open (detected via `document.activeElement` polling).
- Schema panel slides in from left via hamburger button.
- Header-only Recent button visible on mobile.

## Settings
Stored in localStorage `browsersql-settings`. Font size via `--editor-font-size`. Results zoom via `--results-font-size`. Word wrap via CSS class toggle on container.
