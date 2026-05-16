let db = null;
let sqlite3 = null;
let pool = null;

self.onmessage = async (e) => {
  const { id, type, payload } = e.data;
  try {
    let result;
    switch (type) {
      case 'init': {
        const baseUrl = payload.baseUrl;
        const m = await import(baseUrl + 'index.mjs');
        sqlite3 = await m.default({
          locateFile: (file) => baseUrl + file,
          disableOpfs: true,
        });
        pool = await sqlite3.installOpfsSAHPoolVfs({
          initialCapacity: 30,
          clearOnInit: false,
          directory: 'browsersql-dbs',
        });
        db = new pool.OpfsSAHPoolDb('/main.db', 'c');
        result = { success: true, vfsName: pool.vfsName };
        break;
      }
      case 'exec': {
        if (!db) throw new Error('DB not initialized');
        const opts = {};
        if (payload.rowMode) opts.rowMode = payload.rowMode;
        if (payload.bind) opts.bind = payload.bind;
        const rows = db.exec(payload.sql, opts);
        const changes = sqlite3.capi.sqlite3_changes(db.pointer);
        result = { rows, changes };
        break;
      }
      case 'export': {
        if (!db) throw new Error('DB not initialized');
        if (typeof db.export === 'function') {
          result = db.export();
        } else {
          result = sqlite3.capi.sqlite3_js_db_export(db.pointer);
        }
        break;
      }
      case 'exportFile': {
        if (!pool) throw new Error('Pool not initialized');
        result = pool.exportFile(`/${payload.name}.db`);
        break;
      }
      case 'close': {
        if (db) { try { db.close(); } catch (_) {} db = null; }
        result = null;
        break;
      }
      case 'open': {
        if (!pool || !sqlite3) throw new Error('Not initialized');
        if (db) { try { db.close(); } catch (_) {} }
        db = new pool.OpfsSAHPoolDb(`/${payload.name}.db`);
        result = { success: true };
        break;
      }
      case 'create': {
        if (!pool || !sqlite3) throw new Error('Not initialized');
        if (db) { try { db.close(); } catch (_) {} }
        db = new pool.OpfsSAHPoolDb(`/${payload.name}.db`, 'c');
        result = { success: true };
        break;
      }
      case 'importDb': {
        if (!pool || !sqlite3) throw new Error('Not initialized');
        pool.importDb(`/${payload.name}.db`, payload.bytes);
        if (db) { try { db.close(); } catch (_) {} }
        db = new pool.OpfsSAHPoolDb(`/${payload.name}.db`);
        result = { success: true };
        break;
      }
      case 'deleteFile': {
        if (!pool) throw new Error('Pool not initialized');
        if (db) { try { db.close(); } catch (_) {} db = null; }
        if (typeof pool.deleteFile === 'function') {
          pool.deleteFile(`/${payload.name}.db`);
        }
        result = null;
        break;
      }
    }
    self.postMessage({ id, result });
  } catch (err) {
    self.postMessage({ id, error: err.message || String(err) });
  }
};
