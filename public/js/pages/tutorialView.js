import { $ } from '../utils.js';
import { state } from '../state.js';
import { renderMarkdown } from './marker.js';
import { loadTutorialDatabase, openLastDB, saveCurrentToLocal } from './dbManager.js';
import { ensureDefaultFiles, getActiveFileName, getFiles, openSingleFile, replaceFiles, renderTree, saveCurrentFile, switchFile } from './filesView.js';
import { getSettings } from './settings.js';

const ACTIVE_KEY = 'browsersql-tutorial-active';
const STEP_KEY = 'browsersql-tutorial-step';
const COMPLETE_KEY = 'browsersql-tutorial-complete';
const TUTORIAL_DB_NAME = 'browsersql-tutorial';

const MODULE_NAMES = {
  1: 'Database Fundamentals',
  2: 'Schema & Constraints',
  3: 'CRUD Operations',
  4: 'Query Power Tools',
  5: 'Joins',
  6: 'Subqueries & CTEs',
  7: 'Normalization',
  8: 'Indexes & Performance',
  9: 'Transactions',
  10: 'Advanced Topics',
};

let currentModule = 1;

function getModuleIndices(module) {
  const indices = [];
  for (let i = 0; i < lessons.length; i++) {
    if (lessons[i].module === module) indices.push(i);
  }
  return indices;
}

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

const SEED_USERS_EXT = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT
);
INSERT INTO users VALUES
  (1, 'Ava', 'Berlin', 28, 'ava@example.com'),
  (2, 'Noah', 'Hamburg', 22, NULL),
  (3, 'Mia', 'Munich', 31, 'mia@example.com'),
  (4, 'Liam', 'Cologne', 19, NULL),
  (5, 'Zoe', 'Berlin', 26, 'zoe@example.com'),
  (6, 'Eli', 'Berlin', 35, 'eli@example.com'),
  (7, 'Ivy', 'Munich', 24, NULL),
  (8, 'Jay', 'Hamburg', 29, 'jay@example.com');
`;

const SEED_SHOP = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  item TEXT NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
INSERT INTO customers VALUES
  (1, 'Ava', 'Berlin'),
  (2, 'Noah', 'Hamburg'),
  (3, 'Mia', 'Munich'),
  (4, 'Leo', 'Leipzig');
INSERT INTO orders VALUES
  (1, 1, 'Laptop', 1200),
  (2, 1, 'Mouse', 25),
  (3, 2, 'Keyboard', 80),
  (4, 3, 'Monitor', 350),
  (5, 1, 'Desk', 450);
`;

const SEED_SHOP_EXT = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
INSERT INTO customers VALUES
  (1, 'Ava'),
  (2, 'Noah'),
  (3, 'Mia');
INSERT INTO products VALUES
  (1, 'Laptop', 1200),
  (2, 'Mouse', 25),
  (3, 'Keyboard', 80),
  (4, 'Monitor', 350),
  (5, 'Desk', 450);
INSERT INTO orders VALUES
  (1, 1, 1, 1),
  (2, 1, 2, 2),
  (3, 2, 3, 1),
  (4, 3, 4, 1),
  (5, 1, 5, 1);
`;

const SEED_EMPLOYEES = `
PRAGMA foreign_keys = ON;
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id)
);
INSERT INTO employees VALUES
  (1, 'Zara', NULL),
  (2, 'Ben', 1),
  (3, 'Chris', 1),
  (4, 'Diana', 2),
  (5, 'Evan', 2),
  (6, 'Finn', 3);
`;

const SEED_NORMALIZE = `
CREATE TABLE orders_denorm (
  id INTEGER PRIMARY KEY,
  customer TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  product TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL
);
INSERT INTO orders_denorm VALUES
  (1, 'Ava', 'Berlin', 'Laptop', 1200, 'Electronics'),
  (2, 'Ava', 'Berlin', 'Mouse', 25, 'Accessories'),
  (3, 'Noah', 'Hamburg', 'Keyboard', 80, 'Accessories'),
  (4, 'Mia', 'Munich', 'Monitor', 350, 'Electronics'),
  (5, 'Ava', 'Berlin', 'Desk', 450, 'Furniture');
`;

const SEED_INVENTORY = `
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
);
INSERT INTO products VALUES
  (1, 'Laptop', 'Electronics', 1200, 10),
  (2, 'Mouse', 'Accessories', 25, 100),
  (3, 'Keyboard', 'Accessories', 80, 50),
  (4, 'Monitor', 'Electronics', 350, 30),
  (5, 'Desk', 'Furniture', 450, 15),
  (6, 'Chair', 'Furniture', 200, 25),
  (7, 'Tablet', 'Electronics', 500, 20),
  (8, 'Headphones', 'Accessories', 60, 75),
  (9, 'Lamp', 'Furniture', 40, 60),
  (10, 'Printer', 'Electronics', 180, 12);
`;

const SEED_DATES = `
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  event_date TEXT NOT NULL
);
INSERT INTO events VALUES
  (1, 'Product launch', '2025-01-15'),
  (2, 'Team meeting', '2025-02-20'),
  (3, 'Conference', '2025-03-10'),
  (4, 'Workshop', '2025-01-25'),
  (5, 'Review', '2025-03-01');
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
    id: '11-attach',
    module: 3,
    title: 'Your First Database',
    type: 'practice',
    file: '03-attach.sql',
    sql: 'SELECT name FROM sqlite_master WHERE type = \'table\';\n',
    markdown: `# 3. Your first database

Use \`SELECT\` to read data from a table:

\`\`\`sql
SELECT column1, column2 FROM tablename;
\`\`\`

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
  {
    id: '06-primary',
    module: 2,
    title: 'Primary Keys',
    type: 'practice',
    file: '06-primary.sql',
    sql: 'CREATE TABLE projects (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL\n);\nINSERT INTO projects (name) VALUES (\'Apollo\');\n',
    markdown: `# 6. Primary keys

