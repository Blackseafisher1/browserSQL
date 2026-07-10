import{b as u,f as m,h as T}from"./chunk-QH7HOGIK.js";import{a as d,b as N,c as E}from"./chunk-VF6BQQ5L.js";import{b as _,c as y,e as A,f as L,g as w,h as O,i as R,j as k,k as D,l as I,m as b,n as h,o as f}from"./chunk-PG56YYAZ.js";import{a as o,b as S}from"./chunk-SSN5BD5R.js";var P=E("#template-modal-overlay"),r=E("#template-grid"),U=E("#template-modal-close"),H=[{id:"Nordwind",name:"Nordwind",desc:"8 tables: supplier, customer, shipper, employee, category, product, order, order details \u2014 simulates a mail-order database",descDe:"8 Tabellen: Lieferant, Kunde, Versandfirma, Personal, Kategorie, Artikel, Bestellung, Bestelldetails \u2014 simuliert eine Versandhandelsdatenbank",tables:8,seed:b},{id:"test_data",name:"E-Commerce",desc:"Customers, products, orders, reviews & categories \u2014 full e-commerce schema with realistic data.",descDe:"Kunden, Produkte, Bestellungen, Bewertungen & Kategorien \u2014 vollst\xE4ndiges E-Commerce-Schema mit realistischen Daten.",tables:6,seed:h},{id:"users",name:"Users",desc:"Simple users table with 5 rows (Ava, Noah, Mia, Liam, Zoe).",descDe:"Einfache Benutzertabelle mit 5 Zeilen (Ava, Noah, Mia, Liam, Zoe).",tables:1,seed:_},{id:"users_ext",name:"Users Extended",desc:"Users table with 8 rows including NULL emails.",descDe:"Benutzertabelle mit 8 Zeilen inkl. NULL-E-Mails.",tables:1,seed:y},{id:"shop",name:"Shop",desc:"Customers & orders \u2014 simple 2-table schema with foreign keys.",descDe:"Kunden & Bestellungen \u2014 einfaches 2-Tabellen-Schema mit Fremdschl\xFCsseln.",tables:2,seed:A},{id:"shop_ext",name:"Shop Extended",desc:"Customers, products & orders \u2014 3 tables with foreign keys.",descDe:"Kunden, Produkte & Bestellungen \u2014 3 Tabellen mit Fremdschl\xFCsseln.",tables:3,seed:L},{id:"employees",name:"Employees",desc:"Employees table with self-referential manager_id (hierarchical data).",descDe:"Mitarbeitertabelle mit selbstreferenzierender manager_id (hierarchische Daten).",tables:1,seed:w},{id:"inventory",name:"Inventory",desc:"10 products across Electronics, Accessories & Furniture categories.",descDe:"10 Produkte aus den Kategorien Elektronik, Zubeh\xF6r & M\xF6bel.",tables:1,seed:R},{id:"normalize",name:"Normalization",desc:"Denormalized orders table \u2014 practice normalizing data.",descDe:"Denormalisierte Bestellungstabelle \u2014 zum \xDCben der Daten-Normalisierung.",tables:1,seed:O},{id:"dates",name:"Dates",desc:"Events table with 5 date-based rows \u2014 practice date queries.",descDe:"Ereignistabelle mit 5 datumsbasierten Zeilen \u2014 f\xFCr Datumsabfragen.",tables:1,seed:D},{id:"march_orders",name:"March Orders",desc:"Customers & orders \u2014 practice date filtering and JOINs.",descDe:"Kunden & Bestellungen \u2014 zum \xDCben von Datumsfiltern und JOINs.",tables:2,seed:I},{id:"abitur",name:"Abitur (German School)",desc:"5 tables: students, subjects, grades, teachers \u2014 German school schema.",descDe:"5 Tabellen: Sch\xFCler, F\xE4cher, Noten, Lehrer \u2014 deutsches Schulschema.",tables:5,seed:k},{id:"pokemon",name:"Pok\xE9mon",desc:"18 types, 20 Pok\xE9mon, weaknesses & battle system \u2014 5 tables with type matchups.",descDe:"18 Typen, 20 Pok\xE9mon, Schw\xE4chen & Kampfsystem \u2014 5 Tabellen mit Typ-Matchups.",tables:5,seed:f,queries:`-- create-types
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
    ELSE 'No type advantage \u2014 even match'
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
    ELSE 'No type advantage \u2014 even match'
  END AS ADVANTAGE
FROM Pokemons p1, Pokemons p2
JOIN PokeTypes t1 ON p1.id_type = t1.id
JOIN PokeTypes t2 ON p2.id_type = t2.id
LEFT JOIN type_weaknesses w1 ON w1.type_id = p1.id_type AND w1.weak_to_type_id = p2.id_type
LEFT JOIN type_weaknesses w2 ON w2.type_id = p2.id_type AND w2.weak_to_type_id = p1.id_type
WHERE p1.name = ? AND p2.name = ?;`}];function g(){return new Promise((e,t)=>{let s=indexedDB.open("browsersql-vfs",1);s.onsuccess=()=>e(s.result),s.onerror=()=>t(s.error)})}async function F(e){if(!e.queries)return;let t=await g(),s={};{let n=t.transaction("files","readonly").objectStore("files").get("data");s=(await new Promise((C,M)=>{n.onsuccess=()=>C(n.result),n.onerror=()=>M(n.error)}))?.value||{}}let a=e.id+"_queries.sql";s[a]&&(s[e.id+"_queries.backup.sql"]=s[a]),s[a]=e.queries;{let i=t.transaction("files","readwrite");i.objectStore("files").put({key:"data",value:s}),await new Promise(n=>{i.oncomplete=n})}t.close()}function v(){r.innerHTML="";for(let e of H){let t=document.createElement("div");t.className="template-card",t.dataset.id=e.id,t.innerHTML=`
      <div class="template-card-header">
        <span class="template-card-name">${l(e.name)}</span>
        <span class="template-card-tables">${o("template.tables",e.tables,e.tables!==1?"n":"")}</span>
      </div>
      <div class="template-card-desc">${l(S()==="de"&&e.descDe?e.descDe:e.desc)}</div>
      <div class="template-card-footer">
        <button class="btn btn-sm btn-template-load" data-loading="false">${o("template.load")}</button>
      </div>
    `,r.appendChild(t)}}function l(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}async function W(e){if(!d.sqlite3)return;let t="template-loading-"+e.id;if(document.getElementById(t))return;let a=r.querySelector(`[data-id="${e.id}"]`)?.querySelector(".btn-template-load");a&&(a.textContent=o("template.loading"),a.disabled=!0);try{if(e.fetchUrl){if(await u(e.id)&&!confirm(o("confirm.overwriteTemplate",e.name))){a&&(a.textContent=o("template.load"),a.disabled=!1);return}let n=await fetch(e.fetchUrl);if(!n.ok)throw new Error(`HTTP ${n.status}`);let c=await n.text();d.db?.close(),d.db=new d.sqlite3.oo1.DB,N(),d.dbName=e.id,document.getElementById("db-name-input").value=e.id,d.db.exec(c,{rowMode:"object"}),await m(),localStorage.setItem("browsersql-lastdb",e.id)}else{if(!await T(e.seed))throw new Error("Failed to load template");d.dbName=e.id,document.getElementById("db-name-input").value=e.id;try{await m()}catch{}}d.renderSchema&&d.renderSchema(),B(),F(e).catch(()=>{}),p()}catch(i){K(o("error.templateFailed",e.name,i.message||String(i)))}finally{a&&(a.textContent=o("template.load"),a.disabled=!1)}}function B(){let e=document.getElementById("results-info"),t=document.getElementById("results-output");e&&(e.textContent=o("results.ready")),t&&(t.innerHTML="")}function K(e){let t=document.getElementById("results-info"),s=document.getElementById("results-output");t&&(t.textContent=o("results.error")),s&&(s.innerHTML=`<div class="results-error">${l(e)}</div>`)}function z(){v(),P.classList.remove("hidden")}function p(){P.classList.add("hidden")}U.addEventListener("click",p);r.addEventListener("click",e=>{let t=e.target.closest(".btn-template-load");if(!t)return;let s=t.closest(".template-card");if(!s)return;let a=H.find(i=>i.id===s.dataset.id);a&&W(a)});document.addEventListener("keydown",e=>{e.key==="Escape"&&p()});export{p as hideModal,z as showTemplateModal};
