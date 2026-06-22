# Floating Glass Effect (backdrop-filter)

## Toggles (Settings)
- `floatingTabs` → toggles `body.floating-tabs`
- `floatingBottom` → toggles `body.floating-bottom`

## Body class `has-tabs`
Set by `renderTabs()` in `filesView.js`. True when any tab bar has visible (non-`_`-prefixed) tabs. Used to conditionally apply negative margins and content padding only when files are open.

## Top: Floating Tab Bar (`body.floating-tabs`)

- `.editor-pane-wrap`: `position: relative; overflow: clip` (sticky context for absolute tab-bar)
- `.tab-bar`: `position: absolute; top: 0; left: 0; right: 0; z-index: 10` with `backdrop-filter: blur(16px)` and `background: color-mix(in srgb, var(--color-bg) 50%, transparent)`
- Tab items: transparent/semi-transparent backgrounds
- `.cm-content`: extra `padding-top: calc(var(--space-2) + 30px)` when `body.floating-tabs.has-tabs` — prevents first line from being hidden under the tab bar

## Bottom: Floating Execute Bar + Results (`body.floating-bottom`)

- `.execute-bar`: `position: relative; z-index: 5; margin-top: -36px` (pulls it up to overlay editor bottom) when `body.floating-bottom.has-tabs`
- `.results-container`: `margin-top: 4px` (gap below execute bar) when `body.floating-bottom.has-tabs`
- `.results-header`, `.results-output`, `.results-table th`: all get `backdrop-filter: blur(16px)` and semi-transparent background
- `.results-table td`: semi-transparent backgrounds (even/odd/hover variants)
- `.cm-scroller`: extra `padding-bottom: 60px` when `body.floating-bottom.has-tabs` — prevents last line from being hidden behind the execute bar

## Key CSS pattern

```css
body.floating-tabs.has-tabs .cm-content {
    padding-top: calc(var(--space-2) + 30px) !important;
}

body.floating-bottom.has-tabs .cm-scroller {
    padding-bottom: 60px !important;
}

body.floating-bottom .execute-bar {
    background: color-mix(in srgb, var(--color-bg) 50%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
}

body.floating-bottom.has-tabs .execute-bar {
    margin-top: -36px;
}
```
