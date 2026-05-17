import { $ } from '../utils.js';
import { state } from '../state.js';

const overlay = $('#ai-modal-overlay');
const promptInput = $('#ai-prompt-input');
const generateBtn = $('#btn-ai-generate');
const status = $('#ai-status');
const selectedInfo = $('#ai-selected-info');
const schemaCb = $('#ai-include-schema');
const rateInfo = $('#ai-rate-info');

const RATE_KEY = 'browsersql-ai-requests';
const RATE_WINDOW = 60 * 1000;
const RATE_LIMIT = 20;

let selRange = null;

function getLocalRequests() {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    if (!raw) return [];
    const now = Date.now();
    return JSON.parse(raw).filter(t => now - t < RATE_WINDOW);
  } catch { return []; }
}

function trackLocalRequest() {
  const list = getLocalRequests();
  list.push(Date.now());
  localStorage.setItem(RATE_KEY, JSON.stringify(list));
}

function updateRateDisplay() {
  const list = getLocalRequests();
  const remaining = Math.max(0, RATE_LIMIT - list.length);
  rateInfo.textContent = `⚡ ${remaining}/${RATE_LIMIT} requests available (resets in 60s)`;
  rateInfo.style.color = remaining < 5 ? 'var(--color-error)' : remaining < 10 ? 'var(--color-accent)' : 'var(--color-text-muted)';
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
  status.textContent = 'Generating...';

  try {
    const schema = schemaCb.checked ? buildSchemaString() : '';
    const body = { mode, description };
    if (schema) body.schema = schema;
    const res = await fetch('https://ideaboard.site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const sql = data.sql || data;
    if (typeof sql !== 'string' || !sql.trim()) throw new Error('No SQL returned');
    trackLocalRequest();
    insertSQL(sql);
    hideModal();
  } catch (err) {
    status.textContent = `Error: ${err.message || String(err)}`;
    generateBtn.disabled = false;
  }
}

document.getElementById('ai-modal-close').addEventListener('click', hideModal);

generateBtn.addEventListener('click', handleGenerate);

promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
});

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) hideModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) hideModal();
});
