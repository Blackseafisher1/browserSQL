import { $ } from '../utils.js';
import { state } from '../state.js';
import { renderMarkdown } from './marker.js';
import { lessons, MODULE_NAMES } from './lessons/index.js';
import { SEED_EMPTY, SEED_EMPTY_FK, SEED_USERS, SEED_USERS_EXT, SEED_USERS_NULL, SEED_SHOP, SEED_SHOP_EXT, SEED_EMPLOYEES, SEED_NORMALIZE, SEED_INVENTORY, SEED_DATES } from './lessons/seeds.js';
import { loadTutorialDatabase, openLastDB, saveCurrentToLocal } from './dbManager.js';
import { ensureDefaultFiles, getActiveFileName, getFiles, openSingleFile, replaceFiles, renderTree, saveCurrentFile, switchFile } from './filesView.js';
import { getSettings } from './settings.js';
import { showToast } from './toast.js';

const ACTIVE_KEY = 'browsersql-tutorial-active';
const STEP_KEY = 'browsersql-tutorial-step';
const COMPLETE_KEY = 'browsersql-tutorial-complete';
const POINTS_KEY = 'browsersql-tutorial-points';
const STREAK_KEY = 'browsersql-tutorial-streak';
const SOLUTIONS_KEY = 'browsersql-tutorial-solutions';
const FAILURES_KEY = 'browsersql-tutorial-failures';
const TUTORIAL_DB_NAME = 'browsersql-tutorial';

const POINTS_THEORY = 10;
const POINTS_PRACTICE = 20;
const POINTS_PRACTICE_RETRY = 10;
const POINTS_MODULE_BONUS = 25;
const XP_PER_LEVEL = 100;

let currentModule = 1;

export function getModuleIndices(module) {
  const indices = [];
  for (let i = 0; i < lessons.length; i++) {
    if (lessons[i].module === module) indices.push(i);
  }
  return indices;
}

let completion = loadCompletion();

function loadCompletion() {
  try { return JSON.parse(localStorage.getItem(COMPLETE_KEY)) || {}; } catch { return {}; }
}

export function refreshCompletion() {
  completion = loadCompletion();
}

function saveCompletion() {
  localStorage.setItem(COMPLETE_KEY, JSON.stringify(completion));
}

function resetCompletion() {
  completion = {};
  saveCompletion();
}

function isComplete(step) {
  return !!completion[step];
}

function markComplete(step, earnedXP) {
  const wasComplete = completion[step];
  completion[step] = true;
  saveCompletion();

  const lesson = lessons[step];
  if (!lesson) return;

  const hadSolution = hasViewedSolution(lesson.id);
  const xpToAward = earnedXP || (hadSolution ? 0 : calculateLessonXP(lesson));
  const isNewlyComplete = !wasComplete;

  if (isNewlyComplete && !hadSolution) {
    addPoints(xpToAward);
    const level = calcLevel();
    updateDisplay();
    const xpMsg = `+${xpToAward} XP`;
    showToast(xpMsg, 'xp', 2500);
    showXPFloat(xpToAward);

    updateStreak();

    const bonusXP = checkModuleComplete(lesson.module);
    if (bonusXP) {
      showToast(`🏁 Module ${lesson.module} Complete! +${bonusXP} XP`, 'celebration', 4000);
    }
  } else if (isNewlyComplete && hadSolution) {
    showToast('Lesson complete (0 XP — solution was viewed)', 'info', 3000);
  }
}

function calculateLessonXP(lesson) {
  if (lesson.type === 'theory') return POINTS_THEORY;
  const failures = loadFailures();
  const attemptCount = failures[lesson.id] || 0;
  return attemptCount === 0 ? POINTS_PRACTICE : POINTS_PRACTICE_RETRY;
}

/* ── XP / Level System ── */

function loadPoints() {
  const raw = localStorage.getItem(POINTS_KEY);
  const val = parseInt(raw, 10);
  return Number.isFinite(val) && val >= 0 ? val : 0;
}

function savePoints(p) {
  localStorage.setItem(POINTS_KEY, String(p));
}

function addPoints(amount) {
  if (amount <= 0) return;
  const current = loadPoints();
  savePoints(current + amount);
}

function calcLevel() {
  return Math.floor(loadPoints() / XP_PER_LEVEL) + 1;
}

/* ── Streak Tracking ── */

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null }; } catch { return { count: 0, lastDate: null }; }
}

