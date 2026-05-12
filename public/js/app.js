import { initEditor, updateEditorSchema } from './pages/editorView.js';
import { initSchemaView } from './pages/schemaView.js';
import { initDBManager, initDatabase, loadTestSchema, openLastDB } from './pages/dbManager.js';
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
  openLastDB();
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

function getKbdSettings() {
  try {
    const raw = localStorage.getItem('browsersql-settings');
    if (!raw) return { kbdEnabled: true, kbdHeight: 40, kbdForce: false };
    const s = JSON.parse(raw);
    return { kbdEnabled: s.kbdEnabled !== false, kbdHeight: s.kbdHeight || 40, kbdForce: s.kbdForce || false };
  } catch { return { kbdEnabled: true, kbdHeight: 40, kbdForce: false }; }
}

function pinToolbarToKeyboard() {
  const toolbar = document.getElementById('sql-keyboard');
  if (!toolbar || !window.visualViewport) return;
  function update() {
    const kbd = getKbdSettings();
    const kbHeight = window.innerHeight - window.visualViewport.height;
    const keyboardOpen = kbHeight > 150;
    if (kbd.kbdForce || (keyboardOpen && kbd.kbdEnabled)) {
      toolbar.style.display = 'flex';
      if (keyboardOpen) {
        toolbar.style.position = 'fixed';
        toolbar.style.bottom = kbHeight + 'px';
        toolbar.style.left = '0';
        toolbar.style.right = '0';
        toolbar.style.zIndex = '50';
      } else {
        toolbar.style.position = '';
        toolbar.style.bottom = '';
        toolbar.style.left = '';
        toolbar.style.right = '';
        toolbar.style.zIndex = '';
      }
    } else {
      toolbar.style.display = 'none';
      toolbar.style.position = '';
    }
  }
  window.visualViewport.addEventListener('resize', update);
  window.addEventListener('storage', update);
  update();
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
