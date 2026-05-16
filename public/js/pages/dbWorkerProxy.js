const SQLITE_BASE = 'https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/';

function isOPFSLockError(err) {
  const msg = (err.message || String(err)).toLowerCase();
  return msg.includes('createsyncaccesshandle')
    || msg.includes('nomodificationallowederror')
    || msg.includes('already active')
    || msg.includes('access handles cannot be created');
}

function showModal(title, body, level) {
  const existing = document.getElementById('opfs-status-modal');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'opfs-status-modal';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center';
  const card = document.createElement('div');
  const accent = level === 'warn' ? '#ff9800' : '#f44336';
  card.style.cssText = `background:var(--color-bg-surface,#1e1e1e);border:1px solid var(--color-border,#333);border-radius:12px;padding:24px;max-width:420px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.4);font-family:system-ui,sans-serif;color:var(--color-text,#e0e0e0)`;
  card.innerHTML = `
    <div style="font-size:2rem;margin-bottom:12px;text-align:center">${level === 'warn' ? '⚠️' : '❌'}</div>
    <h2 style="margin:0 0 8px;font-size:1.1rem;text-align:center;color:${accent}">${title}</h2>
    <p style="margin:0 0 16px;font-size:0.9rem;line-height:1.5;text-align:center;color:var(--color-text-muted,#999)">${body}</p>
    <button id="opfs-modal-close" style="display:block;margin:0 auto;padding:8px 24px;border:none;border-radius:6px;background:var(--color-accent,#58a6ff);color:#fff;font-size:0.9rem;cursor:pointer">OK</button>
  `;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  card.querySelector('#opfs-modal-close').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

class WorkerDBProxy {
  constructor(worker) {
    this.worker = worker;
    this._id = 0;
    this._pending = new Map();
    this._lastChanges = 0;
    this.isPersisted = true;
    worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const p = this._pending.get(id);
      if (!p) return;
      this._pending.delete(id);
      if (error) p.reject(new Error(error));
      else p.resolve(result);
    };
    worker.onerror = (e) => {
      const msg = e.message || (e.filename ? `load error at ${e.filename}:${e.lineno}` : 'failed to load');
      console.error('[SQLite Worker]', msg, e);
      for (const [id, p] of this._pending) {
        p.reject(new Error(msg));
      }
      this._pending.clear();
    };
  }

  _send(type, payload = {}) {
    const id = ++this._id;
    return new Promise((resolve, reject) => {
      this._pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, payload });
    });
  }

  async init() {
    const result = await this._send('init', { baseUrl: SQLITE_BASE });
    return result;
  }

  async exec(sql, opts = {}) {
    const result = await this._send('exec', { sql, ...opts });
    this._lastChanges = result.changes || 0;
    return result.rows || [];
  }

  async export() {
    return this._send('export');
  }

  async close() {
    return this._send('close');
  }

  async open(name) {
    return this._send('open', { name });
  }

  async create(name) {
    return this._send('create', { name });
  }

  async importDb(name, bytes) {
    return this._send('importDb', { name, bytes });
  }

  async deleteFile(name) {
    return this._send('deleteFile', { name });
  }

  async exportFile(name) {
    return this._send('exportFile', { name });
  }

  changes() {
    return this._lastChanges;
  }
}

class LocalDBProxy {
  constructor(sqlite3) {
    this.db = new sqlite3.oo1.DB();
    this.sqlite3 = sqlite3;
    this._lastChanges = 0;
    this.isPersisted = false;
  }

  async exec(sql, opts = {}) {
    const rows = this.db.exec(sql, opts);
    try {
      this._lastChanges = this.sqlite3.capi.sqlite3_changes(this.db.pointer) || 0;
    } catch (_) {
      this._lastChanges = 0;
    }
    return rows || [];
  }

  async export() {
    if (typeof this.db.export === 'function') return this.db.export();
    return this.sqlite3.capi.sqlite3_js_db_export(this.db.pointer);
  }

  async close() {
    try { this.db?.close(); } catch (_) {}
  }

  async open(name) {
    this.db?.close();
    this.db = new this.sqlite3.oo1.DB();
  }

  async create(name) {
    this.db?.close();
    this.db = new this.sqlite3.oo1.DB();
  }

  async importDb(name, bytes) {
    this.db?.close();
    const pDb = new this.sqlite3.oo1.DB();
    const capi = this.sqlite3.capi;
    const heap = this.sqlite3.wasm.heap8();
    const pName = capi.sqlite3_malloc(5);
    const pData = capi.sqlite3_malloc(bytes.length);
    heap[pName] = 109; heap[pName+1] = 97; heap[pName+2] = 105; heap[pName+3] = 110; heap[pName+4] = 0;
    heap.set(bytes, pData);
    try {
      const rc = capi.sqlite3_deserialize(
        pDb.pointer, pName, pData, bytes.length, bytes.length, 0x0003
      );
      if (rc !== 0) { pDb.close(); throw new Error(`deserialize failed (rc=${rc})`); }
      this.db = pDb;
    } finally {
      capi.sqlite3_free(pName);
    }
  }

  async deleteFile(name) {
    this.db?.close();
    this.db = new this.sqlite3.oo1.DB();
  }

  async exportFile(name) {
    return this.db.export ? this.db.export() : null;
  }

  changes() {
    return this._lastChanges;
  }
}

export async function createDB(sqlite3) {
  try {
    let worker;
    try {
      const workerUrl = new URL('../worker/sqlite-worker.js', import.meta.url).href;
      worker = new Worker(workerUrl, { type: 'module' });
    } catch (e) {
      throw new Error('Module workers not supported: ' + e.message);
    }
    const proxy = new WorkerDBProxy(worker);
    const result = await proxy.init();
    if (result && result.success) {
      return proxy;
    }
    throw new Error('Worker init returned failure');
  } catch (err) {
    if (isOPFSLockError(err)) {
      showModal(
        'Another Tab Has the Lock',
        'Your databases are already open in another browser tab. ' +
        'Only one tab can use OPFS storage at a time.<br><br>' +
        'The app will run in <strong>fallback mode</strong> using IndexedDB. ' +
        'Close the other tab and refresh to use OPFS storage.',
        'warn'
      );
    } else {
      console.warn('OPFS Worker unavailable, in-memory fallback', err);
      showModal(
        'OPFS Storage Unavailable',
        'Could not initialize OPFS storage for this browser.<br><br>' +
        '<strong>Error:</strong> ' + (err.message || String(err)) + '<br><br>' +
        'The app will run in <strong>fallback mode</strong> using IndexedDB. ' +
        'Your databases will still persist and work normally.',
        'error'
      );
    }
    return new LocalDBProxy(sqlite3);
  }
}
