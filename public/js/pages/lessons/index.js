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

export const MODULE_NAMES = {
  1: 'Database Fundamentals',
  2: 'Schema & Constraints',
  3: 'CRUD Operations',
  4: 'Query Power Tools',
  5: 'Joins',
  6: 'Subqueries & CTEs',
  7: 'Normalization',
  8: 'Indexes & Performance',
  9: 'Transactions',
  10: 'Advanced Topics',
};

function sortModule(mod) {
  return mod
    .map((l, i) => ({ ...l, _order: l.order ?? i }))
    .sort((a, b) => a._order - b._order);
}

export const lessons = [
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
