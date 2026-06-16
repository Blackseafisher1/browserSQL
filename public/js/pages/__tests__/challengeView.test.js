import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockRunCheck = vi.hoisted(() => vi.fn((check) => check.type === 'success'));
let xpTotal = vi.hoisted(() => 0);
const mockAddPoints = vi.hoisted(() => vi.fn((amt) => { xpTotal += amt; }));
//
vi.mock('marked', () => ({
  marked: {
    setOptions: vi.fn(),
    parse: vi.fn((s) => s),
    Renderer: vi.fn(() => ({
      listitem: vi.fn(({ text, task, checked }) =>
        task
          ? `<li class="tutorial-checklist-item ${checked ? 'is-done' : ''}"><span class="check-box">${checked ? '✓' : ''}</span><span>${text}</span></li>`
          : `<li>${text}</li>`),
      list: vi.fn(({ items, ordered }) => {
        const cls = items.some((i) => i.task) ? 'tutorial-checklist' : '';
        const tag = ordered ? 'ol' : 'ul';
        return `<${tag} class="${cls}">${items.map((i) => (i.task ? `<li>${i.text}</li>` : `<li>${i.text}</li>`)).join('')}</${tag}>`;
      }),
    })),
  },
}));

vi.mock('../marker.js', () => ({ renderMarkdown: vi.fn((s) => s || '') }));

let dbWasLoaded = false;
vi.mock('../dbManager.js', () => ({
  loadTutorialDatabase: vi.fn(async () => { dbWasLoaded = true; return true; }),
  saveCurrentToLocal: vi.fn(async () => {}),
  openLastDB: vi.fn(async () => {}),
}));

vi.mock('../filesView.js', () => ({
  replaceFiles: vi.fn(async () => {}),
  openSingleFile: vi.fn(async () => {}),
  renderTree: vi.fn(async () => {}),
  ensureDefaultFiles: vi.fn(async () => {}),
  VFS_STORE: 'files',
}));

vi.mock('../tutorialView.js', () => ({
  runCheck: mockRunCheck,
  loadPoints: vi.fn(() => xpTotal),
  addPoints: mockAddPoints,
  updateDisplay: vi.fn(() => {}),
  rowsEqual: vi.fn((a, b) => JSON.stringify(a) === JSON.stringify(b)),
}));

vi.mock('../toast.js', () => ({ showToast: vi.fn() }));

import { state } from '../../state.js';
import {
  loadChallenges,
  renderChallengeList,
  startChallenge,
  verifyChallenge,
  exitChallengeMode,
  openChallengeEditor,
  importChallengeFile,
  isTaskComplete,
  markTaskComplete,
} from '../challengeView.js';

/* ── Helpers ── */

function fakeIndexedDB(fileMap) {
  // vfsGet gets { key: 'data', value: fileMap } from the store
  // The stored record is { value: fileMap }
  const stored = { value: { ...fileMap } };
  const fakeDB = {
    transaction: vi.fn(() => ({
      objectStore: vi.fn(() => {
        const getReq = {
          result: stored,
          set onsuccess(fn) { setTimeout(fn, 0); },
          get onsuccess() { return null; },
          set onerror(fn) {},
          get onerror() { return null; },
        };
        return {
          get: vi.fn(() => getReq),
          put: vi.fn((val) => {
            if (val.key === 'data') stored.value = { ...(stored.value || {}), ...val.value };
          }),
        };
      }),
      oncomplete: null,
    })),
    close: vi.fn(),
  };
  const openReq = {
    result: fakeDB,
    set onupgradeneeded(fn) {},
    get onupgradeneeded() { return null; },
    set onsuccess(fn) { setTimeout(fn, 0); },
    get onsuccess() { return null; },
    set onerror(fn) {},
    get onerror() { return null; },
  };
  globalThis.indexedDB = { open: vi.fn(() => openReq) };
}

