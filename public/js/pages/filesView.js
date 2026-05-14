import { $, esc } from '../utils.js';
import { state } from '../state.js';
import { setEditorContent, getEditorContent, setLanguage, setEditorContentFor, ensureEditor, switchEditor, showEditors } from './editorView.js';

const FILES_KEY = 'browsersql-files';
const ACTIVE_KEY = 'browsersql-active-file';
const TUTORIAL_FILES_KEY = 'browsersql-tutorial-files';
const TUTORIAL_ACTIVE_KEY = 'browsersql-tutorial-active-file';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';

let activeFile = null;
let activePane = 0;
let paneTabs = [[], []]; // pane 0 = left, pane 1 = right

function getStorageKeys() {
  return state.tutorialMode
    ? { files: TUTORIAL_FILES_KEY, active: TUTORIAL_ACTIVE_KEY }
    : { files: FILES_KEY, active: ACTIVE_KEY };
}

/**
 * Returns the persisted file map from localStorage.
 * @returns {Record<string, string>}
 */
export function getFiles() {
  try { return JSON.parse(localStorage.getItem(getStorageKeys().files)) || {}; } catch { return {}; }
}
function saveFiles(files) { localStorage.setItem(getStorageKeys().files, JSON.stringify(files)); }
/**
 * Returns the active file name, falling back to the default query file.
 * @returns {string}
 */
export function getActiveFileName() { return localStorage.getItem(getStorageKeys().active) || DEFAULT_FILE; }
function setActiveFileName(n) { localStorage.setItem(getStorageKeys().active, n); activeFile = n; state.activeFileIsJS = n.endsWith('.js'); state.activeFileIsMD = n.endsWith('.md'); setLanguage(state.activeFileIsJS ? 'js' : state.activeFileIsMD ? 'md' : 'sql'); }

/**
 * Replaces the full file set with the provided files.
 * @param {Record<string, string>} files File map to persist.
 * @param {string} [activeName] Optional active file name.
 */
export function replaceFiles(files, activeName) {
  saveFiles(files);
  const names = Object.keys(files);
  const nextActive = activeName && activeName in files ? activeName : names[0] || DEFAULT_FILE;
  localStorage.setItem(getStorageKeys().active, nextActive);
  activeFile = null;
}

function ensureDefault() {
  const files = getFiles();
  if (Object.keys(files).length === 0) { files[DEFAULT_FILE] = DEFAULT_CONTENT; saveFiles(files); setActiveFileName(DEFAULT_FILE); }
  if (!(getActiveFileName() in getFiles())) setActiveFileName(DEFAULT_FILE);
}

/**
 * Saves the current editor content back into the active file entry.
 */
export function saveCurrentFile() {
  const c = getEditorContent();
  if (c === null) return;
  const files = getFiles();
  const name = activeFile || getActiveFileName();
  if (name) { files[name] = c; saveFiles(files); }
}

/**
 * Opens a file in the requested pane and refreshes the tree and tabs.
 * @param {string} name File name.
 * @param {number} [targetPane] Optional pane index.
 */
export function switchFile(name, targetPane, skipSave = false) {
  if (name === activeFile) return;
  const files = getFiles();
  if (!(name in files)) return;
  if (!skipSave) saveCurrentFile();
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
        } else if (pane === 0 && paneTabs[0].length === 0) {
          // Auto-create scratch file if left pane has no tabs
          const files = getFiles();
          files['scratch.sql'] = '';
          saveFiles(files);
          paneTabs[0] = ['scratch.sql'];
          switchFile('scratch.sql', 0);
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

function startInlineRename(oldName) {
  const el = document.querySelector(`[data-file="${escAttr(oldName)}"] .file-name`);
  if (!el) return;
  const input = document.createElement('input');
  input.className = 'file-rename-input';
  input.value = oldName;
  input.style.width = el.offsetWidth + 'px';
  el.replaceWith(input);
  input.focus();
  // Cursor before the extension if it's .sql
  const extPos = oldName.lastIndexOf('.sql');
  input.setSelectionRange(extPos > 0 ? extPos : oldName.length, extPos > 0 ? extPos : oldName.length);
  const finish = () => {
    const newName = input.value.trim();
    if (newName && newName !== oldName) {
      const files = getFiles();
      if (files[newName]) { alert('File already exists'); input.focus(); return; }
      files[newName] = files[oldName];
      delete files[oldName];
      saveFiles(files);
      // Update pane tabs
      for (let p = 0; p < 2; p++) {
        const idx = paneTabs[p].indexOf(oldName);
        if (idx >= 0) paneTabs[p][idx] = newName;
      }
      if (activeFile === oldName) { activeFile = newName; localStorage.setItem(ACTIVE_KEY, newName); }
      renderTree();
      renderTabs();
    } else if (!newName) {
      // Revert
      renderTree();
    }
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { input.blur(); }
    if (e.key === 'Escape') { renderTree(); }
  });
  input.addEventListener('blur', finish);
}

