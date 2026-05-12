# Frontend Conventions
## JS
- **Vanilla ES modules only.** No framework. Each page is a module in `public/js/pages/`.
- **Entry:** `app.js` — imports pages, registers views, handles event delegation.
- **Router:** `router.js` — hash-based, `registerView(name, fn)`, `navigate(name, params)`.
- **State:** `state.js` — `isAuth()`, `user`, `clearAuth()`, `renderAuthUI()`.
- **XSS prevention:** `esc()` from `utils.js` on ALL user-controlled text. Never use `innerHTML` with unsanitized input.
- **Template rendering:** `html()` tagged template (creates DocumentFragment) for multi-element returns. String concatenation with `esc()` for single-element HTML (e.g., post cards, message bubbles).
- **DOM queries:** `$()` from `utils.js` (alias for `querySelector`).
- **API calls:** All HTTP via `api.js` — `request(method, path, body)` handles JSON + auth header. File uploads via `api.uploadMedia()` (FormData).
- **Event delegation:** One `document.addEventListener('click', ...)` in `app.js` routes to handlers via `[data-*]` attributes. No inline `onclick`.
- **Page structure:** Each page module exports `render*View()` functions. View creates DOM element(s), returns them. Router appends to `#app`.
- **WS:** `ws.js` — binary protocol (`[type:1B][len:2B BE][payload]`). `connect`/`disconnect`/`join`/`leave`/`sendMessage`. Callbacks via `{ current: null }` pattern.
- **Imports:** Prefer destructured named imports. No default exports for page modules.
## CSS
- **`@layer` architecture:** `tokens` → `reset` → `base` → `layouts` → `components` → `states` → `utilities`. Load order in `index.html`.
- **Design tokens:** `tokens.css` — OKLCH colors, `light-dark()` for theme, `clamp()` for fluid sizes, custom properties for spacing (`--space-*`), font sizes (`--size-fluid-*`).
- **Component files:** One file per component in `css/components/` (button.css, card.css, chat.css, etc.).
- **Selectors:** Class-based only. No ID selectors in CSS (IDs used only for JS hooks). No `!important`.
- **Responsive:** `container-type: inline-size` + `@container` queries for component-level responsiveness. Also standard `@media` for page layout.
- **Layout:** Utility classes `.stack` (flex column), `.cluster` (flex wrap), `.grid`, `.center` in `layouts.css`.
- **States:** `states.css` — `.loading`, `body:has(.chat-view) .header` etc.
- **Theme:** `light-dark()` function + `data-theme` attribute on `<html>`. No separate dark/light files.
- **No nesting beyond 3 levels.** Keep specificity flat.