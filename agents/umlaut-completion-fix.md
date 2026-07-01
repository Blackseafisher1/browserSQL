# Umlaut Completion Fix

## Problem
Table/column names with umlauts (ä, ö, ü) had issues:
1. **Backtick quoting**: `männas` was inserted as `` `männas` ``
2. **No dropdown**: Typing `ä` didn't trigger autocompletion
3. **INSERT INTO** etc: Custom completion source couldn't detect umlaut table names
4. **Enter didn't accept**: Pressing Enter inserted newline instead of accepting the completion
5. **Uppercase table names** like `Männas` still got backticked
6. **Alias spillover**: Column aliases from finished statements appeared in the next query
7. **Dot not triggering**: Typing `table.` didn't show column completions
8. **Popup on non-word chars**: Completion stayed open after typing space, comma, etc.

## Root Causes

| Location | Code | Issue |
|---|---|---|
| Parser tokenizer `isAlpha()` | `ch >= 65 && ch <= 90` etc | Parser couldn't tokenize `ä` as part of identifier |
| `@codemirror/lang-sql` `Span` regex | `/^\w*$/` | Completion source said "not valid" for umlaut text |
| `nameCompletion()` regex | `/^[a-z_][a-z_\d]*$/` | Added backtick-quoted `apply` |
| SQLite dialect | `caseInsensitiveIdentifiers` not set | Regex used without `i` flag, uppercase fails match → backticks |
| `sqlCompletion.js` detect & ref | `\w+` in regexes | Couldn't match table names with umlauts |
| `docAliases()` | Scanned entire document | Column aliases from prior `;`-separated statements leaked into current query |
| `activateOnTyping` | Only checked `[\w\u00C0-\u024f]` | `.` didn't trigger → `table.` never opened completion |
| `debounceUpdate` | Close on any non-word char | `.` was also closed |

## Changes

### `public/js/lib/lang-sql.js` (local copy of `@codemirror/lang-sql`)
- **`isAlpha()`** — added `ch >= 192 && ch <= 591` (Latin-1 Supplement + Latin Extended-A) — tokenizer now recognizes `äöü` as identifier chars
- **`Span`** — `/^\w*$/` → `/^[\w\u00C0-\u024f]*$/` — `validFor` allows umlauts
- **`QuotedSpan`** — same, added `[\w\u00C0-\u024f]`
- **`nameCompletion()`** — regex `^[a-z_][a-z_\d]*$` → `^[a-z_\u00C0-\u024f][a-z_\d\u00C0-\u024f]*$` — stops backtick quoting for umlaut names
- **`SQLite` dialect** — added `caseInsensitiveIdentifiers: true` — makes `nameCompletion` regex case-insensitive, so `Männas` doesn't get backticked

### `public/editor.html`
- Importmap: `@codemirror/lang-sql` → `/public/js/lib/lang-sql.js` (only this package local, rest CDN)

### `public/js/pages/editorView.js`
- **`activateOnTyping`** — `/[\w\u00C0-\u024f]/` → `/[\w\u00C0-\u024f.]/` — `.` now also triggers completion popup
- **Keymap order** — `completionKeymap` before `defaultKeymap` — Enter accepts completion first, falls through to newline
- **`debounceUpdate`** — close popup when last char is NOT in `[\w\u00C0-\u024f.]` — closes on space, comma, semicolon, parens, etc.
- **Custom Enter handler** — removed (conflicted; `completionKeymap` handles it)

### `public/js/pages/sqlCompletion.js`
- `referencedTables()` — `\w+` → `[\w\u00C0-\u024f]+` in all regexes
- `detectContext()` — same for INSERT/UPDATE table name patterns
- All `validFor` — `/^\w+$/` → `/^[\w\u00C0-\u024f]+$/`
- **`docAliases()`** — now scopes to current statement only (truncates at last `;` before cursor) — statement-separated column aliases don't spill
- **Dot handling** — reverted custom dot logic; `schemaCompletionSource` handles `table.` natively via AST dot-node resolution (once `.` is in `activateOnTyping`)
