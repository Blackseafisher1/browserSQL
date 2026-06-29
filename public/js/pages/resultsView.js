import { $, esc } from '../utils.js';
import { state } from '../state.js';
import { t } from '../i18n.js';
import { showToast } from './toast.js';

const info = $('#results-info');
const output = $('#results-output');
let lastRows = null;
let lastCols = null;

export function getLastResults() { return { rows: lastRows, cols: lastCols }; }

export function getMultiplier(sql) {
  const s = (sql || '').trim().toUpperCase()
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  if (!s) return { mul: 6, label: 'SELECT' };
  if (s.startsWith('SELECT') || s.startsWith('WITH') || s.startsWith('PRAGMA') || s.startsWith('EXPLAIN')) {
    return { mul: 6, label: 'SELECT' };
  }
  if (s.startsWith('INSERT')) {
    const vals = s.match(/VALUES\s*\(/gi);
    if (vals && vals.length > 5) return { mul: 1150, label: 'batched INSERT' };
    return { mul: 75000, label: 'single INSERT' };
  }
  if (s.startsWith('UPDATE')) {
    if (s.includes('WHERE') && !s.includes('WHERE 1=1') && !s.includes('WHERE true')) {
      return { mul: 75000, label: 'single UPDATE' };
    }
    return { mul: 1750, label: 'batched UPDATE' };
  }
  if (s.startsWith('DELETE')) {
    if (s.includes('WHERE') && !s.includes('WHERE 1=1') && !s.includes('WHERE true')) {
      return { mul: 75000, label: 'single DELETE' };
    }
    return { mul: 1750, label: 'batched DELETE' };
  }
  if (s.startsWith('CREATE') || s.startsWith('DROP') || s.startsWith('ALTER')) {
    return { mul: 1000, label: 'DDL' };
  }
  if (s.startsWith('REPLACE')) {
    const vals = s.match(/VALUES\s*\(/gi);
    if (vals && vals.length > 5) return { mul: 1150, label: 'batched REPLACE' };
    return { mul: 75000, label: 'single REPLACE' };
  }
  return { mul: 10, label: 'other' };
}

export function trimZeros(s) {
  s = s.replace(/0+$/, '');
  if (s.endsWith('.')) s = s.slice(0, -1);
  return s || '0';
}

export function formatTime(seconds) {
  const n = parseFloat(seconds);
  if (isNaN(n)) return seconds;
  return trimZeros(n.toFixed(8));
}

export function formatEstimate(seconds, mul) {
  const n = parseFloat(seconds);
  if (isNaN(n)) return '';
  const est = n * mul;
  return trimZeros(est.toFixed(8));
}

export function showResults(rows, queryTime, sql) {
  if (!rows || rows.length === 0) {
    showNoResults('0 rows', sql);
    return;
  }
  const cols = Object.keys(rows[0]);
  lastRows = rows;
  lastCols = cols;
  const rowCount = rows.length;
  const mul = getMultiplier(sql);
  const ft = formatTime(queryTime);
  const est = formatEstimate(queryTime, mul.mul);
  info.textContent = t('results.info', rowCount, rowCount !== 1 ? 's' : '', ft, est, mul.label);

  let table = '<div class="results-table-wrapper"><table class="results-table"><thead><tr>';
  for (const col of cols) {
    table += `<th>${esc(col)}</th>`;
  }
  table += '</tr></thead><tbody>';
  for (const row of rows) {
    table += '<tr>';
    for (const col of cols) {
      const val = row[col];
      let display;
      let cls = '';
      if (val === null || val === undefined) {
        display = 'NULL';
        cls = 'cell-null';
      } else if (typeof val === 'number') {
        display = String(val);
        cls = 'cell-number';
      } else {
        display = esc(String(val));
      }
      table += `<td class="${cls}">${display}</td>`;
    }
    table += '</tr>';
  }
  table += '</tbody></table></div>';
  output.innerHTML = table;
}

export function csvFromLastResult() {
  if (!lastRows || !lastCols) return;
  let csv = lastCols.map(c => '"' + c.replace(/"/g, '""') + '"').join(',') + '\n';
  for (const row of lastRows) {
    csv += lastCols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return '';
      return '"' + String(v).replace(/"/g, '""') + '"';
    }).join(',') + '\n';
  }
  navigator.clipboard?.writeText(csv).then(() => {
    showToast(t('toast.csvCopied'), 'success');
  }).catch(() => {});
}

/**
 * Displays a short no-results message in the results pane.
 * @param {string} msg Message to show.
 * @param {string} [sql] Optional SQL for disk time estimation.
 */
export function showNoResults(msg, sql) {
  const parts = msg.match(/^([\d,\s]*\w+\s*(?:row|rows)?\s*)?(affected\s*)?[|]\s*([\d.]+)(ms)?$/i);
  if (parts && sql) {
    const elapsed = parts[3];
    const mul = getMultiplier(sql);
    const est = formatEstimate(elapsed, mul.mul);
    info.textContent = `${parts[1] || ''}${parts[2] || ''}| ${formatTime(elapsed)}s (est. disk time: ~${est}s, ${mul.label})`;
  } else {
    info.textContent = msg;
  }
  output.innerHTML = `<div class="results-empty">${esc(info.textContent)}</div>`;
}

/**
 * Displays an error message in the results pane.
 * @param {string} msg Error message.
 */
export function showError(msg) {
  info.textContent = t('results.error');
  output.innerHTML = `<div class="results-error">${esc(msg)}</div>`;
}

/**
 * Shows a table header preview when a table has no rows.
 * @param {Array<{name: string}>} columns Column metadata.
 */
export function showEmptyTableColumns(columns) {
  info.textContent = t('results.infoZero');
  if (!columns || columns.length === 0) {
    output.innerHTML = '<div class="results-empty">0 rows</div>';
    return;
  }
  let table = '<div class="results-table-wrapper"><table class="results-table"><thead><tr>';
  for (const col of columns) {
    table += `<th>${esc(col.name)}</th>`;
  }
  table += '</tr></thead><tbody></tbody></table></div>';
  output.innerHTML = table;
}

/**
 * Clears the results pane and restores the ready state.
 */
export function showReady() {
  info.textContent = t('results.ready');
  output.innerHTML = '';
}
