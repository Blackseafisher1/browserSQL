const SQL_KEYWORDS = new Set([
  'WHERE', 'AND', 'OR', 'ON', 'SET', 'INTO', 'VALUES', 'FROM', 'JOIN',
  'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'GROUP', 'ORDER',
  'BY', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'NOT', 'NULL', 'IS', 'IN',
  'LIKE', 'BETWEEN', 'EXISTS', 'DISTINCT', 'ALL', 'UNION', 'ELSE',
  'WHEN', 'THEN', 'CASE', 'END', 'ASC', 'DESC', 'FOR',
]);

export function parseAliases(text) {
  text = stripComments(text);
  const map = {};
  const re = /(?:FROM|JOIN)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const table = m[1];
    const alias = m[2];
    if (alias && !SQL_KEYWORDS.has(alias.toUpperCase()) && alias !== table) {
      map[alias] = table;
    }
  }
  return map;
}

function stripComments(s) {
  return s.replace(/--.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function extractSelectColumns(selectBody) {
  selectBody = stripComments(selectBody);
  const upper = selectBody.toUpperCase().trim();
  if (upper === '*' || upper.startsWith('*') || /^\s*\*\s*$/i.test(selectBody)) return null;

  const cols = [];
  let depth = 0;
  let i = 0;
  let start = 0;

  while (i < selectBody.length) {
    const ch = selectBody[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      const part = selectBody.slice(start, i).trim();
      if (part && part !== '*') cols.push(part);
      start = i + 1;
    }
    i++;
  }
  const last = selectBody.slice(start).trim();
  if (last && last !== '*') cols.push(last);

  return cols.map(part => {
    if (part === '*') return null;
    const m = part.match(/AS\s+(\w+)\s*$/i);
    if (m) return m[1];
    const clean = part.replace(/^.*?\./, '').replace(/\[.*?\]/g, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    return words[words.length - 1] || null;
  }).filter(Boolean);
}

export function parseCTEs(text) {
  const ctes = {};
  const cteRe = /(?:\bWITH\s+(?:RECURSIVE\s+)?)(\w+)\s*(?:\(([^)]*)\))?\s*AS\s*\(/gi;
  let m;
  while ((m = cteRe.exec(text)) !== null) {
    const name = m[1];
    const explicitCols = m[2];

    if (explicitCols) {
      ctes[name] = explicitCols.split(',').map(s => s.trim()).filter(Boolean);
      continue;
    }

    let depth = 1;
    let j = m.index + m[0].length;
    while (j < text.length && depth > 0) {
      if (text[j] === '(') depth++;
      else if (text[j] === ')') depth--;
      j++;
    }
    let cteBody = stripComments(text.slice(m.index + m[0].length, j - 1));

    let fromIdx = -1;
    let d = 0;
    for (let k = 0; k < cteBody.length; k++) {
      if (cteBody[k] === '(') d++;
      else if (cteBody[k] === ')') d--;
      else if (d === 0 && fromIdx === -1 && cteBody.slice(k, k + 4).toUpperCase() === 'FROM' && (k === 0 || /\W/.test(cteBody[k - 1]))) {
        fromIdx = k;
      }
    }
    const selectEnd = fromIdx !== -1 ? fromIdx : cteBody.length;
    const selectPart = cteBody.slice(0, selectEnd);

    const selectMatch = selectPart.match(/^\s*SELECT\s+(.*)/is);
    if (selectMatch) {
      const columns = extractSelectColumns(selectMatch[1]);
      if (columns) ctes[name] = columns;
    }
  }
  return ctes;
}

export function mergeSchema(baseSchema, aliases, ctes) {
  const merged = { ...baseSchema, ...ctes };
  for (const [alias, tableName] of Object.entries(aliases)) {
    if (baseSchema[tableName]) {
      merged[alias] = baseSchema[tableName];
    }
  }
  return merged;
}
