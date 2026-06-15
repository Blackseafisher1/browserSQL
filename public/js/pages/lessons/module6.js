import { SEED_SHOP, SEED_EMPLOYEES } from './seeds.js';

export const module6 = [
  {
    id: '31-subquery-where',
    module: 7,
    title: 'Subquery in WHERE',
    type: 'practice',
    file: '31-subquery-where.sql',
    markdown: `# Subquery in WHERE

CashPal needs to find high-value customers.

A subquery is a query inside another query. Use it in WHERE with IN:

\`\`\`sql
SELECT columns FROM table
WHERE id IN (SELECT foreign_id FROM other_table WHERE condition);
\`\`\`

**Goal:** Return names of customers who placed orders worth more than 100. Use a subquery with \`WHERE id IN\`.`,
    sql: 'SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE price > 100);\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE price > 100);' },
  },
  {
    id: '32-subquery-select',
    module: 7,
    title: 'Subquery in SELECT',
    type: 'practice',
    file: '32-subquery-select.sql',
    markdown: `# Subquery in SELECT

CashPal wants each customer's order count next to their name.

A subquery in SELECT computes a value per row (must return a single value):

\`\`\`sql
SELECT column, (SELECT COUNT(*) FROM other WHERE other.id = main.id) AS alias
FROM table;
\`\`\`

**Goal:** Show each customer name alongside the number of orders they placed.`,
    sql: 'SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count FROM customers;\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT name, (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) AS order_count FROM customers;' },
  },
  {
    id: '33-subquery-from',
    module: 7,
    title: 'Subquery in FROM',
    type: 'practice',
    file: '33-subquery-from.sql',
    markdown: `# Subquery in FROM

A subquery in FROM acts like a temporary table. Must have an alias:

\`\`\`sql
SELECT columns FROM (SELECT ...) AS alias WHERE condition;
\`\`\`

**Goal:** Find all expensive items (price > 50) by querying from a subquery that selects all orders.`,
    sql: 'SELECT item, price FROM (SELECT * FROM orders) AS expensive WHERE price > 50;\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT item, price FROM (SELECT * FROM orders) AS expensive WHERE price > 50;' },
  },
  {
    id: '34-correlated',
    module: 7,
    title: 'Correlated Subqueries',
    type: 'practice',
    file: '34-correlated.sql',
    markdown: `# Correlated Subqueries

A correlated subquery references the outer query and runs once per row.

CashPal wants items that cost above average:

\`\`\`sql
SELECT columns FROM table_a AS a
WHERE column > (SELECT AVG(column) FROM table_b WHERE b.id = a.id);
\`\`\`

**Goal:** Return items from \`orders\` that cost more than the average price.`,
    sql: 'SELECT item, price FROM orders WHERE price > (SELECT AVG(price) FROM orders);\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT item, price FROM orders WHERE price > (SELECT AVG(price) FROM orders);' },
  },
  {
    id: '35-exists',
    module: 7,
    title: 'EXISTS',
    type: 'practice',
    file: '35-exists.sql',
    markdown: `# EXISTS

EXISTS checks if a subquery returns any rows. Often faster than IN.

\`\`\`sql
SELECT columns FROM table_a AS a
WHERE EXISTS (SELECT 1 FROM table_b WHERE b.ref_id = a.id);
\`\`\`

**Goal:** Return names of customers who have placed at least one order. Use EXISTS.`,
    sql: 'SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = customers.id);\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = customers.id);' },
  },
  {
    id: '36-cte',
    module: 7,
    title: 'Common Table Expressions',
    type: 'practice',
    file: '36-cte.sql',
    markdown: `# Common Table Expressions

A CTE (WITH clause) names a subquery for reuse:

\`\`\`sql
WITH name AS (
  SELECT ... FROM ...
)
SELECT columns FROM name WHERE condition;
\`\`\`

**Goal:** Use a CTE called \`avg_price\` to calculate the average price, then find all items above that average.`,
    sql: 'WITH avg_price AS (SELECT AVG(price) AS avg FROM orders) SELECT item, price FROM orders, avg_price WHERE price > avg_price.avg;\n',
    seed: SEED_SHOP,
    check: { type: 'result', expectedSql: 'WITH avg_price AS (SELECT AVG(price) AS avg FROM orders) SELECT item, price FROM orders, avg_price WHERE price > avg_price.avg;' },
  },
  {
    id: '37-recursive-cte',
    module: 7,
    title: 'Recursive CTEs (Theory)',
    type: 'theory',
    file: '37-recursive-cte.md',
    markdown: `# Recursive CTEs

Recursive CTEs handle hierarchical data (org charts, trees). They reference themselves using UNION ALL.

CashPal uses this for their employee org chart.

**Goal:** know when recursive CTEs are useful.`,
    question: {
      prompt: 'What kind of data is a recursive CTE best for?',
      options: ['Flat tables', 'Hierarchical data like org charts', 'Single-row results', 'Aggregated data'],
      answer: 1,
      explanation: 'Recursive CTEs excel at querying tree structures like employee hierarchies.',
    },
    seed: SEED_EMPLOYEES,
  },
];
