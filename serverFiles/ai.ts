root@ubuntu-s-1vcpu-2gb-fra1:/var/www# cat sql-ai/server.ts
import { serve } from 'bun';

const API_KEY = "key";

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const ipRequestLog = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequestLog) {
    const filtered = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    if (filtered.length === 0) ipRequestLog.delete(ip);
    else ipRequestLog.set(ip, filtered);
  }
}, 5 * 60 * 1000);

const GENERATE_PROMPT = `SQLite. Output ONLY SQL. No markdown/backticks/explanations.

- Compute metrics with aggregates, never alias a schema column to match a description term
- Pre-compute all transformed values in CTEs. Never put functions in JOIN conditions
- Pipeline: filter → aggregate → rank → join
- ROW_NUMBER() with tiebreaker for highest/lowest, HAVING COUNT(*) >= N for "at least N"
- INNER JOIN between CTEs, EXISTS for cross-table, window functions over self-joins
- Qualify columns, COUNT(*) over COUNT(column), SELECT * only when asked
- Percentages: (value * 100.0 / total) ROUND to 2 decimals. ORDER BY always includes tiebreaker (col, name or id)
- When comparing across time periods, pre-compute next/prev period columns in the base CTE, then JOIN on those columns directly
- Use CROSS JOIN for single-row bounds CTEs, never SELECT subqueries in WHERE
- If date math is needed, do it once in a CTE and reference the result column
- When ranking best/worst from time series, source from the base monthly CTE (not the growth CTE) since first period has no delta but is still eligible

Example 1: "total salary budget" → SUM(salary), not a budget column
Example 2: "customers in both this month and next" → add next_month = date(month||'-01','+1 month') in the CTE, then JOIN ON m2.month = m1.next_month
Example 3: "month-over-month growth" → in monthly CTE add prev_month = strftime('%Y-%m', date(month||'-01','-1 month')), then self-join ON m1.prev_month = m2.month`;

const FIX_PROMPT = `SQLite. Output ONLY the fixed/optimized SQL. No markdown/backticks/explanations.
Apply in order:
1. Qualify ALL column references with table alias
2. Expand SELECT * to the column list from original query context
3. CRITICAL: Fix JOIN conditions — NEVER leave ON 1=1 or ON true. Use the correct foreign key relationship from the schema
4. Convert implicit joins (FROM a, b WHERE a.x=b.y) to explicit INNER/LEFT JOIN with correct ON condition
5. Replace IN (SELECT ...) subqueries in WHERE with EXISTS or CTE JOIN
6. Replace correlated subqueries in SELECT with CTEs
7. Add tiebreaker column(s) to ORDER BY (primary key)
8. When filtering text columns, quote the value (compare text as strings not numbers)
9. Convert UNION to UNION ALL when no duplicates possible (disjoint WHERE on same table)
10. Convert LEFT JOIN to INNER JOIN when WHERE filters on right-side table
11. PRESERVE all columns from the original SELECT
12. Return ONLY the rewritten SQL, nothing else`;

serve({
  port: 8080,
  async fetch(req) {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
      });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    if (!ipRequestLog.has(ip)) ipRequestLog.set(ip, []);
    const timestamps = ipRequestLog.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
    if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldest = timestamps[0];
      const resetAfter = (oldest + RATE_LIMIT_WINDOW) - Date.now();
      return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Retry-After': Math.ceil(resetAfter / 1000).toString(), 'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': Math.ceil((oldest + RATE_LIMIT_WINDOW) / 1000).toString() } });    }
    timestamps.push(now);
    ipRequestLog.set(ip, timestamps);

    const { mode, description, schema } = await req.json();
    if (!description) {
      return new Response(JSON.stringify({ error: 'Please provide a description' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const systemPrompt = mode === 'fix' ? FIX_PROMPT : GENERATE_PROMPT;
    let userPrompt = description;
    if (schema && mode !== 'fix') userPrompt = `Schema:\n${schema}\n\n${description}`;
    else if (schema) userPrompt = `Schema:\n${schema}\n\nSQL to fix:\n${description}`;

    try {
      const response = await fetch("https://inference.do-ai.run/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: "router:sql",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      const data = await response.json();
      let sql = data.choices?.[0]?.message?.content || "";
      sql = sql.trim().replace(/^```sql\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "").trim();

      return new Response(JSON.stringify({ sql }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  },
});

console.log('SQL AI server running on http://localhost:8080');