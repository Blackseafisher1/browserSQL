You're absolutely right to ask — this is critical. Let me be clear about **SQLite WASM limitations** in the browser environment:

---

## SQLite WASM Capabilities & Limitations

### ✅ **Fully Supported** (Works in browser SQLite WASM)

| Feature | Works? | Notes |
|---------|--------|-------|
| `CREATE TABLE` | ✅ Yes | Full support |
| `PRIMARY KEY` | ✅ Yes | Full support |
| `FOREIGN KEY` | ✅ Yes | Need to enable `PRAGMA foreign_keys=ON` |
| `NOT NULL`, `UNIQUE`, `CHECK` | ✅ Yes | Full support |
| `SELECT`, `INSERT`, `UPDATE`, `DELETE` | ✅ Yes | Full support |
| `WHERE`, `ORDER BY`, `LIMIT` | ✅ Yes | Full support |
| `JOIN` (INNER, LEFT) | ✅ Yes | Full support |
| `GROUP BY`, `HAVING` | ✅ Yes | Full support |
| `SUBQUERIES` | ✅ Yes | Full support |
| `CTEs` (WITH) | ✅ Yes | Full support |
| `INDEXES` (CREATE, DROP) | ✅ Yes | Full support |
| `TRANSACTIONS` (BEGIN, COMMIT, ROLLBACK) | ✅ Yes | Full support |
| `SAVEPOINT` | ✅ Yes | Full support |
| `VIEWS` (CREATE, DROP) | ✅ Yes | Full support |
| `WINDOW FUNCTIONS` | ✅ Yes | Supported in SQLite 3.25+ |
| `CASE` statements | ✅ Yes | Full support |
| `DATE`/`TIME` functions | ✅ Yes | Full support |

### ⚠️ **Limited or Different** (Works but with caveats)

| Feature | Status | Notes |
|---------|--------|-------|
| `AUTOINCREMENT` | ⚠️ Works | In SQLite, `INTEGER PRIMARY KEY` auto-increments without `AUTOINCREMENT` keyword. `AUTOINCREMENT` adds a counter table. |
| `TRIGGERS` | ⚠️ Works | **But**: You must enable `PRAGMA foreign_keys=ON` for foreign keys in triggers to work properly. |
| `EXPLAIN QUERY PLAN` | ⚠️ Works | Output is text, not graphical. Good for learning. |

### ❌ **DOES NOT WORK** (Not supported by SQLite WASM)

| Feature | Why not? |
|---------|----------|
| `STORED PROCEDURES` | ❌ SQLite does not support stored procedures at all (even in native SQLite). Use `PRAGMA` or `CREATE TRIGGER` instead. |
| `FUNCTIONS` (stored functions) | ❌ SQLite doesn't have stored functions. You can write user-defined functions in C, but not in WASM without custom bindings. |
| `RIGHT JOIN` | ❌ SQLite doesn't support `RIGHT JOIN` or `FULL OUTER JOIN`. Use `LEFT JOIN` and swap tables. |
| `FULL OUTER JOIN` | ❌ Same as above. |
| `JSON1` extension | ❌ Not available in standard SQLite WASM build (but you can use `json_extract` if enabled). |
| `FTS5` (full-text search) | ❌ Not available in standard SQLite WASM build. |
| `RANDOM()` | ✅ Works, but not truly random in WASM. |

---

## Revised Curriculum (Removing Unsupportable Features)

Here's the **corrected, browser-safe curriculum** without stored procedures, RIGHT JOIN, FULL OUTER JOIN, or FTS5:

### MODULE 1: DATABASE FUNDAMENTALS
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 1 | What is a Database? | 📖 Theory | DBMS, Tables, Rows, Columns | ✅ |
| 2 | SQL vs NoSQL | 📖 Theory | Relational vs Non-relational | ✅ |
| 3 | Your First Database | 🎯 Practice | `sqlite3` in browser | ✅ |
| 4 | Creating Tables | 🎯 Practice | `CREATE TABLE`, Data Types | ✅ |
| 5 | Data Types Deep Dive | 📖 Theory | INTEGER, TEXT, REAL, BLOB | ✅ |

