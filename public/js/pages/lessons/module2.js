import { SEED_EMPTY, SEED_EMPTY_FK, SEED_USERS } from './seeds.js';

export const module2 = [
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
    id: '09-alter-table',
    module: 2,
    title: 'ALTER TABLE',
    type: 'practice',
    file: '09-alter-table.sql',
    markdown: `# 9. ALTER TABLE

Modify existing tables with \`ALTER TABLE\`:

\`\`\`sql
ALTER TABLE table ADD COLUMN column TYPE;
ALTER TABLE table RENAME COLUMN old TO new;
ALTER TABLE table DROP COLUMN column;
\`\`\`

The \`users\` table already has columns: id, name, city, age, email.

**Goal:** Add a column \`phone\` (TEXT) to \`users\`, then rename \`phone\` to \`phone_number\`.`,
    seed: SEED_USERS,
    check: { type: 'schema', table: 'users', columns: ['id', 'name', 'city', 'age', 'email', 'phone_number'] },
    hint: 'ALTER TABLE users ADD COLUMN phone TEXT; then ALTER TABLE users RENAME COLUMN phone TO phone_number;',
  },
  {
    id: '10-schema',
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
];
