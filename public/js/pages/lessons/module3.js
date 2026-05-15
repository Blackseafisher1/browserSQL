import { SEED_USERS, SEED_USERS_NULL, SEED_EMPTY } from './seeds.js';

export const module3 = [
  {
    id: '12-attach',
    module: 3,
    title: 'Your First Database',
    type: 'practice',
    file: '12-attach.sql',
    sql: 'SELECT name FROM sqlite_master WHERE type = \'table\';\n',
    markdown: `# Your first database

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
    id: '13-select',
    module: 3,
    title: 'Reading Data',
    type: 'practice',
    file: '13-select.sql',
    sql: 'SELECT * FROM users;\n',
    markdown: `# Reading data

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
    id: '14-where',
    module: 3,
    title: 'Filtering',
    type: 'practice',
    file: '11-where.sql',
    sql: "SELECT name FROM users WHERE city = 'Berlin';\n",
    markdown: `# Filtering

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
    id: '15-advanced-where',
    module: 3,
    title: 'Advanced Filtering',
    type: 'practice',
    file: '12-advanced-where.sql',
    sql: "SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;\n",
    markdown: `# Advanced filtering

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
    markdown: `# Working with NULL

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
    id: '17-like',
    module: 3,
    title: 'Pattern Matching',
    type: 'practice',
    file: '14-like.sql',
    sql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;\n",
    markdown: `# Pattern matching

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
    id: '18-insert',
    module: 3,
    title: 'Inserting Data',
    type: 'practice',
    file: '15-insert.sql',
    sql: "INSERT INTO users (name, city, age, email) VALUES ('Kai', 'Berlin', 27, 'kai@example.com');\n",
    markdown: `# Inserting data

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
    id: '19-update',
    module: 3,
    title: 'Updating Data',
    type: 'practice',
    file: '16-update.sql',
    sql: "UPDATE users SET city = 'Bremen' WHERE name = 'Mia';\n",
    markdown: `# Updating data

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
    id: '20-delete',
    module: 3,
    title: 'Deleting Data',
    type: 'practice',
    file: '17-delete.sql',
    sql: "DELETE FROM users WHERE name = 'Liam';\n",
    markdown: `# Deleting data

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
    id: '21-delete-danger',
    module: 3,
    title: 'Danger of DELETE',
    type: 'theory',
    file: '18-delete-danger.md',
    markdown: `# Danger of DELETE

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
  {
    id: '22-insert-select',
    module: 3,
    title: 'INSERT INTO SELECT',
    type: 'practice',
    file: '22-insert-select.sql',
    markdown: `# INSERT INTO ... SELECT

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
  {
    id: '23-crud-mastery',
    module: 3,
    title: 'CRUD Mastery',
    type: 'practice',
    file: '23-crud-mastery.sql',
    markdown: `# CRUD mastery

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
    id: '24-insert-multi',
    module: 3,
    title: 'INSERT Multiple Rows',
    type: 'practice',
    file: '24-insert-multi.sql',
    markdown: `# INSERT multiple rows

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
];
