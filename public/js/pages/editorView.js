import { EditorView, drawSelection, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
import { showResults, showError, showNoResults } from './resultsView.js';
import { saveCurrentToLocal } from './dbManager.js';
import { evaluateTutorialQuery } from './tutorialView.js';
import { saveCurrentFile } from './filesView.js';
import { getSettings } from './settings.js';
import { $ } from '../utils.js';

const container0 = $('#editor-container-0');
const container1 = $('#editor-container-1');
const executeBtn = $('#btn-execute');

let view = null;
let editors = {};
let currentSchema = {};

let saveTimer = null;
function debounceUpdate(update) {
  if (update.docChanged) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveCurrentFile().catch(() => {});
    }, 500);
  }
}

function makeSql(schema) {
  return sql({ dialect: SQLite, upperCaseKeywords: getSettings().keywordUpper, schema: schema || currentSchema });
}

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
      drawSelection(prefersReducedMotion ? { cursorBlinkRate: 0 } : undefined),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(), closeBrackets(), autocompletion({ tooltipClass: () => 'notranslate' }),
      rectangularSelection(), crosshairCursor(), highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        { key: 'Ctrl-Enter', run: () => { executeQuery(); return true; } },
        { key: 'Shift-Ctrl-Enter', run: () => { executeAll(); return true; } },
        ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap, ...closeBracketsKeymap
      ]),
      lc.of(makeSql()),
      EditorView.contentAttributes.of({ class: 'cm-lineWrapping' }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': { background: 'var(--color-bg)', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border-light)' },
        '.cm-activeLineGutter': { background: 'var(--color-bg-hover)' },
        '.cm-tooltip-autocomplete': { background: 'var(--color-bg-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
        '.cm-tooltip-autocomplete ul li[aria-selected]': { background: 'var(--color-accent)', color: 'var(--color-accent-text)' },
      }),
      EditorView.updateListener.of(debounceUpdate),
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
  editors[0] = makeEditor('', container0);
  view = editors[0];
  state.editorView = view;
  window.addEventListener('beforeunload', () => {
    saveCurrentFile().catch(() => {});
  });
  window.addEventListener('settings-changed', () => {
    if (view && view._langComp) {
      view.dispatch({ effects: view._langComp.reconfigure(makeSql()) });
    }
  });
  setupExecuteShortcut();
  setupExecuteButton();
  setupPreviewButton();
  setupTemplateButtons();
  setupKeyboardButtons();
  setupEditorContextMenu();
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
 * Rebuilds the editor schema from the current database table list.
 * @param {Array<{name: string, columns: Array<{name: string}>}>} tables Table metadata.
 */
export function updateEditorSchema(tables) {
  const schema = {};
  for (const t of tables) schema[t.name] = t.columns.map(c => c.name);
  currentSchema = schema;
  if (!view || !view._langComp) return;
  view.dispatch({ effects: view._langComp.reconfigure(makeSql(schema)) });
}

/**
 * Switches syntax support for the active editors.
 * @param {'js' | 'md' | 'sql'} lang Language key.
 */
export function setLanguage(lang) {
  const map = { js: javascript(), md: markdown(), sql: makeSql() };
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
function insertAtCursor(text) {
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
      if (e.shiftKey) executeAll();
      else executeQuery();
    }
  });
}

function setupExecuteButton() {
  executeBtn.addEventListener('click', executeQuery);
  document.getElementById('btn-execute-all')?.addEventListener('click', executeAll);
  document.getElementById('btn-csv-export')?.addEventListener('click', () => {
    import('./resultsView.js').then(r => r.csvFromLastResult());
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

function setupEditorContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    const cm = e.target.closest('.cm-editor');
    if (!cm) return;
    if (state.activeFileIsJS || state.activeFileIsMD) return;
    if (state.tutorialActive && state.tutorialLessonType === 'theory') return;
    e.preventDefault();
    const menu = document.getElementById('context-menu');
    menu.innerHTML = `<button class="context-menu-item" data-action="generate-sql">Generate SQL</button>`;
    const rect = menu.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    menu.style.left = Math.min(e.clientX, maxX) + 'px';
    menu.style.top = Math.min(e.clientY, maxY) + 'px';
    menu.classList.remove('hidden');
    menu.dataset.contextEditor = '1';
  });
  document.getElementById('context-menu')?.addEventListener('click', (e) => {
    const item = e.target.closest('[data-action="generate-sql"]');
    if (!item) return;
    document.getElementById('context-menu')?.classList.add('hidden');
    import('./aiGenerateModal.js').then(m => m.showAIGenerateModal());
  });
}

