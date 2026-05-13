# Known Bugs

## iOS Cursor Flicker

**Status**: Unresolved

**Description**: On iOS Safari, the CodeMirror cursor flickers/glitches while the virtual keyboard is open, even when not typing. The cursor appears to jump or flash at irregular intervals.

**Root cause**: Unknown. Likely iOS Safari's compositor interrupting CodeMirror's cursor rendering during `visualViewport` resize events triggered by the virtual keyboard. The following were attempted without success:

- Disabling cursor CSS animation (`animation: none`, solid `border-left`)
- Slowing cursor blink rate (`animation-duration: 1.2s`)
- Replacing `setInterval` polling with `focusin`/`focusout` events
- Removing all toolbar show/hide DOM mutations during keyboard use
- `overscroll-behavior: none` on `.cm-editor`
- `viewport-fit=cover` in viewport meta
- User-scalable=no, maximum-scale=1.0

None resolved the flicker. It appears to be a CodeMirror 6 + iOS Safari rendering issue that occurs specifically when the virtual keyboard is open and the viewport is resized.

**Workaround**: Use a desktop browser or Android. The editor is fully functional on iOS — the flicker is cosmetic only and does not affect input or execution.

---

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
