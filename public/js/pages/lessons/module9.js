import { SEED_EMPTY } from './seeds.js';

export const module9 = [
  {
    id: '48-acid',
    module: 9,
    title: 'ACID Properties',
    type: 'theory',
    file: '48-acid.md',
    markdown: `# 48. ACID properties

Transactions guarantee:
- **Atomicity** — all or nothing
- **Consistency** — data stays valid
- **Isolation** — concurrent transactions don't interfere
- **Durability** — committed data persists

**Goal:** know what ACID stands for.`,
    question: {
      prompt: 'What does the I in ACID stand for?',
      options: ['Index', 'Isolation', 'Integrity', 'Insert'],
      answer: 1,
      explanation: 'Isolation ensures concurrent transactions do not interfere with each other.',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '49-begin',
    module: 9,
    title: 'Starting Transactions',
    type: 'practice',
    file: '49-begin.sql',
    markdown: `# 49. Starting transactions

Wrap operations in \`BEGIN TRANSACTION\` and \`COMMIT\`:

\`\`\`sql
BEGIN TRANSACTION;
CREATE TABLE ...;
INSERT INTO ...;
COMMIT;
\`\`\`

**Goal:** Create a table \`tasks\` with columns \`id\` (INTEGER PRIMARY KEY) and \`title\` (TEXT NOT NULL) inside a transaction, then COMMIT.`,
    seed: SEED_EMPTY,
    check: { type: 'schema', table: 'tasks', columns: ['id', 'title'] },
  },
  {
    id: '50-commit',
    module: 9,
    title: 'Committing',
    type: 'practice',
    file: '50-commit.sql',
    markdown: `# 50. Committing

\`COMMIT\` saves all changes made since \`BEGIN TRANSACTION\`. Changes become visible and permanent.

**Goal:** Insert a row into the \`tasks\` table (created in previous lesson) inside a transaction and COMMIT. The table already exists from the seed.`,
    seed: SEED_EMPTY,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '51-rollback',
    module: 9,
    title: 'Rolling Back',
    type: 'practice',
    file: '51-rollback.sql',
    markdown: `# 51. Rolling back

\`ROLLBACK\` undoes all changes since \`BEGIN TRANSACTION\`:

\`\`\`sql
BEGIN;
DELETE FROM table;
ROLLBACK; -- nothing happened
\`\`\`

**Goal:** Delete all rows from \`tasks\` inside a transaction, then ROLLBACK. The rows should still exist after. Check with \`SELECT COUNT(*) FROM tasks\` to verify.`,
    seed: SEED_EMPTY,
    check: { type: 'success' },
  },
  {
    id: '52-savepoint',
    module: 9,
    title: 'Savepoints',
    type: 'practice',
    file: '52-savepoint.sql',
    markdown: `# 52. Savepoints

Savepoints allow partial rollbacks within a transaction:

\`\`\`sql
SAVEPOINT sp;
... some work ...
ROLLBACK TO sp; -- undo to savepoint
COMMIT;
\`\`\`

**Goal:** Insert two rows into \`tasks\` after a SAVEPOINT, then ROLLBACK TO that savepoint, insert one more row, and COMMIT. Only the last row persists.`,
    seed: SEED_EMPTY,
    check: { type: 'changes', min: 1 },
  },
];
