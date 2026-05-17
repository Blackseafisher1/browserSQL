import { $ } from '../utils.js';

const API_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? 'http://localhost:8081'
  : 'https://ideaboard.site';
const TOKEN_KEY = 'browsersql-cloud-token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function parseUserFromToken() {
  const t = getToken();
  if (!t) return null;
  try { return atob(t).split(':')[0]; } catch { return null; }
}

async function api(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = 'Basic ' + token;
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function setStatus(msg) {
  const el = document.getElementById('cloud-status');
  if (el) el.textContent = msg;
}

function arrayToHex(arr) {
  return Array.from(new Uint8Array(arr)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function hexToArray(hex) {
  const len = hex.length >> 1;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  return u8;
}

function updateUI() {
  const user = parseUserFromToken();

  const hLogin = document.getElementById('btn-cloud-login');
  const hUser = document.getElementById('btn-cloud-user');
  const sLogin = document.getElementById('btn-schema-login');
  const sUser = document.getElementById('btn-schema-cloud-user');

  if (user) {
    hLogin.style.display = 'none';
    hUser.style.display = ''; hUser.textContent = user;
    if (sLogin) sLogin.style.display = 'none';
    if (sUser) { sUser.style.display = ''; sUser.textContent = user; }
  } else {
    hLogin.style.display = '';
    hUser.style.display = 'none';
    if (sLogin) sLogin.style.display = '';
    if (sUser) sUser.style.display = 'none';
  }

  document.getElementById('ops-cloud').style.display = user ? '' : 'none';
  setStatus('');
}

function showAuthModal() {
  document.getElementById('auth-modal-overlay').classList.remove('hidden');
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-error').textContent = '';
  document.getElementById('auth-title').textContent = 'Login';
  document.getElementById('auth-submit').textContent = 'Login';
  document.getElementById('auth-toggle').innerHTML = 'No account? <a href="#" id="auth-toggle-link">Register</a>';
  document.getElementById('auth-username').focus();
}

function hideAuthModal() {
  document.getElementById('auth-modal-overlay').classList.add('hidden');
}

function initAuthModal() {
  let isRegister = false;
  const overlay = document.getElementById('auth-modal-overlay');
  overlay.addEventListener('click', e => { if (e.target === overlay) hideAuthModal(); });
  document.getElementById('auth-modal-close').addEventListener('click', hideAuthModal);
  overlay.addEventListener('click', e => {
    const link = e.target.closest('#auth-toggle-link');
    if (!link) return;
    e.preventDefault();
    isRegister = !isRegister;
    document.getElementById('auth-title').textContent = isRegister ? 'Register' : 'Login';
    document.getElementById('auth-submit').textContent = isRegister ? 'Register' : 'Login';
    document.getElementById('auth-toggle').innerHTML = isRegister
      ? 'Already have an account? <a href="#" id="auth-toggle-link">Login</a>'
      : 'No account? <a href="#" id="auth-toggle-link">Register</a>';
    document.getElementById('auth-error').textContent = '';
  });
  document.getElementById('auth-submit').addEventListener('click', async () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!username || !password) { document.getElementById('auth-error').textContent = 'Fill in both fields.'; return; }
    document.getElementById('auth-error').textContent = '';
    const btn = document.getElementById('auth-submit');
    btn.disabled = true;
    try {
      if (isRegister) {
        const reg = await api('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        if (reg.error) throw new Error(reg.error);
      }
      const login = await api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (login.error) throw new Error(login.error);
      if (login.token) setToken(login.token);
      hideAuthModal();
      updateUI();
    } catch (err) { document.getElementById('auth-error').textContent = err.message || String(err); }
    btn.disabled = false;
  });
  document.getElementById('auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('auth-submit').click();
  });
}

function getBlocklist() {
  try { return JSON.parse(localStorage.getItem('browsersql-cloud-blocklist') || '[]'); } catch { return []; }
}

export async function syncToCloud() {
  console.log('[cloud] syncToCloud (DBs only)');
  const user = parseUserFromToken();
  if (!user) throw new Error('Not logged in');
  const blocklist = getBlocklist();
  console.log('[cloud] blocklist:', blocklist);

  setStatus('Uploading DBs...');
  try {
    const idb = await new Promise((resolve, reject) => {
      const req = indexedDB.open('browsersql-dbs', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('dbs', { keyPath: 'name' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = idb.transaction('dbs', 'readonly');
    const allReq = tx.objectStore('dbs').getAll();
    const allRows = await new Promise((resolve, reject) => {
      allReq.onsuccess = () => resolve(allReq.result);
      allReq.onerror = () => reject(allReq.error);
    });
    idb.close();

    let ok = 0, fail = 0, skipped = 0;
    for (const row of (allRows || [])) {
      if (!row || !row.data) { fail++; continue; }
      if (blocklist.includes(row.name)) { skipped++; continue; }
      try {
        const hex = arrayToHex(row.data);
        await api('/api/files/' + encodeURIComponent(row.name + '.db.json'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: hex }),
        });
        ok++;
      } catch (e) { console.error('[cloud] DB upload FAILED:', row.name, e); fail++; }
    }
    setStatus(`Uploaded ${ok} DBs${skipped ? ` (${skipped} blocked)` : ''}${fail ? ` (${fail} failed)` : ''}`);
  } catch (e) { console.error('[cloud] DB section failed:', e); setStatus('DB upload error: ' + e.message); }
}

export async function syncFilesToCloud() {
  console.log('[cloud] syncFilesToCloud');
  const user = parseUserFromToken();
  if (!user) throw new Error('Not logged in');

  try {
    setStatus('Zipping files...');
    const { getFiles } = await import('./filesView.js');
    const { createZipBytes } = await import('./zip.js');
    const files = await getFiles();
    const visible = Object.fromEntries(Object.entries(files).filter(([n]) => !n.startsWith('_')));
    if (Object.keys(visible).length === 0) { setStatus('No files to upload'); return; }
    const zipData = createZipBytes(visible);
    const hex = arrayToHex(zipData);
    await api('/api/files/files.zip', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: hex }),
    });
    setStatus(`Files uploaded (${Object.keys(visible).length} files)`);
  } catch (e) { console.error('[cloud] files upload failed:', e); setStatus('Files error: ' + (e.message || e)); }
}

export async function loadFromCloud() {
  console.log('[cloud] loadFromCloud START');
  const user = parseUserFromToken();
  if (!user) throw new Error('Not logged in');

  setStatus('Fetching cloud data...');
  const fileList = await api('/api/files');
  console.log('[cloud] server files:', fileList.map(f => f.name));

  const dbFiles = fileList.filter(f => f.name.endsWith('.db.json'));
  const hasFiles = fileList.some(f => f.name === 'files.zip');

  const dbContainer = document.getElementById('cloud-import-dbs');
  if (dbFiles.length === 0) {
    dbContainer.innerHTML = '<span style="color:var(--color-text-muted);font-size:var(--size-fluid-1)">No databases</span>';
  } else {
    const names = dbFiles.map(f => f.name.replace(/\.db\.json$/, ''));
    dbContainer.innerHTML = names.map(n =>
      `<label style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-1) 0;cursor:pointer">
        <input type="checkbox" class="cloud-import-cb" value="${n}" checked>
        <span>${n}</span>
      </label>`
    ).join('');
  }

  const filesCb = document.getElementById('cloud-import-files-cb');
  const preview = document.getElementById('cloud-file-preview');
  if (hasFiles) {
    filesCb.disabled = false;
    filesCb.checked = true;
    preview.textContent = '(files.zip on server)';
  } else {
    filesCb.disabled = true;
    filesCb.checked = false;
    preview.textContent = '(no files.zip on server)';
  }

  document.getElementById('cloud-import-files-keep').checked = true;
  document.getElementById('cloud-import-modal').classList.remove('hidden');
}

function hideImportModal() {
  document.getElementById('cloud-import-modal').classList.add('hidden');
}

async function doImport() {
  const dbChecked = [...document.querySelectorAll('.cloud-import-cb:checked')].map(cb => cb.value);
  const importFiles = document.getElementById('cloud-import-files-cb').checked;
  const keepLocal = document.getElementById('cloud-import-files-keep').checked;

  if (dbChecked.length === 0 && !importFiles) { hideImportModal(); setStatus('Nothing selected'); return; }

  hideImportModal();
  let parts = [];

  if (dbChecked.length > 0) {
    setStatus('Importing DBs...');
    const idb = await new Promise((resolve, reject) => {
      const req = indexedDB.open('browsersql-dbs', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('dbs', { keyPath: 'name' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    let ok = 0, fail = 0;
    for (const dbName of dbChecked) {
      try {
        const res = await api('/api/files/' + encodeURIComponent(dbName + '.db.json'));
        const data = hexToArray(res.content);
        const tx = idb.transaction('dbs', 'readwrite');
        tx.objectStore('dbs').put({ name: dbName, data, savedAt: Date.now() });
        await new Promise(r => { tx.oncomplete = r; });
        ok++;
      } catch (e) { console.error('[cloud] DB import FAILED:', dbName, e); fail++; }
    }
    idb.close();
    parts.push(`${ok} DBs${fail ? ` (${fail} failed)` : ''}`);
    const { refreshRecentDBsList } = await import('./dbManager.js');
    await refreshRecentDBsList();
  }

  if (importFiles) {
    setStatus('Importing files...');
    try {
      const res = await api('/api/files/files.zip');
      const zipBytes = hexToArray(res.content);
      const { readZipFromBytes, createZipBytes } = await import('./zip.js');
      const cloudFiles = readZipFromBytes(zipBytes);

      const { getFiles, replaceFiles, renderTree } = await import('./filesView.js');
      const local = await getFiles();

      if (keepLocal) {
        const visibleNames = Object.keys(local).filter(n => !n.startsWith('_'));
        if (visibleNames.length > 0) {
          let folder = 'old-data';
          let idx = 0;
          while (Object.keys(local).some(k => k === folder || k.startsWith(folder + '/'))) {
            idx++; folder = 'old-data' + idx;
          }
          for (const k of visibleNames) {
            local[folder + '/' + k] = local[k];
            delete local[k];
          }
        }
      }

      for (const [name, content] of Object.entries(cloudFiles)) {
        local[name] = content;
      }
      await replaceFiles(local);
      await renderTree();
      parts.push(`${Object.keys(cloudFiles).length} files`);
    } catch (e) { console.error('[cloud] files import FAILED:', e); parts.push('files failed'); }
  }

  setStatus(`Imported: ${parts.join(', ')}`);
}

async function deleteCloudFile(name) {
  if (!confirm(`Delete "${name}" from cloud?`)) return;
  try {
    await api('/api/files/' + encodeURIComponent(name), { method: 'DELETE' });
    setStatus(`Deleted ${name}`);
    showManageModal();
  } catch (e) { setStatus('Delete failed: ' + e.message); }
}

async function showManageModal() {
  const user = parseUserFromToken();
  if (!user) return;

  const list = document.getElementById('cloud-manage-list');
  const blocklist = getBlocklist();
  list.innerHTML = '<span style="color:var(--color-text-muted)">Loading...</span>';

  const modal = document.getElementById('cloud-manage-modal');
  modal.classList.remove('hidden');

  try {
    const fileList = await api('/api/files');
    list.innerHTML = '';
    if (fileList.length === 0) {
      list.innerHTML = '<span style="color:var(--color-text-muted)">No files in cloud</span>';
    } else {
      for (const f of fileList) {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:var(--space-1) 0';
        item.innerHTML = `<span style="font-size:var(--size-fluid-1)">${f.name}</span>
          <button class="btn btn-sm btn-danger" style="font-size:10px;padding:2px 6px">✕</button>`;
        item.querySelector('button').addEventListener('click', () => deleteCloudFile(f.name));
        list.appendChild(item);
      }
    }
  } catch (e) { list.innerHTML = '<span style="color:var(--color-error)">Error loading files</span>'; }

  document.getElementById('cloud-blocklist').value = blocklist.join(', ');
}

function hideManageModal() {
  document.getElementById('cloud-manage-modal').classList.add('hidden');
}

function saveBlocklist() {
  const raw = document.getElementById('cloud-blocklist').value;
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  localStorage.setItem('browsersql-cloud-blocklist', JSON.stringify(list));
  setStatus(`Blocklist saved (${list.length} DBs blocked)`);
  hideManageModal();
}

export function initCloudSync() {
  initAuthModal();
  updateUI();

  const loginHandler = showAuthModal;
  const logoutHandler = () => { if (confirm('Log out?')) { clearToken(); updateUI(); } };

  document.getElementById('btn-cloud-login').addEventListener('click', loginHandler);
  document.getElementById('btn-cloud-user').addEventListener('click', logoutHandler);
  document.getElementById('btn-schema-login')?.addEventListener('click', loginHandler);
  document.getElementById('btn-schema-cloud-user')?.addEventListener('click', logoutHandler);
  document.getElementById('btn-cloud-sync').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-cloud-sync');
    if (btn.disabled) return;
    btn.disabled = true;
    try { await syncToCloud(); } catch (e) { setStatus('Error: ' + e.message); }
    btn.disabled = false;
  });
  document.getElementById('btn-cloud-load').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-cloud-load');
    if (btn.disabled) return;
    btn.disabled = true;
    try { await loadFromCloud(); } catch (e) { setStatus('Error: ' + e.message); }
    btn.disabled = false;
  });

  document.getElementById('btn-cloud-import-go').addEventListener('click', doImport);
  document.getElementById('btn-cloud-import-cancel').addEventListener('click', hideImportModal);
  document.getElementById('cloud-modal-close').addEventListener('click', hideImportModal);

  document.getElementById('btn-cloud-files')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!getToken()) { showAuthModal(); return; }
    const btn = document.getElementById('btn-cloud-files');
    btn.disabled = true;
    try { await syncFilesToCloud(); } catch (e) { setStatus('Error: ' + e.message); }
    btn.disabled = false;
  });

  document.getElementById('btn-cloud-manage')?.addEventListener('click', (e) => {
    e.preventDefault();
    showManageModal();
  });
  document.getElementById('cloud-manage-close')?.addEventListener('click', hideManageModal);
  document.getElementById('btn-cloud-save-blocklist')?.addEventListener('click', saveBlocklist);
}
