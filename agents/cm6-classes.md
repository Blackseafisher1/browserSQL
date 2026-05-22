# CM6 Syntax Highlighting CSS Classes

Observed in `@codemirror/language@6.10.8` with `defaultHighlightStyle`:

- **`cb`** — keywords (`SELECT`, `FROM`, `WHERE`, etc.)
- **`ci`** — data types (`INTEGER`, `TEXT`, etc.)  
- **`ce`** — string literals (`'text'`)

These are short auto-generated class names (not `.cm-keyword`). To override colors:

```css
.cm-editor .cm-line .cb { color: #5699d2 !important; }
.cm-editor .cm-line .ci { color: someColor !important; }
```

The `.cm-editor .cm-line` prefix is needed to beat CM6's hashed selector specificity.
