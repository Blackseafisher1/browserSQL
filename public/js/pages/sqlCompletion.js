import { state } from '../state.js';
import { parseColumnAliases, parseAliases } from './sqlSchemaParser.js';

function bareColsEnabled() {
  try {
    const raw = localStorage.getItem('browsersql-settings');
    if (!raw) return false;
    return JSON.parse(raw).autoCompleteBareCols === true;
  } catch { return false; }
}

/**
 * Return column aliases from the CURRENT statement only (text after last `;`).
 * Filters out whatever the user is currently typing so an alias doesn't suggest itself.
 */
function docAliases(context) {
  const fullDoc = context.state.sliceDoc(0, context.pos);
  const lastSemi = fullDoc.lastIndexOf(';');
  const text = lastSemi >= 0 ? fullDoc.slice(lastSemi + 1) : fullDoc;
  const currentWord = /[\w\u00C0-\u024f]+$/.exec(text);
  const currentPartial = currentWord ? currentWord[0] : '';
  return parseColumnAliases(text)
    .filter(a => a !== currentPartial)
    .map(a => ({
    label: a,
    type: 'property',
    detail: 'alias',
  }));
}

function allColumnOptions(context) {
  const colMap = {};
  for (const t of state.tables) {
    for (const c of t.columns) {
      if (colMap[c.name]) {
        colMap[c.name].push(t.name);
      } else {
        colMap[c.name] = [t.name];
      }
    }
  }
  const opts = Object.entries(colMap).map(([col, tables]) => ({
    label: col,
    type: 'property',
    detail: tables.join(', '),
  }));
  if (state._ctes) {
    for (const [cteName, cols] of Object.entries(state._ctes)) {
      for (const col of cols) {
        opts.push({ label: col, type: 'property', detail: cteName });
      }
    }
  }
  opts.push(...docAliases(context));
  return opts;
}

function tableByName(name) {
  return state.tables.find(t => t.name.toLowerCase() === name.toLowerCase());
}

/**
 * Extract table names referenced by FROM/JOIN/UPDATE in the text before cursor.
 * Uses [\w\u00C0-\u024f] to also match identifiers with umlauts.
 */
function referencedTables(text) {
  const names = new Set();
  let m;
  const re = /(?:FROM|JOIN)\s+([\w\u00C0-\u024f]+)/gi;
  while ((m = re.exec(text)) !== null) names.add(m[1]);
  m = text.match(/UPDATE\s+([\w\u00C0-\u024f]+)/i);
  if (m) names.add(m[1]);
  return [...names];
}

function columnOptsForTables(context, tableNames) {
  const opts = [];
  for (const name of tableNames) {
    const t = tableByName(name);
    if (t) {
      for (const c of t.columns) {
        opts.push({
          label: c.name,
          type: 'property',
          detail: t.name,
        });
      }
    } else if (state._ctes && state._ctes[name]) {
      for (const col of state._ctes[name]) {
        opts.push({ label: col, type: 'property', detail: name });
      }
    }
  }
  opts.push(...docAliases(context));
  return opts;
}

/**
 * Detect SQL context from the text before cursor.
 * Each regex uses [\w\u00C0-\u024f] for table names so that umlauts work.
 * Returns context type and table name, or null if no specific context.
 */
function detectContext(text) {
  let m;

  m = text.match(/INSERT\s+INTO\s+([\w\u00C0-\u024f]+)\s*\(\s*\)?\s*$/i);
  if (m) return { type: 'insert-paren', table: m[1] };

  m = text.match(/INSERT\s+INTO\s+([\w\u00C0-\u024f]+)\s*$/i);
  if (m) return { type: 'insert', table: m[1] };

  m = text.match(/UPDATE\s+([\w\u00C0-\u024f]+)\s+SET\s+$/i);
  if (m) return { type: 'update-set', table: m[1] };

  m = text.match(/UPDATE\s+([\w\u00C0-\u024f]+)\s+$/i);
  if (m) return { type: 'update-before-set', table: m[1] };

  if (/(?:WHERE|AND|OR|HAVING)\s+$/i.test(text)) return { type: 'condition' };

  m = text.match(/ON\s+$/i);
  if (m) return { type: 'condition' };

  m = text.match(/SELECT\s$/i);
  if (m) return { type: 'select-col' };

  m = text.match(/,\s*$/);
  if (m) {
    const hasSelect = /\bSELECT\b/i.test(text);
    const lastSelect = text.lastIndexOf('SELECT');
    const lastFrom = text.lastIndexOf('FROM');
    if (hasSelect && (lastFrom === -1 || lastSelect > lastFrom)) return { type: 'select-col' };
  }

  return null;
}

function wordStart(text, pos) {
  let i = pos - 1;
  while (i >= 0 && /[\w\u00C0-\u024f]/.test(text[i])) i--;
  return i + 1;
}

/**
 * Custom autocomplete source for context-aware SQL completion.
 * Runs before keywordCompletionSource and schemaCompletionSource.
 *
 * Dot-completion (table.column): handled FIRST before any context detection
 * so that SELECT col, t. always suggests only columns from table t.
 *
 * When bareColsEnabled is false, only column aliases from the current
 * statement are suggested (no bare column names without table context).
 */