beforeEach(() => {
  localStorage.clear();
  xpTotal = 0;
  dbWasLoaded = false;
  mockRunCheck.mockReset();
  mockRunCheck.mockImplementation((check) => check.type === 'success');
  mockAddPoints.mockReset();
  mockAddPoints.mockImplementation((amt) => { xpTotal += amt; });
  state.challengeMode = false;
  state.challengeActive = false;
  state.challengeData = null;
  state.challengeTaskIndex = 0;
  state.tutorialActive = false;
  state.db = { exec: vi.fn(() => []) };
  state.sqlite3 = { capi: { sqlite3_changes: vi.fn(() => 0) } };
  state.editorView = null;
  document.body.innerHTML = '';
});

/* ── Completion tracking ── */

describe('completion tracking', () => {
  it('marks task complete and awards XP on first completion', () => {
    expect(isTaskComplete('c1', 't1')).toBe(false);
    markTaskComplete('c1', 't1', 15);
    expect(isTaskComplete('c1', 't1')).toBe(true);
    expect(xpTotal).toBe(15);
  });

  it('does NOT award XP on re-completing an already-done task', () => {
    markTaskComplete('c1', 't1', 15);
    expect(xpTotal).toBe(15);
    markTaskComplete('c1', 't1', 15);
    expect(xpTotal).toBe(15);
  });

  it('awards 0 XP when earnedXP is 0', () => {
    markTaskComplete('c1', 't1', 0);
    expect(isTaskComplete('c1', 't1')).toBe(true);
    expect(xpTotal).toBe(0);
  });

  it('separates completion between different tasks', () => {
    markTaskComplete('c1', 't1', 15);
    expect(isTaskComplete('c1', 't1')).toBe(true);
    expect(isTaskComplete('c1', 't2')).toBe(false);
    expect(isTaskComplete('c2', 't1')).toBe(false);
  });
});

describe('failure tracking via localStorage', () => {
  it('increments failure count', () => {
    const key = 'browsersql-challenge-failures';
    localStorage.setItem(key, JSON.stringify({}));
    const f = JSON.parse(localStorage.getItem(key));
    f['c1/t1'] = (f['c1/t1'] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(f));
    expect(JSON.parse(localStorage.getItem(key))['c1/t1']).toBe(1);

    const f2 = JSON.parse(localStorage.getItem(key));
    f2['c1/t1'] = (f2['c1/t1'] || 0) + 1;
    localStorage.setItem(key, JSON.stringify(f2));
    expect(JSON.parse(localStorage.getItem(key))['c1/t1']).toBe(2);
  });
});

/* ── Challenge loading ── */

describe('loadChallenges', () => {
  it('loads valid challenges from VFS', async () => {
    fakeIndexedDB({
      'challenges/test1/challenge.json': JSON.stringify({
        id: 'test1', title: 'Test 1', difficulty: 'easy', tasks: [{ id: 't1', title: 'Task 1', markdown: 'do', check: { type: 'success' } }],
      }),
    });
    const challenges = await loadChallenges();
    expect(challenges.length).toBe(1);
    expect(challenges[0].id).toBe('test1');
    expect(challenges[0].tasks.length).toBe(1);
    expect(challenges[0].difficulty).toBe('easy');
  });

  it('loads multiple challenges', async () => {
    fakeIndexedDB({
      'challenges/a/challenge.json': JSON.stringify({ id: 'a', title: 'A', tasks: [{ id: 't1', check: { type: 'success' } }] }),
      'challenges/b/challenge.json': JSON.stringify({ id: 'b', title: 'B', tasks: [{ id: 't1', check: { type: 'success' } }] }),
    });
    const ch = await loadChallenges();
    expect(ch.length).toBe(2);
  });

  it('skips challenges without id', async () => {
    fakeIndexedDB({
      'challenges/bad/challenge.json': JSON.stringify({ title: 'No ID', tasks: [{ id: 't1' }] }),
    });
    const ch = await loadChallenges();
    expect(ch.length).toBe(0);
  });

  it('skips challenges without tasks array', async () => {
    fakeIndexedDB({
      'challenges/bad/challenge.json': JSON.stringify({ id: 'x', title: 'X' }),
    });
    const ch = await loadChallenges();
    expect(ch.length).toBe(0);
  });

  it('skips corrupted JSON gracefully', async () => {
    fakeIndexedDB({
      'challenges/bad/challenge.json': 'not valid json',
    });
    const ch = await loadChallenges();
    expect(ch.length).toBe(0);
  });

  it('returns empty array when VFS is empty', async () => {
    fakeIndexedDB({});
    const ch = await loadChallenges();
    expect(ch).toEqual([]);
  });

  it('respects taskOrder when present', async () => {
    fakeIndexedDB({
      'challenges/o/challenge.json': JSON.stringify({
        id: 'o', title: 'O', taskOrder: ['b', 'a'],
        tasks: [
          { id: 'a', title: 'Alpha', check: { type: 'success' } },
          { id: 'b', title: 'Beta', check: { type: 'success' } },
        ],
      }),
    });
    const ch = await loadChallenges();
    expect(ch[0].tasks[0].id).toBe('b');
    expect(ch[0].tasks[1].id).toBe('a');
  });
});

