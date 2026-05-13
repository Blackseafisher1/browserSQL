import { $ } from '../utils.js';

export function showShell(logs) {
  const output = $('#results-output');
  const info = $('#results-info');
  if (!output) return;
  if (info) info.textContent = 'JS Shell';
  let html = '<div class="shell-output">';
  for (const log of logs) {
    const cls = log.type === 'error' ? 'shell-error' : log.type === 'warn' ? 'shell-warn' : 'shell-log';
    html += `<div class="shell-line ${cls}">${esc(log.text)}</div>`;
  }
  html += '</div>';
  output.innerHTML = html;
}

export function showJSReady() {
  const output = $('#results-output');
  const info = $('#results-info');
  if (!output) return;
  if (info) info.textContent = 'JS Shell';
  output.innerHTML = '<div class="shell-output"><div class="shell-line shell-log">// JS Shell — console.log output appears here</div></div>';
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
