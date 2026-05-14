import { $ } from '../utils.js';
import { state } from '../state.js';
import { renderMarkdown } from './marker.js';
import { loadTutorialDatabase, openLastDB, saveCurrentToLocal } from './dbManager.js';
import { ensureDefaultFiles, getActiveFileName, openSingleFile, replaceFiles, renderTree, saveCurrentFile, switchFile } from './filesView.js';

const ACTIVE_KEY = 'browsersql-tutorial-active';
const STEP_KEY = 'browsersql-tutorial-step';
const COMPLETE_KEY = 'browsersql-tutorial-complete';
const TUTORIAL_DB_NAME = 'browsersql-tutorial';

const SEED_EMPTY = '';
const SEED_EMPTY_FK = 'PRAGMA foreign_keys = ON;';
const SEED_USERS = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT
);

INSERT INTO users (id, name, city, age, email) VALUES
  (1, 'Ava', 'Berlin', 28, 'ava@example.com'),
  (2, 'Noah', 'Hamburg', 22, 'noah@example.com'),
  (3, 'Mia', 'Munich', 31, 'mia@example.com'),
  (4, 'Liam', 'Cologne', 19, 'liam@example.com'),
  (5, 'Zoe', 'Berlin', 26, 'zoe@example.com');
`;

const SEED_USERS_NULL = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT
);

INSERT INTO users (id, name, city, age, email) VALUES
  (1, 'Ava', 'Berlin', 28, 'ava@example.com'),
  (2, 'Noah', 'Hamburg', 22, NULL),
  (3, 'Mia', 'Munich', 31, 'mia@example.com'),
  (4, 'Liam', 'Cologne', 19, NULL),
  (5, 'Zoe', 'Berlin', 26, 'zoe@example.com');
`;

