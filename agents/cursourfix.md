# cursor blink fix

**Problem**: CodeMirror 6 cursor hyper-flicker on Windows when `prefers-reduced-motion: reduce` enabled. CSS `animation:none !important` + `opacity:1 !important` on `.cm-cursor` globally fought CM6 native blink engine, causing flicker.

**Fix** (`public/js/pages/editorView.js`, `public/css/components/editor.css`):
- Scoped heavy cursor CSS to `@media (prefers-reduced-motion: reduce)` only — targets `.cm-cursor` and `.cm-cursorLayer` with `animation:none !important; opacity:1 !important`
- JS checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at module init; passes `{ cursorBlinkRate: 0 }` to `drawSelection()` when true → solid cursor
- Normal users (reduced-motion off) get default CM6 blink (1200ms), no override
- Removed old `drawSelection({ cursorBlinkRate: -1 })` that disabled blink entirely
- Removed `caret-color: transparent` and blanket `animation:none` on all `.cm-cursor`