export function sqlAutoTriggerSource(context) {
  const { state: edState, pos } = context;
  const textBefore = edState.sliceDoc(0, pos);
  if (!textBefore.trim()) return null;
  const from = wordStart(textBefore, pos);

  // Dot-completion — must run before detectContext so something like
  // "SELECT col1, t." is not swallowed by the select-col context.
  // Tries: state._mergedSchema (full-doc, includes aliases), then
  // direct tableByName / CTE fallback so it never leaks keywords.
  const dotPos = textBefore.lastIndexOf('.');
  if (dotPos > 0) {
    const afterDot = textBefore.slice(dotPos + 1).trim();
    if (/^\w*$/.test(afterDot)) {
      const beforeDot = textBefore.slice(0, dotPos).trim();
      const parts = beforeDot.split(/[\s,()]+/);
      const name = parts[parts.length - 1];
      const merged = state._mergedSchema;
      const key = merged && Object.keys(merged).find(k => k.toLowerCase() === name.toLowerCase());
      if (key) {
        const opts = merged[key].map(col => ({ label: col, type: 'property' }));
        return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
      }
      const t = tableByName(name);
      if (t) {
        const opts = t.columns.map(c => ({ label: c.name, type: 'property' }));
        return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
      }
      if (state._ctes && state._ctes[name]) {
        const opts = state._ctes[name].map(col => ({ label: col, type: 'property' }));
        return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
      }
      const aliases = parseAliases(edState.sliceDoc(0, edState.doc.length));
      const realTable = aliases[name];
      if (realTable) {
        const tbl = tableByName(realTable);
        if (tbl) {
          const opts = tbl.columns.map(c => ({ label: c.name, type: 'property' }));
          return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
        }
      }
      return null;
    }
  }

  const ctx = detectContext(textBefore);

  if (!ctx) {
    if (!bareColsEnabled()) {
      const aliases = docAliases(context);
      if (!aliases.length) return null;
      return { from, options: aliases, validFor: /^[\w\u00C0-\u024f]+$/ };
    }
    const tables = referencedTables(textBefore);
    const opts = tables.length ? columnOptsForTables(context, tables) : allColumnOptions(context);
    if (!opts.length) return null;
    return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
  }

  switch (ctx.type) {
    case 'insert-paren': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const nonPk = t.columns.filter(c => !c.pk);
      if (!nonPk.length) return null;
      const colList = nonPk.map(c => c.name).join(', ');
      const insertText = `(${colList})\nVALUES ()`;
      const parenOff = pos - textBefore.lastIndexOf('(');
      return {
        from: pos,
        options: [{
          label: insertText,
          type: 'keyword',
          detail: `INSERT ${ctx.table}`,
          apply(view) {
            const head = view.state.selection.main.head;
            const rf = head - parenOff;
            const rt = view.state.doc.sliceString(rf + 1, rf + 2) === ')' ? rf + 2 : head;
            view.dispatch({
              changes: { from: rf, to: rt, insert: insertText },
              selection: { anchor: rf + insertText.length - 1, head: rf + insertText.length - 1 },
            });
          },
        }],
        validFor: /^.*$/,
      };
    }

    case 'insert': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const nonPk = t.columns.filter(c => !c.pk);
      if (!nonPk.length) return null;
      const colList = nonPk.map(c => c.name).join(', ');
      const insertText = `(${colList})\nVALUES ()`;
      return {
        from: pos,
        options: [{
          label: insertText,
          type: 'keyword',
          detail: `INSERT ${ctx.table}`,
          apply(view, _completion, from, to) {
            view.dispatch({
              changes: { from, to, insert: insertText },
              selection: { anchor: from + insertText.length - 1, head: from + insertText.length - 1 },
            });
          },
        }],
        validFor: /^.*$/,
      };
    }

    case 'update-before-set': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const opts = t.columns.map(c => ({
        label: c.name,
        type: 'property',
        detail: t.name,
      }));
      return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    case 'update-set': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const opts = t.columns.map(c => ({
        label: c.name,
        type: 'property',
        detail: t.name,
      }));
      return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    case 'select-col': {
      if (!bareColsEnabled()) {
        const aliases = docAliases(context);
        if (!aliases.length) return null;
        return { from, options: aliases, validFor: /^[\w\u00C0-\u024f]+$/ };
      }
      const tables = referencedTables(textBefore);
      const opts = tables.length ? columnOptsForTables(context, tables) : allColumnOptions(context);
      if (!opts.length) return null;
      return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    case 'condition': {
      if (!bareColsEnabled()) {
        const aliases = docAliases(context);
        if (!aliases.length) return null;
        return { from, options: aliases, validFor: /^[\w\u00C0-\u024f]+$/ };
      }
      const tables = referencedTables(textBefore);
      if (!tables.length) return null;
      const opts = columnOptsForTables(context, tables);
      if (!opts.length) return null;
      return { from, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    default:
      return null;
  }
}
