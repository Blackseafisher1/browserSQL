Perfect. You want a **balanced curriculum** where theoretical topics (normalization, indexing, transactions) are taught with practical, "try it yourself" exercises—even if that means writing queries to create/drop indexes or manually starting/committing transactions.

Here is the **complete, battle-tested curriculum** that covers everything, with proper checks for each lesson type.

---

## COMPREHENSIVE SQL TUTORIAL CURRICULUM

### Legend
- **🎯 Practice**: User writes SQL queries
- **📖 Theory**: User reads, then answers a multiple-choice or fill-in-the-blank question
- **🔧 Hands-on Theory**: User performs a non-query action (e.g., create index, start transaction)

---

## MODULE 1: DATABASE FUNDAMENTALS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 1 | What is a Database? | 📖 Theory | DBMS, Tables, Rows, Columns | `01-intro.md` | ✅ Quiz: "What stores data in rows and columns?" |
| 2 | SQL vs NoSQL | 📖 Theory | Relational vs Non-relational | `02-nosql.md` | ✅ Quiz: "Which SQL keyword creates a table?" |
| 3 | Your First Database | 🎯 Practice | `sqlite3` in browser, attaching DB | `03-attach.sql` | ✅ Query success |
| 4 | Creating Tables | 🎯 Practice | `CREATE TABLE`, Data Types | `04-create.sql` | ✅ Schema check (table exists, columns correct) |
| 5 | Data Types Deep Dive | 📖 Theory | INTEGER, TEXT, REAL, BLOB | `05-types.md` | ✅ Quiz: "Which type stores integers?" |

---

## MODULE 2: SCHEMA & CONSTRAINTS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 6 | Primary Keys | 🎯 Practice | `PRIMARY KEY`, `AUTOINCREMENT` | `06-primary.sql` | ✅ Result match (ID auto-assigned) |
| 7 | Foreign Keys | 🎯 Practice | `FOREIGN KEY`, Referential Integrity | `07-foreign.sql` | ✅ Query success + FK violation test |
| 8 | Constraints | 🎯 Practice | `NOT NULL`, `UNIQUE`, `DEFAULT`, `CHECK` | `08-constraints.sql` | ✅ Query success + INSERT fails test |
| 9 | Schema Design | 📖 Theory | 1-to-1, 1-to-Many, Many-to-Many | `09-schema.md` | ✅ Quiz: "Which relationship uses a junction table?" |

---

## MODULE 3: CRUD OPERATIONS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 10 | Reading Data | 🎯 Practice | `SELECT *`, specific columns | `10-select.sql` | ✅ Result match |
| 11 | Filtering | 🎯 Practice | `WHERE`, `AND`, `OR` | `11-where.sql` | ✅ Result match |
| 12 | Advanced Filtering | 🎯 Practice | `IN`, `BETWEEN`, `NOT` | `12-advanced-where.sql` | ✅ Result match |
| 13 | Working with NULL | 🎯 Practice | `IS NULL`, `IS NOT NULL` | `13-null.sql` | ✅ Result match |
| 14 | Pattern Matching | 🎯 Practice | `LIKE`, `%`, `_` | `14-like.sql` | ✅ Result match |
| 15 | Inserting Data | 🎯 Practice | `INSERT INTO`, multiple rows | `15-insert.sql` | ✅ Affected rows count |
| 16 | Updating Data | 🎯 Practice | `UPDATE SET` | `16-update.sql` | ✅ Affected rows count |
| 17 | Deleting Data | 🎯 Practice | `DELETE FROM` | `17-delete.sql` | ✅ Affected rows count |
| 18 | Danger of DELETE | 📖 Theory | `DELETE` vs `TRUNCATE`, WHERE safety | `18-delete-danger.md` | ✅ Quiz: "What happens without WHERE?" |

---

