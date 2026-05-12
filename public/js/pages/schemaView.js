import { $, $$, esc } from '../utils.js';
import { state } from '../state.js';
import { showDDLModal } from './ddlModal.js';
import { executeQuery } from './editorView.js';

const tree = $('#schema-tree');
const contextMenu = $('#context-menu');

export function initSchemaView() {
  state.renderSchema = renderSchema;
  tree.addEventListener('click', handleTreeClick);
  tree.addEventListener('dblclick', handleTreeDblClick);
  document.addEventListener('click', hideContextMenu);
  document.addEventListener('contextmenu', handleContextMenu);
  contextMenu.addEventListener('click', handleContextMenuClick);
}

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
      const columns = cols.map(c => ({
        name: c.name,
        type: c.type || 'TEXT',
        pk: c.pk === 1 || c.pk === true,
        fk: fkCols.has(c.name),
      }));
      tableList.push({ name: t.name, columns });
    }
    state.tables = tableList;
    renderTree(tableList);
    if (state.refreshEditorSchema) {
      state.refreshEditorSchema(tableList);
    }
  } catch (e) {
    tree.innerHTML = `<div class="schema-empty">Error: ${esc(e.message)}</div>`;
  }
}

function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function renderTree(tables) {
  if (tables.length === 0) {
    tree.innerHTML = '<div class="schema-empty">No tables</div>';
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
        if (c.pk) html += '<span class="col-pk">PK</span>';
        if (c.fk) html += '<span class="col-fk">FK</span>';
        html += `</div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;
  }
  tree.innerHTML = html;
}

function handleTreeClick(e) {
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
  state.activeTable = tableName;
  updateActiveState(tableName);
}

function handleTreeDblClick(e) {
  const tableEl = e.target.closest('[data-table-name]');
  if (!tableEl) return;
  const tableName = tableEl.dataset.tableName;
  state.activeTable = tableName;
  updateActiveState(tableName);
  if (!state.db) return;
  try {
    const sql = `SELECT * FROM ${sqlesc(tableName)} LIMIT 100`;
    insertInEditor(sql);
    executeQuery();
  } catch (err) {
    // ignore
  }
}

function insertInEditor(text) {
  if (state.editorView) {
    state.editorView.dispatch({
      changes: { from: 0, to: state.editorView.state.doc.length, insert: text },
    });
    state.editorView.focus();
  }
}

function toggleExpand(name) {
  if (state.tableExpanded.has(name)) {
    state.tableExpanded.delete(name);
  } else {
    state.tableExpanded.add(name);
  }
  renderSchema();
}

function updateActiveState(name) {
  $$('.schema-table-name').forEach(el => {
    el.classList.toggle('active', el.dataset.tableName === name);
  });
}

function handleContextMenu(e) {
  const tableEl = e.target.closest('[data-table-name]');
  if (!tableEl) return;
  e.preventDefault();
  const tableName = tableEl.dataset.tableName;
  showContextMenu(e.clientX, e.clientY, tableName);
}

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

function hideContextMenu() {
  contextMenu.classList.add('hidden');
}

function sqlesc(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

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
