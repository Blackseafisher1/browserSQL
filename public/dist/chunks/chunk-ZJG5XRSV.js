import{a,b as f,c as i}from"./chunk-24AH5XRM.js";var E="browsersql-lastdb",w=i("#file-input"),B=i("#btn-new-db"),O=i("#btn-open-db"),M=i("#btn-export-db"),X=i("#btn-delete-db"),U=i("#btn-recent-dbs"),d=i("#recent-dbs-dropdown"),m=i("#db-name-input"),$="browsersql-dbs";function L(){return new Promise((e,t)=>{let n=indexedDB.open($,1);n.onupgradeneeded=()=>{n.result.createObjectStore("dbs",{keyPath:"name"}).createIndex("savedAt","savedAt")},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function g(e,t){let n=await L(),o=n.transaction("dbs","readwrite");o.objectStore("dbs").put({name:e,data:t,savedAt:Date.now()}),await new Promise(r=>{o.oncomplete=r}),n.close()}async function h(e){let t=await L(),o=t.transaction("dbs","readonly").objectStore("dbs").get(e),r=await new Promise((s,c)=>{o.onsuccess=()=>s(o.result),o.onerror=()=>c(o.error)});return t.close(),r?.data}async function k(){let e=await L(),n=e.transaction("dbs","readonly").objectStore("dbs").getAll(),o=await new Promise((r,s)=>{n.onsuccess=()=>r(n.result),n.onerror=()=>s(n.error)});return e.close(),(o||[]).sort((r,s)=>s.savedAt-r.savedAt)}async function T(e){let t=await L(),n=t.transaction("dbs","readwrite");n.objectStore("dbs").delete(e),await new Promise(o=>{n.oncomplete=o}),t.close()}function z(){B.addEventListener("click",v),O.addEventListener("click",()=>w.click()),M.addEventListener("click",I),U.addEventListener("click",u),w.addEventListener("change",Y),document.addEventListener("keydown",P),document.addEventListener("click",e=>{e.target.closest(".recent-wrap")||d.classList.add("hidden")}),d.addEventListener("click",H),document.getElementById("context-menu")?.addEventListener("click",e=>{let t=e.target.closest("[data-action]");if(!t)return;let n=t.dataset.db||document.getElementById("context-menu")?.dataset.contextDb;if(n){if(document.getElementById("context-menu")?.classList.add("hidden"),t.dataset.action==="rename-db"){let o=prompt("Rename database:",n);if(!o||o===n)return;(async()=>{try{let r=await h(n);if(!r){alert("Database not found.");return}await g(o,r),await T(n),await u(),d.classList.add("hidden")}catch(r){alert("Rename failed: "+(r.message||r))}})()}if(t.dataset.action==="delete-db"){if(!confirm(`Delete "${n}" from local storage? This cannot be undone.`))return;(async()=>{try{await T(n),await u(),d.classList.add("hidden")}catch(o){alert("Delete failed: "+(o.message||o))}})()}}}),m.addEventListener("change",()=>{a.dbName=m.value||"untitled"})}async function V(){try{let e=await F();return a.sqlite3=e,a.db=new e.oo1.DB,m.value=a.dbName,!0}catch(e){return console.error("SQLite init failed:",e),!1}}var x="https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/",D="browsersql-tutorial",C=`
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  age INTEGER NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO users (id, name, city, age) VALUES
  (1, 'Ava', 'Berlin', 28),
  (2, 'Noah', 'Hamburg', 22),
  (3, 'Mia', 'Munich', 31),
  (4, 'Liam', 'Cologne', 19);

INSERT INTO products (id, name, price) VALUES
  (1, 'Keyboard', 79.90),
  (2, 'Mouse', 29.50),
  (3, 'Monitor', 219.00);

INSERT INTO orders (id, user_id, product_id, quantity, created_at) VALUES
  (1, 1, 1, 1, '2026-05-01'),
  (2, 1, 3, 2, '2026-05-02'),
  (3, 2, 2, 1, '2026-05-02'),
  (4, 3, 1, 1, '2026-05-03'),
  (5, 4, 2, 3, '2026-05-04');
`;async function F(){return(await import(x+"index.mjs")).default({locateFile:t=>x+t})}async function v(){if(!a.sqlite3)return;let e=prompt("Database name:","untitled");if(e){try{a.db?.close()}catch{}a.db=new a.sqlite3.oo1.DB,f(),R(e.trim()),a.renderSchema&&a.renderSchema(),y(),localStorage.removeItem(E),await _(),await u()}}function R(e){a.dbName=e,m.value=e}function j(e){let t=new a.sqlite3.oo1.DB,n=a.sqlite3,o=n.capi,r=n.wasm.heap8(),s=o.sqlite3_malloc(5),c=o.sqlite3_malloc(e.length);r[s]=109,r[s+1]=97,r[s+2]=105,r[s+3]=110,r[s+4]=0,r.set(e,c);try{let b=o.sqlite3_deserialize(t.pointer,s,c,e.length,e.length,3);if(b!==0)throw t.close(),new Error(`deserialize failed (rc=${b})`);return t}finally{o.sqlite3_free(s)}}function S(){return typeof a.db.export=="function"?a.db.export():a.sqlite3.capi.sqlite3_js_db_export(a.db.pointer)}async function N(e,t){if(a.sqlite3){try{a.db?.close()}catch{}a.db=j(e),R(t),f(),a.dbName=t,a.renderSchema&&a.renderSchema(),y(),localStorage.setItem(E,t)}}async function Y(e){let t=e.target.files?.[0];if(t){try{let n=await t.arrayBuffer(),o=t.name.replace(/\.(sqlite|db)$/i,""),r=new Uint8Array(n);await N(r,o),await g(o,r),u()}catch(n){l(`Failed to open database: ${n.message||String(n)}`)}w.value=""}}async function I(){if(!a.db||!a.sqlite3){l("No database to export.");return}try{let e=S(),t=new Blob([e],{type:"application/x-sqlite3"}),n=URL.createObjectURL(t),o=document.createElement("a");o.href=n,o.download=`${a.dbName||"database"}.sqlite`,document.body.appendChild(o),o.click(),document.body.removeChild(o),setTimeout(()=>URL.revokeObjectURL(n),1e4)}catch(e){l(`Export failed: ${e.message||String(e)}`)}}async function _(){if(!(!a.db||!a.sqlite3))try{let e=S();await g(a.dbName||"database",e)}catch{}}async function Q(){if(a.sqlite3)try{if(await h("test_data")&&!confirm("You already have a test_data database. Overwrite it?"))return;let t=await fetch("test_schema.sql");if(!t.ok)throw new Error(`HTTP ${t.status}`);let n=await t.text();a.db?.close(),a.db=new a.sqlite3.oo1.DB,f(),a.dbName="test_data",m.value="test_data",a.db.exec(n,{rowMode:"object"}),await _(),localStorage.setItem(E,"test_data"),a.renderSchema&&a.renderSchema(),y()}catch(e){l(`Test schema failed: ${e.message||String(e)}`)}}async function W(e=C){if(!a.sqlite3)return!1;try{a.db?.close()}catch{}try{return a.db=new a.sqlite3.oo1.DB,f(),e&&e.trim()&&a.db.exec(e,{rowMode:"object"}),a.dbName=D,m.value=D,a.renderSchema&&a.renderSchema(),y(),!0}catch(t){return l(`Tutorial database failed: ${t.message||String(t)}`),!1}}async function u(){try{let e=await k();if(d.innerHTML="",e.length===0)d.innerHTML='<div class="dropdown-empty">No saved databases</div>';else for(let t of e){let n=document.createElement("button");n.className="dropdown-item",n.dataset.name=t.name;let o=new Date(t.savedAt),r=o.toLocaleDateString()+" "+o.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});n.innerHTML=`<span class="item-name">${p(t.name)}</span><span class="item-date">${r}</span>`,n.addEventListener("contextmenu",s=>{s.preventDefault(),s.stopPropagation();let c=document.getElementById("context-menu");c.innerHTML=`
            <button class="context-menu-item" data-action="rename-db" data-db="${p(n.dataset.name)}">Rename</button>
            <button class="context-menu-item danger" data-action="delete-db" data-db="${p(n.dataset.name)}">Delete</button>
          `,c.dataset.contextDb=n.dataset.name;let b=c.getBoundingClientRect(),q=window.innerWidth-b.width,A=window.innerHeight-b.height;c.style.left=Math.min(s.clientX,q)+"px",c.style.top=Math.min(s.clientY,A)+"px",c.classList.remove("hidden")}),d.appendChild(n)}d.classList.toggle("hidden")}catch(e){console.error("Failed to list recent DBs:",e)}}async function H(e){let t=e.target.closest(".dropdown-item");if(!t)return;let n=t.dataset.name;d.classList.add("hidden");try{let o=await h(n);if(!o){l(`Database "${n}" not found in local storage.`),await T(n),u();return}await N(o,n)}catch(o){l(`Failed to open from local: ${o.message||String(o)}`)}}function P(e){(e.ctrlKey||e.metaKey)&&(e.key==="s"&&(e.preventDefault(),I()),e.key==="o"&&(e.preventDefault(),w.click()),e.key==="m"&&(e.preventDefault(),v()))}function y(){let e=i("#results-info"),t=i("#results-output");e&&(e.textContent="Ready"),t&&(t.innerHTML="")}function l(e){let t=i("#results-info"),n=i("#results-output");t&&(t.textContent="Error"),n&&(n.innerHTML=`<div class="results-error">${p(e)}</div>`)}function p(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}async function J(){let e=localStorage.getItem(E);if(e)try{let t=await h(e);t&&await N(t,e)}catch{}}export{L as a,k as b,z as c,V as d,_ as e,Q as f,W as g,u as h,J as i};