/* ── State management ── */

describe('startChallenge / exitChallengeMode', () => {
  beforeEach(() => {
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', tasks: [{ id: 't1', title: 'T1', markdown: 'do', seed: '', check: { type: 'success' } }],
      }),
    });
  });

  it('blocks start when tutorial is active', async () => {
    state.tutorialActive = true;
    await startChallenge('c1');
    expect(state.challengeActive).toBe(false);
  });

  it('blocks start for non-existent challenge', async () => {
    await startChallenge('does-not-exist');
    expect(state.challengeActive).toBe(false);
  });

  it('blocks start for challenge with no tasks', async () => {
    fakeIndexedDB({
      'challenges/empty/challenge.json': JSON.stringify({ id: 'empty', title: 'Empty', tasks: [] }),
    });
    await loadChallenges();
    await startChallenge('empty');
    expect(state.challengeActive).toBe(false);
  });

  it('sets state correctly on start', async () => {
    await loadChallenges();
    await startChallenge('c1');
    expect(state.challengeMode).toBe(true);
    expect(state.challengeActive).toBe(true);
    expect(state.challengeData).not.toBeNull();
    expect(state.challengeData.id).toBe('c1');
    expect(state.challengeTaskIndex).toBe(0);
  });

  it('loads tutorial database on start', async () => {
    await loadChallenges();
    await startChallenge('c1');
    expect(dbWasLoaded).toBe(true);
  });

  it('resets state on exit', async () => {
    await loadChallenges();
    await startChallenge('c1');
    await exitChallengeMode();
    expect(state.challengeMode).toBe(false);
    expect(state.challengeActive).toBe(false);
    expect(state.challengeData).toBeNull();
    expect(state.challengeTaskIndex).toBe(0);
  });

  it('tutorial state is not affected by challenge start/exit', async () => {
    state.tutorialActive = true;
    await startChallenge('c1');
    expect(state.challengeActive).toBe(false);
    expect(state.tutorialActive).toBe(true);
    state.tutorialActive = false;
    await loadChallenges();
    await startChallenge('c1');
    expect(state.challengeActive).toBe(true);
    expect(state.tutorialActive).toBe(false);
    await exitChallengeMode();
    expect(state.challengeActive).toBe(false);
    expect(state.tutorialActive).toBe(false);
  });
});

/* ── Verify flow ── */

