import { EditorView, drawSelection, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
import { Compartment, EditorState } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, HighlightStyle, foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap, acceptCompletion } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { sql, SQLite, schemaCompletionSource, keywordCompletionSource } from '@codemirror/lang-sql';
import { sqlAutoTriggerSource } from './sqlCompletion.js';
import { parseCTEs, parseAliases, parseColumnAliases, mergeSchema } from './sqlSchemaParser.js';
import { markdown } from '@codemirror/lang-markdown';
import { renderMarkdown } from './marker.js';
import { state } from '../state.js';
import { showResults, showError, showNoResults } from './resultsView.js';
import { saveCurrentToLocal } from './dbManager.js';
import { verifyLesson } from './tutorialView.js';
import { verifyChallenge } from './challengeView.js';
import { saveCurrentFile } from './filesView.js';
import { getSettings, defaultSettings } from './settings.js';
import { $, escId } from '../utils.js';

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#7db1dc' },
  { tag: tags.typeName, color: '#4ec9b0' },
  { tag: tags.string, color: '#d49f8a' },
  { tag: tags.number, color: '#b5cea8' },
  { tag: tags.comment, color: '#93b583' },
  { tag: tags.function(tags.propertyName), color: '#dcdcaa' },
  { tag: tags.bool, color: '#ff8484' },
  { tag: tags.null, color: '#7db1dc' },
]);
const syntaxThemeComp = new Compartment();
const autocompleteComp = new Compartment();
const lightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#125089' },
  { tag: tags.typeName, color: '#14604f' },
  { tag: tags.string, color: '#7d291b' },
  { tag: tags.number, color: '#25501a' },
  { tag: tags.comment, color: '#3e5c30' },
  { tag: tags.function(tags.propertyName), color: '#4f4a10' },
  { tag: tags.bool, color: '#8b1818' },
  { tag: tags.null, color: '#125089' },
]);
function getSyntaxTheme() {
  if (state.activeFileIsMD) return syntaxHighlighting(defaultHighlightStyle, { fallback: true });
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? syntaxHighlighting(darkHighlight)
    : syntaxHighlighting(lightHighlight);
}
function updateSyntaxTheme() {
  for (const ed of Object.values(editors)) {
    if (ed) ed.dispatch({ effects: syntaxThemeComp.reconfigure(getSyntaxTheme()) });
  }
}

const container0 = $('#editor-container-0');
const container1 = $('#editor-container-1');
const executeBtn = $('#btn-execute');

let view = null;
let editors = {};
let currentSchema = {};
let cachedMergedKey = null;

let saveTimer = null;
function updateCursorTextState(view) {
  if (!document.body.classList.contains('block-cursor')) return;
  const pos = view.state.selection.main.head;
  const char = view.state.doc.sliceString(pos, pos + 1);
  const isSpace = !char || char === ' ' || char === '\t' || char === '\n' || char === '\r';
  document.body.classList.toggle('cursor-on-space', isSpace);
}

function debounceUpdate(update) {
  if (update.docChanged) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveCurrentFile().catch(() => {});
      if (!view) return;
      const doc = view.state.doc.toString();
      const ctes = parseCTEs(doc);
      const aliases = parseAliases(doc);
      const colAliases = parseColumnAliases(doc);
      state._columnAliases = colAliases;
      const merged = mergeSchema(currentSchema, aliases, ctes);
      const key = JSON.stringify(merged);
      if (key !== cachedMergedKey) {
        cachedMergedKey = key;
        view.dispatch({ effects: autocompleteComp.reconfigure(makeAutocomplete(merged)) });
      }
    }, 500);
  }
  if (update.selectionSet || update.docChanged) {
    updateCursorTextState(update.view);
  }
}

