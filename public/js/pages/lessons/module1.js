import { SEED_USERS, SEED_EMPTY } from './seeds.js';

export const module1 = [
  {
    id: '02-explore-editor',
    module: 2,
    title: 'Explore the Editor',
    type: 'theory',
    file: '02-explore-editor.md',
    markdown: `# Explore the Editor

Welcome to **CashPal** — a fast-growing fintech startup. As their first data engineer, you'll build everything from scratch.

Before writing SQL, get familiar with the editor:

- **Left sidebar** — Files, Schema viewer, Tutorial panel
  - **Schema viewer** (bottom-left) lists all tables — expand one to see columns, types, and constraints
  - Click any table name to auto-run \`SELECT * FROM table LIMIT 100\`
- **Editor** — write SQL queries here (the main area)
- **Results** — query output appears below the editor
- **Execute** (Ctrl+Enter) — runs the current query
- **Verify** — checks your solution against the lesson goal

Try it: click around, open the Schema viewer, explore the \`users\` table.

**Goal:** get comfortable with the editor layout.`,
    question: {
      prompt: 'Ready to write some SQL?',
      options: ['Yes, let\'s go!', 'Let me look around some more'],
      answer: 0,
      explanation: 'Great! You can always come back to explore later.',
    },
    seed: SEED_USERS,
  },
  {
    id: '04-create',
    module: 2,
    title: 'Creating Tables',
    type: 'practice',
    file: '04-create.sql',
    sql: 'CREATE TABLE people (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  age INTEGER NOT NULL\n);\n',
    markdown: `# Creating Tables

CashPal needs a \`people\` table to track employees and customers.

Use \`CREATE TABLE\` to define a new table:

\`\`\`sql
CREATE TABLE tablename (
  column1 TYPE CONSTRAINTS,
  column2 TYPE CONSTRAINTS
);
\`\`\`

**Your task:** Create the \`people\` table that CashPal needs.

- [ ] Create a table called \`people\`
- [ ] Column \`id\` must be INTEGER PRIMARY KEY
- [ ] Column \`name\` must be TEXT NOT NULL
- [ ] Column \`age\` must be INTEGER NOT NULL

> **Tip:** After running, open the **Schema viewer** (bottom-left) and expand \`people\` to verify your work.`,
    seed: SEED_EMPTY,
    check: { type: 'schema', table: 'people', columns: ['id', 'name', 'age'] },
    checklist: [
      'Table called people',
      'Column id is INTEGER PRIMARY KEY',
      'Column name is TEXT NOT NULL',
      'Column age is INTEGER NOT NULL',
    ],
  },
  {
    id: '05-types',
    module: 2,
    title: 'Data Types Deep Dive',
    type: 'theory',
    file: '05-types.md',
    markdown: `# Data Types

SQLite has 5 native storage classes, but accepts many SQL standard type names for compatibility:

| Type | Stores | Use for |
|------|--------|---------|
| \`INTEGER\` | Whole numbers (-2⁶³ to 2⁶³-1) | IDs, counts, ages |
| \`REAL\` | Floating-point decimals | Prices, measurements, averages |
| \`TEXT\` | Strings (any length) | Names, descriptions, emails |
| \`BLOB\` | Binary data (bytes) | Images, files, encrypted data |
| \`NULL\` | Missing value | Unknown / empty |

**Dates & times:** SQLite has no native DATE type. Store them as:
- ISO8601 string → TEXT — \`'2024-01-15'\`
- Unix timestamp → INTEGER — \`1705276800\`
- Julian day → REAL — \`2460423.5\`

SQLite date functions (\`date()\`, \`datetime()\`, \`strftime()\`) work with all three.

**VARCHAR(n) and other fake types:** SQLite accepts \`VARCHAR(255)\`, \`CHAR(20)\`, \`INT(10)\` — but **ignores the size limit**. They all map to the underlying storage class. No truncation or padding occurs. This is for compatibility with other databases. To enforce length, use a CHECK constraint.

**Type affinity:** SQLite is weakly typed. Unlike PostgreSQL or MySQL, it does **not** enforce column types. You can insert an integer into a TEXT column and SQLite accepts it. For CashPal's financial data, always use the correct type — just know SQLite won't stop you if you don't.

**Goal:** match SQLite types to their use cases.`,
    questions: [
      {
        prompt: 'What happens if you declare VARCHAR(10) and insert a 20-character string in SQLite?',
        options: ['The string is truncated to 10', 'An error is thrown', 'The full 20 characters are stored', 'The column is rejected'],
        answer: 2,
        explanation: 'SQLite ignores VARCHAR size limits. The full string is stored with no truncation.',
      },
      {
        prompt: 'Can you insert an integer (42) into a TEXT column in SQLite?',
        options: ['No, it will be rejected', 'Yes, SQLite is weakly typed', 'It depends on the column definition', 'Only if the column is NULL'],
        answer: 1,
        explanation: 'SQLite is weakly typed — it does not enforce column types.',
      },
      {
        prompt: 'Which type stores image data?',
        options: ['TEXT', 'INTEGER', 'REAL', 'BLOB'],
        answer: 3,
        explanation: 'BLOB is for binary data like images.',
      },
      {
        prompt: 'How do you store a date in SQLite?',
        options: ['Use the DATE type', 'As TEXT, INTEGER, or REAL', 'Dates are not supported', 'Use the DATETIME type'],
        answer: 1,
        explanation: 'SQLite has no native DATE type. Store dates as TEXT, INTEGER, or REAL.',
      },
    ],
    seed: SEED_USERS,
  },
  {
    id: '06-design-table',
    module: 2,
    title: 'Design a Table',
    type: 'practice',
    file: '06-design-table.sql',
    seed: SEED_EMPTY,
    markdown: `# Design a Table

CashPal's HR team needs an \`employees\` table. You choose the right SQLite type for each column based on what you learned.

**Your task:** Create the \`employees\` table with these columns:

- [ ] \`id\` — unique number for each employee
- [ ] \`name\` — employee name
- [ ] \`email\` — email address
- [ ] \`salary\` — salary with decimals
- [ ] \`photo\` — optional profile picture
- [ ] \`department\` — which team they're in`,
    check: { type: 'schema', table: 'employees', columns: ['id', 'name', 'email', 'salary', 'photo', 'department'] },
    hint: 'Think about what each column stores. id → INTEGER PK, name/email/department → TEXT, salary → REAL, photo → BLOB',
    sql: 'CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, email TEXT, salary REAL, photo BLOB, department TEXT);\n',
    checklist: [
      'Column id with correct type and PK',
      'Column name with correct type',
      'Column email with correct type',
      'Column salary with correct type',
      'Column photo with correct type',
      'Column department with correct type',
    ],
  },
  {
    id: '07-select',
    module: 2,
    title: 'SELECT Intro',
    type: 'practice',
    file: '07-select.sql',
    seed: SEED_USERS,
    markdown: `# SELECT Intro

CashPal's user data is ready. Let's read it.

The \`SELECT\` statement reads data from tables:

\`\`\`sql
SELECT * FROM users;
\`\`\`

\`*\` means "all columns". Pick specific columns:

\`\`\`sql
SELECT name, age FROM users;
\`\`\`

**Goal:** Write \`SELECT * FROM users;\` to see all CashPal users.`,
    sql: 'SELECT * FROM users;\n',
    check: { type: 'result', expectedSql: 'SELECT * FROM users;' },
  },
  {
    id: '08-calc',
    module: 2,
    title: 'Basic Calculations',
    type: 'practice',
    file: '08-calc.sql',
    seed: SEED_EMPTY,
    markdown: `# Basic Calculations

SQL can do math without a table:

\`\`\`sql
SELECT 2 + 2;
SELECT 10 * 5;
SELECT 'Hello' || ' ' || 'World';
\`\`\`

The \`||\` operator concatenates strings. No \`FROM\` needed for expressions.

CashPal's finance team needs to calculate transaction fees. Start simple.

**Goal:** Write a query that returns 100 divided by 4.`,
    sql: 'SELECT 100 / 4;\n',
    check: { type: 'result', expectedSql: 'SELECT 100 / 4;' },
  },
];
