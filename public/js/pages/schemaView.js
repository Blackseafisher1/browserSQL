import { $, $$, esc } from '../utils.js';
import { state } from '../state.js';
import { showDDLModal } from './ddlModal.js';

const tree = $('#schema-tree');
const contextMenu = $('#context-menu');

/**
 * Wires schema tree rendering, selection, and context menu interactions.
 */
export function initSchemaView() {
  state.renderSchema = renderSchema;
  tree.addEventListener('click', handleTreeClick);
  document.addEventListener('click', hideContextMenu);
  document.addEventListener('contextmenu', handleContextMenu);
  contextMenu.addEventListener('click', handleContextMenuClick);

  document.getElementById('btn-copy-ddl-all')?.addEventListener('click', async () => {
    if (!state.db) return;
    try {
      const rows = state.db.exec(
        `SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND type IN ('table','view') ORDER BY type DESC, name`,
        { rowMode: 'object' }
      );
      const ddl = rows.map(r => r.sql).join(';\n\n') + ';';
      await navigator.clipboard.writeText(ddl);
      const btn = document.getElementById('btn-copy-ddl-all');
      const orig = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = orig, 1500);
    } catch (_) {}
  });
}

/**
 * Rebuilds the schema sidebar from the current database.
 */
async function renderSchema() {
  if (!state.db) {
    tree.innerHTML = '<div class="schema-empty">No tables</div>';
    return;
  }
  try {
    const tables = state.db.exec(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
      { rowMode: 'object' }
    );
    const tableList = [];
    for (const t of tables) {
      const cols = state.db.exec(
        `PRAGMA table_info(${escId(t.name)})`,
        { rowMode: 'object' }
      );
      const fks = state.db.exec(
        `PRAGMA foreign_key_list(${escId(t.name)})`,
        { rowMode: 'object' }
      );
      const fkCols = new Set(fks.map(f => f.from));
      const idxs = state.db.exec(
        `PRAGMA index_list(${escId(t.name)})`,
        { rowMode: 'object' }
      );
      const uniqueCols = new Set();
      const indexes = [];
      for (const idx of idxs) {
        const info = state.db.exec(
          `PRAGMA index_info(${escId(idx.name)})`,
          { rowMode: 'object' }
        );
        const cols = info.map(i => i.name);
        if (idx.origin === 'u') cols.forEach(c => uniqueCols.add(c));
        if (idx.origin !== 'pk') indexes.push({ name: idx.name, columns: cols, unique: idx.unique === 1 || idx.origin === 'u' });
      }
      const ddlRows = state.db.exec(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
        { bind: [t.name], rowMode: 'object' }
      );
      const ddl = ddlRows.length > 0 ? ddlRows[0].sql || '' : '';
      const autoIncCols = new Set();
      if (ddl.toUpperCase().includes('AUTOINCREMENT')) {
        const pkCols = cols.filter(c => c.pk);
        for (const c of pkCols) autoIncCols.add(c.name);
      }
      const columns = cols.map(c => ({
        name: c.name,
        type: c.type || 'TEXT',
        pk: c.pk === 1 || c.pk === true,
        fk: fkCols.has(c.name),
        nn: c.notnull === 1,
        uq: uniqueCols.has(c.name),
        ai: autoIncCols.has(c.name),
      }));
      tableList.push({ name: t.name, columns, indexes });
    }
    state.tables = tableList;
    const views = state.db.exec(
      `SELECT name FROM sqlite_master WHERE type='view' ORDER BY name`,
      { rowMode: 'object' }
    );
    renderTree(tableList, views);
    if (state.refreshEditorSchema) {
      state.refreshEditorSchema(tableList);
    }
  } catch (e) {
    tree.innerHTML = `<div class="schema-empty">Error: ${esc(e.message)}</div>`;
  }
}

/**
 * Escapes an SQLite identifier.
 * @param {string} name Identifier name.
 * @returns {string}
 */
function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Renders the schema tree HTML from the discovered tables.
 * @param {Array<{name: string, columns: Array<{name: string, type: string, pk: boolean, fk: boolean, nn: boolean, uq: boolean, ai: boolean}>}>} tables Table metadata.
 */
