import { state } from '../state.js';
import { parseColumnAliases } from './sqlSchemaParser.js';

function docAliases(context) {
  const fullDoc = context.state.sliceDoc(0);
  return parseColumnAliases(fullDoc).map(a => ({
    label: a,
    type: 'property',
    detail: 'alias',
  }));
}

function allColumnOptions(context) {
  const opts = [];
  for (const t of state.tables) {
    for (const c of t.columns) {
      opts.push({
        label: c.name,
        type: 'property',
        detail: t.name,
      });
    }
  }
  opts.push(...docAliases(context));
  return opts;
}

function tableByName(name) {
  return state.tables.find(t => t.name === name);
}

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
    if (!t) continue;
    for (const c of t.columns) {
      opts.push({
        label: c.name,
        type: 'property',
        detail: t.name,
      });
    }
  }
  opts.push(...docAliases(context));
  return opts;
}

function detectContext(text) {
  let m;

  m = text.match(/INSERT\s+INTO\s+([\w\u00C0-\u024f]+)\s*\(\s*$/i);
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

export function sqlAutoTriggerSource(context) {
  const { state: edState, pos } = context;
  const textBefore = edState.sliceDoc(0, pos);
  if (!textBefore.trim()) return null;
  const lastChar = textBefore.slice(-1);
  if (lastChar === ' ' || lastChar === '\t' || lastChar === '\n') return null;
  const ctx = detectContext(textBefore);

  if (!ctx) {
    const dotPos = textBefore.lastIndexOf('.');
    const afterDot = textBefore.slice(dotPos + 1).trim();
    if (dotPos > 0 && /^\w*$/.test(afterDot)) return null;
    const tables = referencedTables(textBefore);
    const opts = tables.length ? columnOptsForTables(context, tables) : allColumnOptions(context);
    if (!opts.length) return null;
    return { from: pos, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
  }

  switch (ctx.type) {
    case 'insert-paren': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const opts = t.columns.filter(c => !c.pk).map(c => ({
        label: `${c.name}`,
        type: 'property',
        detail: t.name,
      }));
      return { from: pos, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
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
          label: `(${colList}) VALUES ()`,
          type: 'keyword',
          detail: 'INSERT with columns',
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
      return { from: pos, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    case 'update-set': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const opts = t.columns.map(c => ({
        label: c.name,
        type: 'property',
        detail: t.name,
      }));
      return { from: pos, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    case 'select-col': {
      const tables = referencedTables(textBefore);
      const opts = tables.length ? columnOptsForTables(context, tables) : allColumnOptions(context);
      if (!opts.length) return null;
      return { from: pos, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    case 'condition': {
      const tables = referencedTables(textBefore);
      if (!tables.length) return null;
      const opts = columnOptsForTables(context, tables);
      if (!opts.length) return null;
      return { from: pos, options: opts, validFor: /^[\w\u00C0-\u024f]+$/ };
    }

    default:
      return null;
  }
}
