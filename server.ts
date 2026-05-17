import { Elysia, t } from 'elysia';
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
  .post('/api/register', async ({ body }) => {
    const exists = db.query('SELECT 1 FROM users WHERE username = ?').get(body.username);
    if (exists) return { error: 'User exists' };
    const hash = await hashPassword(body.password);
    db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [body.username, hash]);
    return { success: true };
  }, {
    body: t.Object({ username: t.String(), password: t.String() })
  })
  .post('/api/login', async ({ body }) => {
    const row = db.query('SELECT password_hash FROM users WHERE username = ?').get(body.username);
    if (!row) return { error: 'Invalid credentials' };
    const valid = await Bun.password.verify(body.password, row.password_hash);
    if (!valid) return { error: 'Invalid credentials' };
    return { token: btoa(`${body.username}:${body.password}`) };
  })
  .get('/api/files', async ({ headers }) => {
    const user = await getUser(headers);
    if (!user) return { error: 'Unauthorized' };
    const dir = `${FILES_DIR}/${user}`;
    await Bun.$`mkdir -p ${dir}`.quiet();
    const files = [];
    for await (const name of new Bun.Glob('*').scan(dir)) {
      files.push({ name });
    }
    return files;
  })
  .get('/api/files/:name', async ({ headers, params }) => {
    const user = await getUser(headers);
    if (!user) return { error: 'Unauthorized' };
    const path = `${FILES_DIR}/${user}/${params.name}`;
    if (!await Bun.file(path).exists()) return { error: 'Not found' };
    return { content: await Bun.file(path).text() };
  })
  .post('/api/files/:name', async ({ headers, params, body }) => {
    const user = await getUser(headers);
    if (!user) return { error: 'Unauthorized' };
    const dir = `${FILES_DIR}/${user}`;
    await Bun.$`mkdir -p ${dir}`.quiet();
    await Bun.write(`${dir}/${params.name}`, body.content);
    return { success: true };
  }, {
    body: t.Object({ content: t.String() })
  })
  .delete('/api/files/:name', async ({ headers, params }) => {
    const user = await getUser(headers);
    if (!user) return { error: 'Unauthorized' };
    await Bun.$`rm -f ${FILES_DIR}/${user}/${params.name}`.quiet();
    return { success: true };
  })
  .get('/api/progress', async ({ headers }) => {
    const user = await getUser(headers);
    if (!user) return { error: 'Unauthorized' };
    const path = `${FILES_DIR}/${user}/.progress`;
    if (!await Bun.file(path).exists()) return { completed: [] };
    return JSON.parse(await Bun.file(path).text());
  })
  .post('/api/progress', async ({ headers, body }) => {
    const user = await getUser(headers);
    if (!user) return { error: 'Unauthorized' };
    const path = `${FILES_DIR}/${user}/.progress`;
    await Bun.write(path, JSON.stringify(body));
    return { success: true };
  })
  .listen(8081);

console.log('API server running on http://localhost:8081');
