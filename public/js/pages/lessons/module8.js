import { SEED_INVENTORY } from './seeds.js';

export const module8 = [
  {
    id: '43-what-index',
    module: 9,
    title: 'What is an Index?',
    type: 'theory',
    file: '43-what-index.md',
    markdown: `# What is an Index?

CashPal's product catalog is growing. Queries are getting slow.

An index is a B-Tree that speeds up lookups — like a book index. Trade-off: faster reads, slower writes.

PRIMARY KEY columns are automatically indexed.

**Goal:** know what an index does.`,
    question: {
      prompt: 'Which columns are indexed automatically in SQLite?',
      options: ['All columns', 'PRIMARY KEY columns', 'TEXT columns', 'No columns'],
      answer: 1,
      explanation: 'PRIMARY KEY columns get an automatic index.',
    },
    seed: SEED_INVENTORY,
  },
  {
    id: '44-create-index',
    module: 9,
    title: 'Creating Indexes',
    type: 'practice',
    file: '44-create-index.sql',
    markdown: `# Creating Indexes

CashPal's \`products\` table needs faster category lookups.

Use \`CREATE INDEX\` to add an index:

\`\`\`sql
CREATE INDEX index_name ON table (column);
\`\`\`

**Goal:** Create an index \`idx_category\` on \`products(category)\`.`,
    sql: 'CREATE INDEX idx_category ON products (category);\n',
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '45-explain-plan',
    module: 9,
    title: 'Query Planning',
    type: 'practice',
    file: '45-explain-plan.sql',
    markdown: `# Query Planning

Check if CashPal's indexes are being used.

EXPLAIN QUERY PLAN shows how SQLite executes a query:

\`\`\`sql
EXPLAIN QUERY PLAN SELECT * FROM table WHERE column = value;
\`\`\`

**Goal:** Run EXPLAIN QUERY PLAN on \`SELECT * FROM products WHERE category = 'Electronics'\`.`,
    sql: "EXPLAIN QUERY PLAN SELECT * FROM products WHERE category = 'Electronics';\n",
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '46-composite-index',
    module: 9,
    title: 'Composite Indexes',
    type: 'practice',
    file: '46-composite-index.sql',
    markdown: `# Composite Indexes

A composite index covers multiple columns. Column order matters — leftmost first.

**Your task:**
- [ ] Create composite index \`idx_cat_price\` on \`products(category, price)\`
- [ ] Create index \`idx_stock\` on \`products(stock)\``,
    sql: 'CREATE INDEX idx_cat_price ON products (category, price);\nCREATE INDEX idx_stock ON products (stock);\n',
    seed: SEED_INVENTORY,
    check: { type: 'changes', min: 0 },
    checklist: [
      'Composite index idx_cat_price on (category, price)',
      'Index idx_stock on (stock)',
    ],
  },
  {
    id: '47-no-index',
    module: 9,
    title: 'When NOT to Index',
    type: 'theory',
    file: '47-no-index.md',
    markdown: `# When NOT to Index

Avoid indexes on:
- Small tables (full scan is fast enough)
- Columns updated frequently (index maintenance cost)
- Columns with few unique values (low selectivity)

**Goal:** know when indexes hurt more than help.`,
    question: {
      prompt: 'Which column is a BAD candidate for an index?',
      options: ['A primary key', 'A column with many unique values', 'A column with only two possible values', 'A foreign key'],
      answer: 2,
      explanation: 'Low-selectivity columns (few unique values) make poor indexes.',
    },
    seed: SEED_INVENTORY,
  },
];
