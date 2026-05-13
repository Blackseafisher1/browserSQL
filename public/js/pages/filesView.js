import { $, esc } from '../utils.js';
import { state } from '../state.js';
import { setEditorContent, getEditorContent, setLanguage, setEditorContentFor, ensureEditor, switchEditor, showEditors } from './editorView.js';

const FILES_KEY = 'browsersql-files';
const ACTIVE_KEY = 'browsersql-active-file';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';

let activeFile = null;
let tabFiles = [];

export function getFiles() {
  try { return JSON.parse(localStorage.getItem(FILES_KEY)) || {}; } catch { return {}; }
}
function saveFiles(files) { localStorage.setItem(FILES_KEY, JSON.stringify(files)); }
export function getActiveFileName() { return localStorage.getItem(ACTIVE_KEY) || DEFAULT_FILE; }
function setActiveFileName(n) { localStorage.setItem(ACTIVE_KEY, n); activeFile = n; state.activeFileIsJS = n.endsWith('.js'); state.activeFileIsMD = n.endsWith('.md'); setLanguage(state.activeFileIsJS ? 'js' : state.activeFileIsMD ? 'md' : 'sql'); }

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

export function switchFile(name, targetTab) {
  if (name === activeFile) return;
  const files = getFiles();
  if (!(name in files)) return;
  const pos = targetTab !== undefined && targetTab !== null ? targetTab : 0;
  // Save content of current active editor
  saveCurrentFile();
  // Set new file as active
  setActiveFileName(name);
  // Ensure editor at this position exists and load content
  ensureEditor(pos);
  setEditorContentFor(pos, files[name]);
  // Update tab list
  if (tabFiles.length < 2) {
    tabFiles = [...new Set([...tabFiles, name])];
  } else {
    tabFiles[pos] = name;
  }
  switchEditor(pos);
  showEditors(tabFiles.length);
  renderTabs();
  renderTree();
}

function renderTabs() {
  const bar = document.getElementById('tab-bar');
  if (!bar) return;
  bar.innerHTML = '';
  tabFiles.forEach((name, idx) => {
    if (!name) return;
    const tab = document.createElement('div');
    tab.className = 'tab-item' + (name === activeFile ? ' active' : '');
    const label = name.includes('/') ? name.split('/').pop() : name;
    tab.innerHTML = `<span>${esc(label)}</span><span class="tab-close" data-tabclose="${name}">✕</span>`;
    tab.addEventListener('click', (e) => {
      if (e.target.closest('[data-tabclose]')) return;
      switchFile(name, idx);
    });
    bar.appendChild(tab);
  });
  bar.querySelectorAll('[data-tabclose]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = el.dataset.tabclose;
      tabFiles = tabFiles.filter(f => f !== name);
      if (tabFiles.length === 0) tabFiles.push('scratch.sql');
      if (!tabFiles.includes(activeFile)) switchFile(tabFiles[0], 0);
      renderTabs();
    });
  });
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
  if (!(name in files)) return false;
  delete files[name];
  if (Object.keys(files).length === 0) files['scratch.sql'] = '';
  saveFiles(files);
  if (activeFile === name || !(getActiveFileName() in getFiles())) {
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
  state.activeFileIsMD = name.endsWith('.md');
  setLanguage(state.activeFileIsJS ? 'js' : state.activeFileIsMD ? 'md' : 'sql');
  setEditorContent(files[name]);
  tabFiles = [name];
  showEditors(1);
  switchEditor(0);
  renderTabs();
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
    if (item) {
      const target = tabFiles.indexOf(activeFile);
      switchFile(item.dataset.file, target >= 0 ? target : 0);
    }
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
  }
}
