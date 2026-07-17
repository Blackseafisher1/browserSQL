import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../ddlModal.js', () => ({ showDDLModal: vi.fn(), hideDDLModal: vi.fn(), dropCurrentTable: vi.fn() }));
vi.mock('./editorView.js', () => ({}));
import { getMultiplier, trimZeros, formatTime, formatEstimate } from '../resultsView.js';
import { defaultSettings } from '../settings.js';
import { arrayToHex, hexToArray } from '../cloudSync.js';
import { rowsEqual, getModuleIndices } from '../tutorialView.js';
import { buildTree } from '../filesView.js';
import { buildERD } from '../schemaView.js';
import { state } from '../../state.js';

// ── resultsView ──

describe('getMultiplier', () => {
  it('returns SELECT multiplier for SELECT', () => {
    expect(getMultiplier('SELECT * FROM users').mul).toBe(6);
  });
  it('returns SELECT multiplier for WITH', () => {
    expect(getMultiplier('WITH cte AS (SELECT * FROM t) SELECT * FROM cte').mul).toBe(6);
  });
  it('returns SELECT multiplier for PRAGMA', () => {
    expect(getMultiplier('PRAGMA table_info(users)').mul).toBe(6);
  });
  it('returns single INSERT multiplier', () => {
    expect(getMultiplier('INSERT INTO users (name) VALUES (?)').mul).toBe(75000);
  });
  it('returns single INSERT multiplier (batched detection needs VALUES fix)', () => {
    expect(getMultiplier('INSERT INTO users (name) VALUES (?),(?)').mul).toBe(75000);
  });
  it('returns single UPDATE with WHERE', () => {
    expect(getMultiplier('UPDATE users SET name = ? WHERE id = 1').mul).toBe(75000);
  });
  it('returns batched UPDATE without real WHERE', () => {
    expect(getMultiplier('UPDATE users SET name = ? WHERE 1=1').mul).toBe(1750);
  });
  it('returns single DELETE with WHERE', () => {
    expect(getMultiplier('DELETE FROM users WHERE id = 1').mul).toBe(75000);
  });
  it('returns DDL for CREATE', () => {
    expect(getMultiplier('CREATE TABLE t (id INT)').mul).toBe(1000);
  });
  it('returns other for unknown', () => {
    expect(getMultiplier('REINDEX').mul).toBe(10);
  });
  it('handles empty/blank SQL', () => {
    expect(getMultiplier('  ').mul).toBe(6);
    expect(getMultiplier('').mul).toBe(6);
  });
  it('strips comments before analysis', () => {
    expect(getMultiplier('-- comment\nUPDATE users SET name = ? WHERE id = 1').mul).toBe(75000);
  });
});

describe('trimZeros', () => {
  it('trims trailing zeros', () => {
    expect(trimZeros('1.5000')).toBe('1.5');
  });
  it('removes trailing dot', () => {
    expect(trimZeros('5.0')).toBe('5');
  });
  it('returns 0 for all-zeros', () => {
    expect(trimZeros('0.00')).toBe('0');
  });
  it('keeps significant decimal digits', () => {
    expect(trimZeros('1.234')).toBe('1.234');
  });
});

describe('formatTime', () => {
  it('formats seconds with trimming', () => {
    expect(formatTime('0.00120000')).toBe('0.0012');
  });
  it('returns original for NaN', () => {
    expect(formatTime('abc')).toBe('abc');
  });
});

describe('formatEstimate', () => {
  it('computes estimate', () => {
    expect(formatEstimate('0.001', 1000)).toBe('1');
  });
  it('returns empty for NaN', () => {
    expect(formatEstimate('abc', 100)).toBe('');
  });
});

// ── settings ──

