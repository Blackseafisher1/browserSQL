import { $, esc } from '../utils.js';
import { state } from '../state.js';
import { setEditorContent, getEditorContent, setLanguage, setEditorContentFor, ensureEditor, switchEditor, showEditors } from './editorView.js';

const FILES_KEY = 'browsersql-files';
const ACTIVE_KEY = 'browsersql-active-file';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';

let activeFile = null;
let activePane = 0;
let paneTabs = [[], []]; // pane 0 = left, pane 1 = right

export function getFiles() {
  try { return JSON.parse(localStorage.getItem(FILES_KEY)) || {}; } catch { return {}; }
}
function saveFiles(files) { localStorage.setItem(FILES_KEY, JSON.stringify(files)); }
export function getActiveFileName() { return localStorage.getItem(ACTIVE_KEY) || DEFAULT_FILE; }
function setActiveFileName(n) { localStorage.setItem(ACTIVE_KEY, n); activeFile = n; state.activeFileIsJS = n.endsWith('.js'); state.activeFileIsMD = n.endsWith('.md'); setLanguage(state.activeFileIsJS ? 'js' : state.activeFileIsMD ? 'md' : 'sql'); }

function ensureDefault() {
  const files = getFiles();
  if (Object.keys(files).length === 0) { files[DEFAULT_FILE] = DEFAULT_CONTENT; saveFiles(files); setActiveFileName(DEFAULT_FILE); }
  if (!(getActiveFileName() in getFiles())) setActiveFileName(DEFAULT_FILE);
}

export function saveCurrentFile() {
  const c = getEditorContent();
  if (c === null) return;
  const files = getFiles();
  const name = activeFile || getActiveFileName();
  if (name) { files[name] = c; saveFiles(files); }
}

export function switchFile(name, targetPane) {
  if (name === activeFile) return;
  const files = getFiles();
  if (!(name in files)) return;
  saveCurrentFile();
  setActiveFileName(name);
  const pane = targetPane !== undefined ? targetPane : activePane;
  // Ensure editor pane exists
  if (pane === 1) ensureEditor(1);
  ensureEditor(pane);
  setEditorContentFor(pane, files[name]);
  // Add to pane's tab list
  if (!paneTabs[pane].includes(name)) {
    paneTabs[pane].push(name);
    if (paneTabs[pane].length > 10) paneTabs[pane].shift();
  }
  activePane = pane;
  switchEditor(pane);
  if (pane === 1 || paneTabs[1].length > 0) showEditors(2);
  else showEditors(1);
  renderTabs();
  renderTree();
}

function renderTabs() {
  for (let p = 0; p < 2; p++) {
    const bar = document.getElementById('tab-bar-' + p);
    if (!bar) continue;
    bar.innerHTML = '';
    bar.style.display = paneTabs[p].length > 0 ? 'flex' : 'none';
    for (const name of paneTabs[p]) {
      const tab = document.createElement('div');
      tab.className = 'tab-item' + (name === activeFile && activePane === p ? ' active' : '');
      const label = name.includes('/') ? name.split('/').pop() : name;
      tab.innerHTML = `<span>${esc(label)}</span><span class="tab-close" data-tabclose="${p}:${name}">✕</span>`;
      tab.addEventListener('click', (e) => {
        if (e.target.closest('[data-tabclose]')) return;
        if (name !== activeFile || activePane !== p) {
          ensureEditor(p);
          setActiveFileName(name);
          setEditorContentFor(p, (getFiles())[name]);
          activePane = p;
          switchEditor(p);
          renderTabs();
        }
      });
      bar.appendChild(tab);
    }
    // Close button handler per tab bar
    bar.querySelectorAll('[data-tabclose]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const [paneStr, name] = el.dataset.tabclose.split(':');
        const pane = parseInt(paneStr);
        paneTabs[pane] = paneTabs[pane].filter(f => f !== name);
        if (paneTabs[pane].length > 0) {
          const last = paneTabs[pane][paneTabs[pane].length - 1];
          ensureEditor(pane);
          setActiveFileName(last);
          setEditorContentFor(pane, (getFiles())[last]);
          if (activePane === pane) switchEditor(pane);
        } else if (pane === 1) {
          showEditors(1);
          if (activePane === 1) { activePane = 0; switchEditor(0); }
        } else {
          setEditorContentFor(0, '');
        }
        renderTabs();
      });
    });
  }
}

