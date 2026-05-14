import { $ } from '../utils.js';
import { state, resetState } from '../state.js';

const LAST_DB_KEY = 'browsersql-lastdb';

const fileInput = $('#file-input');
const btnNew = $('#btn-new-db');
const btnOpen = $('#btn-open-db');
const btnExport = $('#btn-export-db');
const btnDelete = $('#btn-delete-db');
const btnRecent = $('#btn-recent-dbs');
const recentDropdown = $('#recent-dbs-dropdown');
const dbNameInput = $('#db-name-input');

const LOCAL_DB_NAME = 'browsersql-dbs';

/**
 * Opens the IndexedDB database used to store local database snapshots.
 * @returns {Promise<IDBDatabase>}
 */
function openLocalDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LOCAL_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore('dbs', { keyPath: 'name' });
      store.createIndex('savedAt', 'savedAt');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Persists a database snapshot to local IndexedDB storage.
 * @param {string} name Database name.
 * @param {Uint8Array} data Serialized database bytes.
 */
async function saveToLocal(name, data) {
  const idb = await openLocalDB();
  const tx = idb.transaction('dbs', 'readwrite');
  tx.objectStore('dbs').put({ name, data, savedAt: Date.now() });
  await new Promise((r) => { tx.oncomplete = r; });
  idb.close();
}

/**
 * Loads a database snapshot from local IndexedDB storage.
 * @param {string} name Database name.
 * @returns {Promise<Uint8Array | undefined>}
 */
async function loadFromLocal(name) {
  const idb = await openLocalDB();
  const tx = idb.transaction('dbs', 'readonly');
  const req = tx.objectStore('dbs').get(name);
  const result = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  idb.close();
  return result?.data;
}

/**
 * Lists all locally saved databases, newest first.
 * @returns {Promise<Array<{name: string, data: Uint8Array, savedAt: number}>>}
 */
async function listLocalDBs() {
  const idb = await openLocalDB();
  const tx = idb.transaction('dbs', 'readonly');
  const req = tx.objectStore('dbs').getAll();
  const results = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  idb.close();
  return (results || []).sort((a, b) => b.savedAt - a.savedAt);
}

/**
 * Deletes a local database snapshot.
 * @param {string} name Database name.
 */
async function deleteFromLocal(name) {
  const idb = await openLocalDB();
  const tx = idb.transaction('dbs', 'readwrite');
  tx.objectStore('dbs').delete(name);
  await new Promise((r) => { tx.oncomplete = r; });
  idb.close();
}

/**
 * Wires the database toolbar, file input, shortcuts, and recent list.
 */
export function initDBManager() {
  btnNew.addEventListener('click', newDatabase);
  btnOpen.addEventListener('click', () => fileInput.click());
  btnExport.addEventListener('click', exportDatabase);
  btnDelete.addEventListener('click', deleteCurrentFromLocal);
  btnRecent.addEventListener('click', refreshRecentDBsList);
  fileInput.addEventListener('change', handleFileOpen);
  document.addEventListener('keydown', handleShortcuts);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.recent-wrap')) {
      recentDropdown.classList.add('hidden');
    }
  });
  recentDropdown.addEventListener('click', handleRecentClick);
  dbNameInput.addEventListener('change', () => {
    state.dbName = dbNameInput.value || 'untitled';
  });
}

/**
 * Initializes the SQLite WASM runtime and creates an empty database.
 * @returns {Promise<boolean>}
 */
export async function initDatabase() {
  try {
    const sqlite3 = await sqlite3Init();
    state.sqlite3 = sqlite3;
    state.db = new sqlite3.oo1.DB();
    dbNameInput.value = state.dbName;
    return true;
  } catch (e) {
    console.error('SQLite init failed:', e);
    return false;
  }
}

const SQLITE_BASE = 'https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/';

const TUTORIAL_DB_NAME = 'browsersql-tutorial';

const TUTORIAL_SCHEMA = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO users (id, name, city, age) VALUES
  (1, 'Ava', 'Berlin', 28),
  (2, 'Noah', 'Hamburg', 22),
  (3, 'Mia', 'Munich', 31),
  (4, 'Liam', 'Cologne', 19);

INSERT INTO products (id, name, price) VALUES
  (1, 'Keyboard', 79.90),
  (2, 'Mouse', 29.50),
  (3, 'Monitor', 219.00);

INSERT INTO orders (id, user_id, product_id, quantity, created_at) VALUES
  (1, 1, 1, 1, '2026-05-01'),
  (2, 1, 3, 2, '2026-05-02'),
  (3, 2, 2, 1, '2026-05-02'),
  (4, 3, 1, 1, '2026-05-03'),
  (5, 4, 2, 3, '2026-05-04');
