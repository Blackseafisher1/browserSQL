# Known Bugs

## iOS Cursor Flicker

**Status**: Fixed

**Cause**: iOS **Reduce Motion** setting (`prefers-reduced-motion: reduce`) disables CSS animations. CodeMirror's cursor blink animation conflicts with the OS-level override, causing visible flicker.

**Fix**: Detect `prefers-reduced-motion` at editor init and set `cursorBlinkRate: -1` (never blink) via `drawSelection({ cursorBlinkRate })`. When blink rate is `-1`, CodeMirror renders a solid cursor via JavaScript, bypassing CSS animations entirely. iOS can't interfere.

**Code**:
```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
drawSelection({ cursorBlinkRate: reduceMotion ? -1 : 1200 })
```

Spring 2026

## SQLite WASM C String Allocation

**Status**: Fixed — see `agents/sqlite-wasm.md`

The `@sqlite.org/sqlite-wasm` bundler-friendly build strips Emscripten runtime functions (`_malloc`, `HEAPU8`, `allocateUTF8`) and WASM utility functions (`allocFromJs`, `pstackAlloc`, `pstackRestore`). String conversion for `sqlite3_deserialize` must use `sqlite3_malloc` + `wasm.heap8().set()` for WASM heap allocation.

---

## CodeMirror `lineWrapping` Not Exported

**Status**: Fixed

`lineWrapping` is not exported from `@codemirror/view` CDN dist bundles (confirmed across versions). Use `EditorView.contentAttributes.of({ class: 'cm-lineWrapping' })` instead — identical effect.

---

## `@codemirror/lang-sql@6.8.1` Missing on esm.sh

**Status**: Fixed — use `6.8.0`

Version `6.8.1` is not available on esm.sh. Use `@codemirror/lang-sql@6.8.0` with jsDelivr direct path instead.