function sqlesc(name) { return `"${name.replace(/"/g, '""')}"`; }

export async function executeQuery() {
  // Early returns
  if (!view) return;
  if (state.tutorialActive && state.tutorialLessonType === 'theory') {
    showError('This lesson is a quiz. Answer it in the editor panel.');
    return;
  }
  if (state.activeFileIsJS) {
    showError('JS Shell is not available.');
    return;
  }
  if (state.activeFileIsMD) {
    document.getElementById('btn-preview')?.click();
    return;
  }
  if (!state.db) {
    showError('No database loaded.');
    return;
  }

  let code;
  const sel = view.state.selection.main;

  // Case 1: Text is selected → run selection
  if (!sel.empty) {
    code = view.state.sliceDoc(sel.from, sel.to);
  } 
  // Case 2: No selection → find statement at cursor using ; delimiters
  else {
    const fullText = view.state.doc.toString();
    let cursor = sel.head;

    // Move backwards over whitespace and semicolons
    while (cursor > 0 && (/\s/.test(fullText[cursor - 1]) || fullText[cursor - 1] === ';')) {
      cursor--;
    }

    // Find start of statement (last ; before cursor, skipping ; in -- comments)
    let start = 0;
    for (let i = cursor - 1; i >= 0; i--) {
      if (fullText[i] === ';') {
        // Check if this ; is inside a -- comment
        const lineStart = fullText.lastIndexOf('\n', i - 1);
        const lineBefore = fullText.substring(lineStart + 1, i);
        if (!lineBefore.includes('--')) {
          start = i + 1;
          break;
        }
      }
    }

    // Find end of statement (next ; from cursor onward, skipping -- comment lines)
    let end = fullText.length;
    for (let i = cursor; i < fullText.length; i++) {
      // Skip -- comment lines entirely
      if (fullText[i] === '-' && fullText[i + 1] === '-') {
        while (i < fullText.length && fullText[i] !== '\n') i++;
        continue;
      }
      if (fullText[i] === ';') {
        end = i;
        break;
      }
    }

    code = fullText.substring(start, end).trim();
  }
  
  code = code.trim();
  if (!code) return;

  // Execute query
  const startTime = performance.now();
  try {
    const rows = state.db.exec(code, { rowMode: 'object' });
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    const changes = state.sqlite3?.capi?.sqlite3_changes(state.db.pointer) || 0;
    
    if (rows.length > 0) {
      showResults(rows, elapsed);
    } else {
      const message = changes > 0 
        ? `${changes} row${changes !== 1 ? 's' : ''} affected | ${elapsed}ms`
        : `0 rows | ${elapsed}ms`;
      showNoResults(message);
    }
    
    if (state.dbName !== 'untitled') saveCurrentToLocal();
    if (state.renderSchema) state.renderSchema();
    evaluateTutorialQuery({ sql: code, rows, changes, error: null });
  } catch (err) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    showError(`${err.message || String(err)} (${elapsed}ms)`);
    evaluateTutorialQuery({ sql: code, rows: [], changes: 0, error: err });
  }
}

export async function executeAll() {
  if (!view) return;
  if (!state.db) { showError('No database loaded.'); return; }
  const code = view.state.doc.toString().trim();
  if (!code) return;
  const wrapped = 'BEGIN TRANSACTION;\n' + code + '\nCOMMIT;';
  const startTime = performance.now();
  try {
    state.db.exec(wrapped, { rowMode: 'object' });
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    showNoResults(`All statements executed successfully | ${elapsed}ms`);
    if (state.dbName !== 'untitled') saveCurrentToLocal();
    if (state.renderSchema) state.renderSchema();
  } catch (err) {
    try { state.db.exec('ROLLBACK;'); } catch (_) {}
    showError(`Transaction rolled back: ${err.message || String(err)} (${((performance.now() - startTime) / 1000).toFixed(2)}ms)`);
  }
}