`;

async function sqlite3Init() {
  const mod = await import(SQLITE_BASE + 'index.mjs');
  return mod.default({
    locateFile: (file) => SQLITE_BASE + file,
  });
}

/**
 * Creates a fresh empty database and resets app state.
 */
function newDatabase() {
  if (!state.sqlite3) return;
  try {
    state.db?.close();
  } catch (_) {}
  state.db = new state.sqlite3.oo1.DB();
  resetState();
  updateDBName('untitled');
  if (state.renderSchema) state.renderSchema();
  showReadyInResults();
  localStorage.removeItem(LAST_DB_KEY);
}

/**
 * Synchronizes the visible database name input and shared state.
 * @param {string} name Database name.
 */
function updateDBName(name) {
  state.dbName = name;
  dbNameInput.value = name;
}

/**
 * Reconstructs a SQLite database instance from serialized bytes.
 * @param {Uint8Array} bytes Serialized SQLite database.
 * @returns {any}
 */
function deserializeDB(bytes) {
  const pDb = new state.sqlite3.oo1.DB();
  const mod = state.sqlite3;
  const capi = mod.capi;
  const heap = mod.wasm.heap8();
  const pName = capi.sqlite3_malloc(5);
  const pData = capi.sqlite3_malloc(bytes.length);
  heap[pName] = 109; heap[pName+1] = 97; heap[pName+2] = 105; heap[pName+3] = 110; heap[pName+4] = 0;
  heap.set(bytes, pData);
  try {
    const rc = capi.sqlite3_deserialize(
      pDb.pointer, pName, pData, bytes.length, bytes.length, 0x0003
    );
    if (rc !== 0) {
      pDb.close();
      throw new Error(`deserialize failed (rc=${rc})`);
    }
    return pDb;
  } finally {
    capi.sqlite3_free(pName);
  }
}

/**
 * Exports the current database using the available SQLite API.
 * @returns {Uint8Array}
 */
function exportDB() {
  if (typeof state.db.export === 'function') {
    return state.db.export();
  }
  return state.sqlite3.capi.sqlite3_js_db_export(state.db.pointer);
}

/**
 * Loads serialized database bytes into the current session.
 * @param {Uint8Array} bytes Serialized SQLite database.
 * @param {string} name Database name.
 */
async function loadDBState(bytes, name) {
  if (!state.sqlite3) return;
  try {
    state.db?.close();
  } catch (_) {}
  state.db = deserializeDB(bytes);
  updateDBName(name);
  resetState();
  state.dbName = name;
  if (state.renderSchema) state.renderSchema();
  showReadyInResults();
  localStorage.setItem(LAST_DB_KEY, name);
}

/**
 * Handles opening a database file from disk.
 * @param {Event} e File input change event.
 */
async function handleFileOpen(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const buffer = await file.arrayBuffer();
    const name = file.name.replace(/\.(sqlite|db)$/i, '');
    const bytes = new Uint8Array(buffer);
    await loadDBState(bytes, name);
    await saveToLocal(name, bytes);
    refreshRecentDBsList();
  } catch (err) {
    showErrorInResults(`Failed to open database: ${err.message || String(err)}`);
  }
  fileInput.value = '';
}

/**
 * Downloads the current database as a SQLite file.
 */
async function exportDatabase() {
  if (!state.db || !state.sqlite3) {
    showErrorInResults('No database to export.');
    return;
  }
  try {
    const byteArray = exportDB();
    const blob = new Blob([byteArray], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.dbName || 'database'}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    showErrorInResults(`Export failed: ${err.message || String(err)}`);
  }
}

/**
 * Persists the current database snapshot to local storage.
 */
export async function saveCurrentToLocal() {
  if (!state.db || !state.sqlite3) return;
  try {
    const byteArray = exportDB();
    await saveToLocal(state.dbName || 'database', byteArray);
  } catch (_) {}
}

/**
 * Loads the bundled test schema into a fresh database.
 */
export async function loadTestSchema() {
  if (!state.sqlite3) return;
  try {
    const existing = await loadFromLocal('test_data');
    if (existing) {
      if (!confirm('You already have a test_data database. Overwrite it?')) return;
    }
    const res = await fetch('test_schema.sql');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const sql = await res.text();
    state.db?.close();
    state.db = new state.sqlite3.oo1.DB();
    resetState();
    state.dbName = 'test_data';
    dbNameInput.value = 'test_data';
    state.db.exec(sql, { rowMode: 'object' });
    await saveCurrentToLocal();
    localStorage.setItem(LAST_DB_KEY, 'test_data');
    if (state.renderSchema) state.renderSchema();
    showReadyInResults();
  } catch (err) {
    showErrorInResults(`Test schema failed: ${err.message || String(err)}`);
  }
}

/**
 * Creates a fresh tutorial database with a small, stable learning schema.
 * @returns {Promise<boolean>}
 */
export async function loadTutorialDatabase(seedSql = TUTORIAL_SCHEMA) {
  if (!state.sqlite3) return false;
  try {
    state.db?.close();
  } catch (_) {}
  try {
    state.db = new state.sqlite3.oo1.DB();
    resetState();
    if (seedSql && seedSql.trim()) {
      state.db.exec(seedSql, { rowMode: 'object' });
    }
    state.dbName = TUTORIAL_DB_NAME;
    dbNameInput.value = TUTORIAL_DB_NAME;
    if (state.renderSchema) state.renderSchema();
    showReadyInResults();
    return true;
  } catch (err) {
    showErrorInResults(`Tutorial database failed: ${err.message || String(err)}`);
    return false;
  }
}

/**
 * Refreshes the recent database dropdown contents.
 */
async function refreshRecentDBsList() {
  try {
    const dbs = await listLocalDBs();
    recentDropdown.innerHTML = '';
    if (dbs.length === 0) {
      recentDropdown.innerHTML = '<div class="dropdown-empty">No saved databases</div>';
    } else {
      for (const db of dbs) {
        const item = document.createElement('button');
        item.className = 'dropdown-item';
        item.dataset.name = db.name;
        const date = new Date(db.savedAt);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        item.innerHTML = `<span class="item-name">${esc(db.name)}</span><span class="item-date">${dateStr}</span>`;
        recentDropdown.appendChild(item);
      }
    }
    recentDropdown.classList.toggle('hidden');
  } catch (err) {
    console.error('Failed to list recent DBs:', err);
  }
}

/**
 * Handles selecting a recent database from the dropdown.
 * @param {MouseEvent} e Click event.
 */
async function handleRecentClick(e) {
  const item = e.target.closest('.dropdown-item');
  if (!item) return;
  const name = item.dataset.name;
  recentDropdown.classList.add('hidden');
  try {
    const data = await loadFromLocal(name);
    if (!data) {
      showErrorInResults(`Database "${name}" not found in local storage.`);
      await deleteFromLocal(name);
      refreshRecentDBsList();
      return;
    }
    await loadDBState(data, name);
  } catch (err) {
    showErrorInResults(`Failed to open from local: ${err.message || String(err)}`);
  }
}

/**
 * Deletes the current database from local storage after confirmation.
 */
async function deleteCurrentFromLocal() {
  const name = state.dbName;
  if (!name || name === 'untitled') {
    showErrorInResults('No saved database to delete.');
    return;
  }
  const confirmed = confirm(`Delete "${name}" from local storage? This cannot be undone.`);
  if (!confirmed) return;
  try {
    await deleteFromLocal(name);
    newDatabase();
    refreshRecentDBsList();
    showReadyInResults();
  } catch (err) {
    showErrorInResults(`Delete failed: ${err.message || String(err)}`);
  }
}

/**
 * Handles keyboard shortcuts for save, open, and new database actions.
 * @param {KeyboardEvent} e Keydown event.
 */
function handleShortcuts(e) {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && e.key === 's') {
    e.preventDefault();
    exportDatabase();
  }
  if (ctrl && e.key === 'o') {
    e.preventDefault();
    fileInput.click();
  }
  if (ctrl && e.key === 'n') {
    e.preventDefault();
    newDatabase();
  }
}

/**
 * Writes the ready state to the results pane.
 */
function showReadyInResults() {
  const el = $('#results-info');
  const out = $('#results-output');
  if (el) el.textContent = 'Ready';
  if (out) out.innerHTML = '';
}

/**
 * Writes an error state to the results pane.
 * @param {string} msg Error message.
 */
function showErrorInResults(msg) {
  const el = $('#results-info');
  const out = $('#results-output');
  if (el) el.textContent = 'Error';
  if (out) out.innerHTML = `<div class="results-error">${esc(msg)}</div>`;
}

/**
 * Escapes text for safe HTML insertion.
 * @param {string} s Raw text.
 * @returns {string}
 */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/**
 * Reopens the last active local database, if one was saved.
 */
export async function openLastDB() {
  const name = localStorage.getItem(LAST_DB_KEY);
  if (!name) return;
  try {
    const data = await loadFromLocal(name);
    if (data) await loadDBState(data, name);
  } catch (_) {}
}
