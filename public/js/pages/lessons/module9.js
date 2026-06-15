import { SEED_EMPTY } from './seeds.js';

export const module9 = [
  {
    id: '48-acid',
    module: 10,
    title: 'ACID Properties',
    type: 'theory',
    file: '48-acid.md',
    markdown: `# ACID Properties

CashPal handles money — transactions must be reliable.

Transactions guarantee:
- **A**tomicity — all or nothing
- **C**onsistency — data stays valid
- **I**solation — concurrent transactions don't interfere
- **D**urability — committed data persists

**Goal:** know what ACID stands for.`,
    question: {
      prompt: 'What does the I in ACID stand for?',
      options: ['Index', 'Isolation', 'Integrity', 'Insert'],
      answer: 1,
      explanation: 'Isolation ensures concurrent transactions do not interfere.',
    },
    seed: SEED_EMPTY,
  },
  {
    id: '49-begin',
    module: 10,
    title: 'Starting Transactions',
    type: 'practice',
    file: '49-begin.sql',
    markdown: `# Starting Transactions

CashPal needs a \`tasks\` table for tracking work.

Wrap operations in BEGIN TRANSACTION and COMMIT:

\`\`\`sql
BEGIN TRANSACTION;
CREATE TABLE ...;
INSERT INTO ...;
COMMIT;
\`\`\`

**Goal:** Create \`tasks\` (id INTEGER PK, title TEXT NOT NULL) inside a transaction, then COMMIT.`,
    sql: 'BEGIN TRANSACTION;\nCREATE TABLE tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL);\nCOMMIT;\n',
    seed: SEED_EMPTY,
    check: { type: 'schema', table: 'tasks', columns: ['id', 'title'] },
  },
  {
    id: '50-commit',
    module: 10,
    title: 'Committing',
    type: 'practice',
    file: '50-commit.sql',
    markdown: `# Committing

COMMIT saves all changes since BEGIN. Changes become permanent.

**Goal:** Insert a row into \`tasks\` inside a transaction and COMMIT.`,
    sql: 'BEGIN TRANSACTION;\nINSERT INTO tasks (title) VALUES (\'Test task\');\nCOMMIT;\n',
    seed: SEED_EMPTY,
    check: { type: 'changes', min: 1 },
  },
  {
    id: '51-rollback',
    module: 10,
    title: 'Rolling Back',
    type: 'practice',
    file: '51-rollback.sql',
    markdown: `# Rolling Back

ROLLBACK undoes all changes since BEGIN — CashPal's safety net.

\`\`\`sql
BEGIN;
DELETE FROM table;
ROLLBACK; -- nothing happened
\`\`\`

**Goal:** Delete all rows from \`tasks\` inside a transaction, then ROLLBACK. Verify with \`SELECT COUNT(*)\`.`,
    sql: 'BEGIN;\nDELETE FROM tasks;\nROLLBACK;\nSELECT COUNT(*) FROM tasks;\n',
    seed: SEED_EMPTY,
    check: { type: 'success' },
  },
  {
    id: '52-savepoint',
    module: 10,
    title: 'Savepoints',
    type: 'practice',
    file: '52-savepoint.sql',
    markdown: `# Savepoints

Savepoints allow partial rollbacks within a transaction — undo part of your work without losing everything.

\`\`\`sql
SAVEPOINT sp;
... some work ...
ROLLBACK TO sp; -- undo to savepoint
COMMIT;
\`\`\`

**Goal:** Insert two rows into \`tasks\` after a SAVEPOINT, ROLLBACK TO that savepoint, insert one more row, and COMMIT. Only the last row persists.`,
    sql: 'BEGIN;\nINSERT INTO tasks (title) VALUES (\'First\');\nSAVEPOINT sp;\nINSERT INTO tasks (title) VALUES (\'Second\');\nINSERT INTO tasks (title) VALUES (\'Third\');\nROLLBACK TO sp;\nINSERT INTO tasks (title) VALUES (\'Last\');\nCOMMIT;\n',
    seed: SEED_EMPTY,
    check: { type: 'changes', min: 1 },
  },
];