describe('verifyChallenge', () => {
  beforeEach(async () => {
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', tasks: [{ id: 't1', title: 'T1', markdown: 'do', seed: '', check: { type: 'result', expectedSql: 'SELECT 1' } }],
      }),
    });
    await loadChallenges();
    document.body.innerHTML = '<div id="challenge-status" class="ch-panel-status"></div>';
    await startChallenge('c1');
  });

  it('returns early if not in challenge mode', () => {
    state.challengeActive = false;
    verifyChallenge('SELECT 1');
    expect(document.getElementById('challenge-status').textContent).toBe('');
  });

  it('shows status for empty code', () => {
    verifyChallenge('');
    expect(document.getElementById('challenge-status').textContent).toContain('Write your SQL');
  });

  it('marks complete and shows success on passing verify', () => {
    mockRunCheck.mockReturnValueOnce(true);
    verifyChallenge('SELECT 1');
    expect(document.getElementById('challenge-status').textContent).toContain('Complete');
    expect(isTaskComplete('c1', 't1')).toBe(true);
  });

  it('does not double-award XP on repeated pass', () => {
    mockRunCheck.mockReturnValue(true);
    verifyChallenge('SELECT 1');
    expect(xpTotal).toBeGreaterThanOrEqual(15);
    const firstXP = xpTotal;
    verifyChallenge('SELECT 1');
    expect(xpTotal).toBe(firstXP);
  });

  it('shows failure message on failing verify', () => {
    mockRunCheck.mockReturnValue(false);
    verifyChallenge('SELECT bad');
    expect(document.getElementById('challenge-status').textContent).toContain('Not quite');
  });

  it('handles runCheck error without crashing', () => {
    mockRunCheck.mockImplementation(() => { throw new Error('check error'); });
    verifyChallenge('SELECT 1');
    expect(document.getElementById('challenge-status').textContent).toContain('error');
  });
});

/* ── UI rendering ── */

describe('renderChallengeList', () => {
  it('shows empty message when no challenges', async () => {
    fakeIndexedDB({});
    document.body.innerHTML = '<div id="challenge-list"></div>';
    await renderChallengeList();
    const el = document.getElementById('challenge-list');
    expect(el.textContent).toContain('No challenges yet');
  });

  it('renders challenge items', async () => {
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', difficulty: 'easy', tags: ['SELECT'],
        tasks: [{ id: 't1', title: 'T1', markdown: 'do', check: { type: 'success' } }],
      }),
      'challenges/c2/challenge.json': JSON.stringify({
        id: 'c2', title: 'C2', difficulty: 'hard',
        tasks: [{ id: 't1', title: 'T1', markdown: 'do', check: { type: 'success' } }],
      }),
    });
    document.body.innerHTML = '<div id="challenge-list"></div>';
    await renderChallengeList();
    expect(document.getElementById('challenge-list').textContent).toContain('C1');
    expect(document.getElementById('challenge-list').textContent).toContain('C2');
    expect(document.querySelectorAll('.ch-item').length).toBe(2);
  });

  it('shows correct difficulty badge', async () => {
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', difficulty: 'hard',
        tasks: [{ id: 't1', check: { type: 'success' } }],
      }),
    });
    document.body.innerHTML = '<div id="challenge-list"></div>';
    await renderChallengeList();
    expect(document.getElementById('challenge-list').innerHTML).toContain('ch-badge-hard');
  });

  it('shows progress bar with 0% for new challenge', async () => {
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', difficulty: 'easy',
        tasks: [{ id: 't1', check: { type: 'success' } }, { id: 't2', check: { type: 'success' } }],
      }),
    });
    document.body.innerHTML = '<div id="challenge-list"></div>';
    await renderChallengeList();
    expect(document.getElementById('challenge-list').textContent).toContain('0/2 tasks');
  });

  it('shows partial progress when some tasks done', async () => {
    localStorage.setItem('browsersql-challenge-complete', JSON.stringify({ 'c1/t1': true }));
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', difficulty: 'easy',
        tasks: [{ id: 't1', check: { type: 'success' } }, { id: 't2', check: { type: 'success' } }],
      }),
    });
    document.body.innerHTML = '<div id="challenge-list"></div>';
    await renderChallengeList();
    expect(document.getElementById('challenge-list').textContent).toContain('1/2 tasks');
  });
});