function saveStreak(streak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

function updateStreak() {
  const streak = loadStreak();
  const today = new Date().toISOString().slice(0, 10);
  if (streak.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (streak.lastDate === yesterday) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  streak.lastDate = today;
  saveStreak(streak);
}

/* ── Solution View ── */

function loadSolutionViewed() {
  try { return JSON.parse(localStorage.getItem(SOLUTIONS_KEY)) || {}; } catch { return {}; }
}

function saveSolutionViewed(obj) {
  localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(obj));
}

function hasViewedSolution(lessonId) {
  return !!loadSolutionViewed()[lessonId];
}

function markSolutionViewed(lessonId) {
  const viewed = loadSolutionViewed();
  viewed[lessonId] = true;
  saveSolutionViewed(viewed);
}

/* ── Failure Tracking ── */

function loadFailures() {
  try { return JSON.parse(localStorage.getItem(FAILURES_KEY)) || {}; } catch { return {}; }
}

function saveFailures(obj) {
  localStorage.setItem(FAILURES_KEY, JSON.stringify(obj));
}

function incrementFailures(lessonId) {
  const failures = loadFailures();
  failures[lessonId] = (failures[lessonId] || 0) + 1;
  saveFailures(failures);
  return failures[lessonId];
}

function resetFailures() {
  localStorage.removeItem(FAILURES_KEY);
}

/* ── Display Updates ── */

function updateDisplay() {
  const xpEl = document.getElementById('tutorial-xp-display');
  const streakEl = document.getElementById('tutorial-streak-display');
  const barEl = document.getElementById('tutorial-xp-bar');
  if (xpEl) {
    const points = loadPoints();
    const level = calcLevel();
    xpEl.textContent = `Lv.${level} · ${points} XP`;
  }
  if (streakEl) {
    const streak = loadStreak();
    if (streak.count > 1) {
      streakEl.textContent = `🔥 ${streak.count}-day streak`;
      streakEl.style.display = '';
    } else {
      streakEl.style.display = 'none';
    }
  }
}

function showXPFloat(amount) {
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = `+${amount} XP`;
  const editor = document.querySelector('.editor-pane-wrap');
  if (editor) {
    const rect = editor.getBoundingClientRect();
    el.style.left = (rect.left + rect.width / 2 - 40) + 'px';
    el.style.top = (rect.top + rect.height / 2 - 20) + 'px';
  } else {
    el.style.left = '50%';
    el.style.top = '50%';
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/* ── Module Complete Check ── */

function checkModuleComplete(mod) {
  const indices = getModuleIndices(mod);
  const allDone = indices.every(i => isComplete(i));
  if (allDone) {
    addPoints(POINTS_MODULE_BONUS);
    updateDisplay();
    return POINTS_MODULE_BONUS;
  }
  return 0;
}

/* ── Core Tutorial Functions ── */

function getStep() {
  const raw = Number(localStorage.getItem(STEP_KEY));
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
}

function setStep(step) {
  const next = Math.max(0, Math.min(lessons.length - 1, step));
  state.tutorialStep = next;
  localStorage.setItem(STEP_KEY, String(next));
  return next;
}

function getPanel() {
  return {
    content: $('#tutorial-content'),
    progress: $('#tutorial-progress'),
    files: $('#tutorial-files'),
    start: $('#btn-tutorial-start'),
    end: $('#btn-tutorial-end'),
    prev: $('#btn-tutorial-prev'),
    next: $('#btn-tutorial-next'),
    status: $('#tutorial-status'),
  };
}

function setStatus(message, tone = '') {
  const panel = getPanel();
  if (!panel.status) return;
  panel.status.textContent = message || '';
  panel.status.classList.remove('is-success', 'is-error');
  if (tone === 'success') panel.status.classList.add('is-success');
  if (tone === 'error') panel.status.classList.add('is-error');
}

function renderTutorialPanel() {
  const panel = getPanel();
  if (!panel.content || !panel.progress) return;
  const lesson = lessons[state.tutorialStep] || lessons[0];
  panelContent = panel.content;
  const mod = lesson.module;
  const modIndices = getModuleIndices(mod);
  const posInMod = modIndices.indexOf(state.tutorialStep) + 1;
  const select = document.getElementById('tutorial-module-select');
  if (select) {
    select.innerHTML = Object.entries(MODULE_NAMES).map(([num, name]) =>
      `<option value="${num}" ${num == mod ? 'selected' : ''}>M${num}: ${name}</option>`
    ).join('');
  }
  const prog = document.getElementById('tutorial-lesson-progress');
  if (prog) prog.textContent = `Lesson ${posInMod} of ${modIndices.length} · ${lesson.title}`;
  renderProgressBar();
  updateDisplay();

  const rendered = renderMarkdown(lesson.markdown);
  panel.content.innerHTML = rendered;

  if (lesson.checklist && lesson.checklist.length > 0) {
    let done = state.tutorialChecklistStatus || [];
    if (done.length === 0 && isComplete(state.tutorialStep)) {
      done = lesson.checklist.map(() => true);
    }
    const els = panel.content.querySelectorAll('.tutorial-checklist-item');
    const count = done.filter(Boolean).length;
    els.forEach((el, idx) => {
      if (done[idx]) {
        el.classList.add('is-done');
        const box = el.querySelector('.check-box');
        if (box) box.textContent = '✓';
      }
    });
    const counter = document.createElement('div');
    counter.className = 'tutorial-checklist-counter';
    counter.textContent = `${count}/${lesson.checklist.length} conditions met`;
    panel.content.appendChild(counter);
  }

  if (panel.files) panel.files.innerHTML = '';
  if (panel.start) panel.start.textContent = state.tutorialActive ? 'Restart' : 'Start';
  if (panel.end) panel.end.style.display = state.tutorialActive ? '' : 'none';

  const hintBtn = document.getElementById('btn-tutorial-hint');
  if (hintBtn) hintBtn.style.display = state.tutorialActive && lesson.hint ? '' : 'none';

  const completed = isComplete(state.tutorialStep);
  const verifyBtn = document.getElementById('btn-verify');
  if (verifyBtn) verifyBtn.style.display = state.tutorialActive ? '' : 'none';
  if (panel.prev) panel.prev.disabled = !state.tutorialActive || state.tutorialStep === 0;
  if (panel.next) {
    const modEnd = state.tutorialStep >= lessons.length - 1;
    panel.next.textContent = modEnd ? 'Finish' : 'Next';
    panel.next.disabled = !state.tutorialActive || (!completed && !getSettings().skipEnabled);
  }
  if (!state.tutorialActive) setStatus('Start the tutorial to begin.', '');

  const solBtn = document.getElementById('btn-view-solution');
  if (solBtn) {
    solBtn.style.display = state.tutorialActive && lesson.type !== 'theory' ? '' : 'none';
  }
}

let panelContent = null;

function renderProgressBar() {
  const total = lessons.filter(l => l.type === 'practice' || l.type === 'theory').length;
  const done = Object.keys(completion).length;
  const pct = Math.round((done / total) * 100);
  const bar = document.getElementById('tutorial-progress-bar');
  if (!bar) return;
  const fill = bar.querySelector('.tutorial-progress-fill');
  if (fill) fill.style.width = pct + '%';
}

function ensureQuizPanel() {
  const container = document.getElementById('editor-container-0');
  if (!container) return null;
  let panel = container.querySelector('.tutorial-quiz');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'tutorial-quiz';
    panel.innerHTML = `
      <h2>Quiz</h2>
      <p class="tutorial-quiz-question"></p>
      <div class="tutorial-quiz-options notranslate"></div>
      <div class="tutorial-quiz-feedback"></div>
    `;
    container.appendChild(panel);
  }
  return panel;
}

function renderQuiz(lesson) {
  const panel = ensureQuizPanel();
  if (!panel) return;
  const questions = lesson.questions || (lesson.question ? [lesson.question] : []);
  if (questions.length === 0) return;
  const qi = state.tutorialQuizIndex || 0;
  const q = questions[qi];
  const prompt = panel.querySelector('.tutorial-quiz-question');
  const options = panel.querySelector('.tutorial-quiz-options');
  const feedback = panel.querySelector('.tutorial-quiz-feedback');
  if (!prompt || !options || !feedback) return;
  prompt.textContent = `(${qi + 1}/${questions.length}) ${q.prompt}`;
  options.innerHTML = '';
  feedback.textContent = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'tutorial-quiz-option notranslate';
    btn.type = 'button';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(idx, lesson, btn));
    options.appendChild(btn);
  });
}

