import { $ } from '../utils.js';
import { state } from '../state.js';

const overlay = $('#ai-modal-overlay');
const promptInput = $('#ai-prompt-input');
const generateBtn = $('#btn-ai-generate');
const status = $('#ai-status');

let savedCursor = null;

function buildSchemaString() {
  if (!state.tables || state.tables.length === 0) return '';
  return state.tables.map(t => {
    const cols = t.columns.map(c => `${c.name} ${c.type || 'TEXT'}`).join(', ');
    return `${t.name}(${cols})`;
  }).join('\n');
}

function insertAtCursor(text) {
  const ed = state.editorView;
  if (!ed) return;
  const pos = savedCursor !== null ? savedCursor : ed.state.selection.main.head;
  savedCursor = null;
  ed.dispatch({
    changes: { from: pos, to: pos, insert: text },
    selection: { anchor: pos + text.length },
  });
  ed.focus();
}

export async function showAIGenerateModal() {
  const ed = state.editorView;
  savedCursor = ed ? ed.state.selection.main.head : null;
  overlay.classList.remove('hidden');
  promptInput.value = '';
  status.textContent = '';
  generateBtn.disabled = false;
  promptInput.focus();
}

function hideModal() {
  overlay.classList.add('hidden');
  savedCursor = null;
}

async function handleGenerate() {
  const description = promptInput.value.trim();
  if (!description) return;

  generateBtn.disabled = true;
  status.textContent = 'Generating...';

  try {
    const schema = buildSchemaString();
    const res = await fetch('https://ideaboard.site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, schema }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const sql = data.sql || data;
    if (typeof sql !== 'string' || !sql.trim()) throw new Error('No SQL returned');
    insertAtCursor(sql);
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
