import { SEED_EMPTY, SEED_EMPTY_FK, SEED_USERS } from './seeds.js';

export const module2 = [
  {
    id: '06-primary',
    module: 2,
    title: 'Primary Keys',
    type: 'practice',
    file: '06-primary.sql',
    sql: 'CREATE TABLE projects (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL\n);\nINSERT INTO projects (name) VALUES (\'Apollo\');\n',
    markdown: `# Primary keys

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
    id: '07-autoincrement',
    module: 2,
    title: 'AUTOINCREMENT',
    type: 'theory',
    file: '07-autoincrement.md',
    markdown: `# AUTOINCREMENT

In SQLite, \`INTEGER PRIMARY KEY\` automatically gets a value using \`max(rowid) + 1\` when you insert without specifying the PK.

**Without AUTOINCREMENT** (\`INTEGER PRIMARY KEY\`):
- IDs start at 1 and increment
- **But:** if you delete the last row and insert again, SQLite may **reuse** the old ID (\`max(rowid) + 1\`)
- Example: insert 1,2,3 → delete 3 → insert → new row gets ID 3 (reused!)

**With AUTOINCREMENT** (\`INTEGER PRIMARY KEY AUTOINCREMENT\`):
- IDs are guaranteed to never be reused
- SQLite tracks the highest ever assigned ID separately
- Insert 1,2,3 → delete 3 → insert → new row gets ID 4 (not reused)

**⚠️ SQLite is unusual here.** In most other databases (MySQL, MariaDB, PostgreSQL):
- A plain \`INTEGER PRIMARY KEY\` does NOT auto-increment
- You must explicitly use \`AUTO_INCREMENT\` (MySQL) or \`SERIAL\`/identity columns (PostgreSQL)
- SQLite's auto-behavior is the exception, not the rule

**Goal:** know when AUTOINCREMENT matters.`,
    question: {
      prompt: 'Without AUTOINCREMENT, what ID does a new row get after deleting the last row (ID 5)?',
      options: ['6', '5', '1', 'Random'],
      answer: 1,
      explanation: 'Without AUTOINCREMENT, SQLite reuses the highest row ID (max(rowid)+1 = 5). With AUTOINCREMENT, it would be 6.',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '08-foreign',
    module: 2,
    title: 'Foreign Keys',
    type: 'practice',
    file: '07-foreign.sql',
    sql: 'PRAGMA foreign_keys = ON;\nCREATE TABLE authors (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE books (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  author_id INTEGER NOT NULL,\n  FOREIGN KEY (author_id) REFERENCES authors(id)\n);\n',
    markdown: `# Foreign keys

A \`FOREIGN KEY\` links rows across tables. It references a column in another table — that column must be a \`PRIMARY KEY\` or have a \`UNIQUE\` constraint. In practice, 99% of FK references target a \`PRIMARY KEY\`, but any \`UNIQUE\` column works.

First enable foreign keys with \`PRAGMA foreign_keys = ON;\`

Syntax:

\`\`\`sql
FOREIGN KEY (local_column) REFERENCES other_table(other_column);
\`\`\`

**Goal:** Create an \`authors\` table (id, name) and a \`books\` table (id, title, author_id) where \`author_id\` references \`authors(id)\`.`,
    seed: SEED_EMPTY_FK,
    check: { type: 'fk', table: 'books', column: 'author_id' },
    hint: 'PRAGMA foreign_keys = ON; CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));',
  },
  {
    id: '08-constraints',
    module: 2,
    title: 'Constraints',
    type: 'practice',
    file: '08-constraints.sql',
    sql: "CREATE TABLE accounts (\n  id INTEGER PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE,\n  status TEXT NOT NULL DEFAULT 'active',\n  age INTEGER CHECK (age >= 18)\n);\nINSERT INTO accounts (email, age) VALUES ('test@example.com', 25);\n",
    markdown: `# Constraints

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
    markdown: `# ALTER TABLE

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
    file: '10-schema.md',
    markdown: `# Schema design

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
    id: '11-relationship-1-1',
    module: 2,
    title: 'One-to-One Relationships',
    type: 'practice',
    file: '11-relationship-1-1.sql',
    markdown: `# One-to-One Relationships

In a 1:1 relationship, one row in table A matches exactly one row in table B. Often the shared primary key enforces this:

\`\`\`sql
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE profiles (id INTEGER PRIMARY KEY, bio TEXT, FOREIGN KEY (id) REFERENCES users(id));
\`\`\`

**Goal:** Create a \`passports\` table with \`id\` (INTEGER PK referencing \`citizens(id)\`) and \`number\` (TEXT). Create \`citizens\` with \`id\` (INTEGER PK) and \`name\` (TEXT).`,
    seed: SEED_EMPTY,
    check: { type: 'fk', table: 'passports', column: 'id' },
    hint: 'CREATE TABLE citizens (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE passports (id INTEGER PRIMARY KEY, number TEXT, FOREIGN KEY (id) REFERENCES citizens(id));',
  },
  {
    id: '12-relationship-1-n',
    module: 2,
    title: 'One-to-Many Relationships',
    type: 'practice',
    file: '12-relationship-1-n.sql',
    markdown: `# One-to-Many Relationships

In a 1:N relationship, one row in table A can match many rows in table B. A foreign key in the many-side table links back:

\`\`\`sql
CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, cat_id INTEGER REFERENCES categories(id));
\`\`\`

**Goal:** Create \`authors\` (id, name) and \`books\` (id, title, author_id FK) tables.`,
    seed: SEED_EMPTY_FK,
    check: { type: 'fk', table: 'books', column: 'author_id' },
    hint: 'CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));',
  },
  {
    id: '13-composite-pk',
    module: 2,
    title: 'Composite Primary Keys',
    type: 'practice',
    file: '13-composite-pk.sql',
    markdown: `# Composite Primary Keys

A composite PK uses multiple columns as the unique identifier. Essential for junction tables in N:M relationships:

\`\`\`sql
CREATE TABLE enrollment (
  student_id INTEGER,
  course_id INTEGER,
  grade TEXT,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
\`\`\`

This prevents duplicate enrollments — the same pair cannot appear twice.

**Goal:** Create an \`orders\` and \`products\` table, and a junction table \`order_items\` with a composite primary key on (\`order_id\`, \`product_id\`). Include a \`quantity\` column.`,
    seed: SEED_EMPTY_FK,
    check: { type: 'constraints', table: 'order_items', tokens: ['primary key'] },
    hint: 'CREATE TABLE orders (id INTEGER PRIMARY KEY, date TEXT); CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY (order_id, product_id), FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));',
  },
  {
    id: '14-relationship-n-m',
    module: 2,
    title: 'Many-to-Many Relationships',
    type: 'practice',
    file: '14-relationship-n-m.sql',
    markdown: `# Many-to-Many Relationships

N:M requires a junction table. The junction table uses a composite PK to prevent duplicates:

\`\`\`sql
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE enrollment (
  student_id INTEGER,
  course_id INTEGER,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
\`\`\`

**Goal:** Create \`actors\`, \`movies\`, and a junction table \`cast\` with a composite primary key on (\`actor_id\`, \`movie_id\`).`,
    seed: SEED_EMPTY_FK,
    check: { type: 'constraints', table: 'cast', tokens: ['primary key'] },
    hint: 'CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT); CREATE TABLE cast (actor_id INTEGER, movie_id INTEGER, PRIMARY KEY (actor_id, movie_id), FOREIGN KEY (actor_id) REFERENCES actors(id), FOREIGN KEY (movie_id) REFERENCES movies(id));',
  },
  {
    id: '15-drop-table',
    module: 2,
    title: 'DROP TABLE',
    type: 'practice',
    file: '11-drop-table.sql',
    markdown: `# DROP TABLE

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
    id: '16-pk-vs-unique',
    module: 2,
    title: 'PRIMARY KEY vs UNIQUE',
    type: 'theory',
    file: '12-pk-vs-unique.md',
    markdown: `# PRIMARY KEY vs UNIQUE

Both ensure unique values, but:

| Feature | PRIMARY KEY | UNIQUE |
|---------|-------------|--------|
| Allowed per table | Only 1 | Multiple |
| Allows NULL | No | Yes |
| Auto-indexed | Yes | Yes |

**Goal:** know the difference.`,
    question: {
      prompt: 'How many PRIMARY KEYs can a table have?',
      options: ['Unlimited', 'One', 'Two', 'Depends on columns'],
      answer: 1,
      explanation: 'A table can have only one PRIMARY KEY, but multiple UNIQUE constraints.',
    },
    seed: SEED_EMPTY,
  },
];
