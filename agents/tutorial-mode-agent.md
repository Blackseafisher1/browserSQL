# Tutorial Mode Agent Guide

This file explains how the tutorial mode works and how to add new modules or lessons without breaking the existing flow. It is written for an agent or contributor who will extend the tutorial safely.

**Pedagogical principle: teach concepts, not answers. Never pre-fill SQL in the editor. Users must write their own queries.**

## How Tutorial Mode Works

- Tutorial state lives in shared runtime state and localStorage. Tutorial mode uses its own file storage keys so user files are not overwritten.
- Each lesson can reset the database with a dedicated seed SQL string. This keeps results predictable.
- Theory lessons render a quiz overlay inside the editor pane. Practice lessons run queries and are auto-checked.
- The tutorial panel shows lesson progress and a status line for pass or fail feedback.

Key files:
- Lesson engine and checks: [public/js/pages/tutorialView.js](public/js/pages/tutorialView.js)
- Tutorial DB loader: [public/js/pages/dbManager.js](public/js/pages/dbManager.js)
- File isolation helpers: [public/js/pages/filesView.js](public/js/pages/filesView.js)
- Query execution hook: [public/js/pages/editorView.js](public/js/pages/editorView.js)
- Tutorial panel markup: [public/index.html](public/index.html)
- Tutorial status and quiz styling: [public/css/components/schema.css](public/css/components/schema.css) and [public/css/components/editor.css](public/css/components/editor.css)
- Pedagogy guide: [agents/pedagogy-guide.md](agents/pedagogy-guide.md)
- Full curriculum plan: [agents/sqlTutorialPlanFull.md](agents/sqlTutorialPlanFull.md)
- SQLite WASM limits: [agents/sqlitelimitations.md](agents/sqlitelimitations.md)

## SQLite WASM Limitations to Respect

Do not add lessons that require unsupported features:
- Stored procedures are not supported.
- RIGHT JOIN and FULL OUTER JOIN are not supported.
- FTS5 and JSON1 are not available in the standard WASM build.
- Use PRAGMA foreign_keys = ON before foreign key lessons or triggers.

## How to Add a New Lesson

1. Add or reuse a seed SQL string.
   - In [public/js/pages/tutorialView.js](public/js/pages/tutorialView.js) add a SEED_ constant if the lesson needs a specific dataset.
   - Keep SQL literals with single quotes, not double quotes.

2. Add a new lesson object to the lessons array.
   - Required fields: id, module, title, type, file, markdown, seed.
   - If type is practice or hands-on, add check. The sql field is optional — it stores the expected answer as hidden reference for the check system, but is NEVER shown to the user.
   - If type is theory, add question with prompt, options, answer, explanation.

3. Write markdown that teaches concepts, not answers.
   - Explain the syntax pattern and what each part does.
   - State the goal clearly but do NOT include the exact SQL.
   - Use general examples unrelated to the task if you need to show syntax.
   - See [agents/pedagogy-guide.md](agents/pedagogy-guide.md) for detailed guidance.

4. Pick the correct check type.
   - success: any successful query passes.
   - result: compares the query output to expectedSql.
   - schema: checks table exists and columns match.
   - pk: checks a primary key column exists.
   - fk: checks a foreign key is declared.
   - constraints: checks CREATE TABLE SQL contains tokens.
   - changes: checks the number of affected rows.

5. Files in the tutorial folder — what shows vs what's hidden.
   - **Practice lessons** (`.sql` files): Created as visible files in the `tutorial/` folder. The file starts with `-- Write your SQL here`. Users write queries here and these files appear in the file tree.
   - **Theory lessons** (`.md` files): NOT created as files. The markdown content is rendered in the tutorial panel, not as a file. This keeps the file tree clean — users only see practice `.sql` files.
   - The `tutorial/README.md` file is visible as a landing page.
   - Users can still create their own `.md` files in `tutorial/` — only the pre-made theory files are excluded.
   - When navigating to a theory lesson, no file is opened (editor is hidden for the quiz).

6. Update check logic if you add a new check type.
   - Extend runCheck in [public/js/pages/tutorialView.js](public/js/pages/tutorialView.js).

## Recommended Lesson Pattern

- **Teach the concept first**: Explain what the SQL feature does, show syntax, describe behavior.
- **State the scenario/goal**: Describe a concrete task that requires the user to apply what they just learned.
- **No answer code blocks**: Do not include the exact SQL solution in the markdown. The user must derive it.
- **Single SQL task per lesson**: One focused task avoids overwhelming the user.
- **Use a dedicated seed** if the lesson needs different data.
- **Keep the sql field as hidden reference** only — never pre-fill the editor with it.

### Before vs After Example

| Before (spoon-feeding) | After (active learning) |
|---|---|
| `# Filtering\n\nWrite: SELECT name FROM users WHERE city = 'Berlin';\n\nGoal: return Berlin users.` | `# Filtering\n\nWHERE filters rows: SELECT cols FROM table WHERE condition.\nStrings use single quotes.\n\nGoal: Return names of users in Berlin.` |

## Optional Extensions

- Add a lesson summary or review quiz at the end of each module.
- Add a restart control in the tutorial panel.
- Add per-module seed files if lesson data grows too large.
- Add progressive hints (hint array in lesson object) that users can reveal on demand.
- Add flexible check types (`result-flexible`, `result-subset`, `has-clause`) for multi-solution queries.