function switchToTab(name) {
  const files = getFiles();
  if (!(name in files)) return;
  saveCurrentFile();
  setActiveFileName(name);
  ensureEditor(activePane);
  setEditorContentFor(activePane, files[name]);
  renderTabs();
  renderTree();
}

function openInPane(name, pane) {
  if (pane === 1) ensureEditor(1);
  if (!paneTabs[pane].includes(name)) paneTabs[pane].push(name);
  activePane = pane;
  showEditors(2);
  switchFile(name, pane);
}

export function createFile(name) {
  const files = getFiles();
  if (name in files) return false;
  files[name] = '';
  saveFiles(files);
  switchFile(name, 0);
  return true;
}

export function deleteFile(name) {
  const files = getFiles();
  if (!(name in files)) return false;
  delete files[name];
  if (Object.keys(files).length === 0) files['scratch.sql'] = '';
  saveFiles(files);
  for (let p = 0; p < 2; p++) paneTabs[p] = paneTabs[p].filter(f => f !== name);
  if (activeFile === name || !(getActiveFileName() in getFiles())) {
    const rem = Object.keys(files);
    switchFile(rem[0], 0);
  }
  renderTabs();
  renderTree();
  return true;
}

function buildTree(paths) {
  const root = {};
  for (const p of paths) {
    const parts = p.split('/'); let node = root;
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1) { (node['__files__'] || (node['__files__'] = [])).push(p); }
      else { node[parts[i]] = node[parts[i]] || {}; node = node[parts[i]]; }
    }
  }
  return root;
}

let expandedFolders = new Set();

export function renderTree() {
  const el = $('#files-tree');
  if (!el) return;
  const files = getFiles(); const active = activeFile || getActiveFileName(); const names = Object.keys(files).sort();
  if (names.length === 0) { el.innerHTML = '<div class="panel-empty">No files</div>'; return; }
  el.innerHTML = renderNode(buildTree(names), '', active, 0);
}

function renderNode(node, prefix, active, depth) {
  let html = '';
  const folders = Object.keys(node).filter(k => k !== '__files__').sort();
  const fileList = (node['__files__'] || []).sort();
  const pad = depth * 16;
  for (const folder of folders) {
    const fullPrefix = prefix ? prefix + '/' + folder : folder;
    const expanded = expandedFolders.has(fullPrefix);
    html += `<div class="file-tree-item" data-folder="${fullPrefix}" style="padding-left:${12 + pad}px"><span class="folder-toggle">${expanded ? '▾' : '▸'}</span><span class="file-icon">📁</span><span class="file-name">${folder}</span><span class="file-del" data-delfolder="${fullPrefix}">✕</span></div>`;
    if (expanded) html += renderNode(node[folder], fullPrefix, active, depth + 1);
  }
  for (const fp of fileList) {
    if (fp.endsWith('/.gitkeep')) continue;
    const label = prefix ? fp.split('/').pop() : fp;
    html += `<div class="file-tree-item${fp === active ? ' active' : ''}" data-file="${fp}" style="padding-left:${12 + pad}px"><span class="file-icon">📄</span><span class="file-name">${label}</span><span class="file-del" data-del="${fp}">✕</span></div>`;
  }
  return html;
}

