import { SEED_SHOP, SEED_EMPLOYEES, SEED_SHOP_EXT } from './seeds.js';

export const module5 = [
  {
    id: '25-inner-join',
    module: 5,
    title: 'INNER JOIN',
    type: 'practice',
    file: '25-inner-join.sql',
    markdown: `# 25. INNER JOIN

\`INNER JOIN\` combines rows from two tables where a condition matches:

\`\`\`sql
SELECT a.col, b.col FROM table_a
INNER JOIN table_b ON a.id = b.foreign_id;
\`\`\`

Only rows with matches in both tables appear.

**Goal:** Write a query that shows each customer name alongside their order item. Use \`INNER JOIN\` on \`customers.id = orders.customer_id\`.`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT customers.name, orders.item FROM customers INNER JOIN orders ON customers.id = orders.customer_id;' },
  },
  {
    id: '26-left-join',
    module: 5,
    title: 'LEFT JOIN',
    type: 'practice',
    file: '26-left-join.sql',
    markdown: `# 26. LEFT JOIN

\`LEFT JOIN\` keeps ALL rows from the left table, even without matches. Unmatched right columns show \`NULL\`:

\`\`\`sql
SELECT a.col, b.col FROM table_a
LEFT JOIN table_b ON a.id = b.foreign_id;
\`\`\`

**Goal:** Write a query that shows ALL customers and their order items. Customers without orders should still appear (item shows NULL).`,
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id;' },
  },
  {
    id: '27-right-join',
    module: 5,
    title: 'RIGHT JOIN (Theory)',
    type: 'theory',
    file: '27-right-join.md',
    markdown: `# 27. RIGHT JOIN

\`RIGHT JOIN\` keeps ALL rows from the right table. SQLite does not support it — use \`LEFT JOIN\` and swap the tables.

**Goal:** know how to simulate RIGHT JOIN.`,
    question: {
      prompt: 'How do you simulate RIGHT JOIN in SQLite?',
      options: ['Use RIGHT JOIN anyway', 'Swap tables and use LEFT JOIN', 'Use INNER JOIN', 'Use CROSS JOIN'],
      answer: 1,
      explanation: 'Swap the table order and use LEFT JOIN to get the same effect.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '28-full-join',
    module: 5,
    title: 'FULL OUTER JOIN (Theory)',
    type: 'theory',
    file: '28-full-join.md',
    markdown: `# 28. FULL OUTER JOIN

\`FULL OUTER JOIN\` keeps rows from both sides. Not supported in SQLite — combine LEFT JOIN and RIGHT JOIN with \`UNION\`.

**Goal:** know the concept even if SQLite cannot run it.`,
    question: {
      prompt: 'Which SQL operation combines LEFT JOIN and RIGHT JOIN results?',
      options: ['UNION', 'INTERSECT', 'EXCEPT', 'CROSS JOIN'],
      answer: 0,
      explanation: 'UNION combines the results of LEFT JOIN and RIGHT JOIN to simulate FULL OUTER JOIN.',
    },
    seed: SEED_SHOP,
  },
  {
    id: '29-self-join',
    module: 5,
    title: 'Self Joins',
    type: 'practice',
    file: '29-self-join.sql',
    markdown: `# 29. Self joins

A self join joins a table to itself. Use different aliases to tell them apart:

\`\`\`sql
SELECT a.col, b.col FROM table AS a
INNER JOIN table AS b ON a.id = b.ref_id;
\`\`\`

The \`employees\` table has \`manager_id\` referencing \`id\` in the same table.

**Goal:** Write a query that shows each employee name alongside their manager name. Use \`LEFT JOIN\` so top-level employees (no manager) still appear.`,
    seed: SEED_EMPLOYEES,
    check: { type: 'result', expectedSql: 'SELECT e.name AS employee, m.name AS manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;' },
  },
  {
    id: '30-multi-join',
    module: 5,
    title: 'Joining Multiple Tables',
    type: 'practice',
    file: '30-multi-join.sql',
    markdown: `# 30. Joining multiple tables

Chain multiple \`JOIN\` clauses to combine three or more tables:

\`\`\`sql
SELECT a.col, b.col, c.col
FROM table_a a
INNER JOIN table_b b ON a.id = b.a_id
INNER JOIN table_c c ON b.id = c.b_id;
\`\`\`

**Goal:** Write a query showing each customer name, product name, and order quantity by joining \`customers\`, \`orders\`, and \`products\`.`,
    seed: SEED_SHOP_EXT,
    check: { type: 'result', expectedSql: 'SELECT customers.name, products.name, orders.quantity FROM customers INNER JOIN orders ON customers.id = orders.customer_id INNER JOIN products ON orders.product_id = products.id;' },
  },
  {
    id: '31-join-mastery',
    module: 5,
    title: 'Join Mastery',
    type: 'practice',
    file: '31-join-mastery.sql',
    markdown: `# 31. Join mastery

Combine joins, aggregation, and ordering across multiple tables.

The database has \`customers\`, \`orders\`, and \`products\` tables.

**Goal:** Write a query that shows each customer name, the total quantity of products they ordered, and the number of distinct products they bought. Only show customers who ordered at least 2 total items. Sort by total quantity descending.`,
    seed: SEED_SHOP_EXT,
    check: { type: 'result', expectedSql: 'SELECT customers.name, SUM(orders.quantity) AS total_qty, COUNT(DISTINCT orders.product_id) AS distinct_products FROM customers INNER JOIN orders ON customers.id = orders.customer_id GROUP BY customers.id HAVING total_qty >= 2 ORDER BY total_qty DESC;' },
  },
];
