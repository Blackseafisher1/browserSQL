# Common Mistakes & Rules

## Imports

### Circular Dependencies
- `editorView.js` imports from `filesView.js` → `filesView.js` imports from `editorView.js` = **circular**
- **Fix**: put shared state in `state.js`, import `state` from there instead
- `state.activeFileIsJS`, `state.activeFileIsMD` — set in filesView, read in editorView

### Duplicate Imports
- Same symbol imported twice with different paths (e.g. `./state.js` vs `../state.js`)
- Same symbol from both `codemirror` meta-package AND `@codemirror/view` — same function, two module instances
- **Fix**: use ONE source per symbol, never both meta-package and sub-package

### Missing Importmap Entries
- Adding a new `@codemirror/lang-*` package requires ALL its transitive `@lezer/*` deps in the importmap
- Check: `curl -sL [package]/dist/index.js | grep "from '"` to find deps
- Common missing: `@lezer/javascript`, `@lezer/markdown`, `@lezer/html`, `@lezer/css`
- **Fix**: check deps before adding, add all at once

### `codemirror` Meta-Package (v6.0.1)
- Only exports: `EditorView`, `basicSetup`, `minimalSetup`
- Does NOT export: `Compartment`, `EditorState`, `drawSelection`, `autocompletion`, `keymap`, etc.
- **Fix**: import these from their respective `@codemirror/*` packages

## CSS

### Invalid Selectors
- `html.no-blink .cm-editor .cm-cursor, @media (...) { }` — comma between selector and media query is INVALID
- **Fix**: separate into two rules
- `@layer` ordering: `components` layer loads AFTER `layouts` layer → component styles override layout styles. If a media query is in layouts, it may be overridden by a non-media rule in components

### `!important` Usage
- Only justified for overriding CodeMirror inline styles (cursor, selection)
- Not needed for normal CSS variable theming

## SQLite WASM

### C String Allocation
- `sqlite3.wasm.allocFromJs()` — NOT available (stripped by build)
- `sqlite3.wasm.pstackAlloc()` — NOT available
- `sqlite3._malloc()` — NOT available (Emscripten runtime stripped)
- `sqlite3.allocateUTF8()` — NOT available
- `sqlite3.HEAPU8` — NOT available
- **WORKING**: `sqlite3.capi.sqlite3_malloc(n)` + `sqlite3.wasm.heap8().set(bytes, ptr)` + `sqlite3.capi.sqlite3_free(ptr)`

### Export
- `db.export()` — might not exist on older builds
- **Fallback**: `sqlite3.capi.sqlite3_js_db_export(db.pointer)`

### Deserialize
- Passing JS string `'main'` to `sqlite3_deserialize` → capi tries `allocFromJs()` → fails
- **Fix**: allocate via `sqlite3_malloc` + write bytes via `heap8().set()`, then pass pointer
- Flag `0x0003` = `SQLITE_DESERIALIZE_FREEONCLOSE | SQLITE_DESERIALIZE_RESIZEABLE`

## Editor Init Order

### `initEditor()` After `initFilesView()` → Ghost Editor
- `initFilesView()` calls `showEditors(1)` → `ensureEditor(0)` → creates `editors[0]` with content
- `initEditor()` then runs and **overwrites** `editors[0]` with new empty editor
- First editor orphaned but still in DOM → phantom lines visible behind active editor
- **Fix**: call `initEditor()` BEFORE `initFilesView()` in `app.js`

## CodeMirror 6

### `lineWrapping` Not Exported
- `@codemirror/view` CDN dist bundle doesn't export `lineWrapping`
- **Fix**: `EditorView.contentAttributes.of({ class: 'cm-lineWrapping' })` — does the same thing

### `drawSelection` Duplicate
- `basicSetup` / `minimalSetup` each include their own `drawSelection()`
- Adding another `drawSelection()` creates TWO instances — the last config wins for facets, but ViewPlugins from both run
- **Fix**: don't use `basicSetup`/`minimalSetup` when you need custom `drawSelection`. Build extensions manually from individual `@codemirror/*` packages

### Cursor Blink on iOS
- Solid cursor via CSS `!important` + `drawSelection({ cursorBlinkRate: -1 })` — works on most devices
- iOS with Reduce Motion ON may still flicker — not fixable from JS/CSS (iOS compositor bug)
- Set `caret-color: transparent` on `.cm-content:focus` to hide iOS native caret

### Schema Autocomplete
- `sql({ dialect: SQLite, schema: { tableName: ['col1', 'col2'] } })` — schema format is flat object
- NOT nested under `table` key
- Reconfigure via `Compartment` to update schema dynamically
- Pass initial empty schema `{}` — update via `compartment.reconfigure()` after tables load

## Sidebar (Section Panel)

### Flex Layout
- Every flex container needs `min-height: 0` to allow children to shrink below content size
- `.schema-panel`, `.section-node`, `.section-body` all need `min-height: 0`
- Without it, sections won't shrink below their content — resize handle breaks, sections overflow

### Collapse/Expand
- Set `flex: 0 0 auto` on `.section-node` when collapsed (header visible, body hidden via `display:none`)
- Set `flex: ''` (CSS default `flex: 1`) when expanded
- Always set collapse state via BOTH CSS class AND inline style (`body.style.display = 'none'`)

### Resize Handle
- Sets `flex: 0 0 X%` on `.section-node` (not on `.section-body`)
- Uses `previousElementSibling` / `nextElementSibling` of the handle div

## Files
- `getFiles()` reads from localStorage key `browsersql-files`
- Folder creation writes `.gitkeep` placeholder — hidden in render (skipped via `if (fp.endsWith('/.gitkeep')) continue`)
- Deleting last file auto-creates `scratch.sql`
- Language detection: `state.activeFileIsJS` / `state.activeFileIsMD` — set in `filesView.js`, read in `editorView.js`

## Toolbar (SQL Keyboard)
- Shown via `focus`/`blur` on `.cm-editor` element (browser) or polling `visualViewport.height` (PWA)
- `navigator.standalone === true` → PWA mode → use polling fallback
- Always `position: fixed; bottom: [kbHeight]px` when visible
- Hidden by default (`hide()` called on init)
