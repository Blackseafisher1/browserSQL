var n="PRAGMA foreign_keys = ON;",e=`
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
`,t=`
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
`,d=`
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
`,i=`
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
`,o=`
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
`,b=`
CREATE TABLE schueler (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  klasse TEXT NOT NULL,
  geburtsdatum TEXT NOT NULL
);
CREATE TABLE faecher (
  id INTEGER PRIMARY KEY,
  bezeichnung TEXT NOT NULL,
  kuerzel TEXT NOT NULL
);
CREATE TABLE noten (
  id INTEGER PRIMARY KEY,
  schueler_id INTEGER NOT NULL,
  fach_id INTEGER NOT NULL,
  note REAL NOT NULL,
  datum TEXT NOT NULL,
  FOREIGN KEY (schueler_id) REFERENCES schueler(id),
  FOREIGN KEY (fach_id) REFERENCES faecher(id)
);
CREATE TABLE lehrer (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  kuerzel TEXT NOT NULL
);
CREATE TABLE unterrichtet (
  lehrer_id INTEGER NOT NULL,
  fach_id INTEGER NOT NULL,
  PRIMARY KEY (lehrer_id, fach_id),
  FOREIGN KEY (lehrer_id) REFERENCES lehrer(id),
  FOREIGN KEY (fach_id) REFERENCES faecher(id)
);
INSERT INTO schueler VALUES
  (1, 'M\xFCller, Anna', 'Q1', '2007-03-15'),
  (2, 'Schmidt, Ben', 'Q1', '2007-07-22'),
  (3, '\xC7i\xE7ek, Zeynep', 'Q1', '2006-11-08'),
  (4, 'Nowak, Clara', 'Q1', '2007-01-30'),
  (5, 'Fischer, David', 'Q1', '2006-09-14'),
  (6, 'Weber, Emma', '10a', '2008-05-03'),
  (7, 'Becker, Finn', '10a', '2008-12-19'),
  (8, 'Hoffmann, Greta', '10b', '2008-08-27'),
  (9, 'Sch\xE4fer, Henrik', '10b', '2009-02-11'),
  (10, 'Koch, Ida', '9c', '2009-06-07'),
  (11, 'Bauer, Jan', '9c', '2009-10-25'),
  (12, 'Richter, Klara', '9c', '2009-04-16'),
  (13, 'Klein, Leon', 'Q1', '2006-12-01'),
  (14, 'Wolf, Mia', 'Q1', '2007-05-18'),
  (15, 'Schr\xF6der, Noah', '10a', '2008-03-29');
INSERT INTO faecher VALUES
  (1, 'Mathematik', 'M'),
  (2, 'Deutsch', 'D'),
  (3, 'Englisch', 'E'),
  (4, 'Biologie', 'BI'),
  (5, 'Chemie', 'CH'),
  (6, 'Physik', 'PH'),
  (7, 'Geschichte', 'GE'),
  (8, 'Erdkunde', 'EK'),
  (9, 'Kunst', 'KU'),
  (10, 'Sport', 'SP');
INSERT INTO lehrer VALUES
  (1, 'Dr. Wagner', 'WAG'),
  (2, 'Kr\xFCger, Sabine', 'KRU'),
  (3, 'Mertens, Thomas', 'MER'),
  (4, 'Schneider, Julia', 'SCH'),
  (5, 'Fischer, Klaus', 'FIS'),
  (6, 'Lehmann, Petra', 'LEH'),
  (7, 'Zimmermann, Dirk', 'ZIM'),
  (8, 'Hartmann, Nicole', 'HAR');
INSERT INTO unterrichtet VALUES
  (1, 1), (1, 6),
  (2, 2), (2, 7),
  (3, 3),
  (4, 4), (4, 5),
  (5, 8), (5, 9),
  (6, 10),
  (7, 1),
  (8, 2), (8, 3);
INSERT INTO noten (schueler_id, fach_id, note, datum) VALUES
  (1, 1, 2.0, '2025-01-15'), (1, 2, 3.0, '2025-01-15'), (1, 3, 1.0, '2025-01-15'), (1, 4, 2.0, '2025-01-20'),
  (2, 1, 3.0, '2025-01-15'), (2, 2, 2.0, '2025-01-15'), (2, 3, 3.0, '2025-01-15'), (2, 5, 4.0, '2025-01-20'),
  (3, 1, 1.0, '2025-01-15'), (3, 2, 1.0, '2025-01-15'), (3, 3, 2.0, '2025-01-15'), (3, 6, 1.0, '2025-01-20'),
  (4, 1, 4.0, '2025-01-15'), (4, 2, 3.0, '2025-01-15'), (4, 3, 4.0, '2025-01-15'), (4, 7, 3.0, '2025-01-20'),
  (5, 1, 3.0, '2025-01-15'), (5, 2, 4.0, '2025-01-15'), (5, 3, 5.0, '2025-01-15'), (5, 8, 3.0, '2025-01-20'),
  (6, 1, 2.0, '2025-02-01'), (6, 2, 3.0, '2025-02-01'), (6, 3, 2.0, '2025-02-01'),
  (7, 1, 5.0, '2025-02-01'), (7, 2, 4.0, '2025-02-01'), (7, 3, 3.0, '2025-02-01'),
  (8, 1, 1.0, '2025-02-01'), (8, 2, 2.0, '2025-02-01'), (8, 3, 3.0, '2025-02-01'),
  (9, 1, 3.0, '2025-02-01'), (9, 2, 5.0, '2025-02-01'), (9, 3, 4.0, '2025-02-01'),
  (10, 1, 4.0, '2025-02-15'), (10, 2, 3.0, '2025-02-15'), (10, 3, 2.0, '2025-02-15'),
  (11, 1, 2.0, '2025-02-15'), (11, 2, 3.0, '2025-02-15'), (11, 3, 1.0, '2025-02-15'),
  (12, 1, 5.0, '2025-02-15'), (12, 2, 4.0, '2025-02-15'), (12, 3, 5.0, '2025-02-15'),
  (13, 1, 1.0, '2025-01-15'), (13, 2, 2.0, '2025-01-15'), (13, 3, 2.0, '2025-01-15'), (13, 4, 3.0, '2025-01-20'), (13, 5, 2.0, '2025-01-20'),
  (14, 1, 3.0, '2025-01-15'), (14, 2, 2.0, '2025-01-15'), (14, 3, 4.0, '2025-01-15'), (14, 6, 2.0, '2025-01-20'),
  (15, 1, 4.0, '2025-02-01'), (15, 2, 3.0, '2025-02-01'), (15, 3, 5.0, '2025-02-01');
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
`,w=`
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  total_amount INTEGER NOT NULL
);

INSERT INTO customers (id, name, email)
VALUES (1, 'Alice', 'alice@example.com');

INSERT INTO customers (id, name, email)
VALUES (2, 'Bob', 'bob@example.com');

INSERT INTO customers (id, name, email)
VALUES (3, 'Charlie', 'charlie@example.com');

INSERT INTO customers (id, name, email)
VALUES (4, 'Diana', 'diana@example.com');

INSERT INTO customers (id, name, email)
VALUES (5, 'Evan', 'evan@example.com');

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (1, 1, '2023-02-15', 5000);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (2, 1, '2023-03-05', 7500);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (3, 2, '2023-03-18', 6200);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (4, 3, '2023-04-01', 8100);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (5, 4, '2023-03-30', 4300);

INSERT INTO orders (id, customer_id, order_date, total_amount)
VALUES (6, 5, '2023-01-10', 2900);
`;var T=[{id:"02-explore-editor",module:2,title:"Explore the Editor",type:"theory",file:"02-explore-editor.md",markdown:`# Explore the Editor

Welcome to **CashPal** \u2014 a fast-growing fintech startup. As their first data engineer, you'll build everything from scratch.

Before writing SQL, get familiar with the editor:

- **Left sidebar** \u2014 Files, Schema viewer, Tutorial panel
  - **Schema viewer** (bottom-left) lists all tables \u2014 expand one to see columns, types, and constraints
  - Click any table name to auto-run \`SELECT * FROM table LIMIT 100\`
- **Editor** \u2014 write SQL queries here (the main area)
- **Results** \u2014 query output appears below the editor
- **Execute** (Ctrl+Enter) \u2014 runs the current query
- **Verify** \u2014 checks your solution against the lesson goal

Try it: click around, open the Schema viewer, explore the \`users\` table.

**Goal:** get comfortable with the editor layout.`,question:{prompt:"Ready to write some SQL?",options:["Yes, let's go!","Let me look around some more"],answer:0,explanation:"Great! You can always come back to explore later."},seed:e},{id:"04-create",module:2,title:"Creating Tables",type:"practice",file:"04-create.sql",sql:`CREATE TABLE people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL
);
`,markdown:"# Creating Tables\n\nCashPal needs a `people` table to track employees and customers.\n\nUse `CREATE TABLE` to define a new table:\n\n```sql\nCREATE TABLE tablename (\n  column1 TYPE CONSTRAINTS,\n  column2 TYPE CONSTRAINTS\n);\n```\n\n**Your task:** Create the `people` table that CashPal needs.\n\n- [ ] Create a table called `people`\n- [ ] Column `id` must be INTEGER PRIMARY KEY\n- [ ] Column `name` must be TEXT NOT NULL\n- [ ] Column `age` must be INTEGER NOT NULL\n\n> **Tip:** After running, open the **Schema viewer** (bottom-left) and expand `people` to verify your work.",seed:"",check:{type:"schema",table:"people",columns:["id","name","age"]},checklist:["Table called people","Column id is INTEGER PRIMARY KEY","Column name is TEXT NOT NULL","Column age is INTEGER NOT NULL"]},{id:"05-types",module:2,title:"Data Types Deep Dive",type:"theory",file:"05-types.md",markdown:"# Data Types\n\nSQLite has 5 native storage classes, but accepts many SQL standard type names for compatibility:\n\n| Type | Stores | Use for |\n|------|--------|---------|\n| `INTEGER` | Whole numbers (-2\u2076\xB3 to 2\u2076\xB3-1) | IDs, counts, ages |\n| `REAL` | Floating-point decimals | Prices, measurements, averages |\n| `TEXT` | Strings (any length) | Names, descriptions, emails |\n| `BLOB` | Binary data (bytes) | Images, files, encrypted data |\n| `NULL` | Missing value | Unknown / empty |\n\n**Dates & times:** SQLite has no native DATE type. Store them as:\n- ISO8601 string \u2192 TEXT \u2014 `'2024-01-15'`\n- Unix timestamp \u2192 INTEGER \u2014 `1705276800`\n- Julian day \u2192 REAL \u2014 `2460423.5`\n\nSQLite date functions (`date()`, `datetime()`, `strftime()`) work with all three.\n\n**VARCHAR(n) and other fake types:** SQLite accepts `VARCHAR(255)`, `CHAR(20)`, `INT(10)` \u2014 but **ignores the size limit**. They all map to the underlying storage class. No truncation or padding occurs. This is for compatibility with other databases. To enforce length, use a CHECK constraint.\n\n**Type affinity:** SQLite is weakly typed. Unlike PostgreSQL or MySQL, it does **not** enforce column types. You can insert an integer into a TEXT column and SQLite accepts it. For CashPal's financial data, always use the correct type \u2014 just know SQLite won't stop you if you don't.\n\n**Goal:** match SQLite types to their use cases.",questions:[{prompt:"What happens if you declare VARCHAR(10) and insert a 20-character string in SQLite?",options:["The string is truncated to 10","An error is thrown","The full 20 characters are stored","The column is rejected"],answer:2,explanation:"SQLite ignores VARCHAR size limits. The full string is stored with no truncation."},{prompt:"Can you insert an integer (42) into a TEXT column in SQLite?",options:["No, it will be rejected","Yes, SQLite is weakly typed","It depends on the column definition","Only if the column is NULL"],answer:1,explanation:"SQLite is weakly typed \u2014 it does not enforce column types."},{prompt:"Which type stores image data?",options:["TEXT","INTEGER","REAL","BLOB"],answer:3,explanation:"BLOB is for binary data like images."},{prompt:"How do you store a date in SQLite?",options:["Use the DATE type","As TEXT, INTEGER, or REAL","Dates are not supported","Use the DATETIME type"],answer:1,explanation:"SQLite has no native DATE type. Store dates as TEXT, INTEGER, or REAL."}],seed:e},{id:"06-design-table",module:2,title:"Design a Table",type:"practice",file:"06-design-table.sql",seed:"",markdown:"# Design a Table\n\nCashPal's HR team needs an `employees` table. You choose the right SQLite type for each column based on what you learned.\n\n**Your task:** Create the `employees` table with these columns:\n\n- [ ] `id` \u2014 unique number for each employee\n- [ ] `name` \u2014 employee name\n- [ ] `email` \u2014 email address\n- [ ] `salary` \u2014 salary with decimals\n- [ ] `photo` \u2014 optional profile picture\n- [ ] `department` \u2014 which team they're in",check:{type:"schema",table:"employees",columns:["id","name","email","salary","photo","department"]},hint:"Think about what each column stores. id \u2192 INTEGER PK, name/email/department \u2192 TEXT, salary \u2192 REAL, photo \u2192 BLOB",sql:`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, email TEXT, salary REAL, photo BLOB, department TEXT);
`,checklist:["Column id with correct type and PK","Column name with correct type","Column email with correct type","Column salary with correct type","Column photo with correct type","Column department with correct type"]},{id:"07-select",module:2,title:"SELECT Intro",type:"practice",file:"07-select.sql",seed:e,markdown:"# SELECT Intro\n\nCashPal's user data is ready. Let's read it.\n\nThe `SELECT` statement reads data from tables:\n\n```sql\nSELECT * FROM users;\n```\n\n`*` means \"all columns\". Pick specific columns:\n\n```sql\nSELECT name, age FROM users;\n```\n\n**Goal:** Write `SELECT * FROM users;` to see all CashPal users.",sql:`SELECT * FROM users;
`,check:{type:"result",expectedSql:"SELECT * FROM users;"}},{id:"08-calc",module:2,title:"Basic Calculations",type:"practice",file:"08-calc.sql",seed:"",markdown:`# Basic Calculations

SQL can do math without a table:

\`\`\`sql
SELECT 2 + 2;
SELECT 10 * 5;
SELECT 'Hello' || ' ' || 'World';
\`\`\`

The \`||\` operator concatenates strings. No \`FROM\` needed for expressions.

CashPal's finance team needs to calculate transaction fees. Start simple.

**Goal:** Write a query that returns 100 divided by 4.`,sql:`SELECT 100 / 4;
`,check:{type:"result",expectedSql:"SELECT 100 / 4;"}}];var p=[{id:"06-primary",module:3,title:"PRIMARY KEY",type:"theory",file:"06-primary.md",markdown:`# PRIMARY KEY

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

**Goal:** understand what PRIMARY KEY guarantees.`,question:{prompt:"What does PRIMARY KEY automatically imply?",options:["NOT NULL only","UNIQUE only","NOT NULL + UNIQUE","AUTOINCREMENT"],answer:2,explanation:"PRIMARY KEY implies both NOT NULL and UNIQUE."},seed:""},{id:"10-constraints",module:3,title:"Constraints",type:"practice",file:"10-constraints.sql",sql:`CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  age INTEGER CHECK (age >= 18)
);
INSERT INTO accounts (email, age) VALUES ('test@example.com', 25);
`,markdown:`# Constraints

CashPal needs strict rules on their \`accounts\` table \u2014 no invalid data allowed.

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

> **Try it:** After creating the table, try inserting a row with age < 18 \u2014 you'll get a CHECK error. Try a duplicate email \u2014 you'll get a UNIQUE error.`,seed:"",check:{type:"constraints",table:"accounts",tokens:["not null","unique","default","check"]},hint:"CREATE TABLE accounts (id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'active', age INTEGER CHECK (age >= 18)); then INSERT a row with valid data.",checklist:["Column id is INTEGER PRIMARY KEY","Column email is TEXT NOT NULL UNIQUE","Column status is TEXT NOT NULL DEFAULT active","Column age is INTEGER CHECK (age >= 18)"]},{id:"16-pk-vs-unique",module:3,title:"PRIMARY KEY vs UNIQUE",type:"theory",file:"12-pk-vs-unique.md",markdown:`# PRIMARY KEY vs UNIQUE

Both ensure unique values, but:

| Feature | PRIMARY KEY | UNIQUE |
|---------|-------------|--------|
| Allowed per table | Only 1 | Multiple |
| Allows NULL | No | Yes |
| Auto-indexed | Yes | Yes |

**Goal:** know the difference.`,question:{prompt:"How many PRIMARY KEYs can a table have?",options:["Unlimited","Two","One","Depends on columns"],answer:2,explanation:"A table can have only one PRIMARY KEY, but multiple UNIQUE constraints."},seed:""},{id:"07-autoincrement",module:3,title:"AUTOINCREMENT",type:"theory",file:"07-autoincrement.md",markdown:"# AUTOINCREMENT\n\nIn SQLite, `INTEGER PRIMARY KEY` auto-increments by default \u2014 but there's a catch.\n\n**Without AUTOINCREMENT:** IDs start at 1. If you delete the last row, SQLite may **reuse** that ID (`max(rowid) + 1`).\n\n**With AUTOINCREMENT:** IDs are guaranteed to never be reused. Important for CashPal's transaction records \u2014 you never want duplicate transaction IDs.\n\n**\u26A0\uFE0F Other databases are different.** In MySQL/PostgreSQL, `INTEGER PRIMARY KEY` does NOT auto-increment \u2014 you need `AUTO_INCREMENT` or `SERIAL`.\n\n**Goal:** know when AUTOINCREMENT matters.",question:{prompt:"Without AUTOINCREMENT, what ID does a new row get after deleting the last row (ID 5)?",options:["5","6","1","Random"],answer:0,explanation:"Without AUTOINCREMENT, SQLite reuses the highest row ID (max(rowid)+1 = 5)."},seed:""},{id:"08-foreign",module:3,title:"FOREIGN KEY",type:"practice",file:"07-foreign.sql",sql:`PRAGMA foreign_keys = ON;
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
`,markdown:`# FOREIGN KEY

CashPal needs to link \`books\` to \`authors\` \u2014 a book belongs to one author, an author can have many books.

A \`FOREIGN KEY\` links rows across tables. There are two syntaxes \u2014 both are valid:

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
  author_id INTEGER NOT NULL REFERENCES authors(id)  -- \u2190 shorthand
);
\`\`\`

Both produce the same foreign key. The shorthand is concise and commonly preferred for single-column FKs.

First enable foreign keys: \`PRAGMA foreign_keys = ON;\`

**Your task:**
- [ ] Enable foreign keys with PRAGMA
- [ ] Create \`authors\` table (id, name)
- [ ] Create \`books\` table (id, title, author_id)
- [ ] Add FOREIGN KEY on \`author_id\` referencing \`authors(id)\``,seed:n,check:{type:"fk",table:"books",column:"author_id"},hint:"PRAGMA foreign_keys = ON; CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));",checklist:["PRAGMA foreign_keys = ON","Table authors with id and name","Table books with id, title, author_id","Foreign key on author_id referencing authors(id)"]},{id:"12-relationship-1-n",module:3,title:"One-to-Many Relationships",type:"practice",file:"12-relationship-1-n.sql",markdown:`# One-to-Many Relationships

In a 1:N relationship, one row in table A matches many rows in table B. A foreign key in the "many" side links back.

CashPal uses this for: one customer \u2192 many transactions, one category \u2192 many products.

**Goal:** Create \`authors\` (id, name) and \`books\` (id, title, author_id FK).`,seed:n,check:{type:"fk",table:"books",column:"author_id"},hint:"CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author_id INTEGER REFERENCES authors(id));",sql:`PRAGMA foreign_keys = ON;
CREATE TABLE authors (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(id));
`},{id:"11-relationship-1-1",module:3,title:"One-to-One Relationships",type:"practice",file:"11-relationship-1-1.sql",markdown:`# One-to-One Relationships

In a 1:1 relationship, one row in table A matches exactly one row in table B. Often the shared primary key enforces this.

CashPal uses this for: one user \u2192 one profile, one citizen \u2192 one passport.

**Goal:** Create \`citizens\` (id, name) and \`passports\` (id PK referencing citizens, number TEXT).`,seed:"",check:{type:"fk",table:"passports",column:"id"},hint:"CREATE TABLE citizens (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE passports (id INTEGER PRIMARY KEY, number TEXT, FOREIGN KEY (id) REFERENCES citizens(id));",sql:`CREATE TABLE citizens (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE passports (id INTEGER PRIMARY KEY, number TEXT, FOREIGN KEY (id) REFERENCES citizens(id));
`},{id:"09-cascade",module:3,title:"ON DELETE CASCADE",type:"theory",file:"09-cascade.md",markdown:`# ON DELETE CASCADE

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

**When to use:** Dependent data \u2014 order items, invoice lines, blog comments.

**When NOT to use:** Business-critical data \u2014 you don't want to silently delete all customer transactions.

**Goal:** know when CASCADE is appropriate.`,questions:[{prompt:"ON DELETE CASCADE deletes child rows when?",options:["When the parent row is deleted","When the child row is updated","When a new parent is inserted","When the foreign key is created"],answer:0,explanation:"CASCADE automatically deletes child rows when the parent is deleted."},{prompt:"Which is a BAD use of ON DELETE CASCADE?",options:["Deleting order items when an order is deleted","Deleting book records when an author is deleted","Deleting blog comments when a post is deleted","Deleting invoices when a customer is deleted"],answer:3,explanation:"Invoices are business records \u2014 never cascade delete financial data."}],seed:n},{id:"13-composite-pk",module:3,title:"Composite PRIMARY KEY",type:"practice",file:"13-composite-pk.sql",markdown:`# Composite Primary Keys

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
- [ ] Add \`quantity\` column to order_items`,seed:n,check:{type:"constraints",table:"order_items",tokens:["primary key"]},hint:"CREATE TABLE orders (id INTEGER PRIMARY KEY, date TEXT); CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY (order_id, product_id));",sql:`CREATE TABLE orders (id INTEGER PRIMARY KEY, date TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, quantity INTEGER, PRIMARY KEY (order_id, product_id), FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));
`,checklist:["Table orders with id and date","Table products with id and name","Table order_items with order_id, product_id, quantity","Composite PRIMARY KEY on (order_id, product_id)"]},{id:"14-relationship-n-m",module:3,title:"Many-to-Many Relationships",type:"practice",file:"14-relationship-n-m.sql",markdown:"# Many-to-Many Relationships\n\nN:M requires a junction table. The junction table has a composite PK to prevent duplicates.\n\nCashPal's content system: an actor can be in many movies, a movie has many actors.\n\n**Goal:** Create `actors`, `movies`, and a junction table `cast` with composite PK on (actor_id, movie_id).",seed:n,check:{type:"constraints",table:"cast",tokens:["primary key"]},hint:"CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT); CREATE TABLE cast (actor_id INTEGER, movie_id INTEGER, PRIMARY KEY (actor_id, movie_id), FOREIGN KEY (actor_id) REFERENCES actors(id), FOREIGN KEY (movie_id) REFERENCES movies(id));",sql:`CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE cast (actor_id INTEGER, movie_id INTEGER, PRIMARY KEY (actor_id, movie_id), FOREIGN KEY (actor_id) REFERENCES actors(id), FOREIGN KEY (movie_id) REFERENCES movies(id));
`},{id:"09-alter-table",module:3,title:"ALTER TABLE",type:"practice",file:"09-alter-table.sql",markdown:"# ALTER TABLE\n\nCashPal's `users` table needs a phone number field. You can modify existing tables with `ALTER TABLE`:\n\n```sql\nALTER TABLE table ADD COLUMN column TYPE;\nALTER TABLE table RENAME COLUMN old TO new;\nALTER TABLE table DROP COLUMN column;\n```\n\nThe `users` table has: id, name, city, age, email.\n\n**Your task:**\n- [ ] Add column `phone` (TEXT) to `users`\n- [ ] Rename `phone` to `phone_number`",seed:e,check:{type:"schema",table:"users",columns:["id","name","city","age","email","phone_number"]},hint:"ALTER TABLE users ADD COLUMN phone TEXT; then ALTER TABLE users RENAME COLUMN phone TO phone_number;",sql:`ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users RENAME COLUMN phone TO phone_number;
`,checklist:["Add column phone (TEXT) to users","Rename phone to phone_number"]},{id:"15-drop-table",module:3,title:"DROP TABLE",type:"practice",file:"11-drop-table.sql",markdown:"# DROP TABLE\n\n`DROP TABLE` removes a table and all its data permanently. Use with caution.\n\n```sql\nDROP TABLE table_name;\nDROP TABLE IF EXISTS table_name;  -- safe version\n```\n\n**Goal:** Drop the `users` table. Then run `SELECT * FROM sqlite_master WHERE type='table'` to verify it's gone.",seed:e,check:{type:"success"},hint:"DROP TABLE users;",sql:`DROP TABLE users;
`},{id:"10-schema",module:3,title:"Schema Design",type:"theory",file:"10-schema.md",markdown:`# Schema Design

Relationships can be one-to-one, one-to-many, or many-to-many. Choosing the right one is critical for CashPal's data integrity.

**Goal:** know when a junction table is used.`,question:{prompt:"Which relationship uses a junction table?",options:["One-to-one","One-to-many","Many-to-many","Self-referencing"],answer:2,explanation:"Many-to-many relationships need a junction table."},seed:e}];var R=[{id:"12-attach",module:4,title:"Your First Database",type:"practice",file:"12-attach.sql",sql:`SELECT name FROM sqlite_master WHERE type = 'table';
`,markdown:"# Your First Database\n\nCashPal's system is live! Let's explore what's inside.\n\nSQLite stores metadata in a system table called `sqlite_master`. It has columns like `name`, `type`, and `sql`.\n\nTry querying it to discover what tables exist:\n\n```sql\nSELECT name FROM sqlite_master WHERE type = 'table';\n```\n\n**Goal:** a successful query shows at least one table.",seed:e,check:{type:"success"}},{id:"13-select",module:4,title:"Reading Data",type:"practice",file:"13-select.sql",sql:`SELECT * FROM users;
`,markdown:"# Reading Data\n\nCashPal's `users` table is ready. Let's read from it.\n\n```sql\nSELECT column1, column2 FROM tablename;\nSELECT * FROM tablename;  -- all columns\n```\n\n**Goal:** Write a query that returns all rows and columns from the `users` table.",seed:e,check:{type:"result",expectedSql:"SELECT * FROM users;"}},{id:"14-where",module:4,title:"Filtering",type:"practice",file:"11-where.sql",sql:`SELECT name FROM users WHERE city = 'Berlin';
`,markdown:`# Filtering

CashPal's marketing team needs to find users in Berlin.

The \`WHERE\` clause filters rows:

\`\`\`sql
SELECT columns FROM table WHERE condition;
\`\`\`

Use \`=\` for comparison. Strings go in single quotes.

**Goal:** Return the names of users who live in Berlin.`,seed:e,check:{type:"result",expectedSql:"SELECT name FROM users WHERE city = 'Berlin';"}},{id:"15-advanced-where",module:4,title:"Advanced Filtering",type:"practice",file:"12-advanced-where.sql",sql:`SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;
`,markdown:`# Advanced Filtering

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
- [ ] Sorted alphabetically by name`,seed:e,check:{type:"result",expectedSql:"SELECT name FROM users WHERE city IN ('Berlin', 'Munich') AND age BETWEEN 20 AND 35 AND age NOT IN (22) ORDER BY name;"},checklist:["Filter users in Berlin or Munich","Age between 20 and 35 inclusive","Exclude age 22","Sorted alphabetically by name"]},{id:"16-null",module:4,title:"Working with NULL",type:"practice",file:"13-null.sql",sql:`SELECT name FROM users WHERE email IS NULL;
`,markdown:"# Working with NULL\n\nSome CashPal users haven't provided an email. `NULL` represents missing data.\n\nYou cannot use `= NULL` \u2014 use `IS NULL` or `IS NOT NULL`:\n\n```sql\nSELECT columns FROM table WHERE column IS NULL;\n```\n\n**Goal:** Return the names of users without an email address.",seed:m,check:{type:"result",expectedSql:"SELECT name FROM users WHERE email IS NULL;"},hint:"Use WHERE email IS NULL \u2014 not = NULL."},{id:"17-like",module:4,title:"Pattern Matching",type:"practice",file:"14-like.sql",sql:`SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;
`,markdown:`# Pattern Matching

CashPal needs to find users whose names contain certain letters.

\`LIKE\` enables pattern matching:

- \`%\` \u2014 matches any sequence of characters
- \`_\` \u2014 matches exactly one character

\`\`\`sql
SELECT columns FROM table WHERE column LIKE pattern;
\`\`\`

**Goal:** Return names containing the letter 'a', sorted alphabetically.`,seed:e,check:{type:"result",expectedSql:"SELECT name FROM users WHERE name LIKE '%a%' ORDER BY name;"}},{id:"18-insert",module:4,title:"Inserting Data",type:"practice",file:"15-insert.sql",sql:`INSERT INTO users (name, city, age, email) VALUES ('Kai', 'Berlin', 27, 'kai@example.com');
`,markdown:"# Inserting Data\n\nA new user joined CashPal. Add them to the database.\n\n```sql\nINSERT INTO tablename (col1, col2, ...) VALUES (val1, val2, ...);\n```\n\nThe `id` column is auto-incrementing \u2014 you can omit it.\n\n**Goal:** Insert a new user into `users`.",seed:e,check:{type:"changes",min:1}},{id:"19-update",module:4,title:"Updating Data",type:"practice",file:"16-update.sql",sql:`UPDATE users SET city = 'Bremen' WHERE name = 'Mia';
`,markdown:`# Updating Data

A CashPal user moved cities. Time to update their record.

\`\`\`sql
UPDATE tablename SET column = value WHERE condition;
\`\`\`

**\u26A0\uFE0F Always include WHERE** \u2014 without it, every row gets updated!

**Goal:** Update the city of a specific user.`,seed:e,check:{type:"changes",min:1}},{id:"20-update-multi",module:4,title:"UPDATE Multiple Columns",type:"practice",file:"20-update-multi.sql",markdown:"# Update Multiple Columns\n\nA CashPal user changed both city and age. Update both at once:\n\n```sql\nUPDATE users SET city = 'Berlin', age = 30 WHERE name = 'Mia';\n```\n\n**Goal:** Update both the city and age of a user in `users`.",seed:e,check:{type:"changes",min:1},hint:"UPDATE users SET city = 'X', age = Y WHERE name = 'Z';",sql:`UPDATE users SET city = 'Berlin', age = 30 WHERE name = 'Mia';
`},{id:"21-delete",module:4,title:"Deleting Data",type:"practice",file:"21-delete.sql",sql:`DELETE FROM users WHERE name = 'Liam';
`,markdown:`# Deleting Data

A CashPal user requested account removal.

\`\`\`sql
DELETE FROM tablename WHERE condition;
\`\`\`

**\u26A0\uFE0F Always include WHERE** \u2014 without it, all rows are deleted!

**Goal:** Delete a specific user by their name.`,seed:e,check:{type:"changes",min:1}},{id:"22-delete-danger",module:4,title:"Danger of DELETE",type:"theory",file:"22-delete-danger.md",markdown:`# Danger of DELETE

Always include WHERE unless you truly want to delete everything. CashPal learned this the hard way in production.

**Goal:** know what happens without WHERE.`,question:{prompt:"What happens if you run DELETE FROM users without WHERE?",options:["Only the first row is deleted","Nothing happens","All rows are deleted","It deletes the table"],answer:2,explanation:"Without WHERE, every row is removed."},seed:e},{id:"23-insert-select",module:4,title:"INSERT INTO SELECT",type:"practice",file:"23-insert-select.sql",markdown:"# INSERT INTO ... SELECT\n\nCashPal needs to promote Berlin users to admin status. Copy data between tables:\n\n```sql\nINSERT INTO target_table (columns)\nSELECT columns FROM source_table WHERE condition;\n```\n\n**Your task:**\n- [ ] Create table `admins` with same columns as `users`\n- [ ] Copy only users from Berlin into `admins`",sql:`CREATE TABLE admins (id INTEGER PRIMARY KEY, name TEXT, city TEXT, age INTEGER, email TEXT);
INSERT INTO admins SELECT * FROM users WHERE city = 'Berlin';
`,seed:e,check:{type:"result",expectedSql:"SELECT name, city FROM admins ORDER BY name;"},checklist:["Table admins created with same columns as users","Only Berlin users copied into admins"]},{id:"24-crud-mastery",module:4,title:"CRUD Mastery",type:"practice",file:"24-crud-mastery.sql",markdown:`# CRUD Mastery

CashPal's inventory system needs a complete setup. Combine everything you've learned.

**Your task:**
- [ ] Create table \`inventory\` (id INTEGER PK, item TEXT NOT NULL, quantity INTEGER NOT NULL)
- [ ] Insert 3 items: 'Laptop' (5), 'Mouse' (20), 'Keyboard' (15)
- [ ] Update 'Mouse' quantity to 25
- [ ] Delete 'Keyboard'
- [ ] SELECT remaining items sorted by item name`,sql:`CREATE TABLE inventory (id INTEGER PRIMARY KEY, item TEXT NOT NULL, quantity INTEGER NOT NULL);
INSERT INTO inventory (item, quantity) VALUES ('Laptop', 5), ('Mouse', 20), ('Keyboard', 15);
UPDATE inventory SET quantity = 25 WHERE item = 'Mouse';
DELETE FROM inventory WHERE item = 'Keyboard';
`,seed:"",check:{type:"result",expectedSql:"SELECT item, quantity FROM inventory ORDER BY item;"},checklist:["Create table inventory with id, item, quantity","Insert Laptop (5), Mouse (20), Keyboard (15)","Update Mouse quantity to 25","Delete Keyboard","SELECT remaining items sorted by name"]},{id:"25-insert-multi",module:4,title:"INSERT Multiple Rows",type:"practice",file:"25-insert-multi.sql",markdown:`# INSERT Multiple Rows

CashPal is growing fast \u2014 add 3 new users at once.

Insert several rows in one statement:

\`\`\`sql
INSERT INTO table (col1, col2) VALUES
  (val1a, val2a),
  (val1b, val2b),
  (val1c, val2c);
\`\`\`

**Goal:** Insert 3 new users at once into \`users\`.`,seed:e,check:{type:"changes",min:3},hint:"INSERT INTO users (name, city, age) VALUES ('A', 'B', 20), ('C', 'D', 30), ('E', 'F', 40);",sql:`INSERT INTO users (name, city, age) VALUES ('Kai', 'Berlin', 27), ('Luna', 'Hamburg', 24), ('Finn', 'Munich', 30);
`}];var h=[{id:"19-sort",module:5,title:"Sorting",type:"practice",file:"19-sort.sql",markdown:"# Sorting\n\nCashPal needs a directory sorted by age.\n\nUse `ORDER BY` to sort results:\n\n```sql\nSELECT columns FROM table ORDER BY column;\n```\n\nUse `ASC` (ascending, default) or `DESC` (descending).\n\n**Goal:** Return `name` and `age` from `users`, sorted by age youngest first.",sql:`SELECT name, age FROM users ORDER BY age;
`,seed:e,check:{type:"result",expectedSql:"SELECT name, age FROM users ORDER BY age;"}},{id:"20-limit",module:5,title:"Limiting Results",type:"practice",file:"20-limit.sql",markdown:`# Limiting Results

CashPal's CEO wants the top 3 oldest users.

\`LIMIT\` restricts how many rows are returned:

\`\`\`sql
SELECT columns FROM table LIMIT count;
SELECT columns FROM table LIMIT count OFFSET skip;
\`\`\`

**Goal:** Return the names of the 3 oldest users, sorted oldest first.`,sql:`SELECT name FROM users ORDER BY age DESC LIMIT 3;
`,seed:e,check:{type:"result",expectedSql:"SELECT name FROM users ORDER BY age DESC LIMIT 3;"}},{id:"21-aggregates",module:5,title:"Aggregate Functions",type:"practice",file:"21-aggregates.sql",markdown:`# Aggregate Functions

CashPal needs user statistics.

Aggregate functions summarize many rows into one value:

\`\`\`sql
SELECT COUNT(*), AVG(column), SUM(column), MIN(column), MAX(column) FROM table;
\`\`\`

Combine with \`ROUND()\` for decimals: \`ROUND(AVG(age), 2)\`

**Goal:** Return the total number of users and their average age rounded to 2 decimals.`,seed:l,check:{type:"result",expectedSql:"SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;"},hint:"SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;",sql:`SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;
`},{id:"22-group",module:5,title:"Grouping",type:"practice",file:"22-group.sql",markdown:`# Grouping

CashPal wants to know user distribution by city.

\`GROUP BY\` groups rows so aggregate functions work per group:

\`\`\`sql
SELECT column, COUNT(*) FROM table GROUP BY column;
\`\`\`

Use \`HAVING\` to filter groups (like WHERE but for groups).

**Your task:**
- [ ] Count users per city
- [ ] Show only cities with at least 2 users
- [ ] Sort alphabetically`,seed:l,check:{type:"result",expectedSql:"SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;"},hint:"GROUP BY city, then HAVING COUNT(*) >= 2",sql:`SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;
`,checklist:["Count users per city","Filter cities with at least 2 users","Sort alphabetically"]},{id:"23-distinct",module:5,title:"Distinct Values",type:"practice",file:"23-distinct.sql",markdown:"# Distinct Values\n\nCashPal wants a list of unique cities \u2014 no duplicates.\n\n`DISTINCT` removes duplicate values:\n\n```sql\nSELECT DISTINCT column FROM table;\n```\n\n**Goal:** Return all unique cities from `users`.",sql:`SELECT DISTINCT city FROM users;
`,seed:e,check:{type:"result",expectedSql:"SELECT DISTINCT city FROM users;"}},{id:"24-alias",module:5,title:"Aliases",type:"practice",file:"24-alias.sql",markdown:"# Aliases\n\nCashPal's API needs specific column names in the response.\n\n`AS` renames columns in results:\n\n```sql\nSELECT column AS alias_name FROM table;\n```\n\n**Goal:** Return `name` as `user_name` and `age` as `user_age` from `users`.",sql:`SELECT name AS user_name, age AS user_age FROM users;
`,seed:e,check:{type:"result",expectedSql:"SELECT name AS user_name, age AS user_age FROM users;"}},{id:"25-query-mastery",module:5,title:"Query Mastery",type:"practice",file:"25-query-mastery.sql",markdown:`# Query Mastery

CashPal's analytics team needs a city-level report.

**Your task:**
- [ ] Show city name, user count, and average age
- [ ] Only cities with at least 2 users
- [ ] Sort by average age descending`,sql:`SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;
`,seed:l,check:{type:"result",expectedSql:"SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;"},checklist:["Show city, user count, average age","Filter cities with at least 2 users","Sort by average age descending"]},{id:"26-union",module:5,title:"UNION",type:"practice",file:"26-union.sql",markdown:"# UNION\n\nCashPal merged two customer databases. Combine them.\n\n`UNION` combines results from two queries (duplicates removed):\n\n```sql\nSELECT column FROM table_a\nUNION\nSELECT column FROM table_b;\n```\n\n**Goal:** Return all unique cities from `customers` and `users` combined, sorted alphabetically.",seed:t+`
`+e,check:{type:"result",expectedSql:"SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;"},hint:"SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;",sql:`SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;
`}];var N=[{id:"25-inner-join",module:6,title:"INNER JOIN",type:"practice",file:"25-inner-join.sql",markdown:"# INNER JOIN\n\nCashPal needs to see which customers ordered what.\n\n`INNER JOIN` combines rows where a condition matches:\n\n```sql\nSELECT a.col, b.col FROM table_a\nINNER JOIN table_b ON a.id = b.foreign_id;\n```\n\n**Goal:** Return `customers.name` and `orders.item` by joining on `customers.id = orders.customer_id`.",sql:`SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;
`,seed:t,check:{type:"result",expectedSql:"SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;"}},{id:"26-old-join",module:6,title:"Old-School Joins (Implicit)",type:"theory",file:"26-old-join.md",markdown:`# Old-School Implicit Joins

Before \`JOIN ... ON\`, SQL used commas in FROM:

\`\`\`sql
SELECT customers.name, orders.item
FROM customers, orders
WHERE customers.id = orders.customer_id;
\`\`\`

**Why not use it:** Easy to forget WHERE and create a cross join. Modern JOIN makes intent clearer.

**Goal:** know the old syntax when you see it in legacy code.`,question:{prompt:"What happens if you omit WHERE in a comma-separated FROM?",options:["Syntax error","Cross join (every row paired)","Empty result","Only matching rows"],answer:1,explanation:"Without WHERE, commas create a CROSS JOIN."},seed:t},{id:"26-left-join",module:6,title:"LEFT JOIN",type:"practice",file:"26-left-join.sql",markdown:"# LEFT JOIN\n\nCashPal wants ALL customers, even ones without orders.\n\n`LEFT JOIN` keeps all rows from the left table. Unmatched columns show NULL:\n\n```sql\nSELECT a.col, b.col FROM table_a\nLEFT JOIN table_b ON a.id = b.foreign_id;\n```\n\n**Goal:** Return `customers.name` and `orders.item`. All customers must appear \u2014 those without orders show NULL for item.",sql:`SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;
`,seed:t,check:{type:"result",expectedSql:"SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;"}},{id:"27-right-join",module:6,title:"RIGHT JOIN (Theory)",type:"theory",file:"27-right-join.md",markdown:"# RIGHT JOIN\n\n`RIGHT JOIN` keeps ALL rows from the right table. SQLite does not support it \u2014 swap tables and use `LEFT JOIN`.\n\n**Goal:** know how to simulate RIGHT JOIN.",question:{prompt:"How do you simulate RIGHT JOIN in SQLite?",options:["Use RIGHT JOIN anyway","Swap tables and use LEFT JOIN","Use INNER JOIN","Use CROSS JOIN"],answer:1,explanation:"Swap the table order and use LEFT JOIN."},seed:t},{id:"28-full-join",module:6,title:"FULL OUTER JOIN (Theory)",type:"theory",file:"28-full-join.md",markdown:`# FULL OUTER JOIN

Keeps rows from both sides. Not supported in SQLite \u2014 combine LEFT JOIN and RIGHT JOIN with UNION.

**Goal:** know the concept.`,question:{prompt:"Which operation combines LEFT JOIN and RIGHT JOIN results?",options:["UNION","INTERSECT","EXCEPT","CROSS JOIN"],answer:0,explanation:"UNION combines LEFT JOIN and RIGHT JOIN to simulate FULL OUTER JOIN."},seed:t},{id:"29-self-join",module:6,title:"Self Joins",type:"practice",file:"29-self-join.sql",markdown:"# Self Joins\n\nCashPal's org chart \u2014 show who reports to whom.\n\nA self join joins a table to itself. Use aliases to tell them apart:\n\n```sql\nSELECT a.col, b.col FROM table AS a\nINNER JOIN table AS b ON a.id = b.ref_id;\n```\n\nThe `employees` table has `manager_id` referencing `id`.\n\n**Goal:** Return `e.name AS employee` and `m.name AS manager`. Use LEFT JOIN so employees without managers still appear.",sql:`SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;
`,seed:d,check:{type:"result",expectedSql:"SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;"}},{id:"30-multi-join",module:6,title:"Joining Multiple Tables",type:"practice",file:"30-multi-join.sql",markdown:`# Joining Multiple Tables

CashPal's full order pipeline \u2014 customers \u2192 orders \u2192 products.

Chain multiple JOIN clauses:

\`\`\`sql
SELECT a.col, b.col, c.col
FROM table_a a
INNER JOIN table_b b ON a.id = b.a_id
INNER JOIN table_c c ON b.id = c.b_id;
\`\`\`

**Goal:** Return \`customers.name AS customer\`, \`products.name AS product\`, and \`orders.quantity\` by joining all three tables.`,sql:`SELECT customers.name AS customer, products.name AS product, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;
`,seed:c,check:{type:"result",expectedSql:"SELECT customers.name AS customer, products.name AS product, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;"}},{id:"31-join-mastery",module:6,title:"Join Mastery",type:"practice",file:"31-join-mastery.sql",markdown:`# Join Mastery

CashPal's analytics: customer order summary.

**Your task:**
- [ ] Show each customer's name, total quantity ordered, and distinct products bought
- [ ] Only customers with at least 2 total items
- [ ] Sort by total quantity descending`,sql:`SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;
`,seed:c,check:{type:"result",expectedSql:"SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;"},checklist:["Show customer name, total quantity, distinct products","Only customers with at least 2 items","Sort by quantity descending"]}];var y=[{id:"31-subquery-where",module:7,title:"Subquery in WHERE",type:"practice",file:"31-subquery-where.sql",markdown:"# Subquery in WHERE\n\nCashPal needs to find high-value customers.\n\nA subquery is a query inside another query. Use it in WHERE with IN:\n\n```sql\nSELECT columns FROM table\nWHERE id IN (SELECT foreign_id FROM other_table WHERE condition);\n```\n\n**Goal:** Return `name` of customers who placed orders with `price > 100`. Use `WHERE id IN (SELECT ...)`.",sql:`SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE price > 100);
`,seed:t,check:{type:"result",expectedSql:"SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE price > 100);"}},{id:"32-subquery-select",module:7,title:"Subquery in SELECT",type:"practice",file:"32-subquery-select.sql",markdown:`# Subquery in SELECT

CashPal wants each customer's order count next to their name.

A subquery in SELECT computes a value per row (must return a single value):

\`\`\`sql
SELECT column, (SELECT COUNT(*) FROM other WHERE other.id = main.id) AS alias
FROM table;
\`\`\`

**Goal:** Return \`name\` and \`(SELECT COUNT(*) ...) AS order_count\` \u2014 each customer's name with the count of orders they placed.`,sql:`SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count FROM customers;
`,seed:t,check:{type:"result",expectedSql:"SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count FROM customers;"}},{id:"33-subquery-from",module:7,title:"Subquery in FROM",type:"practice",file:"33-subquery-from.sql",markdown:"# Subquery in FROM\n\nA subquery in FROM acts like a temporary table. Must have an alias:\n\n```sql\nSELECT columns FROM (SELECT ...) AS alias WHERE condition;\n```\n\n**Goal:** Return `item` and `price` where `price > 50` by using `FROM (SELECT * FROM orders) AS expensive`.",sql:`SELECT item, price FROM (SELECT * FROM orders) AS expensive WHERE price > 50;
`,seed:t,check:{type:"result",expectedSql:"SELECT item, price FROM (SELECT * FROM orders) AS expensive WHERE price > 50;"}},{id:"34-correlated",module:7,title:"Correlated Subqueries",type:"practice",file:"34-correlated.sql",markdown:`# Correlated Subqueries

A correlated subquery references the outer query and runs once per row.

CashPal wants items that cost above average:

\`\`\`sql
SELECT columns FROM table_a AS a
WHERE column > (SELECT AVG(column) FROM table_b WHERE b.id = a.id);
\`\`\`

**Goal:** Return \`item\` and \`price\` for orders costing more than the average price across all orders.`,sql:`SELECT item, price FROM orders WHERE price > (SELECT AVG(price) FROM orders);
`,seed:t,check:{type:"result",expectedSql:"SELECT item, price FROM orders WHERE price > (SELECT AVG(price) FROM orders);"}},{id:"35-exists",module:7,title:"EXISTS",type:"practice",file:"35-exists.sql",markdown:"# EXISTS\n\nEXISTS checks if a subquery returns any rows. Often faster than IN.\n\n```sql\nSELECT columns FROM table_a AS a\nWHERE EXISTS (SELECT 1 FROM table_b WHERE b.ref_id = a.id);\n```\n\n**Goal:** Return `name` of customers who have at least one order. Use `WHERE EXISTS (SELECT 1 ...)`.",sql:`SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = customers.id);
`,seed:t,check:{type:"result",expectedSql:"SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = customers.id);"}},{id:"36-cte",module:7,title:"Common Table Expressions",type:"practice",file:"36-cte.sql",markdown:"# Common Table Expressions\n\nA CTE (WITH clause) names a subquery for reuse:\n\n```sql\nWITH name AS (\n  SELECT ... FROM ...\n)\nSELECT columns FROM name WHERE condition;\n```\n\n**Goal:** Create a CTE `avg_price` that calculates the average price, then return `item` and `price` for items above that average.",sql:`WITH avg_price AS (SELECT AVG(price) AS avg FROM orders) SELECT item, price FROM orders, avg_price WHERE price > avg_price.avg;
`,seed:t,check:{type:"result",expectedSql:"WITH avg_price AS (SELECT AVG(price) AS avg FROM orders) SELECT item, price FROM orders, avg_price WHERE price > avg_price.avg;"}},{id:"37-recursive-cte",module:7,title:"Recursive CTEs (Theory)",type:"theory",file:"37-recursive-cte.md",markdown:`# Recursive CTEs

Recursive CTEs handle hierarchical data (org charts, trees). They reference themselves using UNION ALL.

CashPal uses this for their employee org chart.

**Goal:** know when recursive CTEs are useful.`,question:{prompt:"What kind of data is a recursive CTE best for?",options:["Flat tables","Hierarchical data like org charts","Single-row results","Aggregated data"],answer:1,explanation:"Recursive CTEs excel at querying tree structures like employee hierarchies."},seed:d}];var L=[{id:"38-why-normalize",module:8,title:"Why Normalize?",type:"theory",file:"38-why-normalize.md",markdown:`# Why Normalize?

CashPal's order data has a problem \u2014 customer info is repeated on every order row. If a customer moves, you must update many rows.

Normalization reduces data redundancy and prevents anomalies (update, insert, delete). Split data into related tables instead of one big blob.

**Goal:** know the main benefit of normalization.`,question:{prompt:"What is the main benefit of normalization?",options:["Less data redundancy","More storage used","More columns","Faster queries"],answer:0,explanation:"Normalization eliminates redundant data, preventing inconsistencies."},seed:i},{id:"39-1nf",module:8,title:"First Normal Form (1NF)",type:"practice",file:"39-1nf.sql",markdown:`# First Normal Form

A table is in 1NF when:
- Each column has atomic values (no lists)
- Each row has a primary key
- No repeating groups

CashPal's \`orders_denorm\` table repeats customer info. Split it:

**Your task:**
- [ ] Create \`customers\` (id, name, city)
- [ ] Create \`orders\` (id, customer_id, product, price)`,sql:`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL);
`,seed:i,check:{type:"schema",table:"customers",columns:["id","name","city"]},checklist:["Table customers with id, name, city","Table orders with id, customer_id, product, price"]},{id:"40-2nf",module:8,title:"Second Normal Form (2NF)",type:"practice",file:"40-2nf.sql",markdown:`# Second Normal Form

A table is in 2NF when:
- It is in 1NF
- Every non-key column depends on the WHOLE primary key

In CashPal's data, \`category\` depends on \`product\`, not the order. Split further.

**Your task:**
- [ ] Create \`customers\` (id, name, city)
- [ ] Create \`products\` (id, name, category)
- [ ] Create \`orders\` (id, customer_id, product_id)`,sql:`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product_id INTEGER NOT NULL);
`,seed:i,check:{type:"schema",table:"products",columns:["id","name","category"]},checklist:["Table customers with id, name, city","Table products with id, name, category","Table orders with id, customer_id, product_id"]},{id:"41-3nf",module:8,title:"Third Normal Form (3NF)",type:"practice",file:"41-3nf.sql",markdown:"# Third Normal Form\n\nA table is in 3NF when:\n- It is in 2NF\n- No transitive dependency (column depends on another non-key column)\n\nIn CashPal's data, `customer_city` depends on `customer`, not the order. We've already split this.\n\n**Your task:**\n- [ ] Create `customers` (id, name, city)\n- [ ] Create `orders` (id, customer_id, product, price)\n- [ ] Add FOREIGN KEY on `customer_id` \u2192 `customers(id)`",sql:`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL, FOREIGN KEY (customer_id) REFERENCES customers(id));
`,seed:i,check:{type:"fk",table:"orders",column:"customer_id"},checklist:["Table customers with id, name, city","Table orders with id, customer_id, product, price","Foreign key on customer_id referencing customers(id)"]},{id:"42-denormalization",module:8,title:"Denormalization",type:"theory",file:"42-denormalization.md",markdown:`# Denormalization

Sometimes you add redundancy intentionally \u2014 for read performance. CashPal uses denormalized reporting tables for dashboards where writes are rare.

**Goal:** know when to denormalize.`,question:{prompt:"When is denormalization useful?",options:["Always","When data must be unique","Never","When read performance matters more than write efficiency"],answer:3,explanation:"Denormalization speeds up reads by reducing joins, at the cost of redundant data."},seed:i}];var I=[{id:"43-what-index",module:9,title:"What is an Index?",type:"theory",file:"43-what-index.md",markdown:`# What is an Index?

CashPal's product catalog is growing. Queries are getting slow.

An index is a B-Tree that speeds up lookups \u2014 like a book index. Trade-off: faster reads, slower writes.

PRIMARY KEY columns are automatically indexed.

**Goal:** know what an index does.`,question:{prompt:"Which columns are indexed automatically in SQLite?",options:["All columns","PRIMARY KEY columns","TEXT columns","No columns"],answer:1,explanation:"PRIMARY KEY columns get an automatic index."},seed:o},{id:"44-create-index",module:9,title:"Creating Indexes",type:"practice",file:"44-create-index.sql",markdown:"# Creating Indexes\n\nCashPal's `products` table needs faster category lookups.\n\nUse `CREATE INDEX` to add an index:\n\n```sql\nCREATE INDEX index_name ON table (column);\n```\n\n**Goal:** Create an index `idx_category` on `products(category)`.",sql:`CREATE INDEX idx_category ON products (category);
`,seed:o,check:{type:"success"}},{id:"45-explain-plan",module:9,title:"Query Planning",type:"practice",file:"45-explain-plan.sql",markdown:`# Query Planning

Check if CashPal's indexes are being used.

EXPLAIN QUERY PLAN shows how SQLite executes a query:

\`\`\`sql
EXPLAIN QUERY PLAN SELECT * FROM table WHERE column = value;
\`\`\`

**Goal:** Run EXPLAIN QUERY PLAN on \`SELECT * FROM products WHERE category = 'Electronics'\`.`,sql:`EXPLAIN QUERY PLAN SELECT * FROM products WHERE category = 'Electronics';
`,seed:o,check:{type:"success"}},{id:"46-composite-index",module:9,title:"Composite Indexes",type:"practice",file:"46-composite-index.sql",markdown:"# Composite Indexes\n\nA composite index covers multiple columns. Column order matters \u2014 leftmost first.\n\n**Your task:**\n- [ ] Create composite index `idx_cat_price` on `products(category, price)`\n- [ ] Create index `idx_stock` on `products(stock)`",sql:`CREATE INDEX idx_cat_price ON products (category, price);
CREATE INDEX idx_stock ON products (stock);
`,seed:o,check:{type:"changes",min:0},checklist:["Composite index idx_cat_price on (category, price)","Index idx_stock on (stock)"]},{id:"47-no-index",module:9,title:"When NOT to Index",type:"theory",file:"47-no-index.md",markdown:`# When NOT to Index

Avoid indexes on:
- Small tables (full scan is fast enough)
- Columns updated frequently (index maintenance cost)
- Columns with few unique values (low selectivity)

**Goal:** know when indexes hurt more than help.`,question:{prompt:"Which column is a BAD candidate for an index?",options:["A primary key","A column with many unique values","A column with only two possible values","A foreign key"],answer:2,explanation:"Low-selectivity columns (few unique values) make poor indexes."},seed:o}];var A=[{id:"48-acid",module:10,title:"ACID Properties",type:"theory",file:"48-acid.md",markdown:`# ACID Properties

CashPal handles money \u2014 transactions must be reliable.

Transactions guarantee:
- **A**tomicity \u2014 all or nothing
- **C**onsistency \u2014 data stays valid
- **I**solation \u2014 concurrent transactions don't interfere
- **D**urability \u2014 committed data persists

**Goal:** know what ACID stands for.`,question:{prompt:"What does the I in ACID stand for?",options:["Index","Isolation","Integrity","Insert"],answer:1,explanation:"Isolation ensures concurrent transactions do not interfere."},seed:""},{id:"49-begin",module:10,title:"Starting Transactions",type:"practice",file:"49-begin.sql",markdown:`# Starting Transactions

CashPal needs a \`tasks\` table for tracking work.

Wrap operations in BEGIN TRANSACTION and COMMIT:

\`\`\`sql
BEGIN TRANSACTION;
CREATE TABLE ...;
INSERT INTO ...;
COMMIT;
\`\`\`

**Goal:** Create \`tasks\` (id INTEGER PK, title TEXT NOT NULL) inside a transaction, then COMMIT.`,sql:`BEGIN TRANSACTION;
CREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL);
COMMIT;
`,seed:"",check:{type:"schema",table:"tasks",columns:["id","title"]}},{id:"50-commit",module:10,title:"Committing",type:"practice",file:"50-commit.sql",markdown:`# Committing

COMMIT saves all changes since BEGIN. Changes become permanent.

**Goal:** Insert a row into \`tasks\` inside a transaction and COMMIT.`,sql:`BEGIN TRANSACTION;
INSERT INTO tasks (title) VALUES ('Test task');
COMMIT;
`,seed:"",check:{type:"changes",min:1}},{id:"51-rollback",module:10,title:"Rolling Back",type:"practice",file:"51-rollback.sql",markdown:"# Rolling Back\n\nROLLBACK undoes all changes since BEGIN \u2014 CashPal's safety net.\n\n```sql\nBEGIN;\nDELETE FROM table;\nROLLBACK; -- nothing happened\n```\n\n**Goal:** Delete all rows from `tasks` inside a transaction, then ROLLBACK. Verify with `SELECT COUNT(*)`.",sql:`BEGIN;
DELETE FROM tasks;
ROLLBACK;
SELECT COUNT(*) FROM tasks;
`,seed:"",check:{type:"success"}},{id:"52-savepoint",module:10,title:"Savepoints",type:"practice",file:"52-savepoint.sql",markdown:`# Savepoints

Savepoints allow partial rollbacks within a transaction \u2014 undo part of your work without losing everything.

\`\`\`sql
SAVEPOINT sp;
... some work ...
ROLLBACK TO sp; -- undo to savepoint
COMMIT;
\`\`\`

**Goal:** Insert two rows into \`tasks\` after a SAVEPOINT, ROLLBACK TO that savepoint, insert one more row, and COMMIT. Only the last row persists.`,sql:`BEGIN;
INSERT INTO tasks (title) VALUES ('First');
SAVEPOINT sp;
INSERT INTO tasks (title) VALUES ('Second');
INSERT INTO tasks (title) VALUES ('Third');
ROLLBACK TO sp;
INSERT INTO tasks (title) VALUES ('Last');
COMMIT;
`,seed:"",check:{type:"changes",min:1}}];var S=[{id:"53-views",module:11,title:"Views",type:"practice",file:"53-views.sql",markdown:`# Views

CashPal's support team needs a simple way to see customer orders.

A view is a saved query that acts like a virtual table:

\`\`\`sql
CREATE VIEW view_name AS SELECT ...;
\`\`\`

**Goal:** Create a view \`customer_orders\` showing customer names and their order items (use INNER JOIN).`,sql:`CREATE VIEW customer_orders AS SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;
`,seed:t,check:{type:"success"}},{id:"54-triggers",module:11,title:"Triggers",type:"practice",file:"54-triggers.sql",markdown:`# Triggers

CashPal wants to prevent accidentally deleting the last product in a category.

A trigger runs automatically before/after INSERT, UPDATE, or DELETE:

\`\`\`sql
CREATE TRIGGER trigger_name
BEFORE DELETE ON table
BEGIN
  ... actions ...
END;
\`\`\`

**Goal:** Create trigger \`prevent_empty\` that prevents deleting the last product in any category. Use \`BEFORE DELETE\` with \`RAISE(ABORT, '...')\`.`,sql:`CREATE TRIGGER prevent_empty BEFORE DELETE ON products BEGIN SELECT CASE WHEN (SELECT COUNT(*) FROM products WHERE category = OLD.category) <= 1 THEN RAISE(ABORT, 'Cannot delete last product in category') END; END;
`,seed:o,check:{type:"success"}},{id:"55-window",module:11,title:"Window Functions",type:"practice",file:"55-window.sql",markdown:`# Window Functions

Window functions compute values across rows related to the current row \u2014 without collapsing them like GROUP BY.

\`\`\`sql
SELECT column, ROW_NUMBER() OVER (ORDER BY col) AS rank FROM table;
\`\`\`

**Goal:** Return each product name, price, and a row number ordered by price descending (most expensive first).`,sql:`SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS rank FROM products;
`,seed:o,check:{type:"result",expectedSql:"SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS rank FROM products;"}},{id:"56-case",module:11,title:"CASE Statements",type:"practice",file:"56-case.sql",markdown:`# CASE Statements

CashPal's product catalog needs price labels.

CASE adds conditional logic to queries:

\`\`\`sql
SELECT column,
  CASE WHEN condition THEN value ELSE other END AS alias
FROM table;
\`\`\`

**Your task:**
- [ ] Return product name and label
- [ ] 'Cheap' if price < 100
- [ ] 'Moderate' if price 100\u2013500
- [ ] 'Expensive' if price > 500
- [ ] Sort by price ascending`,sql:`SELECT name, CASE WHEN price < 100 THEN 'Cheap' WHEN price BETWEEN 100 AND 500 THEN 'Moderate' ELSE 'Expensive' END AS label FROM products ORDER BY price;
`,seed:o,check:{type:"result",expectedSql:"SELECT name, CASE WHEN price < 100 THEN 'Cheap' WHEN price BETWEEN 100 AND 500 THEN 'Moderate' ELSE 'Expensive' END AS label FROM products ORDER BY price;"},checklist:["Label Cheap for price < 100","Label Moderate for price 100-500","Label Expensive for price > 500","Sort by price ascending"]},{id:"57-datetime",module:11,title:"Date and Time Functions",type:"practice",file:"57-datetime.sql",markdown:`# Date and Time Functions

CashPal's event calendar needs month extraction.

SQLite date functions:

\`\`\`sql
DATE('now')           -- today
STRFTIME('%Y', col)   -- extract year
\`\`\`

**Goal:** Return event names and their month number (1-12) from \`events\`. Use \`STRFTIME('%m', event_date) AS month\`. Sort by event_date.`,sql:`SELECT name, STRFTIME('%m', event_date) AS month FROM events ORDER BY event_date;
`,seed:u,check:{type:"result",expectedSql:"SELECT name, STRFTIME('%m', event_date) AS month FROM events ORDER BY event_date;"}},{id:"58-capstone",module:11,title:"Final Capstone",type:"practice",file:"58-capstone.sql",markdown:`# Final Capstone

Build CashPal's library tracking system from scratch.

**Your task:**
- [ ] Create \`members\` (id INTEGER PK, name TEXT NOT NULL, joined_date TEXT)
- [ ] Create \`books\` (id INTEGER PK, title TEXT NOT NULL, author TEXT NOT NULL)
- [ ] Create \`loans\` (id INTEGER PK, member_id INTEGER FK, book_id INTEGER FK, loan_date TEXT, returned INTEGER DEFAULT 0)
- [ ] Insert 2 members, 3 books, and 2 loans
- [ ] Query: show currently loaned books (returned = 0) with member name and book title \u2014 use JOIN`,sql:`CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL, joined_date TEXT);
CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL);
CREATE TABLE loans (id INTEGER PRIMARY KEY, member_id INTEGER, book_id INTEGER, loan_date TEXT, returned INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id), FOREIGN KEY (book_id) REFERENCES books(id));
INSERT INTO members VALUES (1, 'Alice', '2026-01-15'), (2, 'Bob', '2026-02-20');
INSERT INTO books VALUES (1, 'SQL Basics', 'Jane Doe'), (2, 'Advanced SQL', 'John Smith'), (3, 'Database Design', 'Jane Doe');
INSERT INTO loans VALUES (1, 1, 1, '2026-03-01', 0), (2, 2, 2, '2026-03-05', 0);
`,seed:n,check:{type:"schema",table:"loans",columns:["id","member_id","book_id","loan_date","returned"]},checklist:["Table members with id, name, joined_date","Table books with id, title, author","Table loans with id, member_id, book_id, loan_date, returned","Insert 2 members, 3 books, 2 loans","Query shows loaned books with member name and book title"]}];var O=[{id:"theory-what-is-db",module:1,title:"What is a Database?",type:"theory",file:"theory-what-is-db.md",markdown:`# What is a Database?

A **database** is an organized collection of data. Think of it as a structured filing cabinet.

**Key concepts:**

| Term | Meaning | Example |
|------|---------|---------|
| **Database** | Organized data store | CashPal's customer database |
| **Table** | A set of related records | \`users\`, \`orders\`, \`products\` |
| **Row** | A single record | One user: Ava, 28, Berlin |
| **Column** | A single field | \`name\`, \`age\`, \`city\` |

A **DBMS** (Database Management System) is the software that manages the database. SQLite, PostgreSQL, MySQL are all DBMSs.

**Goal:** understand tables, rows, and columns.`,question:{prompt:"What is a single record in a table called?",options:["Column","Row","Table","Database"],answer:1,explanation:"A row is a single record in a table."},seed:""},{id:"theory-sql-vs-nosql",module:1,title:"SQL vs NoSQL",type:"theory",file:"theory-sql-vs-nosql.md",markdown:`# SQL vs NoSQL

**SQL databases** (relational) use tables with a fixed schema. Great for financial data, transactions, anything requiring consistency.

**NoSQL databases** are more flexible: document stores (MongoDB), key-value (Redis), graph (Neo4j). Great for rapid prototyping, unstructured data.

| Feature | SQL | NoSQL |
|---------|-----|-------|
| Schema | Fixed, predefined | Flexible, dynamic |
| Relationships | Foreign keys, joins | Embedded docs, references |
| Consistency | Strong (ACID) | Eventually consistent (BASE) |
| Scaling | Vertical mostly | Horizontal (sharding) |

CashPal uses SQLite because it's embedded, zero-config, and perfect for learning.

**Goal:** know when to use SQL vs NoSQL.`,question:{prompt:"Which type of database uses tables with a fixed schema?",options:["NoSQL","SQL","Both","Neither"],answer:1,explanation:"SQL databases use tables with a predefined schema."},seed:""},{id:"theory-acid",module:1,title:"ACID Properties",type:"theory",file:"theory-acid.md",markdown:`# ACID Properties

Databases guarantee reliability through **ACID**:

| Letter | Property | Meaning |
|--------|----------|---------|
| **A** | Atomicity | All or nothing \u2014 a transaction completes fully or not at all |
| **C** | Consistency | Data always follows rules (constraints, types) |
| **I** | Isolation | Concurrent transactions don't interfere |
| **D** | Durability | Committed data survives crashes |

**Example \u2014 CashPal transfer:** Moving $100 from A to B must:
- Deduct from A AND add to B (Atomicity)
- Total money stays the same (Consistency)
- Two simultaneous transfers don't conflict (Isolation)
- After success, money stays transferred (Durability)

**Goal:** know what ACID stands for and why it matters.`,question:{prompt:"What does the I in ACID stand for?",options:["Index","Isolation","Integrity","Insert"],answer:1,explanation:"Isolation ensures concurrent transactions do not interfere."},seed:""},{id:"theory-keys",module:1,title:"Keys in Relational Databases",type:"theory",file:"theory-keys.md",markdown:`# Keys in Relational Databases

Keys uniquely identify rows and link tables together.

**Primary Key (PK):** Uniquely identifies each row.
- Only one per table
- Implies NOT NULL + UNIQUE
- Often an auto-incrementing integer

\`\`\`
users: id (PK) | name  | email
       1       | Ava   | ava@...
       2       | Noah  | noah@...
\`\`\`

**Foreign Key (FK):** References a PK in another table \u2014 links rows across tables.

\`\`\`
orders: id (PK) | user_id (FK \u2192 users.id) | item
       1        | 1                       | Laptop
       2        | 1                       | Mouse
\`\`\`

One user can have many orders (1:N relationship).

**Composite Key:** A PK made of multiple columns. Used in junction tables for N:M relationships.

\`\`\`
enrollment: student_id (PK) | course_id (PK) | grade
            1               | 101            | A
            1               | 102            | B
\`\`\`

**\u26A0\uFE0F SQLite quirk:** In SQLite, parts of a composite PK CAN be NULL \u2014 this is non-standard. Other databases (PostgreSQL, MySQL) do NOT allow NULL in any PK column. To be safe, always add \`NOT NULL\` to composite PK columns or use \`UNIQUE(...)\` instead.

**Goal:** know the difference between PK, FK, and composite keys.`,questions:[{prompt:"How many PRIMARY KEYs can a table have?",options:["Unlimited","Two","One","Depends on columns"],answer:2,explanation:"A table can have only one PRIMARY KEY."},{prompt:"In SQLite, can a column in a composite PRIMARY KEY be NULL?",options:["No, never","Yes, SQLite allows it","Only for TEXT columns","Depends on the other columns"],answer:1,explanation:"SQLite allows NULL in composite PK columns \u2014 unusual and non-standard."}],seed:""},{id:"theory-constraints",module:1,title:"Constraints",type:"theory",file:"theory-constraints.md",markdown:"# Constraints\n\nConstraints enforce rules on your data. They prevent invalid data from entering the database.\n\n| Constraint | What it does | Example |\n|------------|-------------|---------|\n| `PRIMARY KEY` | Unique row identifier | `id INTEGER PRIMARY KEY` |\n| `FOREIGN KEY` | Links to another table | `FOREIGN KEY (uid) REFERENCES users(id)` |\n| `NOT NULL` | Column must have a value | `name TEXT NOT NULL` |\n| `UNIQUE` | All values must be different | `email TEXT UNIQUE` |\n| `DEFAULT` | Fallback value if omitted | `status TEXT DEFAULT 'active'` |\n| `CHECK` | Validate against a condition | `age INTEGER CHECK (age >= 18)` |\n\n**In SQL:** constraints are written as part of CREATE TABLE:\n\n```sql\nCREATE TABLE example (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE,\n  age INTEGER CHECK (age >= 18)\n);\n```\n\n**Goal:** know the available constraints and what they do.",question:{prompt:"Which constraint ensures a column always has a value?",options:["UNIQUE","NOT NULL","DEFAULT","CHECK"],answer:1,explanation:"NOT NULL prevents NULL values in a column."},seed:""},{id:"theory-relationships",module:1,title:"Table Relationships",type:"theory",file:"theory-relationships.md",markdown:`# Table Relationships

Tables can relate to each other in three ways:

**1:1 \u2014 One-to-One:** One row in A matches one row in B.
\`\`\`
users 1\u2500\u2500\u2500\u25001 profiles
\`\`\`
Example: one user has one profile. The FK is often the same value as the PK.

**1:N \u2014 One-to-Many:** One row in A matches many rows in B.
\`\`\`
customers 1\u2500\u2500\u2500\u2500N orders
\`\`\`
Example: one customer places many orders. The FK goes in the "many" table (\`orders.customer_id\`).

**N:M \u2014 Many-to-Many:** Many rows in A match many rows in B \u2014 needs a junction table.
\`\`\`
students N\u2500\u2500\u2500\u2500M courses
            \u2195
      enrollment (junction)
\`\`\`
Example: a student takes many courses, a course has many students. The junction table \`enrollment\` has a composite PK (\`student_id\`, \`course_id\`).

| Relationship | FK placement | Junction table? |
|-------------|-------------|-----------------|
| 1:1 | Either side, often shared PK | No |
| 1:N | The "many" side | No |
| N:M | Both sides | Yes |

**Goal:** identify relationships and know when a junction table is needed.`,question:{prompt:"Which relationship requires a junction table?",options:["One-to-one","One-to-many","Many-to-many","All of the above"],answer:2,explanation:"Many-to-many needs a junction table with composite PK."},seed:""},{id:"theory-normalization-intro",module:1,title:"Why Normalize?",type:"theory",file:"theory-normalization-intro.md",markdown:`# Why Normalize?

Normalization eliminates **data redundancy** \u2014 the same data stored in multiple places. Redundancy leads to **anomalies**:

**Update anomaly:** If "Ava" moves from Berlin to Hamburg, you must update every row where her name appears. Miss one, and data is inconsistent.

\`\`\`
Order | Customer | City    | Product
1     | Ava      | Berlin  | Laptop    \u2190 update needed
2     | Ava      | Berlin  | Mouse     \u2190 update needed
3     | Noah     | Hamburg | Keyboard
\`\`\`

**Insert anomaly:** You cannot add a new customer without creating an order.

**Delete anomaly:** Deleting an order may accidentally delete the only record of a customer.

**Fix:** Split the data into related tables (\`customers\`, \`orders\`) \u2014 each fact stored once.

| Anomaly | Description |
|---------|-------------|
| **Update** | Changing data in one place misses other places |
| **Insert** | Cannot add data because of missing related data |
| **Delete** | Deleting data accidentally removes unrelated data |

**Goal:** understand why redundancy is bad.`,question:{prompt:"What anomaly occurs when a customer moves and you must update many rows?",options:["Insert anomaly","Delete anomaly","Update anomaly","Select anomaly"],answer:2,explanation:"Update anomaly \u2014 changing data that appears in many places."},seed:""},{id:"theory-functional-dependencies",module:1,title:"Functional Dependencies",type:"theory",file:"theory-functional-dependencies.md",markdown:`# Functional Dependencies

A **functional dependency** (FD) means: if you know the value of column A, you can determine column B. Written as \`A \u2192 B\` (A determines B).

**Example:**
\`\`\`
order_id \u2192 customer_name, customer_city
product_id \u2192 product_name, category
\`\`\`

If you know the order ID, you know who ordered it. If you know the product ID, you know its name and category.

**Full dependency:** A column depends on the WHOLE primary key.

**Partial dependency:** A column depends on only PART of a composite primary key.

\`\`\`
order_id | product_id | product_name | quantity
  ____PK____/         \u2514\u2500\u2500 depends only on product_id
                              (partial dependency!)
\`\`\`

**Transitive dependency:** A non-key column depends on another non-key column.

\`\`\`
order_id | customer_id | customer_city
    PK       \u2514\u2500\u2500\u2192 depends on customer_id
                       \u2514\u2500\u2500\u2192 depends on customer_id too
                              (transitive: customer_id \u2192 customer_city)
\`\`\`

**Goal:** understand functional, partial, and transitive dependencies.`,question:{prompt:"A \u2192 B means:",options:["A and B are equal","A determines B","B determines A","A and B are unrelated"],answer:1,explanation:"A \u2192 B means column A functionally determines column B."},seed:""},{id:"theory-1nf",module:1,title:"First Normal Form (1NF)",type:"theory",file:"theory-1nf.md",markdown:`# First Normal Form (1NF)

A table is in 1NF when:

1. **Atomic values** \u2014 each column holds one value, not a list
2. **Primary key** \u2014 each row has a unique identifier
3. **No repeating groups** \u2014 no columns like \`item1\`, \`item2\`, \`item3\`

**Bad (not 1NF):**

\`\`\`
Order | Customer | Items
1     | Ava      | Laptop, Mouse, Desk   \u2190 list in one cell!
2     | Noah     | Keyboard
\`\`\`

**Good (1NF):**

\`\`\`
Order | Customer | Item
1     | Ava      | Laptop
1     | Ava      | Mouse     \u2190 rows repeated, but each cell is atomic
1     | Ava      | Desk
2     | Noah     | Keyboard
\`\`\`

Wait \u2014 this still has redundancy (customer name repeats). That's fixed in higher normal forms. 1NF only requires atomic values and no repeating groups.

**Goal:** recognize if a table satisfies 1NF.`,question:{prompt:"Which violates 1NF?",options:['A column containing "Laptop,Mouse,Desk"','A column containing "Laptop"',"An INTEGER PRIMARY KEY","A TEXT column"],answer:0,explanation:"Lists in a single cell violate atomic values \u2014 not 1NF."},seed:""},{id:"theory-2nf",module:1,title:"Second Normal Form (2NF)",type:"theory",file:"theory-2nf.md",markdown:"# Second Normal Form (2NF)\n\nA table is in 2NF when:\n1. It is in 1NF\n2. **No partial dependencies** \u2014 every non-key column depends on the WHOLE primary key\n\n**Partial dependency:** A column depends on only part of a composite key.\n\n**Violation example (not 2NF):**\n\n```\norder_id | product_id | product_name | quantity\n  ____PK____/         \u2514\u2500\u2500 depends on product_id only!\n```\n\n`product_name` depends on `product_id`, not on `order_id`. If you only knew `order_id`, you couldn't determine `product_name` \u2014 but `product_id` alone determines it. This is a **partial dependency**.\n\n**Fix:** Split into two tables:\n- `orders` (order_id, product_id, quantity) \u2014 the relationship\n- `products` (product_id, product_name) \u2014 product details\n\n**Goal:** identify partial dependencies.",question:{prompt:"What is a partial dependency?",options:["Column depends on another non-key column","Column depends on part of a composite PK","Column depends on the whole PK","Column has no dependencies"],answer:1,explanation:"A partial dependency is when a column depends on only part of a composite PK."},seed:""},{id:"theory-3nf",module:1,title:"Third Normal Form (3NF)",type:"theory",file:"theory-3nf.md",markdown:`# Third Normal Form (3NF)

A table is in 3NF when:
1. It is in 2NF
2. **No transitive dependencies** \u2014 a non-key column does NOT depend on another non-key column

**Transitive dependency:** If column A determines column B, and column B determines column C, then C transitively depends on A.

**Violation example (not 3NF):**

\`\`\`
order_id | customer_id | customer_city
    PK       \u2514\u2500\u2192 determines customer_city
         (transitive: customer_id \u2192 customer_city)
\`\`\`

\`customer_city\` depends on \`customer_id\`, not on \`order_id\` directly. If you delete the order, you lose the city \u2014 but the city belongs to the customer, not the order!

**Fix:** Split into:
- \`orders\` (order_id, customer_id)
- \`customers\` (customer_id, city)

**The normalization journey:**

\`\`\`
Unnormalized \u2192 1NF (atomic) \u2192 2NF (no partial deps) \u2192 3NF (no transitive deps)
\`\`\`

Each step removes a specific type of redundancy.

**Goal:** identify transitive dependencies.`,question:{prompt:"customer_id \u2192 customer_city is what kind of dependency?",options:["Partial","Transitive","Full","Direct"],answer:1,explanation:"Transitive \u2014 a non-key column depends on another non-key column."},seed:""},{id:"theory-denormalization",module:1,title:"Denormalization",type:"theory",file:"theory-denormalization.md",markdown:`# Denormalization

Sometimes you **intentionally add redundancy** for performance. This is denormalization.

**When to denormalize:**
- **Read-heavy workloads** \u2014 dashboards, reports, analytics
- **Expensive joins** \u2014 pre-join data into one table for speed
- **Caching** \u2014 store computed values alongside raw data

**Trade-off:** Faster reads, but:
- More storage
- Slower writes (must update multiple places)
- Risk of inconsistency

**Real-world example:** CashPal's dashboard shows each customer's total spending. Instead of computing \`SUM(price)\` with a join on every page load, they store \`total_spent\` directly on the \`customers\` table. The app updates it whenever a new order is placed.

**Goal:** know when to denormalize and the trade-offs.`,question:{prompt:"When is denormalization useful?",options:["Always","When read performance matters more than write efficiency","Never","When data must be unique"],answer:1,explanation:"Denormalization speeds up reads at the cost of redundancy."},seed:""}];var re={1:"Relational Database Theory",2:"Database Fundamentals",3:"Schema & Constraints",4:"CRUD Operations",5:"Query Power Tools",6:"Joins",7:"Subqueries & CTEs",8:"Normalization",9:"Indexes & Performance",10:"Transactions",11:"Advanced Topics"};function s(C){return C.map((r,E)=>({...r,_order:r.order??E})).sort((r,E)=>r._order-E._order)}var le=[...O,...s(T),...s(p),...s(R),...s(h),...s(N),...s(y),...s(L),...s(I),...s(A),...s(S)];export{e as a,d as b,b as c,w as d,re as e,le as f};