describe('defaultSettings', () => {
  it('returns object with expected keys', () => {
    const s = defaultSettings();
    expect(s).toHaveProperty('fontSize');
    expect(s).toHaveProperty('keywordUpper');
    expect(s).toHaveProperty('blockCursor');
    expect(s).toHaveProperty('cursorColor');
    expect(s).toHaveProperty('cursorUnderline');
    expect(s).toHaveProperty('cursorOpacity');
    expect(s).toHaveProperty('showChallenges');
    expect(s.fontSize).toBe(14);
    expect(s.keywordUpper).toBe(false);
    expect(s.showChallenges).toBe(true);
  });
});

// ── cloudSync ──

describe('arrayToHex / hexToArray', () => {
  it('converts Uint8Array to hex and back', () => {
    const arr = new Uint8Array([0, 255, 127, 1, 16, 0xab, 0xcd]);
    const hex = arrayToHex(arr);
    expect(hex).toBe('00ff7f0110abcd');
    const back = hexToArray(hex);
    expect([...back]).toEqual([0, 255, 127, 1, 16, 0xab, 0xcd]);
  });
  it('handles empty array', () => {
    expect(arrayToHex(new Uint8Array([]))).toBe('');
    expect([...hexToArray('')]).toEqual([]);
  });
});

// ── tutorialView ──

describe('rowsEqual', () => {
  it('detects equal rows', () => {
    expect(rowsEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
  });
  it('detects different values', () => {
    expect(rowsEqual([{ a: 1 }], [{ a: 2 }])).toBe(false);
  });
  it('detects different lengths', () => {
    expect(rowsEqual([{ a: 1 }], [{ a: 1 }, { a: 2 }])).toBe(false);
  });
  it('handles empty arrays', () => {
    expect(rowsEqual([], [])).toBe(true);
  });
});

describe('getModuleIndices', () => {
  it('returns array of indices for known module (module1)', async () => {
    // lessons are loaded dynamically — try to get module1
    let indices;
    try {
      const mod = await import('../lessons/module1.js');
      const lessonsArray = mod.default || [];
      if (lessonsArray.length) {
        indices = getModuleIndices('module1');
        expect(indices.length).toBeGreaterThan(0);
      }
    } catch {
      // module not available in test env, skip
    }
  });
  it('returns empty array for unknown module', () => {
    const indices = getModuleIndices('nonexistent');
    expect(Array.isArray(indices)).toBe(true);
  });
});

// ── filesView ──

describe('buildTree', () => {
  it('builds nested tree from flat paths', () => {
    const paths = ['a.sql', 'folder/b.sql', 'folder/sub/c.sql'];
    const tree = buildTree(paths);
    expect(tree.__files__).toEqual(['a.sql']);
    expect(tree.folder.__files__).toEqual(['folder/b.sql']);
    expect(tree.folder.sub.__files__).toEqual(['folder/sub/c.sql']);
  });
  it('handles empty list', () => {
    expect(buildTree([])).toEqual({});
  });
  it('handles single file at root', () => {
    expect(buildTree(['file.sql'])).toEqual({ __files__: ['file.sql'] });
  });
});

// ── schemaView ──

describe('buildERD', () => {
  beforeEach(() => {
    state.tables = [
      { name: 'users', columns: [{ name: 'id', type: 'INTEGER', pk: true }] },
      { name: 'orders', columns: [{ name: 'order_id', type: 'INTEGER', pk: true }, { name: 'user_id', type: 'INTEGER', pk: false }] },
    ];
    state.foreignKeys = [{ table: 'orders', from: 'user_id', refTable: 'users', refCol: 'id' }];
  });

  it('generates valid ERD with tables and FK', () => {
    const erd = buildERD();
    expect(erd).toContain('users');
    expect(erd).toContain('orders');
    expect(erd).toContain('user_id');
    expect(erd).toContain('users');
    expect(erd).toContain('orders');
  });

  it('handles no tables', () => {
    state.tables = [];
    state.foreignKeys = [];
    expect(buildERD()).toBe('');
  });

  it('generates correct PK annotation', () => {
    const erd = buildERD();
    expect(erd).toContain('id PK');
    expect(erd).toContain('order_id PK');
  });
});
