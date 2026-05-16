import { $, esc } from '../utils.js';
import { state } from '../state.js';

const info = $('#results-info');
const output = $('#results-output');
let lastRows = null;
let lastCols = null;

export function getLastResults() { return { rows: lastRows, cols: lastCols }; }

export function showResults(rows, queryTime) {
  if (!rows || rows.length === 0) {
    showNoResults('0 rows');
    return;
  }
  const cols = Object.keys(rows[0]);
  lastRows = rows;
  lastCols = cols;
  const rowCount = rows.length;
  info.textContent = `${rowCount} row${rowCount !== 1 ? 's' : ''} | ${queryTime}ms`;

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
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'query_results.csv'; a.click();
  URL.revokeObjectURL(url);
  navigator.clipboard?.writeText(csv).catch(() => {});
}

/**
 * Displays a short no-results message in the results pane.
 * @param {string} msg Message to show.
 */
export function showNoResults(msg) {
  info.textContent = msg;
  output.innerHTML = `<div class="results-empty">${esc(msg)}</div>`;
}

/**
 * Displays an error message in the results pane.
 * @param {string} msg Error message.
 */
export function showError(msg) {
  info.textContent = 'Error';
  output.innerHTML = `<div class="results-error">${esc(msg)}</div>`;
}

/**
 * Shows a table header preview when a table has no rows.
 * @param {Array<{name: string}>} columns Column metadata.
 */
export function showEmptyTableColumns(columns) {
  info.textContent = `0 rows | Table info`;
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
  info.textContent = 'Ready';
  output.innerHTML = '';
}