### MODULE 2: SCHEMA & CONSTRAINTS
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 6 | Primary Keys | 🎯 Practice | `PRIMARY KEY`, `AUTOINCREMENT` | ✅ |
| 7 | Foreign Keys | 🎯 Practice | `FOREIGN KEY`, `PRAGMA foreign_keys=ON` | ✅ (enable pragma) |
| 8 | Constraints | 🎯 Practice | `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK` | ✅ |
| 9 | Schema Design | 📖 Theory | 1-to-1, 1-to-Many, Many-to-Many | ✅ |

### MODULE 3: CRUD OPERATIONS
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 10 | Reading Data | 🎯 Practice | `SELECT *`, specific columns | ✅ |
| 11 | Filtering | 🎯 Practice | `WHERE`, `AND`, `OR` | ✅ |
| 12 | Advanced Filtering | 🎯 Practice | `IN`, `BETWEEN`, `NOT` | ✅ |
| 13 | Working with NULL | 🎯 Practice | `IS NULL`, `IS NOT NULL` | ✅ |
| 14 | Pattern Matching | 🎯 Practice | `LIKE`, `%`, `_` | ✅ |
| 15 | Inserting Data | 🎯 Practice | `INSERT INTO`, multiple rows | ✅ |
| 16 | Updating Data | 🎯 Practice | `UPDATE SET` | ✅ |
| 17 | Deleting Data | 🎯 Practice | `DELETE FROM` | ✅ |
| 18 | Danger of DELETE | 📖 Theory | `DELETE` vs `TRUNCATE` | ✅ |

