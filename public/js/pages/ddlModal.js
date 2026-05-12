import { $ } from '../utils.js';
import { state } from '../state.js';
import { saveCurrentToLocal } from './dbManager.js';

const overlay = $('#ddl-modal-overlay');
const title = $('#ddl-modal-title');
const content = $('#ddl-modal-content');
const closeBtn = $('#ddl-modal-close');
const dropBtn = $('#btn-drop-table');

let currentTableName = null;

export function showDDLModal(tableName) {
  if (!state.db) return;
  currentTableName = tableName;
  try {
    const ddl = buildFormattedDDL(tableName);
    title.textContent = `Table: ${tableName}`;
    content.textContent = ddl;
    overlay.classList.remove('hidden');
  } catch (e) {
    title.textContent = 'Error';
    content.textContent = String(e);
    overlay.classList.remove('hidden');
  }
}

function buildFormattedDDL(tableName) {
  const db = state.db;
  const cols = db.exec(`PRAGMA table_info(${escId(tableName)})`, { rowMode: 'object' });
  if (cols.length === 0) return `-- Table "${tableName}" not found`;

  const fks = db.exec(`PRAGMA foreign_key_list(${escId(tableName)})`, { rowMode: 'object' });
  const lines = [];
  const pkCols = cols.filter(c => c.pk).map(c => c.name);

  for (const col of cols) {
    let line = `  ${col.name}`;
    if (col.type) line += ` ${col.type}`;
    if (col.notnull) line += ' NOT NULL';
    if (col.dflt_value !== null && col.dflt_value !== undefined) {
      line += ` DEFAULT ${col.dflt_value}`;
    }
    if (col.pk && pkCols.length === 1) line += ' PRIMARY KEY';
    if (col.pk && pkCols.length === 1) {
      const autoInc = checkAutoIncrement(tableName, col.name);
      if (autoInc) line += ' AUTOINCREMENT';
    }
    lines.push(line);
  }

  if (pkCols.length > 1) {
    lines.push(`  PRIMARY KEY (${pkCols.join(', ')})`);
  }

  for (const fk of fks) {
    const fromCols = [];
    const toCols = [];
    for (const row of fks.filter(r => r.id === fk.id)) {
      fromCols.push(row.from);
      toCols.push(row.to);
    }
    if (fk.id === fks[0].id || !fromCols.length) {
      lines.push(`  FOREIGN KEY (${fk.from}) REFERENCES ${fk.table}(${fk.to})`);
    }
  }
  // deduplicate foreign keys
  const seenFk = new Set();
  const fkLines = [];
  for (const fk of fks) {
    const key = `${fk.from}->${fk.table}(${fk.to})`;
    if (seenFk.has(key)) continue;
    seenFk.add(key);
    fkLines.push(`  FOREIGN KEY (${fk.from}) REFERENCES ${fk.table}(${fk.to})`);
  }

  const combined = [];
  const fkIds = [...new Set(fks.map(f => f.id))];
  for (const id of fkIds) {
    const group = fks.filter(f => f.id === id);
    const from = group.map(f => f.from).join(', ');
    const to = group.map(f => f.to).join(', ');
    combined.push(`  FOREIGN KEY (${from}) REFERENCES ${group[0].table}(${to})`);
  }

  return `CREATE TABLE ${tableName}(\n${lines.concat(combined).join(',\n')}\n);`;
}

function checkAutoIncrement(tableName, colName) {
  try {
    const rows = state.db.exec(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
      { bind: [tableName], rowMode: 'object' }
    );
    if (rows.length && rows[0].sql) {
      return rows[0].sql.toUpperCase().includes('AUTOINCREMENT');
    }
  } catch (_) {}
  return false;
}

export function hideDDLModal() {
  overlay.classList.add('hidden');
  currentTableName = null;
}

function dropCurrentTable() {
  if (!currentTableName || !state.db) return;
  const confirmed = confirm(`Drop table "${currentTableName}"? This cannot be undone.`);
  if (!confirmed) return;
  try {
    state.db.exec(`DROP TABLE IF EXISTS ${escId(currentTableName)}`);
    hideDDLModal();
    if (state.renderSchema) state.renderSchema();
    saveCurrentToLocal();
    showReadyInResults();
  } catch (e) {
    alert(`Drop failed: ${e.message || String(e)}`);
  }
}

function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function showReadyInResults() {
  const el = $('#results-info');
  const out = $('#results-output');
  if (el) el.textContent = 'Ready';
  if (out) out.innerHTML = '';
}

closeBtn.addEventListener('click', hideDDLModal);
dropBtn.addEventListener('click', dropCurrentTable);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) hideDDLModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideDDLModal();
});
