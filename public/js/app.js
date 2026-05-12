import { initEditor, updateEditorSchema } from './pages/editorView.js';
import { initSchemaView } from './pages/schemaView.js';
import { initDBManager, initDatabase, loadTestSchema } from './pages/dbManager.js';
import { initSettings } from './pages/settings.js';
import { showReady } from './pages/resultsView.js';
import { state } from './state.js';

const STORAGE_KEY = 'browsersql-theme';

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  let theme;
  if (saved) {
    theme = saved;
  } else {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);
}

async function main() {
  initTheme();

  const dbOk = await initDatabase();
  if (!dbOk) {
    document.body.innerHTML = '<div style="padding:2rem;color:var(--color-error)">Failed to initialize SQLite WASM. Check console for details.</div>';
    return;
  }

  initEditor();
  initSchemaView();
  initDBManager();
  initSettings();

  state.refreshEditorSchema = updateEditorSchema;

  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-test-schema').addEventListener('click', loadTestSchema);

  wireSchemaToolbar();
  initSidebarResize();
  initMobileToggles();
  pinToolbarToKeyboard();

  showReady();
  if (state.renderSchema) {
    state.renderSchema();
  }
}

function initSidebarResize() {
  const handle = document.getElementById('schema-resize-handle');
  if (!handle) return;
  let startX, startWidth;

  function onMouseMove(e) {
    const newWidth = Math.max(180, Math.min(500, startWidth + (e.clientX - startX)));
    document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  handle.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 260;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
}

function initMobileToggles() {
  const schemaPanel = document.getElementById('schema-panel');
  const mobileMenu = document.getElementById('mobile-menu-panel');

  document.getElementById('btn-schema-toggle')?.addEventListener('click', () => {
    schemaPanel.classList.toggle('open');
  });

  document.getElementById('btn-schema-close')?.addEventListener('click', () => {
    schemaPanel.classList.remove('open');
  });

  document.getElementById('btn-mobile-menu')?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.getElementById('btn-mobile-menu-close')?.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });

  document.querySelectorAll('#mobile-menu-panel .mobile-menu-actions .btn[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.currentTarget.dataset.action;
      const headerBtn = document.querySelector(`.header-right .btn[data-action="${action}"]`);
      if (headerBtn) headerBtn.click();
      mobileMenu.classList.remove('open');
    });
  });

  document.getElementById('btn-mobile-export')?.addEventListener('click', () => {
    document.getElementById('btn-export-db')?.click();
    mobileMenu.classList.remove('open');
  });

  document.getElementById('btn-mobile-delete')?.addEventListener('click', () => {
    document.getElementById('btn-delete-db')?.click();
    mobileMenu.classList.remove('open');
  });

  document.getElementById('btn-mobile-test')?.addEventListener('click', () => {
    document.getElementById('btn-test-schema')?.click();
    mobileMenu.classList.remove('open');
  });

  document.getElementById('btn-mobile-recent')?.addEventListener('click', () => {
    document.getElementById('btn-recent-dbs')?.click();
    mobileMenu.classList.remove('open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 768) return;
    if (!e.target.closest('#schema-panel') && !e.target.closest('#btn-schema-toggle')) {
      schemaPanel.classList.remove('open');
    }
    if (!e.target.closest('#mobile-menu-panel') && !e.target.closest('#btn-mobile-menu')) {
      mobileMenu.classList.remove('open');
    }
  });
}

function pinToolbarToKeyboard() {
  if (!window.visualViewport) return;
  if (!window.matchMedia('(max-width: 768px)').matches) return;
  let toolbar = null;
  function buildToolbar() {
    const el = document.createElement('div');
    el.className = 'sql-keyboard';
    el.style.cssText = 'position:fixed;left:0;right:0;z-index:50;display:flex;gap:4px;padding:6px 12px;background:var(--color-bg-surface);border-top:1px solid var(--color-border);overflow-x:auto;-webkit-overflow-scrolling:touch';
    '; , ( ) * = \''.split(' ').forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-kbd';
      btn.dataset.char = c;
      btn.textContent = c;
      btn.style.cssText = 'flex:0 0 auto;width:40px;height:40px;padding:0;font-size:1.1rem;font-weight:600;font-family:var(--font-mono);border-radius:2px;border:1px solid var(--color-border);background:var(--color-bg-hover);color:var(--color-text);-webkit-tap-highlight-color:transparent;touch-action:manipulation';
      btn.addEventListener('click', () => {
        const v = state.editorView;
        if (!v) return;
        const sel = v.state.selection.main;
        v.dispatch({ changes: { from: sel.from, to: sel.to, insert: c }, selection: { anchor: sel.from + c.length } });
        v.focus();
      });
      el.appendChild(btn);
    });
    return el;
  }
  window.visualViewport.addEventListener('resize', () => {
    const kbHeight = window.innerHeight - window.visualViewport.height;
    if (kbHeight > 150) {
      if (!toolbar) {
        toolbar = buildToolbar();
        document.body.appendChild(toolbar);
      }
      toolbar.style.bottom = kbHeight + 'px';
    } else {
      if (toolbar) { toolbar.remove(); toolbar = null; }
    }
  });
}

function wireSchemaToolbar() {
  const map = {
    'btn-schema-new': 'btn-new-db',
    'btn-schema-open': 'btn-open-db',
    'btn-schema-export': 'btn-export-db',
    'btn-schema-delete': 'btn-delete-db',
    'btn-schema-test': 'btn-test-schema',
    'btn-schema-recent': 'btn-recent-dbs',
    'btn-schema-theme': 'btn-theme-toggle',
    'btn-schema-settings': 'btn-settings',
  };
  for (const [fromId, toId] of Object.entries(map)) {
    document.getElementById(fromId)?.addEventListener('click', () => {
      document.getElementById(toId)?.click();
    });
  }
}

main();