describe('challenge detail view', () => {
  it('shows task list after clicking a challenge', async () => {
    fakeIndexedDB({
      'challenges/c1/challenge.json': JSON.stringify({
        id: 'c1', title: 'C1', difficulty: 'easy',
        tags: ['SELECT'],
        tasks: [
          { id: 't1', title: 'Task One', markdown: 'do', check: { type: 'success' } },
          { id: 't2', title: 'Task Two', markdown: 'do', check: { type: 'success' } },
        ],
      }),
    });
    document.body.innerHTML = '<div id="challenge-list"></div>';
    await renderChallengeList();
    document.querySelector('.ch-item').click();
    await new Promise((r) => setTimeout(r, 10));
    expect(document.getElementById('challenge-list').textContent).toContain('Task One');
    expect(document.getElementById('challenge-list').textContent).toContain('Task Two');
    expect(document.getElementById('challenge-list').textContent).toContain('0/2 tasks');
  });
});

/* ── Editor modal ── */

describe('openChallengeEditor', () => {
  it('opens the modal with one default task and auto-generated UUID', () => {
    document.body.innerHTML = `
      <div id="challenge-editor-overlay" class="modal-overlay hidden">
        <div id="challenge-editor-modal">
          <div class="modal-header">
            <span class="modal-title" id="challenge-editor-title">Create Challenge</span>
            <button id="challenge-editor-close">&times;</button>
          </div>
          <div class="modal-body challenge-editor-body">
            <input type="hidden" id="ce-id">
            <code id="ce-id-display"></code>
            <input type="text" id="ce-title">
            <select id="ce-difficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
            <input type="text" id="ce-tags">
            <textarea id="ce-desc"></textarea>
            <div id="ce-tasks-container"></div>
            <button id="ce-add-task">+ Add Task</button>
            <button id="ce-test">Test</button>
            <button id="ce-save">Save</button>
            <button id="ce-download">Download</button>
            <button id="ce-cancel">Cancel</button>
          </div>
        </div>
      </div>`;
    openChallengeEditor();
    expect(document.getElementById('challenge-editor-overlay').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('ce-id').value.length).toBeGreaterThan(0);
    expect(document.getElementById('ce-id-display').textContent.length).toBeGreaterThan(0);
    expect(document.getElementById('ce-title').value).toBe('');
    expect(document.getElementById('ce-difficulty').value).toBe('medium');
    expect(document.querySelectorAll('.ce-task').length).toBe(1);
  });
});

describe('contains check type via verify', () => {
  beforeEach(async () => {
    fakeIndexedDB({
      'challenges/cc/challenge.json': JSON.stringify({
        id: 'cc', title: 'Contains', tasks: [{ id: 't1', title: 'T1', markdown: 'do', seed: '', check: { type: 'contains', tokens: ['SELECT', 'FROM'] } }],
      }),
    });
    await loadChallenges();
    document.body.innerHTML = '<div id="challenge-status" class="ch-panel-status"></div>';
  });

  it('passes via runCheck mock when forced true', async () => {
    mockRunCheck.mockReturnValueOnce(true);
    await startChallenge('cc');
    verifyChallenge('SELECT * FROM t');
    expect(document.getElementById('challenge-status').textContent).toContain('Complete');
  });

  it('fails via runCheck mock when forced false', async () => {
    mockRunCheck.mockReturnValue(false);
    await startChallenge('cc');
    verifyChallenge('INSERT INTO t');
    expect(document.getElementById('challenge-status').textContent).toContain('Not quite');
  });
});

describe('importChallengeFile', () => {
  it('triggers hidden file input click', () => {
    let clicked = false;
    document.body.innerHTML = '<input type="file" id="challenge-file-input" class="hidden">';
    document.getElementById('challenge-file-input').addEventListener('click', () => { clicked = true; });
    importChallengeFile();
    expect(clicked).toBe(true);
  });
});
