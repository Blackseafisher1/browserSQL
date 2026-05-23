import { SEED_USERS, SEED_EMPTY } from './seeds.js';

export const module1 = [
  {
    id: '01-intro',
    module: 1,
    title: 'What is a Database?',
    type: 'theory',
    file: '01-intro.md',
    markdown: `# What is a database?

A database stores information in tables. Tables have rows and columns.

**Goal:** understand where data lives before writing SQL.

> **Editor features:** The left panel shows files — add \`.md\` or \`.txt\` files here for notes. The **Schema viewer** (bottom-left) lists all tables; expand one to see columns, types, and constraints. Click any table name to auto-run \`SELECT * FROM table LIMIT 100\`. You can download all your work as a \`.zip\` with the export button.`,
    question: {
      prompt: 'What stores data in rows and columns?',
      options: ['Index', 'Query', 'Table', 'View'],
      answer: 2,
      explanation: 'A table is the structure that holds rows and columns.',
    },
    seed: SEED_USERS,
  },
  {
    id: '02-nosql',
    module: 1,
    title: 'SQL vs NoSQL',
    type: 'theory',
    file: '02-nosql.md',
    markdown: `# SQL vs NoSQL

SQL databases use tables and a structured schema. NoSQL systems can be document, key-value, or graph based.

**Goal:** know which keyword creates tables in SQL.`,
    question: {
      prompt: 'Which SQL keyword creates a table?',
      options: ['CREATE TABLE', 'ALTER', 'INSERT', 'UPDATE'],
      answer: 0,
      explanation: '`CREATE TABLE` defines a new table.',
    },
    seed: SEED_USERS,
  },
  {
    id: '03-comments',
    module: 1,
    title: 'Comments in SQL',
    type: 'theory',
    file: '03-comments.md',
    markdown: `# Comments in SQL

Comments make your SQL readable. They are ignored when the query runs:

\`\`\`sql
-- Single line comment
SELECT * FROM users; -- inline comment

/*
Multi-line
comment
*/
\`\`\`

**Goal:** know both comment styles.`,
    question: {
      prompt: 'Which symbol starts a single-line comment in SQL?',
      options: ['//', '--', '#', '/*'],
      answer: 1,
      explanation: '-- starts a single line comment. The rest of that line is ignored.',
    },
    seed: SEED_USERS,
  },
  {
    id: '04-create',
    module: 1,
    title: 'Creating Tables',
    type: 'practice',
    file: '04-create.sql',
    sql: 'CREATE TABLE people (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  age INTEGER NOT NULL\n);\n',
    markdown: `# Creating tables

Use \`CREATE TABLE\` to define a new table. Specify column names, data types, and constraints.

Basic syntax:

\`\`\`sql
CREATE TABLE tablename (
  column1 TYPE CONSTRAINTS,
  column2 TYPE CONSTRAINTS
);
\`\`\`

**Goal:** Create a table called \`people\` with columns \`id\` (INTEGER PRIMARY KEY), \`name\` (TEXT NOT NULL), and \`age\` (INTEGER NOT NULL).

**Tip:** After running, open the **Schema viewer** (bottom-left panel) and expand \`people\` to see its columns and types.`,
    seed: SEED_EMPTY,
    check: { type: 'schema', table: 'people', columns: ['id', 'name', 'age'] },
  },
  {
    id: '05-types',
    module: 1,
    title: 'Data Types Deep Dive',
    type: 'theory',
    file: '05-types.md',
    markdown: `# Data types

SQLite has 5 native storage classes, but accepts many SQL standard type names for compatibility:

| Type | Stores | Use for |
|------|--------|---------|
| \`INTEGER\` | Whole numbers (-2⁶³ to 2⁶³-1) | IDs, counts, ages |
| \`REAL\` | Floating-point decimals | Prices, measurements, averages |
| \`TEXT\` | Strings (any length) | Names, descriptions, emails |
| \`BLOB\` | Binary data (bytes) | Images, files, encrypted data |
| \`NULL\` | Missing value | Unknown / empty |

**Dates & times:** SQLite has no native DATE type. Store them in one of these formats:

| Format | Stored as | Example |
|--------|-----------|---------|
| ISO8601 string | TEXT | '2024-01-15' |
| Unix timestamp | INTEGER | 1705276800 |
| Julian day | REAL | 2460423.5 |

SQLite date functions (\`date()\`, \`datetime()\`, \`strftime()\`) work with all three formats.

**SQLite is weakly typed.** Unlike PostgreSQL, MySQL, or Oracle, SQLite does **not** enforce column types. You can insert an integer into a TEXT column, or text into an INTEGER column, and SQLite accepts it:

\`\`\`sql
CREATE TABLE t (a TEXT, b INTEGER);
INSERT INTO t VALUES (42, 'hello');  -- works! integer in TEXT, text in INTEGER
\`\`\`

This is by design — SQLite uses **type affinity** (preference, not enforcement). The declared type is a hint, not a rule. Most other databases would reject this with a type mismatch error.

**VARCHAR(n) and other fake types:**
SQLite lets you write \`VARCHAR(255)\`, \`CHAR(20)\`, \`INT(10)\` — but **ignores the size limit**. They all map to the underlying storage class (\`TEXT\` for VARCHAR, \`INTEGER\` for INT). No truncation or padding occurs.

This is because SQLite uses **manifest typing** — values carry their own type, not the column. The declared type is just a hint (affinity), not a rule.

On other databases (PostgreSQL, MySQL, Oracle), \`VARCHAR(32)\` **enforces** the limit:
- Inserting "hello world" (11 chars) works fine
- Inserting a 40-character string is **rejected** or truncated
- Indexes on \`VARCHAR(32)\` are faster and smaller than on unbounded \`TEXT\` because the DB knows the max width
- Useful for: usernames, emails, phone numbers, ZIP codes — anything with a known max length

**BLOB** is for binary data: images, PDFs, encrypted values, serialized objects. Not human-readable in queries, but can store anything.

**Can you enforce length in SQLite?** Yes — use a \`CHECK\` constraint: \`name TEXT CHECK(length(name) <= 32)\`. This is covered in the Constraints lesson (Module 2).

**Goal:** match SQLite types to their use cases.`,
    questions: [
      {
        prompt: 'What happens if you declare VARCHAR(10) and insert a 20-character string in SQLite?',
        options: ['The string is truncated to 10', 'An error is thrown', 'The full 20 characters are stored', 'The column is rejected'],
        answer: 2,
        explanation: 'SQLite ignores VARCHAR size limits. The full string is stored as TEXT with no truncation.',
      },
      {
        prompt: 'Can you insert an integer (42) into a TEXT column in SQLite?',
        options: ['No, it will be rejected', 'Yes, SQLite is weakly typed', 'It depends on the column definition', 'Only if the column is NULL'],
        answer: 1,
        explanation: 'SQLite is weakly typed — it does not enforce column types. An integer can go into a TEXT column.',
      },
      {
        prompt: 'Which type would you use for a column storing image data?',
        options: ['TEXT', 'INTEGER', 'REAL', 'BLOB'],
        answer: 3,
        explanation: 'BLOB is for binary data like images, PDFs, or any file content.',
      },
      {
        prompt: 'How do you store a date in SQLite?',
        options: ['Use the DATE type', 'As TEXT, INTEGER, or REAL', 'Dates are not supported', 'Use the DATETIME type'],
        answer: 1,
        explanation: 'SQLite has no native DATE type. Store dates as TEXT (ISO8601), INTEGER (Unix timestamp), or REAL (Julian day).',
      },
    ],
    seed: SEED_USERS,
  },
  {
    id: '06-design-table',
    module: 1,
    title: 'Design a Table',
    type: 'practice',
    file: '06-design-table.sql',
    seed: SEED_EMPTY,
    markdown: `# Design a table

Create a table called \`employees\` with these columns:

- \`id\` — a unique number for each employee (PRIMARY KEY)
- \`name\` — employee name
- \`email\` — email address
- \`salary\` — salary with decimals
- \`photo\` — optional profile picture file
- \`department\` — text

Choose the right SQLite type for each column. Only \`PRIMARY KEY\` is required as a constraint.

**Goal:** Write the \`CREATE TABLE employees\` statement with all 6 columns using correct types.`,
    check: { type: 'schema', table: 'employees', columns: ['id', 'name', 'email', 'salary', 'photo', 'department'] },
    hint: 'CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, email TEXT, salary REAL, photo BLOB, department TEXT);',
    hint: 'CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, salary REAL NOT NULL, photo BLOB, department TEXT NOT NULL DEFAULT \'Engineering\');',
  },
  {
    id: '07-select',
    module: 1,
    title: 'SELECT Intro',
    type: 'practice',
    file: '07-select.sql',
    seed: SEED_USERS,
    markdown: `# SELECT Intro

The \`SELECT\` statement reads data from tables.

\`\`\`sql
SELECT * FROM users;
\`\`\`

\`*\` means "all columns". Pick specific columns:

\`\`\`sql
SELECT name, age FROM users;
\`\`\`

You can prefix columns with the table name — important for later:

\`\`\`sql
SELECT users.name, users.age FROM users;
\`\`\`

SELECT does not modify data — it only reads.

**Goal:** Write \`SELECT * FROM users;\` to see all users.

**Tip:** In the **Schema viewer** (bottom-left), click any table name to auto-generate \`SELECT * FROM table LIMIT 100;\`. Try it on \`users\`.`,
    check: { type: 'result', expectedSql: 'SELECT * FROM users;' },
  },
  {
    id: '08-calc',
    module: 1,
    title: 'Basic Calculations',
    type: 'practice',
    file: '08-calc.sql',
    seed: SEED_EMPTY,
    markdown: `# Basic Calculations

SQL can do math and string operations without a table:

\`\`\`sql
SELECT 2 + 2;
SELECT 10 * 5;
SELECT 'Hello' || ' ' || 'World';
\`\`\`

The \`||\` operator concatenates strings.

**Goal:** Write a query that returns 100 divided by 4.`,
    check: { type: 'result', expectedSql: 'SELECT 100 / 4;' },
  },
];
