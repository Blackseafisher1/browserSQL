## Goal

**Migrate Virtual File System from localStorage → IndexedDB** to remove the 5MB storage limit and enable async operations.

## What Changes

### Storage Mapping

| Current (localStorage) | New (IndexedDB) |
|---|---|
| `browsersql-files` | DB `browsersql-vfs`, store `files`, key `data` |
| `browsersql-tutorial-files` | DB `browsersql-vfs`, store `tutorial_files`, key `data` |
| `browsersql-active-file` | Keep in localStorage (small metadata) |
| `browsersql-tutorial-active-file` | Keep in localStorage (small metadata) |

### File Changes

**`public/js/pages/filesView.js`** — core rewrite:
- Replace `getFiles()` / `saveFiles()` with async IndexedDB versions
- All exported functions become async (`switchFile`, `createFile`, `deleteFile`, `renderTree`, `replaceFiles`, `openSingleFile`, `saveCurrentFile`, `ensureDefaultFiles`, `initFilesView`)
- One-time migration: on first load, copies data from localStorage → IndexedDB, clears localStorage keys

**`public/js/pages/editorView.js`** — `saveCurrentFile()` calls need `.catch(() => {})` for promise safety (fire-and-forget from timers + beforeunload)

**`public/js/pages/tutorialView.js`** — all file calls (`seedTutorialWorkspace`, `startTutorialMode`, `exitTutorialMode`, `goToLesson`) need `await`

**`public/js/app.js`** — `await initFilesView()` in `main()`

## Migration Flow (Automatic)

1. On `initFilesView()`, checks `browsersql-vfs-migrated` flag in localStorage
2. If not set, reads `browsersql-files` and `browsersql-tutorial-files` from localStorage
3. Writes both to IndexedDB stores
4. Deletes localStorage keys
5. Sets migration flag — runs once

## Key Details

- IndexedDB database name: `browsersql-vfs`
- Object stores: `files`, `tutorial_files`
- Each store has single entry with `{ key: 'data', value: <file-map> }`
- Active file names stay in localStorage (synchronous reads, no perf impact)
- No UI changes — file tree, tabs, autosave all work identically
