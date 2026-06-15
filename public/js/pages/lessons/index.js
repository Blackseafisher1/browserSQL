import { module1 } from './module1.js';
import { module2 } from './module2.js';
import { module3 } from './module3.js';
import { module4 } from './module4.js';
import { module5 } from './module5.js';
import { module6 } from './module6.js';
import { module7 } from './module7.js';
import { module8 } from './module8.js';
import { module9 } from './module9.js';
import { module10 } from './module10.js';
import { moduleTheory } from './moduleAddTheory.js';

export const MODULE_NAMES = {
  1: 'Relational Database Theory',
  2: 'Database Fundamentals',
  3: 'Schema & Constraints',
  4: 'CRUD Operations',
  5: 'Query Power Tools',
  6: 'Joins',
  7: 'Subqueries & CTEs',
  8: 'Normalization',
  9: 'Indexes & Performance',
  10: 'Transactions',
  11: 'Advanced Topics',
};

function sortModule(mod) {
  return mod
    .map((l, i) => ({ ...l, _order: l.order ?? i }))
    .sort((a, b) => a._order - b._order);
}

export const lessons = [
  ...moduleTheory,
  ...sortModule(module1),
  ...sortModule(module2),
  ...sortModule(module3),
  ...sortModule(module4),
  ...sortModule(module5),
  ...sortModule(module6),
  ...sortModule(module7),
  ...sortModule(module8),
  ...sortModule(module9),
  ...sortModule(module10),
];
