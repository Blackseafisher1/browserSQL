# Umlaut Completion Fix

## Problem
Table/column names containing umlauts (ä, ö, ü) caused two issues:
1. **Backtick quoting**: `männas` was inserted as `` `männas` ``
2. **No dropdown**: Typing an umlaut didn't trigger autocompletion

## Root Cause
Three places in `@codemirror/lang-sql` rejected non-ASCII letters:

| Location | Code | Issue |
|---|---|---|
| Tokenizer `isAlpha()` | `ch >= 65 && ch <= 90` etc. | Parser couldn't tokenize `ä` as part of an identifier |
| `Span` regex | `/^\w*$/` | Completion source said "not valid" for text with umlauts |
| `nameCompletion()` | `/^[a-z_][a-z_\d]*$/` | Added `apply: \`name\`` for identifiers failing the regex |

## Fix
Downloaded `@codemirror/lang-sql` locally to `public/js/lib/lang-sql.js` and patched:

1. **`isAlpha()`** — added `ch >= 192 && ch <= 591` (covers Latin-1 Supplement + Latin Extended-A, includes äöüÄÖÜß)
2. **`Span`** — `/^\w*$/` → `/^[\w\u00C0-\u024f]*$/`
3. **`QuotedSpan`** — `/^[`'"]?\w*[`'"]?$/` → `/^[`'"]?[\w\u00C0-\u024f]*[`'"]?$/`
4. **`nameCompletion()` regex** — `^[a-z_][a-z_\d]*$` → `^[a-z_\u00C0-\u024f][a-z_\d\u00C0-\u024f]*$`

Also added `activateOnTyping` in `editorView.js` (`makeAutocomplete()`) to trigger completion on umlaut characters, since the default only checks `/\w/`.

## Files changed
- `public/js/lib/lang-sql.js` — local copy of `@codemirror/lang-sql` with patches
- `public/editor.html` — importmap entry changed from CDN to `/public/js/lib/lang-sql.js`
- `public/js/pages/editorView.js` — added `activateOnTyping` to autocompletion config
