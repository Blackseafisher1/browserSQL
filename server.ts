import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Database } from 'bun:sqlite';

const db = new Database('users.db');
const FILES_DIR = './data/files';

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

await Bun.$`mkdir -p ${FILES_DIR}`;

function log(method, path, user, msg) {
  console.log(`[${new Date().toISOString()}] ${method} ${path} user=${user || 'none'} ${msg}`);
}

async function hashPassword(password) {
  return await Bun.password.hash(password);
}

async function getUser(headers) {
  const authHeader = headers['authorization'];
  if (!authHeader?.startsWith('Basic ')) return null;
  const [user, pass] = atob(authHeader.replace('Basic ', '')).split(':');
  const row = db.query('SELECT password_hash FROM users WHERE username = ?').get(user);
  if (!row) return null;
  const valid = await Bun.password.verify(pass, row.password_hash);
  return valid ? user : null;
}

const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Admin</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#111;color:#eee;padding:2rem;max-width:800px;margin:auto}
h1{font-size:1.5rem;margin-bottom:1rem}#login{display:flex;gap:.5rem;margin-bottom:1rem}
input{padding:.5rem;background:#222;border:1px solid #444;color:#eee;border-radius:4px;flex:1}
button{padding:.5rem 1rem;background:#3b82f6;color:#fff;border:none;border-radius:4px;cursor:pointer}
button.danger{background:#ef4444}.user{margin-bottom:1rem;border:1px solid #333;border-radius:6px;padding:1rem}
.user h2{font-size:1.1rem;margin-bottom:.5rem}.file{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;font-size:.9rem;border-bottom:1px solid #222}
.file:last-child{border:0}.error{color:#ef4444}.loading{color:#888}.hidden{display:none}
</style></head><body>
<h1>🔧 Admin Panel</h1>
<div id="login"><input type="password" id="pw" placeholder="Admin password" onkeydown="if(event.key==='Enter')login()"><button onclick="login()">Login</button></div>
<div id="error" class="error"></div><div id="content"></div>
<script>
const API=location.origin;
function el(id){return document.getElementById(id)}
async function api(path,opts){const h={'Content-Type':'application/json'};const t=sessionStorage.getItem('admin_token');if(t)h['Authorization']='Basic '+t;const r=await fetch(API+path,{...opts,headers:{...h,...opts?.headers}});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'HTTP '+r.status)}return r.json()}
async function login(){const pw=el('pw').value;if(!pw)return;try{const r=await api('/api/admin/login',{method:'POST',body:JSON.stringify({password:pw})});sessionStorage.setItem('admin_token',r.token);el('error').textContent='';loadUsers()}catch(e){el('error').textContent=e.message}}
async function loadUsers(){el('login').classList.add('hidden');el('content').innerHTML='<div class="loading">Loading...</div>';try{const users=await api('/api/admin/users');let html='';for(const u of users){try{const{files}=await api('/api/admin/files/'+u.name);html+='<div class="user"><h2>'+u.name+' ('+files.length+' files)</h2>'+files.map(f=>'<div class="file"><span>'+f.name+'</span><button class="danger" onclick="del(\''+u.name+'\',\''+f.name+'\')">Delete</button></div>').join('')+'</div>'}catch(e){html+='<div class="user"><h2>'+u.name+'</h2><div class="error">Error loading files</div></div>'}}el('content').innerHTML=html}catch(e){el('content').innerHTML='<div class="error">'+e.message+'</div>'}}
async function del(user,name){if(!confirm('Delete '+name+' from '+user+'?'))return;try{await api('/api/admin/files/'+user+'/'+encodeURIComponent(name),{method:'DELETE'});loadUsers()}catch(e){el('error').textContent=e.message}}
if(sessionStorage.getItem('admin_token')){el('pw').value='';loadUsers()}
</script></body></html>`;

const app = new Elysia()
  .use(cors())
  .post('/api/register', async ({ body, path, request }) => {
    log('POST', path, null, `register ${body.username}`);
    const exists = db.query('SELECT 1 FROM users WHERE username = ?').get(body.username);
    if (exists) return { error: 'User exists' };
    const hash = await hashPassword(body.password);
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [body.username, hash]);
    return { success: true };
  }, {
    body: t.Object({ username: t.String(), password: t.String() })
  })
  .post('/api/login', async ({ body, path }) => {
    log('POST', path, null, `login ${body.username}`);
    const row = db.query('SELECT password_hash FROM users WHERE username = ?').get(body.username);
    if (!row) return { error: 'Invalid credentials' };
    const valid = await Bun.password.verify(body.password, row.password_hash);
    if (!valid) return { error: 'Invalid credentials' };
    return { token: btoa(`${body.username}:${body.password}`) };
  })
  .get('/api/files', async ({ headers, path }) => {
    const user = await getUser(headers);
    if (!user) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const dir = `${FILES_DIR}/${user}`;
    await Bun.$`mkdir -p ${dir}`.quiet();
    const files = [];
    for await (const name of new Bun.Glob('*').scan(dir)) {
      files.push({ name });
    }
    log('GET', path, user, `returning ${files.length} files: ${files.map(f => f.name).join(', ')}`);
    return files;
  })
  .get('/api/files/:name', async ({ headers, params, path }) => {
    const user = await getUser(headers);
    if (!user) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const filePath = `${FILES_DIR}/${user}/${params.name}`;
    if (!await Bun.file(filePath).exists()) { log('GET', path, user, `NOT FOUND ${params.name}`); return { error: 'Not found' }; }
    const content = await Bun.file(filePath).text();
    log('GET', path, user, `returning ${params.name} (${content.length} chars)`);
    return { content };
  })
  .post('/api/files/:name', async ({ headers, params, path, body }) => {
    const user = await getUser(headers);
    if (!user) { log('POST', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const dir = `${FILES_DIR}/${user}`;
    await Bun.$`mkdir -p ${dir}`.quiet();
    await Bun.write(`${dir}/${params.name}`, body.content);
    const bytes = new TextEncoder().encode(body.content).length;
    log('POST', path, user, `saved ${params.name} (${bytes} bytes)`);
    return { success: true };
  }, {
    body: t.Object({ content: t.String() })
  })
  .delete('/api/files/:name', async ({ headers, params, path }) => {
    const user = await getUser(headers);
    if (!user) { log('DELETE', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    await Bun.$`rm -f ${FILES_DIR}/${user}/${params.name}`.quiet();
    log('DELETE', path, user, `deleted ${params.name}`);
    return { success: true };
  })
  .get('/api/progress', async ({ headers, path }) => {
    const user = await getUser(headers);
    if (!user) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const filePath = `${FILES_DIR}/${user}/.progress`;
    if (!await Bun.file(filePath).exists()) return { completed: [] };
    return JSON.parse(await Bun.file(filePath).text());
  })
  .post('/api/progress', async ({ headers, body, path }) => {
    const user = await getUser(headers);
    if (!user) { log('POST', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const filePath = `${FILES_DIR}/${user}/.progress`;
    await Bun.write(filePath, JSON.stringify(body));
    log('POST', path, user, 'saved progress');
    return { success: true };
  })
  .post('/api/admin/login', async ({ body, path }) => {
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    if (body.password !== adminPass) return { error: 'Invalid admin password' };
    log('POST', path, null, 'admin login');
    return { success: true, token: btoa('admin:' + adminPass) };
  }, {
    body: t.Object({ password: t.String() })
  })
  .get('/api/admin/users', async ({ headers, path }) => {
    const user = await getAdmin(headers);
    if (!user) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const users = [];
    for await (const name of new Bun.Glob('*').scan(FILES_DIR)) {
      users.push({ name });
    }
    log('GET', path, user, `returning ${users.length} users`);
    return users;
  })
  .get('/api/admin/files/:user', async ({ headers, params, path }) => {
    const admin = await getAdmin(headers);
    if (!admin) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const dir = `${FILES_DIR}/${params.user}`;
    if (!await Bun.file(dir).exists()) return { files: [] };
    const files = [];
    for await (const name of new Bun.Glob('*').scan(dir)) {
      files.push({ name });
    }
    return { files };
  })
  .delete('/api/admin/files/:user/:name', async ({ headers, params, path }) => {
    const admin = await getAdmin(headers);
    if (!admin) { log('DELETE', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    await Bun.$`rm -f ${FILES_DIR}/${params.user}/${params.name}`.quiet();
    log('DELETE', path, admin, `deleted ${params.name} for user ${params.user}`);
    return { success: true };
  })
  .get('/admin', () => {
    return new Response(ADMIN_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  })
  .listen(8081);

console.log('API server running on http://localhost:8081');

async function getAdmin(headers) {
  const auth = headers['authorization'];
  if (!auth?.startsWith('Basic ')) return null;
  const [user, pass] = atob(auth.replace('Basic ', '')).split(':');
  if (user !== 'admin') return null;
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  return pass === adminPass ? 'admin' : null;
}
