import { SEED_USERS, SEED_USERS_EXT, SEED_SHOP } from './seeds.js';

export const module4 = [
  {
    id: '19-sort',
    module: 5,
    title: 'Sorting',
    type: 'practice',
    file: '19-sort.sql',
    markdown: `# Sorting

CashPal needs a directory sorted by age.

Use \`ORDER BY\` to sort results:

\`\`\`sql
SELECT columns FROM table ORDER BY column;
\`\`\`

Use \`ASC\` (ascending, default) or \`DESC\` (descending).

**Goal:** Return \`name\` and \`age\` from \`users\`, sorted by age youngest first.`,
    sql: 'SELECT name, age FROM users ORDER BY age;\n',
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name, age FROM users ORDER BY age;' },
  },
  {
    id: '20-limit',
    module: 5,
    title: 'Limiting Results',
    type: 'practice',
    file: '20-limit.sql',
    markdown: `# Limiting Results

CashPal's CEO wants the top 3 oldest users.

\`LIMIT\` restricts how many rows are returned:

\`\`\`sql
SELECT columns FROM table LIMIT count;
SELECT columns FROM table LIMIT count OFFSET skip;
\`\`\`

**Goal:** Return the names of the 3 oldest users, sorted oldest first.`,
    sql: 'SELECT name FROM users ORDER BY age DESC LIMIT 3;\n',
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name FROM users ORDER BY age DESC LIMIT 3;' },
  },
  {
    id: '21-aggregates',
    module: 5,
    title: 'Aggregate Functions',
    type: 'practice',
    file: '21-aggregates.sql',
    markdown: `# Aggregate Functions

CashPal needs user statistics.

Aggregate functions summarize many rows into one value:

\`\`\`sql
SELECT COUNT(*), AVG(column), SUM(column), MIN(column), MAX(column) FROM table;
\`\`\`

Combine with \`ROUND()\` for decimals: \`ROUND(AVG(age), 2)\`

**Goal:** Return the total number of users and their average age rounded to 2 decimals.`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;' },
    hint: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;',
    sql: 'SELECT COUNT(*), ROUND(AVG(age), 2) FROM users;\n',
  },
  {
    id: '22-group',
    module: 5,
    title: 'Grouping',
    type: 'practice',
    file: '22-group.sql',
    markdown: `# Grouping

CashPal wants to know user distribution by city.

\`GROUP BY\` groups rows so aggregate functions work per group:

\`\`\`sql
SELECT column, COUNT(*) FROM table GROUP BY column;
\`\`\`

Use \`HAVING\` to filter groups (like WHERE but for groups).

**Your task:**
- [ ] Count users per city
- [ ] Show only cities with at least 2 users
- [ ] Sort alphabetically`,
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;' },
    hint: 'GROUP BY city, then HAVING COUNT(*) >= 2',
    sql: 'SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) >= 2 ORDER BY city;\n',
    checklist: [
      'Count users per city',
      'Filter cities with at least 2 users',
      'Sort alphabetically',
    ],
  },
  {
    id: '23-distinct',
    module: 5,
    title: 'Distinct Values',
    type: 'practice',
    file: '23-distinct.sql',
    markdown: `# Distinct Values

CashPal wants a list of unique cities — no duplicates.

\`DISTINCT\` removes duplicate values:

\`\`\`sql
SELECT DISTINCT column FROM table;
\`\`\`

**Goal:** Return all unique cities from \`users\`.`,
    sql: 'SELECT DISTINCT city FROM users;\n',
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT DISTINCT city FROM users;' },
  },
  {
    id: '24-alias',
    module: 5,
    title: 'Aliases',
    type: 'practice',
    file: '24-alias.sql',
    markdown: `# Aliases

CashPal's API needs specific column names in the response.

\`AS\` renames columns in results:

\`\`\`sql
SELECT column AS alias_name FROM table;
\`\`\`

**Goal:** Return \`name\` as \`user_name\` and \`age\` as \`user_age\` from \`users\`.`,
    sql: 'SELECT name AS user_name, age AS user_age FROM users;\n',
    seed: SEED_USERS,
    check: { type: 'result', expectedSql: 'SELECT name AS user_name, age AS user_age FROM users;' },
  },
  {
    id: '25-query-mastery',
    module: 5,
    title: 'Query Mastery',
    type: 'practice',
    file: '25-query-mastery.sql',
    markdown: `# Query Mastery

CashPal's analytics team needs a city-level report.

**Your task:**
- [ ] Show city name, user count, and average age
- [ ] Only cities with at least 2 users
- [ ] Sort by average age descending`,
    sql: 'SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;\n',
    seed: SEED_USERS_EXT,
    check: { type: 'result', expectedSql: 'SELECT city, COUNT(*) AS cnt, AVG(age) AS avg_age FROM users GROUP BY city HAVING cnt >= 2 ORDER BY avg_age DESC;' },
    checklist: [
      'Show city, user count, average age',
      'Filter cities with at least 2 users',
      'Sort by average age descending',
    ],
  },
  {
    id: '26-union',
    module: 5,
    title: 'UNION',
    type: 'practice',
    file: '26-union.sql',
    markdown: `# UNION

CashPal merged two customer databases. Combine them.

\`UNION\` combines results from two queries (duplicates removed):

\`\`\`sql
SELECT column FROM table_a
UNION
SELECT column FROM table_b;
\`\`\`

**Goal:** Return all unique cities from \`customers\` and \`users\` combined, sorted alphabetically.`,
    seed: SEED_SHOP + '\n' + SEED_USERS,
    check: { type: 'result', expectedSql: "SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;" },
    hint: 'SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;',
    sql: "SELECT city FROM customers UNION SELECT city FROM users ORDER BY city;\n",
  },
];