function handleQuizAnswer(index, lesson, btn) {
  const panel = ensureQuizPanel();
  if (!panel) return;
  const questions = lesson.questions || (lesson.question ? [lesson.question] : []);
  const qi = state.tutorialQuizIndex || 0;
  const q = questions[qi];
  const feedback = panel.querySelector('.tutorial-quiz-feedback');
  const isCorrect = index === q.answer;
  const options = panel.querySelectorAll('.tutorial-quiz-option');
  options.forEach((el, idx) => {
    el.classList.toggle('is-correct', idx === q.answer);
    if (idx === index && !isCorrect) el.classList.add('is-wrong');
  });
  if (feedback) feedback.textContent = isCorrect ? q.explanation : 'Try again.';
  if (isCorrect) {
    if (qi + 1 < questions.length) {
      state.tutorialQuizIndex = qi + 1;
      setTimeout(() => renderQuiz(lesson), 600);
    } else {
      state.tutorialQuizIndex = 0;
      markComplete(state.tutorialStep);
      setStatus('Quiz passed. You can move to the next lesson.', 'success');
      showToast('Quiz passed!', 'success', 2500);
      setTimeout(() => renderTutorialPanel(), 100);
    }
  } else {
    setStatus('Incorrect answer. Pick another option.', 'error');
  }
}

