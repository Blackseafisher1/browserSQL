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

async function saveToLocal(name, data) {
  const idb = await openLocalDB();
  const tx = idb.transaction('dbs', 'readwrite');
  tx.objectStore('dbs').put({ name, data, savedAt: Date.now() });
  await new Promise((r) => { tx.oncomplete = r; });
  idb.close();
}

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

async function deleteFromLocal(name) {
  const idb = await openLocalDB();
  const tx = idb.transaction('dbs', 'readwrite');
  tx.objectStore('dbs').delete(name);
  await new Promise((r) => { tx.oncomplete = r; });
  idb.close();
}

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

async function sqlite3Init() {
  const mod = await import(SQLITE_BASE + 'index.mjs');
  return mod.default({
    locateFile: (file) => SQLITE_BASE + file,
  });
}

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

function updateDBName(name) {
  state.dbName = name;
  dbNameInput.value = name;
}

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

function exportDB() {
  if (typeof state.db.export === 'function') {
    return state.db.export();
  }
  return state.sqlite3.capi.sqlite3_js_db_export(state.db.pointer);
}

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

export async function saveCurrentToLocal() {
  if (!state.db || !state.sqlite3) return;
  try {
    const byteArray = exportDB();
    await saveToLocal(state.dbName || 'database', byteArray);
    refreshRecentDBsList();
  } catch (_) {}
}

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

function showReadyInResults() {
  const el = $('#results-info');
  const out = $('#results-output');
  if (el) el.textContent = 'Ready';
  if (out) out.innerHTML = '';
}

function showErrorInResults(msg) {
  const el = $('#results-info');
  const out = $('#results-output');
  if (el) el.textContent = 'Error';
  if (out) out.innerHTML = `<div class="results-error">${esc(msg)}</div>`;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export async function openLastDB() {
  const name = localStorage.getItem(LAST_DB_KEY);
  if (!name) return;
  try {
    const data = await loadFromLocal(name);
    if (data) await loadDBState(data, name);
  } catch (_) {}
}
