import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Database } from 'bun:sqlite';

const db = new Database('users.db');
const FILES_DIR = './data/files';
const STORAGE_LIMIT = 100 * 1024 * 1024; // 100 MB per user

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
    const newBytes = new TextEncoder().encode(body.content).length;
    const used = await getUserStorage(user);
    if (used + newBytes > STORAGE_LIMIT) {
      const mb = (n) => (n / 1024 / 1024).toFixed(1);
      log('POST', path, user, `STORAGE LIMIT: ${mb(used)}MB + ${mb(newBytes)}MB > ${mb(STORAGE_LIMIT)}MB`);
      return { error: `Storage limit reached (${mb(used)}MB / ${mb(STORAGE_LIMIT)}MB). Delete cloud files first.` };
    }
    await Bun.write(`${dir}/${params.name}`, body.content);
    log('POST', path, user, `saved ${params.name} (${newBytes} bytes)`);
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
    const admin = await getAdmin(headers);
    if (!admin) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const rows = db.query('SELECT username FROM users ORDER BY username').all();
    const users = [];
    for (const r of rows) {
      const dir = `${FILES_DIR}/${r.username}`;
      let fileCount = 0;
      try {
        for await (const _ of new Bun.Glob('*').scan(dir)) fileCount++;
      } catch (_) { /* dir doesn't exist yet */ }
      const storage = await getUserStorage(r.username);
      users.push({ name: r.username, files: fileCount, storage });
    }
    log('GET', path, admin, `returning ${users.length} users`);
    return users;
  })
  .get('/api/admin/files/:user', async ({ headers, params, path }) => {
    const admin = await getAdmin(headers);
    if (!admin) { log('GET', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    const dir = `${FILES_DIR}/${params.user}`;
    const files = [];
    try {
      for await (const name of new Bun.Glob('*').scan(dir)) {
        files.push({ name });
      }
    } catch (_) {}
    return { files };
  })
  .delete('/api/admin/files/:user/:name', async ({ headers, params, path }) => {
    const admin = await getAdmin(headers);
    if (!admin) { log('DELETE', path, null, 'UNAUTHORIZED'); return { error: 'Unauthorized' }; }
    await Bun.$`rm -f ${FILES_DIR}/${params.user}/${params.name}`.quiet();
    log('DELETE', path, admin, `deleted ${params.name} for user ${params.user}`);
    return { success: true };
  })
  .listen(8081);

console.log('API server running on http://localhost:8081');

async function getUserStorage(user) {
  const dir = `${FILES_DIR}/${user}`;
  let total = 0;
  try {
    for await (const name of new Bun.Glob('*').scan(dir)) {
      const stat = await Bun.file(`${dir}/${name}`).stat();
      total += stat.size;
    }
  } catch (_) {}
  return total;
}

async function getAdmin(headers) {
  const auth = headers['authorization'];
  if (!auth?.startsWith('Basic ')) return null;
  const [user, pass] = atob(auth.replace('Basic ', '')).split(':');
  if (user !== 'admin') return null;
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  return pass === adminPass ? 'admin' : null;
}
