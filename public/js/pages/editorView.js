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
import { evaluateTutorialQuery } from './tutorialView.js';
import { $ } from '../utils.js';

const container0 = $('#editor-container-0');
const container1 = $('#editor-container-1');
const executeBtn = $('#btn-execute');

let view = null;
let editors = {};
let currentSchema = {};
let langConfig = null;

/**
 * Creates a CodeMirror editor instance with the app's shared extension set.
 * @param {string} doc Initial document text.
 * @param {HTMLElement} parent Host element for the editor.
 * @returns {EditorView}
 */
function makeEditor(doc, parent) {
  const lc = new Compartment();
  const ed = new EditorView({
    doc: doc || '',
    extensions: [
      lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(),
      history(), foldGutter(),
      drawSelection({ cursorBlinkRate: -1 }),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(), closeBrackets(), autocompletion(),
      rectangularSelection(), crosshairCursor(), highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap, ...closeBracketsKeymap]),
      lc.of(sql({ dialect: SQLite, schema: currentSchema })),
      EditorView.contentAttributes.of({ class: 'cm-lineWrapping' }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': { background: 'var(--color-bg)', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border-light)' },
        '.cm-activeLineGutter': { background: 'var(--color-bg-hover)' },
        '.cm-tooltip-autocomplete': { background: 'var(--color-bg-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
        '.cm-tooltip-autocomplete ul li[aria-selected]': { background: 'var(--color-accent)', color: 'var(--color-accent-text)' },
      }),
    ],
    parent: parent,
  });
  ed._langComp = lc;
  return ed;
}

/**
 * Initializes the primary editor and attaches global editor controls.
 */
export function initEditor() {
  langConfig = new Compartment();
  editors[0] = makeEditor('', container0);
  view = editors[0];
  state.editorView = view;
  setupExecuteShortcut();
  setupExecuteButton();
  setupPreviewButton();
  setupTemplateButtons();
  setupKeyboardButtons();
}

/**
 * Ensures the requested editor pane exists.
 * @param {number} idx Pane index.
 * @returns {EditorView}
 */
export function ensureEditor(idx) {
  if (!editors[idx]) {
    editors[idx] = makeEditor('', idx === 0 ? container0 : container1);
  }
  return editors[idx];
}

/**
 * Shows or hides editor panes to match the requested count.
 * @param {number} count Number of visible panes.
 */
export function showEditors(count) {
  const wrap0 = container0.closest('.editor-pane-wrap');
  const wrap1 = container1.closest('.editor-pane-wrap');
  if (wrap0) {
    wrap0.style.display = count >= 1 ? 'flex' : 'none';
    if (count < 2) wrap0.style.flex = ''; // reset to CSS default
  }
  if (wrap1) wrap1.style.display = count >= 2 ? 'flex' : 'none';
  const div = document.getElementById('editor-divider');
  if (div) div.classList.toggle('hidden', count < 2);
  if (count >= 2) { ensureEditor(0); ensureEditor(1); }
}

/**
 * Switches the active editor view to the requested pane.
 * @param {number} idx Pane index.
 */
export function switchEditor(idx) {
  const ed = ensureEditor(idx);
  if (view && view !== ed) view.dom.style.display = 'none';
  view = ed;
  view.dom.style.display = '';
  state.editorView = view;
}

/**
 * Returns the text from the active editor.
 * @returns {string}
 */
export function getEditorContent() {
  return view ? view.state.doc.toString() : '';
}

/**
 * Replaces the current editor content with the provided document text.
 * @param {string} doc New document text.
 */
export function setEditorContent(doc) {
  if (!view) return;
  const cur = view.state.doc.toString();
  if (cur === doc) return;
  view.dom.style.opacity = '0';
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: doc || '' } });
  requestAnimationFrame(() => { view.dom.style.opacity = ''; });
}

/**
 * Replaces the text in a specific editor pane.
 * @param {number} idx Pane index.
 * @param {string} doc New document text.
 */
export function setEditorContentFor(idx, doc) {
  const ed = ensureEditor(idx);
  const cur = ed.state.doc.toString();
  if (cur === doc) return;
  ed.dispatch({ changes: { from: 0, to: ed.state.doc.length, insert: doc || '' } });
}

/**
 * Returns the current SQL schema map used for completion.
 * @returns {Record<string, string[]>}
 */
export function getCurrentSchema() { return currentSchema; }

/**
 * Rebuilds the editor schema from the current database table list.
 * @param {Array<{name: string, columns: Array<{name: string}>}>} tables Table metadata.
 */
export function updateEditorSchema(tables) {
  const schema = {};
  for (const t of tables) schema[t.name] = t.columns.map(c => c.name);
  currentSchema = schema;
  if (!view || !view._langComp) return;
  view.dispatch({ effects: view._langComp.reconfigure(sql({ dialect: SQLite, schema })) });
}

/**
 * Switches syntax support for the active editors.
 * @param {'js' | 'md' | 'sql'} lang Language key.
 */
export function setLanguage(lang) {
  const map = { js: javascript(), md: markdown(), sql: sql({ dialect: SQLite, schema: currentSchema }) };
  const ext = map[lang] || map.sql;
  for (const idx of [0, 1]) {
    const ed = editors[idx];
    if (ed && ed._langComp) ed.dispatch({ effects: ed._langComp.reconfigure(ext) });
  }
}
  /**
   * Inserts text at the current cursor position in the active editor.
   * @param {string} text Text to insert.
   */

export function setWordWrap(enabled) {}

export function insertAtCursor(text) {
/**
 * Executes the current selection or full editor contents as SQL.
 */
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); executeQuery(); }
  });
}

function setupExecuteButton() {
  executeBtn.addEventListener('click', executeQuery);
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
    const texts = { select: `SELECT * FROM ${safeTable} WHERE `, insert: `INSERT INTO ${safeTable} (col1, col2) VALUES (val1, val2);`, update: `UPDATE ${safeTable} SET col1 = val1 WHERE `, delete: `DELETE FROM ${safeTable} WHERE ` };
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

function sqlesc(name) { return `"${name.replace(/"/g, '""')}"`; }

export async function executeQuery() {
  if (!view) return;
  if (state.tutorialActive && state.tutorialLessonType === 'theory') {
    showError('This lesson is a quiz. Answer it in the editor panel.');
    return;
  }
  const sel = view.state.selection.main;
  let code = sel.empty ? view.state.doc.toString() : view.state.sliceDoc(sel.from, sel.to);
  code = code.trim();
  if (!code) return;
  if (state.activeFileIsJS) { showError('JS Shell is not available.'); return; }
  if (state.activeFileIsMD) { document.getElementById('btn-preview')?.click(); return; }
  if (!state.db) { showError('No database loaded.'); return; }
  const startTime = performance.now();
  try {
    const rows = state.db.exec(code, { rowMode: 'object' });
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    const changes = state.sqlite3?.capi?.sqlite3_changes(state.db.pointer) || 0;
    if (rows.length > 0) showResults(rows, elapsed);
    else {
      showNoResults(changes > 0 ? `${changes} row${changes !== 1 ? 's' : ''} affected | ${elapsed}ms` : `0 rows | ${elapsed}ms`);
    }
    if (state.dbName !== 'untitled') saveCurrentToLocal();
    if (state.renderSchema) state.renderSchema();
    evaluateTutorialQuery({ sql: code, rows, changes, error: null });
  } catch (err) {
    showError(`${err.message || String(err)} (${((performance.now() - startTime) / 1000).toFixed(2)}ms)`);
    evaluateTutorialQuery({ sql: code, rows: [], changes: 0, error: err });
  }
}
