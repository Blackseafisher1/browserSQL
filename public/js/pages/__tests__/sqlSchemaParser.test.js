import { describe, it, expect } from 'vitest';
import { parseAliases, parseCTEs, mergeSchema } from '../sqlSchemaParser.js';

// stripComments is internal but we test it via parseCTEs behavior

describe('parseAliases', () => {
  it('extracts simple alias after FROM', () => {
    expect(parseAliases('SELECT * FROM users u')).toEqual({ u: 'users' });
  });

  it('extracts alias with AS', () => {
    expect(parseAliases('SELECT * FROM users AS u')).toEqual({ u: 'users' });
  });

  it('extracts alias after JOIN', () => {
    expect(parseAliases('SELECT * FROM users u JOIN orders o')).toEqual({ u: 'users', o: 'orders' });
  });

  it('skips SQL keywords as aliases', () => {
    expect(parseAliases('SELECT * FROM users WHERE')).toEqual({});
  });

  it('skips when alias equals table name', () => {
    expect(parseAliases('SELECT * FROM users users')).toEqual({});
  });

  it('works with multiple joins', () => {
    const sql = 'SELECT * FROM users u INNER JOIN orders o ON u.id = o.user_id LEFT JOIN products p ON o.product_id = p.id';
    expect(parseAliases(sql)).toEqual({ u: 'users', o: 'orders', p: 'products' });
  });
});

describe('parseCTEs', () => {
  it('parses simple CTE with SELECT column', () => {
    const sql = `WITH best AS (SELECT name FROM users) SELECT * FROM best`;
    expect(parseCTEs(sql)).toEqual({ best: ['name'] });
  });

  it('extracts AS aliased columns', () => {
    const sql = `WITH c AS (SELECT count(*) AS cnt, name AS n FROM t) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({ c: ['cnt', 'n'] });
  });

  it('uses explicit column names when provided', () => {
    const sql = `WITH c(a, b) AS (SELECT x, y FROM t) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({ c: ['a', 'b'] });
  });

  it('handles subquery in SELECT with AS', () => {
    const sql = `WITH best AS (
      SELECT categories.name AS first_cat,
        (SELECT AVG(category_id) FROM categories) AS avg_category_id
      FROM categories
    ) SELECT * FROM best`;
    expect(parseCTEs(sql)).toEqual({ best: ['first_cat', 'avg_category_id'] });
  });

  it('handles multiple CTEs', () => {
    const sql = `WITH a AS (SELECT x, y FROM t1), b AS (SELECT z FROM t2) SELECT * FROM a JOIN b`;
    expect(parseCTEs(sql)).toEqual({ a: ['x', 'y'], b: ['z'] });
  });

  it('extracts bare column name (no AS)', () => {
    const sql = `WITH c AS (SELECT id, name FROM t) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({ c: ['id', 'name'] });
  });

  it('handles RECURSIVE with explicit columns', () => {
    const sql = `WITH RECURSIVE c(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM c) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({ c: ['n'] });
  });

  it('returns empty object for no CTE', () => {
    expect(parseCTEs('SELECT * FROM users')).toEqual({});
  });

  it('ignores SELECT * in CTE', () => {
    const sql = `WITH c AS (SELECT * FROM t) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({});
  });

  it('strips comments before parsing', () => {
    const sql = `WITH c AS (SELECT /* comment */ name, /* , */ id FROM t) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({ c: ['name', 'id'] });
  });

  it('handles window functions', () => {
    const sql = `WITH c AS (SELECT a, ROW_NUMBER() OVER (ORDER BY x) AS rn FROM t) SELECT * FROM c`;
    expect(parseCTEs(sql)).toEqual({ c: ['a', 'rn'] });
  });
});

describe('mergeSchema', () => {
  it('merges CTEs into schema', () => {
    expect(mergeSchema({ users: ['id', 'name'] }, {}, { my_cte: ['a', 'b'] }))
      .toEqual({ users: ['id', 'name'], my_cte: ['a', 'b'] });
  });

  it('adds alias pointing to table columns', () => {
    expect(mergeSchema({ users: ['id', 'name'] }, { u: 'users' }, {}))
      .toEqual({ users: ['id', 'name'], u: ['id', 'name'] });
  });

  it('combines aliases and CTEs', () => {
    expect(mergeSchema(
      { users: ['id', 'name'], orders: ['order_id', 'total'] },
      { u: 'users' },
      { cte1: ['x'] }
    )).toEqual({
      users: ['id', 'name'],
      orders: ['order_id', 'total'],
      u: ['id', 'name'],
      cte1: ['x'],
    });
  });

  it('skips alias for unknown table', () => {
    expect(mergeSchema({ users: ['id'] }, { x: 'nonexistent' }, {}))
      .toEqual({ users: ['id'] });
  });
});

describe('hash-based change detection', () => {
  function hash(schema, aliases, ctes) {
    return JSON.stringify(mergeSchema(schema, aliases, ctes));
  }

  it('same input produces identical hash', () => {
    const schema = { users: ['id', 'name'] };
    expect(hash(schema, {}, {})).toBe(hash(schema, {}, {}));
  });

  it('different CTE produces different hash', () => {
    const schema = { users: ['id', 'name'] };
    expect(hash(schema, {}, {})).not.toBe(hash(schema, {}, { my_cte: ['x'] }));
  });

  it('CTE column change produces different hash', () => {
    const schema = { users: ['id', 'name'] };
    expect(hash(schema, {}, { c: ['a'] }))
      .not.toBe(hash(schema, {}, { c: ['a', 'b'] }));
  });

  it('different alias produces different hash', () => {
    const schema = { users: ['id', 'name'] };
    expect(hash(schema, {}, {})).not.toBe(hash(schema, { u: 'users' }, {}));
  });

  it('alias removal changes hash', () => {
    const schema = { users: ['id'] };
    const h1 = hash(schema, { u: 'users' }, {});
    const h2 = hash(schema, {}, {});
    expect(h1).not.toBe(h2);
  });

  it('full parse+merge produces stable hash for unchanged SQL', () => {
    const sql = 'SELECT * FROM users';
    const ctes = parseCTEs(sql);
    const aliases = parseAliases(sql);
    const h1 = JSON.stringify(mergeSchema({ users: ['id'] }, aliases, ctes));
    const h2 = JSON.stringify(mergeSchema({ users: ['id'] }, aliases, ctes));
    expect(h1).toBe(h2);
  });

  it('adding CTE to SQL changes merged hash', () => {
    const sql1 = 'SELECT * FROM users';
    const sql2 = 'WITH c AS (SELECT id FROM users) SELECT * FROM c';
    const schema = { users: ['id'] };
    const h1 = JSON.stringify(mergeSchema(schema, parseAliases(sql1), parseCTEs(sql1)));
    const h2 = JSON.stringify(mergeSchema(schema, parseAliases(sql2), parseCTEs(sql2)));
    expect(h1).not.toBe(h2);
  });

  it('adding alias to SQL changes merged hash', () => {
    const sql1 = 'SELECT * FROM users';
    const sql2 = 'SELECT * FROM users u';
    const schema = { users: ['id'] };
    const h1 = JSON.stringify(mergeSchema(schema, parseAliases(sql1), parseCTEs(sql1)));
    const h2 = JSON.stringify(mergeSchema(schema, parseAliases(sql2), parseCTEs(sql2)));
    expect(h1).not.toBe(h2);
  });
});
