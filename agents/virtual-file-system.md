# Virtual File System

## Storage — localStorage

Flat key-value map in `localStorage`. No real filesystem.

| Key | Content | Separator |
|---|---|---|
| `browsersql-files` | JSON `Record<filename, content>` | normal mode |
| `browsersql-active-file` | Current open filename | normal mode |
| `browsersql-tutorial-files` | Same structure | tutorial mode |
| `browsersql-tutorial-active-file` | Current open filename | tutorial mode |

## File Tree

Folders are **virtual** — derived from `/` in filenames (`folder/sub/file.sql`). Folder existence tracked via `.gitkeep` markers in the same map. No real directory hierarchy.

### Build

`buildTree()` (`filesView.js:290-300`) splits filenames by `/`, groups into nested `{ folders, __files__[] }`. `renderTree()` (`filesView.js:307-314`) traverses and renders sidebar.

## Key Operations

| Function | What | File:Line |
|---|---|---|
| `getFiles()` | Parse `localStorage` JSON → `Record<string,string>` | `filesView.js:26-28` |
| `saveFiles()` | Serialize + write to key (scoped to mode) | `filesView.js:29` |
| `saveCurrentFile()` | Read editor content → update map + persist | `filesView.js:77-83` |
| `switchFile(name, pane)` | Load content from map → set editor + render tabs/tree | `filesView.js:90-112` |
| `createFile(name)` | Add empty entry to map → switch to it | `filesView.js:248-255` |
| `deleteFile(name)` | Remove from map, clean up tabs, fallback to default | `filesView.js:262-276` |
| `openSingleFile(name)` | Clear all tabs, open single file (tutorial mode) | `filesView.js:282-288` |
| `replaceFiles(files, active)` | Atomically swap file set (tutorial module load) | `filesView.js:48-54` |

## Editor Panes

Two panes (`paneTabs = [[], []]` at `filesView.js:13`). Each tracks up to 10 recent tabs. Right-click file → "Open to the Side" opens in pane 1. Side-by-side via `showEditors(2)`.

## Import / Export

### ZIP export (`filesView.js:470-472`)
- `downloadAsZip(getFiles(), 'browsersql-files')` — hand-rolled ZIP builder in `zip.js`
- Writes local file headers + central directory + EOCD, no compression (store method 0)
- `crc32` computed per file manually

### ZIP import (`filesView.js:480-508`)
- File picker → `readZip(file)` from `zip.js`
- Parses EOCD → central directory → local headers (store method only)
- Existing files backup-moved under `old-files/` folder prefix
- Merged with imported files

### Limits
- `localStorage` quota ~5-10MB per origin
- Content stored as UTF-8 strings (no binary files)
- No actual filesystem — all in memory + localStorage
- Folders are purely virtual path prefixes + `.gitkeep` markers