function renderTree(tables, views) {
  if (tables.length === 0 && (!views || views.length === 0)) {
    tree.innerHTML = '<div class="schema-empty">No tables or views</div>';
    return;
  }
  let html = '';
  for (const t of tables) {
    const expanded = state.tableExpanded.has(t.name) ? 'expanded' : '';
    const active = state.activeTable === t.name ? 'active' : '';
    const arrow = state.tableExpanded.has(t.name) ? '▾' : '▸';
    html += `<div class="schema-table" data-table="${esc(t.name)}">`;
    html += `<div class="schema-table-name ${active}" data-table-name="${esc(t.name)}">`;
    html += `<span class="expand-icon ${expanded}">${arrow}</span>`;
    html += `<span class="schema-table-label">${esc(t.name)}</span>`;
    html += `<span class="schema-table-actions">`;
    html += `<button class="btn-schema-ddl" data-ddl="${esc(t.name)}" title="View DDL">DDL</button>`;
    html += `<button class="btn-schema-drop" data-drop="${esc(t.name)}" title="Drop table">Drop</button>`;
    html += `</span>`;
    html += `</div>`;
    if (state.tableExpanded.has(t.name)) {
      html += `<div class="schema-columns">`;
      for (const c of t.columns) {
        html += `<div class="schema-column">`;
        html += `<span>${esc(c.name)}</span>`;
        html += `<span class="col-type">${esc(c.type)}</span>`;
        if (c.pk) html += '<span class="col-badge col-pk">PK</span>';
        if (c.fk) html += '<span class="col-badge col-fk">FK</span>';
        if (c.uq) html += '<span class="col-badge col-uq">UQ</span>';
        if (c.ai) html += '<span class="col-badge col-ai">AI</span>';
        if (c.nn) html += '<span class="col-badge col-nn">NN</span>';
        html += `</div>`;
      }
        // Indexes under columns
        if (t.indexes && t.indexes.length > 0) {
          html += `<div class="schema-indexes">`;
          for (const idx of t.indexes) {
            const label = (idx.unique ? 'UNIQUE ' : '') + 'INDEX';
            html += `<div class="schema-index"><span class="col-badge col-idx">${esc(label)}</span><span>${esc(idx.name)}</span><span class="col-type">${esc(idx.columns.join(', '))}</span></div>`;
          }
          html += `</div>`;
        }
        html += `</div>`;
      }
    html += `</div>`;
  }
  if (views && views.length > 0) {
    html += `<div class="schema-section-label">Views</div>`;
    for (const v of views) {
      html += `<div class="schema-table"><div class="schema-table-name" data-view-name="${esc(v.name)}"><span class="schema-table-label">👁 ${esc(v.name)}</span></div></div>`;
    }
  }
  tree.innerHTML = html;
}

/**
 * Handles single-click selection and schema actions.
 * @param {MouseEvent} e Click event.
 */
function handleTreeClick(e) {
  const viewEl = e.target.closest('[data-view-name]');
  if (viewEl) {
    const viewName = viewEl.dataset.viewName;
    try {
      const sql = `SELECT * FROM ${escId(viewName)} LIMIT 100`;
      const rows = state.db.exec(sql, { rowMode: 'object' });
      import('./resultsView.js').then(r => r.showResults(rows, '0.01'));
    } catch (err) {
      import('./resultsView.js').then(r => r.showError(err.message));
    }
    return;
  }
  const ddlBtn = e.target.closest('[data-ddl]');
  if (ddlBtn) {
    showDDLModal(ddlBtn.dataset.ddl);
    return;
  }
  const dropBtn = e.target.closest('[data-drop]');
  if (dropBtn) {
    const name = dropBtn.dataset.drop;
    if (confirm(`Drop table "${name}"? This cannot be undone.`)) {
      state.db.exec(`DROP TABLE IF EXISTS ${escId(name)}`);
      if (state.renderSchema) state.renderSchema();
      import('./dbManager.js').then(m => m.saveCurrentToLocal());
    }
    return;
  }
  const tableEl = e.target.closest('[data-table-name]');
  if (!tableEl) return;
  const tableName = tableEl.dataset.tableName;
  const expandIcon = e.target.closest('.expand-icon');
  if (expandIcon) {
    e.stopPropagation();
    toggleExpand(tableName);
    return;
  }
  // Single click on table name → execute SELECT * LIMIT 100
  state.activeTable = tableName;
  updateActiveState(tableName);
  if (!state.db) return;
  try {
    const sql = `SELECT * FROM ${escId(tableName)} LIMIT 100`;
    const rows = state.db.exec(sql, { rowMode: 'object' });
    import('./resultsView.js').then(r => r.showResults(rows, '0.01'));
  } catch (err) {
    import('./resultsView.js').then(r => r.showError(err.message));
  }
}

