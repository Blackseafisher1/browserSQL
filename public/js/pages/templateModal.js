import { $ } from '../utils.js';
import { state, resetState } from '../state.js';
import { loadTutorialDatabase, saveCurrentToLocal, loadFromLocal } from './dbManager.js';
import { t, getLang } from '../i18n.js';
import { SEED_USERS, SEED_USERS_EXT, SEED_USERS_NULL, SEED_SHOP, SEED_SHOP_EXT, SEED_EMPLOYEES, SEED_NORMALIZE, SEED_INVENTORY, SEED_ABITUR, SEED_DATES, SEED_MARCH_ORDERS, SEED_NORDWIND, SEED_TEST_SCHEMA, SEED_POKEMON } from './lessons/seeds.js';

const overlay = $('#template-modal-overlay');
const grid = $('#template-grid');
const closeBtn = $('#template-modal-close');

const TEMPLATES = [
   {
  id: 'Nordwind',
  name: 'Nordwind',
  desc: '8 tables: supplier, customer, shipper, employee, category, product, order, order details — simulates a mail-order database',
  descDe: '8 Tabellen: Lieferant, Kunde, Versandfirma, Personal, Kategorie, Artikel, Bestellung, Bestelldetails — simuliert eine Versandhandelsdatenbank',
  tables: 8,
  seed: SEED_NORDWIND
  },
  {
    id: 'test_data',
    name: 'E-Commerce',
    desc: 'Customers, products, orders, reviews & categories — full e-commerce schema with realistic data.',
    descDe: 'Kunden, Produkte, Bestellungen, Bewertungen & Kategorien — vollständiges E-Commerce-Schema mit realistischen Daten.',
    tables: 6,
    seed: SEED_TEST_SCHEMA
  },
  {
    id: 'users',
    name: 'Users',
    desc: 'Simple users table with 5 rows (Ava, Noah, Mia, Liam, Zoe).',
    descDe: 'Einfache Benutzertabelle mit 5 Zeilen (Ava, Noah, Mia, Liam, Zoe).',
    tables: 1,
    seed: SEED_USERS,
  },
  {
    id: 'users_ext',
    name: 'Users Extended',
    desc: 'Users table with 8 rows including NULL emails.',
    descDe: 'Benutzertabelle mit 8 Zeilen inkl. NULL-E-Mails.',
    tables: 1,
    seed: SEED_USERS_EXT,
  },
  {
    id: 'shop',
    name: 'Shop',
    desc: 'Customers & orders — simple 2-table schema with foreign keys.',
    descDe: 'Kunden & Bestellungen — einfaches 2-Tabellen-Schema mit Fremdschlüsseln.',
    tables: 2,
    seed: SEED_SHOP,
  },
  {
    id: 'shop_ext',
    name: 'Shop Extended',
    desc: 'Customers, products & orders — 3 tables with foreign keys.',
    descDe: 'Kunden, Produkte & Bestellungen — 3 Tabellen mit Fremdschlüsseln.',
    tables: 3,
    seed: SEED_SHOP_EXT,
  },
  {
    id: 'employees',
    name: 'Employees',
    desc: 'Employees table with self-referential manager_id (hierarchical data).',
    descDe: 'Mitarbeitertabelle mit selbstreferenzierender manager_id (hierarchische Daten).',
    tables: 1,
    seed: SEED_EMPLOYEES,
  },
  {
    id: 'inventory',
    name: 'Inventory',
    desc: '10 products across Electronics, Accessories & Furniture categories.',
    descDe: '10 Produkte aus den Kategorien Elektronik, Zubehör & Möbel.',
    tables: 1,
    seed: SEED_INVENTORY,
  },
  {
    id: 'normalize',
    name: 'Normalization',
    desc: 'Denormalized orders table — practice normalizing data.',
    descDe: 'Denormalisierte Bestellungstabelle — zum Üben der Daten-Normalisierung.',
    tables: 1,
    seed: SEED_NORMALIZE,
  },
  {
    id: 'dates',
    name: 'Dates',
    desc: 'Events table with 5 date-based rows — practice date queries.',
    descDe: 'Ereignistabelle mit 5 datumsbasierten Zeilen — für Datumsabfragen.',
    tables: 1,
    seed: SEED_DATES,
  },
  {
    id: 'march_orders',
    name: 'March Orders',
    desc: 'Customers & orders — practice date filtering and JOINs.',
    descDe: 'Kunden & Bestellungen — zum Üben von Datumsfiltern und JOINs.',
    tables: 2,
    seed: SEED_MARCH_ORDERS,
  },
  {
    id: 'abitur',
    name: 'Abitur (German School)',
    desc: '5 tables: students, subjects, grades, teachers — German school schema.',
    descDe: '5 Tabellen: Schüler, Fächer, Noten, Lehrer — deutsches Schulschema.',
    tables: 5,
    seed: SEED_ABITUR,
  },
  {
    id: 'pokemon',
    name: 'Pokémon',
    desc: '18 types, 20 Pokémon, weaknesses & battle system — 5 tables with type matchups.',
    descDe: '18 Typen, 20 Pokémon, Schwächen & Kampfsystem — 5 Tabellen mit Typ-Matchups.',
    tables: 5,
    seed: SEED_POKEMON,
    queries: `-- create-types
CREATE TABLE IF NOT EXISTS PokeTypes (id INTEGER NOT NULL PRIMARY KEY, name VARCHAR(64) NOT NULL);

-- create-pokemons
CREATE TABLE IF NOT EXISTS Pokemons (id INTEGER NOT NULL PRIMARY KEY, name VARCHAR(64) NOT NULL, id_type INTEGER NOT NULL REFERENCES PokeTypes(id));

-- create-users
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(64) NOT NULL, pw_hash TEXT);

-- create-user_pokemons
CREATE TABLE IF NOT EXISTS user_pokemons(user_id INTEGER NOT NULL, pokemon_id INTEGER NOT NULL, amount INTEGER DEFAULT 1, PRIMARY KEY (user_id, pokemon_id));

-- create-type_weaknesses
CREATE TABLE IF NOT EXISTS type_weaknesses(type_id INTEGER NOT NULL REFERENCES PokeTypes(id), weak_to_type_id INTEGER NOT NULL REFERENCES PokeTypes(id), PRIMARY KEY (type_id, weak_to_type_id));

-- select-all-types
SELECT id AS ID, name AS NAME FROM PokeTypes;

-- select-all-pokemons
SELECT p.id AS ID, p.name AS NAME, t.name AS TYPENAME FROM Pokemons p JOIN PokeTypes t ON p.id_type = t.id;

-- select-pokemon-by-id
SELECT id AS ID, name AS NAME, id_type AS IDTYPE FROM Pokemons WHERE id = ?;

-- select-pokemon-by-name
SELECT id AS ID, name AS NAME, id_type AS IDTYPE FROM Pokemons WHERE name = ?;

-- insert-type
INSERT OR IGNORE INTO PokeTypes(id, name) VALUES(?, ?);

-- insert-pokemon
INSERT OR IGNORE INTO Pokemons(id, name, id_type) VALUES(?, ?, ?);

-- insert-type-weakness
INSERT OR IGNORE INTO type_weaknesses(type_id, weak_to_type_id) VALUES(?, ?);

-- check-weakness
SELECT COUNT(*) AS CNT FROM type_weaknesses WHERE type_id = ? AND weak_to_type_id = ?;

-- pokemon-type
SELECT id_type AS IDTYPE FROM Pokemons WHERE id = ?;

-- update-pokemon-by-id
UPDATE Pokemons SET name = ?, id_type = ? WHERE id = ?;

-- delete-pokemon-by-id
DELETE FROM Pokemons WHERE id = ?;

-- insert-user
INSERT INTO users(username, pw_hash) VALUES(?, ?);

-- select-user-by-username
SELECT id AS ID, username AS USERNAME, pw_hash AS PW_HASH FROM users WHERE username = ?;

-- insert-user-pokemon
INSERT INTO user_pokemons(user_id, pokemon_id, amount) VALUES(?, ?, 1) ON CONFLICT(user_id, pokemon_id) DO UPDATE SET amount = amount + 1;

-- select-user-pokemons
SELECT p.id AS ID, p.name AS NAME, p.id_type AS IDTYPE, up.amount AS AMOUNT FROM user_pokemons up JOIN Pokemons p ON p.id = up.pokemon_id WHERE up.user_id = ?;

-- check-battle-weakness-by-id
SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS IS_WEAK FROM type_weaknesses WHERE type_id = (SELECT id_type FROM Pokemons WHERE id = ?) AND weak_to_type_id = (SELECT id_type FROM Pokemons WHERE id = ?);

-- check-battle-weakness-by-name
SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS IS_WEAK FROM type_weaknesses WHERE type_id = (SELECT id_type FROM Pokemons WHERE name = ?) AND weak_to_type_id = (SELECT id_type FROM Pokemons WHERE name = ?);

-- battle-simulate-by-id
SELECT p1.name AS POKEMON_1, p2.name AS POKEMON_2, t1.name AS TYPE_1, t2.name AS TYPE_2,
  CASE
    WHEN w1.type_id IS NOT NULL AND w2.type_id IS NULL THEN
      CASE WHEN ABS(RANDOM()) % 10 < 2 THEN p1.name || ' wins (upset!)' ELSE p2.name || ' wins' END
    WHEN w2.type_id IS NOT NULL AND w1.type_id IS NULL THEN
      CASE WHEN ABS(RANDOM()) % 10 < 2 THEN p2.name || ' wins (upset!)' ELSE p1.name || ' wins' END
    ELSE
      CASE WHEN ABS(RANDOM()) % 2 = 0 THEN p1.name || ' wins' ELSE p2.name || ' wins' END
  END AS RESULT,
  CASE
    WHEN w1.type_id IS NOT NULL AND w2.type_id IS NULL THEN p2.name || ' has type advantage'
    WHEN w2.type_id IS NOT NULL AND w1.type_id IS NULL THEN p1.name || ' has type advantage'
    ELSE 'No type advantage — even match'
  END AS ADVANTAGE
FROM Pokemons p1, Pokemons p2
JOIN PokeTypes t1 ON p1.id_type = t1.id
JOIN PokeTypes t2 ON p2.id_type = t2.id
LEFT JOIN type_weaknesses w1 ON w1.type_id = p1.id_type AND w1.weak_to_type_id = p2.id_type
LEFT JOIN type_weaknesses w2 ON w2.type_id = p2.id_type AND w2.weak_to_type_id = p1.id_type
WHERE p1.id = ? AND p2.id = ?;

-- battle-simulate-by-name
SELECT p1.name AS POKEMON_1, p2.name AS POKEMON_2, t1.name AS TYPE_1, t2.name AS TYPE_2,
  CASE
    WHEN w1.type_id IS NOT NULL AND w2.type_id IS NULL THEN
      CASE WHEN ABS(RANDOM()) % 10 < 2 THEN p1.name || ' wins (upset!)' ELSE p2.name || ' wins' END
    WHEN w2.type_id IS NOT NULL AND w1.type_id IS NULL THEN
      CASE WHEN ABS(RANDOM()) % 10 < 2 THEN p2.name || ' wins (upset!)' ELSE p1.name || ' wins' END
    ELSE
      CASE WHEN ABS(RANDOM()) % 2 = 0 THEN p1.name || ' wins' ELSE p2.name || ' wins' END
  END AS RESULT,
  CASE
    WHEN w1.type_id IS NOT NULL AND w2.type_id IS NULL THEN p2.name || ' has type advantage'
    WHEN w2.type_id IS NOT NULL AND w1.type_id IS NULL THEN p1.name || ' has type advantage'
    ELSE 'No type advantage — even match'
  END AS ADVANTAGE
FROM Pokemons p1, Pokemons p2
JOIN PokeTypes t1 ON p1.id_type = t1.id
JOIN PokeTypes t2 ON p2.id_type = t2.id
LEFT JOIN type_weaknesses w1 ON w1.type_id = p1.id_type AND w1.weak_to_type_id = p2.id_type
LEFT JOIN type_weaknesses w2 ON w2.type_id = p2.id_type AND w2.weak_to_type_id = p1.id_type
WHERE p1.name = ? AND p2.name = ?;`
  },
];

function openVFSDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('browsersql-vfs', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function ensureQueriesFile(tpl) {
  if (!tpl.queries) return;
  const db = await openVFSDB();
  let files = {};
  {
    const tx = db.transaction('files', 'readonly');
    const req = tx.objectStore('files').get('data');
    const result = await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    files = result?.value || {};
  }
  const filename = tpl.id + '_queries.sql';
  if (files[filename]) {
    files[tpl.id + '_queries.backup.sql'] = files[filename];
  }
  files[filename] = tpl.queries;
  {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put({ key: 'data', value: files });
    await new Promise((r) => { tx.oncomplete = r; });
  }
  db.close();
}

function renderTemplates() {
  grid.innerHTML = '';
  for (const tpl of TEMPLATES) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.dataset.id = tpl.id;
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-card-name">${esc(tpl.name)}</span>
        <span class="template-card-tables">${t('template.tables', tpl.tables, tpl.tables !== 1 ? 'n' : '')}</span>
      </div>
      <div class="template-card-desc">${esc(getLang() === 'de' && tpl.descDe ? tpl.descDe : tpl.desc)}</div>
      <div class="template-card-footer">
        <button class="btn btn-sm btn-template-load" data-loading="false">${t('template.load')}</button>
      </div>
    `;
    grid.appendChild(card);
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function loadTemplate(tpl) {
  if (!state.sqlite3) return;
  const loadingKey = 'template-loading-' + tpl.id;
  if (document.getElementById(loadingKey)) return;

  const card = grid.querySelector(`[data-id="${tpl.id}"]`);
  const loadBtn = card?.querySelector('.btn-template-load');
  if (loadBtn) {
    loadBtn.textContent = t('template.loading');
    loadBtn.disabled = true;
  }

  try {
    if (tpl.fetchUrl) {
      const existing = await loadFromLocal(tpl.id);
      if (existing) {
        if (!confirm(t('confirm.overwriteTemplate', tpl.name))) {
          if (loadBtn) { loadBtn.textContent = t('template.load'); loadBtn.disabled = false; }
          return;
        }
      }
      const res = await fetch(tpl.fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const sql = await res.text();
      state.db?.close();
      state.db = new state.sqlite3.oo1.DB();
      resetState();
      state.dbName = tpl.id;
      document.getElementById('db-name-input').value = tpl.id;
      state.db.exec(sql, { rowMode: 'object' });
      await saveCurrentToLocal();
      localStorage.setItem('browsersql-lastdb', tpl.id);
    } else {
      const ok = await loadTutorialDatabase(tpl.seed);
      if (!ok) throw new Error('Failed to load template');
      state.dbName = tpl.id;
      document.getElementById('db-name-input').value = tpl.id;
      try {
        await saveCurrentToLocal();
      } catch (_) {}
    }

    if (state.renderSchema) state.renderSchema();
    showReadyInResults();
    ensureQueriesFile(tpl).catch(() => {});
    hideModal();
  } catch (err) {
    showErrorInResults(t('error.templateFailed', tpl.name, err.message || String(err)));
  } finally {
    if (loadBtn) {
      loadBtn.textContent = t('template.load');
      loadBtn.disabled = false;
    }
  }
}

function showReadyInResults() {
  const el = document.getElementById('results-info');
  const out = document.getElementById('results-output');
  if (el) el.textContent = t('results.ready');
  if (out) out.innerHTML = '';
}

function showErrorInResults(msg) {
  const el = document.getElementById('results-info');
  const out = document.getElementById('results-output');
  if (el) el.textContent = t('results.error');
  if (out) out.innerHTML = `<div class="results-error">${esc(msg)}</div>`;
}

export function showTemplateModal() {
  renderTemplates();
  overlay.classList.remove('hidden');
}

export function hideModal() {
  overlay.classList.add('hidden');
}

closeBtn.addEventListener('click', hideModal);

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-template-load');
  if (!btn) return;
  const card = btn.closest('.template-card');
  if (!card) return;
  const tpl = TEMPLATES.find(t => t.id === card.dataset.id);
  if (tpl) loadTemplate(tpl);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideModal();
});
