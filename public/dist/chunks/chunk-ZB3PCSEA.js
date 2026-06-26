import{a as r,b as p,c}from"./chunk-VF6BQQ5L.js";import{a as i}from"./chunk-JBYH4SZV.js";var L="browsersql-lastdb",E=c("#file-input"),M=c("#btn-new-db"),O=c("#btn-open-db"),F=c("#btn-export-db"),V=c("#btn-delete-db"),U=c("#btn-recent-dbs"),l=c("#recent-dbs-dropdown"),f=c("#db-name-input"),k="browsersql-dbs";function y(){return new Promise((e,t)=>{let n=indexedDB.open(k,1);n.onupgradeneeded=()=>{n.result.createObjectStore("dbs",{keyPath:"name"}).createIndex("savedAt","savedAt")},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error)})}async function g(e,t){let n=await y(),a=n.transaction("dbs","readwrite");a.objectStore("dbs").put({name:e,data:t,savedAt:Date.now()}),await new Promise((o,s)=>{a.oncomplete=o,a.onerror=()=>s(a.error)}),n.close()}async function h(e){let t=await y(),a=t.transaction("dbs","readonly").objectStore("dbs").get(e),o=await new Promise((s,d)=>{a.onsuccess=()=>s(a.result),a.onerror=()=>d(a.error)});return t.close(),o?.data}async function C(){let e=await y(),n=e.transaction("dbs","readonly").objectStore("dbs").getAll(),a=await new Promise((o,s)=>{n.onsuccess=()=>o(n.result),n.onerror=()=>s(n.error)});return e.close(),(a||[]).sort((o,s)=>s.savedAt-o.savedAt)}async function N(e){let t=await y(),n=t.transaction("dbs","readwrite");n.objectStore("dbs").delete(e),await new Promise((a,o)=>{n.oncomplete=a,n.onerror=()=>o(n.error)}),t.close()}function Q(){M.addEventListener("click",S),O.addEventListener("click",()=>E.click()),F.addEventListener("click",I),U.addEventListener("click",m),E.addEventListener("change",P),document.addEventListener("keydown",G),document.addEventListener("click",e=>{e.target.closest(".recent-wrap")||l.classList.add("hidden")}),l.addEventListener("click",Y),document.getElementById("context-menu")?.addEventListener("click",e=>{let t=e.target.closest("[data-action]");if(!t)return;let n=t.dataset.db||document.getElementById("context-menu")?.dataset.contextDb;if(n){if(document.getElementById("context-menu")?.classList.add("hidden"),t.dataset.action==="rename-db"){let a=prompt(i("confirm.renameDB"),n);if(!a||a===n)return;(async()=>{try{let o=await h(n);if(!o){alert(i("error.dbNotFound",n));return}await g(a,o),await N(n),await m(),l.classList.add("hidden")}catch(o){alert(i("error.renameFailed",o.message||o))}})()}if(t.dataset.action==="delete-db"){if(!confirm(i("confirm.deleteDB",n)))return;(async()=>{try{await N(n),await m(),l.classList.add("hidden")}catch(a){alert(i("error.deleteFailed",a.message||a))}})()}}}),f.addEventListener("change",()=>{r.dbName=f.value||"default"})}async function W(){try{let e=await j();return r.sqlite3=e,r.db=new e.oo1.DB,f.value=r.dbName,!0}catch(e){return console.error("SQLite init failed:",e),!1}}var v="https://cdn.jsdelivr.net/npm/@sqlite.org/sqlite-wasm@3.51.2-build8/dist/",D="browsersql-tutorial",$=`
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
`;async function j(){return(await import(v+"index.mjs")).default({locateFile:t=>v+t})}async function S(){if(!r.sqlite3)return;let e=prompt(i("prompt.dbName"),"default");if(e){try{r.db?.close()}catch{}r.db=new r.sqlite3.oo1.DB,p(),R(e.trim()),r.renderSchema&&r.renderSchema(),T(),localStorage.removeItem(L),await q(),await m()}}function R(e){r.dbName=e,f.value=e}function H(e){let t=new r.sqlite3.oo1.DB,n=r.sqlite3,a=n.capi,o=n.wasm.heap8(),s=a.sqlite3_malloc(5),d=a.sqlite3_malloc(e.length);o[s]=109,o[s+1]=97,o[s+2]=105,o[s+3]=110,o[s+4]=0,o.set(e,d);try{let b=a.sqlite3_deserialize(t.pointer,s,d,e.length,e.length,3);if(b!==0)throw t.close(),new Error(`deserialize failed (rc=${b})`);return t}finally{a.sqlite3_free(s)}}function B(){return typeof r.db.export=="function"?r.db.export():r.sqlite3.capi.sqlite3_js_db_export(r.db.pointer)}async function x(e,t){if(r.sqlite3){try{r.db?.close()}catch{}r.db=H(e),R(t),p(),r.dbName=t,r.renderSchema&&r.renderSchema(),T(),localStorage.setItem(L,t)}}async function P(e){let t=e.target.files?.[0];if(t){try{let n=await t.arrayBuffer(),a=t.name.replace(/\.(sqlite|db)$/i,""),o=new Uint8Array(n);await x(o,a),await g(a,o),m()}catch(n){u(i("error.openFailed",n.message||String(n)))}E.value=""}}async function I(){if(!r.db||!r.sqlite3){u(i("error.noDB"));return}try{let e=B(),t=new Blob([e],{type:"application/x-sqlite3"}),n=URL.createObjectURL(t),a=document.createElement("a");a.href=n,a.download=`${r.dbName||"database"}.sqlite`,document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>URL.revokeObjectURL(n),1e4)}catch(e){u(i("error.exportFailed",e.message||String(e)))}}async function q(){if(!(!r.db||!r.sqlite3))try{let e=B();await g(r.dbName||"database",e)}catch{}}async function J(){if(r.sqlite3)try{if(await h("test_data")&&!confirm(i("confirm.overwriteTest")))return;let t=await fetch("test_schema.sql");if(!t.ok)throw new Error(`HTTP ${t.status}`);let n=await t.text();r.db?.close(),r.db=new r.sqlite3.oo1.DB,p(),r.dbName="test_data",f.value="test_data",r.db.exec(n,{rowMode:"object"}),await q(),localStorage.setItem(L,"test_data"),r.renderSchema&&r.renderSchema(),T()}catch(e){u(i("error.schemaFailed",e.message||String(e)))}}async function Z(e=$){if(!r.sqlite3)return!1;try{r.db?.close()}catch{}try{return r.db=new r.sqlite3.oo1.DB,p(),e&&e.trim()&&r.db.exec(e,{rowMode:"object"}),r.dbName=D,f.value=D,r.renderSchema&&r.renderSchema(),T(),!0}catch(t){return u(i("error.tutorialFailed",t.message||String(t))),!1}}async function m(){try{let e=await C();if(l.innerHTML="",e.length===0)l.innerHTML=`<div class="dropdown-empty">${i("dropdown.empty")}</div>`;else for(let t of e){let n=document.createElement("button");n.className="dropdown-item",n.dataset.name=t.name;let a=new Date(t.savedAt),o=a.toLocaleDateString()+" "+a.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});n.innerHTML=`<span class="item-name">${w(t.name)}</span><span class="item-date">${o}</span>`,n.addEventListener("contextmenu",s=>{s.preventDefault(),s.stopPropagation();let d=document.getElementById("context-menu");d.innerHTML=`
            <button class="context-menu-item" data-action="rename-db" data-db="${w(n.dataset.name)}">${i("dropdown.context.rename")}</button>
            <button class="context-menu-item danger" data-action="delete-db" data-db="${w(n.dataset.name)}">${i("dropdown.context.delete")}</button>
          `,d.dataset.contextDb=n.dataset.name;let b=d.getBoundingClientRect(),A=window.innerWidth-b.width,_=window.innerHeight-b.height;d.style.left=Math.min(s.clientX,A)+"px",d.style.top=Math.min(s.clientY,_)+"px",d.classList.remove("hidden")}),l.appendChild(n)}l.classList.toggle("hidden")}catch(e){console.error("Failed to list recent DBs:",e)}}async function Y(e){let t=e.target.closest(".dropdown-item");if(!t)return;let n=t.dataset.name;l.classList.add("hidden");try{let a=await h(n);if(!a){u(i("error.dbNotFound",n)),await N(n),m();return}await x(a,n)}catch(a){u(i("error.openFailed",a.message||String(a)))}}function G(e){(e.ctrlKey||e.metaKey)&&(e.key==="s"&&(e.preventDefault(),I()),e.key==="o"&&(e.preventDefault(),E.click()),e.key==="m"&&(e.preventDefault(),S()))}function T(){let e=c("#results-info"),t=c("#results-output");e&&(e.textContent=i("results.ready")),t&&(t.innerHTML="")}function u(e){let t=c("#results-info"),n=c("#results-output");t&&(t.textContent=i("results.error")),n&&(n.innerHTML=`<div class="results-error">${w(e)}</div>`)}function w(e){let t=document.createElement("div");return t.textContent=e,t.innerHTML}async function ee(){let e=localStorage.getItem(L);if(e)try{let t=await h(e);t&&await x(t,e)}catch{}}export{y as a,h as b,C as c,Q as d,W as e,q as f,J as g,Z as h,m as i,ee as j};
