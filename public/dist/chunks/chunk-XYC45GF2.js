var i="PRAGMA foreign_keys = ON;",e=`
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
`,l=`
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
`,m=`
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
`,a=`
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
`,c=`
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
`,E=`
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
`,n=`
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
`,s=`
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
`,u=`
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
`;var T=[{id:"01-intro",module:1,title:"What is a Database?",type:"theory",file:"01-intro.md",markdown:"# What is a database?\n\nA database stores information in tables. Tables have rows and columns.\n\n**Goal:** understand where data lives before writing SQL.\n\n> **Editor features:** The left panel shows files \u2014 add `.md` or `.txt` files here for notes. The **Schema viewer** (bottom-left) lists all tables; expand one to see columns, types, and constraints. Click any table name to auto-run `SELECT * FROM table LIMIT 100`. You can download all your work as a `.zip` with the export button.",question:{prompt:"What stores data in rows and columns?",options:["Index","Query","Table","View"],answer:2,explanation:"A table is the structure that holds rows and columns."},seed:e},{id:"02-nosql",module:1,title:"SQL vs NoSQL",type:"theory",file:"02-nosql.md",markdown:`# SQL vs NoSQL

SQL databases use tables and a structured schema. NoSQL systems can be document, key-value, or graph based.

**Goal:** know which keyword creates tables in SQL.`,question:{prompt:"Which SQL keyword creates a table?",options:["CREATE TABLE","ALTER","INSERT","UPDATE"],answer:0,explanation:"`CREATE TABLE` defines a new table."},seed:e},{id:"03-comments",module:1,title:"Comments in SQL",type:"theory",file:"03-comments.md",markdown:`# Comments in SQL

Comments make your SQL readable. They are ignored when the query runs:

\`\`\`sql
-- Single line comment
SELECT * FROM users; -- inline comment

/*
Multi-line
comment
*/
\`\`\`

**Goal:** know both comment styles.`,question:{prompt:"Which symbol starts a single-line comment in SQL?",options:["//","--","#","/*"],answer:1,explanation:"-- starts a single line comment. The rest of that line is ignored."},seed:e},{id:"04-create",module:1,title:"Creating Tables",type:"practice",file:"04-create.sql",sql:`CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL
);
`,markdown:"# Creating tables\n\nUse `CREATE TABLE` to define a new table. Specify column names, data types, and constraints.\n\nBasic syntax:\n\n```sql\nCREATE TABLE tablename (\n  column1 TYPE CONSTRAINTS,\n  column2 TYPE CONSTRAINTS\n);\n```\n\n**Goal:** Create a table called `people` with columns `id` (INTEGER PRIMARY KEY), `name` (TEXT NOT NULL), and `age` (INTEGER NOT NULL).\n\n**Tip:** After running, open the **Schema viewer** (bottom-left panel) and expand `people` to see its columns and types.",seed:"",check:{type:"schema",table:"people",columns:["id","name","age"]}},{id:"05-types",module:1,title:"Data Types Deep Dive",type:"theory",file:"05-types.md",markdown:`# Data types

SQLite has 5 native storage classes, but accepts many SQL standard type names for compatibility:

| Type | Stores | Use for |
|------|--------|---------|
| \`INTEGER\` | Whole numbers (-2\u2076\xB3 to 2\u2076\xB3-1) | IDs, counts, ages |
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

This is by design \u2014 SQLite uses **type affinity** (preference, not enforcement). The declared type is a hint, not a rule. Most other databases would reject this with a type mismatch error.

**VARCHAR(n) and other fake types:**
SQLite lets you write \`VARCHAR(255)\`, \`CHAR(20)\`, \`INT(10)\` \u2014 but **ignores the size limit**. They all map to the underlying storage class (\`TEXT\` for VARCHAR, \`INTEGER\` for INT). No truncation or padding occurs.

This is because SQLite uses **manifest typing** \u2014 values carry their own type, not the column. The declared type is just a hint (affinity), not a rule.

On other databases (PostgreSQL, MySQL, Oracle), \`VARCHAR(32)\` **enforces** the limit:
- Inserting "hello world" (11 chars) works fine
- Inserting a 40-character string is **rejected** or truncated
- Indexes on \`VARCHAR(32)\` are faster and smaller than on unbounded \`TEXT\` because the DB knows the max width
- Useful for: usernames, emails, phone numbers, ZIP codes \u2014 anything with a known max length

**BLOB** is for binary data: images, PDFs, encrypted values, serialized objects. Not human-readable in queries, but can store anything.

**Can you enforce length in SQLite?** Yes \u2014 use a \`CHECK\` constraint: \`name TEXT CHECK(length(name) <= 32)\`. This is covered in the Constraints lesson (Module 2).

**Goal:** match SQLite types to their use cases.`,questions:[{prompt:"What happens if you declare VARCHAR(10) and insert a 20-character string in SQLite?",options:["The string is truncated to 10","An error is thrown","The full 20 characters are stored","The column is rejected"],answer:2,explanation:"SQLite ignores VARCHAR size limits. The full string is stored as TEXT with no truncation."},{prompt:"Can you insert an integer (42) into a TEXT column in SQLite?",options:["No, it will be rejected","Yes, SQLite is weakly typed","It depends on the column definition","Only if the column is NULL"],answer:1,explanation:"SQLite is weakly typed \u2014 it does not enforce column types. An integer can go into a TEXT column."},{prompt:"Which type would you use for a column storing image data?",options:["TEXT","INTEGER","REAL","BLOB"],answer:3,explanation:"BLOB is for binary data like images, PDFs, or any file content."},{prompt:"How do you store a date in SQLite?",options:["Use the DATE type","As TEXT, INTEGER, or REAL","Dates are not supported","Use the DATETIME type"],answer:1,explanation:"SQLite has no native DATE type. Store dates as TEXT (ISO8601), INTEGER (Unix timestamp), or REAL (Julian day)."}],seed:e},{id:"06-design-table",module:1,title:"Design a Table",type:"practice",file:"06-design-table.sql",seed:"",markdown:"# Design a table\n\nCreate a table called `employees` with these columns:\n\n- `id` \u2014 a unique number for each employee (PRIMARY KEY)\n- `name` \u2014 employee name\n- `email` \u2014 email address\n- `salary` \u2014 salary with decimals\n- `photo` \u2014 optional profile picture file\n- `department` \u2014 text\n\nChoose the right SQLite type for each column. Only `PRIMARY KEY` is required as a constraint.\n\n**Goal:** Write the `CREATE TABLE employees` statement with all 6 columns using correct types.",check:{type:"schema",table:"employees",columns:["id","name","email","salary","photo","department"]},hint:"CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, email TEXT, salary REAL, photo BLOB, department TEXT);",hint:"CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, salary REAL NOT NULL, photo BLOB, department TEXT NOT NULL DEFAULT 'Engineering');"},{id:"07-select",module:1,title:"SELECT Intro",type:"practice",file:"07-select.sql",seed:e,markdown:'# SELECT Intro\n\nThe `SELECT` statement reads data from tables.\n\n```sql\nSELECT * FROM users;\n```\n\n`*` means "all columns". Pick specific columns:\n\n```sql\nSELECT name, age FROM users;\n```\n\nYou can prefix columns with the table name \u2014 important for later:\n\n```sql\nSELECT users.name, users.age FROM users;\n```\n\nSELECT does not modify data \u2014 it only reads.\n\n**Goal:** Write `SELECT * FROM users;` to see all users.\n\n**Tip:** In the **Schema viewer** (bottom-left), click any table name to auto-generate `SELECT * FROM table LIMIT 100;`. Try it on `users`.',check:{type:"result",expectedSql:"SELECT * FROM users;"}},{id:"08-calc",module:1,title:"Basic Calculations",type:"practice",file:"08-calc.sql",seed:"",markdown:`# Basic Calculations

SQL can do math and string operations without a table:

\`\`\`sql
SELECT 2 + 2;
SELECT 10 * 5;
SELECT 'Hello' || ' ' || 'World';
\`\`\`

The \`||\` operator concatenates strings.

**Goal:** Write a query that returns 100 divided by 4.`,check:{type:"result",expectedSql:"SELECT 100 / 4;"}}];var p=[{id:"06-primary",module:2,title:"PRIMARY KEY",type:"theory",file:"06-primary.md",markdown:`# PRIMARY KEY

A \`PRIMARY KEY\` uniquely identifies each row in a table.

\`\`\`sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
\`\`\`

**Key facts:**
- Implies **NOT NULL** + **UNIQUE** automatically
- Only **one** PRIMARY KEY per table
- Most common: \`INTEGER PRIMARY KEY\` (SQLite auto-fills it)
- Can be text or any other type
- SQLite creates an index for fast lookups

Every table should have a primary key. Without one, you cannot reliably target a specific row.

**Goal:** understand what PRIMARY KEY guarantees.`,question:{prompt:"What does PRIMARY KEY automatically imply?",options:["NOT NULL only","UNIQUE only","NOT NULL + UNIQUE","AUTOINCREMENT"],answer:2,explanation:"PRIMARY KEY implies both NOT NULL and UNIQUE \u2014 it must identify each row uniquely and cannot be NULL."},seed:""},{id:"10-constraints",module:2,title:"Constraints",type:"practice",file:"10-constraints.sql",sql:`CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  age INTEGER CHECK (age >= 18)
);
INSERT INTO accounts (email, age) VALUES ('test@example.com', 25);
`,markdown:"# Constraints\n\nConstraints enforce rules on your data. You have already used several:\n\n```sql\nid INTEGER PRIMARY KEY  -- PRIMARY KEY is a constraint (unique + not null)\nname TEXT NOT NULL       -- NOT NULL is a constraint\nemail TEXT UNIQUE        -- UNIQUE is a constraint\n```\n\nAdditional constraint types:\n\n```sql\nCREATE TABLE table (\n  col1 TYPE CONSTRAINT,\n  col2 TYPE CONSTRAINT\n);\n```\n\n| Constraint | What it does | Example |\n|---|---|---|\n| `PRIMARY KEY` | unique identifier, implies NOT NULL | `id INTEGER PRIMARY KEY` |\n| `NOT NULL` | column must have a value | `name TEXT NOT NULL` |\n| `UNIQUE` | all values must be different | `email TEXT UNIQUE` |\n| `DEFAULT` | fallback value if omitted | `status TEXT DEFAULT 'active'` |\n| `CHECK` | validate against a condition | `age INTEGER CHECK (age >= 18)` |\n\n`CHECK` can use comparisons (`=`, `>`, `>=`, `LIKE`, `IN`, etc.):\n\n```sql\nCHECK (age >= 18)\nCHECK (status IN ('active', 'inactive'))\nCHECK (email LIKE '%@%')\nCHECK (price > 0)\nCHECK (length(name) <= 32)  -- enforce max TEXT length\nCHECK (salary >= 0)        -- enforce non-negative\n```\n\n**Important:** `PRIMARY KEY` already implies `NOT NULL` + `UNIQUE` automatically \u2014 do NOT add them to the PK column. Put them on other columns instead.\n\n**Goal:** Create an `accounts` table with:\n- `id` (INTEGER PRIMARY KEY)\n- `email` (TEXT, NOT NULL, UNIQUE)\n- `status` (TEXT, NOT NULL, DEFAULT 'active')\n- `age` (INTEGER, CHECK that age >= 18)\n\nThen insert one valid row. After that, try inserting a row where age < 18 \u2014 you should get a CHECK constraint error. Try inserting a duplicate email \u2014 you should get a UNIQUE constraint error.\n\n**Tip:** After creating `accounts`, open the **Schema viewer** (bottom-left) and expand it. Each column shows its constraints (PK, NOT NULL, UNIQUE, CHECK).",seed:"",check:{type:"constraints",table:"accounts",tokens:["not null","unique","default","check"]},hint:"CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'active', age INTEGER CHECK (age >= 18)); then INSERT a row with valid data."},{id:"16-pk-vs-unique",module:2,title:"PRIMARY KEY vs UNIQUE",type:"theory",file:"12-pk-vs-unique.md",markdown:`# PRIMARY KEY vs UNIQUE

Both ensure unique values, but:

| Feature | PRIMARY KEY | UNIQUE |
|---------|-------------|--------|
| Allowed per table | Only 1 | Multiple |
| Allows NULL | No | Yes |
| Auto-indexed | Yes | Yes |

**Goal:** know the difference.`,question:{prompt:"How many PRIMARY KEYs can a table have?",options:["Unlimited","Two","One","Depends on columns"],answer:2,explanation:"A table can have only one PRIMARY KEY, but multiple UNIQUE constraints."},seed:""},{id:"07-autoincrement",module:2,title:"AUTOINCREMENT",type:"theory",file:"07-autoincrement.md",markdown:`# AUTOINCREMENT

In SQLite, \`INTEGER PRIMARY KEY\` automatically gets a value using \`max(rowid) + 1\` when you insert without specifying the PK.

**Without AUTOINCREMENT** (\`INTEGER PRIMARY KEY\`):
- IDs start at 1 and increment
- **But:** if you delete the last row and insert again, SQLite may **reuse** the old ID (\`max(rowid) + 1\`)
- Example: insert 1,2,3 \u2192 delete 3 \u2192 insert \u2192 new row gets ID 3 (reused!)

**With AUTOINCREMENT** (\`INTEGER PRIMARY KEY AUTOINCREMENT\`):
- IDs are guaranteed to never be reused
- SQLite tracks the highest ever assigned ID separately
- Insert 1,2,3 \u2192 delete 3 \u2192 insert \u2192 new row gets ID 4 (not reused)

**\u26A0\uFE0F SQLite is unusual here.** In most other databases (MySQL, MariaDB, PostgreSQL):
- A plain \`INTEGER PRIMARY KEY\` does NOT auto-increment
- You must explicitly use \`AUTO_INCREMENT\` (MySQL) or \`SERIAL\`/identity columns (PostgreSQL)
- SQLite's auto-behavior is the exception, not the rule

**Goal:** know when AUTOINCREMENT matters.`,question:{prompt:"Without AUTOINCREMENT, what ID does a new row get after deleting the last row (ID 5)?",options:["5","6","1","Random"],answer:0,explanation:"Without AUTOINCREMENT, SQLite reuses the highest row ID (max(rowid)+1 = 5). With AUTOINCREMENT, it would be 6."},seed:""},{id:"08-foreign",module:2,title:"FOREIGN KEY",type:"practice",file:"07-foreign.sql",sql:`PRAGMA foreign_keys = ON;
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);
`,markdown:"# Foreign keys\n\nA `FOREIGN KEY` links rows across tables. It references a column in another table \u2014 that column must be a `PRIMARY KEY` or have a `UNIQUE` constraint. In practice, 99% of FK references target a `PRIMARY KEY`, but any `UNIQUE` column works.\n\nFirst enable foreign keys with `PRAGMA foreign_keys = ON;`\n\nSyntax:\n\n```sql\nFOREIGN KEY (local_column) REFERENCES other_table(other_column);\n```\n\n**Goal:** Create an `authors` table (id, name) and a `books` table (id, title, author_id) where `author_id` references `authors(id)`.",seed:i,check:{type:"fk",table:"books",column:"author_id"},hint:"PRAGMA foreign_keys = ON; CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));"},{id:"12-relationship-1-n",module:2,title:"One-to-Many Relationships",type:"practice",file:"12-relationship-1-n.sql",markdown:"# One-to-Many Relationships\n\nIn a 1:N relationship, one row in table A can match many rows in table B. A foreign key in the many-side table links back:\n\n```sql\nCREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT);\nCREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, cat_id INTEGER REFERENCES categories(id));\n```\n\n**Goal:** Create `authors` (id, name) and `books` (id, title, author_id FK) tables.",seed:i,check:{type:"fk",table:"books",column:"author_id"},hint:"CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));"},{id:"11-relationship-1-1",module:2,title:"One-to-One Relationships",type:"practice",file:"11-relationship-1-1.sql",markdown:"# One-to-One Relationships\n\nIn a 1:1 relationship, one row in table A matches exactly one row in table B. Often the shared primary key enforces this:\n\n```sql\nCREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);\nCREATE TABLE profiles (id INTEGER PRIMARY KEY, bio TEXT, FOREIGN KEY (id) REFERENCES users(id));\n```\n\n**Goal:** Create a `passports` table with `id` (INTEGER PK referencing `citizens(id)`) and `number` (TEXT). Create `citizens` with `id` (INTEGER PK) and `name` (TEXT).",seed:"",check:{type:"fk",table:"passports",column:"id"},hint:"CREATE TABLE citizens (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE passports (id INTEGER PRIMARY KEY, number TEXT, FOREIGN KEY (id) REFERENCES citizens(id));"},{id:"09-cascade",module:2,title:"ON DELETE CASCADE",type:"theory",file:"09-cascade.md",markdown:`# ON DELETE CASCADE

When a parent row is deleted, child rows referencing it become orphaned. \`ON DELETE CASCADE\` automatically deletes those children:

\`\`\`sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  author_id INTEGER,
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);
\`\`\`

Now deleting an author also deletes all their books. Other options:

| Action | What happens on parent DELETE |
|--------|------------------------------|
| \`ON DELETE CASCADE\` | Child rows are deleted automatically |
| \`ON DELETE SET NULL\` | Child FK is set to NULL |
| \`ON DELETE RESTRICT\` | Deletion is blocked if children exist |
| \`ON DELETE NO ACTION\` | No action (SQLite default) |

**When to use CASCADE:**
- Dependent data that has no meaning without the parent (order \u2192 order_items, invoice \u2192 invoice_lines)
- Cleanup scenarios

**When NOT to use CASCADE:**
- Business-critical data (you rarely want to silently delete all customer orders when removing a test customer)
- Audit/history data that should persist even if the parent is deleted
- When accidental deletion would cause massive data loss

\`ON UPDATE CASCADE\` works the same way but when the referenced value changes.

**Goal:** know when CASCADE is appropriate.`,questions:[{prompt:"ON DELETE CASCADE deletes child rows when?",options:["When the parent row is deleted","When the child row is updated","When a new parent is inserted","When the foreign key is created"],answer:0,explanation:"CASCADE automatically deletes child rows when the parent they reference is deleted."},{prompt:"Which scenario is a BAD use of ON DELETE CASCADE?",options:["Deleting order_items when an order is deleted","Deleting book records when an author is deleted","Deleting blog comments when a post is deleted","Deleting invoices when a customer is deleted"],answer:3,explanation:"Deleting invoices when a customer is removed is dangerous \u2014 invoices are business records that should be kept for accounting even if the customer is deleted."}],seed:i},{id:"13-composite-pk",module:2,title:"Composite PRIMARY KEY",type:"practice",file:"13-composite-pk.sql",markdown:"# Composite Primary Keys\n\nA composite PK uses multiple columns as the unique identifier. Essential for junction tables in N:M relationships:\n\n```sql\nCREATE TABLE enrollment (\n  student_id INTEGER,\n  course_id INTEGER,\n  grade TEXT,\n  PRIMARY KEY (student_id, course_id),\n  FOREIGN KEY (student_id) REFERENCES students(id),\n  FOREIGN KEY (course_id) REFERENCES courses(id)\n);\n```\n\nThis prevents duplicate enrollments \u2014 the same pair cannot appear twice.\n\n**Goal:** Create an `orders` and `products` table, and a junction table `order_items` with a composite primary key on (`order_id`, `product_id`). Include a `quantity` column.",seed:i,check:{type:"constraints",table:"order_items",tokens:["primary key"]},hint:"CREATE TABLE orders (id INTEGER PRIMARY KEY, date TEXT); CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY (order_id, product_id), FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));"},{id:"14-relationship-n-m",module:2,title:"Many-to-Many Relationships",type:"practice",file:"14-relationship-n-m.sql",markdown:"# Many-to-Many Relationships\n\nN:M requires a junction table. The junction table uses a composite PK to prevent duplicates:\n\n```sql\nCREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);\nCREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);\nCREATE TABLE enrollment (\n  student_id INTEGER,\n  course_id INTEGER,\n  PRIMARY KEY (student_id, course_id),\n  FOREIGN KEY (student_id) REFERENCES students(id),\n  FOREIGN KEY (course_id) REFERENCES courses(id)\n);\n```\n\n**Goal:** Create `actors`, `movies`, and a junction table `cast` with a composite primary key on (`actor_id`, `movie_id`).",seed:i,check:{type:"constraints",table:"cast",tokens:["primary key"]},hint:"CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT); CREATE TABLE cast (actor_id INTEGER, movie_id INTEGER, PRIMARY KEY (actor_id, movie_id), FOREIGN KEY (actor_id) REFERENCES actors(id), FOREIGN KEY (movie_id) REFERENCES movies(id));"},{id:"09-alter-table",module:2,title:"ALTER TABLE",type:"practice",file:"09-alter-table.sql",markdown:"# ALTER TABLE\n\nModify existing tables with `ALTER TABLE`:\n\n```sql\nALTER TABLE table ADD COLUMN column TYPE;\nALTER TABLE table RENAME COLUMN old TO new;\nALTER TABLE table DROP COLUMN column;\n```\n\nThe `users` table already has columns: id, name, city, age, email.\n\n**Goal:** Add a column `phone` (TEXT) to `users`, then rename `phone` to `phone_number`.",seed:e,check:{type:"schema",table:"users",columns:["id","name","city","age","email","phone_number"]},hint:"ALTER TABLE users ADD COLUMN phone TEXT; then ALTER TABLE users RENAME COLUMN phone TO phone_number;"},{id:"15-drop-table",module:2,title:"DROP TABLE",type:"practice",file:"11-drop-table.sql",markdown:"# DROP TABLE\n\n`DROP TABLE` removes a table and all its data permanently:\n\n```sql\nDROP TABLE table_name;\nDROP TABLE IF EXISTS table_name;  -- no error if missing\n```\n\n**Goal:** Drop the `users` table. Then run `SELECT * FROM sqlite_master WHERE type='table'` to verify it's gone.",seed:e,check:{type:"success"},hint:"DROP TABLE users;"},{id:"10-schema",module:2,title:"Schema Design",type:"theory",file:"10-schema.md",markdown:`# Schema design

Relationships can be one-to-one, one-to-many, or many-to-many.

**Goal:** know when a junction table is used.`,question:{prompt:"Which relationship uses a junction table?",options:["One-to-one","One-to-many","Many-to-many","Self-referencing"],answer:2,explanation:"Many-to-many relationships need a junction table."},seed:e}];var h=[{id:"12-attach",module:3,title:"Your First Database",type:"practice",file:"12-attach.sql",sql:`SELECT name FROM sqlite_master WHERE type = 'table';
`,markdown:"# Your first database\n\nUse `SELECT` to read data from a table:\n\n```sql\nSELECT column1, column2 FROM tablename;\n```\n\nUse `*` to select all columns. Use `WHERE` to filter rows.\n\nSQLite stores metadata about all tables in a system table called `sqlite_master`. It has columns like `name`, `type`, and `sql`.\n\nTry querying `sqlite_master` to discover what tables exist in this database.\n\n**Goal:** a successful query shows at least one table.",seed:e,check:{type:"success"}},{id:"13-select",module:3,title:"Reading Data",type:"practice",file:"13-select.sql",sql:`SELECT * FROM users;
`,markdown:"# Reading data\n\nUse `SELECT` to read data from a table:\n\n```sql\nSELECT column1, column2 FROM tablename;\n```\n\nUse `*` as shorthand for all columns.\n\nDifferent tables can have columns with the same name (e.g., both `users` and `orders` might have `id`). Prefix with the table name to remove ambiguity:\n\n```sql\nSELECT users.name, orders.total FROM users, orders;\n```\n\nYou can also rename tables or columns with `AS` (alias):\n\n```sql\nSELECT u.name AS username FROM users AS u;\n```\n\nThe `AS` keyword is optional: `SELECT u.name FROM users u`.\n\n**Goal:** Write a query that returns all rows and all columns from the `users` table.",seed:e,check:{type:"result",expectedSql:"SELECT * FROM users;"}},{id:"14-where",module:3,title:"Filtering",type:"practice",file:"11-where.sql",sql:`SELECT name FROM users WHERE city = 'Berlin';
`,markdown:"# Filtering\n\nThe `WHERE` clause filters rows based on a condition.\n\n```sql\nSELECT columns FROM table WHERE condition;\n```\n\nUse `=` to compare values. String literals go in single quotes.\n\n**Goal:** Write a query that returns the names of users who live in Berlin.",seed:e,check:{type:"result",expectedSql:"SELECT name FROM users WHERE city = 'Berlin';"}},{id:"15-advanced-where",module:3,title:"Advanced Filtering",type:"practice",file:"12-advanced-where.sql",sql:`SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;
`,markdown:`# Advanced filtering

Combine multiple operators for precise filtering:

\`\`\`sql
SELECT columns FROM table
WHERE column IN (value1, value2)
  AND column BETWEEN x AND y
  AND column NOT IN (value)
ORDER BY column;
\`\`\`

- \`IN (...)\` \u2014 match any value in a list
- \`BETWEEN x AND y\` \u2014 match a range
- \`NOT IN (...)\` \u2014 exclude values
- \`AND\` \u2014 combine multiple conditions
- \`ORDER BY\` \u2014 sort results

**Goal:** Write a query that returns names of users who:
- Live in Berlin or Munich
- Are between 20 and 35 years old (inclusive)
- Are NOT 22 years old
- Sorted alphabetically by name`,seed:e,check:{type:"result",expectedSql:"SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;"}},{id:"16-null",module:3,title:"Working with NULL",type:"practice",file:"13-null.sql",sql:`SELECT name FROM users WHERE email IS NULL;
`,markdown:"# Working with NULL\n\n`NULL` represents missing or unknown data. You cannot use `= NULL` \u2014 instead use `IS NULL` or `IS NOT NULL`.\n\n```sql\nSELECT columns FROM table WHERE column IS NULL;\nSELECT columns FROM table WHERE column IS NOT NULL;\n```\n\nUse `COALESCE(val, default)` or `IFNULL(val, default)` to replace `NULL` with a fallback:\n\n```sql\nSELECT name, COALESCE(email, 'no email') FROM users;\n```\n\n**Goal:** Write a query that returns the names of users who do not have an email address.",seed:m,check:{type:"result",expectedSql:"SELECT name FROM users WHERE email IS NULL;"},hint:"Use WHERE email IS NULL \u2014 not = NULL."},{id:"17-like",module:3,title:"Pattern Matching",type:"practice",file:"14-like.sql",sql:`SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;
`,markdown:"# Pattern matching\n\n`LIKE` enables pattern matching with wildcards:\n- `%` \u2014 matches any sequence of characters\n- `_` \u2014 matches exactly one character\n\n```sql\nSELECT columns FROM table WHERE column LIKE pattern;\n```\n\n**Goal:** Write a query that returns names containing the letter 'a', sorted alphabetically.",seed:e,check:{type:"result",expectedSql:"SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;"}},{id:"18-insert",module:3,title:"Inserting Data",type:"practice",file:"15-insert.sql",sql:`INSERT INTO users (name, city, age, email) VALUES ('Kai', 'Berlin', 27, 'kai@example.com');
`,markdown:"# Inserting data\n\nUse `INSERT` to add rows to a table.\n\n```sql\nINSERT INTO tablename (col1, col2, ...) VALUES (val1, val2, ...);\n```\n\nThe `users` table has columns: id, name, city, age, email. The `id` column is auto-incrementing \u2014 you can omit it.\n\n**Goal:** Insert a new user into the `users` table.",seed:e,check:{type:"changes",min:1}},{id:"19-update",module:3,title:"Updating Data",type:"practice",file:"16-update.sql",sql:`UPDATE users SET city = 'Bremen' WHERE name = 'Mia';
`,markdown:"# Updating data\n\nUse `UPDATE` to modify existing rows.\n\n```sql\nUPDATE tablename SET column = value WHERE condition;\n```\n\nAlways include a `WHERE` clause \u2014 without it, every row gets updated!\n\n**Goal:** Update the city of a specific user in the `users` table.",seed:e,check:{type:"changes",min:1}},{id:"20-update-multi",module:3,title:"UPDATE Multiple Columns",type:"practice",file:"20-update-multi.sql",markdown:"# Update multiple columns\n\nSet multiple columns in one `UPDATE` by comma-separating them:\n\n```sql\nUPDATE users SET city = 'Berlin', age = 30 WHERE name = 'Mia';\n```\n\n**Goal:** Update both the city and the age of a user in the `users` table.",seed:e,check:{type:"changes",min:1},hint:"UPDATE users SET city = 'X', age = Y WHERE name = 'Z';"},{id:"21-delete",module:3,title:"Deleting Data",type:"practice",file:"21-delete.sql",sql:`DELETE FROM users WHERE name = 'Liam';
`,markdown:"# Deleting data\n\nUse `DELETE` to remove rows.\n\n```sql\nDELETE FROM tablename WHERE condition;\n```\n\nAlways include a `WHERE` clause \u2014 without it, all rows are deleted!\n\n**Goal:** Delete a specific user from the `users` table by their name.",seed:e,check:{type:"changes",min:1}},{id:"22-delete-danger",module:3,title:"Danger of DELETE",type:"theory",file:"22-delete-danger.md",markdown:`# Danger of DELETE

Always include WHERE unless you truly want to delete everything.

**Goal:** know what happens without WHERE.`,question:{prompt:"What happens if you run DELETE FROM users without WHERE?",options:["Only the first row is deleted","Nothing happens","All rows are deleted","It deletes the table"],answer:2,explanation:"Without WHERE, every row is removed."},seed:e},{id:"23-insert-select",module:3,title:"INSERT INTO SELECT",type:"practice",file:"23-insert-select.sql",markdown:`# INSERT INTO ... SELECT

Copy rows from one table into another:

\`\`\`sql
INSERT INTO target_table (columns)
SELECT columns FROM source_table WHERE condition;
\`\`\`

Both tables must exist. The column types must match.

**Goal:** Create a table \`admins\` with the same columns as \`users\`, then copy only users from Berlin into it.`,seed:e,check:{type:"result",expectedSql:"SELECT name, city FROM admins ORDER BY name;"}},{id:"24-crud-mastery",module:3,title:"CRUD Mastery",type:"practice",file:"24-crud-mastery.sql",markdown:`# CRUD mastery

Combine everything you learned: create, insert, update, delete, and query.

**Goal:**
1. Create a table \`inventory\` with columns \`id\` (INTEGER PRIMARY KEY), \`item\` (TEXT NOT NULL), \`quantity\` (INTEGER NOT NULL)
2. Insert 3 items: 'Laptop' (5), 'Mouse' (20), 'Keyboard' (15)
3. Update 'Mouse' quantity to 25
4. Delete 'Keyboard'
5. Write a SELECT to show remaining items sorted by item name`,seed:"",check:{type:"result",expectedSql:"SELECT item, quantity FROM inventory ORDER BY item;"}},{id:"25-insert-multi",module:3,title:"INSERT Multiple Rows",type:"practice",file:"25-insert-multi.sql",markdown:`# INSERT multiple rows

Insert several rows in one statement by comma-separating the value lists:

\`\`\`sql
INSERT INTO table (col1, col2) VALUES
  (val1a, val2a),
  (val1b, val2b),
  (val1c, val2c);
\`\`\`

The \`users\` table has columns: id, name, city, age, email. The \`id\` is auto-incrementing \u2014 omit it.

**Goal:** Insert 3 new users at once into \`users\`.`,seed:e,check:{type:"changes",min:3},hint:"INSERT INTO users (name, city, age) VALUES ('A', 'B', 20), ('C', 'D', 30), ('E', 'F', 40);"}];var R=[{id:"19-sort",module:4,title:"Sorting",type:"practice",file:"19-sort.sql",markdown:"# Sorting\n\nUse `ORDER BY` to sort results:\n\n```sql\nSELECT columns FROM table ORDER BY column;\n```\n\nUse `ASC` for ascending (default) or `DESC` for descending. Sort by multiple columns with commas.\n\n**Goal:** Write a query that returns `name` and `age` from `users`, sorted by age from youngest to oldest.",seed:e,check:{type:"result",expectedSql:"SELECT name, age FROM users ORDER BY age;"}},{id:"20-limit",module:4,title:"Limiting Results",type:"practice",file:"20-limit.sql",markdown:`# Limiting results

Use \`LIMIT\` to restrict how many rows are returned:

\`\`\`sql
SELECT columns FROM table LIMIT count;
SELECT columns FROM table LIMIT count OFFSET skip;
\`\`\`

**Goal:** Write a query that returns the names of the 3 oldest users, sorted oldest first.`,seed:e,check:{type:"result",expectedSql:"SELECT name FROM users ORDER BY age DESC LIMIT 3;"}},{id:"21-aggregates",module:4,title:"Aggregate Functions",type:"practice",file:"21-aggregates.sql",markdown:"# Aggregate functions\n\nAggregate functions summarize many rows into one value:\n\n```sql\nSELECT COUNT(*), AVG(column), SUM(column), MIN(column), MAX(column) FROM table;\n```\n\n- `COUNT(*)` \u2014 number of rows\n- `AVG(col)` \u2014 average value\n- `SUM(col)` \u2014 total\n- `MIN(col)` / `MAX(col)` \u2014 smallest / largest\n\nCombine with `ROUND()` to control decimal places: `ROUND(AVG(age), 2)`\n\n**Goal:** Write a query that returns the total number of users and their average age rounded to 2 decimals. Use `COUNT(*)` and `ROUND(AVG(age), 2)`.",seed:l,check:{type:"result",expectedSql:"SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;"},hint:"SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;"},{id:"22-group",module:4,title:"Grouping",type:"practice",file:"22-group.sql",markdown:"# Grouping\n\n`GROUP BY` groups rows that share a value, so aggregate functions work per group:\n\n```sql\nSELECT column, COUNT(*) FROM table GROUP BY column;\n```\n\nUse `HAVING` to filter groups (like `WHERE` but for groups):\n\n```sql\nSELECT column, COUNT(*) FROM table GROUP BY column HAVING COUNT(*) > 1;\n```\n\n**Goal:** Write a query that counts how many users live in each city. Show only cities with at least 2 users, sorted alphabetically.",seed:l,check:{type:"result",expectedSql:"SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;"},hint:"GROUP BY city, then HAVING COUNT(*) >= 2"},{id:"23-distinct",module:4,title:"Distinct Values",type:"practice",file:"23-distinct.sql",markdown:"# Distinct values\n\n`DISTINCT` removes duplicate values from results:\n\n```sql\nSELECT DISTINCT column FROM table;\n```\n\n**Goal:** Write a query that returns all unique cities from the `users` table, without duplicates.",seed:e,check:{type:"result",expectedSql:"SELECT DISTINCT city FROM users;"}},{id:"24-alias",module:4,title:"Aliases",type:"practice",file:"24-alias.sql",markdown:"# Aliases\n\n`AS` renames columns or tables in query results:\n\n```sql\nSELECT column AS alias_name FROM table AS table_alias;\n```\n\nThe `AS` keyword is optional: `SELECT column alias FROM table t`.\n\n**Goal:** Write a query that returns `name` renamed to `user_name` and `age` renamed to `user_age` from the `users` table.",seed:e,check:{type:"result",expectedSql:"SELECT name AS user_name, age AS user_age FROM users;"}},{id:"25-query-mastery",module:4,title:"Query Mastery",type:"practice",file:"25-query-mastery.sql",markdown:`# Query mastery

Combine grouping, filtering, sorting, and aggregates into one query.

The \`users\` table has users in multiple cities with different ages.

**Goal:** Write a query that shows for each city: the city name, the number of users, and the average age \u2014 but only for cities with at least 2 users. Sort by average age descending.`,seed:l,check:{type:"result",expectedSql:"SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;"}},{id:"26-union",module:4,title:"UNION",type:"practice",file:"26-union.sql",markdown:"# UNION\n\n`UNION` combines results from two queries into one set. Duplicates are removed automatically. Use `UNION ALL` to keep duplicates:\n\n```sql\nSELECT column FROM table_a\nUNION\nSELECT column FROM table_b;\n```\n\nBoth SELECTs must have the same number of columns with compatible types.\n\n**Goal:** Write a query that returns all unique city names from `customers` and all unique city names from `users` combined into one list, sorted alphabetically.",seed:a+`
`+e,check:{type:"result",expectedSql:"SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;"},hint:"SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;"}];var N=[{id:"25-inner-join",module:5,title:"INNER JOIN",type:"practice",file:"25-inner-join.sql",markdown:"# INNER JOIN\n\n`INNER JOIN` combines rows from two tables where a condition matches:\n\n```sql\nSELECT a.col, b.col FROM table_a\nINNER JOIN table_b ON a.id = b.foreign_id;\n```\n\nUse `table.column` notation to avoid ambiguity when both tables have the same column name.\n\nOnly rows with matches in both tables appear.\n\n**Goal:** Write a query that shows each customer name alongside their order item. Use `INNER JOIN` on `customers.id = orders.customer_id`.",seed:a,check:{type:"result",expectedSql:"SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;"}},{id:"26-left-join",module:5,title:"LEFT JOIN",type:"practice",file:"26-left-join.sql",markdown:"# LEFT JOIN\n\n`LEFT JOIN` keeps ALL rows from the left table, even without matches. Unmatched right columns show `NULL`:\n\n```sql\nSELECT a.col, b.col FROM table_a\nLEFT JOIN table_b ON a.id = b.foreign_id;\n```\n\n**Goal:** Write a query that shows ALL customers and their order items. Customers without orders should still appear (item shows NULL).",seed:a,check:{type:"result",expectedSql:"SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;"}},{id:"27-right-join",module:5,title:"RIGHT JOIN (Theory)",type:"theory",file:"27-right-join.md",markdown:"# RIGHT JOIN\n\n`RIGHT JOIN` keeps ALL rows from the right table. SQLite does not support it \u2014 use `LEFT JOIN` and swap the tables.\n\n**Goal:** know how to simulate RIGHT JOIN.",question:{prompt:"How do you simulate RIGHT JOIN in SQLite?",options:["Use RIGHT JOIN anyway","Swap tables and use LEFT JOIN","Use INNER JOIN","Use CROSS JOIN"],answer:1,explanation:"Swap the table order and use LEFT JOIN to get the same effect."},seed:a},{id:"28-full-join",module:5,title:"FULL OUTER JOIN (Theory)",type:"theory",file:"28-full-join.md",markdown:"# FULL OUTER JOIN\n\n`FULL OUTER JOIN` keeps rows from both sides. Not supported in SQLite \u2014 combine LEFT JOIN and RIGHT JOIN with `UNION`.\n\n**Goal:** know the concept even if SQLite cannot run it.",question:{prompt:"Which SQL operation combines LEFT JOIN and RIGHT JOIN results?",options:["UNION","INTERSECT","EXCEPT","CROSS JOIN"],answer:0,explanation:"UNION combines the results of LEFT JOIN and RIGHT JOIN to simulate FULL OUTER JOIN."},seed:a},{id:"29-self-join",module:5,title:"Self Joins",type:"practice",file:"29-self-join.sql",markdown:"# Self joins\n\nA self join joins a table to itself. Use different aliases to tell them apart:\n\n```sql\nSELECT a.col, b.col FROM table AS a\nINNER JOIN table AS b ON a.id = b.ref_id;\n```\n\nThe `employees` table has `manager_id` referencing `id` in the same table.\n\n**Goal:** Write a query that shows each employee name alongside their manager name. Use `LEFT JOIN` so top-level employees (no manager) still appear.",seed:E,check:{type:"result",expectedSql:"SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;"}},{id:"30-multi-join",module:5,title:"Joining Multiple Tables",type:"practice",file:"30-multi-join.sql",markdown:"# Joining multiple tables\n\nChain multiple `JOIN` clauses to combine three or more tables:\n\n```sql\nSELECT a.col, b.col, c.col\nFROM table_a a\nINNER JOIN table_b b ON a.id = b.a_id\nINNER JOIN table_c c ON b.id = c.b_id;\n```\n\n**Goal:** Write a query showing each customer name, product name, and order quantity by joining `customers`, `orders`, and `products`.",seed:c,check:{type:"result",expectedSql:"SELECT customers.name, products.name, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;"}},{id:"31-join-mastery",module:5,title:"Join Mastery",type:"practice",file:"31-join-mastery.sql",markdown:"# Join mastery\n\nCombine joins, aggregation, and ordering across multiple tables.\n\nThe database has `customers`, `orders`, and `products` tables.\n\n**Goal:** Write a query that shows each customer name, the total quantity of products they ordered, and the number of distinct products they bought. Only show customers who ordered at least 2 total items. Sort by total quantity descending.",seed:c,check:{type:"result",expectedSql:"SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;"}}];var y=[{id:"31-subquery-where",module:6,title:"Subquery in WHERE",type:"practice",file:"31-subquery-where.sql",markdown:"# Subquery in WHERE\n\nA subquery is a query inside another query. Use it in `WHERE` with `IN`:\n\n```sql\nSELECT columns FROM table\nWHERE id IN (SELECT foreign_id FROM other_table WHERE condition);\n```\n\n**Goal:** Write a query that returns the names of customers who have placed orders worth more than 100. Use a subquery with `WHERE id IN`.",seed:a,check:{type:"result",expectedSql:"SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE price > 100);"}},{id:"32-subquery-select",module:6,title:"Subquery in SELECT",type:"practice",file:"32-subquery-select.sql",markdown:`# Subquery in SELECT

A subquery in \`SELECT\` computes a value for each row. It must return a single value:

\`\`\`sql
SELECT column, (SELECT COUNT(*) FROM other WHERE other.id = main.id) AS alias
FROM table;
\`\`\`

The subquery runs once per row \u2014 it references the outer query's values.

**Goal:** Write a query that shows each customer name alongside the number of orders they placed. Use a subquery in SELECT with \`COUNT(*)\`.`,seed:a,check:{type:"result",expectedSql:"SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count FROM customers;"}},{id:"33-subquery-from",module:6,title:"Subquery in FROM",type:"practice",file:"33-subquery-from.sql",markdown:"# Subquery in FROM\n\nA subquery in `FROM` acts like a temporary table. It must have an alias:\n\n```sql\nSELECT columns FROM (SELECT ...) AS alias WHERE condition;\n```\n\n**Goal:** Write a query that finds all expensive items (price > 50) by querying from a subquery that selects all orders. Use `FROM (SELECT * FROM orders) AS expensive` and filter with WHERE.",seed:a,check:{type:"result",expectedSql:"SELECT item, price FROM (SELECT * FROM orders) AS expensive WHERE price > 50;"}},{id:"34-correlated",module:6,title:"Correlated Subqueries",type:"practice",file:"34-correlated.sql",markdown:`# Correlated subqueries

A correlated subquery references the outer query's values and runs once per outer row:

\`\`\`sql
SELECT columns FROM table_a AS a
WHERE column > (SELECT AVG(column) FROM table_b WHERE b.id = a.id);
\`\`\`

**Goal:** Write a query that returns items from \`orders\` that cost more than the average price across all orders.`,seed:a,check:{type:"result",expectedSql:"SELECT item, price FROM orders WHERE price > (SELECT AVG(price) FROM orders);"}},{id:"35-exists",module:6,title:"EXISTS",type:"practice",file:"35-exists.sql",markdown:"# EXISTS\n\n`EXISTS` checks whether a subquery returns any rows. It is often faster than `IN`:\n\n```sql\nSELECT columns FROM table_a AS a\nWHERE EXISTS (SELECT 1 FROM table_b WHERE b.ref_id = a.id);\n```\n\n**Goal:** Write a query that returns the names of customers who have placed at least one order. Use `EXISTS`.",seed:a,check:{type:"result",expectedSql:"SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = customers.id);"}},{id:"36-cte",module:6,title:"Common Table Expressions",type:"practice",file:"36-cte.sql",markdown:`# Common Table Expressions

A CTE (WITH clause) names a subquery for reuse in the main query:

\`\`\`sql
WITH name AS (
  SELECT ... FROM ...
)
SELECT columns FROM name WHERE condition;
\`\`\`

**Goal:** Write a query using a CTE called \`avg_price\` that calculates the average price, then use it to find all items with a price above that average.`,seed:a,check:{type:"result",expectedSql:"WITH avg_price AS (SELECT AVG(price) AS avg FROM orders) SELECT item, price FROM orders, avg_price WHERE price > avg_price.avg;"}},{id:"37-recursive-cte",module:6,title:"Recursive CTEs (Theory)",type:"theory",file:"37-recursive-cte.md",markdown:`# Recursive CTEs

Recursive CTEs reference themselves to handle hierarchical data (org charts, trees, graphs). Use \`UNION ALL\` to combine the anchor and recursive steps.

**Goal:** know when recursive CTEs are useful.`,question:{prompt:"What kind of data is a recursive CTE best for?",options:["Flat tables","Hierarchical data like org charts","Single-row results","Aggregated data"],answer:1,explanation:"Recursive CTEs excel at querying tree structures like employee hierarchies."},seed:E}];var L=[{id:"38-why-normalize",module:7,title:"Why Normalize?",type:"theory",file:"38-why-normalize.md",markdown:`# Why normalize?

Normalization reduces data redundancy and prevents anomalies (update, insert, delete). Split data into related tables instead of one big table.

**Goal:** know the main benefit of normalization.`,question:{prompt:"What is the main benefit of normalization?",options:["Less data redundancy","More storage used","More columns","Faster queries"],answer:0,explanation:"Normalization eliminates redundant data, preventing inconsistencies."},seed:n},{id:"39-1nf",module:7,title:"First Normal Form (1NF)",type:"practice",file:"39-1nf.sql",markdown:`# First Normal Form

A table is in 1NF when:
- Each column has atomic (indivisible) values
- Each row has a primary key
- No repeating groups

The \`orders_denorm\` table repeats customer info per order. Split it into two tables:

\`\`\`sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL);
\`\`\`

**Goal:** Create the \`customers\` and \`orders\` tables as shown above to achieve 1NF.`,seed:n,check:{type:"schema",table:"customers",columns:["id","name","city"]}},{id:"40-2nf",module:7,title:"Second Normal Form (2NF)",type:"practice",file:"40-2nf.sql",markdown:"# Second Normal Form\n\nA table is in 2NF when:\n- It is in 1NF\n- Every non-key column depends on the WHOLE primary key (no partial dependency)\n\nThe `orders_denorm` table has `product` depending on `id` but `category` depends on `product`, not the order. Create three tables:\n\n```sql\nCREATE TABLE customers (...);\nCREATE TABLE products (...);\nCREATE TABLE orders (...);\n```\n\n**Goal:** Create `customers` (id, name, city), `products` (id, name, category), and `orders` (id, customer_id, product_id) tables.",seed:n,check:{type:"schema",table:"products",columns:["id","name","category"]}},{id:"41-3nf",module:7,title:"Third Normal Form (3NF)",type:"practice",file:"41-3nf.sql",markdown:"# Third Normal Form\n\nA table is in 3NF when:\n- It is in 2NF\n- No transitive dependency (a non-key column depends on another non-key column)\n\nHere `customer_city` depends on `customer`, not on the order id. You already split this in 1NF. The `orders_denorm` violates 3NF because `customer_city` depends on `customer`, not the order primary key.\n\n**Goal:** Create `customers` (id, name, city) and `orders` (id, customer_id, product, price). Make `customer_id` a foreign key referencing `customers(id)`.",seed:n,check:{type:"fk",table:"orders",column:"customer_id"}},{id:"42-denormalization",module:7,title:"Denormalization",type:"theory",file:"42-denormalization.md",markdown:`# Denormalization

Denormalization intentionally adds redundancy for read performance. Used in reporting / analytics where writes are rare.

**Goal:** know when to denormalize.`,question:{prompt:"When is denormalization useful?",options:["Always","When data must be unique","Never","When read performance matters more than write efficiency"],answer:3,explanation:"Denormalization speeds up reads by reducing joins, at the cost of redundant data."},seed:n}];var I=[{id:"43-what-index",module:8,title:"What is an Index?",type:"theory",file:"43-what-index.md",markdown:`# What is an index?

An index is a data structure (B-Tree) that speeds up lookups. Like a book index \u2014 instead of scanning every page, jump to the right spot. Trade-off: faster reads, slower writes.

\`PRIMARY KEY\` columns are automatically indexed \u2014 and this index is faster than a manual index on a regular column because the B-Tree is built on a unique, non-null key.

**Goal:** know what an index does and that PKs get a free index.`,question:{prompt:"Which columns are indexed automatically in SQLite?",options:["All columns","PRIMARY KEY columns","TEXT columns","No columns"],answer:1,explanation:"PRIMARY KEY columns get an automatic B-Tree index, which is faster than a manual index on a non-PK column."},seed:s},{id:"44-create-index",module:8,title:"Creating Indexes",type:"practice",file:"44-create-index.sql",markdown:"# Creating indexes\n\nUse `CREATE INDEX` to add an index:\n\n```sql\nCREATE INDEX index_name ON table (column);\n```\n\nNote: `PRIMARY KEY` columns are already indexed automatically \u2014 they don't need (and can't have) a duplicate manual index. This is for non-PK columns.\n\n**Goal:** Create an index named `idx_category` on the `products` table for the `category` column.",seed:s,check:{type:"success"}},{id:"45-explain-plan",module:8,title:"Query Planning",type:"practice",file:"45-explain-plan.sql",markdown:"# Query planning\n\n`EXPLAIN QUERY PLAN` shows how SQLite executes a query. Use it to see if indexes are used:\n\n```sql\nEXPLAIN QUERY PLAN SELECT * FROM table WHERE column = value;\n```\n\n**Goal:** Run `EXPLAIN QUERY PLAN` on a query that selects from `products` where category is 'Electronics'.",seed:s,check:{type:"success"}},{id:"46-composite-index",module:8,title:"Composite Indexes",type:"practice",file:"46-composite-index.sql",markdown:"# Composite indexes\n\nA composite index covers multiple columns:\n\n```sql\nCREATE INDEX index_name ON table (col1, col2);\n```\n\nThe column order matters \u2014 leftmost columns first.\n\n**Goal:** Create a composite index named `idx_cat_price` on `products` covering `category` then `price`. Then create an index named `idx_stock` on `stock`.",seed:s,check:{type:"changes",min:0}},{id:"47-no-index",module:8,title:"When NOT to Index",type:"theory",file:"47-no-index.md",markdown:`# When NOT to index

Avoid indexes on:
- Small tables (full scan is fast enough)
- Columns updated frequently (index maintenance cost)
- Columns with few unique values (low selectivity)

**Goal:** know when indexes hurt more than help.`,question:{prompt:"Which column is a bad candidate for an index?",options:["A primary key","A column with many unique values","A column with only two possible values","A foreign key"],answer:2,explanation:"Low-selectivity columns (few unique values) make poor indexes since they do not narrow results much."},seed:s}];var A=[{id:"48-acid",module:9,title:"ACID Properties",type:"theory",file:"48-acid.md",markdown:`# ACID properties

Transactions guarantee:
- **Atomicity** \u2014 all or nothing
- **Consistency** \u2014 data stays valid
- **Isolation** \u2014 concurrent transactions don't interfere
- **Durability** \u2014 committed data persists

**Goal:** know what ACID stands for.`,question:{prompt:"What does the I in ACID stand for?",options:["Index","Isolation","Integrity","Insert"],answer:1,explanation:"Isolation ensures concurrent transactions do not interfere with each other."},seed:""},{id:"49-begin",module:9,title:"Starting Transactions",type:"practice",file:"49-begin.sql",markdown:"# Starting transactions\n\nWrap operations in `BEGIN TRANSACTION` and `COMMIT`:\n\n```sql\nBEGIN TRANSACTION;\nCREATE TABLE ...;\nINSERT INTO ...;\nCOMMIT;\n```\n\n**Goal:** Create a table `tasks` with columns `id` (INTEGER PRIMARY KEY) and `title` (TEXT NOT NULL) inside a transaction, then COMMIT.",seed:"",check:{type:"schema",table:"tasks",columns:["id","title"]}},{id:"50-commit",module:9,title:"Committing",type:"practice",file:"50-commit.sql",markdown:"# Committing\n\n`COMMIT` saves all changes made since `BEGIN TRANSACTION`. Changes become visible and permanent.\n\n**Goal:** Insert a row into the `tasks` table (created in previous lesson) inside a transaction and COMMIT. The table already exists from the seed.",seed:"",check:{type:"changes",min:1}},{id:"51-rollback",module:9,title:"Rolling Back",type:"practice",file:"51-rollback.sql",markdown:"# Rolling back\n\n`ROLLBACK` undoes all changes since `BEGIN TRANSACTION`:\n\n```sql\nBEGIN;\nDELETE FROM table;\nROLLBACK; -- nothing happened\n```\n\n**Goal:** Delete all rows from `tasks` inside a transaction, then ROLLBACK. The rows should still exist after. Check with `SELECT COUNT(*) FROM tasks` to verify.",seed:"",check:{type:"success"}},{id:"52-savepoint",module:9,title:"Savepoints",type:"practice",file:"52-savepoint.sql",markdown:`# Savepoints

Savepoints allow partial rollbacks within a transaction:

\`\`\`sql
SAVEPOINT sp;
... some work ...
ROLLBACK TO sp; -- undo to savepoint
COMMIT;
\`\`\`

**Goal:** Insert two rows into \`tasks\` after a SAVEPOINT, then ROLLBACK TO that savepoint, insert one more row, and COMMIT. Only the last row persists.`,seed:"",check:{type:"changes",min:1}}];var S=[{id:"53-views",module:10,title:"Views",type:"practice",file:"53-views.sql",markdown:"# Views\n\nA view is a saved query that acts like a virtual table:\n\n```sql\nCREATE VIEW view_name AS SELECT ...;\n```\n\n**Goal:** Create a view called `customer_orders` that shows customer names alongside their order items (use INNER JOIN).",seed:a,check:{type:"success"}},{id:"54-triggers",module:10,title:"Triggers",type:"practice",file:"54-triggers.sql",markdown:"# Triggers\n\nA trigger runs automatically before or after an INSERT, UPDATE, or DELETE:\n\n```sql\nCREATE TRIGGER trigger_name\nBEFORE DELETE ON table\nBEGIN\n  ... actions ...\nEND;\n```\n\n**Goal:** Create a trigger named `prevent_empty` that prevents deleting the last product in any category. Use `BEFORE DELETE` on `products` with `RAISE(ABORT, '...')` when the category would become empty.",seed:s,check:{type:"success"}},{id:"55-window",module:10,title:"Window Functions",type:"practice",file:"55-window.sql",markdown:"# Window functions\n\nWindow functions compute values across a set of rows related to the current row:\n\n```sql\nSELECT column, ROW_NUMBER() OVER (ORDER BY col) AS rank FROM table;\n```\n\n`ROW_NUMBER()`, `RANK()`, `SUM() OVER` are common window functions.\n\n**Goal:** Write a query that returns each product name, price, and a row number ordered by price descending (most expensive first).",seed:s,check:{type:"result",expectedSql:"SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS rank FROM products;"}},{id:"56-case",module:10,title:"CASE Statements",type:"practice",file:"56-case.sql",markdown:`# CASE statements

\`CASE\` adds conditional logic to queries:

\`\`\`sql
SELECT column,
  CASE WHEN condition THEN value ELSE other END AS alias
FROM table;
\`\`\`

**Goal:** Write a query that returns each product name and a label column: 'Cheap' if price < 100, 'Moderate' if price BETWEEN 100 AND 500, 'Expensive' if price > 500. Sort by price ascending.`,seed:s,check:{type:"result",expectedSql:"SELECT name, CASE WHEN price < 100 THEN 'Cheap' WHEN price BETWEEN 100 AND 500 THEN 'Moderate' ELSE 'Expensive' END AS label FROM products ORDER BY price;"}},{id:"57-datetime",module:10,title:"Date and Time Functions",type:"practice",file:"57-datetime.sql",markdown:"# Date and time functions\n\nSQLite has functions for date arithmetic:\n\n```sql\nDATE('now')           -- today\nDATE('now', '+1 day') -- tomorrow\nSTRFTIME('%Y', col)   -- extract year\n```\n\nThe `events` table has `name` and `event_date` (TEXT in ISO format 'YYYY-MM-DD').\n\n**Goal:** Write a query that returns event names and their month number (1-12) extracted from `event_date`. Use `STRFTIME('%m', event_date)` and alias it as `month`. Sort by event_date.",seed:u,check:{type:"result",expectedSql:"SELECT name, STRFTIME('%m', event_date) AS month FROM events ORDER BY event_date;"}},{id:"58-capstone",module:10,title:"Final Capstone",type:"practice",file:"58-capstone.sql",markdown:`# Final capstone

Build a library system from scratch. Create the schema, add data, and write queries.

**Goal:**
1. Create \`members\` (id INTEGER PK, name TEXT NOT NULL, joined_date TEXT)
2. Create \`books\` (id INTEGER PK, title TEXT NOT NULL, author TEXT NOT NULL)
3. Create \`loans\` (id INTEGER PK, member_id INTEGER FK, book_id INTEGER FK, loan_date TEXT, returned INTEGER DEFAULT 0)
4. Insert 2 members, 3 books, and 2 loans
5. Write a query showing which books are currently on loan (returned = 0), including member name and book title \u2014 use JOIN`,seed:i,check:{type:"schema",table:"loans",columns:["id","member_id","book_id","loan_date","returned"]}}];var ae={1:"Database Fundamentals",2:"Schema & Constraints",3:"CRUD Operations",4:"Query Power Tools",5:"Joins",6:"Subqueries & CTEs",7:"Normalization",8:"Indexes & Performance",9:"Transactions",10:"Advanced Topics"};function o(O){return O.map((r,d)=>({...r,_order:r.order??d})).sort((r,d)=>r._order-d._order)}var se=[...o(T),...o(p),...o(h),...o(R),...o(N),...o(y),...o(L),...o(I),...o(A),...o(S)];export{e as a,ae as b,se as c};
