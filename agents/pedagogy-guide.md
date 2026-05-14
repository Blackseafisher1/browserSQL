# Pedagogy Guide — Writing SQL Lessons That Teach

This guide defines how to write tutorial lessons that promote genuine learning instead of spoon-feeding. Every lesson should make the user think, reason, and apply — not just copy-paste.

## Core Principle

**Teach syntax and concepts. Let users write the specifics.**

A good lesson:
1. Explains what a SQL feature does and why you'd use it
2. Shows the syntax pattern (with abstract examples, not the task solution)
3. Describes a concrete goal
4. Lets the user figure out the exact SQL

A bad lesson:
1. States the task
2. Shows the exact query
3. User presses Ctrl+Enter → passes without learning

## Lesson Structure Template

```
# N. Title

[1-2 sentences explaining the concept — what it is, why it matters]

Syntax pattern:
  KEYWORD arg1, arg2 ...

[Optional: one sentence about behavior or edge cases]

**Goal:** [clear, specific task in 1-2 sentences]
```

### Rules for Each Section

**Concept explanation:**
- Define the feature in plain language
- Mention when you'd use it
- Note any gotchas (e.g. `NULL` comparisons need `IS NULL`, not `= NULL`)

**Syntax pattern:**
- Use abstract placeholders (`tablename`, `column`, `condition`)
- Never use the exact table/column names from the task in the pattern
- Example: `SELECT columns FROM table WHERE condition;` — not `SELECT name FROM users WHERE city = 'Berlin';`

**Goal:**
- Name the table and columns the user needs to work with
- State the expected outcome, not the query
- If specific values are needed, list them factually (e.g. "users who live in Berlin")

## Check Strategy

Different check types support different kinds of validation:

| If the task is... | Use check type | Why |
|---|---|---|
| Any valid query | `success` | Discovery lessons (explore sqlite_master) |
| Exact query output | `result` | When there's only one correct answer |
| Table structure | `schema` | CREATE TABLE lessons |
| Primary key | `pk` | PK constraint lessons |
| Foreign key | `fk` | FK constraint lessons |
| Multiple constraints | `constraints` | When checking for specific SQL tokens |
| Row mutation | `changes` | INSERT/UPDATE/DELETE lessons |

**Important:** For `result` checks, keep `lesson.sql` as the expected answer. The check system uses it via `check.expectedSql`. The user never sees it.

## What NOT to Do

| Anti-pattern | Why it fails |
|---|---|
| Showing the exact SQL in markdown code blocks | User copies without thinking |
| Pre-filling the editor with the answer | User just presses execute |
| Making the task too vague ("use a join") | User doesn't know where to start |
| Making the task too specific ("write `SELECT a FROM b WHERE c = 1`") | User just translates English to SQL |
| Skipping the concept explanation | User memorizes syntax without understanding |
| Using complex examples first | Start simple, build up |

## Scaffolding Strategy

For harder lessons, add progressive hints. This keeps the challenge while preventing frustration.

Hints go in a `hints` array on the lesson object (not yet implemented — add when UI supports it):

```js
{
  hints: [
    "Start with SELECT and name the columns you need",
    "Use WHERE to filter — remember single quotes for strings",
    "Combine conditions with AND"
  ]
}
```

Users reveal hints one at a time. Each reveal costs some "score" (optional gamification).

## Progressive Difficulty Across Modules

| Module | Skill level | Approach |
|---|---|---|
| 1-2: Fundamentals | Novice | Guided — teach basic syntax, simple goals |
| 3: CRUD | Novice | Schema is given, user writes queries |
| 4-5: Query tools, Joins | Intermediate | Multi-condition queries, combining concepts |
| 6: Subqueries, CTEs | Intermediate | Multi-step reasoning |
| 7: Normalization | Intermediate | Design tasks, not just query tasks |
| 8-10: Indexes, Transactions, Advanced | Advanced | Hands-on multi-statement exercises |

## Writing Style Guidelines

- Short sentences. One idea per sentence.
- Active voice: "Use WHERE to filter" not "WHERE is used for filtering"
- Code keywords in backticks: \`SELECT\`, \`WHERE\`
- Show syntax on its own line: `  SELECT columns FROM table;`
- Bold the goal line: `**Goal:**`
- One SQL task per lesson. No multi-part questions.
- Use single quotes for SQL string literals.