function escAttr(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML.replace(/"/g, '&quot;');
}

function openInPane(name, pane) {
  // Don't open in pane 1 if already open in pane 0
  if (pane === 1 && paneTabs[0].includes(name)) return;
  if (pane === 1) ensureEditor(1);
  if (!paneTabs[pane].includes(name)) paneTabs[pane].push(name);
  activePane = pane;
  showEditors(2);
  switchFile(name, pane);
}

/**
 * Creates a new empty file and opens it in the left editor pane.
 * @param {string} name File name.
 * @returns {boolean}
 */
export function createFile(name) {
  const files = getFiles();
  if (name in files) return false;
  files[name] = '';
  saveFiles(files);
  switchFile(name, 0);
  return true;
}

/**
 * Deletes a file and updates active tabs if needed.
 * @param {string} name File name.
 * @returns {boolean}
 */
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

/**
 * Renders the file tree into the sidebar.
 */
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

/**
 * Initializes the file explorer, default file, and sidebar interactions.
 */
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
    const del = e.target.closest('[data-del]'); const delf = e.target.closest('[data-delfolder]'); const item = e.target.closest('[data-file]'); const folder = e.target.closest('[data-folder]');
    if (del) { e.stopPropagation(); const n = del.dataset.del; if (confirm(`Delete "${n}"?`)) deleteFile(n); return; }
    if (delf) { e.stopPropagation(); const f = delf.dataset.delfolder; if (confirm(`Delete folder "${f}" and all files inside?`)) { const fls = getFiles(); for (const k of Object.keys(fls)) { if (k === f || k.startsWith(f + '/')) delete fls[k]; } if (Object.keys(fls).length === 0) fls['scratch.sql'] = ''; saveFiles(fls); if (activeFile && !(activeFile in fls)) switchFile(Object.keys(fls)[0], 0); renderTree(); } return; }
    if (folder) { e.stopPropagation(); const f = folder.dataset.folder; if (expandedFolders.has(f)) expandedFolders.delete(f); else expandedFolders.add(f); renderTree(); return; }
    if (item) { e.stopPropagation(); switchFile(item.dataset.file, 0); }
  });

  tree.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('[data-file]');
    if (!item) return;
    e.preventDefault();
    const name = item.dataset.file;
    const menu = document.getElementById('context-menu');
    menu.innerHTML = `<button class="context-menu-item" data-action="open-side" data-file="${esc(name)}">Open to the Side</button><button class="context-menu-item" data-action="rename" data-file="${esc(name)}">Rename</button>`;
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
    if (item.dataset.action === 'rename' && name) startInlineRename(name);
    document.getElementById('context-menu')?.classList.add('hidden');
  });

  document.getElementById('btn-file-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const list = document.getElementById('files-tree');
    const input = document.createElement('input');
    input.className = 'file-rename-input';
    input.value = '.sql';
    input.style.cssText = 'display:block;width:100%;padding:4px 12px;font-family:var(--font-mono);font-size:12px;border:1px solid var(--color-accent);border-radius:2px;background:var(--color-bg);color:var(--color-text);outline:none;margin:2px 0;box-sizing:border-box';
    list.insertBefore(input, list.firstChild);
    input.focus();
    input.setSelectionRange(0, 0); // cursor before .sql
    const finish = () => {
      let name = input.value.trim();
      if (!name || name === '.sql') { input.remove(); return; }
      if (!name.includes('.')) name += '.sql';
      if (getFiles()[name]) { alert('File exists'); input.focus(); return; }
      createFile(name);
      input.remove();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { input.blur(); }
      if (e.key === 'Escape') { input.remove(); }
    });
    input.addEventListener('blur', finish);
  });

  document.getElementById('btn-folder-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const list = document.getElementById('files-tree');
    const input = document.createElement('input');
    input.className = 'file-rename-input';
    input.placeholder = 'folder name';
    input.style.cssText = 'display:block;width:100%;padding:4px 12px;font-family:var(--font-mono);font-size:12px;border:1px solid var(--color-accent);border-radius:2px;background:var(--color-bg);color:var(--color-text);outline:none;margin:2px 0;box-sizing:border-box';
    list.insertBefore(input, list.firstChild);
    input.focus();
    const finish = () => {
      const name = input.value.trim();
      input.remove();
      if (!name) return;
      const files = getFiles();
      if (name + '/.gitkeep' in files) return;
      files[name + '/.gitkeep'] = ''; saveFiles(files);
      expandedFolders.add(name.split('/')[0]); renderTree();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { input.blur(); }
      if (e.key === 'Escape') { input.remove(); }
    });
    input.addEventListener('blur', finish);
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
