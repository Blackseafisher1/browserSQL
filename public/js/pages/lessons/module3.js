import { SEED_USERS, SEED_USERS_NULL, SEED_EMPTY } from './seeds.js';

export const module3 = [
  {
    id: '12-attach',
    module: 4,
    title: 'Your First Database',
    type: 'practice',
    file: '12-attach.sql',
    sql: "SELECT name FROM sqlite_master WHERE type = 'table';\n",
    markdown: `# Your First Database

CashPal's system is live! Let's explore what's inside.

SQLite stores metadata in a system table called \`sqlite_master\`. It has columns like \`name\`, \`type\`, and \`sql\`.

Try querying it to discover what tables exist:

\`\`\`sql
SELECT name FROM sqlite_master WHERE type = 'table';
\`\`\`

**Goal:** a successful query shows at least one table.`,
    seed: SEED_USERS,
    check: { type: 'success' },
  },
  {
    id: '13-select',
    module: 4,
    title: 'Reading Data',
    type: 'practice',
    file: '13-select.sql',
    sql: 'SELECT * FROM users;\n',
    markdown: `# Reading Data

CashPal's \`users\` table is ready. Let's read from it.

\`\`\`sql
SELECT column1, column2 FROM tablename;
SELECT * FROM tablename;  -- all columns
\`\`\`

**Goal:** Write a query that returns all rows and columns from the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT * FROM users;' },
  },
  {
    id: '14-where',
    module: 4,
    title: 'Filtering',
    type: 'practice',
    file: '11-where.sql',
    sql: "SELECT name FROM users WHERE city = 'Berlin';\n",
    markdown: `# Filtering

CashPal's marketing team needs to find users in Berlin.

The \`WHERE\` clause filters rows:

\`\`\`sql
SELECT columns FROM table WHERE condition;
\`\`\`

Use \`=\` for comparison. Strings go in single quotes.

**Goal:** Return the names of users who live in Berlin.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE city = 'Berlin';" },
  },
  {
    id: '15-advanced-where',
    module: 4,
    title: 'Advanced Filtering',
    type: 'practice',
    file: '12-advanced-where.sql',
    sql: "SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;\n",
    markdown: `# Advanced Filtering

CashPal's analytics team needs a precise user list.

Combine multiple operators:

\`\`\`sql
SELECT columns FROM table
WHERE column IN (value1, value2)
  AND column BETWEEN x AND y
  AND column NOT IN (value)
ORDER BY column;
\`\`\`

**Your task:** Return names of users who:
- [ ] Live in Berlin or Munich
- [ ] Are between 20 and 35 years old (inclusive)
- [ ] Are NOT 22 years old
- [ ] Sorted alphabetically by name`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;" },
    checklist: [
      'Filter users in Berlin or Munich',
      'Age between 20 and 35 inclusive',
      'Exclude age 22',
      'Sorted alphabetically by name',
    ],
  },
  {
    id: '16-null',
    module: 4,
    title: 'Working with NULL',
    type: 'practice',
    file: '13-null.sql',
    sql: 'SELECT name FROM users WHERE email IS NULL;\n',
    markdown: `# Working with NULL

Some CashPal users haven't provided an email. \`NULL\` represents missing data.

You cannot use \`= NULL\` — use \`IS NULL\` or \`IS NOT NULL\`:

\`\`\`sql
SELECT columns FROM table WHERE column IS NULL;
\`\`\`

**Goal:** Return the names of users without an email address.`,
    seed: SEED_USERS_NULL,
    check: { type: 'result', expectedSql: 'SELECT name FROM users WHERE email IS NULL;' },
    hint: 'Use WHERE email IS NULL — not = NULL.',
  },
  {
    id: '17-like',
    module: 4,
    title: 'Pattern Matching',
    type: 'practice',
    file: '14-like.sql',
    sql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;\n",
    markdown: `# Pattern Matching

CashPal needs to find users whose names contain certain letters.

\`LIKE\` enables pattern matching:

- \`%\` — matches any sequence of characters
- \`_\` — matches exactly one character

\`\`\`sql
SELECT columns FROM table WHERE column LIKE pattern;
\`\`\`

**Goal:** Return names containing the letter 'a', sorted alphabetically.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;" },
  },
  {
    id: '18-insert',
    module: 4,
    title: 'Inserting Data',
    type: 'practice',
    file: '15-insert.sql',
    sql: "INSERT INTO users (name, city, age, email) VALUES ('Kai', 'Berlin', 27, 'kai@example.com');\n",
    markdown: `# Inserting Data

A new user joined CashPal. Add them to the database.

\`\`\`sql
INSERT INTO tablename (col1, col2, ...) VALUES (val1, val2, ...);
\`\`\`

The \`id\` column is auto-incrementing — you can omit it.

**Goal:** Insert a new user into \`users\`.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '19-update',
    module: 4,
    title: 'Updating Data',
    type: 'practice',
    file: '16-update.sql',
    sql: "UPDATE users SET city = 'Bremen' WHERE name = 'Mia';\n",
    markdown: `# Updating Data

A CashPal user moved cities. Time to update their record.

\`\`\`sql
UPDATE tablename SET column = value WHERE condition;
\`\`\`

**⚠️ Always include WHERE** — without it, every row gets updated!

**Goal:** Update the city of a specific user.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '20-update-multi',
    module: 4,
    title: 'UPDATE Multiple Columns',
    type: 'practice',
    file: '20-update-multi.sql',
    markdown: `# Update Multiple Columns

A CashPal user changed both city and age. Update both at once:

\`\`\`sql
UPDATE users SET city = 'Berlin', age = 30 WHERE name = 'Mia';
\`\`\`

**Goal:** Update both the city and age of a user in \`users\`.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
    hint: 'UPDATE users SET city = \'X\', age = Y WHERE name = \'Z\';',
    sql: "UPDATE users SET city = 'Berlin', age = 30 WHERE name = 'Mia';\n",
  },
  {
    id: '21-delete',
    module: 4,
    title: 'Deleting Data',
    type: 'practice',
    file: '21-delete.sql',
    sql: "DELETE FROM users WHERE name = 'Liam';\n",
    markdown: `# Deleting Data

A CashPal user requested account removal.

\`\`\`sql
DELETE FROM tablename WHERE condition;
\`\`\`

**⚠️ Always include WHERE** — without it, all rows are deleted!

**Goal:** Delete a specific user by their name.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '22-delete-danger',
    module: 4,
    title: 'Danger of DELETE',
    type: 'theory',
    file: '22-delete-danger.md',
    markdown: `# Danger of DELETE

Always include WHERE unless you truly want to delete everything. CashPal learned this the hard way in production.

**Goal:** know what happens without WHERE.`,
    question: {
      prompt: 'What happens if you run DELETE FROM users without WHERE?',
      options: ['Only the first row is deleted', 'Nothing happens', 'All rows are deleted', 'It deletes the table'],
      answer: 2,
      explanation: 'Without WHERE, every row is removed.',
    },
    seed: SEED_USERS,
  },
  {
    id: '23-insert-select',
    module: 4,
    title: 'INSERT INTO SELECT',
    type: 'practice',
    file: '23-insert-select.sql',
    markdown: `# INSERT INTO ... SELECT

CashPal needs to promote Berlin users to admin status. Copy data between tables:

\`\`\`sql
INSERT INTO target_table (columns)
SELECT columns FROM source_table WHERE condition;
\`\`\`

**Your task:**
- [ ] Create table \`admins\` with same columns as \`users\`
- [ ] Copy only users from Berlin into \`admins\``,
    sql: 'CREATE TABLE admins (id INTEGER PRIMARY KEY, name TEXT, city TEXT, age INTEGER, email TEXT);\nINSERT INTO admins SELECT * FROM users WHERE city = \'Berlin\';\n',
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name, city FROM admins ORDER BY name;' },
    checklist: [
      'Table admins created with same columns as users',
      'Only Berlin users copied into admins',
    ],
  },
  {
    id: '24-crud-mastery',
    module: 4,
    title: 'CRUD Mastery',
    type: 'practice',
    file: '24-crud-mastery.sql',
    markdown: `# CRUD Mastery

CashPal's inventory system needs a complete setup. Combine everything you've learned.

**Your task:**
- [ ] Create table \`inventory\` (id INTEGER PK, item TEXT NOT NULL, quantity INTEGER NOT NULL)
- [ ] Insert 3 items: 'Laptop' (5), 'Mouse' (20), 'Keyboard' (15)
- [ ] Update 'Mouse' quantity to 25
- [ ] Delete 'Keyboard'
- [ ] SELECT remaining items sorted by item name`,
    sql: 'CREATE TABLE inventory (id INTEGER PRIMARY KEY, item TEXT NOT NULL, quantity INTEGER NOT NULL);\nINSERT INTO inventory (item, quantity) VALUES (\'Laptop\', 5), (\'Mouse\', 20), (\'Keyboard\', 15);\nUPDATE inventory SET quantity = 25 WHERE item = \'Mouse\';\nDELETE FROM inventory WHERE item = \'Keyboard\';\n',
    seed: SEED_EMPTY,
    check: { type: 'result', expectedSql: "SELECT item, quantity FROM inventory ORDER BY item;" },
    checklist: [
      'Create table inventory with id, item, quantity',
      'Insert Laptop (5), Mouse (20), Keyboard (15)',
      'Update Mouse quantity to 25',
      'Delete Keyboard',
      'SELECT remaining items sorted by name',
    ],
  },
  {
    id: '25-insert-multi',
    module: 4,
    title: 'INSERT Multiple Rows',
    type: 'practice',
    file: '25-insert-multi.sql',
    markdown: `# INSERT Multiple Rows

CashPal is growing fast — add 3 new users at once.

Insert several rows in one statement:

\`\`\`sql
INSERT INTO table (col1, col2) VALUES
  (val1a, val2a),
  (val1b, val2b),
  (val1c, val2c);
\`\`\`

**Goal:** Insert 3 new users at once into \`users\`.`,
    seed: SEED_USERS,
    check: { type: 'changes', min: 3 },
    hint: 'INSERT INTO users (name, city, age) VALUES (\'A\', \'B\', 20), (\'C\', \'D\', 30), (\'E\', \'F\', 40);',
    sql: "INSERT INTO users (name, city, age) VALUES ('Kai', 'Berlin', 27), ('Luna', 'Hamburg', 24), ('Finn', 'Munich', 30);\n",
  },
];
