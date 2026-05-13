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
  setTimeout(() => { output.scrollTop = output.scrollHeight; }, 10);
}

export function showInput(promptText, resolve) {
  inputCallback = resolve;
  const output = $('#results-output');
  const info = $('#results-info');
  if (!output) return;
  if (info) info.textContent = 'JS Shell (input)';
  const inputId = 'shell-input-' + Date.now();
  const line = document.createElement('div');
  line.className = 'shell-input-line';
  line.innerHTML = `<span class="shell-prompt">${esc(promptText || '> ')}</span>`;
  const field = document.createElement('input');
  field.type = 'text';
  field.id = inputId;
  field.className = 'shell-input';
  field.autofocus = true;
  line.appendChild(field);
  output.appendChild(line);
  field.focus();
  setTimeout(() => { output.scrollTop = output.scrollHeight; }, 10);
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = field.value;
      const done = document.createElement('span');
      done.className = 'shell-input-done';
      done.textContent = val;
      field.replaceWith(done);
      if (inputCallback) { const cb = inputCallback; inputCallback = null; cb(val); }
    }
  });
}

export function showJSReady() {
  const output = $('#results-output');
  const info = $('#results-info');
  if (!output) return;
  if (info) info.textContent = 'JS Shell';
  output.innerHTML = '<div class="shell-output"><div class="shell-line shell-log">// JS Shell — console.log output appears here</div><div class="shell-line shell-log">// For interactive programs (input()), use F12 browser console</div></div>';
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