function toggleEditorForLesson(lesson) {
  state.tutorialQuizIndex = 0;
  const editor = state.editorView?.dom;
  const quiz = ensureQuizPanel();
  const executeBtn = document.getElementById('btn-execute');
  if (lesson.type === 'theory') {
    if (editor) editor.style.display = 'none';
    if (quiz) { quiz.classList.add('active'); renderQuiz(lesson); }
    if (executeBtn) executeBtn.disabled = true;
    state.tutorialLessonType = 'theory';
  } else {
    if (editor) editor.style.display = '';
    if (quiz) quiz.classList.remove('active');
    if (executeBtn) executeBtn.disabled = false;
    state.tutorialLessonType = lesson.type;
  }
}

export function buildTutorialFiles(module) {
  module = module || currentModule;
  const files = {
    'README.md': `# Module ${module}: ${MODULE_NAMES[module]}\n\nOpen a practice lesson file and write your SQL.`,
  };
  for (const lesson of lessons) {
    if (lesson.type === 'practice' && lesson.module === module) {
      files[lesson.file] = '-- Write your SQL here\n';
    }
  }
  return files;
}

async function seedTutorialWorkspace(startFile, module) {
  module = module || currentModule;
  const files = buildTutorialFiles(module);
  const target = startFile && files[startFile] ? startFile : 'README.md';
  await replaceFiles(files, target);
  await renderTree();
  await openSingleFile(target);
  await saveCurrentFile();
}

function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

export function rowsEqual(actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (actual.length !== expected.length) return false;
  const actVals = actual.map(r => Object.values(r));
  const expVals = expected.map(r => Object.values(r));
  return JSON.stringify(actVals) === JSON.stringify(expVals);
}

