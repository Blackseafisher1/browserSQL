import { $ } from '../utils.js';
import { state } from '../state.js';
import { saveCurrentToLocal } from './dbManager.js';

const overlay = $('#ddl-modal-overlay');
const title = $('#ddl-modal-title');
const content = $('#ddl-modal-content');
const closeBtn = $('#ddl-modal-close');
const dropBtn = $('#btn-drop-table');

let currentTableName = null;

/**
 * Opens the DDL modal for a table and renders a formatted CREATE TABLE statement.
 * @param {string} tableName Table to inspect.
 */
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

/**
 * Builds a readable CREATE TABLE statement for the given table.
 * @param {string} tableName Table name.
 * @returns {string}
 */
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
    if (col.pk && pkCols.length === 1) {
      line += ' PRIMARY KEY';
      const autoInc = checkAutoIncrement(tableName, col.name);
      if (autoInc) line += ' AUTOINCREMENT';
    }
    lines.push(line);
  }

  if (pkCols.length > 1) {
    lines.push(`  PRIMARY KEY (${pkCols.join(', ')})`);
  }

  const fkIds = [...new Set(fks.map(f => f.id))];
  const combined = [];
  for (const id of fkIds) {
    const group = fks.filter(f => f.id === id);
    const from = group.map(f => f.from).join(', ');
    const to = group.map(f => f.to).join(', ');
    combined.push(`  FOREIGN KEY (${from}) REFERENCES ${group[0].table}(${to})`);
  }

  return `CREATE TABLE ${tableName}(\n${lines.concat(combined).join(',\n')}\n);`;
}

/**
 * Detects whether a table column is AUTOINCREMENT.
 * @param {string} tableName Table name.
 * @param {string} colName Column name.
 * @returns {boolean}
 */
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

/**
 * Closes the DDL modal and clears the selected table.
 */
export function hideDDLModal() {
  overlay.classList.add('hidden');
  currentTableName = null;
}

/**
 * Drops the table currently shown in the modal.
 */
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
  if (e.target === overlay && !window.getSelection()?.toString()) hideDDLModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideDDLModal();
});