const lessons = [
  {
    id: '01-intro',
    module: 1,
    title: 'What is a Database?',
    type: 'theory',
    file: 'tutorial/01-intro.md',
    markdown: `# 1. What is a database?

A database stores information in tables. Tables have rows and columns.

**Goal:** understand where data lives before writing SQL.`,
    question: {
      prompt: 'What stores data in rows and columns?',
      options: ['Index', 'Table', 'Query', 'View'],
      answer: 1,
      explanation: 'A table is the structure that holds rows and columns.',
    },
    seed: SEED_USERS,
  },
  {
    id: '02-nosql',
    module: 1,
    title: 'SQL vs NoSQL',
    type: 'theory',
    file: 'tutorial/02-nosql.md',
    markdown: `# 2. SQL vs NoSQL

SQL databases use tables and a structured schema. NoSQL systems can be document, key-value, or graph based.

**Goal:** know which keyword creates tables in SQL.`,
    question: {
      prompt: 'Which SQL keyword creates a table?',
      options: ['ALTER', 'CREATE TABLE', 'INSERT', 'UPDATE'],
      answer: 1,
      explanation: '`CREATE TABLE` defines a new table.',
    },
    seed: SEED_USERS,
  },
  {
    id: '03-attach',
    module: 1,
    title: 'Your First Database',
    type: 'practice',
    file: 'tutorial/03-attach.sql',
    sql: 'SELECT name FROM sqlite_master WHERE type = \'table\';\n',
    markdown: `# 3. Your first database

Use \`SELECT\` to read data from a table:
  SELECT column1, column2 FROM tablename;
Use \`*\` to select all columns. Use \`WHERE\` to filter rows.

SQLite stores metadata about all tables in a system table called \`sqlite_master\`. It has columns like \`name\`, \`type\`, and \`sql\`.

Try querying \`sqlite_master\` to discover what tables exist in this database.

**Goal:** a successful query shows at least one table.`,
    seed: SEED_USERS,
    check: { type: 'success' },
  },
  {
    id: '04-create',
    module: 1,
    title: 'Creating Tables',
    type: 'practice',
    file: 'tutorial/04-create.sql',
    sql: 'CREATE TABLE people (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  age INTEGER NOT NULL\n);\n',
    markdown: `# 4. Creating tables

Use \`CREATE TABLE\` to define a new table. Specify column names, data types, and constraints.

Basic syntax:
  CREATE TABLE tablename (
    column1 TYPE CONSTRAINTS,
    column2 TYPE CONSTRAINTS
  );

**Goal:** Create a table called \`people\` with columns \`id\` (INTEGER PRIMARY KEY), \`name\` (TEXT NOT NULL), and \`age\` (INTEGER NOT NULL).`,
    seed: SEED_EMPTY,
    check: { type: 'schema', table: 'people', columns: ['id', 'name', 'age'] },
  },
  {
    id: '05-types',
    module: 1,
    title: 'Data Types Deep Dive',
    type: 'theory',
    file: 'tutorial/05-types.md',
    markdown: `# 5. Data types

SQLite uses types like INTEGER, TEXT, REAL, and BLOB.

**Goal:** know which type stores integers.`,
    question: {
      prompt: 'Which SQLite type stores whole numbers?',
      options: ['TEXT', 'INTEGER', 'REAL', 'BLOB'],
      answer: 1,
      explanation: 'INTEGER is used for whole numbers.',
    },
    seed: SEED_USERS,
  },
  {
    id: '06-primary',
    module: 2,
    title: 'Primary Keys',
    type: 'practice',
    file: 'tutorial/06-primary.sql',
    sql: 'CREATE TABLE projects (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL\n);\nINSERT INTO projects (name) VALUES (\'Apollo\');\n',
    markdown: `# 6. Primary keys

A \`PRIMARY KEY\` uniquely identifies each row. Use \`INTEGER PRIMARY KEY AUTOINCREMENT\` to have SQLite automatically assign increasing IDs.

**Goal:** Create a table called \`projects\` with an auto-incrementing \`id\` primary key and a \`name\` column (TEXT NOT NULL). Then insert a project row.`,
    seed: SEED_EMPTY,
    check: { type: 'pk', table: 'projects', column: 'id' },
  },
  {
    id: '07-foreign',
    module: 2,
    title: 'Foreign Keys',
    type: 'practice',
    file: 'tutorial/07-foreign.sql',
    sql: 'PRAGMA foreign_keys = ON;\nCREATE TABLE authors (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE books (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  author_id INTEGER NOT NULL,\n  FOREIGN KEY (author_id) REFERENCES authors(id)\n);\n',
    markdown: `# 7. Foreign keys

A \`FOREIGN KEY\` links rows across tables. It references a \`PRIMARY KEY\` in another table.

First enable foreign keys with \`PRAGMA foreign_keys = ON;\`

Syntax:
  FOREIGN KEY (local_column) REFERENCES other_table(other_column)

**Goal:** Create an \`authors\` table (id, name) and a \`books\` table (id, title, author_id) where \`author_id\` references \`authors(id)\`.`,
    seed: SEED_EMPTY_FK,
    check: { type: 'fk', table: 'books', column: 'author_id' },
  },
  {
    id: '08-constraints',
    module: 2,
    title: 'Constraints',
    type: 'practice',
    file: 'tutorial/08-constraints.sql',
    sql: 'CREATE TABLE accounts (\n  id INTEGER PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE,\n  status TEXT NOT NULL DEFAULT \'active\',\n  age INTEGER CHECK (age >= 18)\n);\n',
    markdown: `# 8. Constraints

Constraints enforce rules on your data:
- \`NOT NULL\` — column must have a value
- \`UNIQUE\` — all values in the column must be different
- \`DEFAULT\` — provides a fallback value
- \`CHECK\` — validates values against a condition

**Goal:** Create an \`accounts\` table with all four constraint types above. Include \`id\` as PRIMARY KEY.`,
    seed: SEED_EMPTY,
    check: { type: 'constraints', table: 'accounts', tokens: ['not null', 'unique', 'default', 'check'] },
  },
  {
    id: '09-schema',
    module: 2,
    title: 'Schema Design',
    type: 'theory',
    file: 'tutorial/09-schema.md',
    markdown: `# 9. Schema design

Relationships can be one-to-one, one-to-many, or many-to-many.

**Goal:** know when a junction table is used.`,
    question: {
      prompt: 'Which relationship uses a junction table?',
      options: ['One-to-one', 'One-to-many', 'Many-to-many', 'Self-referencing'],
      answer: 2,
      explanation: 'Many-to-many relationships need a junction table.',
    },
    seed: SEED_USERS,
  },
  {
    id: '10-select',
    module: 3,
    title: 'Reading Data',
    type: 'practice',
    file: 'tutorial/10-select.sql',
    sql: 'SELECT * FROM users;\n',
    markdown: `# 10. Reading data

Use \`SELECT\` to read data from a table.
  SELECT column1, column2 FROM tablename;
Use \`*\` as shorthand for all columns.

**Goal:** Write a query that returns all rows and all columns from the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT * FROM users;' },
  },
  {
    id: '11-where',
    module: 3,
    title: 'Filtering',
    type: 'practice',
    file: 'tutorial/11-where.sql',
    sql: "SELECT name FROM users WHERE city = 'Berlin';\n",
    markdown: `# 11. Filtering

The \`WHERE\` clause filters rows based on a condition.
  SELECT columns FROM table WHERE condition;
Use \`=\` to compare values. String literals go in single quotes.

**Goal:** Write a query that returns the names of users who live in Berlin.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE city = 'Berlin';" },
  },
  {
    id: '12-advanced-where',
    module: 3,
    title: 'Advanced Filtering',
    type: 'practice',
    file: 'tutorial/12-advanced-where.sql',
    sql: "SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;\n",
    markdown: `# 12. Advanced filtering

Combine multiple operators for precise filtering:
- \`IN (...)\` — match any value in a list
- \`BETWEEN x AND y\` — match a range
- \`NOT IN (...)\` — exclude values
- \`AND\` — combine multiple conditions
- \`ORDER BY\` — sort results

**Goal:** Write a query that returns names of users who:
- Live in Berlin or Munich
- Are between 20 and 35 years old (inclusive)
- Are NOT 22 years old
- Sorted alphabetically by name`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;" },
  },
  {
    id: '13-null',
    module: 3,
    title: 'Working with NULL',
    type: 'practice',
    file: 'tutorial/13-null.sql',
    sql: 'SELECT name FROM users WHERE email IS NULL;\n',
    markdown: `# 13. Working with NULL

\`NULL\` represents missing or unknown data. You cannot use \`= NULL\` — instead use \`IS NULL\` or \`IS NOT NULL\`.

**Goal:** Write a query that returns the names of users who do not have an email address.`,
    seed: SEED_USERS_NULL,
    check: { type: 'result', expectedSql: 'SELECT name FROM users WHERE email IS NULL;' },
  },
  {
    id: '14-like',
    module: 3,
    title: 'Pattern Matching',
    type: 'practice',
    file: 'tutorial/14-like.sql',
    sql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;\n",
    markdown: `# 14. Pattern matching

\`LIKE\` enables pattern matching with wildcards:
- \`%\` — matches any sequence of characters
- \`_\` — matches exactly one character

  SELECT columns FROM table WHERE column LIKE pattern;

**Goal:** Write a query that returns names containing the letter 'a', sorted alphabetically.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;" },
  },
  {
    id: '15-insert',
    module: 3,
    title: 'Inserting Data',
    type: 'practice',
    file: 'tutorial/15-insert.sql',
    sql: "INSERT INTO users (name, city, age, email) VALUES ('Kai', 'Berlin', 27, 'kai@example.com');\n",
    markdown: `# 15. Inserting data

Use \`INSERT\` to add rows to a table.
  INSERT INTO tablename (col1, col2, ...) VALUES (val1, val2, ...);

The \`users\` table has columns: id, name, city, age, email. The \`id\` column is auto-incrementing — you can omit it.

**Goal:** Insert a new user into the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '16-update',
    module: 3,
    title: 'Updating Data',
    type: 'practice',
    file: 'tutorial/16-update.sql',
    sql: "UPDATE users SET city = 'Bremen' WHERE name = 'Mia';\n",
    markdown: `# 16. Updating data

Use \`UPDATE\` to modify existing rows.
  UPDATE tablename SET column = value WHERE condition;

Always include a \`WHERE\` clause — without it, every row gets updated!

**Goal:** Update the city of a specific user in the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '17-delete',
    module: 3,
    title: 'Deleting Data',
    type: 'practice',
    file: 'tutorial/17-delete.sql',
    sql: "DELETE FROM users WHERE name = 'Liam';\n",
    markdown: `# 17. Deleting data

Use \`DELETE\` to remove rows.
  DELETE FROM tablename WHERE condition;

Always include a \`WHERE\` clause — without it, all rows are deleted!

**Goal:** Delete a specific user from the \`users\` table by their name.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '18-delete-danger',
    module: 3,
    title: 'Danger of DELETE',
    type: 'theory',
    file: 'tutorial/18-delete-danger.md',
    markdown: `# 18. Danger of DELETE

Always include WHERE unless you truly want to delete everything.

**Goal:** know what happens without WHERE.`,
    question: {
      prompt: 'What happens if you run DELETE FROM users without WHERE?',
      options: ['Only the first row is deleted', 'All rows are deleted', 'Nothing happens', 'It deletes the table'],
      answer: 1,
      explanation: 'Without WHERE, every row is removed.',
    },
    seed: SEED_USERS,
  },
];

let completion = loadCompletion();

function loadCompletion() {
  try { return JSON.parse(localStorage.getItem(COMPLETE_KEY)) || {}; } catch { return {}; }
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

function buildTutorialFiles() {
  const files = {
    'tutorial/README.md': `# SQL tutorial\n\nOpen a practice lesson file and write your SQL.`,
  };
  for (const lesson of lessons) {
    if (lesson.type === 'practice') {
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
  panel.progress.textContent = `Lesson ${state.tutorialStep + 1} of ${lessons.length} · ${lesson.title}`;
  panel.content.innerHTML = renderMarkdown(lesson.markdown);
  if (panel.files) {
    panel.files.innerHTML = `<strong>Lesson file:</strong> ${lesson.file}`;
  }
  if (panel.start) panel.start.textContent = state.tutorialActive ? 'Restart tutorial' : 'Start tutorial';
  const completed = isComplete(state.tutorialStep);
  if (panel.prev) panel.prev.disabled = !state.tutorialActive || state.tutorialStep === 0;
  if (panel.next) {
    panel.next.textContent = state.tutorialStep === lessons.length - 1 ? 'Finish' : 'Next';
    panel.next.disabled = !state.tutorialActive || !completed;
  }
  if (!state.tutorialActive) setStatus('Start the tutorial to begin.', '');
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
      <div class="tutorial-quiz-options"></div>
      <div class="tutorial-quiz-feedback"></div>
    `;
    container.appendChild(panel);
  }
  return panel;
}

function renderQuiz(lesson) {
  const panel = ensureQuizPanel();
  if (!panel) return;
  const question = lesson.question;
  const prompt = panel.querySelector('.tutorial-quiz-question');
  const options = panel.querySelector('.tutorial-quiz-options');
  const feedback = panel.querySelector('.tutorial-quiz-feedback');
  if (!prompt || !options || !feedback) return;
  prompt.textContent = question.prompt;
  options.innerHTML = '';
  feedback.textContent = '';
  question.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'tutorial-quiz-option';
    btn.type = 'button';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleQuizAnswer(idx, lesson, btn));
    options.appendChild(btn);
  });
}

function handleQuizAnswer(index, lesson, btn) {
  const panel = ensureQuizPanel();
  if (!panel) return;
  const feedback = panel.querySelector('.tutorial-quiz-feedback');
  const isCorrect = index === lesson.question.answer;
  const options = panel.querySelectorAll('.tutorial-quiz-option');
  options.forEach((el, idx) => {
    el.classList.toggle('is-correct', idx === lesson.question.answer);
    if (idx === index && !isCorrect) el.classList.add('is-wrong');
  });
  if (feedback) {
    feedback.textContent = isCorrect ? lesson.question.explanation : 'Try again.';
  }
  if (isCorrect) {
    markComplete(state.tutorialStep);
    setStatus('Quiz passed. You can move to the next lesson.', 'success');
    renderTutorialPanel();
  } else {
    setStatus('Incorrect answer. Pick another option.', 'error');
  }
}

function toggleEditorForLesson(lesson) {
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

async function seedTutorialWorkspace(startFile) {
  const files = buildTutorialFiles();
  const target = startFile && files[startFile] ? startFile : 'tutorial/README.md';
  replaceFiles(files, target);
  renderTree();
  openSingleFile(target);
  saveCurrentFile();
}

function escId(name) {
  return `"${name.replace(/"/g, '""')}"`;
}

