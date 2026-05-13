import { initEditor, updateEditorSchema } from './pages/editorView.js';
import { initSchemaView } from './pages/schemaView.js';
import { initDBManager, initDatabase, loadTestSchema, openLastDB } from './pages/dbManager.js';
import { initSettings } from './pages/settings.js';
import { initFilesView } from './pages/filesView.js';
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
  initFilesView();

  state.refreshEditorSchema = updateEditorSchema;

  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-test-schema').addEventListener('click', loadTestSchema);

  wireSchemaToolbar();
  initSidebarResize();
  initEditorResize();
  initMobileToggles();
  pinToolbarToKeyboard();
  initResultsZoom();

  showReady();
  if (state.renderSchema) {
    state.renderSchema();
  }
  openLastDB();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
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
    if (!raw) return { kbdEnabled: true, kbdHeight: 40 };
    const s = JSON.parse(raw);
    return { kbdEnabled: s.kbdEnabled !== false, kbdHeight: s.kbdHeight || 40 };
  } catch { return { kbdEnabled: true, kbdHeight: 40 }; }
}

function pinToolbarToKeyboard() {
  const toolbar = document.getElementById('sql-keyboard');
  if (!toolbar) return;
  const isMobile = window.matchMedia('(max-width: 768px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (!isMobile) { toolbar.style.cssText = 'height:0;overflow:hidden;visibility:hidden;padding:0'; return; }
  function update() {
    const kbd = getKbdSettings();
    if (!kbd.kbdEnabled) { toolbar.style.cssText = 'height:0;overflow:hidden;visibility:hidden;padding:0'; return; }
    const kbHeight = window.innerHeight - window.visualViewport.height;
    if (kbHeight > 80) {
      toolbar.style.cssText = 'display:flex;position:fixed;left:0;right:0;bottom:'+kbHeight+'px;z-index:50;height:auto;visibility:visible;padding:var(--space-1) var(--space-3);gap:var(--space-1);background:var(--color-bg-surface);border-bottom:1px solid var(--color-border);overflow-x:auto;-webkit-overflow-scrolling:touch';
    } else {
      toolbar.style.cssText = 'height:0;overflow:hidden;visibility:hidden;padding:0';
    }
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', update);
  }
  update();
}

function initEditorResize() {
  const handle = document.getElementById('editor-resize-handle');
  if (!handle) return;
  const editor = document.getElementById('editor-container');
  const results = document.getElementById('results-container');
  if (!editor || !results) return;
  function getY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
  function startResize(e) {
    const y = getY(e);
    const total = editor.parentElement.clientHeight;
    startY = y;
    startEditor = editor.getBoundingClientRect().height;
    startResults = results.getBoundingClientRect().height;
  }
  function moveResize(e) {
    const dy = getY(e) - startY;
    const total = editor.parentElement.clientHeight;
    let edPct = ((startEditor + dy) / total * 100);
    let rsPct = ((startResults - dy) / total * 100);
    if (edPct < 10) { edPct = 10; rsPct = 90; }
    if (rsPct < 10) { rsPct = 10; edPct = 90; }
    editor.style.flex = `1 1 ${edPct}%`;
    results.style.flex = `1 1 ${rsPct}%`;
  }
  function endResize() {
    document.removeEventListener('mousemove', moveResize);
    document.removeEventListener('mouseup', endResize);
    document.removeEventListener('touchmove', moveResize);
    document.removeEventListener('touchend', endResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
  let startY, startEditor, startResults;
  handle.addEventListener('mousedown', (e) => { startResize(e); document.addEventListener('mousemove', moveResize); document.addEventListener('mouseup', endResize); document.body.style.cursor = 'row-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); });
  handle.addEventListener('touchstart', (e) => { startResize(e); document.addEventListener('touchmove', moveResize, { passive: false }); document.addEventListener('touchend', endResize); e.preventDefault(); }, { passive: false });
}

function wireSchemaToolbar() {
  const map = {
    'btn-schema-new': 'btn-new-db',
    'btn-schema-open': 'btn-open-db',
    'btn-schema-export': 'btn-export-db',
    'btn-schema-delete': 'btn-delete-db',
    'btn-schema-test': 'btn-test-schema',
     'btn-schema-theme': 'btn-theme-toggle',
    'btn-schema-settings': 'btn-settings',
  };
  for (const [fromId, toId] of Object.entries(map)) {
    document.getElementById(fromId)?.addEventListener('click', () => {
      document.getElementById(toId)?.click();
    });
  }
}

function initResultsZoom() {
  const slider = document.getElementById('results-zoom');
  const display = document.getElementById('results-zoom-value');
  if (!slider || !display) return;
  const key = 'browsersql-results-zoom';
  const saved = localStorage.getItem(key);
  if (saved) { slider.value = saved; display.textContent = saved; document.documentElement.style.setProperty('--results-font-size', saved + 'px'); }
  slider.addEventListener('input', () => {
    display.textContent = slider.value;
    document.documentElement.style.setProperty('--results-font-size', slider.value + 'px');
    localStorage.setItem(key, slider.value);
  });
}

main();
