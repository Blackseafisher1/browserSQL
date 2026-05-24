import { state } from '../state.js';

function tableByName(name) {
  return state.tables.find(t => t.name === name);
}

function referencedTables(text) {
  const names = new Set();
  let m;
  const re = /(?:FROM|JOIN)\s+(\w+)/gi;
  while ((m = re.exec(text)) !== null) names.add(m[1]);
  m = text.match(/UPDATE\s+(\w+)/i);
  if (m) names.add(m[1]);
  return [...names];
}

function columnOptsForTables(tableNames, withEquals) {
  const opts = [];
  for (const name of tableNames) {
    const t = tableByName(name);
    if (!t) continue;
    for (const c of t.columns) {
      opts.push({
        label: withEquals ? `${c.name} = ` : c.name,
        type: 'property',
        detail: `${t.name}.${c.type || ''}`,
      });
    }
  }
  return opts;
}

function detectContext(text) {
  let m;

  m = text.match(/INSERT\s+INTO\s+(\w+)\s*\(\s*$/i);
  if (m) return { type: 'insert-paren', table: m[1] };

  m = text.match(/INSERT\s+INTO\s+(\w+)\s*$/i);
  if (m) return { type: 'insert', table: m[1] };

  m = text.match(/UPDATE\s+(\w+)\s+SET\s+$/i);
  if (m) return { type: 'update-set', table: m[1] };

  m = text.match(/UPDATE\s+(\w+)\s+$/i);
  if (m) return { type: 'update-before-set', table: m[1] };

  if (/(?:WHERE|AND|OR|HAVING)\s+$/i.test(text)) return { type: 'condition' };

  return null;
}

export function sqlAutoTriggerSource(context) {
  const { state: edState, pos } = context;
  const textBefore = edState.sliceDoc(0, pos);
  const ctx = detectContext(textBefore);

  if (!ctx) return null;

  switch (ctx.type) {
    case 'insert-paren': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const opts = t.columns.filter(c => !c.pk).map(c => ({
        label: `${c.name}`,
        type: 'property',
        detail: c.type || '',
      }));
      return { from: pos, options: opts, validFor: /^[\w]+$/ };
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
        label: `SET ${c.name} = `,
        type: 'keyword',
        detail: c.type || '',
      }));
      return { from: pos, options: opts, validFor: /^[\w\s=]+$/ };
    }

    case 'update-set': {
      const t = tableByName(ctx.table);
      if (!t) return null;
      const opts = t.columns.map(c => ({
        label: `${c.name} = `,
        type: 'property',
        detail: c.type || '',
      }));
      return { from: pos, options: opts, validFor: /^[\w\s=]+$/ };
    }

    case 'condition': {
      const tables = referencedTables(textBefore);
      if (!tables.length) return null;
      const opts = columnOptsForTables(tables, true);
      if (!opts.length) return null;
      return { from: pos, options: opts, validFor: /^[\w\s=]+$/ };
    }

    default:
      return null;
  }
}
