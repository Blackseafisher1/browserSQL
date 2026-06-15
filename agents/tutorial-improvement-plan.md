# Tutorial Improvement Plan

Based on analysis of the current system and boot.dev's approach. The goal: transform our tutorial into a gamified, polished learning experience.

---

## Phase 1: Points & Gamification Engine

### 1.1 XP/Points System (`state.js`, `tutorialView.js`)
- **Storage**: `browsersql-tutorial-points` in localStorage
- **Awards per lesson**:
  - Theory (quiz): 10 XP
  - Practice (query): 20 XP on first pass, 10 XP after any failed attempt
  - **0 XP if solution was viewed**
- **Bonus system**: 5 XP bonus for 3+ lesson streak
- **Level system**: Level = floor(totalXP / 100) + 1, displayed next to XP
- **Display**: Add `tutorial-xp` element to the tutorial panel showing `Level 3 · 240 XP`

### 1.2 Toast Notifications (new file: `public/js/pages/toast.js`)
- System for animated toast messages (top-right overlay)
- Types: `success` (green), `error` (red), `info` (blue), `xp` (gold with XP icon)
- Auto-dismiss after 3s, slide-in animation
- Queue system for multiple toasts
- Example usage:
  ```js
  showToast('Lesson complete! +20 XP', 'xp');
  showToast('Not quite right, try again.', 'error');
  ```

### 1.3 Streak Tracking (`tutorialView.js`)
- `browsersql-tutorial-streak`: JSON `{ count: 3, lastDate: '2026-06-14' }`
- Increments when a lesson is completed on a consecutive calendar day
- Display streak flame emoji in tutorial panel: `🔥 3-day streak`
- Reset to 0 if a day is skipped

### 1.4 XP Toast on Completion
- When `markComplete()` is called: calculate XP, show XP toast with animation
- Add CSS class `xp-float-up` for animated XP number that floats up and fades

---

## Phase 2: Solution View

### 2.1 Solution Storage
- The `lesson.sql` field already exists as hidden reference (never shown to user)
- Add `solutionViewed` tracking: `browsersql-tutorial-solutions` → `{ "lesson-id": true }`

