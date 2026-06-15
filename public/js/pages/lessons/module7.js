import { SEED_NORMALIZE } from './seeds.js';

export const module7 = [
  {
    id: '38-why-normalize',
    module: 8,
    title: 'Why Normalize?',
    type: 'theory',
    file: '38-why-normalize.md',
    markdown: `# Why Normalize?

CashPal's order data has a problem — customer info is repeated on every order row. If a customer moves, you must update many rows.

Normalization reduces data redundancy and prevents anomalies (update, insert, delete). Split data into related tables instead of one big blob.

**Goal:** know the main benefit of normalization.`,
    question: {
      prompt: 'What is the main benefit of normalization?',
      options: ['Less data redundancy', 'More storage used', 'More columns', 'Faster queries'],
      answer: 0,
      explanation: 'Normalization eliminates redundant data, preventing inconsistencies.',
    },
    seed: SEED_NORMALIZE,
  },
  {
    id: '39-1nf',
    module: 8,
    title: 'First Normal Form (1NF)',
    type: 'practice',
    file: '39-1nf.sql',
    markdown: `# First Normal Form

A table is in 1NF when:
- Each column has atomic values (no lists)
- Each row has a primary key
- No repeating groups

CashPal's \`orders_denorm\` table repeats customer info. Split it:

**Your task:**
- [ ] Create \`customers\` (id, name, city)
- [ ] Create \`orders\` (id, customer_id, product, price)`,
    sql: 'CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);\nCREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL);\n',
    seed: SEED_NORMALIZE,
    check: { type: 'schema', table: 'customers', columns: ['id', 'name', 'city'] },
    checklist: [
      'Table customers with id, name, city',
      'Table orders with id, customer_id, product, price',
    ],
  },
  {
    id: '40-2nf',
    module: 8,
    title: 'Second Normal Form (2NF)',
    type: 'practice',
    file: '40-2nf.sql',
    markdown: `# Second Normal Form

A table is in 2NF when:
- It is in 1NF
- Every non-key column depends on the WHOLE primary key

In CashPal's data, \`category\` depends on \`product\`, not the order. Split further.

**Your task:**
- [ ] Create \`customers\` (id, name, city)
- [ ] Create \`products\` (id, name, category)
- [ ] Create \`orders\` (id, customer_id, product_id)`,
    sql: 'CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);\nCREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL);\nCREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product_id INTEGER NOT NULL);\n',
    seed: SEED_NORMALIZE,
    check: { type: 'schema', table: 'products', columns: ['id', 'name', 'category'] },
    checklist: [
      'Table customers with id, name, city',
      'Table products with id, name, category',
      'Table orders with id, customer_id, product_id',
    ],
  },
  {
    id: '41-3nf',
    module: 8,
    title: 'Third Normal Form (3NF)',
    type: 'practice',
    file: '41-3nf.sql',
    markdown: `# Third Normal Form

A table is in 3NF when:
- It is in 2NF
- No transitive dependency (column depends on another non-key column)

In CashPal's data, \`customer_city\` depends on \`customer\`, not the order. We've already split this.

**Your task:**
- [ ] Create \`customers\` (id, name, city)
- [ ] Create \`orders\` (id, customer_id, product, price)
- [ ] Add FOREIGN KEY on \`customer_id\` → \`customers(id)\``,
    sql: 'CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);\nCREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, product TEXT NOT NULL, price REAL NOT NULL, FOREIGN KEY (customer_id) REFERENCES customers(id));\n',
    seed: SEED_NORMALIZE,
    check: { type: 'fk', table: 'orders', column: 'customer_id' },
    checklist: [
      'Table customers with id, name, city',
      'Table orders with id, customer_id, product, price',
      'Foreign key on customer_id referencing customers(id)',
    ],
  },
  {
    id: '42-denormalization',
    module: 8,
    title: 'Denormalization',
    type: 'theory',
    file: '42-denormalization.md',
    markdown: `# Denormalization

Sometimes you add redundancy intentionally — for read performance. CashPal uses denormalized reporting tables for dashboards where writes are rare.

**Goal:** know when to denormalize.`,
    question: {
      prompt: 'When is denormalization useful?',
      options: ['Always', 'When data must be unique', 'Never', 'When read performance matters more than write efficiency'],
      answer: 3,
      explanation: 'Denormalization speeds up reads by reducing joins, at the cost of redundant data.',
    },
    seed: SEED_NORMALIZE,
  },
];
