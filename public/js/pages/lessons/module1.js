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
    file: '02-nosql.md',
    markdown: `# SQL vs NoSQL

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

**Goal:** Create a table called \`people\` with columns \`id\` (INTEGER PRIMARY KEY), \`name\` (TEXT NOT NULL), and \`age\` (INTEGER NOT NULL).`,
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

**VARCHAR(n) and other fake types:**
SQLite lets you write \`VARCHAR(255)\`, \`CHAR(20)\`, \`INT(10)\` — but **ignores the size limit**. They all map to the underlying storage class (\`TEXT\` for VARCHAR, \`INTEGER\` for INT). No truncation or padding occurs.

This is because SQLite uses **manifest typing** — values carry their own type, not the column. The declared type is just a hint (affinity), not a rule.

On other databases (PostgreSQL, MySQL, Oracle), \`VARCHAR(32)\` **enforces** the limit:
- Inserting "hello world" (11 chars) works fine
- Inserting a 40-character string is **rejected** or truncated
- Indexes on \`VARCHAR(32)\` are faster and smaller than on unbounded \`TEXT\` because the DB knows the max width
- Useful for: usernames, emails, phone numbers, ZIP codes — anything with a known max length

**BLOB** is for binary data: images, PDFs, encrypted values, serialized objects. Not human-readable in queries, but can store anything.

**Goal:** match SQLite types to their use cases.`,
    question: {
      prompt: 'What happens if you declare VARCHAR(10) and insert a 20-character string in SQLite?',
      options: ['The string is truncated to 10', 'An error is thrown', 'The full 20 characters are stored', 'The column is rejected'],
      answer: 2,
      explanation: 'SQLite ignores VARCHAR size limits. The full string is stored as TEXT with no truncation.',
    },
    seed: SEED_USERS,
  },
  {
    id: '06-calc',
    module: 1,
    title: 'Basic Calculations',
    type: 'practice',
    file: '06-calc.sql',
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
