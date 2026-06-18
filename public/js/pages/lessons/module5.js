import { SEED_SHOP, SEED_EMPLOYEES, SEED_SHOP_EXT } from './seeds.js';

export const module5 = [
  {
    id: '25-inner-join',
    module: 6,
    title: 'INNER JOIN',
    type: 'practice',
    file: '25-inner-join.sql',
    markdown: `# INNER JOIN

CashPal needs to see which customers ordered what.

\`INNER JOIN\` combines rows where a condition matches:

\`\`\`sql
SELECT a.col, b.col FROM table_a
INNER JOIN table_b ON a.id = b.foreign_id;
\`\`\`

**Goal:** Return \`customers.name\` and \`orders.item\` by joining on \`customers.id = orders.customer_id\`.`,
    sql: 'SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;' },
  },
  {
    id: '26-old-join',
    module: 6,
    title: 'Old-School Joins (Implicit)',
    type: 'theory',
    file: '26-old-join.md',
    markdown: `# Old-School Implicit Joins

Before \`JOIN ... ON\`, SQL used commas in FROM:

\`\`\`sql
SELECT customers.name, orders.item
FROM customers, orders
WHERE customers.id = orders.customer_id;
\`\`\`

**Why not use it:** Easy to forget WHERE and create a cross join. Modern JOIN makes intent clearer.

**Goal:** know the old syntax when you see it in legacy code.`,
    question: {
      prompt: 'What happens if you omit WHERE in a comma-separated FROM?',
      options: ['Syntax error', 'Cross join (every row paired)', 'Empty result', 'Only matching rows'],
      answer: 1,
      explanation: 'Without WHERE, commas create a CROSS JOIN.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '26-left-join',
    module: 6,
    title: 'LEFT JOIN',
    type: 'practice',
    file: '26-left-join.sql',
    markdown: `# LEFT JOIN

CashPal wants ALL customers, even ones without orders.

\`LEFT JOIN\` keeps all rows from the left table. Unmatched columns show NULL:

\`\`\`sql
SELECT a.col, b.col FROM table_a
LEFT JOIN table_b ON a.id = b.foreign_id;
\`\`\`

**Goal:** Return \`customers.name\` and \`orders.item\`. All customers must appear — those without orders show NULL for item.`,
    sql: 'SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;' },
  },
  {
    id: '27-right-join',
    module: 6,
    title: 'RIGHT JOIN (Theory)',
    type: 'theory',
    file: '27-right-join.md',
    markdown: `# RIGHT JOIN

\`RIGHT JOIN\` keeps ALL rows from the right table. SQLite does not support it — swap tables and use \`LEFT JOIN\`.

**Goal:** know how to simulate RIGHT JOIN.`,
    question: {
      prompt: 'How do you simulate RIGHT JOIN in SQLite?',
      options: ['Use RIGHT JOIN anyway', 'Swap tables and use LEFT JOIN', 'Use INNER JOIN', 'Use CROSS JOIN'],
      answer: 1,
      explanation: 'Swap the table order and use LEFT JOIN.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '28-full-join',
    module: 6,
    title: 'FULL OUTER JOIN (Theory)',
    type: 'theory',
    file: '28-full-join.md',
    markdown: `# FULL OUTER JOIN

Keeps rows from both sides. Not supported in SQLite — combine LEFT JOIN and RIGHT JOIN with UNION.

**Goal:** know the concept.`,
    question: {
      prompt: 'Which operation combines LEFT JOIN and RIGHT JOIN results?',
      options: ['UNION', 'INTERSECT', 'EXCEPT', 'CROSS JOIN'],
      answer: 0,
      explanation: 'UNION combines LEFT JOIN and RIGHT JOIN to simulate FULL OUTER JOIN.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '29-self-join',
    module: 6,
    title: 'Self Joins',
    type: 'practice',
    file: '29-self-join.sql',
    markdown: `# Self Joins

CashPal's org chart — show who reports to whom.

A self join joins a table to itself. Use aliases to tell them apart:

\`\`\`sql
SELECT a.col, b.col FROM table AS a
INNER JOIN table AS b ON a.id = b.ref_id;
\`\`\`

The \`employees\` table has \`manager_id\` referencing \`id\`.

**Goal:** Return \`e.name AS employee\` and \`m.name AS manager\`. Use LEFT JOIN so employees without managers still appear.`,
    sql: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;\n',
    seed: SEED_EMPLOYEES,
    check: { type: 'result', expectedSql: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;' },
  },
  {
    id: '30-multi-join',
    module: 6,
    title: 'Joining Multiple Tables',
    type: 'practice',
    file: '30-multi-join.sql',
    markdown: `# Joining Multiple Tables

CashPal's full order pipeline — customers → orders → products.

Chain multiple JOIN clauses:

\`\`\`sql
SELECT a.col, b.col, c.col
FROM table_a a
INNER JOIN table_b b ON a.id = b.a_id
INNER JOIN table_c c ON b.id = c.b_id;
\`\`\`

**Goal:** Return \`customers.name AS customer\`, \`products.name AS product\`, and \`orders.quantity\` by joining all three tables.`,
    sql: 'SELECT customers.name AS customer, products.name AS product, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;\n',
    seed: SEED_SHOP_EXT,
    check: { type: 'result', expectedSql: 'SELECT customers.name AS customer, products.name AS product, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;' },
  },
  {
    id: '31-join-mastery',
    module: 6,
    title: 'Join Mastery',
    type: 'practice',
    file: '31-join-mastery.sql',
    markdown: `# Join Mastery

CashPal's analytics: customer order summary.

**Your task:**
- [ ] Show each customer's name, total quantity ordered, and distinct products bought
- [ ] Only customers with at least 2 total items
- [ ] Sort by total quantity descending`,
    sql: 'SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;\n',
    seed: SEED_SHOP_EXT,
    check: { type: 'result', expectedSql: 'SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;' },
    checklist: [
      'Show customer name, total quantity, distinct products',
      'Only customers with at least 2 items',
      'Sort by quantity descending',
    ],
  },
];
