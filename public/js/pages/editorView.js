import { EditorView, basicSetup } from 'codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { Compartment } from '@codemirror/state';
import { $ } from '../utils.js';
import { state } from '../state.js';
import { showResults, showError, showReady, showNoResults } from './resultsView.js';
import { saveCurrentToLocal } from './dbManager.js';

const container = $('#editor-container');
const executeBtn = $('#btn-execute');
const sqlConfig = new Compartment();
const wrapConfig = new Compartment();

let view;

export function initEditor() {
  view = new EditorView({
    doc: 'SELECT * FROM sqlite_master;',
    extensions: [
      basicSetup,
      sqlConfig.of(sql({ dialect: SQLite })),
      wrapConfig.of(EditorView.contentAttributes.of({ class: 'cm-lineWrapping' })),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': {
          background: 'var(--color-bg)',
          color: 'var(--color-text-muted)',
          borderRight: '1px solid var(--color-border-light)',
        },
        '.cm-activeLineGutter': {
          background: 'var(--color-bg-hover)',
        },
        '.cm-tooltip-autocomplete': {
          background: 'var(--color-bg-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        },
        '.cm-tooltip-autocomplete ul li[aria-selected]': {
          background: 'var(--color-accent)',
          color: 'var(--color-accent-text)',
        },
      }),
      EditorView.updateListener.of((update) => {
        state.editorView = view;
      }),
    ],
    parent: container,
  });
  state.editorView = view;

  setupExecuteShortcut();
  setupExecuteButton();
  setupTemplateButtons();
  setupKeyboardButtons();
}

export function updateEditorSchema(tables) {
  const v = state.editorView;
  if (!v) return;
  const schema = {};
  for (const t of tables) {
    schema[t.name] = t.columns.map(c => c.name);
  }
  v.dispatch({
    effects: sqlConfig.reconfigure(sql({ dialect: SQLite, schema })),
  });
}

export function setWordWrap(enabled) {
  const v = state.editorView;
  if (!v) return;
  v.dispatch({
    effects: wrapConfig.reconfigure(
      enabled
        ? EditorView.contentAttributes.of({ class: 'cm-lineWrapping' })
        : EditorView.contentAttributes.of({ class: '' })
    ),
  });
}

export function insertAtCursor(text) {
  if (!view) return;
  const sel = view.state.selection.main;
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: text },
    selection: { anchor: sel.from + text.length },
  });
  view.focus();
}

function setupExecuteShortcut() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  });
}

function setupExecuteButton() {
  executeBtn.addEventListener('click', executeQuery);
}

function sqlesc(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function setupTemplateButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-template]');
    if (!btn) return;
    const tpl = btn.dataset.template;
    const tableName = state.activeTable || 'table_name';
    const safeTable = sqlesc(tableName);
    let text = '';
    switch (tpl) {
      case 'select':
        text = `SELECT * FROM ${safeTable} WHERE `;
        break;
      case 'insert':
        text = `INSERT INTO ${safeTable} (col1, col2) VALUES (val1, val2);`;
        break;
      case 'update':
        text = `UPDATE ${safeTable} SET col1 = val1 WHERE `;
        break;
      case 'delete':
        text = `DELETE FROM ${safeTable} WHERE `;
        break;
    }
    insertAtCursor(text);
  });
}

function setupKeyboardButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-char]');
    if (!btn) return;
    insertAtCursor(btn.dataset.char);
  });
}

export async function executeQuery() {
  if (!state.db) {
    showError('No database loaded. Create or open a database first.');
    return;
  }

  if (!view) return;
  const sel = view.state.selection.main;
  let sqlText;
  if (sel.empty) {
    sqlText = view.state.doc.toString();
  } else {
    sqlText = view.state.sliceDoc(sel.from, sel.to);
  }
  sqlText = sqlText.trim();
  if (!sqlText) return;

  const startTime = performance.now();
  try {
    const rows = state.db.exec(sqlText, { rowMode: 'object' });
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

    if (rows.length > 0) {
      showResults(rows, elapsed);
    } else {
      const changes = state.sqlite3.capi.sqlite3_changes(state.db.pointer);
      if (changes > 0) {
        showNoResults(`${changes} row${changes !== 1 ? 's' : ''} affected | ${elapsed}ms`);
      } else {
        showNoResults(`0 rows | ${elapsed}ms`);
      }
    }
    if (state.dbName !== 'untitled') saveCurrentToLocal();
    refreshSchema();
  } catch (err) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    showError(`${err.message || String(err)} (${elapsed}ms)`);
  }
}

async function refreshSchema() {
  if (state.renderSchema) {
    await state.renderSchema();
  }
}