/**
 * Toggles whether a schema table is expanded.
 * @param {string} name Table name.
 */
function toggleExpand(name) {
  if (state.tableExpanded.has(name)) {
    state.tableExpanded.delete(name);
  } else {
    state.tableExpanded.add(name);
  }
  renderSchema();
}

/**
 * Updates the active-table highlight state.
 * @param {string} name Table name.
 */
function updateActiveState(name) {
  $$('.schema-table-name').forEach(el => {
    el.classList.toggle('active', el.dataset.tableName === name);
  });
}

/**
 * Opens the floating schema context menu for a table.
 * @param {MouseEvent} e Context-menu event.
 */
function handleContextMenu(e) {
  const tableEl = e.target.closest('[data-table-name]');
  if (!tableEl) return;
  e.preventDefault();
  const tableName = tableEl.dataset.tableName;
  showContextMenu(e.clientX, e.clientY, tableName);
}

/**
 * Populates and positions the schema context menu.
 * @param {number} x Client X coordinate.
 * @param {number} y Client Y coordinate.
 * @param {string} tableName Table name.
 */
function showContextMenu(x, y, tableName) {
  const safe = esc(tableName);
  contextMenu.innerHTML = `
    <button class="context-menu-item" data-action="select" data-table="${safe}">SELECT * FROM ${safe}</button>
    <button class="context-menu-item" data-action="insert" data-table="${safe}">INSERT INTO ${safe}</button>
    <button class="context-menu-item" data-action="update" data-table="${safe}">UPDATE ${safe} SET</button>
    <button class="context-menu-item" data-action="delete" data-table="${safe}">DELETE FROM ${safe}</button>
  `;
  const rect = contextMenu.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;
  contextMenu.style.left = `${Math.min(x, maxX)}px`;
  contextMenu.style.top = `${Math.min(y, maxY)}px`;
  contextMenu.classList.remove('hidden');
  contextMenu.dataset.contextTable = tableName;
}

/**
 * Hides the schema context menu.
 */
function hideContextMenu() {
  contextMenu.classList.add('hidden');
}

/**
 * Escapes an identifier for SQL templates.
 * @param {string} name Table name.
 * @returns {string}
 */
function sqlesc(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

/**
 * Handles clicks inside the schema context menu.
 * @param {MouseEvent} e Click event.
 */
function handleContextMenuClick(e) {
  const item = e.target.closest('[data-action]');
  if (!item) return;
  const action = item.dataset.action;
  const tableName = contextMenu.dataset.contextTable;
  if (!tableName) return;
  const safe = sqlesc(tableName);
  let sql = '';
  switch (action) {
    case 'select':
      sql = `SELECT * FROM ${safe} WHERE `;
      break;
    case 'insert':
      sql = `INSERT INTO ${safe} (col1, col2) VALUES (val1, val2);`;
      break;
    case 'update':
      sql = `UPDATE ${safe} SET col1 = val1 WHERE `;
      break;
    case 'delete':
      sql = `DELETE FROM ${safe} WHERE `;
      break;
  }
  if (state.editorView) {
    const sel = state.editorView.state.selection.main;
    state.editorView.dispatch({
      changes: { from: sel.from, to: sel.to, insert: sql },
    });
    state.editorView.focus();
  }
  hideContextMenu();
}