### 2.2 "View Solution" Button
- Add `#btn-view-solution` in the tutorial panel, hidden by default
- Appears after 3 failed attempts on the same lesson
- When clicked:
  - Show confirmation: "Viewing the solution awards 0 XP. Continue?"
  - If confirmed: insert solution into a read-only CodeMirror view (or overlay)
  - Mark `solutionViewed[lessonId] = true`
  - Disable Verify for this lesson (can't get XP)
  - Enable Next button (they can move on, but 0 XP)

### 2.3 Solution Display
- Option A: Replace editor content with solution in read-only mode
- Option B: Show solution in a modal overlay with syntax highlighting
- **Recommendation**: Option A — replace editor content, but make it read-only with a `.cm-readonly` class, and show a banner: `📖 Solution shown — 0 XP awarded`

---

## Phase 3: Checklist for Multi-Condition Lessons

### 3.1 Checklist Parsing (`marker.js` enhancement)
- Extend `renderMarkdown()` to detect checklist patterns: `- [ ] something` → render as interactive checkboxes
- Initially unchecked, they get checked as conditions are verified
- Only for lessons with `checklist` array in lesson object

### 3.2 Lesson Object Extension
```js
{
  id: '06-design-table',
  // ... existing fields ...
  checklist: [
    'Table `employees` exists',
    'Column `id` is INTEGER PRIMARY KEY',
    'Column `name` is TEXT',
    'Column `email` is TEXT',
    'Column `salary` is REAL',
    'Column `photo` is BLOB',
    'Column `department` is TEXT'
  ]
}
```

### 3.3 Verification Integration
- `runCheck()` extended to also update checklist status
- After all checks pass, mark lesson complete as usual
- Each item in checklist maps to a sub-check (e.g., specific column check)
- Visual: checked items get `✅` prefix, unchecked stay `⬜`

### 3.4 Visual Style
- Checklist items styled with custom CSS in `schema.css`
- Smooth transition when items get checked
- Progress counter: `(3/7 conditions met)`

---

## Phase 4: UI Polish

### 4.1 Tutorial Panel Redesign (`editor.html`, `schema.css`)
- **Current**: Basic text status, plain markdown rendering
- **Proposed**:
  - Top area: Module name, lesson title, XP/level, streak
  - Progress bar: Show module progress (X of Y) + overall progress combined
  - Status area: Larger, with icon prefix (✅ / ❌ / 💡)
  - Tip button: Always visible when hint exists, with a different style
  - Nav buttons: More prominent, with icons (← Previous, Next →)
  - View Solution button: Visible after 3 failures

### 4.2 Lesson Transition Animation
- When going to next lesson: slide-out/slide-in animation on tutorial content
- CSS keyframes for `tutorial-content`

### 4.3 Celebration Effect on Module Complete
- When last lesson in a module is completed:
  - Show a special toast: `🏁 Module X Complete!`
  - Confetti-like CSS animation (small particles)
  - XP bonus: 25 bonus XP for completing a module
  - Modal or overlay: "Module complete! Ready for Module X?"

### 4.4 Quiz UI Improvements (`editor.css`)
- Better quiz layout: options as cards, not just buttons
- Show which answer was correct vs wrong more clearly
- Animate between questions (slide)
- Progress dots for multi-question quizzes: `● ● ○ ○`

---

## Phase 5: Implementation Order

### Step 1: Toast system (foundation for all feedback)
- Files to create: `public/js/pages/toast.js`
- Files to modify: `public/editor.html` (add toast container), `public/css/components/schema.css` (toast styles)

### Step 2: Points & XP engine
- Files to modify: `public/js/pages/tutorialView.js` (add XP tracking, level calc, streak)
- Add: XP display in tutorial panel, XP toast on complete

### Step 3: Solution view
- Files to modify: `public/js/pages/tutorialView.js` (add view solution logic)
- Files to modify: `public/editor.html` (add button)
- Files to modify: `public/css/components/schema.css` (read-only solution styles)

### Step 4: Checklist system
- Files to modify: `public/js/pages/marker.js` (checklist rendering)
- Files to modify: `public/js/pages/tutorialView.js` (checklist state & verification)
- Files to modify: `public/css/components/schema.css` (checklist styles)
- Files to modify: lesson module files (add checklist arrays where needed)

### Step 5: UI polish & animations
- Files to modify: `public/css/components/schema.css`, `public/css/components/editor.css`
- Files to modify: `public/editor.html`
- Celebration effects, transitions, module complete flow

---

## Key Files & Locations

| Component | File | Key Lines |
|-----------|------|-----------|
| Tutorial engine | `public/js/pages/tutorialView.js` | Full file (494 lines) |
| Lesson definitions | `public/js/pages/lessons/module1.js`–`module10.js` | Per module |
| Seed data | `public/js/pages/lessons/seeds.js` | 174 lines |
| Markdown renderer | `public/js/pages/marker.js` | Wraps `marked.parse()` |
| State management | `public/js/state.js` | Global state object |
| Settings | `public/js/pages/settings.js` | skipEnabled, showTutorial |
| Editor + verify | `public/js/pages/editorView.js` | L18 imports verifyLesson |
| Tutorial HTML | `public/editor.html` | Lines 119-141 (tutorial section) |
| Tutorial CSS | `public/css/components/schema.css` | Lines 168-316 |
| Quiz CSS | `public/css/components/editor.css` | Lines 172-230 |
| DB Manager | `public/js/pages/dbManager.js` | loadTutorialDatabase |
| File system | `public/js/pages/filesView.js` | VFS management |

---

## Notes

- localStorage keys to add:
  - `browsersql-tutorial-points`: total XP (integer)
  - `browsersql-tutorial-streak`: `{ count, lastDate }`
  - `browsersql-tutorial-solutions`: `{ "lesson-id": true }`
  - `browsersql-tutorial-level`: cached level (redundant, can compute from XP)
  - `browsersql-tutorial-failures`: `{ "lesson-id": attemptCount }` (track failures for solution reveal)

- Backward compatibility: All new code should gracefully handle missing keys (treat as 0/empty)

- Performance: Toast system uses requestAnimationFrame for smooth animations

- Accessibility: Toasts should have `role="alert"`, keyboard navigation for quiz/solution
