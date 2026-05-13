import { $ } from '../utils.js';
import { state } from '../state.js';

const FILES_KEY = 'browsersql-files';
const ACTIVE_KEY = 'browsersql-active-file';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';

export function getFiles() {
  try {
    return JSON.parse(localStorage.getItem(FILES_KEY)) || {};
  } catch { return {}; }
}

function saveFiles(files) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function getActiveFileName() {
  return localStorage.getItem(ACTIVE_KEY) || DEFAULT_FILE;
}

function setActiveFileName(name) {
  localStorage.setItem(ACTIVE_KEY, name);
}

function ensureDefault() {
  const files = getFiles();
  if (Object.keys(files).length === 0) {
    files[DEFAULT_FILE] = DEFAULT_CONTENT;
    saveFiles(files);
    setActiveFileName(DEFAULT_FILE);
  }
}

export function switchFile(name) {
  const files = getFiles();
  if (!files[name]) return;
  saveCurrentContent();
  setActiveFileName(name);
  loadContentIntoEditor(files[name]);
  renderFilesList();
}

export function createFile(name) {
  const files = getFiles();
  if (files[name]) return false;
  files[name] = '';
  saveFiles(files);
  switchFile(name);
  return true;
}

export function deleteFile(name) {
  const files = getFiles();
  if (!files[name] || Object.keys(files).length <= 1) return false;
  delete files[name];
  saveFiles(files);
  const active = getActiveFileName();
  if (active === name) {
    const remaining = Object.keys(files);
    switchFile(remaining[0]);
  }
  renderFilesList();
  return true;
}

export function renameFile(oldName, newName) {
  if (!newName || oldName === newName) return false;
  const files = getFiles();
  if (!files[oldName] || files[newName]) return false;
  files[newName] = files[oldName];
  delete files[oldName];
  saveFiles(files);
  setActiveFileName(newName);
  renderFilesList();
  return true;
}

function saveCurrentContent() {
  const v = state.editorView;
  if (!v) return;
  const files = getFiles();
  const name = getActiveFileName();
  files[name] = v.state.doc.toString();
  saveFiles(files);
}

function loadContentIntoEditor(content) {
  const v = state.editorView;
  if (!v) return;
  v.dispatch({
    changes: { from: 0, to: v.state.doc.length, insert: content || '' },
  });
}

function renderFilesList() {
  const list = $('#files-list');
  if (!list) return;
  const files = getFiles();
  const active = getActiveFileName();
  list.innerHTML = '';
  for (const name of Object.keys(files).sort()) {
    const item = document.createElement('div');
    item.className = 'file-item' + (name === active ? ' file-item-active' : '');
    const span = document.createElement('span');
    span.className = 'file-name';
    span.textContent = name;
    span.addEventListener('click', () => switchFile(name));
    item.appendChild(span);
    const del = document.createElement('button');
    del.className = 'file-del';
    del.textContent = '×';
    del.title = 'Delete file';
    del.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Delete "${name}"?`)) deleteFile(name); });
    item.appendChild(del);
    list.appendChild(item);
  }
}

export function initFilesView() {
  ensureDefault();
  renderFilesList();

  $('#tab-tables')?.addEventListener('click', () => {
    $('#tab-tables')?.classList.add('schema-tab-active');
    $('#tab-files')?.classList.remove('schema-tab-active');
    $('#schema-tree')?.classList.remove('hidden');
    $('#files-panel')?.classList.add('hidden');
    $('#schema-toolbar')?.classList.remove('hidden');
  });

  $('#tab-files')?.addEventListener('click', () => {
    $('#tab-files')?.classList.add('schema-tab-active');
    $('#tab-tables')?.classList.remove('schema-tab-active');
    $('#files-panel')?.classList.remove('hidden');
    $('#schema-tree')?.classList.add('hidden');
    $('#schema-toolbar')?.classList.add('hidden');
    saveCurrentContent();
    renderFilesList();
  });

  $('#btn-file-new')?.addEventListener('click', () => {
    const name = prompt('File name:', 'query.sql');
    if (name) createFile(name);
  });
}
