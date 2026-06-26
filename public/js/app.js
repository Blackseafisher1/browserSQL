import { initEditor, updateEditorSchema } from './pages/editorView.js';
import { initSchemaView } from './pages/schemaView.js';
import { initDBManager, initDatabase, openLastDB } from './pages/dbManager.js';
import { initSettings } from './pages/settings.js';
import { initFilesView } from './pages/filesView.js';
import { showReady } from './pages/resultsView.js';
import { initTutorialMode } from './pages/tutorialView.js';
import { initChallengeMode } from './pages/challengeView.js';
import { initCloudSync } from './pages/cloudSync.js';
import { state } from './state.js';
import { init as initI18n, t } from './i18n.js';

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

window.toggleTheme = toggleTheme;

/**
 * Bootstraps the full browserSQL application.
 */
async function main() {
  document.addEventListener('touchstart', () => {}, { passive: true });
  initI18n();
  initTheme();

  const loadingBar = document.getElementById('sqlite-loading-bar');
  const loadingEl = document.getElementById('sqlite-loading');
  let loadPct = 0;
  function advanceLoad() {
    loadPct = Math.min(loadPct + 12, 90);
    if (loadingBar) loadingBar.style.width = loadPct + '%';
  }

  // Init UI that doesn't need SQLite
  initSettings();
  initEditor();
  await initFilesView();
  initCloudSync();

  advanceLoad();

  wireSchemaToolbar();
  initSidebarResize();
  initSidebarCollapse();
  initEditorResize();
  initPaneResize();
  initSidebarSectionResize();
  initMobileToggles();
  pinToolbarToKeyboard();
  initResultsZoom();
  initShortcutsHelp();
  initOfflineDetection();

  advanceLoad();

  document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('btn-gensql')?.addEventListener('click', () => {
    import('./pages/aiGenerateModal.js').then(m => m.showAIGenerateModal()).catch(() => {});
  });
  document.getElementById('btn-test-schema').addEventListener('click', () => {
    if (!state.sqlite3) return;
    import('./pages/templateModal.js').then(m => m.showTemplateModal()).catch(() => {});
  });
  document.querySelector('.app-logo')?.addEventListener('click', () => document.getElementById('about-overlay')?.classList.remove('hidden'));
  document.getElementById('ops-about-trigger')?.addEventListener('click', () => document.getElementById('about-overlay')?.classList.remove('hidden'));
  document.getElementById('about-modal-close')?.addEventListener('click', () => document.getElementById('about-overlay')?.classList.add('hidden'));

  const csvInput = document.getElementById('csv-file-input');
  document.getElementById('btn-import-csv')?.addEventListener('click', () => csvInput?.click());
  csvInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { importCSV } = await import('./pages/csvImport.js');
    await importCSV(file);
    csvInput.value = '';
  });


  // Init SQLite in background — UI stays responsive
  const dbOk = await initDatabase();
  advanceLoad();

  if (!dbOk) {
    if (loadingBar) loadingBar.style.background = 'var(--color-error, #ef4444)';
    setTimeout(() => { if (loadingEl) loadingEl.style.opacity = '0'; }, 2000);
    document.getElementById('btn-new-db')?.addEventListener('click', () => alert('SQLite failed to initialize. Check console.'));
    return;
  }

  advanceLoad();
  initSchemaView();
  initDBManager();
  advanceLoad();
  state.refreshEditorSchema = updateEditorSchema;

  initChallengeMode();
  const tutorialStarted = await initTutorialMode();
  if (!tutorialStarted) {
    showReady();
    if (state.renderSchema) state.renderSchema();
    openLastDB();
    setTimeout(() => {
      import('./pages/featureTour.js').then(m => m.startTour()).catch(() => {});
    }, 1000);
  }

  if (loadingBar) loadingBar.style.width = '100%';
  setTimeout(() => { if (loadingEl) loadingEl.style.opacity = '0'; }, 600);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

function updateHandlePos() {
  const handle = document.getElementById('schema-resize-handle');
  if (!handle) return;
  const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 0;
  handle.style.left = Math.max(0, w) + 'px';
}

