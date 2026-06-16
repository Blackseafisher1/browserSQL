# browserSQL

In-browser SQLite editor with persistent cloud sync, AI SQL generation, schema visualization, and **no server required** for core functionality.

**https://blackseafisher1.github.io/browserSQL/public**

**https://browsersql.vercel.app**

---

## What makes this different

Most online SQL editors are ephemeral — close the tab, lose your work. browserSQL is designed as a **persistent local workspace** with optional cloud sync, AI assistance, and deep schema tooling. All data stays in your browser's IndexedDB until you choose to sync.

---

## Features

### SQL Editor
- **CodeMirror 6** with full SQLite dialect, syntax highlighting, autocomplete (tables/columns from current schema)
- Multi-pane editor — split view for side-by-side query comparison
- Tabbed file management — open up to 10 files per pane, switch between `.sql`, `.js`, `.md`
- **Keyboard toolbar** — `. , ; ( ) * = ' %` buttons for mobile keyboards that hide these chars
- **Generate SQL** — describe what you want in natural language, AI returns SQL inserted at cursor (`https://ideaboard.site`)
- **Fix/Optimize SQL** — select existing SQL, press GenSQL, AI rewrites it with proper aliases, JOINs, CTEs, etc.
- Template buttons (`SELECT *`, `INSERT INTO`, `UPDATE`, `DELETE FROM`) — insert boilerplate at cursor

### Schema Explorer
- **Entity Relationship Diagram** — click 🔗 to generate a Mermaid ERD from your schema, rendered in-editor with pan/zoom/drag
- **All metadata visible** — PK, FK, UQ, NN, AI badges per column
- **Indexes listed** — every index with its columns shown under the table
- **DDL modal** — view formatted `CREATE TABLE` statement for any table
- **Copy all DDL** — one-click copy of every table's DDL to clipboard
- **FK relationships** — visualized inline in the ERD with relationship labels
- **Right-click context menu** — `SELECT *`, `INSERT INTO`, `UPDATE`, `DELETE FROM` for any table, inserted at cursor

### Database Operations
- **New**, **Open** (`.sqlite` / `.db`), **Export** any database
- **Recent databases** — persisted to IndexedDB, auto-saved on every query execution, restored on reload
- **Test Data** — loads a complete e-commerce schema (categories, customers, products, orders, order_items, reviews) with sample rows
- **Drop tables** — from schema context menu or DDL modal

### File Management
- Multiple `.sql` files stored in **IndexedDB** (async, no 5MB localStorage limit)
- Create, rename, delete files and folders
- Folder tree with expand/collapse
- ZIP export/import of all files (with automatic `old-data` backup on import)
- **Underscore-prefixed files** (`_default_browserSQL.sql`) are hidden from the tree but persisted

### Tutorial System
- 5 modules, ~30 lessons covering `SELECT`, `JOIN`s, aggregates, subqueries, schema design, indexing, normalization
- Each lesson has a goal, editable workspace, and automated check
- Quiz/theory lessons with multi-question support
- **Progress synced to cloud** — complete a lesson on one device, it's marked done everywhere

### Cloud Sync (Optional)
- **Login/Register** with username + password
- **☁ Save** — uploads all local databases + files.zip + tutorial progress to cloud server
- **☁ Load** — shows a modal with checkboxes for which DBs/files/progress to import
- **Per-DB blocklist** — exclude specific databases from sync
- **Manage cloud files** — view all cloud files with sizes, delete individual files
- **Auto-scroll on insert** — inserted SQL is scrolled into view
- **Storage limit** — 100MB per user, enforced server-side with atomic writes
- **Account settings** — rename user, change password, logout from within the app

### AI SQL Generation
- Natural language → SQL via dedicated AI endpoint
- **Selected text fix/optimize** — select poorly written SQL, press GenSQL, AI rewrites it following best practices
- **Schema inclusion toggle** — choose whether DB schema is sent with the prompt
- **Rate limit display** — shows remaining requests in the modal (20/min, tracked locally)
- **Prompt optimized per mode** — generation mode uses a detailed prompt for creating new queries; fix mode uses a concise prompt with 12 specific rewrite rules

### Admin Panel
- Separate page at `/admin` (or `public/admin/` on GitHub Pages)
- Password gate 
- List all users, expand to see their files with sizes
- Delete individual files, delete entire users, **reset everything** (wipes all users + files)

### Backend (Optional, Self-Hosted)
- **Elysia + Bun** server at `http://localhost:8081` (proxied via Cloudflare Tunnel to `https://ideaboard.site`)
- **SQLite** user database with password hashing (bcrypt)
- **Rate-limited** AI proxy with 20 requests/min per IP
- **Security hardening** — file type whitelist, 10MB file limit, input sanitization, atomic writes, storage race condition fix
- **TLS** via Cloudflare (no cert management)
- **Admin API** — `POST /api/admin/login`, `GET /api/admin/users`, `GET /api/admin/files/:user`, `DELETE /api/admin/files/:user/:name`, `DELETE /api/admin/user/:username`, `POST /api/admin/reset`

### Mobile
- **Resizeable editor/results** — drag handle to allocate space
- **Persistent toolbar** — SQL keyboard bar pins above the virtual keyboard on Android/iOS
- **Sidebar drawer** — slides in from the left, closes on outside tap
- **Tab bar** — horizontal scroll for many open files
- **Schema expand arrows** — 40px touch targets (vs 22px on desktop)

---

## Quick Start (Local)

```bash
# Serve the frontend
npx serve public/

# Optional: start the backend for cloud sync
bun run server.ts
```

Open `http://localhost:3000`, click **Test Data**, start writing SQL.

---

## Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| Editor | CodeMirror 6 | CDN importmap, SQLite dialect, compartment-based schema autocomplete |
| SQL Engine | `@sqlite.org/sqlite-wasm` | Official WASM build, oo1 API, in-memory + serialized to IndexedDB |
| File Storage | IndexedDB | `browsersql-vfs` database, `files` + `tutorial_files` stores, one-time migration from localStorage |
| DB Snapshots | IndexedDB | `browsersql-dbs` database, `dbs` store with `savedAt` index |
| UI | Vanilla ES Modules | No framework — pure DOM + CSS `@layer` architecture, `light-dark()` theming |
| Cloud Sync | Elysia + Bun | REST API, Basic auth, file storage on disk per user |
| AI Proxy | Bun `serve` | Proxies to `do-ai.run`, rate-limited, mode-specific system prompts |
| HTTPS | Cloudflare Tunnel | Automatic TLS, no cert management |
