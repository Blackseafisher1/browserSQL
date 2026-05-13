# Known Bugs

## iOS Cursor Flicker

**Status**: Partially mitigated, cosmetic only, no functional impact

**Cause**: iOS Safari compositor conflict during virtual keyboard transitions. Not related to cursor blink animation, Reduce Motion, active line highlighting, or any configurable setting.

**Attempted (none fully resolved)**:
- CSS `animation: none !important` on cursor
- Solid `border-left` cursor instead of animated
- `drawSelection({ cursorBlinkRate: -1 })` via JS
- Removed `highlightActiveLine`, `highlightSelectionMatches`
- `prefers-reduced-motion: reduce` detection with `!important` overrides
- `caret-color: transparent` on content
- `overscroll-behavior: none`, `viewport-fit=cover`, no polling intervals
- All imports from single `@codemirror/*` packages, no `codemirror` meta-package

**Observation**: Solid cursor reduced flicker by ~50% but didn't eliminate it. Remaining flicker is iOS Safari's internal rendering of the contenteditable layer during `visualViewport` resize — not controllable from CSS/JS.

**Verdict**: Accept as iOS quirk. Fully functional on all platforms, cosmetic only on iOS.

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