function makeSql(schema) {
  return sql({ dialect: SQLite, upperCaseKeywords: getSettings().keywordUpper, schema: schema || currentSchema });
}
function makeAutocomplete(merged) {
  if (!merged) {
    const doc = view?.state.doc.toString() || '';
    const ctes = parseCTEs(doc);
    const aliases = parseAliases(doc);
    merged = mergeSchema(currentSchema, aliases, ctes);
  }
  return autocompletion({
    activateOnTyping: (state) => /[\w\u00C0-\u024f]/.test(state.sliceDoc(state.selection.main.head - 1, state.selection.main.head)),
    tooltipClass: () => 'notranslate',
    override: [
      sqlAutoTriggerSource,
      keywordCompletionSource(SQLite, getSettings().keywordUpper),
      schemaCompletionSource({ dialect: SQLite, schema: merged }),
    ],
  });
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
      syntaxThemeComp.of(getSyntaxTheme()),
      bracketMatching(), closeBrackets(), autocompleteComp.of(makeAutocomplete()),
      rectangularSelection(), crosshairCursor(), highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        { key: 'Ctrl-Enter', run: () => { executeQuery(); return true; } },
        { key: 'Shift-Ctrl-Enter', run: () => { executeAll(); return true; } },
        { key: 'Enter', run: acceptCompletion },
        ...completionKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...closeBracketsKeymap
      ]),
      lc.of(makeSql()),
      EditorView.contentAttributes.of({ class: 'cm-lineWrapping' }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', monospace" },
        '.cm-content': { fontFamily: "'JetBrains Mono', monospace", fontVariantLigatures: 'contextual' },
        '.cm-gutters': { fontFamily: "'JetBrains Mono', monospace", background: 'var(--color-bg-editor)', color: 'var(--color-text-muted)', borderRight: '1px solid var(--color-border-light)' },
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
  updateCursorTextState(view);
  window.addEventListener('beforeunload', () => {
    saveCurrentFile().catch(() => {});
  });
  window.addEventListener('settings-changed', () => {
    if (view && view._langComp) {
      view.dispatch({ effects: view._langComp.reconfigure(makeSql()) });
      view.dispatch({ effects: autocompleteComp.reconfigure(makeAutocomplete()) });
    }
    updateCursorTextState(view);
  });
  new MutationObserver(() => updateSyntaxTheme()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
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
  cachedMergedKey = null;
  if (!view || !view._langComp) return;
  view.dispatch({ effects: view._langComp.reconfigure(makeSql(schema)) });
  view.dispatch({ effects: autocompleteComp.reconfigure(makeAutocomplete()) });
}

/**
 * Switches syntax support for the active editors.
 * @param {'js' | 'md' | 'sql'} lang Language key.
 */
export function setLanguage(lang) {
  const map = { md: markdown(), sql: makeSql() };
  const ext = map[lang] || map.sql;
  for (const idx of [0, 1]) {
    const ed = editors[idx];
    if (ed && ed._langComp) ed.dispatch({ effects: ed._langComp.reconfigure(ext) });
  }
  updateSyntaxTheme();
}

/**
 * Inserts text at the current cursor position in the active editor.
 * @param {string} text Text to insert.
 */
export function insertAtCursor(text) {
  if (!view) return;
  const sel = view.state.selection.main;
  const pos = sel.from + text.length;
  view.dispatch({
    changes: { from: sel.from, to: sel.to, insert: text },
    selection: { anchor: pos, head: pos },
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
  document.getElementById('btn-verify')?.addEventListener('click', () => {
    if (!view) return;
    if (state.challengeActive) {
      verifyChallenge(view.state.doc.toString());
    } else {
      verifyLesson(view.state.doc.toString());
    }
  });
  document.getElementById('btn-csv-export')?.addEventListener('click', () => {
    import('./resultsView.js').then(r => r.csvFromLastResult());
  });
  document.getElementById('btn-format-sql')?.addEventListener('click', formatCurrentQuery);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === 'f') {
      e.preventDefault();
      formatCurrentQuery();
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
    const safeTable = escId(tableName);
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

function formatSql(sql) {
  const settings = getSettings();
  const colsNewline = settings.formatCols;
  let result = sql
    .replace(/\s+/g, ' ')
    .replace(/\bSELECT\s+/gi, '\nSELECT\n  ')
    .replace(/\bFROM\s+/gi, '\nFROM ')
    .replace(/\b(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+/gi, '\n$&')
    .replace(/\bWHERE\s+/gi, '\nWHERE ')
    .replace(/\bGROUP\s+BY\s+/gi, '\nGROUP BY ')
    .replace(/\bORDER\s+BY\s+/gi, '\nORDER BY ')
    .replace(/\bHAVING\s+/gi, '\nHAVING ')
    .replace(/\bLIMIT\s+/gi, '\nLIMIT ')
    .replace(/\bON\s+/gi, settings.formatOnNewline ? '\n  ON ' : ' ON ')
    .replace(/\bAND\s+(?=\w)/gi, '\n  AND ')
    .replace(/\bOR\s+(?=\w)/gi, '\n  OR ')
    .replace(/\bUNION(?:\s+ALL)?\s+/gi, '\n$&\n')
    .replace(/\n\s*\n\s*/g, '\n')
    .trim();
  if (colsNewline) {
    result = result.replace(/,\s*/g, ',\n  ');
  }
  return result;
}

function formatCurrentQuery() {
  if (!view) return;
  const doc = view.state.doc.toString().trim();
  if (!doc) return;
  const formatted = formatSql(doc);
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: formatted },
  });
}

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
      showResults(rows, elapsed, code);
    } else {
      const message = changes > 0 
        ? `${changes} row${changes !== 1 ? 's' : ''} affected | ${elapsed}ms`
        : `0 rows | ${elapsed}ms`;
      showNoResults(message, code);
    }
    
    if (state.dbName !== 'browsersql-tutorial') {
      saveCurrentToLocal().catch(e => console.warn('[save] Failed:', e));
    }
    if (state.renderSchema) state.renderSchema();
  } catch (err) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
    showError(`${err.message || String(err)} (${elapsed}ms)`);
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
    showNoResults(`All statements executed successfully | ${elapsed}ms`, code);
    if (state.dbName !== 'browsersql-tutorial') {
      saveCurrentToLocal().catch(e => console.warn('[save] Failed:', e));
    }
    if (state.renderSchema) state.renderSchema();
  } catch (err) {
    try { state.db.exec('ROLLBACK;'); } catch (_) {}
    showError(`Transaction rolled back: ${err.message || String(err)} (${((performance.now() - startTime) / 1000).toFixed(2)}ms)`);
  }
}
