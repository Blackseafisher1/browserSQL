import { $ } from '../utils.js';
import { state } from '../state.js';
import { setWordWrap } from './editorView.js';

const STORAGE_KEY = 'browsersql-settings';

function defaultSettings() {
  return { wordwrap: true, fontSize: 14, kbdEnabled: true, kbdHeight: 40 };
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay?.classList.add('hidden');
  });
}
