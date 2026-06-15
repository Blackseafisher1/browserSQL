import { SEED_EMPTY, SEED_EMPTY_FK, SEED_USERS } from './seeds.js';

export const module2 = [
  {
    id: '06-primary',
    module: 3,
    title: 'PRIMARY KEY',
    type: 'theory',
    file: '06-primary.md',
    markdown: `# PRIMARY KEY

A \`PRIMARY KEY\` uniquely identifies each row. CashPal uses it for user IDs, transaction IDs, account numbers.

\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
\`\`\`

**Key facts:**
- Implies **NOT NULL** + **UNIQUE** automatically
- Only **one** PRIMARY KEY per table
- \`INTEGER PRIMARY KEY\` auto-fills in SQLite
- Creates an index for fast lookups

**Goal:** understand what PRIMARY KEY guarantees.`,
    question: {
      prompt: 'What does PRIMARY KEY automatically imply?',
      options: ['NOT NULL only', 'UNIQUE only', 'NOT NULL + UNIQUE', 'AUTOINCREMENT'],
      answer: 2,
      explanation: 'PRIMARY KEY implies both NOT NULL and UNIQUE.',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '10-constraints',
    module: 3,
    title: 'Constraints',
    type: 'practice',
    file: '10-constraints.sql',
    sql: "CREATE TABLE accounts (\n  id INTEGER PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE,\n  status TEXT NOT NULL DEFAULT 'active',\n  age INTEGER CHECK (age >= 18)\n);\nINSERT INTO accounts (email, age) VALUES ('test@example.com', 25);\n",
    markdown: `# Constraints

CashPal needs strict rules on their \`accounts\` table — no invalid data allowed.

Constraints enforce rules on your data:

\`\`\`sql
id INTEGER PRIMARY KEY        -- unique + not null
name TEXT NOT NULL              -- must have a value
email TEXT UNIQUE               -- no duplicates
status TEXT DEFAULT 'active'    -- fallback if omitted
age INTEGER CHECK (age >= 18)  -- validate condition
\`\`\`

**Your task:** Create the \`accounts\` table.

- [ ] \`id\` is INTEGER PRIMARY KEY
- [ ] \`email\` is TEXT, NOT NULL, UNIQUE
- [ ] \`status\` is TEXT, NOT NULL, DEFAULT 'active'
- [ ] \`age\` is INTEGER, CHECK (age >= 18)
- [ ] Insert one valid row

> **Try it:** After creating the table, try inserting a row with age < 18 — you'll get a CHECK error. Try a duplicate email — you'll get a UNIQUE error.`,
    seed: SEED_EMPTY,
    check: { type: 'constraints', table: 'accounts', tokens: ['not null', 'unique', 'default', 'check'] },
    hint: 'CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT \'active\', age INTEGER CHECK (age >= 18)); then INSERT a row with valid data.',
    checklist: [
      'Column id is INTEGER PRIMARY KEY',
      'Column email is TEXT NOT NULL UNIQUE',
      'Column status is TEXT NOT NULL DEFAULT active',
      'Column age is INTEGER CHECK (age >= 18)',
    ],
  },
  {
    id: '16-pk-vs-unique',
    module: 3,
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
      options: ['Unlimited', 'Two', 'One', 'Depends on columns'],
      answer: 2,
      explanation: 'A table can have only one PRIMARY KEY, but multiple UNIQUE constraints.',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '07-autoincrement',
    module: 3,
    title: 'AUTOINCREMENT',
    type: 'theory',
    file: '07-autoincrement.md',
    markdown: `# AUTOINCREMENT

In SQLite, \`INTEGER PRIMARY KEY\` auto-increments by default — but there's a catch.

**Without AUTOINCREMENT:** IDs start at 1. If you delete the last row, SQLite may **reuse** that ID (\`max(rowid) + 1\`).

**With AUTOINCREMENT:** IDs are guaranteed to never be reused. Important for CashPal's transaction records — you never want duplicate transaction IDs.

**⚠️ Other databases are different.** In MySQL/PostgreSQL, \`INTEGER PRIMARY KEY\` does NOT auto-increment — you need \`AUTO_INCREMENT\` or \`SERIAL\`.

**Goal:** know when AUTOINCREMENT matters.`,
    question: {
      prompt: 'Without AUTOINCREMENT, what ID does a new row get after deleting the last row (ID 5)?',
      options: ['5', '6', '1', 'Random'],
      answer: 0,
      explanation: 'Without AUTOINCREMENT, SQLite reuses the highest row ID (max(rowid)+1 = 5).',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '08-foreign',
    module: 3,
    title: 'FOREIGN KEY',
    type: 'practice',
    file: '07-foreign.sql',
    sql: 'PRAGMA foreign_keys = ON;\nCREATE TABLE authors (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE books (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  author_id INTEGER NOT NULL,\n  FOREIGN KEY (author_id) REFERENCES authors(id)\n);\n',
    markdown: `# FOREIGN KEY

CashPal needs to link \`books\` to \`authors\` — a book belongs to one author, an author can have many books.

A \`FOREIGN KEY\` links rows across tables. There are two syntaxes — both are valid:

**Explicit syntax (multi-line):**

\`\`\`sql
FOREIGN KEY (local_column) REFERENCES other_table(other_column);
\`\`\`

**Shorthand syntax (inline, column level):**

\`\`\`sql
column TYPE REFERENCES other_table(other_column)
\`\`\`

Example using shorthand:

\`\`\`sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES authors(id)  -- ← shorthand
);
\`\`\`

Both produce the same foreign key. The shorthand is concise and commonly preferred for single-column FKs.

First enable foreign keys: \`PRAGMA foreign_keys = ON;\`

**Your task:**
- [ ] Enable foreign keys with PRAGMA
- [ ] Create \`authors\` table (id, name)
- [ ] Create \`books\` table (id, title, author_id)
- [ ] Add FOREIGN KEY on \`author_id\` referencing \`authors(id)\``,
    seed: SEED_EMPTY_FK,
    check: { type: 'fk', table: 'books', column: 'author_id' },
    hint: 'PRAGMA foreign_keys = ON; CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));',
    checklist: [
      'PRAGMA foreign_keys = ON',
      'Table authors with id and name',
      'Table books with id, title, author_id',
      'Foreign key on author_id referencing authors(id)',
    ],
  },
  {
    id: '12-relationship-1-n',
    module: 3,
    title: 'One-to-Many Relationships',
    type: 'practice',
    file: '12-relationship-1-n.sql',
    markdown: `# One-to-Many Relationships

In a 1:N relationship, one row in table A matches many rows in table B. A foreign key in the "many" side links back.

CashPal uses this for: one customer → many transactions, one category → many products.

**Goal:** Create \`authors\` (id, name) and \`books\` (id, title, author_id FK).`,
    seed: SEED_EMPTY_FK,
    check: { type: 'fk', table: 'books', column: 'author_id' },
    hint: 'CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));',
    sql: 'PRAGMA foreign_keys = ON;\nCREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\nCREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(id));\n',
  },
  {
    id: '11-relationship-1-1',
    module: 3,
    title: 'One-to-One Relationships',
    type: 'practice',
    file: '11-relationship-1-1.sql',
    markdown: `# One-to-One Relationships

In a 1:1 relationship, one row in table A matches exactly one row in table B. Often the shared primary key enforces this.

CashPal uses this for: one user → one profile, one citizen → one passport.

**Goal:** Create \`citizens\` (id, name) and \`passports\` (id PK referencing citizens, number TEXT).`,
    seed: SEED_EMPTY,
    check: { type: 'fk', table: 'passports', column: 'id' },
    hint: 'CREATE TABLE citizens (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE passports (id INTEGER PRIMARY KEY, number TEXT, FOREIGN KEY (id) REFERENCES citizens(id));',
    sql: 'CREATE TABLE citizens (id INTEGER PRIMARY KEY, name TEXT);\nCREATE TABLE passports (id INTEGER PRIMARY KEY, number TEXT, FOREIGN KEY (id) REFERENCES citizens(id));\n',
  },
  {
    id: '09-cascade',
    module: 3,
    title: 'ON DELETE CASCADE',
    type: 'theory',
    file: '09-cascade.md',
    markdown: `# ON DELETE CASCADE

When a parent row is deleted, child rows referencing it become orphaned. \`ON DELETE CASCADE\` automatically deletes children:

\`\`\`sql
FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
\`\`\`

| Action | What happens on parent DELETE |
|--------|------------------------------|
| CASCADE | Child rows deleted automatically |
| SET NULL | Child FK set to NULL |
| RESTRICT | Deletion blocked if children exist |
| NO ACTION | No action (SQLite default) |

**When to use:** Dependent data — order items, invoice lines, blog comments.

**When NOT to use:** Business-critical data — you don't want to silently delete all customer transactions.

**Goal:** know when CASCADE is appropriate.`,
    questions: [
      {
        prompt: 'ON DELETE CASCADE deletes child rows when?',
        options: ['When the parent row is deleted', 'When the child row is updated', 'When a new parent is inserted', 'When the foreign key is created'],
        answer: 0,
        explanation: 'CASCADE automatically deletes child rows when the parent is deleted.',
      },
      {
        prompt: 'Which is a BAD use of ON DELETE CASCADE?',
        options: ['Deleting order items when an order is deleted', 'Deleting book records when an author is deleted', 'Deleting blog comments when a post is deleted', 'Deleting invoices when a customer is deleted'],
        answer: 3,
        explanation: 'Invoices are business records — never cascade delete financial data.',
      },
    ],
    seed: SEED_EMPTY_FK,
  },
  {
    id: '13-composite-pk',
    module: 3,
    title: 'Composite PRIMARY KEY',
    type: 'practice',
    file: '13-composite-pk.sql',
    markdown: `# Composite Primary Keys

A composite PK uses multiple columns as the unique identifier. Essential for junction tables.

CashPal's order system needs an \`order_items\` table linking orders to products.

\`\`\`sql
CREATE TABLE enrollment (
  student_id INTEGER,
  course_id INTEGER,
  PRIMARY KEY (student_id, course_id)
);
\`\`\`

**Your task:**
- [ ] Create \`orders\` table (id, date)
- [ ] Create \`products\` table (id, name)
- [ ] Create \`order_items\` with composite PK on (order_id, product_id)
- [ ] Add \`quantity\` column to order_items`,
    seed: SEED_EMPTY_FK,
    check: { type: 'constraints', table: 'order_items', tokens: ['primary key'] },
    hint: 'CREATE TABLE orders (id INTEGER PRIMARY KEY, date TEXT); CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY (order_id, product_id));',
    sql: 'CREATE TABLE orders (id INTEGER PRIMARY KEY, date TEXT);\nCREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT);\nCREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY (order_id, product_id), FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));\n',
    checklist: [
      'Table orders with id and date',
      'Table products with id and name',
      'Table order_items with order_id, product_id, quantity',
      'Composite PRIMARY KEY on (order_id, product_id)',
    ],
  },
  {
    id: '14-relationship-n-m',
    module: 3,
    title: 'Many-to-Many Relationships',
    type: 'practice',
    file: '14-relationship-n-m.sql',
    markdown: `# Many-to-Many Relationships

N:M requires a junction table. The junction table has a composite PK to prevent duplicates.

CashPal's content system: an actor can be in many movies, a movie has many actors.

**Goal:** Create \`actors\`, \`movies\`, and a junction table \`cast\` with composite PK on (actor_id, movie_id).`,
    seed: SEED_EMPTY_FK,
    check: { type: 'constraints', table: 'cast', tokens: ['primary key'] },
    hint: 'CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT); CREATE TABLE cast (actor_id INTEGER, movie_id INTEGER, PRIMARY KEY (actor_id, movie_id), FOREIGN KEY (actor_id) REFERENCES actors(id), FOREIGN KEY (movie_id) REFERENCES movies(id));',
    sql: 'CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT);\nCREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT);\nCREATE TABLE cast (actor_id INTEGER, movie_id INTEGER, PRIMARY KEY (actor_id, movie_id), FOREIGN KEY (actor_id) REFERENCES actors(id), FOREIGN KEY (movie_id) REFERENCES movies(id));\n',
  },
  {
    id: '09-alter-table',
    module: 3,
    title: 'ALTER TABLE',
    type: 'practice',
    file: '09-alter-table.sql',
    markdown: `# ALTER TABLE

CashPal's \`users\` table needs a phone number field. You can modify existing tables with \`ALTER TABLE\`:

\`\`\`sql
ALTER TABLE table ADD COLUMN column TYPE;
ALTER TABLE table RENAME COLUMN old TO new;
ALTER TABLE table DROP COLUMN column;
\`\`\`

The \`users\` table has: id, name, city, age, email.

**Your task:**
- [ ] Add column \`phone\` (TEXT) to \`users\`
- [ ] Rename \`phone\` to \`phone_number\``,
    seed: SEED_USERS,
    check: { type: 'schema', table: 'users', columns: ['id', 'name', 'city', 'age', 'email', 'phone_number'] },
    hint: 'ALTER TABLE users ADD COLUMN phone TEXT; then ALTER TABLE users RENAME COLUMN phone TO phone_number;',
    sql: 'ALTER TABLE users ADD COLUMN phone TEXT;\nALTER TABLE users RENAME COLUMN phone TO phone_number;\n',
    checklist: [
      'Add column phone (TEXT) to users',
      'Rename phone to phone_number',
    ],
  },
  {
    id: '15-drop-table',
    module: 3,
    title: 'DROP TABLE',
    type: 'practice',
    file: '11-drop-table.sql',
    markdown: `# DROP TABLE

\`DROP TABLE\` removes a table and all its data permanently. Use with caution.

\`\`\`sql
DROP TABLE table_name;
DROP TABLE IF EXISTS table_name;  -- safe version
\`\`\`

**Goal:** Drop the \`users\` table. Then run \`SELECT * FROM sqlite_master WHERE type='table'\` to verify it's gone.`,
    seed: SEED_USERS,
    check: { type: 'success' },
    hint: 'DROP TABLE users;',
    sql: 'DROP TABLE users;\n',
  },
  {
    id: '10-schema',
    module: 3,
    title: 'Schema Design',
    type: 'theory',
    file: '10-schema.md',
    markdown: `# Schema Design

Relationships can be one-to-one, one-to-many, or many-to-many. Choosing the right one is critical for CashPal's data integrity.

**Goal:** know when a junction table is used.`,
    question: {
      prompt: 'Which relationship uses a junction table?',
      options: ['One-to-one', 'One-to-many', 'Many-to-many', 'Self-referencing'],
      answer: 2,
      explanation: 'Many-to-many relationships need a junction table.',
    },
    seed: SEED_USERS,
  },
];