function rowsEqual(actual, expected) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (actual.length !== expected.length) return false;
  return JSON.stringify(actual) === JSON.stringify(expected);
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
    setStatus('Not quite. Compare your output with the goal and try again.', 'error');
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
  state.tutorialLessonType = null;
  localStorage.removeItem(ACTIVE_KEY);
  await openLastDB();
  if (state.dbName === TUTORIAL_DB_NAME) {
    document.getElementById('btn-new-db')?.click();
  }
  ensureDefaultFiles();
  renderTree();
  switchFile(getActiveFileName(), 0, true);
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
  if (resetProgress) {
    setStep(0);
    resetCompletion();
  } else {
    setStep(getStep());
  }
  const lesson = lessons[state.tutorialStep];
  const dbOk = await loadTutorialDatabase(lesson?.seed || SEED_USERS);
  if (!dbOk) {
    state.tutorialMode = false;
    state.tutorialActive = false;
    localStorage.removeItem(ACTIVE_KEY);
    renderTutorialPanel();
    return false;
  }
  await seedTutorialWorkspace(lesson?.file);
  toggleEditorForLesson(lesson);
  if (lesson.type === 'theory') {
    setStatus('Answer the quiz to unlock Next.', '');
  } else {
    setStatus('Run the lesson query to complete this step.', '');
  }
  renderTutorialPanel();
  return true;
}

async function goToLesson(step) {
  const next = setStep(step);
  const lesson = lessons[next];
  const dbOk = await loadTutorialDatabase(lesson.seed || SEED_USERS);
  if (!dbOk) return;
  toggleEditorForLesson(lesson);
  if (lesson.type === 'theory') {
    setStatus('Answer the quiz to unlock Next.', '');
  } else {
    openSingleFile(lesson.file);
    setStatus('Run the lesson query to complete this step.', '');
  }
  renderTutorialPanel();
}
