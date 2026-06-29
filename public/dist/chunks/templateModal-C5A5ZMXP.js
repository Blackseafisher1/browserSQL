import{b as S,f as p,h as T}from"./chunk-5CH4UP6B.js";import{a as E,b as c,c as o}from"./chunk-VF6BQQ5L.js";import{b as _,c as y,e as u,f as A,g as L,h as w,i as O,j as R,k as I,l as k,m as D,n as b,o as f}from"./chunk-PG56YYAZ.js";import{a as d}from"./chunk-XX24PUCH.js";var H=o("#template-modal-overlay"),r=o("#template-grid"),M=o("#template-modal-close"),C=[{id:"Nordwind",name:"Nordwind",desc:"8 Tabellen: Lieferant, Kunde, Versandfirma, Personal, Kategorie, Artikel, Bestellung, Bestelldetails - simuliert eine Versandhandelsdatenbank",tables:8,seed:D},{id:"test_data",name:"E-Commerce",desc:"Customers, products, orders, reviews & categories \u2014 full e-commerce schema with realistic data.",tables:6,seed:b},{id:"users",name:"Users",desc:"Simple users table with 5 rows (Ava, Noah, Mia, Liam, Zoe).",tables:1,seed:_},{id:"users_ext",name:"Users Extended",desc:"Users table with 8 rows including NULL emails.",tables:1,seed:y},{id:"shop",name:"Shop",desc:"Customers & orders \u2014 simple 2-table schema with foreign keys.",tables:2,seed:u},{id:"shop_ext",name:"Shop Extended",desc:"Customers, products & orders \u2014 3 tables with foreign keys.",tables:3,seed:A},{id:"employees",name:"Employees",desc:"Employees table with self-referential manager_id (hierarchical data).",tables:1,seed:L},{id:"inventory",name:"Inventory",desc:"10 products across Electronics, Accessories & Furniture categories.",tables:1,seed:O},{id:"normalize",name:"Normalization",desc:"Denormalized orders table \u2014 practice normalizing data.",tables:1,seed:w},{id:"dates",name:"Dates",desc:"Events table with 5 date-based rows \u2014 practice date queries.",tables:1,seed:I},{id:"march_orders",name:"March Orders",desc:"Customers & orders \u2014 practice date filtering and JOINs.",tables:2,seed:k},{id:"abitur",name:"Abitur (German School)",desc:"5 tables: students, subjects, grades, teachers \u2014 German school schema.",tables:5,seed:R},{id:"pokemon",name:"Pok\xE9mon",desc:"18 types, 20 Pok\xE9mon, weaknesses & battle system \u2014 5 tables with type matchups.",tables:5,seed:f,queries:`-- create-types
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
WHERE p1.name = ? AND p2.name = ?;`}];function U(){return new Promise((e,t)=>{let s=indexedDB.open("browsersql-vfs",1);s.onsuccess=()=>e(s.result),s.onerror=()=>t(s.error)})}async function g(e){if(!e.queries)return;let t=await U(),s={};{let n=t.transaction("files","readonly").objectStore("files").get("data");s=(await new Promise((P,h)=>{n.onsuccess=()=>P(n.result),n.onerror=()=>h(n.error)}))?.value||{}}let a=e.id+"_queries.sql";s[a]&&(s[e.id+"_queries.backup.sql"]=s[a]),s[a]=e.queries;{let i=t.transaction("files","readwrite");i.objectStore("files").put({key:"data",value:s}),await new Promise(n=>{i.oncomplete=n})}t.close()}function F(){r.innerHTML="";for(let e of C){let t=document.createElement("div");t.className="template-card",t.dataset.id=e.id,t.innerHTML=`
      <div class="template-card-header">
        <span class="template-card-name">${m(e.name)}</span>
        <span class="template-card-tables">${d("template.tables",e.tables,e.tables!==1?"n":"")}</span>
      </div>
      <div class="template-card-desc">${m(e.desc)}</div>
      <div class="template-card-footer">
        <button class="btn btn-sm btn-template-load" data-loading="false">${d("template.load")}</button>
      </div>
    `,r.appendChild(t)}}function m(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}async function v(e){if(!E.sqlite3)return;let t="template-loading-"+e.id;if(document.getElementById(t))return;let a=r.querySelector(`[data-id="${e.id}"]`)?.querySelector(".btn-template-load");a&&(a.textContent=d("template.loading"),a.disabled=!0);try{if(e.fetchUrl){if(await S(e.id)&&!confirm(d("confirm.overwriteTemplate",e.name))){a&&(a.textContent=d("template.load"),a.disabled=!1);return}let n=await fetch(e.fetchUrl);if(!n.ok)throw new Error(`HTTP ${n.status}`);let l=await n.text();E.db?.close(),E.db=new E.sqlite3.oo1.DB,c(),E.dbName=e.id,document.getElementById("db-name-input").value=e.id,E.db.exec(l,{rowMode:"object"}),await p(),localStorage.setItem("browsersql-lastdb",e.id)}else{if(!await T(e.seed))throw new Error("Failed to load template");E.dbName=e.id,document.getElementById("db-name-input").value=e.id;try{await p()}catch{}}E.renderSchema&&E.renderSchema(),W(),g(e).catch(()=>{}),N()}catch(i){B(d("error.templateFailed",e.name,i.message||String(i)))}finally{a&&(a.textContent=d("template.load"),a.disabled=!1)}}function W(){let e=document.getElementById("results-info"),t=document.getElementById("results-output");e&&(e.textContent=d("results.ready")),t&&(t.innerHTML="")}function B(e){let t=document.getElementById("results-info"),s=document.getElementById("results-output");t&&(t.textContent=d("results.error")),s&&(s.innerHTML=`<div class="results-error">${m(e)}</div>`)}function J(){F(),H.classList.remove("hidden")}function N(){H.classList.add("hidden")}M.addEventListener("click",N);r.addEventListener("click",e=>{let t=e.target.closest(".btn-template-load");if(!t)return;let s=t.closest(".template-card");if(!s)return;let a=C.find(i=>i.id===s.dataset.id);a&&v(a)});document.addEventListener("keydown",e=>{e.key==="Escape"&&N()});export{N as hideModal,J as showTemplateModal};
