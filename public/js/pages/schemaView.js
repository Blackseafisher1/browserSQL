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
}

/**
 * Rebuilds the schema sidebar from the current database.
 */
async function renderSchema() {
  if (!state.dbProxy) {
    tree.innerHTML = '<div class="schema-empty">No tables</div>';
    return;
  }
  try {
    const tables = await state.dbProxy.exec(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`,
      { rowMode: 'object' }
    );
    const tableList = [];
    for (const t of tables) {
      const cols = await state.dbProxy.exec(
        `PRAGMA table_info(${escId(t.name)})`,
        { rowMode: 'object' }
      );
      const fks = await state.dbProxy.exec(
        `PRAGMA foreign_key_list(${escId(t.name)})`,
        { rowMode: 'object' }
      );
      const fkCols = new Set(fks.map(f => f.from));
      const idxs = await state.dbProxy.exec(
        `PRAGMA index_list(${escId(t.name)})`,
        { rowMode: 'object' }
      );
      const uniqueCols = new Set();
      for (const idx of idxs) {
        if (idx.origin === 'u') {
          const info = await state.dbProxy.exec(
            `PRAGMA index_info(${escId(idx.name)})`,
            { rowMode: 'object' }
          );
          for (const i of info) uniqueCols.add(i.name);
        }
      }
      const ddlRows = await state.dbProxy.exec(
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
      tableList.push({ name: t.name, columns });
    }
    state.tables = tableList;
    const views = await state.dbProxy.exec(
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
async function handleTreeClick(e) {
  const viewEl = e.target.closest('[data-view-name]');
  if (viewEl) {
    const viewName = viewEl.dataset.viewName;
    try {
      const sql = `SELECT * FROM ${escId(viewName)} LIMIT 100`;
      const rows = await state.dbProxy.exec(sql, { rowMode: 'object' });
      import('./resultsView.js').then(r => r.showResults(rows, '0.01'));
    } catch (err) {
      import('./resultsView.js').then(r => r.showError(err.message));
    }
    return;
  }
  const ddlBtn = e.target.closest('[data-ddl]');
  if (ddlBtn) {
    await showDDLModal(ddlBtn.dataset.ddl);
    return;
  }
  const dropBtn = e.target.closest('[data-drop]');
  if (dropBtn) {
    const name = dropBtn.dataset.drop;
    if (confirm(`Drop table "${name}"? This cannot be undone.`)) {
      await state.dbProxy.exec(`DROP TABLE IF EXISTS ${escId(name)}`);
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
  state.activeTable = tableName;
  updateActiveState(tableName);
  if (!state.dbProxy) return;
  try {
    const sql = `SELECT * FROM ${escId(tableName)} LIMIT 100`;
    const rows = await state.dbProxy.exec(sql, { rowMode: 'object' });
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
      selection: { anchor: sel.from + sql.length },
    });
    state.editorView.focus();
  }
  hideContextMenu();
}
