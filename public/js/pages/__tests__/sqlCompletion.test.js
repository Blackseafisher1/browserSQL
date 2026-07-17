import { describe, it, expect, beforeEach } from 'vitest';
import { sqlAutoTriggerSource } from '../sqlCompletion.js';
import { state } from '../../state.js';

function mockContext(textBefore, pos) {
  const fullText = typeof textBefore === 'string' ? textBefore : '';
  return {
    state: { sliceDoc: (from, to) => fullText.slice(from ?? 0, to ?? fullText.length) },
    pos: pos ?? fullText.length,
    explicit: false,
    matchBefore: () => null,
  };
}

beforeEach(() => {
  localStorage.setItem('browsersql-settings', JSON.stringify({ autoCompleteBareCols: true }));
  state.tables = [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', pk: true },
        { name: 'name', type: 'TEXT', pk: false },
        { name: 'email', type: 'TEXT', pk: false },
      ],
    },
    {
      name: 'orders',
      columns: [
        { name: 'order_id', type: 'INTEGER', pk: true },
        { name: 'user_id', type: 'INTEGER', pk: false },
        { name: 'total', type: 'REAL', pk: false },
      ],
    },
  ];
});

describe('sqlAutoTriggerSource - UPDATE before SET', () => {
  it('shows column names for each column', () => {
    const ctx = mockContext('UPDATE users ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
    expect(result.options[0].label).toBe('id');
    expect(result.options[1].label).toBe('name');
    expect(result.options[2].label).toBe('email');
  });

  it('returns null for unknown table', () => {
    const ctx = mockContext('UPDATE nonexistent ');
    expect(sqlAutoTriggerSource(ctx)).toBeNull();
  });
});

describe('sqlAutoTriggerSource - UPDATE SET', () => {
  it('shows column names for each column', () => {
    const ctx = mockContext('UPDATE users SET ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
    expect(result.options[0].label).toBe('id');
    expect(result.options[1].label).toBe('name');
    expect(result.options[2].label).toBe('email');
  });
});

describe('sqlAutoTriggerSource - INSERT', () => {
  it('shows expansion option with PK excluded', () => {
    const ctx = mockContext('INSERT INTO users');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(1);
    expect(result.options[0].label).toBe('(name, email)\nVALUES ()');
  });

  it('shows column template excluding PK after paren', () => {
    const ctx = mockContext('INSERT INTO users (');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(1);
    expect(result.options[0].label).toBe('(name, email)\nVALUES ()');
    expect(result.options[0].detail).toBe('INSERT users');
  });

  it('returns null for unknown table', () => {
    const ctx = mockContext('INSERT INTO ghost');
    expect(sqlAutoTriggerSource(ctx)).toBeNull();
  });
});

describe('sqlAutoTriggerSource - WHERE condition with referenced tables', () => {
  it('shows columns from tables in FROM clause', () => {
    const ctx = mockContext('SELECT * FROM users WHERE ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
    expect(result.options[0].label).toBe('id');
    expect(result.options[1].label).toBe('name');
    expect(result.options[2].label).toBe('email');
  });

  it('shows columns from referenced tables only', () => {
    const ctx = mockContext('SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    // users (3) + orders (3) = 6
    expect(result.options).toHaveLength(6);
  });
});

describe('sqlAutoTriggerSource - SELECT column list', () => {
  it('shows all columns for SELECT without FROM', () => {
    const ctx = mockContext('SELECT ', 7);
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(6);
  });

  it('shows columns after comma in SELECT (no FROM yet)', () => {
    const ctx = mockContext('SELECT id, ', 11);
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(6);
  });

  it('returns columns for comma (bare cols enabled)', () => {
    const ctx = mockContext("INSERT INTO t VALUES (1, ");
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options.length).toBeGreaterThan(0);
  });
});

describe('sqlAutoTriggerSource - no match contexts', () => {
  it('returns columns for plain text (bare cols enabled)', () => {
    const ctx = mockContext('SELECT * FROM users');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
  });

  it('returns columns for incomplete UPDATE (bare cols enabled)', () => {
    const ctx = mockContext('UPDATE users');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
  });
});

describe('sqlAutoTriggerSource - AND/OR/HAVING', () => {
  it('triggers on AND with referenced tables', () => {
    const ctx = mockContext('SELECT * FROM users WHERE id = 1 AND ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
  });

  it('triggers on OR', () => {
    const ctx = mockContext('SELECT * FROM users WHERE id = 1 OR ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
  });

  it('triggers on HAVING', () => {
    const ctx = mockContext('SELECT name, COUNT(*) FROM users GROUP BY name HAVING ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
  });
});

describe('sqlAutoTriggerSource - edge cases', () => {
  it('handles no tables loaded', () => {
    state.tables = [];
    const ctx = mockContext('SELECT * FROM users WHERE ');
    expect(sqlAutoTriggerSource(ctx)).toBeNull();
  });

  it('handles empty text', () => {
    const ctx = mockContext('');
    expect(sqlAutoTriggerSource(ctx)).toBeNull();
  });

  it('case insensitive matching', () => {
    const ctx = mockContext('select * from users where ');
    const result = sqlAutoTriggerSource(ctx);
    expect(result).not.toBeNull();
    expect(result.options).toHaveLength(3);
  });
});