A \`PRIMARY KEY\` uniquely identifies each row. Use \`INTEGER PRIMARY KEY AUTOINCREMENT\` to have SQLite automatically assign increasing IDs.

\`\`\`sql
CREATE TABLE tablename (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  column TYPE
);
\`\`\`

**Goal:** Create a table called \`projects\` with an auto-incrementing \`id\` primary key and a \`name\` column (TEXT NOT NULL). Then insert a project row.`,
    seed: SEED_EMPTY,
    check: { type: 'pk', table: 'projects', column: 'id' },
  },
  {
    id: '07-foreign',
    module: 2,
    title: 'Foreign Keys',
    type: 'practice',
    file: '07-foreign.sql',
    sql: 'PRAGMA foreign_keys = ON;\nCREATE TABLE authors (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE books (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  author_id INTEGER NOT NULL,\n  FOREIGN KEY (author_id) REFERENCES authors(id)\n);\n',
    markdown: `# 7. Foreign keys

A \`FOREIGN KEY\` links rows across tables. It references a \`PRIMARY KEY\` in another table.

First enable foreign keys with \`PRAGMA foreign_keys = ON;\`

Syntax:

\`\`\`sql
FOREIGN KEY (local_column) REFERENCES other_table(other_column);
\`\`\`

**Goal:** Create an \`authors\` table (id, name) and a \`books\` table (id, title, author_id) where \`author_id\` references \`authors(id)\`.`,
    seed: SEED_EMPTY_FK,
    check: { type: 'fk', table: 'books', column: 'author_id' },
  },
  {
    id: '08-constraints',
    module: 2,
    title: 'Constraints',
    type: 'practice',
    file: '08-constraints.sql',
    sql: "CREATE TABLE accounts (\n  id INTEGER PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE,\n  status TEXT NOT NULL DEFAULT 'active',\n  age INTEGER CHECK (age >= 18)\n);\nINSERT INTO accounts (email, age) VALUES ('test@example.com', 25);\n",
    markdown: `# 8. Constraints

Constraints enforce rules on your data:

\`\`\`sql
CREATE TABLE table (
  col1 TYPE CONSTRAINT,
  col2 TYPE CONSTRAINT
);
\`\`\`

Constraint types:

| Constraint | What it does | Example |
|---|---|---|
| \`NOT NULL\` | column must have a value | \`name TEXT NOT NULL\` |
| \`UNIQUE\` | all values must be different | \`email TEXT UNIQUE\` |
| \`DEFAULT\` | fallback value if omitted | \`status TEXT DEFAULT 'active'\` |
| \`CHECK\` | validate against a condition | \`age INTEGER CHECK (age >= 18)\` |

\`CHECK\` can use comparisons (\`=\`, \`>\`, \`>=\`, \`LIKE\`, \`IN\`, etc.):

\`\`\`sql
CHECK (age >= 18)
CHECK (status IN ('active', 'inactive'))
CHECK (email LIKE '%@%')
CHECK (price > 0)
\`\`\`

**Important:** \`PRIMARY KEY\` already implies \`NOT NULL\` + \`UNIQUE\` automatically — do NOT add them to the PK column. Put them on other columns instead.

**Goal:** Create an \`accounts\` table with:
- \`id\` (INTEGER PRIMARY KEY)
- \`email\` (TEXT, NOT NULL, UNIQUE)
- \`status\` (TEXT, NOT NULL, DEFAULT 'active')
- \`age\` (INTEGER, CHECK that age >= 18)

Then insert one valid row. After that, try inserting a row where age < 18 — you should get a CHECK constraint error. Try inserting a duplicate email — you should get a UNIQUE constraint error.`,
    seed: SEED_EMPTY,
    check: { type: 'constraints', table: 'accounts', tokens: ['not null', 'unique', 'default', 'check'] },
    hint: 'CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT \'active\', age INTEGER CHECK (age >= 18)); then INSERT a row with valid data.',
  },
  {
    id: '09-schema',
    module: 2,
    title: 'Schema Design',
    type: 'theory',
    file: '09-schema.md',
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
    file: '10-select.sql',
    sql: 'SELECT * FROM users;\n',
    markdown: `# 10. Reading data

Use \`SELECT\` to read data from a table:

\`\`\`sql
SELECT column1, column2 FROM tablename;
\`\`\`

Use \`*\` as shorthand for all columns.

Different tables can have columns with the same name (e.g., both \`users\` and \`orders\` might have \`id\`). Prefix with the table name to remove ambiguity:

\`\`\`sql
SELECT users.name, orders.total FROM users, orders;
\`\`\`

You can also rename tables or columns with \`AS\` (alias):

\`\`\`sql
SELECT u.name AS username FROM users AS u;
\`\`\`

The \`AS\` keyword is optional: \`SELECT u.name FROM users u\`.

**Goal:** Write a query that returns all rows and all columns from the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT * FROM users;' },
  },
  {
    id: '11-where',
    module: 3,
    title: 'Filtering',
    type: 'practice',
    file: '11-where.sql',
    sql: "SELECT name FROM users WHERE city = 'Berlin';\n",
    markdown: `# 11. Filtering

The \`WHERE\` clause filters rows based on a condition.

\`\`\`sql
SELECT columns FROM table WHERE condition;
\`\`\`

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
    file: '12-advanced-where.sql',
    sql: "SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;\n",
    markdown: `# 12. Advanced filtering

Combine multiple operators for precise filtering:

\`\`\`sql
SELECT columns FROM table
WHERE column IN (value1, value2)
  AND column BETWEEN x AND y
  AND column NOT IN (value)
ORDER BY column;
\`\`\`

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
    id: '16-null',
    module: 3,
    title: 'Working with NULL',
    type: 'practice',
    file: '13-null.sql',
    sql: 'SELECT name FROM users WHERE email IS NULL;\n',
    markdown: `# 13. Working with NULL

\`NULL\` represents missing or unknown data. You cannot use \`= NULL\` — instead use \`IS NULL\` or \`IS NOT NULL\`.

\`\`\`sql
SELECT columns FROM table WHERE column IS NULL;
SELECT columns FROM table WHERE column IS NOT NULL;
\`\`\`

Use \`COALESCE(val, default)\` or \`IFNULL(val, default)\` to replace \`NULL\` with a fallback:

\`\`\`sql
SELECT name, COALESCE(email, 'no email') FROM users;
\`\`\`

**Goal:** Write a query that returns the names of users who do not have an email address.`,
    seed: SEED_USERS_NULL,
    check: { type: 'result', expectedSql: 'SELECT name FROM users WHERE email IS NULL;' },
    hint: 'Use WHERE email IS NULL — not = NULL.',
  },
  {
    id: '14-like',
    module: 3,
    title: 'Pattern Matching',
    type: 'practice',
    file: '14-like.sql',
    sql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;\n",
    markdown: `# 14. Pattern matching

\`LIKE\` enables pattern matching with wildcards:
- \`%\` — matches any sequence of characters
- \`_\` — matches exactly one character

\`\`\`sql
SELECT columns FROM table WHERE column LIKE pattern;
\`\`\`

**Goal:** Write a query that returns names containing the letter 'a', sorted alphabetically.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;" },
  },
  {
    id: '15-insert',
    module: 3,
    title: 'Inserting Data',
    type: 'practice',
    file: '15-insert.sql',
    sql: "INSERT INTO users (name, city, age, email) VALUES ('Kai', 'Berlin', 27, 'kai@example.com');\n",
    markdown: `# 15. Inserting data

Use \`INSERT\` to add rows to a table.

\`\`\`sql
INSERT INTO tablename (col1, col2, ...) VALUES (val1, val2, ...);
\`\`\`

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
    file: '16-update.sql',
    sql: "UPDATE users SET city = 'Bremen' WHERE name = 'Mia';\n",
    markdown: `# 16. Updating data

Use \`UPDATE\` to modify existing rows.

\`\`\`sql
UPDATE tablename SET column = value WHERE condition;
\`\`\`

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
    file: '17-delete.sql',
    sql: "DELETE FROM users WHERE name = 'Liam';\n",
    markdown: `# 17. Deleting data

Use \`DELETE\` to remove rows.

\`\`\`sql
DELETE FROM tablename WHERE condition;
\`\`\`

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
    file: '18-delete-danger.md',
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
  // ── Module 4: Query Power Tools ─────────────────────────────────────────
  {
    id: '19-sort',
    module: 4,
    title: 'Sorting',
    type: 'practice',
    file: '19-sort.sql',
    markdown: `# 19. Sorting

Use \`ORDER BY\` to sort results:

\`\`\`sql
SELECT columns FROM table ORDER BY column;
\`\`\`

Use \`ASC\` for ascending (default) or \`DESC\` for descending. Sort by multiple columns with commas.

**Goal:** Write a query that returns \`name\` and \`age\` from \`users\`, sorted by age from youngest to oldest.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name, age FROM users ORDER BY age;' },
  },
  {
    id: '20-limit',
    module: 4,
    title: 'Limiting Results',
    type: 'practice',
    file: '20-limit.sql',
    markdown: `# 20. Limiting results

Use \`LIMIT\` to restrict how many rows are returned:

\`\`\`sql
SELECT columns FROM table LIMIT count;
SELECT columns FROM table LIMIT count OFFSET skip;
\`\`\`

**Goal:** Write a query that returns the names of the 3 oldest users, sorted oldest first.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name FROM users ORDER BY age DESC LIMIT 3;' },
  },
  {
    id: '21-aggregates',
    module: 4,
    title: 'Aggregate Functions',
    type: 'practice',
    file: '21-aggregates.sql',
    markdown: `# 21. Aggregate functions

Aggregate functions summarize many rows into one value:

\`\`\`sql
SELECT COUNT(*), AVG(column), SUM(column), MIN(column), MAX(column) FROM table;
\`\`\`

- \`COUNT(*)\` — number of rows
- \`AVG(col)\` — average value
- \`SUM(col)\` — total
- \`MIN(col)\` / \`MAX(col)\` — smallest / largest

Combine with \`ROUND()\` to control decimal places: \`ROUND(AVG(age), 2)\`

**Goal:** Write a query that returns the total number of users and their average age rounded to 2 decimals. Use \`COUNT(*)\` and \`ROUND(AVG(age), 2)\`.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;' },
    hint: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;',
  },
  {
    id: '22-group',
    module: 4,
    title: 'Grouping',
    type: 'practice',
    file: '22-group.sql',
    markdown: `# 22. Grouping

\`GROUP BY\` groups rows that share a value, so aggregate functions work per group:

\`\`\`sql
SELECT column, COUNT(*) FROM table GROUP BY column;
\`\`\`

Use \`HAVING\` to filter groups (like \`WHERE\` but for groups):

\`\`\`sql
SELECT column, COUNT(*) FROM table GROUP BY column HAVING COUNT(*) > 1;
\`\`\`

**Goal:** Write a query that counts how many users live in each city. Show only cities with at least 2 users, sorted alphabetically.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;' },
    hint: 'GROUP BY city, then HAVING COUNT(*) >= 2',
  },
  {
    id: '23-distinct',
    module: 4,
    title: 'Distinct Values',
    type: 'practice',
    file: '23-distinct.sql',
    markdown: `# 23. Distinct values

\`DISTINCT\` removes duplicate values from results:

\`\`\`sql
SELECT DISTINCT column FROM table;
\`\`\`

**Goal:** Write a query that returns all unique cities from the \`users\` table, without duplicates.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT DISTINCT city FROM users;' },
  },
  {
    id: '24-alias',
    module: 4,
    title: 'Aliases',
    type: 'practice',
    file: '24-alias.sql',
    markdown: `# 24. Aliases

\`AS\` renames columns or tables in query results:

\`\`\`sql
SELECT column AS alias_name FROM table AS table_alias;
\`\`\`

The \`AS\` keyword is optional: \`SELECT column alias FROM table t\`.

**Goal:** Write a query that returns \`name\` renamed to \`user_name\` and \`age\` renamed to \`user_age\` from the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name AS user_name, age AS user_age FROM users;' },
  },
  // ── Module 5: Joins ─────────────────────────────────────────────────────
  {
    id: '25-inner-join',
    module: 5,
    title: 'INNER JOIN',
    type: 'practice',
    file: '25-inner-join.sql',
    markdown: `# 25. INNER JOIN

\`INNER JOIN\` combines rows from two tables where a condition matches:

\`\`\`sql
SELECT a.col, b.col FROM table_a
INNER JOIN table_b ON a.id = b.foreign_id;
\`\`\`

Only rows with matches in both tables appear.

**Goal:** Write a query that shows each customer name alongside their order item. Use \`INNER JOIN\` on \`customers.id = orders.customer_id\`.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;' },
  },
  {
    id: '26-left-join',
    module: 5,
    title: 'LEFT JOIN',
    type: 'practice',
    file: '26-left-join.sql',
    markdown: `# 26. LEFT JOIN

\`LEFT JOIN\` keeps ALL rows from the left table, even without matches. Unmatched right columns show \`NULL\`:

\`\`\`sql
SELECT a.col, b.col FROM table_a
LEFT JOIN table_b ON a.id = b.foreign_id;
\`\`\`

**Goal:** Write a query that shows ALL customers and their order items. Customers without orders should still appear (item shows NULL).`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;' },
  },
  {
    id: '27-right-join',
    module: 5,
    title: 'RIGHT JOIN (Theory)',
    type: 'theory',
    file: '27-right-join.md',
    markdown: `# 27. RIGHT JOIN

\`RIGHT JOIN\` keeps ALL rows from the right table. SQLite does not support it — use \`LEFT JOIN\` and swap the tables.

**Goal:** know how to simulate RIGHT JOIN.`,
    question: {
      prompt: 'How do you simulate RIGHT JOIN in SQLite?',
      options: ['Use RIGHT JOIN anyway', 'Swap tables and use LEFT JOIN', 'Use INNER JOIN', 'Use CROSS JOIN'],
      answer: 1,
      explanation: 'Swap the table order and use LEFT JOIN to get the same effect.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '28-full-join',
    module: 5,
    title: 'FULL OUTER JOIN (Theory)',
    type: 'theory',
    file: '28-full-join.md',
    markdown: `# 28. FULL OUTER JOIN

\`FULL OUTER JOIN\` keeps rows from both sides. Not supported in SQLite — combine LEFT JOIN and RIGHT JOIN with \`UNION\`.

**Goal:** know the concept even if SQLite cannot run it.`,
    question: {
      prompt: 'Which SQL operation combines LEFT JOIN and RIGHT JOIN results?',
      options: ['UNION', 'INTERSECT', 'EXCEPT', 'CROSS JOIN'],
      answer: 0,
      explanation: 'UNION combines the results of LEFT JOIN and RIGHT JOIN to simulate FULL OUTER JOIN.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '29-self-join',
    module: 5,
    title: 'Self Joins',
    type: 'practice',
    file: '29-self-join.sql',
    markdown: `# 29. Self joins

A self join joins a table to itself. Use different aliases to tell them apart:

\`\`\`sql
SELECT a.col, b.col FROM table AS a
INNER JOIN table AS b ON a.id = b.ref_id;
\`\`\`

The \`employees\` table has \`manager_id\` referencing \`id\` in the same table.

**Goal:** Write a query that shows each employee name alongside their manager name. Use \`LEFT JOIN\` so top-level employees (no manager) still appear.`,
    seed: SEED_EMPLOYEES,
    check: { type: 'result', expectedSql: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;' },
  },
  {
    id: '30-multi-join',
    module: 5,
    title: 'Joining Multiple Tables',
    type: 'practice',
    file: '30-multi-join.sql',
    markdown: `# 30. Joining multiple tables

Chain multiple \`JOIN\` clauses to combine three or more tables:

\`\`\`sql
SELECT a.col, b.col, c.col
FROM table_a a
INNER JOIN table_b b ON a.id = b.a_id
INNER JOIN table_c c ON b.id = c.b_id;
\`\`\`

**Goal:** Write a query showing each customer name, product name, and order quantity by joining \`customers\`, \`orders\`, and \`products\`.`,
    seed: SEED_SHOP_EXT,
    check: { type: 'result', expectedSql: 'SELECT customers.name, products.name, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;' },
  },
  // ── Module 6: Subqueries & CTEs ─────────────────────────────────────────
  {
    id: '31-subquery-where',
    module: 6,
    title: 'Subquery in WHERE',
    type: 'practice',
    file: '31-subquery-where.sql',
    markdown: `# 31. Subquery in WHERE

A subquery is a query inside another query. Use it in \`WHERE\` with \`IN\`:

\`\`\`sql
SELECT columns FROM table
WHERE id IN (SELECT foreign_id FROM other_table WHERE condition);
\`\`\`

**Goal:** Write a query that returns the names of customers who have placed orders worth more than 100. Use a subquery with \`WHERE id IN\`.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE price > 100);' },
  },
  {
    id: '32-subquery-select',
    module: 6,
    title: 'Subquery in SELECT',
    type: 'practice',
    file: '32-subquery-select.sql',
    markdown: `# 32. Subquery in SELECT

A subquery in \`SELECT\` computes a value for each row. It must return a single value:

\`\`\`sql
SELECT column, (SELECT COUNT(*) FROM other WHERE other.id = main.id) AS alias
FROM table;
\`\`\`

The subquery runs once per row — it references the outer query's values.

**Goal:** Write a query that shows each customer name alongside the number of orders they placed. Use a subquery in SELECT with \`COUNT(*)\`.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count FROM customers;' },
  },
  {
    id: '33-subquery-from',
    module: 6,
    title: 'Subquery in FROM',
    type: 'practice',
    file: '33-subquery-from.sql',
    markdown: `# 33. Subquery in FROM

A subquery in \`FROM\` acts like a temporary table. It must have an alias:

\`\`\`sql
SELECT columns FROM (SELECT ...) AS alias WHERE condition;
\`\`\`

**Goal:** Write a query that finds all expensive items (price > 50) by querying from a subquery that selects all orders. Use \`FROM (SELECT * FROM orders) AS expensive\` and filter with WHERE.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT item, price FROM (SELECT * FROM orders) AS expensive WHERE price > 50;' },
  },
  {
    id: '34-correlated',
    module: 6,
    title: 'Correlated Subqueries',
    type: 'practice',
    file: '34-correlated.sql',
    markdown: `# 34. Correlated subqueries

A correlated subquery references the outer query's values and runs once per outer row:

\`\`\`sql
SELECT columns FROM table_a AS a
WHERE column > (SELECT AVG(column) FROM table_b WHERE b.id = a.id);
\`\`\`

**Goal:** Write a query that returns items from \`orders\` that cost more than the average price across all orders.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT item, price FROM orders WHERE price > (SELECT AVG(price) FROM orders);' },
  },
  {
    id: '35-exists',
    module: 6,
    title: 'EXISTS',
    type: 'practice',
    file: '35-exists.sql',
    markdown: `# 35. EXISTS

\`EXISTS\` checks whether a subquery returns any rows. It is often faster than \`IN\`:

\`\`\`sql
SELECT columns FROM table_a AS a
WHERE EXISTS (SELECT 1 FROM table_b WHERE b.ref_id = a.id);
\`\`\`

**Goal:** Write a query that returns the names of customers who have placed at least one order. Use \`EXISTS\`.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = customers.id);' },
  },
  {
    id: '36-cte',
    module: 6,
    title: 'Common Table Expressions',
    type: 'practice',
    file: '36-cte.sql',
    markdown: `# 36. Common Table Expressions

A CTE (WITH clause) names a subquery for reuse in the main query:

\`\`\`sql
WITH name AS (
  SELECT ... FROM ...
)
SELECT columns FROM name WHERE condition;
\`\`\`

**Goal:** Write a query using a CTE called \`avg_price\` that calculates the average price, then use it to find all items with a price above that average.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'WITH avg_price AS (SELECT AVG(price) AS avg FROM orders) SELECT item, price FROM orders, avg_price WHERE price > avg_price.avg;' },
  },
  {
    id: '37-recursive-cte',
    module: 6,
    title: 'Recursive CTEs (Theory)',
    type: 'theory',
    file: '37-recursive-cte.md',
    markdown: `# 37. Recursive CTEs

Recursive CTEs reference themselves to handle hierarchical data (org charts, trees, graphs). Use \`UNION ALL\` to combine the anchor and recursive steps.

**Goal:** know when recursive CTEs are useful.`,
    question: {
      prompt: 'What kind of data is a recursive CTE best for?',
      options: ['Flat tables', 'Hierarchical data like org charts', 'Single-row results', 'Aggregated data'],
      answer: 1,
      explanation: 'Recursive CTEs excel at querying tree structures like employee hierarchies.',
    },
    seed: SEED_EMPLOYEES,
  },
  // ── Module 7: Normalization ─────────────────────────────────────────────
  {
    id: '38-why-normalize',
    module: 7,
    title: 'Why Normalize?',
    type: 'theory',
    file: '38-why-normalize.md',
    markdown: `# 38. Why normalize?

Normalization reduces data redundancy and prevents anomalies (update, insert, delete). Split data into related tables instead of one big table.

**Goal:** know the main benefit of normalization.`,
    question: {
      prompt: 'What is the main benefit of normalization?',
      options: ['Faster queries', 'Less data redundancy', 'More storage used', 'More columns'],
      answer: 1,
      explanation: 'Normalization eliminates redundant data, preventing inconsistencies.',
    },
    seed: SEED_NORMALIZE,
  },
  {
    id: '39-1nf',
    module: 7,
    title: 'First Normal Form (1NF)',
    type: 'practice',
    file: '39-1nf.sql',
    markdown: `# 39. First Normal Form

A table is in 1NF when:
- Each column has atomic (indivisible) values
- Each row has a primary key
- No repeating groups

The \`orders_denorm\` table repeats customer info per order. Split it into two tables:

\`\`\`sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL);
\`\`\`

**Goal:** Create the \`customers\` and \`orders\` tables as shown above to achieve 1NF.`,
    seed: SEED_NORMALIZE,
    check: { type: 'schema', table: 'customers', columns: ['id', 'name', 'city'] },
  },
  {
    id: '40-2nf',
    module: 7,
    title: 'Second Normal Form (2NF)',
    type: 'practice',
    file: '40-2nf.sql',
    markdown: `# 40. Second Normal Form

A table is in 2NF when:
- It is in 1NF
- Every non-key column depends on the WHOLE primary key (no partial dependency)

The \`orders_denorm\` table has \`product\` depending on \`id\` but \`category\` depends on \`product\`, not the order. Create three tables:

\`\`\`sql
CREATE TABLE customers (...);
CREATE TABLE products (...);
CREATE TABLE orders (...);
\`\`\`

**Goal:** Create \`customers\` (id, name, city), \`products\` (id, name, category), and \`orders\` (id, customer_id, product_id) tables.`,
    seed: SEED_NORMALIZE,
    check: { type: 'schema', table: 'products', columns: ['id', 'name', 'category'] },
  },
  {
    id: '41-3nf',
    module: 7,
    title: 'Third Normal Form (3NF)',
    type: 'practice',
    file: '41-3nf.sql',
    markdown: `# 41. Third Normal Form

A table is in 3NF when:
- It is in 2NF
- No transitive dependency (a non-key column depends on another non-key column)

Here \`customer_city\` depends on \`customer\`, not on the order id. You already split this in 1NF. The \`orders_denorm\` violates 3NF because \`customer_city\` depends on \`customer\`, not the order primary key.

**Goal:** Create \`customers\` (id, name, city) and \`orders\` (id, customer_id, product, price). Make \`customer_id\` a foreign key referencing \`customers(id)\`.`,
    seed: SEED_NORMALIZE,
    check: { type: 'fk', table: 'orders', column: 'customer_id' },
  },
  {
    id: '42-denormalization',
    module: 7,
    title: 'Denormalization',
    type: 'theory',
    file: '42-denormalization.md',
    markdown: `# 42. Denormalization

Denormalization intentionally adds redundancy for read performance. Used in reporting / analytics where writes are rare.

**Goal:** know when to denormalize.`,
    question: {
      prompt: 'When is denormalization useful?',
      options: ['Always', 'When read performance matters more than write efficiency', 'When data must be unique', 'Never'],
      answer: 1,
      explanation: 'Denormalization speeds up reads by reducing joins, at the cost of redundant data.',
    },
    seed: SEED_NORMALIZE,
  },
  // ── Module 8: Indexes & Performance ─────────────────────────────────────
  {
    id: '43-what-index',
    module: 8,
    title: 'What is an Index?',
    type: 'theory',
    file: '43-what-index.md',
    markdown: `# 43. What is an index?

An index is a data structure (B-Tree) that speeds up lookups. Like a book index — instead of scanning every page, jump to the right spot. Trade-off: faster reads, slower writes.

\`PRIMARY KEY\` columns are automatically indexed — and this index is faster than a manual index on a regular column because the B-Tree is built on a unique, non-null key.

**Goal:** know what an index does and that PKs get a free index.`,
    question: {
      prompt: 'Which columns are indexed automatically in SQLite?',
      options: ['All columns', 'PRIMARY KEY columns', 'TEXT columns', 'No columns'],
      answer: 1,
      explanation: 'PRIMARY KEY columns get an automatic B-Tree index, which is faster than a manual index on a non-PK column.',
    },
    seed: SEED_INVENTORY,
  },
  {
    id: '44-create-index',
    module: 8,
    title: 'Creating Indexes',
    type: 'practice',
    file: '44-create-index.sql',
    markdown: `# 44. Creating indexes

Use \`CREATE INDEX\` to add an index:

\`\`\`sql
CREATE INDEX index_name ON table (column);
\`\`\`

Note: \`PRIMARY KEY\` columns are already indexed automatically — they don't need (and can't have) a duplicate manual index. This is for non-PK columns.

**Goal:** Create an index named \`idx_category\` on the \`products\` table for the \`category\` column.`,
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '45-explain-plan',
    module: 8,
    title: 'Query Planning',
    type: 'practice',
    file: '45-explain-plan.sql',
    markdown: `# 45. Query planning

\`EXPLAIN QUERY PLAN\` shows how SQLite executes a query. Use it to see if indexes are used:

\`\`\`sql
EXPLAIN QUERY PLAN SELECT * FROM table WHERE column = value;
\`\`\`

**Goal:** Run \`EXPLAIN QUERY PLAN\` on a query that selects from \`products\` where category is 'Electronics'.`,
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '46-composite-index',
    module: 8,
    title: 'Composite Indexes',
    type: 'practice',
    file: '46-composite-index.sql',
    markdown: `# 46. Composite indexes

A composite index covers multiple columns:

\`\`\`sql
CREATE INDEX index_name ON table (col1, col2);
\`\`\`

The column order matters — leftmost columns first.

**Goal:** Create a composite index named \`idx_cat_price\` on \`products\` covering \`category\` then \`price\`. Then create an index named \`idx_stock\` on \`stock\`.`,
    seed: SEED_INVENTORY,
    check: { type: 'changes', min: 0 },
  },
  {
    id: '47-no-index',
    module: 8,
    title: 'When NOT to Index',
    type: 'theory',
    file: '47-no-index.md',
    markdown: `# 47. When NOT to index

Avoid indexes on:
- Small tables (full scan is fast enough)
- Columns updated frequently (index maintenance cost)
- Columns with few unique values (low selectivity)

**Goal:** know when indexes hurt more than help.`,
    question: {
      prompt: 'Which column is a bad candidate for an index?',
      options: ['A primary key', 'A column with many unique values', 'A column with only two possible values', 'A foreign key'],
      answer: 2,
      explanation: 'Low-selectivity columns (few unique values) make poor indexes since they do not narrow results much.',
    },
    seed: SEED_INVENTORY,
  },
  // ── Module 9: Transactions ─────────────────────────────────────────────
  {
    id: '48-acid',
    module: 9,
    title: 'ACID Properties',
    type: 'theory',
    file: '48-acid.md',
    markdown: `# 48. ACID properties

Transactions guarantee:
- **Atomicity** — all or nothing
- **Consistency** — data stays valid
- **Isolation** — concurrent transactions don't interfere
- **Durability** — committed data persists

**Goal:** know what ACID stands for.`,
    question: {
      prompt: 'What does the I in ACID stand for?',
      options: ['Index', 'Isolation', 'Integrity', 'Insert'],
      answer: 1,
      explanation: 'Isolation ensures concurrent transactions do not interfere with each other.',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '49-begin',
    module: 9,
    title: 'Starting Transactions',
    type: 'practice',
    file: '49-begin.sql',
    markdown: `# 49. Starting transactions

Wrap operations in \`BEGIN TRANSACTION\` and \`COMMIT\`:

\`\`\`sql
BEGIN TRANSACTION;
CREATE TABLE ...;
INSERT INTO ...;
COMMIT;
\`\`\`

**Goal:** Create a table \`tasks\` with columns \`id\` (INTEGER PRIMARY KEY) and \`title\` (TEXT NOT NULL) inside a transaction, then COMMIT.`,
    seed: SEED_EMPTY,
    check: { type: 'schema', table: 'tasks', columns: ['id', 'title'] },
  },
  {
    id: '50-commit',
    module: 9,
    title: 'Committing',
    type: 'practice',
    file: '50-commit.sql',
    markdown: `# 50. Committing

\`COMMIT\` saves all changes made since \`BEGIN TRANSACTION\`. Changes become visible and permanent.

**Goal:** Insert a row into the \`tasks\` table (created in previous lesson) inside a transaction and COMMIT. The table already exists from the seed.`,
    seed: SEED_EMPTY,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '51-rollback',
    module: 9,
    title: 'Rolling Back',
    type: 'practice',
    file: '51-rollback.sql',
    markdown: `# 51. Rolling back

\`ROLLBACK\` undoes all changes since \`BEGIN TRANSACTION\`:

\`\`\`sql
BEGIN;
DELETE FROM table;
ROLLBACK; -- nothing happened
\`\`\`

**Goal:** Delete all rows from \`tasks\` inside a transaction, then ROLLBACK. The rows should still exist after. Check with \`SELECT COUNT(*) FROM tasks\` to verify.`,
    seed: SEED_EMPTY,
    check: { type: 'success' },
  },
  {
    id: '52-savepoint',
    module: 9,
    title: 'Savepoints',
    type: 'practice',
    file: '52-savepoint.sql',
    markdown: `# 52. Savepoints

Savepoints allow partial rollbacks within a transaction:

\`\`\`sql
SAVEPOINT sp;
... some work ...
ROLLBACK TO sp; -- undo to savepoint
COMMIT;
\`\`\`

**Goal:** Insert two rows into \`tasks\` after a SAVEPOINT, then ROLLBACK TO that savepoint, insert one more row, and COMMIT. Only the last row persists.`,
    seed: SEED_EMPTY,
    check: { type: 'changes', min: 1 },
  },
  // ── Module 10: Advanced Topics ──────────────────────────────────────────
  {
    id: '53-views',
    module: 10,
    title: 'Views',
    type: 'practice',
    file: '53-views.sql',
    markdown: `# 53. Views

A view is a saved query that acts like a virtual table:

\`\`\`sql
CREATE VIEW view_name AS SELECT ...;
\`\`\`

**Goal:** Create a view called \`customer_orders\` that shows customer names alongside their order items (use INNER JOIN).`,
    seed: SEED_SHOP,
    check: { type: 'success' },
  },
  {
    id: '54-triggers',
    module: 10,
    title: 'Triggers',
    type: 'practice',
    file: '54-triggers.sql',
    markdown: `# 54. Triggers

A trigger runs automatically before or after an INSERT, UPDATE, or DELETE:

\`\`\`sql
CREATE TRIGGER trigger_name
BEFORE DELETE ON table
BEGIN
  ... actions ...
END;
\`\`\`

**Goal:** Create a trigger named \`prevent_empty\` that prevents deleting the last product in any category. Use \`BEFORE DELETE\` on \`products\` with \`RAISE(ABORT, '...')\` when the category would become empty.`,
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '55-window',
    module: 10,
    title: 'Window Functions',
    type: 'practice',
    file: '55-window.sql',
    markdown: `# 55. Window functions

Window functions compute values across a set of rows related to the current row:

\`\`\`sql
SELECT column, ROW_NUMBER() OVER (ORDER BY col) AS rank FROM table;
\`\`\`

\`ROW_NUMBER()\`, \`RANK()\`, \`SUM() OVER\` are common window functions.

**Goal:** Write a query that returns each product name, price, and a row number ordered by price descending (most expensive first).`,
    seed: SEED_INVENTORY,
    check: { type: 'result', expectedSql: 'SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS rank FROM products;' },
  },
  {
    id: '56-case',
    module: 10,
    title: 'CASE Statements',
    type: 'practice',
    file: '56-case.sql',
    markdown: `# 56. CASE statements

\`CASE\` adds conditional logic to queries:

\`\`\`sql
SELECT column,
  CASE WHEN condition THEN value ELSE other END AS alias
FROM table;
\`\`\`

**Goal:** Write a query that returns each product name and a label column: 'Cheap' if price < 100, 'Moderate' if price BETWEEN 100 AND 500, 'Expensive' if price > 500. Sort by price ascending.`,
    seed: SEED_INVENTORY,
    check: { type: 'result', expectedSql: "SELECT name, CASE WHEN price < 100 THEN 'Cheap' WHEN price BETWEEN 100 AND 500 THEN 'Moderate' ELSE 'Expensive' END AS label FROM products ORDER BY price;" },
  },
  {
    id: '57-datetime',
    module: 10,
    title: 'Date and Time Functions',
    type: 'practice',
    file: '57-datetime.sql',
    markdown: `# 57. Date and time functions

SQLite has functions for date arithmetic:

\`\`\`sql
DATE('now')           -- today
DATE('now', '+1 day') -- tomorrow
STRFTIME('%Y', col)   -- extract year
\`\`\`

The \`events\` table has \`name\` and \`event_date\` (TEXT in ISO format 'YYYY-MM-DD').

**Goal:** Write a query that returns event names and their month number (1-12) extracted from \`event_date\`. Use \`STRFTIME('%m', event_date)\` and alias it as \`month\`. Sort by event_date.`,
    seed: SEED_DATES,
    check: { type: 'result', expectedSql: "SELECT name, STRFTIME('%m', event_date) AS month FROM events ORDER BY event_date;" },
  },
  // ── ALTER TABLE & Inter-table Operations ────────────────────────────────
  {
    id: '09-alter-table',
    module: 2,
    title: 'ALTER TABLE',
    type: 'practice',
    file: '58-alter-table.sql',
    markdown: `# 58. ALTER TABLE

Modify existing tables with \`ALTER TABLE\`:

\`\`\`sql
ALTER TABLE table ADD COLUMN column TYPE;
ALTER TABLE table RENAME COLUMN old TO new;
ALTER TABLE table DROP COLUMN column;
\`\`\`

The \`users\` table already exists.

**Goal:** Add a column \`phone\` (TEXT) to \`users\`, then rename \`phone\` to \`phone_number\`.`,
    seed: SEED_USERS,
    check: { type: 'schema', table: 'users', columns: ['id', 'name', 'city', 'age', 'email', 'phone_number'] },
  },
  {
    id: '18-insert-select',
    module: 3,
    title: 'INSERT INTO SELECT',
    type: 'practice',
    file: '59-insert-select.sql',
    markdown: `# 59. INSERT INTO ... SELECT

Copy rows from one table into another:

\`\`\`sql
INSERT INTO target_table (columns)
SELECT columns FROM source_table WHERE condition;
\`\`\`

Both tables must exist. The column types must match.

**Goal:** Create a table \`admins\` with the same columns as \`users\`, then copy only users from Berlin into it.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name, city FROM admins ORDER BY name;' },
  },
  // ── Combined / Mastery Lessons ─────────────────────────────────────────
  {
    id: '60-crud-mastery',
    module: 3,
    title: 'CRUD Mastery',
    type: 'practice',
    file: '60-crud-mastery.sql',
    markdown: `# 60. CRUD mastery

Combine everything you learned: create, insert, update, delete, and query.

**Goal:**
1. Create a table \`inventory\` with columns \`id\` (INTEGER PRIMARY KEY), \`item\` (TEXT NOT NULL), \`quantity\` (INTEGER NOT NULL)
2. Insert 3 items: 'Laptop' (5), 'Mouse' (20), 'Keyboard' (15)
3. Update 'Mouse' quantity to 25
4. Delete 'Keyboard'
5. Write a SELECT to show remaining items sorted by item name`,
    seed: SEED_EMPTY,
    check: { type: 'result', expectedSql: "SELECT item, quantity FROM inventory ORDER BY item;" },
  },
  {
    id: '61-query-mastery',
    module: 4,
    title: 'Query Mastery',
    type: 'practice',
    file: '61-query-mastery.sql',
    markdown: `# 61. Query mastery

Combine grouping, filtering, sorting, and aggregates into one query.

The \`users\` table has users in multiple cities with different ages.

**Goal:** Write a query that shows for each city: the city name, the number of users, and the average age — but only for cities with at least 2 users. Sort by average age descending.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;' },
  },
  {
    id: '62-join-mastery',
    module: 5,
    title: 'Join Mastery',
    type: 'practice',
    file: '62-join-mastery.sql',
    markdown: `# 62. Join mastery

Combine joins, aggregation, and ordering across multiple tables.

The database has \`customers\`, \`orders\`, and \`products\` tables.

**Goal:** Write a query that shows each customer name, the total quantity of products they ordered, and the number of distinct products they bought. Only show customers who ordered at least 2 total items. Sort by total quantity descending.`,
    seed: SEED_SHOP_EXT,
    check: { type: 'result', expectedSql: 'SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;' },
  },
  {
    id: '63-capstone',
    module: 10,
    title: 'Final Capstone',
    type: 'practice',
    file: '63-capstone.sql',
    markdown: `# 63. Final capstone

Build a library system from scratch. Create the schema, add data, and write queries.

**Goal:**
1. Create \`members\` (id INTEGER PK, name TEXT NOT NULL, joined_date TEXT)
2. Create \`books\` (id INTEGER PK, title TEXT NOT NULL, author TEXT NOT NULL)
3. Create \`loans\` (id INTEGER PK, member_id INTEGER FK, book_id INTEGER FK, loan_date TEXT, returned INTEGER DEFAULT 0)
4. Insert 2 members, 3 books, and 2 loans
5. Write a query showing which books are currently on loan (returned = 0), including member name and book title — use JOIN`,
    seed: SEED_EMPTY_FK,
    check: { type: 'schema', table: 'loans', columns: ['id', 'member_id', 'book_id', 'loan_date', 'returned'] },
  },
  // ── New Basics ──────────────────────────────────────────────────────────
  {
    id: '64-comments',
    module: 1,
    title: 'Comments in SQL',
    type: 'theory',
    file: '64-comments.md',
    markdown: `# 64. Comments in SQL

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
    id: '65-drop-table',
    module: 2,
    title: 'DROP TABLE',
    type: 'practice',
    file: '65-drop-table.sql',
    markdown: `# 65. DROP TABLE

\`DROP TABLE\` removes a table and all its data permanently:

\`\`\`sql
DROP TABLE table_name;
DROP TABLE IF EXISTS table_name;  -- no error if missing
\`\`\`

**Goal:** Drop the \`users\` table. Then run \`SELECT * FROM sqlite_master WHERE type='table'\` to verify it's gone.`,
    seed: SEED_USERS,
    check: { type: 'success' },
    hint: 'DROP TABLE users;',
  },
  {
    id: '66-insert-multi',
    module: 3,
    title: 'INSERT Multiple Rows',
    type: 'practice',
    file: '66-insert-multi.sql',
    markdown: `# 66. INSERT multiple rows

Insert several rows in one statement by comma-separating the value lists:

\`\`\`sql
INSERT INTO table (col1, col2) VALUES
  (val1a, val2a),
  (val1b, val2b),
  (val1c, val2c);
\`\`\`

The \`users\` table has columns: id, name, city, age, email. The \`id\` is auto-incrementing — omit it.

**Goal:** Insert 3 new users at once into \`users\`.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 3 },
    hint: 'INSERT INTO users (name, city, age) VALUES (\'A\', \'B\', 20), (\'C\', \'D\', 30), (\'E\', \'F\', 40);',
  },
  {
    id: '67-union',
    module: 4,
    title: 'UNION',
    type: 'practice',
    file: '67-union.sql',
    markdown: `# 67. UNION

\`UNION\` combines results from two queries into one set. Duplicates are removed automatically. Use \`UNION ALL\` to keep duplicates:

\`\`\`sql
SELECT column FROM table_a
UNION
SELECT column FROM table_b;
\`\`\`

Both SELECTs must have the same number of columns with compatible types.

**Goal:** Write a query that returns all unique city names from \`customers\` and all unique city names from \`users\` combined into one list, sorted alphabetically.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: "SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;" },
    hint: 'SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;',
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
  if (panel.prev) panel.prev.disabled = !state.tutorialActive || state.tutorialStep === 0;
  if (panel.next) {
    const modEnd = state.tutorialStep >= lessons.length - 1;
    panel.next.textContent = modEnd ? 'Finish' : 'Next';
    panel.next.disabled = !state.tutorialActive || (!completed && !getSettings().skipEnabled);
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

async function seedTutorialWorkspace(startFile, module) {
  module = module || currentModule;
  const files = buildTutorialFiles(module);
  const target = startFile && files[startFile] ? startFile : 'README.md';
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
    const hint = lesson.hint ? ' 💡 ' + lesson.hint : '';
    setStatus('Not quite. Check the goal and try again.' + hint, 'error');
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
    if (e.target.id === 'tutorial-module-select') {
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
  const files = getFiles();
  const hasFiles = Object.keys(files).length > 0;
  if (resetProgress || !hasFiles) {
    resetCompletion();
    await seedTutorialWorkspace(lesson.file, currentModule);
  } else {
    renderTree();
    if (lesson.type === 'practice') openSingleFile(lesson.file);
  }
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
  if (lesson.module !== currentModule) {
    currentModule = lesson.module;
    await seedTutorialWorkspace(lesson.file, currentModule);
  }
  toggleEditorForLesson(lesson);
  if (lesson.type === 'theory') {
    setStatus('Answer the quiz to unlock Next.', '');
  } else {
    openSingleFile(lesson.file);
    setStatus('Run the lesson query to complete this step.', '');
  }
  renderTutorialPanel();
}
