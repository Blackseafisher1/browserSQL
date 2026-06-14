import { $, isOffline, fetchWithOfflineFallback } from '../utils.js';
import { state } from '../state.js';

const API_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? 'http://localhost:8081'
  : 'https://ideaboard.site';

const overlay = $('#ai-modal-overlay');
const promptInput = $('#ai-prompt-input');
const generateBtn = $('#btn-ai-generate');
const status = $('#ai-status');
const statusText = document.createElement('span');
statusText.className = 'ai-status-text';
const spinner = document.createElement('span');
spinner.className = 'ai-spinner';
spinner.textContent = ' ⚙️';
spinner.style.display = 'none';
status.innerHTML = '';
status.appendChild(statusText);
status.appendChild(spinner);
const selectedInfo = $('#ai-selected-info');
const schemaCb = $('#ai-include-schema');
const rateInfo = $('#ai-rate-info');

let selRange = null;
let currentAbortController = null;

function updateRateDisplay() {
  const token = localStorage.getItem('browsersql-cloud-token');
  const limit = token ? 35 : 15;
  rateInfo.textContent = `⚡ ${limit}/h limit (${token ? 'logged in' : 'not logged in'})`;
  rateInfo.style.color = 'var(--color-text-muted)';
}

function buildSchemaString() {
  if (!state.tables || state.tables.length === 0) return '';
  return state.tables.map(t => {
    const cols = t.columns.map(c => `${c.name} ${c.type || 'TEXT'}`).join(', ');
    return `${t.name}(${cols})`;
  }).join('\n');
}

function insertSQL(sql) {
  const ed = state.editorView;
  if (!ed) return;
  if (selRange) {
    ed.dispatch({
      changes: { from: selRange.from, to: selRange.to, insert: sql },
      selection: { anchor: selRange.from + sql.length },
      scrollIntoView: true,
    });
    selRange = null;
  } else {
    const pos = ed.state.selection.main.head;
    ed.dispatch({
      changes: { from: pos, insert: sql },
      selection: { anchor: pos + sql.length },
      scrollIntoView: true,
    });
  }
  ed.focus();
}

export async function showAIGenerateModal() {
  if (isOffline()) {
    statusText.textContent = '❌ No internet connection. AI generation requires a network.';
    return;
  }
  const ed = state.editorView;
  if (ed) {
    const sel = ed.state.selection.main;
    if (!sel.empty) {
      selRange = { from: sel.from, to: sel.to };
      const text = ed.state.sliceDoc(sel.from, sel.to - sel.from);
      selectedInfo.textContent = `📝 Selected: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`;
      selectedInfo.style.display = '';
      promptInput.placeholder = 'Extra instructions (leave empty to fix/optimize)';
    } else {
      selRange = null;
      selectedInfo.style.display = 'none';
      promptInput.placeholder = 'e.g. show employee name and years with company';
    }
  } else {
    selRange = null;
    selectedInfo.style.display = 'none';
  }

  updateRateDisplay();
  overlay.classList.remove('hidden');
  promptInput.value = '';
  status.textContent = '';
  generateBtn.disabled = false;
  promptInput.focus();
}

function hideModal() {
  if (currentAbortController) currentAbortController.abort();
  overlay.classList.add('hidden');
  selRange = null;
}

async function handleGenerate() {
  let description = promptInput.value.trim();
  if (!description && !selRange) return;

  const mode = selRange ? 'fix' : 'generate';

  if (selRange) {
    const ed = state.editorView;
    const selected = ed ? ed.state.sliceDoc(selRange.from, selRange.to - selRange.from) : '';
    const extra = description ? `\nAdditional: ${description}` : '';
    description = `${selected}${extra}`;
  }

  generateBtn.disabled = true;
  statusText.textContent = 'Generating...';
  spinner.style.display = 'inline';

  if (currentAbortController) currentAbortController.abort();
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    const schema = schemaCb.checked ? buildSchemaString() : '';
    const body = { mode, description };
    if (schema) body.schema = schema;
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('browsersql-cloud-token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const timer = setTimeout(() => currentAbortController.abort(), 60000);
    const res = await fetchWithOfflineFallback(`${API_BASE}/api/ai/generate`, {
      method: 'POST', headers, body: JSON.stringify(body),
      signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const sql = data.sql || data;
    if (typeof sql !== 'string' || !sql.trim()) throw new Error('No SQL returned');
    insertSQL(sql);
    hideModal();
  } catch (err) {
    statusText.textContent = `Error: ${err.message || String(err)}`;
    generateBtn.disabled = false;
    spinner.style.display = 'none';
  }
}

document.getElementById('ai-modal-close').addEventListener('click', hideModal);

generateBtn.addEventListener('click', handleGenerate);

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
});



document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) hideModal();
});
