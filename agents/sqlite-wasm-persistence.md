# SQLite WASM + Persistence

## Runtime

- **CDN**: `@sqlite.org/sqlite-wasm@3.51.2-build8` from jsDelivr (`public/js/pages/dbManager.js:161`)
- **Init**: Dynamic `import()` of `index.mjs` → `sqlite3Init()` → `new sqlite3.oo1.DB()` (`public/js/pages/dbManager.js:148-158`, `208-213`)
- **Bootstrap**: `app.js:main()` calls `initDatabase()` first. If fail, show error, halt (`public/js/app.js:43-47`)
- **API**: `oo1.DB` for query exec, `capi` for low-level ops (`sqlite3_changes`, `sqlite3_deserialize`, `sqlite3_js_db_export`)
- **CDN base**: `public/js/pages/dbManager.js:161` — change URL here to upgrade

## Persistence — IndexedDB

**No OPFS.** All saves go through IndexedDB.

| Function | What | File:Line |
|---|---|---|
| `openLocalDB()` | Opens `browsersql-dbs` IndexedDB (object store `dbs`, key `name`) | `dbManager.js:21-31` |
| `saveToLocal(name, bytes)` | Write `Uint8Array` snapshot | `dbManager.js:38-44` |
| `loadFromLocal(name)` | Read `Uint8Array` snapshot | `dbManager.js:51-61` |
| `listLocalDBs()` | All saved DBs, sorted newest first | `dbManager.js:67-77` |
| `deleteFromLocal(name)` | Remove snapshot | `dbManager.js:83-89` |

## Flow

### Save
1. `saveCurrentToLocal()` (`dbManager.js:345-351`) → calls `exportDB()` → `saveToLocal()`
2. Triggered after every query exec (non-tutorial) + schema changes

### Load (from IndexedDB)
1. `openLastDB()` (`dbManager.js:540-547`) on page load — reads `LAST_DB_KEY` from localStorage, loads from IndexedDB
2. Recent dropdown click → `loadFromLocal()` → `deserializeDB()` → `loadDBState()`

### Import from file
- File picker → `handleFileOpen()` → `arrayBuffer()` → `loadDBState()` → auto-save to IndexedDB

### Export to file
- `exportDatabase()` → `exportDB()` → `Blob` → download `.sqlite`

### Serialization
```js
// Export — two paths, prefer .export()
state.db.export()                             // oo1.DB method (preferred)
state.sqlite3.capi.sqlite3_js_db_export(...)  // fallback

// Import — sqlite3_deserialize with SQLITE_DESERIALIZE_FREEONCLOSE (0x0003)
capi.sqlite3_deserialize(pDb.pointer, pName, pData, bytes.length, bytes.length, 0x0003)
```

### Tutorial DB
- Schema hardcoded in `TUTORIAL_SCHEMA` (`dbManager.js:165-206`)
- `loadTutorialDatabase()` creates fresh `oo1.DB` + exec seed SQL
- Named `browsersql-tutorial`, never persisted to IndexedDB (recreated each session)
