import { SEED_NORMALIZE } from './seeds.js';

export const module7 = [
  {
    id: '38-why-normalize',
    module: 7,
    title: 'Why Normalize?',
    type: 'theory',
    file: '38-why-normalize.md',
    markdown: `# 38. Why normalize?

Normalization reduces data redundancy and prevents anomalies (update, insert, delete). Split data into related tables instead of one big table.

**Goal:** know the main benefit of normalization.`,
    question: {
      prompt: 'What is the main benefit of normalization?',
      options: ['Faster queries', 'Less data redundancy', 'More storage used', 'More columns'],
      answer: 1,
      explanation: 'Normalization eliminates redundant data, preventing inconsistencies.',
    },
    seed: SEED_NORMALIZE,
  },
  {
    id: '39-1nf',
    module: 7,
    title: 'First Normal Form (1NF)',
    type: 'practice',
    file: '39-1nf.sql',
    markdown: `# 39. First Normal Form

A table is in 1NF when:
- Each column has atomic (indivisible) values
- Each row has a primary key
- No repeating groups

The \`orders_denorm\` table repeats customer info per order. Split it into two tables:

\`\`\`sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL);
\`\`\`

**Goal:** Create the \`customers\` and \`orders\` tables as shown above to achieve 1NF.`,
    seed: SEED_NORMALIZE,
    check: { type: 'schema', table: 'customers', columns: ['id', 'name', 'city'] },
  },
  {
    id: '40-2nf',
    module: 7,
    title: 'Second Normal Form (2NF)',
    type: 'practice',
    file: '40-2nf.sql',
    markdown: `# 40. Second Normal Form

A table is in 2NF when:
- It is in 1NF
- Every non-key column depends on the WHOLE primary key (no partial dependency)

The \`orders_denorm\` table has \`product\` depending on \`id\` but \`category\` depends on \`product\`, not the order. Create three tables:

\`\`\`sql
CREATE TABLE customers (...);
CREATE TABLE products (...);
CREATE TABLE orders (...);
\`\`\`

**Goal:** Create \`customers\` (id, name, city), \`products\` (id, name, category), and \`orders\` (id, customer_id, product_id) tables.`,
    seed: SEED_NORMALIZE,
    check: { type: 'schema', table: 'products', columns: ['id', 'name', 'category'] },
  },
  {
    id: '41-3nf',
    module: 7,
    title: 'Third Normal Form (3NF)',
    type: 'practice',
    file: '41-3nf.sql',
    markdown: `# 41. Third Normal Form

A table is in 3NF when:
- It is in 2NF
- No transitive dependency (a non-key column depends on another non-key column)

Here \`customer_city\` depends on \`customer\`, not on the order id. You already split this in 1NF. The \`orders_denorm\` violates 3NF because \`customer_city\` depends on \`customer\`, not the order primary key.

**Goal:** Create \`customers\` (id, name, city) and \`orders\` (id, customer_id, product, price). Make \`customer_id\` a foreign key referencing \`customers(id)\`.`,
    seed: SEED_NORMALIZE,
    check: { type: 'fk', table: 'orders', column: 'customer_id' },
  },
  {
    id: '42-denormalization',
    module: 7,
    title: 'Denormalization',
    type: 'theory',
    file: '42-denormalization.md',
    markdown: `# 42. Denormalization

Denormalization intentionally adds redundancy for read performance. Used in reporting / analytics where writes are rare.

**Goal:** know when to denormalize.`,
    question: {
      prompt: 'When is denormalization useful?',
      options: ['Always', 'When read performance matters more than write efficiency', 'When data must be unique', 'Never'],
      answer: 1,
      explanation: 'Denormalization speeds up reads by reducing joins, at the cost of redundant data.',
    },
    seed: SEED_NORMALIZE,
  },
];
