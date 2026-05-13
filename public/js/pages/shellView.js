import { $ } from '../utils.js';

let inputCallback = null;

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

export function showInput(promptText, resolve) {
  inputCallback = resolve;
  const output = $('#results-output');
  const info = $('#results-info');
  if (!output) return;
  if (info) info.textContent = 'JS Shell (input)';
  const inputId = 'shell-input-' + Date.now();
  const html = `<div class="shell-input-line"><span class="shell-prompt">${esc(promptText || '> ')}</span><input type="text" id="${inputId}" class="shell-input" autofocus></div>`;
  output.insertAdjacentHTML('beforeend', html);
  const field = document.getElementById(inputId);
  if (field) {
    field.focus();
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = field.value;
        field.disabled = true;
        field.insertAdjacentHTML('afterend', `<span class="shell-input-done">${esc(val)}</span>`);
        field.remove();
        if (inputCallback) inputCallback(val);
        inputCallback = null;
      }
    });
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
