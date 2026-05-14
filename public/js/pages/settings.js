import { $ } from '../utils.js';
import { state } from '../state.js';

const STORAGE_KEY = 'browsersql-settings';

function defaultSettings() {
  return { fontSize: 14, kbdEnabled: true, kbdHeight: 40, topMargin: 0, hideHeader: false, showTutorial: true, skipEnabled: false };
}

let settings = loadSettings();

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
  } catch {
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
  const stCb = $('#setting-showtutorial');
  if (stCb) stCb.checked = settings.showTutorial !== false;
  const skCb = $('#setting-skip');
  if (skCb) skCb.checked = settings.skipEnabled === true;
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
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });

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

  $('#setting-skip')?.addEventListener('change', (e) => {
    if (e.target.checked && !settings.skipEnabled) {
      if (!confirm('Only enable skip to view all lessons for testing.\nIf you really want to learn, keep it disabled.\nEnable anyway?')) {
        e.target.checked = false;
        return;
      }
    }
    settings.skipEnabled = e.target.checked;
    saveSettings();
    applySettings();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay?.classList.add('hidden');
  });
}
