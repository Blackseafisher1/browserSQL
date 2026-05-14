import { $ } from '../utils.js';
import { state } from '../state.js';
import { renderMarkdown } from './marker.js';
import { loadTutorialDatabase, openLastDB, saveCurrentToLocal } from './dbManager.js';
import { getFiles, getActiveFileName, replaceFiles, switchFile, renderTree, saveCurrentFile } from './filesView.js';

const ACTIVE_KEY = 'browsersql-tutorial-active';
const STEP_KEY = 'browsersql-tutorial-step';

const lessons = [
  {
    title: 'Read rows with SELECT',
    file: 'tutorial/01-select.sql',
    sql: 'SELECT name, city FROM users;\n',
    markdown: `# 1. Read rows

Open the starter file and run a basic read query.

Use:

\`\`\`sql
SELECT name, city FROM users;
\`\`\`

Goal: see a result set and notice column selection.`,
  },
  {
    title: 'Filter and sort',
    file: 'tutorial/02-filter-sort.sql',
    sql: 'SELECT name, age FROM users WHERE age >= 21 ORDER BY age DESC LIMIT 3;\n',
    markdown: `# 2. Filter and sort

Use WHERE, ORDER BY, and LIMIT.

\`\`\`sql
SELECT name, age FROM users WHERE age >= 21 ORDER BY age DESC LIMIT 3;
\`\`\`

Goal: narrow rows before you sort them.`,
  },
  {
    title: 'Write data',
    file: 'tutorial/03-write.sql',
    sql: "INSERT INTO users (name, city, age) VALUES ('Nora', 'Leipzig', 24);\n",
    markdown: `# 3. Write data

Use INSERT to add a row.

\`\`\`sql
INSERT INTO users (name, city, age) VALUES ('Nora', 'Leipzig', 24);
\`\`\`

Goal: add one row, then rerun a SELECT to confirm it exists.`,
  },
  {
    title: 'Change and remove data',
    file: 'tutorial/04-update-delete.sql',
    sql: "UPDATE users SET city = 'Bremen' WHERE name = 'Ava';\n",
    markdown: `# 4. Update and delete

Use UPDATE and DELETE carefully.

\`\`\`sql
UPDATE users SET city = 'Bremen' WHERE name = 'Ava';
DELETE FROM users WHERE name = 'Liam';
\`\`\`

Goal: update one row, then learn how DELETE targets rows with WHERE.`,
  },
  {
    title: 'Join tables',
    file: 'tutorial/05-join.sql',
    sql: `SELECT u.name, p.name AS product, o.quantity
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.id = o.product_id
ORDER BY o.id;\n`,
    markdown: `# 5. Join tables

Use JOIN to combine rows from related tables.

\`\`\`sql
SELECT u.name, p.name AS product, o.quantity
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN products p ON p.id = o.product_id
ORDER BY o.id;
\`\`\`

Goal: read across three tables in one result.`,
  },
  {
    title: 'Aggregate',
    file: 'tutorial/06-group-by.sql',
    sql: `SELECT u.city, COUNT(*) AS order_count
FROM orders o
JOIN users u ON u.id = o.user_id
GROUP BY u.city
ORDER BY order_count DESC;\n`,
    markdown: `# 6. Aggregate

Use GROUP BY to summarize rows.

\`\`\`sql
SELECT u.city, COUNT(*) AS order_count
FROM orders o
JOIN users u ON u.id = o.user_id
GROUP BY u.city
ORDER BY order_count DESC;
\`\`\`

Goal: turn rows into counts.`,
  },
];

function buildTutorialFiles() {
  const files = {
    'tutorial/README.md': `# SQL tutorial\n\nUse the lesson files in this folder. Each lesson is short and focused on one SQL idea.`,
  };
  for (const lesson of lessons) {
    files[lesson.file] = lesson.sql;
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
    prev: $('#btn-tutorial-prev'),
    next: $('#btn-tutorial-next'),
  };
}

function renderTutorialPanel() {
  const panel = getPanel();
  if (!panel.content || !panel.progress) return;
  const lesson = lessons[state.tutorialStep] || lessons[0];
  panel.progress.textContent = `Lesson ${state.tutorialStep + 1} of ${lessons.length} · ${lesson.title}`;
  panel.content.innerHTML = renderMarkdown(lesson.markdown);
  if (panel.files) {
    panel.files.innerHTML = `<strong>Starter files:</strong><br>${lessons.map((item, index) => `${index + 1}. ${item.file}`).join('<br>')}`;
  }
  if (panel.start) panel.start.textContent = state.tutorialActive ? 'Restart tutorial' : 'Start tutorial';
  if (panel.prev) panel.prev.disabled = state.tutorialStep === 0;
  if (panel.next) panel.next.textContent = state.tutorialStep === lessons.length - 1 ? 'Finish' : 'Next';
}

async function seedTutorialWorkspace() {
  replaceFiles(buildTutorialFiles(), lessons[0].file);
  renderTree();
  switchFile(lessons[0].file, 0, true);
  saveCurrentFile();
}

/**
 * Starts or resumes tutorial mode.
 * @returns {Promise<boolean>} Whether tutorial mode is active after initialization.
 */
export async function initTutorialMode() {
  const panel = getPanel();
  panel.start?.addEventListener('click', (e) => {
    e.stopPropagation();
    startTutorialMode(true);
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
    goToLesson(state.tutorialStep + 1);
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
  localStorage.removeItem(ACTIVE_KEY);
  await openLastDB();
  if (state.dbName === 'tutorial') {
    document.getElementById('btn-new-db')?.click();
  }
  renderTree();
  switchFile(getActiveFileName(), 0, true);
  renderTutorialPanel();
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
  if (resetProgress) setStep(0);
  else setStep(getStep());
  const dbOk = await loadTutorialDatabase();
  if (!dbOk) {
    state.tutorialMode = false;
    state.tutorialActive = false;
    localStorage.removeItem(ACTIVE_KEY);
    renderTutorialPanel();
    return false;
  }
  await seedTutorialWorkspace();
  renderTutorialPanel();
  return true;
}

function goToLesson(step) {
  const next = setStep(step);
  const lesson = lessons[next];
  renderTutorialPanel();
  switchFile(lesson.file, 0);
}
