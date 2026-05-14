import { initEditor, updateEditorSchema } from './pages/editorView.js';
import { initSchemaView } from './pages/schemaView.js';
import { initDBManager, initDatabase, loadTestSchema, openLastDB } from './pages/dbManager.js';
import { initSettings } from './pages/settings.js';
import { initFilesView } from './pages/filesView.js';
import { showReady } from './pages/resultsView.js';
import { state } from './state.js';

const STORAGE_KEY = 'browsersql-theme';

/**
 * Initializes the saved or system theme on page load.
 */
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

/**
 * Toggles the app theme between light and dark.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEY, next);
}

/**
 * Bootstraps the full browserSQL application.
 */
async function main() {
  document.addEventListener('touchstart', () => {}, { passive: true });
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
  document.querySelector('.app-logo')?.addEventListener('click', () => document.getElementById('about-overlay')?.classList.remove('hidden'));
  document.getElementById('ops-about-trigger')?.addEventListener('click', () => document.getElementById('about-overlay')?.classList.remove('hidden'));
  document.getElementById('about-modal-close')?.addEventListener('click', () => document.getElementById('about-overlay')?.classList.add('hidden'));
  document.getElementById('about-overlay')?.addEventListener('click', (e) => { if (e.target === document.getElementById('about-overlay')) document.getElementById('about-overlay').classList.add('hidden'); });

  wireSchemaToolbar();
  initSidebarResize();
  initEditorResize();
  initPaneResize();
  initSidebarSectionResize();
  initMobileToggles();
  pinToolbarToKeyboard();
  initResultsZoom();

  showReady();
  if (state.renderSchema) {
    state.renderSchema();
  }
  openLastDB();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
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

function initEditorResize() {
  const handle = document.getElementById('editor-resize-handle');
  if (!handle) return;
  const editor = document.querySelector('.editor-split');
  const results = document.getElementById('results-container');
  if (!editor || !results) return;
  function getY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
  let startY, startEd, startRs;
  function startResize(e) { startY = getY(e); startEd = editor.getBoundingClientRect().height; startRs = results.getBoundingClientRect().height; document.addEventListener('mousemove', moveResize); document.addEventListener('mouseup', endResize); document.addEventListener('touchmove', moveResize, { passive: false }); document.addEventListener('touchend', endResize); document.body.style.cursor = 'row-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); }
  function moveResize(e) { const dy = getY(e) - startY; const total = editor.parentElement.clientHeight; let ep = ((startEd + dy) / total * 100); let rp = ((startRs - dy) / total * 100); if (ep < 10) { ep = 10; rp = 90; } if (rp < 10) { rp = 10; ep = 90; } editor.style.flex = `1 1 ${ep}%`; results.style.flex = `1 1 ${rp}%`; }
  function endResize() { document.removeEventListener('mousemove', moveResize); document.removeEventListener('mouseup', endResize); document.removeEventListener('touchmove', moveResize); document.removeEventListener('touchend', endResize); document.body.style.cursor = ''; document.body.style.userSelect = ''; }
  handle.addEventListener('mousedown', startResize);
  handle.addEventListener('touchstart', startResize, { passive: false });
}

function initPaneResize() {
  const divider = document.getElementById('editor-divider');
  if (!divider) return;
  const wrap0 = divider.previousElementSibling;
  const wrap1 = divider.nextElementSibling;
  if (!wrap0 || !wrap1) return;
  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
  let startX, startW0;
  function start(e) { startX = getX(e); startW0 = wrap0.getBoundingClientRect().width; document.addEventListener('mousemove', move); document.addEventListener('mouseup', end); document.addEventListener('touchmove', move, { passive: false }); document.addEventListener('touchend', end); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; e.preventDefault(); }
  function move(e) {
    const dx = getX(e) - startX;
    const total = wrap0.parentElement.getBoundingClientRect().width;
    let p0 = ((startW0 + dx) / total * 100);
    let p1 = 100 - p0;
    if (p0 < 15) { p0 = 15; p1 = 85; }
    if (p1 < 15) { p1 = 15; p0 = 85; }
    wrap0.style.flex = `0 0 ${p0}%`;
    wrap1.style.flex = `0 0 ${p1}%`;
  }
  function end() { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', end); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end); document.body.style.cursor = ''; document.body.style.userSelect = ''; }
  divider.addEventListener('mousedown', start);
  divider.addEventListener('touchstart', start, { passive: false });
}

function initSidebarSectionResize() {
  const handle = document.getElementById('sidebar-resize-handle');
  if (!handle) return;
  const filesNode = handle.previousElementSibling;
  const schemaNode = handle.nextElementSibling;
  if (!filesNode || !schemaNode) return;
  filesNode.style.flex = '1';
  schemaNode.style.flex = '1';
  function getY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
  let startY, startFs;
  function startResize(e) {
    startY = getY(e);
    startFs = filesNode.getBoundingClientRect().height;
    document.addEventListener('mousemove', moveResize);
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchmove', moveResize, { passive: false });
    document.addEventListener('touchend', endResize);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }
  function moveResize(e) {
    const dy = getY(e) - startY;
    const total = filesNode.parentElement.getBoundingClientRect().height;
    let fp = ((startFs + dy) / total * 100);
    let sp = 100 - fp;
    if (fp < 15) { fp = 15; sp = 85; }
    if (sp < 15) { sp = 15; fp = 85; }
    filesNode.style.flex = '0 0 ' + fp + '%';
    schemaNode.style.flex = '0 0 ' + sp + '%';
  }
  function endResize() {
    document.removeEventListener('mousemove', moveResize);
    document.removeEventListener('mouseup', endResize);
    document.removeEventListener('touchmove', moveResize);
    document.removeEventListener('touchend', endResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
  handle.addEventListener('mousedown', startResize);
  handle.addEventListener('touchstart', startResize, { passive: false });
}

function pinToolbarToKeyboard() {
  const toolbar = document.getElementById('sql-keyboard');
  if (!toolbar) return;
  const isMobile = window.matchMedia('(max-width: 768px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (!isMobile) { toolbar.style.cssText = 'height:0;overflow:hidden;visibility:hidden;padding:0'; return; }
  const kbd = getKbdSettings();
  if (!kbd.kbdEnabled) { toolbar.style.cssText = 'height:0;overflow:hidden;visibility:hidden;padding:0'; return; }
  toolbar.style.cssText = 'display:flex;position:fixed;left:0;right:0;bottom:0;z-index:50;height:auto;visibility:visible;padding:var(--space-1) var(--space-3);gap:var(--space-1);background:var(--color-bg-surface);border-bottom:1px solid var(--color-border);overflow-x:auto;-webkit-overflow-scrolling:touch';
}

/**
 * Wires the schema-panel toolbar buttons to their header counterparts.
 */
function wireSchemaToolbar() {
  const headerRecentBtn = document.getElementById('btn-recent-dbs');
  let preferFloatingRecent = false;

  function restoreRecentDropdown() {
/**
 * Makes the schema panel resizable horizontally.
 */
    const dropdown = document.getElementById('recent-dbs-dropdown');
    const wrap = document.querySelector('#header .recent-wrap');
    if (!dropdown || !wrap || dropdown.dataset.floating !== 'true') return;
    dropdown.dataset.floating = 'false';
    dropdown.classList.remove('recent-wrap');
    dropdown.style.position = '';
    dropdown.style.left = '';
    dropdown.style.top = '';
    dropdown.style.right = '';
    dropdown.style.marginTop = '';
    if (dropdown.parentElement !== wrap) wrap.appendChild(dropdown);
  }

  function floatRecentDropdown(anchor) {
/**
 * Wires the mobile schema and action drawer toggles.
 */
    const dropdown = document.getElementById('recent-dbs-dropdown');
    if (!dropdown || !anchor) return;
    if (dropdown.parentElement !== document.body) document.body.appendChild(dropdown);
    dropdown.dataset.floating = 'true';
    dropdown.classList.add('recent-wrap');
    const rect = anchor.getBoundingClientRect();
    const width = Math.max(250, dropdown.offsetWidth || 0);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
    dropdown.style.position = 'fixed';
    dropdown.style.left = left + 'px';
    dropdown.style.top = rect.bottom + 6 + 'px';
    dropdown.style.right = 'auto';
    dropdown.style.marginTop = '0';
  }

  headerRecentBtn?.addEventListener('click', () => {
/**
 * Reads keyboard-toolbar settings from localStorage.
 * @returns {{kbdEnabled: boolean, kbdHeight: number}}
 */
    if (!preferFloatingRecent) restoreRecentDropdown();
  });

  const map = {
/**
 * Makes the SQL keyboard bar stick to the bottom on supported mobile devices.
 */
    'btn-schema-new': 'btn-new-db',
    'btn-schema-open': 'btn-open-db',
    'btn-schema-export': 'btn-export-db',
    'btn-schema-delete': 'btn-delete-db',
    'btn-schema-test': 'btn-test-schema',
     'btn-schema-theme': 'btn-theme-toggle',
     'btn-schema-settings': 'btn-settings',
      'btn-schema-recent': 'btn-recent-dbs',
  };
  for (const [fromId, toId] of Object.entries(map)) {
    document.getElementById(fromId)?.addEventListener('click', () => {
      if (fromId === 'btn-schema-recent') {
        const header = document.getElementById('header');
        const headerHidden = header && getComputedStyle(header).display === 'none';
        if (headerHidden) {
          const anchor = document.getElementById('btn-schema-recent');
          preferFloatingRecent = true;
          floatRecentDropdown(anchor);
          headerRecentBtn?.click();
          preferFloatingRecent = false;
          return;
        }
      }
      document.getElementById(toId)?.click();
    });
  }
}

/**
 * Updates the results zoom slider and persisted font size.
 */
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