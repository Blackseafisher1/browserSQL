import { $, $$, esc } from '../utils.js';
import { state } from '../state.js';
import { showDDLModal } from './ddlModal.js';

const tree = $('#schema-tree');
const contextMenu = $('#context-menu');

function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function buildERD() {
  const tables = state.tables;
  const fks = state.foreignKeys || [];
  if (!tables || tables.length === 0) return '';

  let lines = ['erDiagram'];
  for (const t of tables) {
    lines.push(`    ${t.name} {`);
    for (const c of t.columns) {
      const type = (c.type || 'text').toLowerCase();
      lines.push(`        ${type} ${c.name}${c.pk ? ' PK' : ''}`);
    }
    lines.push(`    }`);
  }
  for (const fk of fks) {
    const label = `${fk.from} → ${fk.refTable}.${fk.refCol}`;
    lines.push(`    ${fk.table} ||--o{ ${fk.refTable} : "${label}"`);
  }
  return lines.join('\n');
}

async function showERD() {
  const erdCode = buildERD();
  console.log('[erd] code:', erdCode);
  if (!erdCode) return;

  const container = document.getElementById('erd-container');
  if (container) container.remove();

  const wrap = document.createElement('div');
  wrap.id = 'erd-container';
  wrap.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;z-index:100;background:var(--color-bg);display:flex;flex-direction:column;overflow:hidden';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--color-border);flex-shrink:0';
  header.innerHTML = '<span style="font-weight:600">Entity Relationship Diagram</span><div style="display:flex;gap:var(--space-2)">';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-sm';
  copyBtn.textContent = '📋 Copy';
  copyBtn.title = 'Copy Mermaid ERD code';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(erdCode);
    copyBtn.textContent = '✓ Copied';
    setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Close ERD';
  closeBtn.addEventListener('click', () => wrap.remove());

  header.querySelector('div').appendChild(copyBtn);
  header.querySelector('div').appendChild(closeBtn);
  wrap.appendChild(header);

  const body = document.createElement('div');
  body.id = 'erd-body';
  body.style.cssText = 'flex:1;overflow:auto;padding:var(--space-3)';
  body.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--color-text-muted)">Loading diagram...</div>';
  wrap.appendChild(body);

  const editorSplit = document.querySelector('.editor-split');
  if (editorSplit) {
    editorSplit.style.position = 'relative';
    editorSplit.appendChild(wrap);
  }

  // Load mermaid via script tag and render
  if (!document.querySelector('#mermaid-script')) {
    const s = document.createElement('script');
    s.id = 'mermaid-script';
    s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.min.js';
    document.head.appendChild(s);
    await new Promise(r => { s.onload = r; s.onerror = r; });
  }
  try {
    const mermaidEl = document.createElement('div');
    mermaidEl.className = 'mermaid';
    mermaidEl.textContent = erdCode;
    body.innerHTML = '';
    body.appendChild(mermaidEl);
    window.mermaid.initialize({ theme: 'dark', themeVariables: { background: 'transparent' } });
    await window.mermaid.run({ nodes: [mermaidEl] });
  } catch (e) {
    body.innerHTML = `<div style="color:var(--color-error);margin-bottom:var(--space-2)">Diagram render failed. Copy the code and paste at <a href="https://mermaid.live" target="_blank" rel="noopener" style="color:var(--color-accent)">mermaid.live</a>:</div>
      <pre style="background:var(--color-bg-surface);padding:1rem;border-radius:6px;overflow:auto;font-size:12px;margin:0">${esc(erdCode)}</pre>`;
  }
}

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

  document.getElementById('btn-erd')?.addEventListener('click', showERD);
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
    // Collect FK relationships
    const allFks = [];
    for (const t of tables) {
      const fks = state.db.exec(`PRAGMA foreign_key_list(${escId(t.name)})`, { rowMode: 'object' });
      for (const fk of fks) allFks.push({ table: t.name, from: fk.from, refTable: fk.table, refCol: fk.to });
    }
    state.foreignKeys = allFks;
    const fkCols = new Map();
    for (const fk of allFks) {
      if (!fkCols.has(fk.table)) fkCols.set(fk.table, new Set());
      fkCols.get(fk.table).add(fk.from);
    }

    const tableList = [];
    for (const t of tables) {
      const cols = state.db.exec(
        `PRAGMA table_info(${escId(t.name)})`,
        { rowMode: 'object' }
      );
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
      const tableFkSet = fkCols.get(t.name) || new Set();
      const columns = cols.map(c => ({
        name: c.name,
        type: c.type || 'TEXT',
        pk: c.pk === 1 || c.pk === true,
        fk: tableFkSet.has(c.name),
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

function toggleExpand(name) {
  if (state.tableExpanded.has(name)) state.tableExpanded.delete(name);
  else state.tableExpanded.add(name);
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
    case 'select': sql = `SELECT * FROM ${safe} WHERE `; break;
    case 'insert': sql = `INSERT INTO ${safe} (col1, col2) VALUES (val1, val2);`; break;
    case 'update': sql = `UPDATE ${safe} SET col1 = val1 WHERE `; break;
    case 'delete': sql = `DELETE FROM ${safe} WHERE `; break;
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