### MODULE 4: QUERY POWER TOOLS
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 19 | Sorting | 🎯 Practice | `ORDER BY`, `ASC`, `DESC` | ✅ |
| 20 | Limiting | 🎯 Practice | `LIMIT`, `OFFSET` | ✅ |
| 21 | Aggregates | 🎯 Practice | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` | ✅ |
| 22 | Grouping | 🎯 Practice | `GROUP BY`, `HAVING` | ✅ |
| 23 | Distinct Values | 🎯 Practice | `DISTINCT` | ✅ |
| 24 | Aliases | 🎯 Practice | `AS` for columns and tables | ✅ |

### MODULE 5: JOINS (SQLite Safe)
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 25 | INNER JOIN | 🎯 Practice | `INNER JOIN` | ✅ |
| 26 | LEFT JOIN | 🎯 Practice | `LEFT JOIN` | ✅ |
| 27 | RIGHT JOIN | 📖 Theory | Concept only (not in SQLite) | ✅ (theory) |
| 28 | FULL OUTER JOIN | 📖 Theory | Concept only (not in SQLite) | ✅ (theory) |
| 29 | Self Joins | 🎯 Practice | Joining a table to itself | ✅ |
| 30 | Joining Multiple Tables | 🎯 Practice | 3+ tables | ✅ |

### MODULE 6: SUBQUERIES & CTEs
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 31 | Subquery in WHERE | 🎯 Practice | `IN (SELECT ...)` | ✅ |
| 32 | Subquery in SELECT | 🎯 Practice | `SELECT (SELECT ...)` | ✅ |
| 33 | Subquery in FROM | 🎯 Practice | `FROM (SELECT ...)` | ✅ |
| 34 | Correlated Subqueries | 🎯 Practice | Subquery referencing outer query | ✅ |
| 35 | EXISTS | 🎯 Practice | `EXISTS` vs `IN` | ✅ |
| 36 | Common Table Expressions | 🎯 Practice | `WITH` clause | ✅ |
| 37 | Recursive CTEs | 📖 Theory | Hierarchical data | ✅ (theory) |

### MODULE 7: NORMALIZATION
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 38 | Why Normalize? | 📖 Theory | Redundancy, Anomalies | ✅ |
| 39 | 1NF | 🎯 Practice | Atomic columns, Primary key | ✅ |
| 40 | 2NF | 🎯 Practice | No partial dependency | ✅ |
| 41 | 3NF | 🎯 Practice | No transitive dependency | ✅ |
| 42 | Denormalization | 📖 Theory | When to denormalize | ✅ |

### MODULE 8: INDEXES & PERFORMANCE
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 43 | What is an Index? | 📖 Theory | B-Tree, speed vs storage | ✅ |
| 44 | Creating Indexes | 🔧 Hands-on | `CREATE INDEX`, `DROP INDEX` | ✅ |
| 45 | Query Planning | 🔧 Hands-on | `EXPLAIN QUERY PLAN` | ✅ |
| 46 | Composite Indexes | 🔧 Hands-on | Index on multiple columns | ✅ |
| 47 | When NOT to Index | 📖 Theory | Trade-offs | ✅ |

### MODULE 9: TRANSACTIONS
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 48 | ACID Properties | 📖 Theory | Atomicity, Consistency, Isolation, Durability | ✅ |
| 49 | Starting Transactions | 🔧 Hands-on | `BEGIN TRANSACTION` | ✅ |
| 50 | Committing | 🔧 Hands-on | `COMMIT` | ✅ |
| 51 | Rolling Back | 🔧 Hands-on | `ROLLBACK` | ✅ |
| 52 | Savepoints | 🔧 Hands-on | `SAVEPOINT`, nested rollbacks | ✅ |

### MODULE 10: ADVANCED TOPICS (SQLite Safe)
| # | Title | Type | Concept | Works? |
|---|-------|------|---------|--------|
| 53 | Views | 🎯 Practice | `CREATE VIEW`, virtual tables | ✅ |
| 54 | Triggers | 🔧 Hands-on | `CREATE TRIGGER` | ✅ (enable foreign_keys) |
| 55 | Window Functions | 🎯 Practice | `ROW_NUMBER`, `RANK`, `OVER` | ✅ |
| 56 | Case Statements | 🎯 Practice | `CASE WHEN ... THEN ... END` | ✅ |
| 57 | Date/Time Functions | 🎯 Practice | `DATE`, `STRFTIME` | ✅ |

---

## Critical Implementation Notes for Trigger Support

### Triggers Work in SQLite WASM — but with **one important requirement**:

You must **enable foreign key constraints** before creating triggers that reference foreign keys:

```sql
PRAGMA foreign_keys = ON;
```

Without this, triggers that enforce referential integrity will fail silently.

### Example Lesson for Triggers:

```sql
-- Enable foreign keys first
PRAGMA foreign_keys = ON;

-- Create parent table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT
);

-- Create child table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create trigger to prevent orphaned orders
CREATE TRIGGER prevent_orphan_orders
BEFORE DELETE ON users
BEGIN
  SELECT RAISE(ROLLBACK, 'Cannot delete user with existing orders')
  WHERE (SELECT COUNT(*) FROM orders WHERE user_id = OLD.id) > 0;
END;
```

---

## Summary Table: What Works in Browser SQLite WASM

| Feature | Works? | Lesson Type |
|---------|--------|--------------|
| Basic SQL | ✅ | Practice |
| Constraints | ✅ | Practice |
| Joins (INNER, LEFT) | ✅ | Practice |
| Subqueries | ✅ | Practice |
| CTEs | ✅ | Practice |
| Indexes | ✅ | Hands-on |
| Transactions | ✅ | Hands-on |
| Views | ✅ | Practice |
| Triggers | ✅ (with `PRAGMA foreign_keys=ON`) | Hands-on |
| Window Functions | ✅ | Practice |
| Stored Procedures | ❌ | Theory only |
| RIGHT / FULL JOIN | ❌ | Theory only |
| JSON / FTS5 | ❌ | Remove entirely |

Your curriculum should **remove** stored procedures, RIGHT JOIN, FULL OUTER JOIN, JSON, and FTS5. Everything else is **safe to implement** as hands-on practice in the browser.