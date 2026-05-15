import { SEED_USERS, SEED_USERS_EXT, SEED_SHOP } from './seeds.js';

export const module4 = [
  {
    id: '19-sort',
    module: 4,
    title: 'Sorting',
    type: 'practice',
    file: '19-sort.sql',
    markdown: `# Sorting

Use \`ORDER BY\` to sort results:

\`\`\`sql
SELECT columns FROM table ORDER BY column;
\`\`\`

Use \`ASC\` for ascending (default) or \`DESC\` for descending. Sort by multiple columns with commas.

**Goal:** Write a query that returns \`name\` and \`age\` from \`users\`, sorted by age from youngest to oldest.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name, age FROM users ORDER BY age;' },
  },
  {
    id: '20-limit',
    module: 4,
    title: 'Limiting Results',
    type: 'practice',
    file: '20-limit.sql',
    markdown: `# Limiting results

Use \`LIMIT\` to restrict how many rows are returned:

\`\`\`sql
SELECT columns FROM table LIMIT count;
SELECT columns FROM table LIMIT count OFFSET skip;
\`\`\`

**Goal:** Write a query that returns the names of the 3 oldest users, sorted oldest first.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name FROM users ORDER BY age DESC LIMIT 3;' },
  },
  {
    id: '21-aggregates',
    module: 4,
    title: 'Aggregate Functions',
    type: 'practice',
    file: '21-aggregates.sql',
    markdown: `# Aggregate functions

Aggregate functions summarize many rows into one value:

\`\`\`sql
SELECT COUNT(*), AVG(column), SUM(column), MIN(column), MAX(column) FROM table;
\`\`\`

- \`COUNT(*)\` — number of rows
- \`AVG(col)\` — average value
- \`SUM(col)\` — total
- \`MIN(col)\` / \`MAX(col)\` — smallest / largest

Combine with \`ROUND()\` to control decimal places: \`ROUND(AVG(age), 2)\`

**Goal:** Write a query that returns the total number of users and their average age rounded to 2 decimals. Use \`COUNT(*)\` and \`ROUND(AVG(age), 2)\`.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;' },
    hint: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;',
  },
  {
    id: '22-group',
    module: 4,
    title: 'Grouping',
    type: 'practice',
    file: '22-group.sql',
    markdown: `# Grouping

\`GROUP BY\` groups rows that share a value, so aggregate functions work per group:

\`\`\`sql
SELECT column, COUNT(*) FROM table GROUP BY column;
\`\`\`

Use \`HAVING\` to filter groups (like \`WHERE\` but for groups):

\`\`\`sql
SELECT column, COUNT(*) FROM table GROUP BY column HAVING COUNT(*) > 1;
\`\`\`

**Goal:** Write a query that counts how many users live in each city. Show only cities with at least 2 users, sorted alphabetically.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;' },
    hint: 'GROUP BY city, then HAVING COUNT(*) >= 2',
  },
  {
    id: '23-distinct',
    module: 4,
    title: 'Distinct Values',
    type: 'practice',
    file: '23-distinct.sql',
    markdown: `# Distinct values

\`DISTINCT\` removes duplicate values from results:

\`\`\`sql
SELECT DISTINCT column FROM table;
\`\`\`

**Goal:** Write a query that returns all unique cities from the \`users\` table, without duplicates.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT DISTINCT city FROM users;' },
  },
  {
    id: '24-alias',
    module: 4,
    title: 'Aliases',
    type: 'practice',
    file: '24-alias.sql',
    markdown: `# Aliases

\`AS\` renames columns or tables in query results:

\`\`\`sql
SELECT column AS alias_name FROM table AS table_alias;
\`\`\`

The \`AS\` keyword is optional: \`SELECT column alias FROM table t\`.

**Goal:** Write a query that returns \`name\` renamed to \`user_name\` and \`age\` renamed to \`user_age\` from the \`users\` table.`,
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name AS user_name, age AS user_age FROM users;' },
  },
  {
    id: '25-query-mastery',
    module: 4,
    title: 'Query Mastery',
    type: 'practice',
    file: '25-query-mastery.sql',
    markdown: `# Query mastery

Combine grouping, filtering, sorting, and aggregates into one query.

The \`users\` table has users in multiple cities with different ages.

**Goal:** Write a query that shows for each city: the city name, the number of users, and the average age — but only for cities with at least 2 users. Sort by average age descending.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;' },
  },
  {
    id: '26-union',
    module: 4,
    title: 'UNION',
    type: 'practice',
    file: '26-union.sql',
    markdown: `# UNION

\`UNION\` combines results from two queries into one set. Duplicates are removed automatically. Use \`UNION ALL\` to keep duplicates:

\`\`\`sql
SELECT column FROM table_a
UNION
SELECT column FROM table_b;
\`\`\`

Both SELECTs must have the same number of columns with compatible types.

**Goal:** Write a query that returns all unique city names from \`customers\` and all unique city names from \`users\` combined into one list, sorted alphabetically.`,
    seed: SEED_SHOP + '\n' + SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;" },
    hint: 'SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;',
  },
];
