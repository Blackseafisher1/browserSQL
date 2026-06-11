# CTE + SQL Alias -> Schema Parser

Parse CTEs and table aliases from editor content and inject them into `currentSchema` so autocomplete (`.`, `WHERE`, `SELECT`, etc.) works automatically.

## Approach

Parse-only. No DB. Debounced 500ms on doc change. Merges into `currentSchema` — CodeMirror's `schemaCompletionSource` picks it up for free.

## Files

| File | What |
|------|------|
| NEW `public/js/pages/sqlSchemaParser.js` | ~120 lines: parseAliases, parseCTEs, extractSelectColumns, mergeSchema |
| EDIT `public/js/pages/editorView.js` | ~30 lines: import, debounced parse, reconfigure on doc change |

## 1. `parseAliases(text)` → `{alias: tableName}`

Regex: `FROM|JOIN (\w+)(?:\s+(?:AS\s+)?(\w+))?`

Skip second word if it's a SQL keyword (WHERE, ON, SET, AND, OR, GROUP, ORDER, LIMIT, HAVING, etc.) or if it matches a known table name.

## 2. `parseCTEs(text)` → `{cteName: [col1, col2, ...]}`

Find `WITH [RECURSIVE] name[(explicit_cols)] AS ( ... )`:

- Track paren depth to find real closing `)`
- If explicit `(a, b, c)` → use those
- If no explicit cols → extract SELECT text between `SELECT` and `FROM|WHERE|JOIN|GROUP|ORDER|LIMIT|)` (paren-depth aware)
- Split by `,`, for each part: `/AS\s+(\w+)/i` match → column name; else last bare word heuristic

Skips `SELECT *` (silent).

## 3. `mergeSchema(baseSchema, aliases, ctes)` → `{...schema, ...ctes, alias: tableColumns}`

Combine: base table schema + CTEs as virtual tables + aliases pointing to real table columns.

## 4. Integration in editorView.js

- On each `docChanged` update: 500ms debounced call to parse + merge
- Update `currentSchema` and reconfigure `autocompleteComp` (existing)
- `schemaCompletionSource` in `makeAutocomplete()` picks up latest schema
- `.` and WHERE auto-trigger work naturally

## Limitations (Silent — No Error, Just No Columns)

| Case | Reason |
|------|--------|
| `SELECT *` in CTE | Can't resolve star without full FROM |
| CTE with subquery column | Paren depth finds inner SELECT |
| Recursive CTE beyond first SELECT | Only parses initial SELECT |
| CTE referencing prior CTE with `*` | Works if prior has parseable cols |
| Alias colliding with keyword | Regex skips known keywords |
