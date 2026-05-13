import { $ } from '../utils.js';
import { state } from '../state.js';
import { setWordWrap } from './editorView.js';

const STORAGE_KEY = 'browsersql-settings';

function defaultSettings() {
  return { wordwrap: true, fontSize: 14, kbdEnabled: true, kbdHeight: 40, topMargin: 0, blinkCursor: true };
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

export function applySettings() {
  setWordWrap(settings.wordwrap);
  document.documentElement.style.setProperty('--editor-font-size', settings.fontSize + 'px');
  document.documentElement.style.setProperty('--kbd-height', settings.kbdHeight + 'px');
  const cb = $('#setting-wordwrap');
  if (cb) cb.checked = settings.wordwrap;
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
  document.documentElement.style.setProperty('--cursor-blink', settings.blinkCursor ? '1.2s' : '0s');
  const bcCb = $('#setting-blinkcursor');
  if (bcCb) bcCb.checked = settings.blinkCursor;
}

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

  $('#setting-wordwrap')?.addEventListener('change', (e) => {
    settings.wordwrap = e.target.checked;
    saveSettings();
    applySettings();
  });

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

  $('#setting-blinkcursor')?.addEventListener('change', (e) => {
    settings.blinkCursor = e.target.checked;
    saveSettings();
    applySettings();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay?.classList.add('hidden');
  });
}
