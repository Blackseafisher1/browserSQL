import { state, resetState } from '../state.js';
import { showToast } from './toast.js';
import { saveCurrentToLocal } from './dbManager.js';

function escId(name) {
  return '"' + name.replace(/"/g, '""') + '"';
}

function inferType(values) {
  let allNull = true, allInt = true, allReal = true;
  for (const v of values) {
    if (v === '' || v === null || v === undefined) continue;
    allNull = false;
    if (!/^-?\d+$/.test(v)) allInt = false;
    if (!/^-?\d+(\.\d+)?$/.test(v)) allReal = false;
  }
  if (allNull) return 'TEXT';
  if (allInt) return 'INTEGER';
  if (allReal) return 'REAL';
  return 'TEXT';
}

function parseCSV(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field.trim());
        field = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        current.push(field.trim());
        field = '';
        if (current.length > 0 && current.some(c => c !== '')) {
          rows.push(current);
        }
        current = [];
      } else if (ch === '\r') {
        current.push(field.trim());
        field = '';
        if (current.some(c => c !== '')) {
          rows.push(current);
        }
        current = [];
      } else {
        field += ch;
      }
    }
  }

  if (field.trim() || current.length > 0) {
    current.push(field.trim());
    if (current.some(c => c !== '')) {
      rows.push(current);
    }
  }

  return rows;
}

export async function importCSV(file) {
  if (!state.sqlite3) {
    showToast('No database loaded. Create or open one first.', 'error');
    return;
  }

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length < 1) {
    showToast('CSV file is empty.', 'error');
    return;
  }

  const CSV_WARN_KEY = 'browsersql-csv-warned';
  if (!localStorage.getItem(CSV_WARN_KEY)) {
    if (!confirm('⚠️ CSV Import Warning:\n\n- No type safety — all columns will be inferred\n- Only 1 table can be imported per file\n- Column names come from the first row\n\nContinue?')) return;
    localStorage.setItem(CSV_WARN_KEY, '1');
  }

  const headers = rows[0].map(h => h.replace(/[^a-zA-Z0-9_]/g, '_') || 'column');
  const data = rows.slice(1);

  const colCount = headers.length;
  const cols = [];
  for (let c = 0; c < colCount; c++) {
    const values = data.map(r => r[c] || '');
    cols.push({ name: headers[c] || ('col' + c), type: inferType(values) });
  }

  const tableName = file.name.replace(/\.csv$/i, '').replace(/[^a-zA-Z0-9_]/g, '_') || 'imported_data';

  const colDefs = cols.map(c => `${escId(c.name)} ${c.type}`).join(', ');
  const createSQL = `CREATE TABLE ${escId(tableName)} (${colDefs});`;

  function escVal(v, type) {
    if (v === '' || v === null || v === undefined) return 'NULL';
    if (type === 'INTEGER') {
      const n = parseInt(v, 10);
      return isNaN(n) ? 'NULL' : String(n);
    }
    if (type === 'REAL') {
      const n = parseFloat(v);
      return isNaN(n) ? 'NULL' : String(n);
    }
    return "'" + v.replace(/'/g, "''") + "'";
  }

  try {
    state.db?.close();
    state.db = new state.sqlite3.oo1.DB();
    resetState();
    state.db.exec(createSQL, { rowMode: 'object' });

    const insertSQL = `INSERT INTO ${escId(tableName)} VALUES (`;
    for (const row of data) {
      const values = cols.map((c, i) => escVal(row[i] || '', c.type)).join(', ');
      state.db.exec(insertSQL + values + ');', { rowMode: 'object' });
    }

    state.dbName = tableName;
    document.getElementById('db-name-input').value = tableName;
    if (state.renderSchema) state.renderSchema();
    await saveCurrentToLocal();

    showToast(`Imported ${data.length} rows into table "${tableName}"`, 'success');
  } catch (err) {
    showToast(`CSV import failed: ${err.message || String(err)}`, 'error');
  }
}
