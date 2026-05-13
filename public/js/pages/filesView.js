import { $ } from '../utils.js';
import { state } from '../state.js';
import { setEditorContent, getEditorContent, setLanguage } from './editorView.js';

const FILES_KEY = 'browsersql-files';
const ACTIVE_KEY = 'browsersql-active-file';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';

let activeFile = null;

export function getFiles() {
  try { return JSON.parse(localStorage.getItem(FILES_KEY)) || {}; } catch { return {}; }
}
function saveFiles(files) { localStorage.setItem(FILES_KEY, JSON.stringify(files)); }
export function getActiveFileName() { return localStorage.getItem(ACTIVE_KEY) || DEFAULT_FILE; }
function setActiveFileName(n) { localStorage.setItem(ACTIVE_KEY, n); activeFile = n; state.activeFileIsJS = n.endsWith('.js'); }

function ensureDefault() {
  const files = getFiles();
  if (Object.keys(files).length === 0) {
    files[DEFAULT_FILE] = DEFAULT_CONTENT;
    saveFiles(files);
    setActiveFileName(DEFAULT_FILE);
  }
  if (!(getActiveFileName() in getFiles())) setActiveFileName(DEFAULT_FILE);
}

export function saveCurrentFile() {
  const c = getEditorContent();
  if (c === null) return;
  const files = getFiles();
  files[activeFile || getActiveFileName()] = c;
  saveFiles(files);
}

export function switchFile(name) {
  if (name === activeFile) return;
  const files = getFiles();
  if (!(name in files)) return;
  saveCurrentFile();
  setActiveFileName(name);
  setEditorContent(files[name]);
  setLanguage(name.endsWith('.js') ? 'js' : 'sql');
  renderTree();
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
  delete files[name];
  saveFiles(files);
  if (activeFile === name) {
    const rem = Object.keys(files);
    switchFile(rem[0]);
  }
  renderTree();
  return true;
}

function buildTree(paths) {
  const root = {};
  for (const p of paths) {
    const parts = p.split('/');
    let node = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        node['__files__'] = node['__files__'] || [];
        node['__files__'].push(p);
      } else {
        node[part] = node[part] || {};
        node = node[part];
      }
    }
  }
  return root;
}

let expandedFolders = new Set();

export function renderTree() {
  const el = $('#files-tree');
  if (!el) return;
  const files = getFiles();
  const active = activeFile || getActiveFileName();
  const names = Object.keys(files).sort();
  if (names.length === 0) {
    el.innerHTML = '<div class="panel-empty">No files</div>';
    return;
  }
  const tree = buildTree(names);
  el.innerHTML = renderNode(tree, '', active, 0);
}

function renderNode(node, prefix, active, depth) {
  let html = '';
  const folders = Object.keys(node).filter(k => k !== '__files__').sort();
  const fileList = (node['__files__'] || []).sort();
  const pad = depth * 16;
  for (const folder of folders) {
    const fullPrefix = prefix ? prefix + '/' + folder : folder;
    const expanded = expandedFolders.has(fullPrefix);
    const arrow = expanded ? '▾' : '▸';
    html += `<div class="file-tree-item" data-folder="${fullPrefix}" style="padding-left:${12 + pad}px"><span class="folder-toggle">${arrow}</span><span class="file-icon">📁</span><span class="file-name">${folder}</span><span class="file-del" data-delfolder="${fullPrefix}">✕</span></div>`;
    if (expanded) {
      html += renderNode(node[folder], fullPrefix, active, depth + 1);
    }
  }
  for (const fp of fileList) {
    if (fp.endsWith('/.gitkeep')) continue;
    const label = prefix ? fp.split('/').pop() : fp;
    const isActive = fp === active;
    html += `<div class="file-tree-item${isActive ? ' active' : ''}" data-file="${fp}" style="padding-left:${12 + pad}px"><span class="file-icon">📄</span><span class="file-name">${label}</span><span class="file-del" data-del="${fp}">✕</span></div>`;
  }
  return html;
}