function initSidebarResize() {
  const handle = document.getElementById('schema-resize-handle');
  if (!handle) return;
  const panel = document.getElementById('schema-panel');
  let startX, startWidth;
  function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
  updateHandlePos();

  function move(e) {
    const newWidth = Math.max(0, startWidth + (getX(e) - startX));
    document.documentElement.style.setProperty('--sidebar-width', newWidth + 'px');
    handle.style.left = newWidth + 'px';
  }

  function end() {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', end);
    document.removeEventListener('touchmove', move);
    document.removeEventListener('touchend', end);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    panel.classList.remove('notrans');
  }

  function start(e) {
    startX = getX(e);
    startWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 260;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    panel.classList.add('notrans');
    e.preventDefault();
  }

  handle.addEventListener('mousedown', start);
  handle.addEventListener('touchstart', start, { passive: false });
  window.addEventListener('resize', updateHandlePos);
}

let savedSidebarWidth = 260;

function initSidebarCollapse() {
  const panel = document.getElementById('schema-panel');
  const btn = document.getElementById('btn-sidebar-collapse');
  if (!panel || !btn) return;
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      panel.classList.toggle('open');
      pushContent();
      return;
    }
    const collapsed = panel.classList.toggle('collapsed');
    if (collapsed) {
      savedSidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 260;
      document.documentElement.style.setProperty('--sidebar-width', '26px');
      btn.textContent = '▶';
    } else {
      document.documentElement.style.setProperty('--sidebar-width', savedSidebarWidth + 'px');
      btn.textContent = '◀';
    }
    updateHandlePos();
  });
}

let schemaPanel, mobileMenu;

function pushContent() {
  const main = document.querySelector('.main-content');
  if (!main || !schemaPanel) return;
  if (window.innerWidth > 768) { main.style.marginLeft = ''; return; }
  main.style.marginLeft = schemaPanel.classList.contains('open') ? schemaPanel.offsetWidth + 'px' : '';
}
function pushContentRight() {
  const main = document.querySelector('.main-content');
  if (!main || !mobileMenu) return;
  if (window.innerWidth > 768) { main.style.marginRight = ''; return; }
  main.style.marginRight = mobileMenu.classList.contains('open') ? mobileMenu.offsetWidth + 'px' : '';
}

function initMobileToggles() {
  schemaPanel = document.getElementById('schema-panel');
  mobileMenu = document.getElementById('mobile-menu-panel');

  document.getElementById('btn-schema-toggle')?.addEventListener('click', () => {
    schemaPanel.classList.toggle('open');
    pushContent();
  });

  document.getElementById('btn-schema-close')?.addEventListener('click', () => {
    schemaPanel.classList.remove('open');
    pushContent();
  });

  document.getElementById('btn-mobile-menu')?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    pushContentRight();
  });

  document.getElementById('btn-mobile-menu-close')?.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    pushContentRight();
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
      pushContent();
    }
    if (!e.target.closest('#mobile-menu-panel') && !e.target.closest('#btn-mobile-menu')) {
      mobileMenu.classList.remove('open');
      pushContentRight();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      const main = document.querySelector('.main-content');
      if (main) { main.style.marginLeft = ''; main.style.marginRight = ''; }
    }
  });
}

