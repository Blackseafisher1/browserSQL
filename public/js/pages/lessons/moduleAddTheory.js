export const moduleTheory = [
  {
    id: 'theory-what-is-db',
    module: 1,
    title: 'What is a Database?',
    type: 'theory',
    file: 'theory-what-is-db.md',
    markdown: `# What is a Database?

A **database** is an organized collection of data. Think of it as a structured filing cabinet.

**Key concepts:**

| Term | Meaning | Example |
|------|---------|---------|
| **Database** | Organized data store | CashPal's customer database |
| **Table** | A set of related records | \`users\`, \`orders\`, \`products\` |
| **Row** | A single record | One user: Ava, 28, Berlin |
| **Column** | A single field | \`name\`, \`age\`, \`city\` |

A **DBMS** (Database Management System) is the software that manages the database. SQLite, PostgreSQL, MySQL are all DBMSs.

**Goal:** understand tables, rows, and columns.`,
    question: {
      prompt: 'What is a single record in a table called?',
      options: ['Column', 'Row', 'Table', 'Database'],
      answer: 1,
      explanation: 'A row is a single record in a table.',
    },
    seed: '',
  },
  {
    id: 'theory-sql-vs-nosql',
    module: 1,
    title: 'SQL vs NoSQL',
    type: 'theory',
    file: 'theory-sql-vs-nosql.md',
    markdown: `# SQL vs NoSQL

**SQL databases** (relational) use tables with a fixed schema. Great for financial data, transactions, anything requiring consistency.

**NoSQL databases** are more flexible: document stores (MongoDB), key-value (Redis), graph (Neo4j). Great for rapid prototyping, unstructured data.

| Feature | SQL | NoSQL |
|---------|-----|-------|
| Schema | Fixed, predefined | Flexible, dynamic |
| Relationships | Foreign keys, joins | Embedded docs, references |
| Consistency | Strong (ACID) | Eventually consistent (BASE) |
| Scaling | Vertical mostly | Horizontal (sharding) |

CashPal uses SQLite because it's embedded, zero-config, and perfect for learning.

**Goal:** know when to use SQL vs NoSQL.`,
    question: {
      prompt: 'Which type of database uses tables with a fixed schema?',
      options: ['NoSQL', 'SQL', 'Both', 'Neither'],
      answer: 1,
      explanation: 'SQL databases use tables with a predefined schema.',
    },
    seed: '',
  },
  {
    id: 'theory-acid',
    module: 1,
    title: 'ACID Properties',
    type: 'theory',
    file: 'theory-acid.md',
    markdown: `# ACID Properties

Databases guarantee reliability through **ACID**:

| Letter | Property | Meaning |
|--------|----------|---------|
| **A** | Atomicity | All or nothing — a transaction completes fully or not at all |
| **C** | Consistency | Data always follows rules (constraints, types) |
| **I** | Isolation | Concurrent transactions don't interfere |
| **D** | Durability | Committed data survives crashes |

**Example — CashPal transfer:** Moving $100 from A to B must:
- Deduct from A AND add to B (Atomicity)
- Total money stays the same (Consistency)
- Two simultaneous transfers don't conflict (Isolation)
- After success, money stays transferred (Durability)

**Goal:** know what ACID stands for and why it matters.`,
    question: {
      prompt: 'What does the I in ACID stand for?',
      options: ['Index', 'Isolation', 'Integrity', 'Insert'],
      answer: 1,
      explanation: 'Isolation ensures concurrent transactions do not interfere.',
    },
    seed: '',
  },
  {
    id: 'theory-keys',
    module: 1,
    title: 'Keys in Relational Databases',
    type: 'theory',
    file: 'theory-keys.md',
    markdown: `# Keys in Relational Databases

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

**Foreign Key (FK):** References a PK in another table — links rows across tables.

\`\`\`
orders: id (PK) | user_id (FK → users.id) | item
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

**⚠️ SQLite quirk:** In SQLite, parts of a composite PK CAN be NULL — this is non-standard. Other databases (PostgreSQL, MySQL) do NOT allow NULL in any PK column. To be safe, always add \`NOT NULL\` to composite PK columns or use \`UNIQUE(...)\` instead.

**Goal:** know the difference between PK, FK, and composite keys.`,
    questions: [
      {
        prompt: 'How many PRIMARY KEYs can a table have?',
        options: ['Unlimited', 'Two', 'One', 'Depends on columns'],
        answer: 2,
        explanation: 'A table can have only one PRIMARY KEY.',
      },
      {
        prompt: 'In SQLite, can a column in a composite PRIMARY KEY be NULL?',
        options: ['No, never', 'Yes, SQLite allows it', 'Only for TEXT columns', 'Depends on the other columns'],
        answer: 1,
        explanation: 'SQLite allows NULL in composite PK columns — unusual and non-standard.',
      },
    ],
    seed: '',
  },
  {
    id: 'theory-constraints',
    module: 1,
    title: 'Constraints',
    type: 'theory',
    file: 'theory-constraints.md',
    markdown: `# Constraints

Constraints enforce rules on your data. They prevent invalid data from entering the database.

| Constraint | What it does | Example |
|------------|-------------|---------|
| \`PRIMARY KEY\` | Unique row identifier | \`id INTEGER PRIMARY KEY\` |
| \`FOREIGN KEY\` | Links to another table | \`FOREIGN KEY (uid) REFERENCES users(id)\` |
| \`NOT NULL\` | Column must have a value | \`name TEXT NOT NULL\` |
| \`UNIQUE\` | All values must be different | \`email TEXT UNIQUE\` |
| \`DEFAULT\` | Fallback value if omitted | \`status TEXT DEFAULT 'active'\` |
| \`CHECK\` | Validate against a condition | \`age INTEGER CHECK (age >= 18)\` |

**In SQL:** constraints are written as part of CREATE TABLE:

\`\`\`sql
CREATE TABLE example (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  age INTEGER CHECK (age >= 18)
);
\`\`\`

**Goal:** know the available constraints and what they do.`,
    question: {
      prompt: 'Which constraint ensures a column always has a value?',
      options: ['UNIQUE', 'NOT NULL', 'DEFAULT', 'CHECK'],
      answer: 1,
      explanation: 'NOT NULL prevents NULL values in a column.',
    },
    seed: '',
  },
  {
    id: 'theory-relationships',
    module: 1,
    title: 'Table Relationships',
    type: 'theory',
    file: 'theory-relationships.md',
    markdown: `# Table Relationships

Tables can relate to each other in three ways:

**1:1 — One-to-One:** One row in A matches one row in B.
\`\`\`
users 1────1 profiles
\`\`\`
Example: one user has one profile. The FK is often the same value as the PK.

**1:N — One-to-Many:** One row in A matches many rows in B.
\`\`\`
customers 1────N orders
\`\`\`
Example: one customer places many orders. The FK goes in the "many" table (\`orders.customer_id\`).

**N:M — Many-to-Many:** Many rows in A match many rows in B — needs a junction table.
\`\`\`
students N────M courses
            ↕
      enrollment (junction)
\`\`\`
Example: a student takes many courses, a course has many students. The junction table \`enrollment\` has a composite PK (\`student_id\`, \`course_id\`).

| Relationship | FK placement | Junction table? |
|-------------|-------------|-----------------|
| 1:1 | Either side, often shared PK | No |
| 1:N | The "many" side | No |
| N:M | Both sides | Yes |

**Goal:** identify relationships and know when a junction table is needed.`,
    question: {
      prompt: 'Which relationship requires a junction table?',
      options: ['One-to-one', 'One-to-many', 'Many-to-many', 'All of the above'],
      answer: 2,
      explanation: 'Many-to-many needs a junction table with composite PK.',
    },
    seed: '',
  },
  {
    id: 'theory-normalization-intro',
    module: 1,
    title: 'Why Normalize?',
    type: 'theory',
    file: 'theory-normalization-intro.md',
    markdown: `# Why Normalize?

Normalization eliminates **data redundancy** — the same data stored in multiple places. Redundancy leads to **anomalies**:

**Update anomaly:** If "Ava" moves from Berlin to Hamburg, you must update every row where her name appears. Miss one, and data is inconsistent.

\`\`\`
Order | Customer | City    | Product
1     | Ava      | Berlin  | Laptop    ← update needed
2     | Ava      | Berlin  | Mouse     ← update needed
3     | Noah     | Hamburg | Keyboard
\`\`\`

**Insert anomaly:** You cannot add a new customer without creating an order.

**Delete anomaly:** Deleting an order may accidentally delete the only record of a customer.

**Fix:** Split the data into related tables (\`customers\`, \`orders\`) — each fact stored once.

| Anomaly | Description |
|---------|-------------|
| **Update** | Changing data in one place misses other places |
| **Insert** | Cannot add data because of missing related data |
| **Delete** | Deleting data accidentally removes unrelated data |

**Goal:** understand why redundancy is bad.`,
    question: {
      prompt: 'What anomaly occurs when a customer moves and you must update many rows?',
      options: ['Insert anomaly', 'Delete anomaly', 'Update anomaly', 'Select anomaly'],
      answer: 2,
      explanation: 'Update anomaly — changing data that appears in many places.',
    },
    seed: '',
  },
  {
    id: 'theory-functional-dependencies',
    module: 1,
    title: 'Functional Dependencies',
    type: 'theory',
    file: 'theory-functional-dependencies.md',
    markdown: `# Functional Dependencies

A **functional dependency** (FD) means: if you know the value of column A, you can determine column B. Written as \`A → B\` (A determines B).

**Example:**
\`\`\`
order_id → customer_name, customer_city
product_id → product_name, category
\`\`\`

If you know the order ID, you know who ordered it. If you know the product ID, you know its name and category.

**Full dependency:** A column depends on the WHOLE primary key.

**Partial dependency:** A column depends on only PART of a composite primary key.

\`\`\`
order_id | product_id | product_name | quantity
  \____PK____/         └── depends only on product_id
                              (partial dependency!)
\`\`\`

**Transitive dependency:** A non-key column depends on another non-key column.

\`\`\`
order_id | customer_id | customer_city
    PK       └──→ depends on customer_id
                       └──→ depends on customer_id too
                              (transitive: customer_id → customer_city)
\`\`\`

**Goal:** understand functional, partial, and transitive dependencies.`,
    question: {
      prompt: 'A → B means:',
      options: ['A and B are equal', 'A determines B', 'B determines A', 'A and B are unrelated'],
      answer: 1,
      explanation: 'A → B means column A functionally determines column B.',
    },
    seed: '',
  },
  {
    id: 'theory-1nf',
    module: 1,
    title: 'First Normal Form (1NF)',
    type: 'theory',
    file: 'theory-1nf.md',
    markdown: `# First Normal Form (1NF)

A table is in 1NF when:

1. **Atomic values** — each column holds one value, not a list
2. **Primary key** — each row has a unique identifier
3. **No repeating groups** — no columns like \`item1\`, \`item2\`, \`item3\`

**Bad (not 1NF):**

\`\`\`
Order | Customer | Items
1     | Ava      | Laptop, Mouse, Desk   ← list in one cell!
2     | Noah     | Keyboard
\`\`\`

**Good (1NF):**

\`\`\`
Order | Customer | Item
1     | Ava      | Laptop
1     | Ava      | Mouse     ← rows repeated, but each cell is atomic
1     | Ava      | Desk
2     | Noah     | Keyboard
\`\`\`

Wait — this still has redundancy (customer name repeats). That's fixed in higher normal forms. 1NF only requires atomic values and no repeating groups.

**Goal:** recognize if a table satisfies 1NF.`,
    question: {
      prompt: 'Which violates 1NF?',
      options: ['A column containing "Laptop,Mouse,Desk"', 'A column containing "Laptop"', 'An INTEGER PRIMARY KEY', 'A TEXT column'],
      answer: 0,
      explanation: 'Lists in a single cell violate atomic values — not 1NF.',
    },
    seed: '',
  },
  {
    id: 'theory-2nf',
    module: 1,
    title: 'Second Normal Form (2NF)',
    type: 'theory',
    file: 'theory-2nf.md',
    markdown: `# Second Normal Form (2NF)

A table is in 2NF when:
1. It is in 1NF
2. **No partial dependencies** — every non-key column depends on the WHOLE primary key

**Partial dependency:** A column depends on only part of a composite key.

**Violation example (not 2NF):**

\`\`\`
order_id | product_id | product_name | quantity
  \____PK____/         └── depends on product_id only!
\`\`\`

\`product_name\` depends on \`product_id\`, not on \`order_id\`. If you only knew \`order_id\`, you couldn't determine \`product_name\` — but \`product_id\` alone determines it. This is a **partial dependency**.

**Fix:** Split into two tables:
- \`orders\` (order_id, product_id, quantity) — the relationship
- \`products\` (product_id, product_name) — product details

**Goal:** identify partial dependencies.`,
    question: {
      prompt: 'What is a partial dependency?',
      options: ['Column depends on another non-key column', 'Column depends on part of a composite PK', 'Column depends on the whole PK', 'Column has no dependencies'],
      answer: 1,
      explanation: 'A partial dependency is when a column depends on only part of a composite PK.',
    },
    seed: '',
  },
  {
    id: 'theory-3nf',
    module: 1,
    title: 'Third Normal Form (3NF)',
    type: 'theory',
    file: 'theory-3nf.md',
    markdown: `# Third Normal Form (3NF)

A table is in 3NF when:
1. It is in 2NF
2. **No transitive dependencies** — a non-key column does NOT depend on another non-key column

**Transitive dependency:** If column A determines column B, and column B determines column C, then C transitively depends on A.

**Violation example (not 3NF):**

\`\`\`
order_id | customer_id | customer_city
    PK       └─→ determines customer_city
         (transitive: customer_id → customer_city)
\`\`\`

\`customer_city\` depends on \`customer_id\`, not on \`order_id\` directly. If you delete the order, you lose the city — but the city belongs to the customer, not the order!

**Fix:** Split into:
- \`orders\` (order_id, customer_id)
- \`customers\` (customer_id, city)

**The normalization journey:**

\`\`\`
Unnormalized → 1NF (atomic) → 2NF (no partial deps) → 3NF (no transitive deps)
\`\`\`

Each step removes a specific type of redundancy.

**Goal:** identify transitive dependencies.`,
    question: {
      prompt: 'customer_id → customer_city is what kind of dependency?',
      options: ['Partial', 'Transitive', 'Full', 'Direct'],
      answer: 1,
      explanation: 'Transitive — a non-key column depends on another non-key column.',
    },
    seed: '',
  },
  {
    id: 'theory-denormalization',
    module: 1,
    title: 'Denormalization',
    type: 'theory',
    file: 'theory-denormalization.md',
    markdown: `# Denormalization

Sometimes you **intentionally add redundancy** for performance. This is denormalization.

**When to denormalize:**
- **Read-heavy workloads** — dashboards, reports, analytics
- **Expensive joins** — pre-join data into one table for speed
- **Caching** — store computed values alongside raw data

**Trade-off:** Faster reads, but:
- More storage
- Slower writes (must update multiple places)
- Risk of inconsistency

**Real-world example:** CashPal's dashboard shows each customer's total spending. Instead of computing \`SUM(price)\` with a join on every page load, they store \`total_spent\` directly on the \`customers\` table. The app updates it whenever a new order is placed.

**Goal:** know when to denormalize and the trade-offs.`,
    question: {
      prompt: 'When is denormalization useful?',
      options: ['Always', 'When read performance matters more than write efficiency', 'Never', 'When data must be unique'],
      answer: 1,
      explanation: 'Denormalization speeds up reads at the cost of redundancy.',
    },
    seed: '',
  },
];
