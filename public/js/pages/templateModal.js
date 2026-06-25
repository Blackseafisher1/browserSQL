import { $ } from '../utils.js';
import { state, resetState } from '../state.js';
import { loadTutorialDatabase, saveCurrentToLocal, loadFromLocal } from './dbManager.js';
import { SEED_USERS, SEED_USERS_EXT, SEED_USERS_NULL, SEED_SHOP, SEED_SHOP_EXT, SEED_EMPLOYEES, SEED_NORMALIZE, SEED_INVENTORY, SEED_ABITUR, SEED_DATES, SEED_MARCH_ORDERS, SEED_NORDWIND, SEED_TEST_SCHEMA } from './lessons/seeds.js';

const overlay = $('#template-modal-overlay');
const grid = $('#template-grid');
const closeBtn = $('#template-modal-close');

const TEMPLATES = [
   {
  id: 'Nordwind',
  name: 'Nordwind',
  desc: '8 Tabellen: Lieferant, Kunde, Versandfirma, Personal, Kategorie, Artikel, Bestellung, Bestelldetails - simuliert eine Versandhandelsdatenbank',
  tables: 8,
  seed: SEED_NORDWIND
  },
  {
    id: 'test_data',
    name: 'E-Commerce',
    desc: 'Customers, products, orders, reviews & categories — full e-commerce schema with realistic data.',
    tables: 6,
    seed: SEED_TEST_SCHEMA
  },
  {
    id: 'users',
    name: 'Users',
    desc: 'Simple users table with 5 rows (Ava, Noah, Mia, Liam, Zoe).',
    tables: 1,
    seed: SEED_USERS,
  },
  {
    id: 'users_ext',
    name: 'Users Extended',
    desc: 'Users table with 8 rows including NULL emails.',
    tables: 1,
    seed: SEED_USERS_EXT,
  },
  {
    id: 'shop',
    name: 'Shop',
    desc: 'Customers & orders — simple 2-table schema with foreign keys.',
    tables: 2,
    seed: SEED_SHOP,
  },
  {
    id: 'shop_ext',
    name: 'Shop Extended',
    desc: 'Customers, products & orders — 3 tables with foreign keys.',
    tables: 3,
    seed: SEED_SHOP_EXT,
  },
  {
    id: 'employees',
    name: 'Employees',
    desc: 'Employees table with self-referential manager_id (hierarchical data).',
    tables: 1,
    seed: SEED_EMPLOYEES,
  },
  {
    id: 'inventory',
    name: 'Inventory',
    desc: '10 products across Electronics, Accessories & Furniture categories.',
    tables: 1,
    seed: SEED_INVENTORY,
  },
  {
    id: 'normalize',
    name: 'Normalization',
    desc: 'Denormalized orders table — practice normalizing data.',
    tables: 1,
    seed: SEED_NORMALIZE,
  },
  {
    id: 'dates',
    name: 'Dates',
    desc: 'Events table with 5 date-based rows — practice date queries.',
    tables: 1,
    seed: SEED_DATES,
  },
  {
    id: 'march_orders',
    name: 'March Orders',
    desc: 'Customers & orders — practice date filtering and JOINs.',
    tables: 2,
    seed: SEED_MARCH_ORDERS,
  },
  {
    id: 'abitur',
    name: 'Abitur (German School)',
    desc: '5 tables: students, subjects, grades, teachers — German school schema.',
    tables: 5,
    seed: SEED_ABITUR,
  },
];

function renderTemplates() {
  grid.innerHTML = '';
  for (const tpl of TEMPLATES) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.dataset.id = tpl.id;
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-card-name">${esc(tpl.name)}</span>
        <span class="template-card-tables">${tpl.tables} table${tpl.tables !== 1 ? 's' : ''}</span>
      </div>
      <div class="template-card-desc">${esc(tpl.desc)}</div>
      <div class="template-card-footer">
        <button class="btn btn-sm btn-template-load" data-loading="false">Load</button>
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
    loadBtn.textContent = 'Loading...';
    loadBtn.disabled = true;
  }

  try {
    if (tpl.fetchUrl) {
      const existing = await loadFromLocal(tpl.id);
      if (existing) {
        if (!confirm(`You already have a "${tpl.name}" database. Overwrite it?`)) {
          if (loadBtn) { loadBtn.textContent = 'Load'; loadBtn.disabled = false; }
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
    hideModal();
  } catch (err) {
    showErrorInResults(`Template "${tpl.name}" failed: ${err.message || String(err)}`);
  } finally {
    if (loadBtn) {
      loadBtn.textContent = 'Load';
      loadBtn.disabled = false;
    }
  }
}

function showReadyInResults() {
  const el = document.getElementById('results-info');
  const out = document.getElementById('results-output');
  if (el) el.textContent = 'Ready';
  if (out) out.innerHTML = '';
}

function showErrorInResults(msg) {
  const el = document.getElementById('results-info');
  const out = document.getElementById('results-output');
  if (el) el.textContent = 'Error';
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
