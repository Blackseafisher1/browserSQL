import{a as r,b as w,c}from"./chunk-VF6BQQ5L.js";import{a as i}from"./chunk-SSN5BD5R.js";var u="browsersql-lastdb",L=c("#file-input"),M=c("#btn-new-db"),O=c("#btn-open-db"),F=c("#btn-export-db"),V=c("#btn-delete-db"),U=c("#btn-recent-dbs"),l=c("#recent-dbs-dropdown"),b=c("#db-name-input"),k="browsersql-dbs";function y(){return new Promise((e,t)=>{let n=indexedDB.open(k,1);n.onupgradeneeded=()=>{n.result.createObjectStore("dbs",{keyPath:"name"}).createIndex("savedAt","savedAt")},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function x(e,t){let n=await y(),a=n.transaction("dbs","readwrite");a.objectStore("dbs").put({name:e,data:t,savedAt:Date.now()}),await new Promise((o,s)=>{a.oncomplete=o,a.onerror=()=>s(a.error)}),n.close()}async function h(e){let t=await y(),a=t.transaction("dbs","readonly").objectStore("dbs").get(e),o=await new Promise((s,d)=>{a.onsuccess=()=>s(a.result),a.onerror=()=>d(a.error)});return t.close(),o?.data}async function C(){let e=await y(),n=e.transaction("dbs","readonly").objectStore("dbs").getAll(),a=await new Promise((o,s)=>{n.onsuccess=()=>o(n.result),n.onerror=()=>s(n.error)});return e.close(),(a||[]).sort((o,s)=>s.savedAt-o.savedAt)}async function T(e){let t=await y(),n=t.transaction("dbs","readwrite");n.objectStore("dbs").delete(e),await new Promise((a,o)=>{n.oncomplete=a,n.onerror=()=>o(n.error)}),t.close()}function Q(){M.addEventListener("click",v),O.addEventListener("click",()=>L.click()),F.addEventListener("click",B),U.addEventListener("click",f),L.addEventListener("change",P),document.addEventListener("keydown",G),document.addEventListener("click",e=>{e.target.closest(".recent-wrap")||l.classList.add("hidden")}),l.addEventListener("click",Y),document.getElementById("context-menu")?.addEventListener("click",e=>{let t=e.target.closest("[data-action]");if(!t)return;let n=t.dataset.db||document.getElementById("context-menu")?.dataset.contextDb;if(n){if(document.getElementById("context-menu")?.classList.add("hidden"),t.dataset.action==="rename-db"){let a=prompt(i("confirm.renameDB"),n);if(!a||a===n)return;(async()=>{try{let o=await h(n);if(!o){alert(i("error.dbNotFound",n));return}await x(a,o),await T(n),await f(),l.classList.add("hidden")}catch(o){alert(i("error.renameFailed",o.message||o))}})()}if(t.dataset.action==="delete-db"){if(!confirm(i("confirm.deleteDB",n)))return;(async()=>{try{await T(n),await f(),l.classList.add("hidden")}catch(a){alert(i("error.deleteFailed",a.message||a))}})()}}}),b.addEventListener("change",()=>{r.dbName=b.value||"default"})}async function W(){try{let e=await j();return r.sqlite3=e,r.db=new e.oo1.DB,b.value=r.dbName,localStorage.getItem(u)||localStorage.setItem(u,r.dbName),!0}catch(e){return console.error("SQLite init failed:",e),!1}}var D="https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/",N="browsersql-tutorial",$=`
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
`;async function j(){return(await import(D+"index.mjs")).default({locateFile:t=>D+t})}async function v(){if(!r.sqlite3)return;let e=prompt(i("prompt.dbName"),"default");if(e){try{r.db?.close()}catch{}r.db=new r.sqlite3.oo1.DB,w(),I(e.trim()),r.renderSchema&&r.renderSchema(),g(),localStorage.setItem(u,e.trim()),await q(),await f()}}function I(e){r.dbName=e,b.value=e}function H(e){let t=new r.sqlite3.oo1.DB,n=r.sqlite3,a=n.capi,o=n.wasm.heap8(),s=a.sqlite3_malloc(5),d=a.sqlite3_malloc(e.length);o[s]=109,o[s+1]=97,o[s+2]=105,o[s+3]=110,o[s+4]=0,o.set(e,d);try{let p=a.sqlite3_deserialize(t.pointer,s,d,e.length,e.length,3);if(p!==0)throw t.close(),new Error(`deserialize failed (rc=${p})`);return t}finally{a.sqlite3_free(s)}}function R(){return typeof r.db.export=="function"?r.db.export():r.sqlite3.capi.sqlite3_js_db_export(r.db.pointer)}async function S(e,t){if(r.sqlite3){try{r.db?.close()}catch{}r.db=H(e),I(t),w(),r.dbName=t,r.renderSchema&&r.renderSchema(),g(),localStorage.setItem(u,t)}}async function P(e){let t=e.target.files?.[0];if(t){try{let n=await t.arrayBuffer(),a=t.name.replace(/\.(sqlite|db)$/i,""),o=new Uint8Array(n);await S(o,a),await x(a,o),f()}catch(n){m(i("error.openFailed",n.message||String(n)))}L.value=""}}async function B(){if(!r.db||!r.sqlite3){m(i("error.noDB"));return}try{let e=R(),t=new Blob([e],{type:"application/x-sqlite3"}),n=URL.createObjectURL(t),a=document.createElement("a");a.href=n,a.download=`${r.dbName||"database"}.sqlite`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(n),1e4)}catch(e){m(i("error.exportFailed",e.message||String(e)))}}async function q(){if(!(!r.db||!r.sqlite3))try{let e=R();await x(r.dbName||"database",e),localStorage.setItem(u,r.dbName||"database")}catch{}}async function J(){if(r.sqlite3)try{if(await h("test_data")&&!confirm(i("confirm.overwriteTest")))return;let t=await fetch("test_schema.sql");if(!t.ok)throw new Error(`HTTP ${t.status}`);let n=await t.text();r.db?.close(),r.db=new r.sqlite3.oo1.DB,w(),r.dbName="test_data",b.value="test_data",r.db.exec(n,{rowMode:"object"}),await q(),localStorage.setItem(u,"test_data"),r.renderSchema&&r.renderSchema(),g()}catch(e){m(i("error.schemaFailed",e.message||String(e)))}}async function Z(e=$){if(!r.sqlite3)return!1;try{r.db?.close()}catch{}try{return r.db=new r.sqlite3.oo1.DB,w(),e&&e.trim()&&r.db.exec(e,{rowMode:"object"}),r.dbName=N,b.value=N,localStorage.setItem(u,N),r.renderSchema&&r.renderSchema(),g(),!0}catch(t){return m(i("error.tutorialFailed",t.message||String(t))),!1}}async function f(){try{let e=await C();if(l.innerHTML="",e.length===0)l.innerHTML=`<div class="dropdown-empty">${i("dropdown.empty")}</div>`;else for(let t of e){let n=document.createElement("button");n.className="dropdown-item",n.dataset.name=t.name;let a=new Date(t.savedAt),o=a.toLocaleDateString()+" "+a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});n.innerHTML=`<span class="item-name">${E(t.name)}</span><span class="item-date">${o}</span>`,n.addEventListener("contextmenu",s=>{s.preventDefault(),s.stopPropagation();let d=document.getElementById("context-menu");d.innerHTML=`
            <button class="context-menu-item" data-action="rename-db" data-db="${E(n.dataset.name)}">${i("dropdown.context.rename")}</button>
            <button class="context-menu-item danger" data-action="delete-db" data-db="${E(n.dataset.name)}">${i("dropdown.context.delete")}</button>
          `,d.dataset.contextDb=n.dataset.name;let p=d.getBoundingClientRect(),A=window.innerWidth-p.width,_=window.innerHeight-p.height;d.style.left=Math.min(s.clientX,A)+"px",d.style.top=Math.min(s.clientY,_)+"px",d.classList.remove("hidden")}),l.appendChild(n)}l.classList.toggle("hidden")}catch(e){console.error("Failed to list recent DBs:",e)}}async function Y(e){let t=e.target.closest(".dropdown-item");if(!t)return;let n=t.dataset.name;l.classList.add("hidden");try{let a=await h(n);if(!a){m(i("error.dbNotFound",n)),await T(n),f();return}await S(a,n)}catch(a){m(i("error.openFailed",a.message||String(a)))}}function G(e){(e.ctrlKey||e.metaKey)&&(e.key==="s"&&(e.preventDefault(),B()),e.key==="o"&&(e.preventDefault(),L.click()),e.key==="m"&&(e.preventDefault(),v()))}function g(){let e=c("#results-info"),t=c("#results-output");e&&(e.textContent=i("results.ready")),t&&(t.innerHTML="")}function m(e){let t=c("#results-info"),n=c("#results-output");t&&(t.textContent=i("results.error")),n&&(n.innerHTML=`<div class="results-error">${E(e)}</div>`)}function E(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}async function ee(){let e=localStorage.getItem(u);if(e)try{let t=await h(e);t&&await S(t,e)}catch{}}export{y as a,h as b,C as c,Q as d,W as e,q as f,J as g,Z as h,f as i,g as j,ee as k};