## MODULE 4: QUERY POWER TOOLS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 19 | Sorting | 🎯 Practice | `ORDER BY`, `ASC`, `DESC` | `19-order.sql` | ✅ Result match |
| 20 | Limiting | 🎯 Practice | `LIMIT`, `OFFSET` | `20-limit.sql` | ✅ Result match |
| 21 | Aggregates | 🎯 Practice | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` | `21-aggregate.sql` | ✅ Result match (single value) |
| 22 | Grouping | 🎯 Practice | `GROUP BY`, `HAVING` | `22-group.sql` | ✅ Result match |
| 23 | Distinct Values | 🎯 Practice | `DISTINCT` | `23-distinct.sql` | ✅ Result match |
| 24 | Aliases | 🎯 Practice | `AS` for columns and tables | `24-alias.sql` | ✅ Result match (column names) |

---

## MODULE 5: JOINS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 25 | INNER JOIN | 🎯 Practice | `INNER JOIN`, joining two tables | `25-inner-join.sql` | ✅ Result match |
| 26 | LEFT JOIN | 🎯 Practice | `LEFT JOIN`, preserving unmatched rows | `26-left-join.sql` | ✅ Result match |
| 27 | RIGHT JOIN | 📖 Theory | `RIGHT JOIN` (SQLite lacks it) | `27-right-join.md` | ✅ Quiz: "SQLite doesn't support which join?" |
| 28 | FULL OUTER JOIN | 📖 Theory | Concept only | `28-full-join.md` | ✅ Quiz |
| 29 | Self Joins | 🎯 Practice | Joining a table to itself | `29-self-join.sql` | ✅ Result match |
| 30 | Joining Multiple Tables | 🎯 Practice | 3+ tables | `30-multi-join.sql` | ✅ Result match |

---

## MODULE 6: SUBQUERIES & CTEs

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 31 | Subquery in WHERE | 🎯 Practice | `SELECT ... WHERE ... IN (SELECT ...)` | `31-subquery-where.sql` | ✅ Result match |
| 32 | Subquery in SELECT | 🎯 Practice | `SELECT (SELECT ...) FROM ...` | `32-subquery-select.sql` | ✅ Result match |
| 33 | Subquery in FROM | 🎯 Practice | `FROM (SELECT ...) AS alias` | `33-subquery-from.sql` | ✅ Result match |
| 34 | Correlated Subqueries | 🎯 Practice | Subquery referencing outer query | `34-correlated.sql` | ✅ Result match |
| 35 | EXISTS | 🎯 Practice | `EXISTS` vs `IN` | `35-exists.sql` | ✅ Result match |
| 36 | Common Table Expressions (CTEs) | 🎯 Practice | `WITH` clause | `36-cte.sql` | ✅ Result match |
| 37 | Recursive CTEs | 📖 Theory | Hierarchical data | `37-recursive.md` | ✅ Quiz |

---

## MODULE 7: NORMALIZATION (THEORY + HANDS-ON)

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 38 | Why Normalize? | 📖 Theory | Redundancy, Anomalies | `38-why-normalize.md` | ✅ Quiz |
| 39 | 1NF | 🎯 Practice | Atomic columns, Primary key | `39-1nf.sql` | ✅ Schema check |
| 40 | 2NF | 🎯 Practice | No partial dependency | `40-2nf.sql` | ✅ Schema check |
| 41 | 3NF | 🎯 Practice | No transitive dependency | `41-3nf.sql` | ✅ Schema check |
| 42 | Denormalization | 📖 Theory | When to denormalize | `42-denormalize.md` | ✅ Quiz |

---

## MODULE 8: INDEXES & PERFORMANCE

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 43 | What is an Index? | 📖 Theory | B-Tree, speed vs storage | `43-index-intro.md` | ✅ Quiz |
| 44 | Creating Indexes | 🔧 Hands-on Theory | `CREATE INDEX`, `DROP INDEX` | `44-create-index.sql` | ✅ Query success |
| 45 | Query Planning | 🔧 Hands-on Theory | `EXPLAIN QUERY PLAN` | `45-explain.sql` | ✅ Output contains correct plan |
| 46 | Composite Indexes | 🔧 Hands-on Theory | Index on multiple columns | `46-composite-index.sql` | ✅ Query success |
| 47 | When NOT to Index | 📖 Theory | Trade-offs | `47-dont-index.md` | ✅ Quiz |

---

## MODULE 9: TRANSACTIONS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 48 | ACID Properties | 📖 Theory | Atomicity, Consistency, Isolation, Durability | `48-acid.md` | ✅ Quiz |
| 49 | Starting Transactions | 🔧 Hands-on Theory | `BEGIN TRANSACTION` | `49-begin.sql` | ✅ Query success |
| 50 | Committing | 🔧 Hands-on Theory | `COMMIT` | `50-commit.sql` | ✅ Data persists |
| 51 | Rolling Back | 🔧 Hands-on Theory | `ROLLBACK` | `51-rollback.sql` | ✅ Data not persisted |
| 52 | Savepoints | 🔧 Hands-on Theory | `SAVEPOINT`, nested rollbacks | `52-savepoint.sql` | ✅ Query success |

---

## MODULE 10: ADVANCED TOPICS

| # | Title | Type | Concept | Lesson File | Check Method |
|---|-------|------|---------|-------------|--------------|
| 53 | Views | 🎯 Practice | `CREATE VIEW`, virtual tables | `53-view.sql` | ✅ Query success + schema check |
| 54 | Triggers | 🔧 Hands-on Theory | `CREATE TRIGGER`, automatic actions | `54-trigger.sql` | ✅ Side-effect check |
| 55 | Stored Procedures | 📖 Theory | SQLite doesn't support, but concept | `55-procedure.md` | ✅ Quiz |
| 56 | Window Functions | 🎯 Practice | `ROW_NUMBER`, `RANK`, `OVER` | `56-window.sql` | ✅ Result match |
| 57 | Case Statements | 🎯 Practice | `CASE WHEN ... THEN ... END` | `57-case.sql` | ✅ Result match |
| 58 | Date/Time Functions | 🎯 Practice | `DATE`, `STRFTIME` | `58-date.sql` | ✅ Result match |
| 59 | JSON in SQLite | 📖 Theory | `JSON1` extension | `59-json.md` | ✅ Quiz |
| 60 | Full-Text Search | 📖 Theory | `FTS5` extension | `60-fts.md` | ✅ Quiz |

---

## PART 2: INTEGRATION PLAN (Robust State Management)

### Core Requirements for Proper Integration

1. **File Isolation**: Each lesson has its own `.sql` or `.md` file. Switching lessons must close the previous file and open the new one.
2. **Database Reset**: Each lesson loads a fresh, isolated schema.
3. **Result Checking**: Practice lessons compare user query result against expected result.
4. **Schema Checking**: Some lessons check if a table exists or has correct columns.
5. **Affected Rows Checking**: INSERT/UPDATE/DELETE lessons check `sqlite3_changes()`.
6. **Quiz Checking**: Theory lessons present a multiple-choice question but    quesiton just into the eidotr view  like rpelace the editor view with the question view when querion is demanded.

---

