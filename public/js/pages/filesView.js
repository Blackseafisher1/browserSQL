import { $, esc, isSafePath } from '../utils.js';
import { state } from '../state.js';
import { setEditorContent, getEditorContent, setLanguage, setEditorContentFor, ensureEditor, switchEditor, showEditors } from './editorView.js';

const ACTIVE_KEY = 'browsersql-active-file';
const TUTORIAL_ACTIVE_KEY = 'browsersql-tutorial-active-file';
const VFS_DB = 'browsersql-vfs';
const VFS_STORE = 'files';
const VFS_TUTORIAL_STORE = 'tutorial_files';
const VFS_MIGRATED_KEY = 'browsersql-vfs-migrated';
const DEFAULT_FILE = 'query.sql';
const DEFAULT_CONTENT = 'SELECT * FROM sqlite_master;';
let activeFile = null;
let activePane = 0;
let paneTabs = [[], []];
let selectedFolder = null;

function getActiveKey() {
  return state.tutorialMode ? TUTORIAL_ACTIVE_KEY : ACTIVE_KEY;
}
function getVFSStore() {
  return state.tutorialMode ? VFS_TUTORIAL_STORE : VFS_STORE;
}

function openVFSDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(VFS_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(VFS_STORE, { keyPath: 'key' });
      req.result.createObjectStore(VFS_TUTORIAL_STORE, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function vfsGet(store) {
  const db = await openVFSDB();
  const tx = db.transaction(store, 'readonly');
  const req = tx.objectStore(store).get('data');
  const result = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result?.value || {};
}

async function vfsPut(store, value) {
  const db = await openVFSDB();
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put({ key: 'data', value });
  await new Promise((r) => { tx.oncomplete = r; });
  db.close();
}

async function migrateFromLocalStorage() {
  if (localStorage.getItem(VFS_MIGRATED_KEY)) return;
  const lsKeys = [
    { ls: 'browsersql-files', store: VFS_STORE },
    { ls: 'browsersql-tutorial-files', store: VFS_TUTORIAL_STORE },
  ];
  for (const { ls, store } of lsKeys) {
    try {
      const raw = localStorage.getItem(ls);
      if (raw) {
        const data = JSON.parse(raw);
        if (Object.keys(data).length > 0) {
          await vfsPut(store, data);
        }
        localStorage.removeItem(ls);
      }
    } catch (_) {}
  }
  localStorage.setItem(VFS_MIGRATED_KEY, '1');
}

export async function getFiles() {
  return vfsGet(getVFSStore());
}

async function saveFiles(files) {
  await vfsPut(getVFSStore(), files);
}

export function getActiveFileName() {
  const saved = localStorage.getItem(getActiveKey());
  if (saved) return saved;
  return '_default_browserSQL.sql';
}

function setActiveFileName(n) {
  localStorage.setItem(getActiveKey(), n);
  activeFile = n;
  state.activeFileIsJS = false;
  state.activeFileIsMD = n.endsWith('.md');
  setLanguage(state.activeFileIsMD ? 'md' : 'sql');
}

export async function replaceFiles(files, activeName) {
  await saveFiles(files);
  const names = Object.keys(files);
  const nextActive = activeName && activeName in files ? activeName : names[0] || '_default_browserSQL.sql';
  localStorage.setItem(getActiveKey(), nextActive);
  activeFile = null;
}

async function ensureDefault() {
  const files = await getFiles();
  if (Object.keys(files).length === 0) {
    files['_default_browserSQL.sql'] = DEFAULT_CONTENT;
    await saveFiles(files);
    setActiveFileName('_default_browserSQL.sql');
  }
  const active = getActiveFileName();
  const current = await getFiles();
  if (!(active in current)) {
    const keys = Object.keys(current);
    setActiveFileName(keys[0] || '_default_browserSQL.sql');
  }
}

export async function ensureDefaultFiles() {
  const files = await getFiles();
  if (Object.keys(files).length === 0) {
    files['_default_browserSQL.sql'] = DEFAULT_CONTENT;
    await saveFiles(files);
  }
  const active = getActiveFileName();
  const current = await getFiles();
  if (!(active in current)) {
    const keys = Object.keys(current);
    setActiveFileName(keys[0] || '_default_browserSQL.sql');
  }
}

export async function saveCurrentFile() {
  const c = getEditorContent();
  if (c === null) return;
  const files = await getFiles();
  const name = activeFile || getActiveFileName();
  if (name) { files[name] = c; await saveFiles(files); }
}

export async function switchFile(name, targetPane, skipSave = false) {
  if (name === activeFile) return;
  const files = await getFiles();
  if (!(name in files)) return;
  if (!skipSave) await saveCurrentFile();
  setActiveFileName(name);
  const pane = targetPane !== undefined ? targetPane : activePane;
  if (pane === 1) ensureEditor(1);
  ensureEditor(pane);
  setEditorContentFor(pane, files[name]);
  if (!paneTabs[pane].includes(name)) {
    paneTabs[pane].push(name);
    if (paneTabs[pane].length > 10) paneTabs[pane].shift();
  }
  activePane = pane;
  switchEditor(pane);
  if (pane === 1 || paneTabs[1].length > 0) showEditors(2);
  else showEditors(1);
  renderTabs();
  await renderTree();
}

function renderTabs() {
  const allNames = paneTabs.flat();
  const nameCount = {};
  for (const n of allNames) {
    const base = n.includes('/') ? n.split('/').pop() : n;
    nameCount[base] = (nameCount[base] || 0) + 1;
  }
  for (let p = 0; p < 2; p++) {
    const bar = document.getElementById('tab-bar-' + p);
    if (!bar) continue;
    bar.innerHTML = '';
    const visible = paneTabs[p].filter(n => !n.startsWith('_'));
    bar.style.display = visible.length > 0 ? 'flex' : 'none';
    for (const name of visible) {
      const tab = document.createElement('div');
      tab.className = 'tab-item' + (name === activeFile && activePane === p ? ' active' : '');
      const base = name.includes('/') ? name.split('/').pop() : name;
      const label = nameCount[base] > 1 ? name : base;
      tab.innerHTML = `<span>${esc(label)}</span><span class="tab-close" data-tabclose="${p}:${name}">✕</span>`;
      tab.addEventListener('click', async (e) => {
        if (e.target.closest('[data-tabclose]')) return;
        if (name !== activeFile || activePane !== p) {
          ensureEditor(p);
          setActiveFileName(name);
          const files = await getFiles();
          setEditorContentFor(p, files[name]);
          activePane = p;
          switchEditor(p);
          renderTabs();
        }
      });
      bar.appendChild(tab);
    }
    bar.querySelectorAll('[data-tabclose]').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        const [paneStr, name] = el.dataset.tabclose.split(':');
        const pane = parseInt(paneStr);
        paneTabs[pane] = paneTabs[pane].filter(f => f !== name);
        if (paneTabs[pane].length > 0) {
          const last = paneTabs[pane][paneTabs[pane].length - 1];
          ensureEditor(pane);
          setActiveFileName(last);
          const files = await getFiles();
          setEditorContentFor(pane, files[last]);
          if (activePane === pane) switchEditor(pane);
        } else if (pane === 1) {
          showEditors(1);
          if (activePane === 1) { activePane = 0; switchEditor(0); }
        } else if (pane === 0 && paneTabs[0].length === 0) {
          const files = await getFiles();
          files['_default_browserSQL.sql'] = '';
          await saveFiles(files);
          paneTabs[0] = ['_default_browserSQL.sql'];
          await switchFile('_default_browserSQL.sql', 0);
        }
        renderTabs();
      });
    });
  }
}

