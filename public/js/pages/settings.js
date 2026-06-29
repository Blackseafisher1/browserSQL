import { $ } from '../utils.js';
import { state } from '../state.js';
import { t, setLang, getLang } from '../i18n.js';

const STORAGE_KEY = 'browsersql-settings';

const DEFAULT_CURSOR_COLOR = '#0056d9';

export function defaultSettings() {
  return { fontSize: 14, kbdEnabled: true, kbdHeight: 40, kbdOffset: 0, topMargin: 0, hideHeader: false, showTutorial: true, showChallenges: true, showFiles: true, showSchema: true, skipEnabled: false, keywordUpper: false, blockCursor: false, floatingTabs: false, floatingBottom: false, cursorColorText: DEFAULT_CURSOR_COLOR, cursorColorSpace: DEFAULT_CURSOR_COLOR, cursorNormalColor: DEFAULT_CURSOR_COLOR, formatCols: false, showFormatBtn: true, formatOnNewline: false, autoCompleteBareCols: false, editorBgImg: false };
}

let settings = loadSettings();

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...parsed };
  } catch (e) {
    console.warn('[settings] Failed to load, using defaults', e);
    return defaultSettings();
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Applies the current settings to the document and control values.
 */
export function getSettings() { return settings; }

export function applySettings() {
  document.documentElement.style.setProperty('--editor-font-size', settings.fontSize + 'px');
  document.documentElement.style.setProperty('--kbd-height', settings.kbdHeight + 'px');
  const slider = $('#setting-fontsize');
  if (slider) slider.value = settings.fontSize;
  const display = $('#setting-fontsize-value');
  if (display) display.textContent = settings.fontSize;
  const kbdCb = $('#setting-kbd');
  if (kbdCb) kbdCb.checked = settings.kbdEnabled;
  const kbdSlider = $('#setting-kbdheight');
  if (kbdSlider) kbdSlider.value = settings.kbdHeight;
  const kbdDisplay = $('#setting-kbdheight-value');
  if (kbdDisplay) kbdDisplay.textContent = settings.kbdHeight;
  document.body.style.paddingTop = '';
  document.getElementById('app').style.paddingTop = settings.topMargin + 'px';
  document.getElementById('app').style.minHeight = 'calc(100vh - ' + settings.topMargin + 'px)';
  const tmSlider = $('#setting-topmargin');
  if (tmSlider) tmSlider.value = settings.topMargin;
  const tmDisplay = $('#setting-topmargin-value');
  if (tmDisplay) tmDisplay.textContent = settings.topMargin;
  applyHideHeader();
  const hhCb = $('#setting-hideheader');
  if (hhCb) hhCb.checked = settings.hideHeader;
  applyTutorialVisibility();
  applyChallengeVisibility();
  applyFilesVisibility();
  applySchemaVisibility();
  const stCb = $('#setting-showtutorial');
  if (stCb) stCb.checked = settings.showTutorial !== false;
  const scCb = $('#setting-showchallenges');
  if (scCb) scCb.checked = settings.showChallenges !== false;
  const sfCb = $('#setting-showfiles');
  if (sfCb) sfCb.checked = settings.showFiles !== false;
  const ssCb = $('#setting-showschema');
  if (ssCb) ssCb.checked = settings.showSchema !== false;
  const skCb = $('#setting-skip');
  if (skCb) skCb.checked = settings.skipEnabled === true;
  const kwCb = $('#setting-keyword-case');
  if (kwCb) kwCb.checked = settings.keywordUpper === true;
  document.body.classList.toggle('block-cursor', settings.blockCursor === true);
  const bcCb = $('#setting-block-cursor');
  if (bcCb) bcCb.checked = settings.blockCursor === true;
  document.body.classList.toggle('editor-bg-img', settings.editorBgImg === true);
  const ebgCb = $('#setting-editor-bg');
  if (ebgCb) ebgCb.checked = settings.editorBgImg === true;
  document.body.classList.toggle('floating-tabs', settings.floatingTabs === true);
  const ftCb = $('#setting-floating-tabs');
  if (ftCb) ftCb.checked = settings.floatingTabs === true;
  document.body.classList.toggle('floating-bottom', settings.floatingBottom === true);
  const fbCb = $('#setting-floating-bottom');
  if (fbCb) fbCb.checked = settings.floatingBottom === true;
  const fcCb = $('#setting-format-cols');
  if (fcCb) fcCb.checked = settings.formatCols === true;
  const onCb = $('#setting-format-on');
  if (onCb) onCb.checked = settings.formatOnNewline === true;
  const sfbCb = $('#setting-show-format-btn');
  if (sfbCb) sfbCb.checked = settings.showFormatBtn !== false;
  const fb = $('#btn-format-sql');
  if (fb) fb.style.display = settings.showFormatBtn !== false ? '' : 'none';
  const acCb = $('#setting-autocomplete-bare');
  if (acCb) acCb.checked = settings.autoCompleteBareCols === true;
  document.documentElement.style.setProperty('--cursor-color-text', settings.cursorColorText || DEFAULT_CURSOR_COLOR);
  document.documentElement.style.setProperty('--cursor-color-space', settings.cursorColorSpace || DEFAULT_CURSOR_COLOR);
  document.documentElement.style.setProperty('--cursor-normal-color', settings.cursorNormalColor || DEFAULT_CURSOR_COLOR);
  const cct = $('#setting-cursor-color-text');
  if (cct) cct.value = settings.cursorColorText || DEFAULT_CURSOR_COLOR;
  const ccs = $('#setting-cursor-color-space');
  if (ccs) ccs.value = settings.cursorColorSpace || DEFAULT_CURSOR_COLOR;
  const cnc = $('#setting-cursor-color-normal');
  if (cnc) cnc.value = settings.cursorNormalColor || '#0056d9';
  const kdSlider = $('#setting-kbdoffset');
  if (kdSlider) kdSlider.value = settings.kbdOffset;
  const kdDisplay = $('#setting-kbdoffset-value');
  if (kdDisplay) kdDisplay.textContent = settings.kbdOffset;
}

/**
 * Hides or shows the app header based on the saved preference and viewport width.
 */
function applyHideHeader() {
  document.getElementById('header').style.display = settings.hideHeader && window.innerWidth > 768 ? 'none' : '';
}

function applyTutorialVisibility() {
  const header = document.querySelector('.section-header[data-section="tutorial"]');
  const node = header?.closest('.section-node');
  const handle = document.getElementById('tutorial-resize-handle');
  const shouldShow = settings.showTutorial !== false;
  if (node) node.style.display = shouldShow ? '' : 'none';
  if (handle) handle.style.display = shouldShow ? '' : 'none';
}

function applyFilesVisibility() {
  const header = document.querySelector('.section-header[data-section="files"]');
  const node = header?.closest('.section-node');
  const handle = document.getElementById('files-resize-handle');
  const shouldShow = settings.showFiles !== false;
  if (node) node.style.display = shouldShow ? '' : 'none';
  if (handle) handle.style.display = shouldShow ? '' : 'none';
}

function applySchemaVisibility() {
  const header = document.querySelector('.section-header[data-section="schema"]');
  const node = header?.closest('.section-node');
  const handle = document.getElementById('schema-resize-handle');
  const shouldShow = settings.showSchema !== false;
  if (node) node.style.display = shouldShow ? '' : 'none';
}

function applyChallengeVisibility() {
  const header = document.querySelector('.section-header[data-section="challenges"]');
  const node = header?.closest('.section-node');
  const handle = document.getElementById('challenges-resize-handle');
  const shouldShow = settings.showChallenges !== false;
  if (node) node.style.display = shouldShow ? '' : 'none';
  if (handle) handle.style.display = shouldShow ? '' : 'none';
}

/**
 * Wires the settings modal and change handlers.
 */
export function initSettings() {
  applySettings();

  const overlay = $('#settings-modal-overlay');
  const closeBtn = $('#settings-modal-close');

  document.getElementById('btn-settings')?.addEventListener('click', () => overlay.classList.remove('hidden'));
  document.getElementById('btn-schema-settings')?.addEventListener('click', () => overlay.classList.remove('hidden'));

  closeBtn?.addEventListener('click', () => overlay.classList.add('hidden'));


  window.addEventListener('resize', applyHideHeader);

  $('#setting-fontsize')?.addEventListener('input', (e) => {
    settings.fontSize = parseInt(e.target.value);
    saveSettings();
    applySettings();
  });

  $('#setting-kbd')?.addEventListener('change', (e) => {
    settings.kbdEnabled = e.target.checked;
    saveSettings();
    applySettings();
    window.dispatchEvent(new Event('storage'));
  });

  $('#setting-kbdheight')?.addEventListener('input', (e) => {
    settings.kbdHeight = parseInt(e.target.value);
    saveSettings();
    applySettings();
  });

  $('#setting-topmargin')?.addEventListener('input', (e) => {
    settings.topMargin = parseInt(e.target.value);
    saveSettings();
    applySettings();
  });

  $('#setting-hideheader')?.addEventListener('change', (e) => {
    settings.hideHeader = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-showtutorial')?.addEventListener('change', (e) => {
    settings.showTutorial = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-showchallenges')?.addEventListener('change', (e) => {
    settings.showChallenges = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-showfiles')?.addEventListener('change', (e) => {
    settings.showFiles = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-showschema')?.addEventListener('change', (e) => {
    settings.showSchema = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-skip')?.addEventListener('change', (e) => {
    if (e.target.checked && !settings.skipEnabled) {
      if (!confirm(t('confirm.skip'))) {
        e.target.checked = false;
        return;
      }
    }
    settings.skipEnabled = e.target.checked;
    saveSettings();
    applySettings();
    window.dispatchEvent(new CustomEvent('settings-changed'));
  });

  $('#setting-keyword-case')?.addEventListener('change', (e) => {
    settings.keywordUpper = e.target.checked;
    saveSettings();
    applySettings();
    window.dispatchEvent(new CustomEvent('settings-changed'));
  });

  $('#setting-block-cursor')?.addEventListener('change', (e) => {
    settings.blockCursor = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-editor-bg')?.addEventListener('change', (e) => {
    settings.editorBgImg = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-floating-tabs')?.addEventListener('change', (e) => {
    settings.floatingTabs = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-floating-bottom')?.addEventListener('change', (e) => {
    settings.floatingBottom = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-format-cols')?.addEventListener('change', (e) => {
    settings.formatCols = e.target.checked;
    saveSettings();
  });

  $('#setting-format-on')?.addEventListener('change', (e) => {
    settings.formatOnNewline = e.target.checked;
    saveSettings();
  });

  $('#setting-show-format-btn')?.addEventListener('change', (e) => {
    settings.showFormatBtn = e.target.checked;
    saveSettings();
    applySettings();
  });

  $('#setting-autocomplete-bare')?.addEventListener('change', (e) => {
    settings.autoCompleteBareCols = e.target.checked;
    saveSettings();
  });

  $('#setting-cursor-color-text')?.addEventListener('input', (e) => {
    settings.cursorColorText = e.target.value;
    saveSettings();
    applySettings();
  });

  $('#setting-cursor-color-space')?.addEventListener('input', (e) => {
    settings.cursorColorSpace = e.target.value;
    saveSettings();
    applySettings();
  });

  $('#setting-cursor-color-normal')?.addEventListener('input', (e) => {
    settings.cursorNormalColor = e.target.value;
    saveSettings();
    applySettings();
  });

  $('#setting-cursor-colors-reset')?.addEventListener('click', () => {
    settings.cursorColorText = DEFAULT_CURSOR_COLOR;
    settings.cursorColorSpace = DEFAULT_CURSOR_COLOR;
    settings.cursorNormalColor = DEFAULT_CURSOR_COLOR;
    saveSettings();
    applySettings();
  });

  const langSelect = $('#setting-lang');
  if (langSelect) {
    langSelect.value = getLang();
    langSelect.addEventListener('change', (e) => {
      setLang(e.target.value);
      window.dispatchEvent(new CustomEvent('settings-changed'));
    });
  }

  $('#setting-kbdoffset')?.addEventListener('input', (e) => {
    settings.kbdOffset = parseInt(e.target.value);
    saveSettings();
    applySettings();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay?.classList.add('hidden');
  });

  $('#btn-reset-settings')?.addEventListener('click', () => {
    if (!confirm(t('confirm.resetSettings'))) return;
    localStorage.removeItem(STORAGE_KEY);
    settings = defaultSettings();
    saveSettings();
    applySettings();
  });

  $('#btn-start-tour')?.addEventListener('click', () => {
    localStorage.removeItem('browsersql-tour-done');
    import('./featureTour.js').then(m => m.startTour()).catch(() => {});
    $('#settings-modal-overlay')?.classList.add('hidden');
  });

  $('#btn-reset-all')?.addEventListener('click', () => {
    if (!confirm(t('confirm.resetAll.1'))) return;
    if (!confirm(t('confirm.resetAll.2'))) return;
    localStorage.clear();
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(() => {});
    }
    location.reload();
  });
}
