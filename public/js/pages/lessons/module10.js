import { SEED_SHOP, SEED_INVENTORY, SEED_DATES, SEED_EMPTY_FK } from './seeds.js';

export const module10 = [
  {
    id: '53-views',
    module: 11,
    title: 'Views',
    type: 'practice',
    file: '53-views.sql',
    markdown: `# Views

CashPal's support team needs a simple way to see customer orders.

A view is a saved query that acts like a virtual table:

\`\`\`sql
CREATE VIEW view_name AS SELECT ...;
\`\`\`

**Goal:** Create a view \`customer_orders\` showing customer names and their order items (use INNER JOIN).`,
    sql: 'CREATE VIEW customer_orders AS SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;\n',
    seed: SEED_SHOP,
    check: { type: 'success' },
  },
  {
    id: '54-triggers',
    module: 11,
    title: 'Triggers',
    type: 'practice',
    file: '54-triggers.sql',
    markdown: `# Triggers

CashPal wants to prevent accidentally deleting the last product in a category.

A trigger runs automatically before/after INSERT, UPDATE, or DELETE:

\`\`\`sql
CREATE TRIGGER trigger_name
BEFORE DELETE ON table
BEGIN
  ... actions ...
END;
\`\`\`

**Goal:** Create trigger \`prevent_empty\` that prevents deleting the last product in any category. Use \`BEFORE DELETE\` with \`RAISE(ABORT, '...')\`.`,
    sql: 'CREATE TRIGGER prevent_empty BEFORE DELETE ON products BEGIN SELECT CASE WHEN (SELECT COUNT(*) FROM products WHERE category = OLD.category) <= 1 THEN RAISE(ABORT, \'Cannot delete last product in category\') END; END;\n',
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '55-window',
    module: 11,
    title: 'Window Functions',
    type: 'practice',
    file: '55-window.sql',
    markdown: `# Window Functions

Window functions compute values across rows related to the current row — without collapsing them like GROUP BY.

\`\`\`sql
SELECT column, ROW_NUMBER() OVER (ORDER BY col) AS rank FROM table;
\`\`\`

**Goal:** Return each product name, price, and a row number ordered by price descending (most expensive first).`,
    sql: 'SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS rank FROM products;\n',
    seed: SEED_INVENTORY,
    check: { type: 'result', expectedSql: 'SELECT name, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS rank FROM products;' },
  },
  {
    id: '56-case',
    module: 11,
    title: 'CASE Statements',
    type: 'practice',
    file: '56-case.sql',
    markdown: `# CASE Statements

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
- [ ] 'Moderate' if price 100–500
- [ ] 'Expensive' if price > 500
- [ ] Sort by price ascending`,
    sql: "SELECT name, CASE WHEN price < 100 THEN 'Cheap' WHEN price BETWEEN 100 AND 500 THEN 'Moderate' ELSE 'Expensive' END AS label FROM products ORDER BY price;\n",
    seed: SEED_INVENTORY,
    check: { type: 'result', expectedSql: "SELECT name, CASE WHEN price < 100 THEN 'Cheap' WHEN price BETWEEN 100 AND 500 THEN 'Moderate' ELSE 'Expensive' END AS label FROM products ORDER BY price;" },
    checklist: [
      'Label Cheap for price < 100',
      'Label Moderate for price 100-500',
      'Label Expensive for price > 500',
      'Sort by price ascending',
    ],
  },
  {
    id: '57-datetime',
    module: 11,
    title: 'Date and Time Functions',
    type: 'practice',
    file: '57-datetime.sql',
    markdown: `# Date and Time Functions

CashPal's event calendar needs month extraction.

SQLite date functions:

\`\`\`sql
DATE('now')           -- today
STRFTIME('%Y', col)   -- extract year
\`\`\`

**Goal:** Return event names and their month number (1-12) from \`events\`. Use \`STRFTIME('%m', event_date) AS month\`. Sort by event_date.`,
    sql: "SELECT name, STRFTIME('%m', event_date) AS month FROM events ORDER BY event_date;\n",
    seed: SEED_DATES,
    check: { type: 'result', expectedSql: "SELECT name, STRFTIME('%m', event_date) AS month FROM events ORDER BY event_date;" },
  },
  {
    id: '58-capstone',
    module: 11,
    title: 'Final Capstone',
    type: 'practice',
    file: '58-capstone.sql',
    markdown: `# Final Capstone

Build CashPal's library tracking system from scratch.

**Your task:**
- [ ] Create \`members\` (id INTEGER PK, name TEXT NOT NULL, joined_date TEXT)
- [ ] Create \`books\` (id INTEGER PK, title TEXT NOT NULL, author TEXT NOT NULL)
- [ ] Create \`loans\` (id INTEGER PK, member_id INTEGER FK, book_id INTEGER FK, loan_date TEXT, returned INTEGER DEFAULT 0)
- [ ] Insert 2 members, 3 books, and 2 loans
- [ ] Query: show currently loaned books (returned = 0) with member name and book title — use JOIN`,
    sql: 'CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT NOT NULL, joined_date TEXT);\nCREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL);\nCREATE TABLE loans (id INTEGER PRIMARY KEY, member_id INTEGER, book_id INTEGER, loan_date TEXT, returned INTEGER DEFAULT 0, FOREIGN KEY (member_id) REFERENCES members(id), FOREIGN KEY (book_id) REFERENCES books(id));\nINSERT INTO members VALUES (1, \'Alice\', \'2026-01-15\'), (2, \'Bob\', \'2026-02-20\');\nINSERT INTO books VALUES (1, \'SQL Basics\', \'Jane Doe\'), (2, \'Advanced SQL\', \'John Smith\'), (3, \'Database Design\', \'Jane Doe\');\nINSERT INTO loans VALUES (1, 1, 1, \'2026-03-01\', 0), (2, 2, 2, \'2026-03-05\', 0);\n',
    seed: SEED_EMPTY_FK,
    check: { type: 'schema', table: 'loans', columns: ['id', 'member_id', 'book_id', 'loan_date', 'returned'] },
    checklist: [
      'Table members with id, name, joined_date',
      'Table books with id, title, author',
      'Table loans with id, member_id, book_id, loan_date, returned',
      'Insert 2 members, 3 books, 2 loans',
      'Query shows loaned books with member name and book title',
    ],
  },
];