async function switchToTab(name) {
  const files = await getFiles();
  if (!(name in files)) return;
  await saveCurrentFile();
  setActiveFileName(name);
  ensureEditor(activePane);
  setEditorContentFor(activePane, files[name]);
  renderTabs();
  await renderTree();
}

function startInlineRename(oldName) {
  const el = document.querySelector(`[data-file="${escAttr(oldName)}"] .file-name`);
  if (!el) return;
  const slashIdx = oldName.lastIndexOf('/');
  const folder = slashIdx >= 0 ? oldName.substring(0, slashIdx + 1) : '';
  const baseName = slashIdx >= 0 ? oldName.substring(slashIdx + 1) : oldName;
  const input = document.createElement('input');
  input.className = 'file-rename-input';
  input.value = baseName;
  input.style.width = el.offsetWidth + 'px';
  el.replaceWith(input);
  input.focus();
  const extPos = baseName.lastIndexOf('.sql');
  input.setSelectionRange(extPos > 0 ? extPos : baseName.length, extPos > 0 ? extPos : baseName.length);
  const finish = async () => {
    const raw = input.value.trim();
    const newName = raw ? folder + raw : '';
    if (!isSafePath(newName)) { alert('Invalid filename'); input.focus(); return; }
    if (newName && newName !== oldName) {
      const files = await getFiles();
      if (files[newName]) { alert('File already exists'); input.focus(); return; }
      files[newName] = files[oldName];
      delete files[oldName];
      await saveFiles(files);
      for (let p = 0; p < 2; p++) {
        const idx = paneTabs[p].indexOf(oldName);
        if (idx >= 0) paneTabs[p][idx] = newName;
      }
      if (activeFile === oldName) { activeFile = newName; localStorage.setItem(getActiveKey(), newName); }
      await renderTree();
      renderTabs();
    } else if (!newName) {
      await renderTree();
    }
  };
  input.addEventListener('mousedown', (ev) => ev.stopPropagation());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { finish(); }
    if (e.key === 'Escape') { renderTree(); }
  });
}

