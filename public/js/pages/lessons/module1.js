import { SEED_USERS, SEED_EMPTY } from './seeds.js';

export const module1 = [
  {
    id: '01-intro',
    module: 1,
    title: 'What is a Database?',
    type: 'theory',
    file: '01-intro.md',
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
    file: '02-nosql.md',
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
    id: '03-comments',
    module: 1,
    title: 'Comments in SQL',
    type: 'theory',
    file: '03-comments.md',
    markdown: `# 3. Comments in SQL

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
    markdown: `# 4. Creating tables

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
];