function getKbdSettings() {
  try {
    const raw = localStorage.getItem('browsersql-settings');
    if (!raw) return { kbdEnabled: true, kbdHeight: 40, kbdOffset: 0 };
    const s = JSON.parse(raw);
    return { kbdEnabled: s.kbdEnabled !== false, kbdHeight: s.kbdHeight || 40, kbdOffset: s.kbdOffset || 0 };
  } catch { return { kbdEnabled: true, kbdHeight: 40, kbdOffset: 0 }; }
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
  const handles = Array.from(document.querySelectorAll('#schema-panel .sidebar-resize-handle'));
  if (handles.length === 0) return;
  function getY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }

  for (const handle of handles) {
    const topNode = handle.previousElementSibling;
    const bottomNode = handle.nextElementSibling;
    if (!topNode || !bottomNode) continue;

    let startY = 0;
    let startTop = 0;
    let startBottom = 0;
    let total = 0;

    const endResize = () => {
      document.removeEventListener('mousemove', moveResize);
      document.removeEventListener('mouseup', endResize);
      document.removeEventListener('touchmove', moveResize);
      document.removeEventListener('touchend', endResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const startResize = (e) => {
      const topBody = topNode.querySelector('.section-body');
      const bottomBody = bottomNode.querySelector('.section-body');
      const topCollapsed = topBody?.classList.contains('collapsed');
      const bottomCollapsed = bottomBody?.classList.contains('collapsed');
      if (topCollapsed && bottomCollapsed) return;
      startY = getY(e);
      startTop = topNode.getBoundingClientRect().height;
      startBottom = bottomNode.getBoundingClientRect().height;
      total = startTop + startBottom;
      document.addEventListener('mousemove', moveResize);
      document.addEventListener('mouseup', endResize);
      document.addEventListener('touchmove', moveResize, { passive: false });
      document.addEventListener('touchend', endResize);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const moveResize = (e) => {
      const dy = getY(e) - startY;
      const minPx = 70;
      const topBody = topNode.querySelector('.section-body');
      const bottomBody = bottomNode.querySelector('.section-body');
      const topCollapsed = topBody?.classList.contains('collapsed');
      const bottomCollapsed = bottomBody?.classList.contains('collapsed');

      if (topCollapsed || bottomCollapsed) {
        if (bottomCollapsed) {
          const topPx = Math.max(minPx, startTop + dy);
          topNode.style.flex = '0 0 ' + topPx + 'px';
        } else {
          const bottomPx = Math.max(minPx, startBottom - dy);
          bottomNode.style.flex = '0 0 ' + bottomPx + 'px';
        }
      } else {
        let topPx = startTop + dy;
        topPx = Math.max(minPx, Math.min(total - minPx, topPx));
        const bottomPx = total - topPx;
        topNode.style.flex = '0 0 ' + topPx + 'px';
        bottomNode.style.flex = '0 0 ' + bottomPx + 'px';
      }
    };

    handle.addEventListener('mousedown', startResize);
    handle.addEventListener('touchstart', startResize, { passive: false });
  }
}

function pinToolbarToKeyboard() {
  const toolbar = document.getElementById('sql-keyboard');
  if (!toolbar) return;
  const isMobile = window.matchMedia('(max-width: 768px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (!isMobile) { toolbar.style.display = 'none'; return; }
  const kbd = getKbdSettings();
  if (!kbd.kbdEnabled) { toolbar.style.display = 'none'; return; }

  function show(bottom) {
    const kbd = getKbdSettings();
    toolbar.style.cssText = 'display:flex;position:fixed;left:0;right:0;bottom:' + (bottom || 0) + 'px;z-index:50;height:' + (kbd.kbdHeight || 40) + 'px;visibility:visible;padding:0 var(--space-3);gap:var(--space-1);background:var(--color-bg-surface);border-bottom:1px solid var(--color-border);overflow-x:auto;align-items:center';
  }
  function hide() { toolbar.style.display = 'none'; }
  hide();

  const editorEl = document.querySelector('.cm-editor');
  if (!editorEl) return;

  const isPWA = window.navigator.standalone === true;
  const isAndroid = /Android/i.test(navigator.userAgent);

  editorEl.addEventListener('focus', () => {
    if (isAndroid) {
      const kbd = getKbdSettings();
      show(kbd.kbdOffset);
    } else if (isPWA) {
      let tries = 0;
      const iv = setInterval(() => {
        tries++;
        const kb = window.innerHeight - (window.visualViewport ? window.visualViewport.height : window.innerHeight);
        if (kb > 50 || tries > 8) { show(kb > 50 ? kb : 0); clearInterval(iv); }
      }, 80);
    } else {
      show();
    }
  }, true);

  editorEl.addEventListener('blur', () => {
    setTimeout(() => { if (!editorEl.contains(document.activeElement)) hide(); }, 200);
  }, true);
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
      'btn-schema-test': 'btn-test-schema',
      'btn-schema-gensql': 'btn-gensql',
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

function initShortcutsHelp() {
  const overlay = document.getElementById('shortcuts-overlay');
  const closeBtn = document.getElementById('shortcuts-modal-close');
  closeBtn?.addEventListener('click', () => overlay?.classList.add('hidden'));

  document.addEventListener('keydown', (e) => {
    if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (document.activeElement?.closest('.cm-editor, input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      overlay?.classList.remove('hidden');
    }
  });
}

function initOfflineDetection() {
  const toast = document.createElement('div');
  toast.id = 'offline-toast';
  toast.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;padding:8px 16px;border-radius:6px;font-size:13px;transition:opacity 0.3s;opacity:0;pointer-events:none;background:var(--color-bg-surface);border:1px solid var(--color-border);box-shadow:0 4px 12px rgba(0,0,0,0.15)';
  document.body.appendChild(toast);

  function show(msg, isOffline) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.background = isOffline ? 'var(--color-error)' : 'var(--color-accent)';
    toast.style.color = '#fff';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  window.addEventListener('online', () => show(t('toast.backOnline'), false));
  window.addEventListener('offline', () => show(t('toast.offline'), true));
}

main();
