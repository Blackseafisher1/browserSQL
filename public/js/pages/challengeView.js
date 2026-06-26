import { state } from '../state.js';
import { renderMarkdown } from './marker.js';
import { loadTutorialDatabase, saveCurrentToLocal, openLastDB } from './dbManager.js';
import { openSingleFile, renderTree, ensureDefaultFiles, VFS_STORE } from './filesView.js';
import { runCheck, loadPoints, addPoints, updateDisplay } from './tutorialView.js';
import { showToast } from './toast.js';
import { DEFAULT_CHALLENGES } from './lessons/defaultChallenges.js';
import { showEditors, ensureEditor, setEditorContentFor } from './editorView.js';

const CHALLENGE_COMPLETE_KEY = 'browsersql-challenge-complete';
const CHALLENGE_FAILURES_KEY = 'browsersql-challenge-failures';
const CHALLENGE_SOLUTIONS_KEY = 'browsersql-challenge-solutions';
const CHALLENGE_DB_NAME = 'browsersql-tutorial';

const XP_TASK_FIRST = 15;
const XP_TASK_RETRY = 5;
const XP_CHALLENGE_BONUS = 25;

/* ── Font Size ── */

const CHALLENGE_FONT_KEY = 'browsersql-challenge-fontsize';
const CHALLENGE_FONT_MIN = 10;
const CHALLENGE_FONT_MAX = 20;
const CHALLENGE_FONT_DEFAULT = 13;

export function getChallengeFontSize() {
  const raw = parseInt(localStorage.getItem(CHALLENGE_FONT_KEY), 10);
  return Number.isFinite(raw) ? Math.max(CHALLENGE_FONT_MIN, Math.min(CHALLENGE_FONT_MAX, raw)) : CHALLENGE_FONT_DEFAULT;
}

export function setChallengeFontSize(size) {
  const clamped = Math.max(CHALLENGE_FONT_MIN, Math.min(CHALLENGE_FONT_MAX, size));
  localStorage.setItem(CHALLENGE_FONT_KEY, String(clamped));
  document.documentElement.style.setProperty('--challenge-font-size', clamped + 'px');
  const codeSize = Math.round((11 + (clamped - 13) / 2) * 10) / 10;
  document.documentElement.style.setProperty('--challenge-code-font-size', codeSize + 'px');
}

/* ── VFS helpers (always use normal store) ── */

function openVFSDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('browsersql-vfs', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(VFS_STORE, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function vfsGet() {
  const db = await openVFSDB();
  const tx = db.transaction(VFS_STORE, 'readonly');
  const req = tx.objectStore(VFS_STORE).get('data');
  const result = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result?.value || {};
}

async function vfsPut(value) {
  const db = await openVFSDB();
  const tx = db.transaction(VFS_STORE, 'readwrite');
  tx.objectStore(VFS_STORE).put({ key: 'data', value });
  await new Promise((r) => { tx.oncomplete = r; });
  db.close();
}

/* ── Completion / XP tracking ── */

function loadChallengeComplete() {
  try { return JSON.parse(localStorage.getItem(CHALLENGE_COMPLETE_KEY)) || {}; } catch { return {}; }
}

function saveChallengeComplete(obj) {
  localStorage.setItem(CHALLENGE_COMPLETE_KEY, JSON.stringify(obj));
}

export function isTaskComplete(challengeId, taskId) {
  const map = loadChallengeComplete();
  return !!map[challengeId + '/' + taskId];
}

export function markTaskComplete(challengeId, taskId, earnedXP) {
  const map = loadChallengeComplete();
  const key = challengeId + '/' + taskId;
  const wasComplete = !!map[key];
  map[key] = true;
  saveChallengeComplete(map);

  if (!wasComplete && earnedXP > 0) {
    addPoints(earnedXP);
    updateDisplay();
    showToast(`+${earnedXP} XP`, 'xp', 2500);
  }
}

export function loadFailures() {
  try { return JSON.parse(localStorage.getItem(CHALLENGE_FAILURES_KEY)) || {}; } catch { return {}; }
}

function saveFailures(obj) {
  localStorage.setItem(CHALLENGE_FAILURES_KEY, JSON.stringify(obj));
}

function incrementFailures(challengeId, taskId) {
  const f = loadFailures();
  const key = challengeId + '/' + taskId;
  f[key] = (f[key] || 0) + 1;
  saveFailures(f);
  return f[key];
}

function loadSolutions() {
  try { return JSON.parse(localStorage.getItem(CHALLENGE_SOLUTIONS_KEY)) || {}; } catch { return {}; }
}

function saveSolutions(obj) {
  localStorage.setItem(CHALLENGE_SOLUTIONS_KEY, JSON.stringify(obj));
}

function hasViewedSolution(challengeId, taskId) {
  return !!loadSolutions()[challengeId + '/' + taskId];
}

function markSolutionViewed(challengeId, taskId) {
  const s = loadSolutions();
  s[challengeId + '/' + taskId] = true;
  saveSolutions(s);
}

function allChallengeTasksDone(challenge) {
  if (!challenge || !challenge.tasks || challenge.tasks.length === 0) return false;
  const map = loadChallengeComplete();
  return challenge.tasks.every(t => map[challenge.id + '/' + t.id]);
}

/* ── Load challenges from VFS ── */

let challengesCache = [];

export async function loadChallenges() {
  const files = await vfsGet();
  challengesCache = [];
  const paths = Object.keys(files).filter(p => p.startsWith('challenges/') && p.endsWith('/challenge.json'));
  for (const p of paths) {
    try {
      const raw = files[p];
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!data || !data.id || !data.tasks || !Array.isArray(data.tasks)) {
        console.warn('[challenge] Skipping invalid:', p);
        continue;
      }
      const order = data.taskOrder || data.tasks.map(t => t.id);
      data._tasks = data.tasks.slice();
      data.tasks = order.map(id => data._tasks.find(t => t.id === id)).filter(Boolean);
      challengesCache.push(data);
    } catch (e) {
      console.warn('[challenge] Parse error:', p, e);
    }
  }
  challengesCache.sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
  return challengesCache;
}

function getChallenge(id) {
  return challengesCache.find(c => c.id === id) || null;
}

function getTaskCount(challenge) {
  return challenge.tasks ? challenge.tasks.length : 0;
}

function getCompletedCount(challenge) {
  if (!challenge || !challenge.tasks) return 0;
  const map = loadChallengeComplete();
  return challenge.tasks.filter(t => map[challenge.id + '/' + t.id]).length;
}

/* ── UI: Render list ── */

export async function renderChallengeList() {
  const el = document.getElementById('challenge-list');
  if (!el) return;
  await loadChallenges();
  if (challengesCache.length === 0) {
    el.innerHTML = '<div class="panel-empty">No challenges yet.<br>Import or create one.</div>';
    return;
  }
  el.innerHTML = challengesCache.map(c => {
    const done = getCompletedCount(c);
    const total = getTaskCount(c);
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const badges = { easy: 'ch-badge-easy', medium: 'ch-badge-medium', hard: 'ch-badge-hard' };
    return `<div class="ch-item" data-challenge-id="${c.id}">
      <div class="ch-item-title">
        <span class="ch-item-icon">📁</span>
        <span class="ch-item-name">${esc(c.title || c.id)}</span>
        <span class="ch-badge ${badges[c.difficulty] || 'ch-badge-medium'}">${c.difficulty || 'medium'}</span>
      </div>
      <div class="ch-item-progress">${done}/${total} tasks</div>
      <div class="ch-item-bar"><div class="ch-item-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  el.querySelectorAll('.ch-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.challengeId;
      showChallengeDetail(id);
    });
  });
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/* ── Reset / Delete ── */

function resetChallengeProgress(challengeId) {
  if (!confirm(`Reset all progress for this challenge?`)) return;
  for (const key of [CHALLENGE_COMPLETE_KEY, CHALLENGE_FAILURES_KEY, CHALLENGE_SOLUTIONS_KEY]) {
    const obj = JSON.parse(localStorage.getItem(key)) || {};
    for (const k of Object.keys(obj)) {
      if (k.startsWith(challengeId + '/')) delete obj[k];
    }
    localStorage.setItem(key, JSON.stringify(obj));
  }
  showChallengeDetail(challengeId);
}

async function deleteChallenge(challengeId) {
  if (!confirm(`Delete this challenge permanently?`)) return;
  const files = await vfsGet();
  delete files[`challenges/${challengeId}/challenge.json`];
  await vfsPut(files);
  for (const key of [CHALLENGE_COMPLETE_KEY, CHALLENGE_FAILURES_KEY, CHALLENGE_SOLUTIONS_KEY]) {
    const obj = JSON.parse(localStorage.getItem(key)) || {};
    for (const k of Object.keys(obj)) {
      if (k.startsWith(challengeId + '/')) delete obj[k];
    }
    localStorage.setItem(key, JSON.stringify(obj));
  }
  renderChallengeList();
}

/* ── UI: Challenge detail view ── */

function showChallengeDetail(challengeId) {
  const challenge = getChallenge(challengeId);
  if (!challenge) { showToast('Challenge not found.', 'error'); return; }
  const el = document.getElementById('challenge-list');
  const done = getCompletedCount(challenge);
  const total = getTaskCount(challenge);
  const badges = { easy: 'ch-badge-easy', medium: 'ch-badge-medium', hard: 'ch-badge-hard' };
  const tags = (challenge.tags || []).map(t => `<span class="ch-tag">${esc(t)}</span>`).join('');

  let tasksHtml = '';
  const map = loadChallengeComplete();
  challenge.tasks.forEach((t, i) => {
    const tk = challenge.id + '/' + t.id;
    const checked = map[tk] ? '✓' : '';
    tasksHtml += `<div class="ch-detail-task ${checked ? 'ch-task-done' : ''}" data-task-index="${i}">
      <span class="ch-task-check">${checked || '○'}</span>
      <span class="ch-task-title">${esc(t.title || t.id)}</span>
    </div>`;
  });

  el.innerHTML = `<div class="ch-detail">
    <button id="ch-back" class="btn btn-sm">← Back</button>
    <div class="ch-detail-header">
      <span class="ch-detail-title">${esc(challenge.title || challenge.id)}</span>
      <span class="ch-badge ${badges[challenge.difficulty] || 'ch-badge-medium'}">${challenge.difficulty || 'medium'}</span>
    </div>
    ${tags ? `<div class="ch-detail-tags">${tags}</div>` : ''}
    <div class="ch-detail-progress">${done}/${total} tasks completed</div>
    <div class="ch-item-bar"><div class="ch-item-fill" style="width:${total ? Math.round(done/total*100) : 0}%"></div></div>
    <div class="ch-detail-tasks">${tasksHtml}</div>
    <button id="ch-start" class="btn btn-sm btn-primary">${done > 0 ? 'Continue' : 'Start Challenge'}</button>
    <button id="ch-reset">Reset Progress</button>
    <button id="ch-delete" class="btn btn-sm btn-danger">Delete Challenge</button>
  </div>`;

  el.querySelector('#ch-back').addEventListener('click', () => renderChallengeList());
  el.querySelector('#ch-start').addEventListener('click', () => startChallenge(challengeId));
  el.querySelector('#ch-reset').addEventListener('click', () => resetChallengeProgress(challengeId));
  el.querySelector('#ch-delete').addEventListener('click', () => deleteChallenge(challengeId));
  el.querySelectorAll('.ch-detail-task').forEach(taskEl => {
    taskEl.addEventListener('click', () => {
      const idx = parseInt(taskEl.dataset.taskIndex, 10);
      startChallenge(challengeId, idx);
    });
  });
}

/* ── Start / Run challenge ── */

export async function startChallenge(challengeId, startTaskIndex) {
  if (state.tutorialActive) {
    showToast('End the tutorial first before starting a challenge.', 'error');
    return;
  }
  const challenge = getChallenge(challengeId);
  if (!challenge || !challenge.tasks || challenge.tasks.length === 0) {
    showToast('Challenge has no tasks.', 'error');
    return;
  }

  if (state.db && state.dbName !== 'browsersql-tutorial') {
    await saveCurrentToLocal().catch(() => {});
  }

  state.challengeMode = true;
  state.challengeActive = true;
  state.challengeData = challenge;
  const idx = typeof startTaskIndex === 'number' ? startTaskIndex : 0;
  state.challengeTaskIndex = Math.max(0, Math.min(challenge.tasks.length - 1, idx));

  await loadChallengeTask(challenge);
  renderChallengePanel();
}

async function loadChallengeTask(challenge) {
  const task = challenge.tasks[state.challengeTaskIndex];
  if (!task) return;
  const seed = task.seed || challenge.defaultSeed || '';
  const dbOk = await loadTutorialDatabase(seed);
  if (!dbOk) {
    showToast('Failed to load challenge database.', 'error');
    return;
  }
  const workspaceFiles = await vfsGet();
  const taskFile = 'challenge.sql';
  workspaceFiles['README.md'] = `# ${challenge.title}\n\nTask ${state.challengeTaskIndex + 1} of ${challenge.tasks.length}: ${task.title}`;
  workspaceFiles[taskFile] = '-- Write your SQL here\n';
  await vfsPut(workspaceFiles);
  await renderTree();
  await openSingleFile(taskFile);

  if (state.editorView?.dom) {
    state.editorView.dom.classList.remove('cm-readonly');
    state.editorView.dom.style.display = '';
  }

  const executeBtn = document.getElementById('btn-execute');
  if (executeBtn) executeBtn.disabled = false;
  const verifyBtn = document.getElementById('btn-verify');
  if (verifyBtn) verifyBtn.style.display = '';
  const quiz = document.querySelector('.tutorial-quiz');
  if (quiz) quiz.classList.remove('active');
}

/* ── UI: Render challenge panel ── */

function renderChallengePanel() {
  const el = document.getElementById('challenge-list');
  if (!el) return;
  const challenge = state.challengeData;
  if (!challenge) { renderChallengeList(); return; }
  const task = challenge.tasks[state.challengeTaskIndex];
  if (!task) { renderChallengeList(); return; }

  const total = challenge.tasks.length;
  const currentIdx = state.challengeTaskIndex;
  const map = loadChallengeComplete();
  const doneCount = challenge.tasks.filter(t => map[challenge.id + '/' + t.id]).length;
  const thisDone = map[challenge.id + '/' + task.id];

  const rendered = renderMarkdown(task.markdown || '');

  setChallengeFontSize(getChallengeFontSize());
  const fontSize = getChallengeFontSize();

  el.innerHTML = `<div class="ch-panel">
    <div class="ch-panel-top">
      <button id="ch-panel-back" class="btn btn-sm">← Back</button>
      <span class="ch-panel-position">Task ${currentIdx + 1} of ${total}</span>
      <span class="ch-panel-progress">${doneCount}/${total} tasks</span>
      <span class="ch-panel-font">
        <label class="ch-font-label">A</label>
        <input type="range" id="challenge-font-slider" class="ch-font-slider" min="10" max="20" step="1" value="${fontSize}">
        <label class="ch-font-label ch-font-label-lg">A</label>
      </span>
    </div>
    <div class="ch-item-bar"><div class="ch-item-fill" style="width:${total ? Math.round(doneCount/total*100) : 0}%"></div></div>
    <div class="ch-panel-nav">
      <button id="ch-panel-prev" class="btn btn-sm" ${currentIdx === 0 ? 'disabled' : ''}>◀ Prev</button>
      <span class="ch-panel-title">${esc(task.title || task.id)}</span>
      <button id="ch-panel-next" class="btn btn-sm" ${currentIdx >= total - 1 ? 'disabled' : ''}>Next ▶</button>
    </div>
    <div class="ch-panel-content">${rendered}</div>
    <div class="ch-panel-status" id="challenge-status">${thisDone ? '✅ Task completed!' : 'Write your SQL, then click Verify.'}</div>
    <div class="ch-panel-toolbar">
      <button id="ch-panel-hint" class="btn btn-sm" style="display:${task.hint ? '' : 'none'}">💡 Hint</button>
      <button id="ch-panel-solution" class="btn btn-sm" style="display:${task.sql ? '' : 'none'}">👁 Solution</button>
    </div>
  </div>`;

  el.querySelector('#ch-panel-back').addEventListener('click', () => {
    exitChallengeMode();
    showChallengeDetail(challenge.id);
  });
  el.querySelector('#ch-panel-prev')?.addEventListener('click', () => navigateChallengeTask(-1));
  el.querySelector('#ch-panel-next')?.addEventListener('click', () => navigateChallengeTask(1));
  el.querySelector('#ch-panel-hint')?.addEventListener('click', () => {
    const status = document.getElementById('challenge-status');
    if (status && task.hint) status.textContent = '💡 ' + task.hint;
  });
  el.querySelector('#ch-panel-solution')?.addEventListener('click', () => {
    showChallengeSolution(challenge, task);
  });

  const slider = document.getElementById('challenge-font-slider');
  if (slider) {
    slider.addEventListener('input', () => {
      setChallengeFontSize(Number(slider.value));
    });
  }

  if (thisDone && state.challengeActive) {
    const mainVerify = document.getElementById('btn-verify');
    if (mainVerify) mainVerify.style.display = 'none';
  }
}

function navigateChallengeTask(delta) {
  const challenge = state.challengeData;
  if (!challenge) return;
  const next = Math.max(0, Math.min(challenge.tasks.length - 1, state.challengeTaskIndex + delta));
  if (next === state.challengeTaskIndex) return;
  state.challengeTaskIndex = next;
  loadChallengeTask(challenge).then(() => renderChallengePanel());
}

/* ── Challenge solution ── */

function formatSql(sql) {
  const settings = JSON.parse(localStorage.getItem('browsersql-settings')) || {};
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\bSELECT\s+/gi, '\nSELECT\n  ')
    .replace(/\bFROM\s+/gi, '\nFROM ')
    .replace(/\b(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+/gi, '\n$&')
    .replace(/\bWHERE\s+/gi, '\nWHERE ')
    .replace(/\bGROUP\s+BY\s+/gi, '\nGROUP BY ')
    .replace(/\bORDER\s+BY\s+/gi, '\nORDER BY ')
    .replace(/\bHAVING\s+/gi, '\nHAVING ')
    .replace(/\bLIMIT\s+/gi, '\nLIMIT ')
    .replace(/\bON\s+/gi, settings.formatOnNewline ? '\n  ON ' : ' ON ')
    .replace(/\bAND\s+(?=\w)/gi, '\n  AND ')
    .replace(/\bOR\s+(?=\w)/gi, '\n  OR ')
    .replace(/\bUNION(?:\s+ALL)?\s+/gi, '\n$&\n')
    .replace(/\n\s*\n\s*/g, '\n')
    .trim();
}

function showChallengeSolution(challenge, task) {
  if (!task.sql) { showToast('No solution available.', 'info'); return; }
  if (confirm('Viewing the solution awards 0 XP for this task. Continue?')) {
    markSolutionViewed(challenge.id, task.id);
    const formatted = formatSql(task.sql);
    showEditors(2);
    ensureEditor(1);
    setEditorContentFor(1, formatted);
    const ed1 = ensureEditor(1);
    ed1.dom.classList.add('cm-readonly');
    const solKeyHandler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        if (k === 'c' || k === 'a') return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    ed1.dom.addEventListener('keydown', solKeyHandler, { capture: true });
    const tab1 = document.getElementById('tab-bar-1');
    if (tab1) {
      tab1.style.display = 'flex';
      tab1.innerHTML = '<span class="tab-solution-label">SOLUTION</span><button class="tab-close-btn" id="btn-close-solution">&times;</button>';
      tab1.querySelector('#btn-close-solution')?.addEventListener('click', () => {
        ed1.dom.classList.remove('cm-readonly');
        ed1.dom.removeEventListener('keydown', solKeyHandler, { capture: true });
        tab1.style.display = '';
        tab1.innerHTML = '';
        showEditors(1);
      });
    }
    showToast('👁 Solution in right editor — 0 XP for this task', 'warning', 4000);
    const status = document.getElementById('challenge-status');
    if (status) {
      status.textContent = '📖 Solution shown (right pane) — 0 XP awarded.';
      status.classList.add('is-error');
    }
  }
}

/* ── Verify ── */

export function verifyChallenge(code) {
  if (!state.challengeActive) return;
  const challenge = state.challengeData;
  if (!challenge) return;
  const task = challenge.tasks[state.challengeTaskIndex];
  if (!task) return;

  if (isTaskComplete(challenge.id, task.id)) {
    setChallengeStatus('Already completed. Move to the next task.', '');
    return;
  }

  if (!code?.trim()) {
    setChallengeStatus('Write your SQL query first, then click Verify.', '');
    return;
  }

  try {
    const rows = state.db.exec(code, { rowMode: 'object' });
    const changes = state.sqlite3?.capi?.sqlite3_changes(state.db.pointer) || 0;
    evaluateChallengeQuery({ sql: code, rows, changes, error: null });
  } catch (err) {
    setChallengeStatus(`Query failed: ${err.message || String(err)}`, 'error');
  }
}

function evaluateChallengeQuery(result) {
  if (!state.challengeActive) return;
  const challenge = state.challengeData;
  const task = challenge.tasks[state.challengeTaskIndex];
  if (!task) return;
  if (result.error) {
    setChallengeStatus(`Query failed: ${result.error.message || String(result.error)}`, 'error');
    return;
  }
  const check = task.check || { type: 'success' };
  const passed = runCheck(check, result.rows, result.changes);

  if (passed) {
    const hadSolution = hasViewedSolution(challenge.id, task.id);
    const failures = loadFailures();
    const key = challenge.id + '/' + task.id;
    const attemptCount = failures[key] || 0;
    const xp = hadSolution ? 0 : (attemptCount === 0 ? XP_TASK_FIRST : XP_TASK_RETRY);
    markTaskComplete(challenge.id, task.id, xp);
    setChallengeStatus(xp > 0 ? `Complete! +${xp} XP` : 'Complete (0 XP)', 'success');

    const bonusAwarded = checkChallengeComplete(challenge);
    if (bonusAwarded) {
      showToast(`🏁 Challenge Complete! +${bonusAwarded} XP`, 'celebration', 4000);
    }
    renderChallengePanel();
    if (isTaskComplete(challenge.id, task.id)) {
      const mainVerify = document.getElementById('btn-verify');
      if (mainVerify) mainVerify.style.display = 'none';
    }
  } else {
    incrementFailures(challenge.id, task.id);
    const hint = task.hint ? ' 💡 ' + task.hint : '';
    setChallengeStatus('Not quite. Try again.' + hint, 'error');
  }
}

function checkChallengeComplete(challenge) {
  if (!allChallengeTasksDone(challenge)) return 0;
  const map = loadChallengeComplete();
  const bonusKey = challenge.id + '/_bonus';
  if (map[bonusKey]) return 0;
  map[bonusKey] = true;
  saveChallengeComplete(map);
  addPoints(XP_CHALLENGE_BONUS);
  updateDisplay();
  return XP_CHALLENGE_BONUS;
}

function setChallengeStatus(message, tone = '') {
  const status = document.getElementById('challenge-status');
  if (!status) return;
  status.textContent = message || '';
  status.classList.remove('is-success', 'is-error');
  if (tone === 'success') status.classList.add('is-success');
  if (tone === 'error') status.classList.add('is-error');
}

/* ── Exit challenge mode ── */

export async function exitChallengeMode() {
  if (state.editorView?.dom) {
    state.editorView.dom.classList.remove('cm-readonly');
    state.editorView.dom.style.display = '';
  }
  const ed1 = ensureEditor(1);
  ed1.dom.classList.remove('cm-readonly');
  const tab1 = document.getElementById('tab-bar-1');
  if (tab1) { tab1.textContent = ''; tab1.style.display = ''; }
  showEditors(1);
  const verifyBtn = document.getElementById('btn-verify');
  if (verifyBtn) verifyBtn.style.display = 'none';
  const executeBtn = document.getElementById('btn-execute');
  if (executeBtn) executeBtn.disabled = false;
  const quiz = document.querySelector('.tutorial-quiz');
  if (quiz) quiz.classList.remove('active');

  if (state.db && state.dbName === 'browsersql-tutorial') {
    await openLastDB().catch(() => {});
    if (state.dbName === 'browsersql-tutorial') {
      document.getElementById('btn-new-db')?.click();
    }
  }
  await ensureDefaultFiles().catch(() => {});
  await renderTree().catch(() => {});

  state.challengeMode = false;
  state.challengeActive = false;
  state.challengeData = null;
  state.challengeTaskIndex = 0;
}

/* ── Import challenge file ── */

export function importChallengeFile() {
  const input = document.getElementById('challenge-file-input');
  if (!input) return;
  input.value = '';
  input.click();
}

async function handleChallengeFileImport(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.id || !data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
      showToast('Invalid challenge file. Need id and tasks array.', 'error');
      return;
    }
    for (const t of data.tasks) {
      if (!t.id) { showToast(`Task missing id.`, 'error'); return; }
    }
    const existing = await vfsGet();
    const path = `challenges/${data.id}/challenge.json`;
    if (existing[path]) {
      if (!confirm(`Challenge "${data.title || data.id}" already exists. Overwrite?`)) return;
    }
    existing[path] = JSON.stringify(data, null, 2);
    await vfsPut(existing);
    showToast(`Imported: ${data.title || data.id}`, 'success');
    renderChallengeList();
  } catch (e) {
    showToast(`Failed to import: ${e.message}`, 'error');
  }
}

/* ── Challenge Editor ── */

export function openChallengeEditor() {
  const overlay = document.getElementById('challenge-editor-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  document.getElementById('challenge-editor-title').textContent = 'Create Challenge';
  const newId = uuid();
  document.getElementById('ce-id').value = newId;
  const display = document.getElementById('ce-id-display');
  if (display) display.textContent = newId;
  document.getElementById('ce-title').value = '';
  document.getElementById('ce-difficulty').value = 'medium';
  document.getElementById('ce-tags').value = '';
  document.getElementById('ce-desc').value = '';
  document.getElementById('ce-tasks-container').innerHTML = renderTaskEditorFields({ tasks: [{}] }, 0);
  refreshRemoveButtons();
}

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function renderTaskEditorFields(challenge, taskIdx) {
  const tasks = challenge.tasks || [];
  const task = tasks[taskIdx] || {};
  const check = task.check || { type: 'result' };

  const checkParamsHtml = renderCheckParams(check);

  return `<div class="ce-task" data-task-idx="${taskIdx}">
    <div class="ce-task-header">
      <strong>Task ${taskIdx + 1}</strong>
      <button class="btn btn-sm ce-task-remove">✕ Remove</button>
    </div>
    <div class="ce-task-fields">
      <div class="challenge-field">
        <label>Task ID</label>
        <input type="text" class="ce-input ce-task-id" value="${escAttr(task.id || uuid())}" placeholder="auto-generated">
      </div>
      <div class="challenge-field">
        <label>Title</label>
        <input type="text" class="ce-input ce-task-title" value="${escAttr(task.title || '')}" placeholder="Task title">
      </div>
      <div class="challenge-field">
        <label>Markdown (description)</label>
        <textarea class="ce-textarea ce-task-md" rows="3" placeholder="Describe what the user should do...">${escAttr(task.markdown || '')}</textarea>
      </div>
      <div class="challenge-field">
        <label>Seed SQL</label>
        <textarea class="ce-textarea ce-task-seed" rows="3" placeholder="CREATE TABLE ...; INSERT ..." style="font-family:var(--font-mono);font-size:11px">${escAttr(task.seed || '')}</textarea>
      </div>
      <div class="challenge-field">
        <label>Check Type</label>
        <select class="ce-input ce-task-check-type">
          <option value="result" ${check.type === 'result' ? 'selected' : ''}>Result match</option>
          <option value="schema" ${check.type === 'schema' ? 'selected' : ''}>Schema check</option>
          <option value="pk" ${check.type === 'pk' ? 'selected' : ''}>Primary key</option>
          <option value="fk" ${check.type === 'fk' ? 'selected' : ''}>Foreign key</option>
          <option value="constraints" ${check.type === 'constraints' ? 'selected' : ''}>Constraint tokens</option>
          <option value="changes" ${check.type === 'changes' ? 'selected' : ''}>Row changes</option>
          <option value="contains" ${check.type === 'contains' ? 'selected' : ''}>Contains keywords</option>
          <option value="success" ${check.type === 'success' ? 'selected' : ''}>Any valid result</option>
        </select>
      </div>
      <div class="ce-check-params">${checkParamsHtml}</div>
      <div class="challenge-field">
        <label>Solution SQL</label>
        <textarea class="ce-textarea ce-task-sql" rows="2" placeholder="-- Solution query" style="font-family:var(--font-mono);font-size:11px">${escAttr(task.sql || '')}</textarea>
      </div>
      <div class="challenge-field">
        <label>Hint</label>
        <input type="text" class="ce-input ce-task-hint" value="${escAttr(task.hint || '')}" placeholder="Optional hint">
      </div>
      <div class="challenge-field">
        <label>Checklist (one per line)</label>
        <textarea class="ce-textarea ce-task-checklist" rows="2" placeholder="Returns 5 rows&#10;Includes column: name">${escAttr((task.checklist || []).join('\n'))}</textarea>
      </div>
    </div>
  </div>`;
}

function escAttr(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '&#10;');
}

function renderCheckParams(check) {
  switch (check.type) {
    case 'result':
      return `<div class="challenge-field">
        <label>Expected SQL</label>
        <textarea class="ce-textarea ce-check-expected-sql" rows="2" placeholder="SELECT ..." style="font-family:var(--font-mono);font-size:11px">${escAttr(check.expectedSql || '')}</textarea>
      </div>`;
    case 'schema':
      return `<div class="challenge-field-row">
        <div class="challenge-field" style="flex:1">
          <label>Table</label>
          <input type="text" class="ce-input ce-check-table" value="${escAttr(check.table || '')}" placeholder="table_name">
        </div>
        <div class="challenge-field" style="flex:2">
          <label>Columns (comma-separated)</label>
          <input type="text" class="ce-input ce-check-columns" value="${escAttr((check.columns || []).join(', '))}" placeholder="col1, col2">
        </div>
      </div>`;
    case 'pk':
    case 'fk':
      return `<div class="challenge-field-row">
        <div class="challenge-field" style="flex:1">
          <label>Table</label>
          <input type="text" class="ce-input ce-check-table" value="${escAttr(check.table || '')}" placeholder="table_name">
        </div>
        <div class="challenge-field" style="flex:1">
          <label>Column</label>
          <input type="text" class="ce-input ce-check-column" value="${escAttr(check.column || '')}" placeholder="column_name">
        </div>
      </div>`;
    case 'constraints':
      return `<div class="challenge-field-row">
        <div class="challenge-field" style="flex:1">
          <label>Table</label>
          <input type="text" class="ce-input ce-check-table" value="${escAttr(check.table || '')}" placeholder="table_name">
        </div>
        <div class="challenge-field" style="flex:2">
          <label>Tokens (comma-separated)</label>
          <input type="text" class="ce-input ce-check-tokens" value="${escAttr((check.tokens || []).join(', '))}" placeholder="unique, not null">
        </div>
      </div>`;
    case 'changes':
      return `<div class="challenge-field">
        <label>Min changes</label>
        <input type="number" class="ce-input ce-check-min" value="${check.min || 1}" min="0">
      </div>`;
    case 'contains':
      return `<div class="challenge-field">
        <label>Keywords/substrings (comma-separated, case-insensitive match)</label>
        <textarea class="ce-textarea ce-check-tokens" rows="2" placeholder="SELECT, GROUP BY, HAVING, JOIN" style="font-family:var(--font-mono);font-size:11px">${escAttr((check.tokens || []).join(', '))}</textarea>
      </div>`;
    default:
      return '';
  }
}

function collectChallengeFromEditor() {
  const id = (document.getElementById('ce-id').value || uuid()).trim();
  const title = document.getElementById('ce-title').value.trim();
  const difficulty = document.getElementById('ce-difficulty').value;
  const tagsRaw = document.getElementById('ce-tags').value.trim();
  const desc = document.getElementById('ce-desc').value.trim();

  if (!title) { showToast('Challenge title is required.', 'error'); return null; }

  const taskEls = document.querySelectorAll('#ce-tasks-container .ce-task');
  if (taskEls.length === 0) { showToast('At least one task is required.', 'error'); return null; }

  const tasks = [];
  for (const el of taskEls) {
    const taskId = el.querySelector('.ce-task-id')?.value?.trim();
    if (!taskId) { showToast('Each task needs an ID.', 'error'); return null; }
    const taskTitle = el.querySelector('.ce-task-title')?.value?.trim() || taskId;
    const markdown = el.querySelector('.ce-task-md')?.value?.trim() || '';
    const seed = el.querySelector('.ce-task-seed')?.value?.trim() || '';
    const sql = el.querySelector('.ce-task-sql')?.value?.trim() || '';
    const hint = el.querySelector('.ce-task-hint')?.value?.trim() || '';
    const checklistRaw = el.querySelector('.ce-task-checklist')?.value?.trim() || '';
    const checkType = el.querySelector('.ce-task-check-type')?.value || 'success';

    let check = { type: checkType };
    const paramsEl = el.querySelector('.ce-check-params');
    if (paramsEl) {
      switch (checkType) {
        case 'result':
          check.expectedSql = (paramsEl.querySelector('.ce-check-expected-sql')?.value || '').trim();
          if (!check.expectedSql && checkType === 'result') {
            showToast(`Task "${taskId}": Expected SQL is required for result check.`, 'error');
            return null;
          }
          break;
        case 'schema':
          check.table = (paramsEl.querySelector('.ce-check-table')?.value || '').trim();
          check.columns = (paramsEl.querySelector('.ce-check-columns')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
          break;
        case 'pk':
        case 'fk':
          check.table = (paramsEl.querySelector('.ce-check-table')?.value || '').trim();
          check.column = (paramsEl.querySelector('.ce-check-column')?.value || '').trim();
          break;
        case 'constraints':
          check.table = (paramsEl.querySelector('.ce-check-table')?.value || '').trim();
          check.tokens = (paramsEl.querySelector('.ce-check-tokens')?.value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          break;
        case 'changes':
          check.min = parseInt(paramsEl.querySelector('.ce-check-min')?.value, 10) || 1;
          break;
        case 'contains':
          check.tokens = (paramsEl.querySelector('.ce-check-tokens')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
          break;
      }
    }

    tasks.push({
      id: taskId,
      title: taskTitle,
      markdown,
      seed,
      check,
      sql,
      hint,
      checklist: checklistRaw ? checklistRaw.split('\n').map(s => s.trim()).filter(Boolean) : [],
    });
  }

  return {
    id,
    title,
    difficulty,
    tags: tagsRaw ? tagsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
    description: desc,
    tasks,
  };
}

async function saveChallengeToVFS(data) {
  const files = await vfsGet();
  const path = `challenges/${data.id}/challenge.json`;
  files[path] = JSON.stringify(data, null, 2);
  await vfsPut(files);
}

/* ── Wire editor buttons ── */

function wireChallengeEditor() {
  const overlay = document.getElementById('challenge-editor-overlay');
  if (!overlay) return;

  document.getElementById('challenge-editor-close')?.addEventListener('click', () => overlay.classList.add('hidden'));
  document.getElementById('ce-cancel')?.addEventListener('click', () => overlay.classList.add('hidden'));

  let taskCounter = 1;

  document.getElementById('ce-add-task')?.addEventListener('click', () => {
    const container = document.getElementById('ce-tasks-container');
    const count = container.querySelectorAll('.ce-task').length;
    const html = renderTaskEditorFields({ tasks: [{}] }, count);
    const div = document.createElement('div');
    div.innerHTML = html;
    container.appendChild(div.firstElementChild);
    refreshRemoveButtons();
  });

  document.getElementById('ce-save')?.addEventListener('click', async () => {
    const data = collectChallengeFromEditor();
    if (!data) return;
    await saveChallengeToVFS(data);
    showToast(`Saved: ${data.title}`, 'success');
    overlay.classList.add('hidden');
    renderChallengeList();
  });

  document.getElementById('ce-download')?.addEventListener('click', () => {
    const data = collectChallengeFromEditor();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `challenge-${data.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Challenge downloaded.', 'info');
  });

  document.getElementById('ce-test')?.addEventListener('click', () => {
    const data = collectChallengeFromEditor();
    if (!data) {
      showToast('Fix errors before testing.', 'error');
      return;
    }
    if (!state.db) {
      showToast('No database loaded. Open a database first.', 'error');
      return;
    }
    try {
      const firstTask = data.tasks[0];
      if (firstTask.seed) state.db.exec(firstTask.seed, { rowMode: 'object' });
      const code = state.editorView?.state.doc.toString() || '';
      if (!code.trim()) { showToast('Write SQL in the editor to test against.', 'error'); return; }
      const rows = state.db.exec(code, { rowMode: 'object' });
      const changes = state.sqlite3?.capi?.sqlite3_changes(state.db.pointer) || 0;
      const passed = runCheck(firstTask.check || { type: 'success' }, rows, changes);
      showToast(passed ? 'Test passed!' : 'Test failed.', passed ? 'success' : 'error');
    } catch (e) {
      showToast(`Test error: ${e.message}`, 'error');
    }
  });

  document.addEventListener('change', (e) => {
    const sel = e.target.closest('.ce-task-check-type');
    if (!sel) return;
    const taskEl = sel.closest('.ce-task');
    if (!taskEl) return;
    const paramsContainer = taskEl.querySelector('.ce-check-params');
    if (!paramsContainer) return;
    const check = { type: sel.value };
    paramsContainer.innerHTML = renderCheckParams(check);
  });
}

function refreshRemoveButtons() {
  const container = document.getElementById('ce-tasks-container');
  if (!container) return;
  const count = container.querySelectorAll('.ce-task').length;
  container.querySelectorAll('.ce-task-remove').forEach(btn => {
    btn.removeEventListener('click', handleRemoveTask);
    btn.addEventListener('click', handleRemoveTask);
    if (count <= 1) {
      btn.disabled = true;
      btn.style.opacity = '0.4';
    } else {
      btn.disabled = false;
      btn.style.opacity = '';
    }
  });
}

function handleRemoveTask(e) {
  const taskEl = e.target.closest('.ce-task');
  if (!taskEl) return;
  const container = document.getElementById('ce-tasks-container');
  const count = container.querySelectorAll('.ce-task').length;
  if (count <= 1) {
    showToast('Need at least one task.', 'info');
    e.preventDefault();
    return;
  }
  taskEl.remove();
  container.querySelectorAll('.ce-task').forEach((el, i) => {
    el.dataset.taskIdx = i;
    const hdr = el.querySelector('.ce-task-header strong');
    if (hdr) hdr.textContent = `Task ${i + 1}`;
  });
  refreshRemoveButtons();
}

/* ── Init ── */

export function initChallengeMode() {
  setChallengeFontSize(getChallengeFontSize());
  wireChallengeEditor();
  renderChallengeList();

  document.getElementById('btn-challenge-import')?.addEventListener('click', (e) => {
    e.stopPropagation();
    importChallengeFile();
  });

  document.getElementById('btn-challenge-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    openChallengeEditor();
  });

  document.getElementById('btn-challenge-refresh')?.addEventListener('click', (e) => {
    e.stopPropagation();
    renderChallengeList();
  });

  const fileInput = document.getElementById('challenge-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      fileInput.value = '';
      await handleChallengeFileImport(file);
    });
  }

  seedDefaultChallenges();
}

async function seedDefaultChallenges() {
  const files = await vfsGet();
  for (const challenge of DEFAULT_CHALLENGES) {
    const path = `challenges/${challenge.id}/challenge.json`;
    files[path] = JSON.stringify(challenge, null, 2);
  }
  await vfsPut(files);
  renderChallengeList();
}