export function initFilesView() {
  ensureDefault();
  const files = getFiles();
  const name = getActiveFileName();
  activeFile = name;
  state.activeFileIsJS = name.endsWith('.js');
  setLanguage(state.activeFileIsJS ? 'js' : 'sql');
  setEditorContent(files[name]);
  renderTree();

  const tree = $('#files-tree');
  if (!tree) return;

  tree.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      const name = del.dataset.del;
      if (confirm(`Delete "${name}"?`)) deleteFile(name);
      return;
    }
    const delf = e.target.closest('[data-delfolder]');
    if (delf) {
      e.stopPropagation();
      const folder = delf.dataset.delfolder;
      if (confirm(`Delete folder "${folder}" and all files inside?`)) {
        const files = getFiles();
        for (const k of Object.keys(files)) {
          if (k === folder || k.startsWith(folder + '/')) delete files[k];
        }
        if (Object.keys(files).length === 0) files['scratch.sql'] = '';
        saveFiles(files);
        if (activeFile && !(activeFile in files)) switchFile(Object.keys(files)[0]);
        renderTree();
      }
      return;
    }
    const toggle = e.target.closest('.folder-toggle');
    if (toggle) {
      const item = toggle.closest('[data-folder]');
      if (item) {
        const f = item.dataset.folder;
        if (expandedFolders.has(f)) expandedFolders.delete(f);
        else expandedFolders.add(f);
        renderTree();
      }
      return;
    }
    const item = e.target.closest('[data-file]');
    if (item) switchFile(item.dataset.file);
  });

  document.getElementById('btn-file-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const hint = activeFile && activeFile.includes('/') ? activeFile.substring(0, activeFile.lastIndexOf('/') + 1) : '';
    const name = prompt('File name:', hint);
    if (name) createFile(name);
  });

  document.getElementById('btn-folder-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = prompt('Folder path (e.g. "myfolder" or "parent/child"):');
    if (!name) return;
    const dummyFile = name + '/.gitkeep';
    const files = getFiles();
    if (dummyFile in files) return;
    files[dummyFile] = '';
    saveFiles(files);
    const folder = name.split('/')[0];
    expandedFolders.add(folder);
    renderTree();
  });

  // Section collapse/expand via delegation
  const panel = document.getElementById('schema-panel');
  if (panel) {
    panel.addEventListener('click', (e) => {
      const hdr = e.target.closest('.section-header');
      if (!hdr) return;
      const section = hdr.dataset.section;
      const body = document.getElementById('section-' + section);
      const arrow = hdr.querySelector('.section-arrow');
      if (!body || !arrow) return;
      const key = 'browsersql-section-' + section;
      const collapsed = !body.classList.contains('collapsed');
      if (collapsed) {
        body.classList.add('collapsed');
        body.style.display = 'none';
      } else {
        body.classList.remove('collapsed');
        body.style.display = '';
      }
      localStorage.setItem(key, collapsed ? '1' : '');
      arrow.textContent = collapsed ? '▸' : '▾';
      const node = hdr.closest('.section-node');
      if (node) {
        node.style.flex = collapsed ? '0 0 auto' : '';
      }
    });
    // Init collapse state from localStorage
    document.querySelectorAll('.section-header').forEach(hdr => {
      const section = hdr.dataset.section;
      const body = document.getElementById('section-' + section);
      const arrow = hdr.querySelector('.section-arrow');
      if (body && arrow && localStorage.getItem('browsersql-section-' + section) === '1') {
        body.classList.add('collapsed');
        body.style.display = 'none';
        const node = hdr.closest('.section-node');
        if (node) node.style.flex = '0 0 auto';
        arrow.textContent = '▸';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.closest('.cm-editor')) return;
        const name = activeFile;
        if (name && !name.endsWith('.gitkeep') && confirm(`Delete "${name}"?`)) deleteFile(name);
      }
    });
  }
}