function escAttr(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML.replace(/"/g, '&quot;');
}

async function openInPane(name, pane) {
  if (pane === 1 && paneTabs[0].includes(name)) return;
  if (pane === 1) ensureEditor(1);
  if (!paneTabs[pane].includes(name)) paneTabs[pane].push(name);
  activePane = pane;
  showEditors(2);
  await switchFile(name, pane);
}

export async function createFile(name) {
  if (!isSafePath(name)) { alert('Invalid filename'); return false; }
  const files = await getFiles();
  if (name in files) return false;
  files[name] = '';
  await saveFiles(files);
  await switchFile(name, 0);
  return true;
}

export async function deleteFile(name) {
  const files = await getFiles();
  if (!(name in files)) return false;
  delete files[name];
  if (Object.keys(files).length === 0) files['_default_browserSQL.sql'] = '';
  await saveFiles(files);
  for (let p = 0; p < 2; p++) paneTabs[p] = paneTabs[p].filter(f => f !== name);
  if (activeFile === name || !(getActiveFileName() in await getFiles())) {
    const rem = Object.keys(files);
    await switchFile(rem[0], 0);
  }
  renderTabs();
  await renderTree();
  return true;
}

export async function openSingleFile(name) {
  paneTabs = [[name], []];
  activePane = 0;
  showEditors(1);
  await switchFile(name, 0, true);
  renderTabs();
}

export function buildTree(paths) {
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
let selectedFiles = new Set();
let lastClickedFile = null;

export async function renderTree() {
  const el = $('#files-tree');
  if (!el) return;
  const files = await getFiles();
  const active = activeFile || getActiveFileName();
  const names = Object.keys(files).sort();
  const visible = names.filter(n => !n.startsWith('_'));
  if (visible.length === 0) { el.innerHTML = '<div class="panel-empty">No files</div>'; return; }
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
    const sel = fullPrefix === selectedFolder ? ' selected' : '';
    html += `<div class="file-tree-item${sel}${selectedFiles.has(fullPrefix) ? ' selected' : ''}" draggable="true" data-folder="${fullPrefix}" style="padding-left:${12 + pad}px"><span class="folder-toggle">${expanded ? '▾' : '▸'}</span><span class="file-icon">📁</span><span class="file-name">${folder}</span><span class="file-del" data-delfolder="${fullPrefix}">✕</span></div>`;
    if (expanded) html += renderNode(node[folder], fullPrefix, active, depth + 1);
  }
  for (const fp of fileList) {
    if (fp.endsWith('/.gitkeep') || fp.startsWith('_')) continue;
    const label = prefix ? fp.split('/').pop() : fp;
    const multiSel = selectedFiles.has(fp) ? ' selected' : '';
    html += `<div class="file-tree-item${fp === active ? ' active' : ''}${multiSel}" draggable="true" data-file="${fp}" style="padding-left:${12 + pad}px"><span class="file-icon">📄</span><span class="file-name">${label}</span><span class="file-del" data-del="${fp}">✕</span></div>`;
  }
  return html;
}

export async function initFilesView() {
  await migrateFromLocalStorage();
  await ensureDefault();
  const files = await getFiles();
  const name = getActiveFileName();
  activeFile = name;
  state.activeFileIsJS = false;
  state.activeFileIsMD = name.endsWith('.md');
  setLanguage(state.activeFileIsMD ? 'md' : 'sql');
  setEditorContent(files[name] || '');
  paneTabs[0] = [name];
  showEditors(1);
  switchEditor(0);
  renderTabs();
  await renderTree();

  const tree = $('#files-tree');
  if (!tree) return;
  tree.setAttribute('tabindex', '0');

  tree.addEventListener('click', async (e) => {
    if (e.target.closest('.file-rename-input')) return;
    const del = e.target.closest('[data-del]');
    const delf = e.target.closest('[data-delfolder]');
    const item = e.target.closest('[data-file]');
    const folder = e.target.closest('[data-folder]');
    if (del) {
      e.stopPropagation();
      const n = del.dataset.del;
      if (selectedFiles.has(n)) {
        if (!confirm(`Delete ${selectedFiles.size} selected files?`)) return;
        const fls = await getFiles();
        for (const k of selectedFiles) delete fls[k];
        selectedFiles.clear();
        if (Object.keys(fls).length === 0) fls['_default_browserSQL.sql'] = '';
        await saveFiles(fls);
        if (activeFile && !(activeFile in fls)) await switchFile(Object.keys(fls)[0], 0);
        await renderTree();
      } else {
        if (confirm(`Delete "${n}"?`)) await deleteFile(n);
      }
      return;
    }
    if (delf) {
      e.stopPropagation(); const f = delf.dataset.delfolder;
      if (confirm(`Delete folder "${f}" and all files inside?`)) {
        const fls = await getFiles();
        for (const k of Object.keys(fls)) { if (k === f || k.startsWith(f + '/')) delete fls[k]; }
        if (Object.keys(fls).length === 0) fls['_default_browserSQL.sql'] = '';
        await saveFiles(fls);
        if (activeFile && !(activeFile in fls)) await switchFile(Object.keys(fls)[0], 0);
        await renderTree();
      }
      return;
    }
    if (folder) {
      e.stopPropagation(); const f = folder.dataset.folder; const toggle = e.target.closest('.folder-toggle');
      if (toggle) { if (expandedFolders.has(f)) expandedFolders.delete(f); else expandedFolders.add(f); await renderTree(); }
      else { selectedFolder = selectedFolder === f ? null : f; await renderTree(); }
      return;
    }
    if (item) {
      e.stopPropagation();
      const fp = item.dataset.file;
      if (e.ctrlKey || e.metaKey) {
        if (selectedFiles.has(fp)) selectedFiles.delete(fp); else selectedFiles.add(fp);
        lastClickedFile = fp;
      } else if (e.shiftKey && lastClickedFile) {
        const allItems = [...tree.querySelectorAll('[data-file]')];
        const idx1 = allItems.findIndex(el => el.dataset.file === lastClickedFile);
        const idx2 = allItems.findIndex(el => el.dataset.file === fp);
        if (idx1 !== -1 && idx2 !== -1) {
          const [start, end] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
          for (let i = start; i <= end; i++) selectedFiles.add(allItems[i].dataset.file);
        }
      } else {
        selectedFiles.clear();
        selectedFiles.add(fp);
        lastClickedFile = fp;
        selectedFolder = null;
        await switchFile(fp, 0);
      }
      await renderTree();
      return;
    }
    selectedFiles.clear();
    selectedFolder = null;
    await renderTree();
  });

  tree.addEventListener('keydown', async (e) => {
    if (e.key !== 'Delete' && e.key !== 'Backspace') return;
    if (selectedFiles.size === 0) return;
    e.preventDefault();
    if (selectedFiles.size === 1) {
      const name = [...selectedFiles][0];
      if (!confirm(`Delete "${name}"?`)) return;
      await deleteFile(name);
    } else {
      if (!confirm(`Delete ${selectedFiles.size} selected files?`)) return;
      const fls = await getFiles();
      for (const k of selectedFiles) delete fls[k];
      selectedFiles.clear();
      if (Object.keys(fls).length === 0) fls['_default_browserSQL.sql'] = '';
      await saveFiles(fls);
      if (activeFile && !(activeFile in fls)) await switchFile(Object.keys(fls)[0], 0);
      await renderTree();
    }
    selectedFiles.clear();
    await renderTree();
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

  let dragSrc = null;
  tree.addEventListener('dragstart', (e) => {
    const item = e.target.closest('[data-file], [data-folder]');
    if (!item) { e.preventDefault(); return; }
    const isFile = !!item.dataset.file;
    const isFolder = !!item.dataset.folder;
    const key = item.dataset.file || item.dataset.folder;
    if (isFile && selectedFiles.has(key)) {
      dragSrc = { files: [...selectedFiles], folders: [] };
    } else if (isFile) {
      dragSrc = { files: [key], folders: [] };
    } else if (isFolder) {
      dragSrc = { files: [], folders: [key] };
    } else {
      e.preventDefault(); return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  });
  tree.addEventListener('dragenter', (e) => {
    const folder = e.target.closest('[data-folder]');
    if (folder) folder.classList.add('drag-over');
  });
  tree.addEventListener('dragleave', (e) => {
    const folder = e.target.closest('[data-folder]');
    if (folder && !folder.contains(e.relatedTarget)) folder.classList.remove('drag-over');
  });
  tree.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
  tree.addEventListener('drop', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    if (!dragSrc) return;
    const targetFolder = e.target.closest('[data-folder]');
    const targetFolderPath = targetFolder ? targetFolder.dataset.folder : '';
    const files = await getFiles();

    if (dragSrc.folders.length) {
      for (const srcFolder of dragSrc.folders) {
        const folderName = srcFolder.split('/').pop();
        const destPrefix = targetFolderPath ? `${targetFolderPath}/${folderName}` : folderName;
        if (destPrefix === srcFolder || destPrefix.startsWith(srcFolder + '/')) continue;
        const toMove = Object.keys(files).filter(k => k === srcFolder || k.startsWith(srcFolder + '/'));
        let conflict = false;
        for (const k of toMove) {
          const newKey = destPrefix + k.slice(srcFolder.length);
          if (files[newKey] && k !== srcFolder) { conflict = true; break; }
        }
        if (conflict) continue;
        for (const k of toMove) {
          const newKey = destPrefix + k.slice(srcFolder.length);
          files[newKey] = files[k];
          delete files[k];
          if (activeFile === k) activeFile = newKey;
          for (let p = 0; p < 2; p++) {
            const idx = paneTabs[p].indexOf(k);
            if (idx !== -1) paneTabs[p][idx] = newKey;
          }
        }
      }
    } else {
      for (const src of dragSrc.files) {
        const name = src.split('/').pop();
        const dest = targetFolderPath ? `${targetFolderPath}/${name}` : name;
        if (dest === src) continue;
        if (files[dest]) continue;
        files[dest] = files[src];
        delete files[src];
        if (activeFile === src) { activeFile = dest; setActiveFileName(dest); }
        for (let p = 0; p < 2; p++) {
          const idx = paneTabs[p].indexOf(src);
          if (idx !== -1) paneTabs[p][idx] = dest;
        }
      }
    }
    if (Object.keys(files).length === 0) files['_default_browserSQL.sql'] = '';
    await saveFiles(files);
    if (targetFolderPath) expandedFolders.add(targetFolderPath);
    selectedFiles.clear();
    await renderTree();
    renderTabs();
    dragSrc = null;
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#context-menu')) document.getElementById('context-menu')?.classList.add('hidden');
    if (!e.target.closest('#files-tree') && !e.target.closest('.file-tree-item')) {
      if (selectedFiles.size) { selectedFiles.clear(); renderTree(); }
    }
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
    if (selectedFolder) {
      const folderEl = list.querySelector(`[data-folder="${escAttr(selectedFolder)}"]`);
      if (folderEl) folderEl.after(input);
      else list.insertBefore(input, list.firstChild);
    } else {
      list.insertBefore(input, list.firstChild);
    }
    input.focus();
    input.setSelectionRange(0, 0);
    input.addEventListener('mousedown', (ev) => ev.stopPropagation());
    const finish = async () => {
      if (!input.parentNode) return;
      let name = input.value.trim();
      if (!name || name === '.sql') { input.remove(); return; }
      if (!name.includes('.')) name += '.sql';
      if (selectedFolder) name = selectedFolder + '/' + name;
      const files = await getFiles();
      if (files[name]) { alert('File exists'); input.focus(); return; }
      await createFile(name);
      if (selectedFolder) expandedFolders.add(selectedFolder);
      input.remove();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { finish(); }
      if (e.key === 'Escape') { input.remove(); }
    });
  });

  document.getElementById('btn-folder-new')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const list = document.getElementById('files-tree');
    const input = document.createElement('input');
    input.className = 'file-rename-input';
    input.placeholder = 'folder name';
    input.style.cssText = 'display:block;width:100%;padding:4px 12px;font-family:var(--font-mono);font-size:12px;border:1px solid var(--color-accent);border-radius:2px;background:var(--color-bg);color:var(--color-text);outline:none;margin:2px 0;box-sizing:border-box';
    if (selectedFolder) {
      const folderEl = list.querySelector(`[data-folder="${escAttr(selectedFolder)}"]`);
      if (folderEl) folderEl.after(input);
      else list.insertBefore(input, list.firstChild);
    } else {
      list.insertBefore(input, list.firstChild);
    }
    input.focus();
    input.addEventListener('mousedown', (ev) => ev.stopPropagation());
    const finish = async () => {
      if (!input.parentNode) return;
      const raw = input.value.trim();
      input.remove();
      if (!raw) return;
      const name = selectedFolder ? selectedFolder + '/' + raw : raw;
      const files = await getFiles();
      const marker = name + '/.gitkeep';
      if (marker in files) return;
      files[marker] = '';
      await saveFiles(files);
      expandedFolders.add(name);
      if (selectedFolder) expandedFolders.add(selectedFolder);
      await renderTree();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { finish(); }
      if (e.key === 'Escape') { input.remove(); }
    });
  });

  const panel = document.getElementById('schema-panel');
  if (panel) {
    panel.addEventListener('click', (e) => {
      const hdr = e.target.closest('.section-header'); if (!hdr) return;
      if (e.target.closest('button, input, select, textarea, .section-add-btn')) return;
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

  document.getElementById('btn-export-files')?.addEventListener('click', async () => {
    const { downloadAsZip } = await import('./zip.js');
    downloadAsZip(await getFiles(), 'browsersql-files');
  });

  const zipInput = document.createElement('input');
  zipInput.type = 'file';
  zipInput.accept = '.zip';
  zipInput.style.display = 'none';
  document.body.appendChild(zipInput);
  document.getElementById('btn-import-files')?.addEventListener('click', () => zipInput.click());
  zipInput.addEventListener('change', async () => {
    const file = zipInput.files?.[0];
    if (!file) return;
    zipInput.value = '';
    const { readZip } = await import('./zip.js');
    let imported;
    try { imported = await readZip(file); } catch { alert('Invalid ZIP file.'); return; }
    if (!imported || !Object.keys(imported).length) { alert('No files found in archive.'); return; }
    const existing = await getFiles();
    const visible = Object.keys(existing).filter(n => !n.startsWith('_'));
    if (visible.length > 0) {
      let folder = 'old-files';
      let idx = 0;
      while (Object.keys(existing).some(k => k === folder || k.startsWith(folder + '/'))) {
        idx++;
        folder = 'old-files' + idx;
      }
      for (const k of Object.keys(existing)) {
        if (k.startsWith('_')) continue;
        existing[folder + '/' + k] = existing[k];
        delete existing[k];
      }
    }
    const merged = { ...existing, ...imported };
    await saveFiles(merged);
    await renderTree();
    renderTabs();
    if (!(getActiveFileName() in merged)) await switchFile(Object.keys(merged)[0], 0);
  });
}
