import { $, $$, esc, escId } from '../utils.js';
import { state } from '../state.js';
import { showDDLModal } from './ddlModal.js';
import { t } from '../i18n.js';

const tree = $('#schema-tree');
const contextMenu = $('#context-menu');

export function buildERD() {
  const tables = state.tables;
  const fks = state.foreignKeys || [];
  if (!tables || tables.length === 0) return '';

  let lines = ['erDiagram'];
  for (const tbl of tables) {
    lines.push(`    ${tbl.name} {`);
    for (const c of tbl.columns) {
      let type = (c.type || 'text').toLowerCase().split('(')[0].trim();
      const ann = c.pk ? ' PK' : c.fk ? ' FK' : '';
      lines.push(`        ${type} ${c.name}${ann}`);
    }
    lines.push(`    }`);
  }
  for (const fk of fks) {
    const label = `${fk.from} → ${fk.refTable}.${fk.refCol}`;
    lines.push(`    ${fk.refTable} ||--o{ ${fk.table} : "${label}"`);
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
  header.innerHTML = `<span style="font-weight:600">${t('schema.erd.header')}</span><div style="display:flex;gap:var(--space-2)">`;

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.className = 'btn btn-sm';
  zoomOutBtn.textContent = '−';
  zoomOutBtn.title = t('schema.erd.zoomOut');

  const zoomInBtn = document.createElement('button');
  zoomInBtn.className = 'btn btn-sm';
  zoomInBtn.textContent = '+';
  zoomInBtn.title = t('schema.erd.zoomIn');

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-sm';
  resetBtn.textContent = '↺';
  resetBtn.title = t('schema.erd.resetZoom');

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-sm';
  copyBtn.textContent = t('schema.erd.copyCode');
  copyBtn.title = t('schema.erd.copyCode');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(erdCode);
    copyBtn.textContent = t('schema.erd.copied');
    setTimeout(() => copyBtn.textContent = t('schema.erd.copyCode'), 2000);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn btn-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = t('schema.erd.close');
  closeBtn.addEventListener('click', () => wrap.remove());

  const hdrActions = header.querySelector('div');
  hdrActions.appendChild(zoomOutBtn);
  hdrActions.appendChild(resetBtn);
  hdrActions.appendChild(zoomInBtn);
  hdrActions.appendChild(copyBtn);
  hdrActions.appendChild(closeBtn);
  wrap.appendChild(header);

  const body = document.createElement('div');
  body.id = 'erd-body';
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;cursor:grab';
  body.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--color-text-muted)">${t('schema.erd.loading')}</div>`;
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

    // Legend
    const legend = document.createElement('div');
    legend.innerHTML = `
      <div style="font-size:10px;font-weight:600;margin-bottom:4px">${t('schema.erd.relationships')}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 6px;font-size:9px;align-items:center">
        <span style="font-family:monospace;white-space:nowrap">||--o{</span><span>${t('schema.erd.oneToZeroMany')}</span>
        <span style="font-family:monospace;white-space:nowrap">||--|{</span><span>${t('schema.erd.oneToOneMany')}</span>
        <span style="font-family:monospace;white-space:nowrap">}o--o{</span><span>${t('schema.erd.zeroManyToZeroMany')}</span>
        <span style="font-family:monospace;white-space:nowrap">||--||</span><span>${t('schema.erd.oneToOne')}</span>
      </div>`;
    legend.style.cssText = 'position:absolute;top:8px;left:8px;z-index:10;background:var(--color-bg-surface);border:1px solid var(--color-border);border-radius:6px;padding:6px 10px;opacity:0.85;pointer-events:none';
    body.appendChild(legend);

    // Pan/zoom after render
    const svg = body.querySelector('svg');
    if (svg) {
      let scale = 1;
      let panX = 0, panY = 0;
      let dragging = false, startX, startY;

      function applyTransform() {
        svg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        svg.style.transformOrigin = '0 0';
      }

      body.addEventListener('mousedown', (e) => { dragging = true; startX = e.clientX - panX; startY = e.clientY - panY; body.style.cursor = 'grabbing'; });
      window.addEventListener('mousemove', (e) => { if (!dragging) return; panX = e.clientX - startX; panY = e.clientY - startY; applyTransform(); });
      window.addEventListener('mouseup', () => { dragging = false; body.style.cursor = 'grab'; });

      body.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.max(0.2, Math.min(5, scale * delta));
        applyTransform();
      }, { passive: false });

      zoomInBtn.addEventListener('click', () => { scale = Math.min(5, scale * 1.3); applyTransform(); });
      zoomOutBtn.addEventListener('click', () => { scale = Math.max(0.2, scale / 1.3); applyTransform(); });
      resetBtn.addEventListener('click', () => { scale = 1; panX = 0; panY = 0; applyTransform(); });
    }
  } catch (e) {
    body.innerHTML = `<div style="color:var(--color-error);margin-bottom:var(--space-2)">${t('schema.erd.renderFailed')}</div>
      <div style="margin-bottom:var(--space-2)">${t('schema.erd.copyHint')} <a href="https://mermaid.live" target="_blank" rel="noopener" style="color:var(--color-accent)">mermaid.live</a>:</div>
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
    for (const tbl of tables) {
      const fks = state.db.exec(`PRAGMA foreign_key_list(${escId(tbl.name)})`, { rowMode: 'object' });
      for (const fk of fks) allFks.push({ table: tbl.name, from: fk.from, refTable: fk.table, refCol: fk.to });
    }
    state.foreignKeys = allFks;
    const fkCols = new Map();
    for (const fk of allFks) {
      if (!fkCols.has(fk.table)) fkCols.set(fk.table, new Set());
      fkCols.get(fk.table).add(fk.from);
    }

    const tableList = [];
    for (const tbl of tables) {
      const cols = state.db.exec(
        `PRAGMA table_info(${escId(tbl.name)})`,
        { rowMode: 'object' }
      );
      const idxs = state.db.exec(
        `PRAGMA index_list(${escId(tbl.name)})`,
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
        pk: c.pk > 0 || c.pk === true,
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
    tree.innerHTML = `<div class="schema-empty">${t('schema.emptyOrViews')}</div>`;
    return;
  }
  let html = '';
  for (const tbl of tables) {
    const expanded = state.tableExpanded.has(tbl.name) ? 'expanded' : '';
    const active = state.activeTable === tbl.name ? 'active' : '';
    const arrow = state.tableExpanded.has(tbl.name) ? '▾' : '▸';
    html += `<div class="schema-table" data-table="${esc(tbl.name)}">`;
    html += `<div class="schema-table-name ${active}" data-table-name="${esc(tbl.name)}">`;
    html += `<span class="expand-icon ${expanded}">${arrow}</span>`;
    html += `<span class="schema-table-label">${esc(tbl.name)}</span>`;
    html += `<span class="schema-table-actions">`;
    html += `<button class="btn-schema-ddl" data-ddl="${esc(tbl.name)}" title="${t('schema.viewDDL')}">DDL</button>`;
    html += `<button class="btn-schema-drop" data-drop="${esc(tbl.name)}" title="${t('schema.dropTable')}">${t('schema.drop')}</button>`;
    html += `</span>`;
    html += `</div>`;
    if (state.tableExpanded.has(tbl.name)) {
      html += `<div class="schema-columns">`;
      for (const c of tbl.columns) {
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
      if (tbl.indexes && tbl.indexes.length > 0) {
        html += `<div class="schema-indexes">`;
        for (const idx of tbl.indexes) {
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
    html += `<div class="schema-section-label">${t('schema.views')}</div>`;
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
      import('./resultsView.js').then(r => r.showResults(rows, '0.01', sql));
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
    if (confirm(t('confirm.dropTableSchema', name))) {
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
    import('./resultsView.js').then(r => r.showResults(rows, '0.01', sql));
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

function handleContextMenuClick(e) {
  const item = e.target.closest('[data-action]');
  if (!item) return;
  const action = item.dataset.action;
  const tableName = contextMenu.dataset.contextTable;
  if (!tableName) return;
  const safe = escId(tableName);
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
