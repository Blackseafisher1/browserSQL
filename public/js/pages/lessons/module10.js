import { SEED_SHOP, SEED_INVENTORY, SEED_DATES, SEED_EMPTY_FK } from './seeds.js';

export const module10 = [
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
];
