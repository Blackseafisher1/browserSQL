import { $ } from '../utils.js';
import { state } from '../state.js';
import { renderMarkdown } from './marker.js';
import { lessons, MODULE_NAMES } from './lessons/index.js';
import { SEED_EMPTY, SEED_EMPTY_FK, SEED_USERS, SEED_USERS_EXT, SEED_USERS_NULL, SEED_SHOP, SEED_SHOP_EXT, SEED_EMPLOYEES, SEED_NORMALIZE, SEED_INVENTORY, SEED_DATES } from './lessons/seeds.js';
import { loadTutorialDatabase, openLastDB, saveCurrentToLocal } from './dbManager.js';
import { ensureDefaultFiles, getActiveFileName, getFiles, openSingleFile, replaceFiles, renderTree, saveCurrentFile, switchFile } from './filesView.js';
import { getSettings } from './settings.js';

const ACTIVE_KEY = 'browsersql-tutorial-active';
const STEP_KEY = 'browsersql-tutorial-step';
const COMPLETE_KEY = 'browsersql-tutorial-complete';
const TUTORIAL_DB_NAME = 'browsersql-tutorial';



let currentModule = 1;

function getModuleIndices(module) {
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

function markComplete(step) {
  completion[step] = true;
  saveCompletion();
}

function buildTutorialFiles(module) {
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
  panel.content.innerHTML = renderMarkdown(lesson.markdown);
  if (panel.files) {
    panel.files.innerHTML = '';
  }
  if (panel.start) panel.start.textContent = state.tutorialActive ? 'Restart' : 'Start';
  if (panel.end) panel.end.style.display = state.tutorialActive ? '' : 'none';
  const hintBtn = document.getElementById('btn-tutorial-hint');
  if (hintBtn) {
    hintBtn.style.display = state.tutorialActive && lesson.hint ? '' : 'none';
  }
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
}

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
  if (feedback) {
    feedback.textContent = isCorrect ? q.explanation : 'Try again.';
  }
  if (isCorrect) {
    if (qi + 1 < questions.length) {
      state.tutorialQuizIndex = qi + 1;
      setTimeout(() => renderQuiz(lesson), 600);
    } else {
      state.tutorialQuizIndex = 0;
      markComplete(state.tutorialStep);
      setStatus('Quiz passed. You can move to the next lesson.', 'success');
      renderTutorialPanel();
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
    if (quiz) {
      quiz.classList.add('active');
      renderQuiz(lesson);
    }
    if (executeBtn) executeBtn.disabled = true;
    state.tutorialLessonType = 'theory';
  } else {
    if (editor) editor.style.display = '';
    if (quiz) quiz.classList.remove('active');
    if (executeBtn) executeBtn.disabled = false;
    state.tutorialLessonType = lesson.type;
  }
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

function rowsEqual(actual, expected) {
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

/**
 * Evaluate a query against the active tutorial lesson check.
 * @param {{sql: string, rows: Array<Record<string, unknown>>, changes: number, error: Error | null}} result
 */
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
  if (passed) {
    markComplete(state.tutorialStep);
    setStatus('Nice. This step is complete.', 'success');
    renderTutorialPanel();
  } else {
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

/**
 * Starts or resumes tutorial mode.
 * @returns {Promise<boolean>} Whether tutorial mode is active after initialization.
 */
export async function initTutorialMode() {
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
  setStatus('Tutorial finished. You are back in the normal workspace.', 'success');
  renderTutorialPanel();
  const quiz = ensureQuizPanel();
  if (quiz) quiz.classList.remove('active');
  if (state.editorView?.dom) state.editorView.dom.style.display = '';
  const executeBtn = document.getElementById('btn-execute');
  if (executeBtn) executeBtn.disabled = false;
}

/**
 * Begins a fresh tutorial session with a clean DB and lesson files.
 * @param {boolean} resetProgress Whether to reset to lesson 1.
 * @returns {Promise<boolean>}
 */
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
  renderTutorialPanel();
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
  toggleEditorForLesson(lesson);
  if (lesson.type === 'theory') {
    setStatus('Answer the quiz to unlock Next.', '');
  } else {
    await openSingleFile(lesson.file);
    setStatus('Write your SQL, then click Verify to check.', '');
  }
  renderTutorialPanel();
}