export function initFilesView() {
  ensureDefault();
  const files = getFiles(); const name = getActiveFileName();
  activeFile = name; state.activeFileIsJS = name.endsWith('.js'); state.activeFileIsMD = name.endsWith('.md');
  setLanguage(state.activeFileIsJS ? 'js' : state.activeFileIsMD ? 'md' : 'sql');
  setEditorContent(files[name]);
  paneTabs[0] = [name];
  showEditors(1); switchEditor(0);
  renderTabs(); renderTree();

  const tree = $('#files-tree');
  if (!tree) return;

  tree.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]'); const delf = e.target.closest('[data-delfolder]'); const item = e.target.closest('[data-file]');
    if (del) { e.stopPropagation(); const n = del.dataset.del; if (confirm(`Delete "${n}"?`)) deleteFile(n); return; }
    if (delf) {
      e.stopPropagation(); const f = delf.dataset.delfolder;
      if (confirm(`Delete folder "${f}" and all files inside?`)) {
        const fls = getFiles();
        for (const k of Object.keys(fls)) { if (k === f || k.startsWith(f + '/')) delete fls[k]; }
        if (Object.keys(fls).length === 0) fls['scratch.sql'] = '';
        saveFiles(fls);
        if (activeFile && !(activeFile in fls)) switchFile(Object.keys(fls)[0], 0);
        renderTree();
      }
      return;
    }
    if (item) { e.stopPropagation(); switchFile(item.dataset.file, 0); }
  });

  tree.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('[data-file]');
    if (!item) return;
    e.preventDefault();
    const name = item.dataset.file;
    const menu = document.getElementById('context-menu');
    menu.innerHTML = `<button class="context-menu-item" data-action="open-side" data-file="${esc(name)}">Open to the Side</button>`;
    const rect = menu.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width; const maxY = window.innerHeight - rect.height;
    menu.style.left = Math.min(e.clientX, maxX) + 'px'; menu.style.top = Math.min(e.clientY, maxY) + 'px';
    menu.classList.remove('hidden');
    menu.dataset.contextFile = name;
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#context-menu')) document.getElementById('context-menu')?.classList.add('hidden');
  });

  document.getElementById('context-menu')?.addEventListener('click', (e) => {
    const item = e.target.closest('[data-action]');
    if (!item) return;
    const name = item.dataset.file || document.getElementById('context-menu')?.dataset.contextFile;
    if (item.dataset.action === 'open-side' && name) openInPane(name, 1);
    document.getElementById('context-menu')?.classList.add('hidden');
  });

  document.getElementById('btn-file-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const hint = activeFile && activeFile.includes('/') ? activeFile.substring(0, activeFile.lastIndexOf('/') + 1) : '';
    const n = prompt('File name:', hint); if (n) createFile(n);
  });

  document.getElementById('btn-folder-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = prompt('Folder path:'); if (!name) return;
    const files = getFiles();
    if (name + '/.gitkeep' in files) return;
    files[name + '/.gitkeep'] = ''; saveFiles(files);
    expandedFolders.add(name.split('/')[0]); renderTree();
  });

  // Section collapse
  const panel = document.getElementById('schema-panel');
  if (panel) {
    panel.addEventListener('click', (e) => {
      const hdr = e.target.closest('.section-header'); if (!hdr) return;
      const section = hdr.dataset.section; const body = document.getElementById('section-' + section); const arrow = hdr.querySelector('.section-arrow');
      if (!body || !arrow) return;
      const collapsed = !body.classList.contains('collapsed');
      if (collapsed) { body.classList.add('collapsed'); body.style.display = 'none'; } else { body.classList.remove('collapsed'); body.style.display = ''; }
      localStorage.setItem('browsersql-section-' + section, collapsed ? '1' : '');
      arrow.textContent = collapsed ? '▸' : '▾';
      const node = hdr.closest('.section-node');
      if (node) node.style.flex = collapsed ? '0 0 auto' : '';
    });
    document.querySelectorAll('.section-header').forEach(hdr => {
      const section = hdr.dataset.section; const body = document.getElementById('section-' + section); const arrow = hdr.querySelector('.section-arrow');
      if (body && arrow && localStorage.getItem('browsersql-section-' + section) === '1') {
        body.classList.add('collapsed'); body.style.display = 'none';
        const node = hdr.closest('.section-node'); if (node) node.style.flex = '0 0 auto';
        arrow.textContent = '▸';
      }
    });
  }
}
