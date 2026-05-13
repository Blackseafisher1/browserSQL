import { $ } from '../utils.js';
import { state } from '../state.js';
import { createEditor, setActiveEditor, getCurrentEditor, destroyEditor } from './editorView.js';

const FILES_KEY = 'browsersql-files';
const ACTIVE_KEY = 'browsersql-active-file';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';

const editors = {};
let activeFile = null;

export function getFiles() {
  try { return JSON.parse(localStorage.getItem(FILES_KEY)) || {}; } catch { return {}; }
}
function saveFiles(files) { localStorage.setItem(FILES_KEY, JSON.stringify(files)); }
export function getActiveFileName() { return localStorage.getItem(ACTIVE_KEY) || DEFAULT_FILE; }
function setActiveFileName(n) { localStorage.setItem(ACTIVE_KEY, n); activeFile = n; }

function ensureDefault() {
  const files = getFiles();
  if (Object.keys(files).length === 0) {
    files[DEFAULT_FILE] = DEFAULT_CONTENT;
    saveFiles(files);
    setActiveFileName(DEFAULT_FILE);
  }
  const cur = getActiveFileName();
  if (!(cur in getFiles())) setActiveFileName(DEFAULT_FILE);
}

export function saveCurrentFile() {
  const v = getCurrentEditor();
  if (!v) return;
  const files = getFiles();
  const name = activeFile || getActiveFileName();
  files[name] = v.state.doc.toString();
  saveFiles(files);
}

export function switchFile(name) {
  if (name === activeFile) return;
  const files = getFiles();
  if (!(name in files)) return;
  saveCurrentFile();
  setActiveFileName(name);
  if (!editors[name]) {
    editors[name] = createEditor(files[name]);
  }
  setActiveEditor(editors[name]);
  if (!editors[name].parentElement && getCurrentEditor) {
    document.getElementById('editor-container')?.appendChild(editors[name].dom);
  }
  updateFileListDOM();
}

export function createFile(name) {
  const files = getFiles();
  if (name in files) return false;
  files[name] = '';
  saveFiles(files);
  switchFile(name);
  return true;
}

export function deleteFile(name) {
  const files = getFiles();
  if (!(name in files) || Object.keys(files).length <= 1) return false;
  delete editors[name];
  delete files[name];
  saveFiles(files);
  if (activeFile === name) {
    const remaining = Object.keys(files);
    switchFile(remaining[0]);
  }
  updateFileListDOM();
  return true;
}

function updateFileListDOM() {
  const list = $('#files-list');
  if (!list) return;
  const files = getFiles();
  const active = activeFile || getActiveFileName();
  const names = Object.keys(files).sort();
  let items = list.children;
  let i = 0;
  for (const name of names) {
    if (i < items.length && items[i].dataset.name === name) {
      items[i].className = 'file-item' + (name === active ? ' file-item-active' : '');
    } else {
      const item = document.createElement('div');
      item.className = 'file-item' + (name === active ? ' file-item-active' : '');
      item.dataset.name = name;
      const span = document.createElement('span');
      span.className = 'file-name';
      span.textContent = name;
      span.addEventListener('click', () => switchFile(name));
      item.appendChild(span);
      const del = document.createElement('button');
      del.className = 'file-del';
      del.textContent = '\u00d7';
      del.title = 'Delete file';
      del.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Delete "${name}"?`)) deleteFile(name); });
      item.appendChild(del);
      if (i < items.length) list.insertBefore(item, items[i]);
      else list.appendChild(item);
    }
    i++;
  }
  while (items.length > names.length) items[items.length - 1].remove();
}

export function initFilesView() {
  ensureDefault();
  const files = getFiles();
  const name = getActiveFileName();
  activeFile = name;
  editors[name] = createEditor(files[name]);
  setActiveEditor(editors[name]);
  updateFileListDOM();

  $('#tab-tables')?.addEventListener('click', () => {
    $('#tab-tables')?.classList.add('schema-tab-active');
    $('#tab-files')?.classList.remove('schema-tab-active');
    $('#schema-tree')?.classList.remove('hidden');
    $('#files-panel')?.classList.add('hidden');
    $('#schema-toolbar')?.classList.remove('hidden');
    saveCurrentFile();
  });

  $('#tab-files')?.addEventListener('click', () => {
    $('#tab-files')?.classList.add('schema-tab-active');
    $('#tab-tables')?.classList.remove('schema-tab-active');
    $('#files-panel')?.classList.remove('hidden');
    $('#schema-tree')?.classList.add('hidden');
    $('#schema-toolbar')?.classList.add('hidden');
    updateFileListDOM();
  });

  $('#btn-file-new')?.addEventListener('click', () => {
    const name = prompt('File name:', 'query.sql');
    if (name) createFile(name);
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-execute, #tab-tables')) saveCurrentFile();
  });
}
