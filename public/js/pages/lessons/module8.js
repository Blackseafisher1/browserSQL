import { SEED_INVENTORY } from './seeds.js';

export const module8 = [
  {
    id: '43-what-index',
    module: 8,
    title: 'What is an Index?',
    type: 'theory',
    file: '43-what-index.md',
    markdown: `# What is an index?

An index is a data structure (B-Tree) that speeds up lookups. Like a book index — instead of scanning every page, jump to the right spot. Trade-off: faster reads, slower writes.

\`PRIMARY KEY\` columns are automatically indexed — and this index is faster than a manual index on a regular column because the B-Tree is built on a unique, non-null key.

**Goal:** know what an index does and that PKs get a free index.`,
    question: {
      prompt: 'Which columns are indexed automatically in SQLite?',
      options: ['All columns', 'PRIMARY KEY columns', 'TEXT columns', 'No columns'],
      answer: 1,
      explanation: 'PRIMARY KEY columns get an automatic B-Tree index, which is faster than a manual index on a non-PK column.',
    },
    seed: SEED_INVENTORY,
  },
  {
    id: '44-create-index',
    module: 8,
    title: 'Creating Indexes',
    type: 'practice',
    file: '44-create-index.sql',
    markdown: `# Creating indexes

Use \`CREATE INDEX\` to add an index:

\`\`\`sql
CREATE INDEX index_name ON table (column);
\`\`\`

Note: \`PRIMARY KEY\` columns are already indexed automatically — they don't need (and can't have) a duplicate manual index. This is for non-PK columns.

**Goal:** Create an index named \`idx_category\` on the \`products\` table for the \`category\` column.`,
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '45-explain-plan',
    module: 8,
    title: 'Query Planning',
    type: 'practice',
    file: '45-explain-plan.sql',
    markdown: `# Query planning

\`EXPLAIN QUERY PLAN\` shows how SQLite executes a query. Use it to see if indexes are used:

\`\`\`sql
EXPLAIN QUERY PLAN SELECT * FROM table WHERE column = value;
\`\`\`

**Goal:** Run \`EXPLAIN QUERY PLAN\` on a query that selects from \`products\` where category is 'Electronics'.`,
    seed: SEED_INVENTORY,
    check: { type: 'success' },
  },
  {
    id: '46-composite-index',
    module: 8,
    title: 'Composite Indexes',
    type: 'practice',
    file: '46-composite-index.sql',
    markdown: `# Composite indexes

A composite index covers multiple columns:

\`\`\`sql
CREATE INDEX index_name ON table (col1, col2);
\`\`\`

The column order matters — leftmost columns first.

**Goal:** Create a composite index named \`idx_cat_price\` on \`products\` covering \`category\` then \`price\`. Then create an index named \`idx_stock\` on \`stock\`.`,
    seed: SEED_INVENTORY,
    check: { type: 'changes', min: 0 },
  },
  {
    id: '47-no-index',
    module: 8,
    title: 'When NOT to Index',
    type: 'theory',
    file: '47-no-index.md',
    markdown: `# When NOT to index

Avoid indexes on:
- Small tables (full scan is fast enough)
- Columns updated frequently (index maintenance cost)
- Columns with few unique values (low selectivity)

**Goal:** know when indexes hurt more than help.`,
    question: {
      prompt: 'Which column is a bad candidate for an index?',
      options: ['A primary key', 'A column with many unique values', 'A column with only two possible values', 'A foreign key'],
      answer: 2,
      explanation: 'Low-selectivity columns (few unique values) make poor indexes since they do not narrow results much.',
    },
    seed: SEED_INVENTORY,
  },
];
