# Umlaut Completion Fix

## Problem
Table/column names with umlauts (ä, ö, ü) had issues:
1. **Backtick quoting**: `männas` was inserted as `` `männas` ``
2. **No dropdown**: Typing `ä` didn't trigger autocompletion
3. **INSERT INTO `tablename`(...) etc**: Custom completion source couldn't detect umlaut table names
4. **Enter didn't accept**: Pressing Enter inserted newline instead of accepting the completion

## Root Causes
Four places rejected non-ASCII letters:

| Location | Code | Issue |
|---|---|---|
| Parser tokenizer `isAlpha()` | `ch >= 65 && ch <= 90` etc | Parser couldn't tokenize `ä` as part of identifier |
| `@codemirror/lang-sql` `Span` regex | `/^\w*$/` | Completion source said "not valid" for umlaut text |
| `nameCompletion()` regex | `/^[a-z_][a-z_\d]*$/` | Added backtick-quoted `apply` |
| `sqlCompletion.js` detect & ref | `\w+` in regexes | Couldn't match table names with umlauts |
| Keymap order | `defaultKeymap` before `completionKeymap` | Enter handled by newline before accept |

## Changes

### `public/js/lib/lang-sql.js` (local copy of `@codemirror/lang-sql`)
- **`isAlpha()`** — added `ch >= 192 && ch <= 591` (Latin-1 Supplement + Latin Extended-A)
- **`Span`** — `/^\w*$/` → `/^[\w\u00C0-\u024f]*$/`
- **`QuotedSpan`** — same, added `[\w\u00C0-\u024f]`
- **`nameCompletion()`** — regex `^[a-z_][a-z_\d]*$` → `^[a-z_\u00C0-\u024f][a-z_\d\u00C0-\u024f]*$`

### `public/editor.html`
- Importmap: `@codemirror/lang-sql` → `/public/js/lib/lang-sql.js`

### `public/js/pages/editorView.js`
- Added `activateOnTyping` — allows umlauts to trigger completion dropdown
- Moved `completionKeymap` before `defaultKeymap` — Enter accepts completion first

### `public/js/pages/sqlCompletion.js`
- `referencedTables()` — `\w+` → `[\w\u00C0-\u024f]+` in all regexes
- `detectContext()` — same for INSERT/UPDATE table name patterns
- All `validFor` — `/^\w+$/` → `/^[\w\u00C0-\u024f]+$/`
