import { describe, it, expect } from 'vitest';
import { escId, isSafePath, debounce } from '../../utils.js';

describe('escId', () => {
  it('wraps simple name in double quotes', () => {
    expect(escId('users')).toBe('"users"');
  });

  it('escapes double quotes inside name', () => {
    expect(escId('test"name')).toBe('"test""name"');
  });

  it('handles empty string', () => {
    expect(escId('')).toBe('""');
  });
});

describe('isSafePath', () => {
  it('allows normal filenames', () => {
    expect(isSafePath('test.sql')).toBe(true);
    expect(isSafePath('folder/file.sql')).toBe(true);
    expect(isSafePath('my-file_v2.sql')).toBe(true);
  });

  it('rejects path traversal (..)', () => {
    expect(isSafePath('../etc/passwd')).toBe(false);
    expect(isSafePath('folder/../../etc')).toBe(false);
  });

  it('rejects absolute paths', () => {
    expect(isSafePath('/etc/passwd')).toBe(false);
  });

  it('rejects tilde paths', () => {
    expect(isSafePath('~/config')).toBe(false);
  });

  it('rejects backslash paths', () => {
    expect(isSafePath('folder\\file.sql')).toBe(false);
  });
});

describe('debounce', () => {
  it('delays execution', async () => {
    let called = 0;
    const fn = debounce(() => called++, 50);
    fn();
    fn();
    fn();
    expect(called).toBe(0);
    await new Promise(r => setTimeout(r, 80));
    expect(called).toBe(1);
  });
});
