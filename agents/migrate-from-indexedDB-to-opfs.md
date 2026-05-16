## Goal

**Migrate from IndexedDB to OPFS-sahpool for better performance while keeping existing functionality (virtual file system, database persistence, tutorial mode).**

## What to Do

### 1. **Add OPFS-sahpool initialization** (`dbManager.js`)

```javascript
// Add new function
async function initOPFSPool() {
    try {
        const poolUtil = await state.sqlite3.installOpfsSAHPoolVfs({
            initialCapacity: 20,  // Enough for multiple DBs + journals
            clearOnInit: false    // Preserve data
        });
        state.opfsPool = poolUtil;
        return true;
    } catch (err) {
        console.warn('OPFS not available, fallback to IndexedDB', err);
        return false;
    }
}

// Modify saveToLocal / loadFromLocal to use OPFS when available
async function saveToLocal(name, data) {
    if (state.opfsPool) {
        // Use OPFS
        const db = new state.opfsPool.OpfsSAHPoolDb(`/${name}.db`);
        // Write data - need to import
        state.opfsPool.importDb(`/${name}.db`, data);
        return;
    }
    // Fallback to IndexedDB (existing code)
}
```

### 2. **Virtual File System remains on localStorage** (no change needed)
- Your virtual files (`getFiles()`/`saveFiles()`) stay on localStorage
- Only database persistence changes to OPFS
- File tree UI unchanged

### 3. **Database operations changes**

```javascript
// Current: state.db = new sqlite3.oo1.DB()
// New for OPFS:
const db = new state.opfsPool.OpfsSAHPoolDb(`/${dbName}.db`);

// Export still works same
const bytes = exportDB(); // unchanged
```

### 4. **Multi-tab warning** (optional but recommended)

```javascript
// In initDatabase()
let dbOpened = false;
try {
    await initOPFSPool();
    // Try to open test DB
    const testDb = new state.opfsPool.OpfsSAHPoolDb('/test.db');
    dbOpened = true;
} catch (err) {
    if (err.message.includes('already active')) {
        alert('Database already open in another tab. Please close other tabs.');
    }
}
```

## Key OPFS-sahpool Facts

| Feature | Detail |
|---------|--------|
| **Paths** | Must be **absolute** (start with `/`) |
| **Concurrency** | Single tab only (fails gracefully on second tab) |
| **No COOP/COEP** | Works without headers ✅ |
| **Files** | Managed internally, not visible as real files |
| **Capacity** | `initialCapacity` - needs to be > number of DBs × 2 (for journals) |
| **Import** | `poolUtil.importDb('/name.db', uint8Array)` |
| **Export** | `poolUtil.exportFile('/name.db')` returns `Uint8Array` |

## Migration Steps (Order)

1. Add `initOPFSPool()` - call after `sqlite3Init()`
2. Modify `saveToLocal()` - try OPFS first, fallback to IndexedDB
3. Modify `loadFromLocal()` - try OPFS first
4. Modify `deleteFromLocal()` - delete OPFS file if exists
5. Update `openLastDB()` to work with both
6. Keep `listLocalDBs()` - still needed for IndexedDB fallback
7. Add migration helper to copy existing IndexedDB to OPFS on first run

## Critical Gotchas

```javascript
// ❌ Wrong - missing leading slash
new OpfsSAHPoolDb('my.db')

// ✅ Correct
new OpfsSAHPoolDb('/my.db')

// ❌ Can't list files (use IndexedDB for metadata)
// ✅ Keep db names list in localStorage for UI

// ❌ Don't mix with normal OPFS VFS
// ✅ Use only sahpools for consistency

// ✅ Close DB before switching
db.close();
```

## Testing Checklist

- [ ] New DB created in OPFS
- [ ] Existing IndexedDB migrated on first load
- [ ] Export still works
- [ ] Import works and saves to OPFS
- [ ] Tutorial mode still works (uses separate DBs)
- [ ] Second tab shows warning (not crash)

## Memory/Performance

- Initial capacity: 20 handles = ~2-3 MB overhead
- Each DB + journal = 2 handles
- 10 DBs = 20 handles
- Performance: **10-50x faster than IndexedDB**