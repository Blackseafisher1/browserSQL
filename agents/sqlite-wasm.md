# SQLite WASM Integration Guide

## Package

```
@sqlite.org/sqlite-wasm@3.51.2-build8
```

CDN: `https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/index.mjs`

Use `/dist/index.mjs` (from `"main"` in `package.json`). NOT `/+esm` (breaks WASM path resolution), NOT `index.mjs` (doesn't exist at root), NOT `jswasm/sqlite3.mjs` (different version structure).

## WASM File Loading

The WASM file `sqlite3.wasm` lives at `/dist/sqlite3.wasm`. The Emscripten loader resolves it via `new URL("sqlite3.wasm", import.meta.url)` which works correctly when the JS is loaded from `/dist/index.mjs`.

The init function accepts a `locateFile` config option that overrides WASM path resolution:

```js
const SQLITE_BASE = 'https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/';
const sqlite3 = await sqlite3InitModule({
  locateFile: (file) => SQLITE_BASE + file,
});
```

## Database Operations

### Init
```js
const sqlite3 = await sqlite3InitModule({ locateFile: ... });
const db = new sqlite3.oo1.DB();  // in-memory
```

### Query
```js
const rows = db.exec('SELECT * FROM t', { rowMode: 'object' });
// rows = [{ col: val, ... }, ...]
```

### Export (Save to file or IndexedDB)
```js
// Preferred: oo1 API
const bytes = db.export();

// Fallback: capi (if export() missing on oo1.DB)
const bytes = sqlite3.capi.sqlite3_js_db_export(db.pointer);
```

### Import (Open from bytes) — CRITICAL

This is the most error-prone operation. The `sqlite3_deserialize()` capi function requires WASM heap pointers, not JS values.

**DO NOT** pass JS strings or TypedArrays directly to capi functions that expect C pointers. The capi wrapper in 3.51.2-build8 does NOT auto-convert JS strings to C strings (it tries `wasm.allocFromJs` which doesn't exist in this build).

**Correct approach — manual WASM heap allocation:**

```js
function deserializeDB(bytes) {
  const pDb = new sqlite3.oo1.DB();
  const capi = sqlite3.capi;
  const heap = sqlite3.wasm.heap8();

  // 1. Allocate "main\0" string in WASM heap
  const pName = capi.sqlite3_malloc(5);
  heap[pName] = 109;     // 'm'
  heap[pName+1] = 97;    // 'a'
  heap[pName+2] = 105;   // 'i'
  heap[pName+3] = 110;   // 'n'
  heap[pName+4] = 0;     // '\0'

  // 2. Allocate DB bytes in WASM heap + copy
  const pData = capi.sqlite3_malloc(bytes.length);
  heap.set(bytes, pData);

  try {
    const rc = capi.sqlite3_deserialize(
      pDb.pointer,         // sqlite3* db
      pName,               // const char* zDb → "main"
      pData,               // unsigned char* pData → binary DB
      bytes.length,        // sqlite3_int64 szDb
      bytes.length,        // sqlite3_int64 szBuffer
      0x0003               // unsigned int mFlags → FREEONCLOSE | RESIZEABLE
    );
    if (rc !== 0) {
      pDb.close();
      throw new Error(`deserialize failed (rc=${rc})`);
    }
    return pDb;
  } finally {
    capi.sqlite3_free(pName);  // free string, SQLite owns pData now
  }
}
```

**Key rules:**
- Allocate BOTH the db name AND the data buffer via `sqlite3_malloc` (NOT `_malloc`, NOT `allocateUTF8`, NOT `pstackAlloc` — all may be stripped)
- Copy data via `heap.set(typedArray, ptr)` where `heap = sqlite3.wasm.heap8()`
- Free the name string after (SQLite doesn't need it after deserialize)
- DO NOT free the data buffer — flag `0x0003` = `SQLITE_DESERIALIZE_FREEONCLOSE | SQLITE_DESERIALIZE_RESIZEABLE` means SQLite owns it now
- `0x0003` is `0x0001 | 0x0002`

## Available APIs (what works, what doesn't)

### Works
| API | Usage |
|-----|-------|
| `sqlite3.oo1.DB()` | Create in-memory DB |
| `db.exec(sql, { rowMode: 'object' })` | Execute SQL, returns objects |
| `db.exec(sql, { bind: [params], rowMode: 'object' })` | Parameterized queries |
| `db.export()` | Export to Uint8Array |
| `db.pointer` | Get the raw sqlite3* pointer |
| `db.close()` | Close database |
| `sqlite3.capi.sqlite3_js_db_export(ptr)` | Export via capi |
| `sqlite3.capi.sqlite3_changes(ptr)` | Rows modified |
| `sqlite3.capi.sqlite3_malloc(n)` | WASM heap alloc |
| `sqlite3.capi.sqlite3_free(ptr)` | WASM heap free |
| `sqlite3.capi.sqlite3_deserialize(dbPtr, namePtr, dataPtr, ...)` | Import binary DB |
| `sqlite3.wasm.heap8()` | Uint8Array view of WASM memory |
| `sqlite3.wasm` | WASM utility namespace |

### Does NOT work (stripped by build)
| API | Why |
|-----|-----|
| `sqlite3.wasm.allocFromJs(v)` | Not exposed in 3.51.2-build8 |
| `sqlite3.wasm.pstackAlloc(n)` | Not exposed |
| `sqlite3.wasm.pstackRestore(pos)` | Not exposed |
| `sqlite3.allocateUTF8(str)` | Emscripten runtime stripped |
| `sqlite3._malloc(n)` | Emscripten runtime stripped |
| `sqlite3._free(ptr)` | Emscripten runtime stripped |
| `sqlite3.HEAPU8` | Emscripten runtime stripped |
| `sqlite3.FS.createDataFile(...)` | FS module not linked |

Passing JS strings to capi functions that expect `const char*` also fails (same missing `allocFromJs` issue).

## IndexedDB Persistence

Store exported DB bytes in IndexedDB for "Recent Databases" feature:

```js
const IDB_NAME = 'browsersql-dbs';
const STORE_NAME = 'dbs';

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'name' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToLocal(name, data) {
  const idb = await openIDB();
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put({ name, data, savedAt: Date.now() });
  await new Promise(r => { tx.oncomplete = r; });
  idb.close();
}
```

Flow: Save → downloads `.sqlite` file + saves bytes to IndexedDB. "Recent" button → lists all saved DBs → click → loads bytes from IndexedDB → `deserializeDB(bytes)` → refreshes schema.

## CodeMirror 6

### Importmap (jsDelivr direct paths, not /+esm)

Use direct `dist/index.js` paths for all packages. The `/+esm` endpoint inlines dependencies causing duplicate `@codemirror/state` instances → `instanceof` checks break.

Complete importmap covering ALL transitive deps:

```json
{
  "imports": {
    "codemirror": "https://cdn.jsdelivr.net/npm/codemirror@6.0.1/dist/index.js",
    "@codemirror/lang-sql": "https://cdn.jsdelivr.net/npm/@codemirror/lang-sql@6.8.0/dist/index.js",
    "@codemirror/state": "https://cdn.jsdelivr.net/npm/@codemirror/state@6.5.0/dist/index.js",
    "@codemirror/view": "https://cdn.jsdelivr.net/npm/@codemirror/view@6.35.3/dist/index.js",
    "@codemirror/language": "https://cdn.jsdelivr.net/npm/@codemirror/language@6.10.8/dist/index.js",
    "@codemirror/commands": "https://cdn.jsdelivr.net/npm/@codemirror/commands@6.8.0/dist/index.js",
    "@codemirror/autocomplete": "https://cdn.jsdelivr.net/npm/@codemirror/autocomplete@6.18.6/dist/index.js",
    "@codemirror/lint": "https://cdn.jsdelivr.net/npm/@codemirror/lint@6.8.5/dist/index.js",
    "@codemirror/search": "https://cdn.jsdelivr.net/npm/@codemirror/search@6.5.8/dist/index.js",
    "@lezer/common": "https://cdn.jsdelivr.net/npm/@lezer/common@1.2.3/dist/index.js",
    "@lezer/highlight": "https://cdn.jsdelivr.net/npm/@lezer/highlight@1.2.1/dist/index.js",
    "@lezer/lr": "https://cdn.jsdelivr.net/npm/@lezer/lr@1.4.2/dist/index.js",
    "crelt": "https://cdn.jsdelivr.net/npm/crelt@1.0.6/index.js",
    "style-mod": "https://cdn.jsdelivr.net/npm/style-mod@4.1.2/src/style-mod.js",
    "w3c-keyname": "https://cdn.jsdelivr.net/npm/w3c-keyname@2.2.8/index.js",
    "@marijn/find-cluster-break": "https://cdn.jsdelivr.net/npm/@marijn/find-cluster-break@1.0.2/src/index.js"
  }
}
```

### SQLite dialect + autocomplete
```js
import { sql, SQLite } from '@codemirror/lang-sql';
// ...
sql({ dialect: SQLite })  // enables AUTOINCREMENT, SQLite-specific keywords
```