function runCheck(check, rows, changes) {
  switch (check.type) {
    case 'success':
      return true;
    case 'result': {
      const expectedRows = check.expectedSql
        ? state.db.exec(check.expectedSql, { rowMode: 'object' })
        : check.expectedRows || [];
      return rowsEqual(rows, expectedRows);
    }
    case 'schema': {
      const info = state.db.exec(`PRAGMA table_info(${escId(check.table)})`, { rowMode: 'object' });
      const names = info.map(c => c.name);
      return rowsEqual(names, check.columns);
    }
    case 'pk': {
      const info = state.db.exec(`PRAGMA table_info(${escId(check.table)})`, { rowMode: 'object' });
      return info.some(c => c.name === check.column && (c.pk === 1 || c.pk === true));
    }
    case 'fk': {
      const fks = state.db.exec(`PRAGMA foreign_key_list(${escId(check.table)})`, { rowMode: 'object' });
      return fks.some(fk => fk.from === check.column);
    }
    case 'constraints': {
      const rows = state.db.exec(
        `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
        { bind: [check.table], rowMode: 'object' }
      );
      const sql = (rows[0]?.sql || '').toLowerCase();
      return check.tokens.every(token => sql.includes(token));
    }
    case 'changes':
      return typeof changes === 'number' && changes >= (check.min || 1);
    default:
      return false;
  }
}

export function evaluateTutorialQuery(result) {
  if (!state.tutorialActive) return;
  const lesson = lessons[state.tutorialStep];
  if (!lesson || lesson.type === 'theory') return;
  if (result.error) {
    setStatus(`Query failed: ${result.error.message || String(result.error)}`, 'error');
    return;
  }
  const check = lesson.check || { type: 'success' };
  const passed = runCheck(check, result.rows, result.changes);

  state.tutorialChecklistStatus = [];

  if (passed) {
    if (lesson.checklist && lesson.checklist.length > 0) {
      state.tutorialChecklistStatus = lesson.checklist.map(() => true);
    }
    const hadSolution = hasViewedSolution(lesson.id);
    const xp = hadSolution ? 0 : calculateLessonXP(lesson);
    markComplete(state.tutorialStep, xp);
    setStatus(xp > 0 ? `Complete! +${xp} XP` : 'Complete (0 XP — solution viewed)', 'success');
    renderTutorialPanel();
  } else {
    incrementFailures(lesson.id);
    const hint = lesson.hint ? ' 💡 ' + lesson.hint : '';
    setStatus('Not quite. Check the goal and try again.' + hint, 'error');
  }
}

export function verifyLesson(code) {
  if (!state.tutorialActive) return;
  const lesson = lessons[state.tutorialStep];
  if (!lesson || lesson.type === 'theory') {
    setStatus('This is a theory lesson. Answer the quiz to continue.', '');
    return;
  }
  if (!code?.trim()) {
    setStatus('Write your SQL query first, then click Verify.', '');
    return;
  }
  try {
    const rows = state.db.exec(code, { rowMode: 'object' });
    const changes = state.sqlite3?.capi?.sqlite3_changes(state.db.pointer) || 0;
    evaluateTutorialQuery({ sql: code, rows, changes, error: null });
  } catch (err) {
    setStatus(`Query failed: ${err.message || String(err)}`, 'error');
  }
}

/* ── Solution View ── */

function showSolution() {
  const lesson = lessons[state.tutorialStep];
  if (!lesson || !lesson.sql) {
    showToast('No solution available for this lesson.', 'info');
    return;
  }
  if (confirm('Viewing the solution awards 0 XP for this lesson. Continue?')) {
    markSolutionViewed(lesson.id);
    const editor = state.editorView;
    if (editor) {
      const view = editor;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: lesson.sql }
      });
      view.dom.classList.add('cm-readonly');
    }
    showToast('👁 Solution loaded — 0 XP for this lesson', 'warning', 4000);
    const statusEl = document.getElementById('tutorial-status');
    if (statusEl) {
      statusEl.textContent = '📖 Solution shown — 0 XP awarded. Read and understand it.';
      statusEl.classList.add('is-error');
    }
  }
}

/* ── Font Size Control ── */

const FONT_SIZE_KEY = 'browsersql-tutorial-fontsize';
const FONT_SIZE_MIN = 10;
const FONT_SIZE_MAX = 20;
const FONT_SIZE_DEFAULT = 13;

function getTutorialFontSize() {
  const raw = parseInt(localStorage.getItem(FONT_SIZE_KEY), 10);
  return Number.isFinite(raw) ? Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, raw)) : FONT_SIZE_DEFAULT;
}

function setTutorialFontSize(size) {
  const clamped = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, size));
  localStorage.setItem(FONT_SIZE_KEY, String(clamped));
  document.documentElement.style.setProperty('--tutorial-font-size', clamped + 'px');
  const tableSize = Math.round((11 + (clamped - 13) / 2) * 10) / 10;
  document.documentElement.style.setProperty('--tutorial-table-font-size', tableSize + 'px');
  document.documentElement.style.setProperty('--tutorial-code-font-size', (clamped - 1) + 'px');
}

function initFontControls() {
  const slider = document.getElementById('tutorial-font-slider');
  if (!slider) return;
  slider.value = String(getTutorialFontSize());
  setTutorialFontSize(getTutorialFontSize());
  slider.addEventListener('input', () => {
    setTutorialFontSize(Number(slider.value));
  });

  document.getElementById('btn-tutorial-fullscreen')?.addEventListener('click', () => {
    document.body.classList.toggle('tutorial-fullscreen');
  });
}

/* ── Init ── */

export async function initTutorialMode() {
  initFontControls();
  const panel = getPanel();
  panel.start?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.tutorialActive) {
      startTutorialMode(true);
    } else {
      const hasProgress = Object.keys(loadCompletion()).length > 0;
      startTutorialMode(!hasProgress);
    }
  });
  panel.end?.addEventListener('click', (e) => {
    e.stopPropagation();
    void exitTutorialMode();
  });
  panel.prev?.addEventListener('click', (e) => {
    e.stopPropagation();
    goToLesson(state.tutorialStep - 1);
  });
  panel.next?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.tutorialStep >= lessons.length - 1) {
      void exitTutorialMode();
      return;
    }
    const lesson = lessons[state.tutorialStep];
    const modIndices = getModuleIndices(lesson.module);
    const isModEnd = state.tutorialStep >= modIndices[modIndices.length - 1];
    if (isModEnd) {
      const nextIndices = getModuleIndices(lesson.module + 1);
      if (nextIndices.length > 0) {
        goToLesson(nextIndices[0]);
        return;
      }
    }
    goToLesson(state.tutorialStep + 1);
  });

  document.getElementById('btn-tutorial-hint')?.addEventListener('click', () => {
    const lesson = lessons[state.tutorialStep];
    if (lesson?.hint) setStatus('💡 ' + lesson.hint, '');
  });

  document.getElementById('btn-view-solution')?.addEventListener('click', () => {
    showSolution();
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'tutorial-module-select' && state.tutorialActive) {
      const idx = getModuleIndices(Number(e.target.value))[0];
      if (idx !== undefined) goToLesson(idx);
    }
  });

  window.addEventListener('settings-changed', () => {
    if (state.tutorialActive) renderTutorialPanel();
  });

  if (localStorage.getItem(ACTIVE_KEY) === '1') {
    return startTutorialMode(false);
  }
  renderTutorialPanel();
  updateDisplay();
  return false;
}

async function exitTutorialMode() {
  state.tutorialMode = false;
  state.tutorialActive = false;
  state.tutorialLessonType = null;
  localStorage.removeItem(ACTIVE_KEY);
  await openLastDB();
  if (state.dbName === TUTORIAL_DB_NAME) {
    document.getElementById('btn-new-db')?.click();
  }
  await ensureDefaultFiles();
  await renderTree();
  await switchFile(getActiveFileName(), 0, true);
  const totalXP = loadPoints();
  const level = calcLevel();
  setStatus(`Tutorial finished. You reached Level ${level} with ${totalXP} XP! 🎉`, 'success');
  showToast(`🏁 Tutorial complete! Level ${level} · ${totalXP} XP`, 'celebration', 5000);
  renderTutorialPanel();
  updateDisplay();
  const quiz = ensureQuizPanel();
  if (quiz) quiz.classList.remove('active');
  if (state.editorView?.dom) {
    state.editorView.dom.style.display = '';
    state.editorView.dom.classList.remove('cm-readonly');
  }
  const executeBtn = document.getElementById('btn-execute');
  if (executeBtn) executeBtn.disabled = false;
}

export async function startTutorialMode(resetProgress = true) {
  if (!state.tutorialMode && state.db && state.dbName !== 'untitled') {
    await saveCurrentToLocal().catch(() => {});
  }
  state.tutorialMode = true;
  state.tutorialActive = true;
  localStorage.setItem(ACTIVE_KEY, '1');
  const lesson = lessons[setStep(resetProgress ? 0 : getStep())];
  currentModule = lesson.module;
  const dbOk = await loadTutorialDatabase(lesson.seed || SEED_USERS);
  if (!dbOk) {
    state.tutorialMode = false;
    state.tutorialActive = false;
    localStorage.removeItem(ACTIVE_KEY);
    renderTutorialPanel();
    return false;
  }
  const files = await getFiles();
  const hasFiles = Object.keys(files).length > 0;
  if (resetProgress || !hasFiles) {
    resetCompletion();
    resetFailures();
    await seedTutorialWorkspace(lesson.file, currentModule);
  } else {
    await renderTree();
    if (lesson.type === 'practice') await openSingleFile(lesson.file);
  }
  toggleEditorForLesson(lesson);
  if (lesson.type === 'theory') {
    setStatus('Answer the quiz to unlock Next.', '');
  } else {
    setStatus('Write your SQL, then click Verify to check.', '');
  }
  state.tutorialChecklistStatus = [];
  renderTutorialPanel();
  updateDisplay();
  return true;
}

async function goToLesson(step) {
  const next = setStep(step);
  const lesson = lessons[next];
  const dbOk = await loadTutorialDatabase(lesson.seed || SEED_USERS);
  if (!dbOk) return;
  if (lesson.module !== currentModule) {
    currentModule = lesson.module;
    await seedTutorialWorkspace(lesson.file, currentModule);
  }
  if (state.editorView?.dom) state.editorView.dom.classList.remove('cm-readonly');
  toggleEditorForLesson(lesson);
  if (lesson.type === 'theory') {
    setStatus('Answer the quiz to unlock Next.', '');
  } else {
    await openSingleFile(lesson.file);
    setStatus('Write your SQL, then click Verify to check.', '');
  }
  state.tutorialChecklistStatus = [];
  renderTutorialPanel();
  updateDisplay();
}
