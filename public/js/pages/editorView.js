import { EditorView, drawSelection, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { sql, SQLite } from '@codemirror/lang-sql';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { renderMarkdown } from './marker.js';
import { state } from '../state.js';
import { showResults, showError, showReady, showNoResults } from './resultsView.js';
import { saveCurrentToLocal } from './dbManager.js';
import { $ } from '../utils.js';

const container = $('#editor-container');
const executeBtn = $('#btn-execute');

let view = null;
let currentSchema = {};
let langConfig = null;

export function initEditor() {
  langConfig = new Compartment();
  view = new EditorView({
    doc: '',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection({ cursorBlinkRate: -1 }),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap, ...closeBracketsKeymap]),
      langConfig.of(sql({ dialect: SQLite, schema: currentSchema })),
      EditorView.contentAttributes.of({ class: 'cm-lineWrapping' }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': {
          background: 'var(--color-bg)',
          color: 'var(--color-text-muted)',
          borderRight: '1px solid var(--color-border-light)',
        },
        '.cm-activeLineGutter': { background: 'var(--color-bg-hover)' },
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
    ],
    parent: container,
  });
  state.editorView = view;
  setupExecuteShortcut();
  setupExecuteButton();
  setupPreviewButton();
  setupTemplateButtons();
  setupKeyboardButtons();
}

export function setEditorContent(doc) {
  if (!view) return;
  const cur = view.state.doc.toString();
  if (cur === doc) return;
  view.dom.style.opacity = '0';
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: doc || '' },
  });
  requestAnimationFrame(() => { view.dom.style.opacity = ''; });
}

export function getEditorContent() {
  return view ? view.state.doc.toString() : '';
}

export function getCurrentSchema() {
  return currentSchema;
}

function getBlinkSetting() {
  try {
    const raw = localStorage.getItem('browsersql-settings');
    if (!raw) return true;
    const s = JSON.parse(raw);
    return s.blinkCursor !== false;
  } catch { return true; }
}

export function updateEditorSchema(tables) {
  const schema = {};
  for (const t of tables) schema[t.name] = t.columns.map(c => c.name);
  currentSchema = schema;
  if (!view || !langConfig) return;
  view.dispatch({
    effects: langConfig.reconfigure(sql({ dialect: SQLite, schema })),
  });
}

export function setWordWrap(enabled) {
}

export function setLanguage(lang) {
  if (!view || !langConfig) return;
  const map = {
    js: javascript(),
    md: markdown(),
    sql: sql({ dialect: SQLite, schema: currentSchema }),
  };
  view.dispatch({ effects: langConfig.reconfigure(map[lang] || map.sql) });
  const pb = document.getElementById('btn-preview');
  if (pb) pb.classList.toggle('hidden', lang !== 'md');
  const eb = document.getElementById('btn-execute');
  if (eb) eb.textContent = lang === 'md' ? 'Render' : 'Execute';
}

export function insertAtCursor(text) {
  if (!view) return;
  const sel = view.state.selection.main;
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: text },
    selection: { anchor: sel.from + text.length },
    userEvent: 'input.type',
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
  executeBtn.addEventListener('click', () => {
    if (state.activeFileIsJS || state.activeFileIsMD) {
      executeQuery();
    } else {
      executeQuery();
    }
  });
}

function setupPreviewButton() {
  document.getElementById('btn-preview')?.addEventListener('click', () => {
    if (!view) return;
    const md = view.state.doc.toString();
    const html = renderMarkdown(md);
    const out = $('#results-output');
    const info = $('#results-info');
    if (out) out.innerHTML = '<div class="markdown-preview">' + html + '</div>';
    if (info) info.textContent = 'Preview';
  });
}

function setupTemplateButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-template]');
    if (!btn) return;
    const tpl = btn.dataset.template;
    const tableName = state.activeTable || 'table_name';
    const safeTable = sqlesc(tableName);
    const texts = {
      select: `SELECT * FROM ${safeTable} WHERE `,
      insert: `INSERT INTO ${safeTable} (col1, col2) VALUES (val1, val2);`,
      update: `UPDATE ${safeTable} SET col1 = val1 WHERE `,
      delete: `DELETE FROM ${safeTable} WHERE `,
    };
    insertAtCursor(texts[tpl] || '');
  });
}

function setupKeyboardButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-char]');
    if (!btn) return;
    insertAtCursor(btn.dataset.char);
  });
}

function sqlesc(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

export async function executeQuery() {
  if (!view) return;
  const isJS = state.activeFileIsJS;
  const sel = view.state.selection.main;
  let code = sel.empty ? view.state.doc.toString() : view.state.sliceDoc(sel.from, sel.to);
  code = code.trim();
  if (!code) return;

  if (isJS) {
    showError('JS execution is not supported. Use the browser console (F12) to run JavaScript with db and console.');
    return;
  }

  if (!state.db) {
    showError('No database loaded. Create or open a database first.');
    return;
  }
  const sqlText = code;
  const startTime = performance.now();
  try {
    const rows = state.db.exec(sqlText, { rowMode: 'object' });
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    if (rows.length > 0) {
      showResults(rows, elapsed);
    } else {
      const changes = state.sqlite3?.capi?.sqlite3_changes(state.db.pointer);
      showNoResults(
        changes > 0
          ? `${changes} row${changes !== 1 ? 's' : ''} affected | ${elapsed}ms`
          : `0 rows | ${elapsed}ms`
      );
    }
    if (state.dbName !== 'untitled') saveCurrentToLocal();
    if (state.renderSchema) state.renderSchema();
  } catch (err) {
    showError(`${err.message || String(err)} (${((performance.now() - startTime) / 1000).toFixed(2)}ms)`);
  }
}
